// VORON Trident R2 interactive manual viewer (independent community project).
// WebGL line-art preview (silhouettes + CAD feature edges on paper-coloured faces),
// step-by-step assembly timeline, configurator and teardown hidden-line exports.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';

const $ = id => document.getElementById(id);
const MODEL = JSON.parse($('model-meta').textContent);
const PHASE = 1.05, MOVE = 0.85, HOLD = 0.35;
const LINEWORK = {
  // CSS pixels for the preview; exports use the teardown presets in millimetres.
  patent: {outline: 1.15, edge: 0.75, label: 'Fine patent'},
  technical: {outline: 1.7, edge: 1.05, label: 'Technical'},
  service: {outline: 2.4, edge: 1.35, label: 'Service manual'}
};
const FILAMENTS = [
  {name: 'Black', hex: '#2b2f33'}, {name: 'Grey', hex: '#8a9197'}, {name: 'White', hex: '#e9e9e4'},
  {name: 'Red', hex: '#d7372b'}, {name: 'Teal', hex: '#0b8a91'}, {name: 'Orange', hex: '#ea7a1e'},
  {name: 'Blue', hex: '#2f63c9'}, {name: 'Yellow', hex: '#e7b416'}
];
const KIND_LABEL = MODEL.kinds, KIND_ORDER = Object.keys(MODEL.kinds);
const MANUAL_URL = 'https://github.com/VoronDesign/Voron-Trident/blob/main/Manual/Assembly_Manual_Trident.pdf';

// ---------- persistent viewer preferences (per browser) ----------
const PREF_KEY = 'voron-trident-r2-manual-v1';
const defaults = {
  highlight: true,
  fill: true, primary: '#2b2f33', accent: '#d7372b',
  linework: 'patent', context: 'faded', labels: true, trails: true, follow: true, theme: 'system', hue: null
};
let prefs = {...defaults};
try {
  const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
  for (const k of Object.keys(defaults)) if (k in saved) prefs[k] = saved[k];
} catch {}
// Store only what differs from the defaults, so later default changes still reach returning viewers.
const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(Object.fromEntries(Object.entries(prefs).filter(([k, v]) => v !== defaults[k])))); } catch {} };

// ---------- theme ----------
const mql = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  if (prefs.theme === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', prefs.theme);
  readTokens();
  restyle();
  syncThemeButton();
}
mql.addEventListener?.('change', () => prefs.theme === 'system' && applyTheme());
// One toggle flips light and dark. Landing on the system's own choice goes back to following the system.
const resolvedTheme = () => prefs.theme === 'system' ? (mql.matches ? 'dark' : 'light') : prefs.theme;
function syncThemeButton() {
  const dark = resolvedTheme() === 'dark', b = $('theme-toggle');
  b.setAttribute('aria-pressed', String(dark));
  b.setAttribute('aria-label', dark ? 'Switch to light appearance' : 'Switch to dark appearance');
  b.title = (dark ? 'Dark' : 'Light') + (prefs.theme === 'system' ? ' (system)' : '') + ': switch to ' + (dark ? 'light' : 'dark');
}
$('theme-toggle').addEventListener('click', () => {
  const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
  prefs.theme = next === (mql.matches ? 'dark' : 'light') ? 'system' : next;
  savePrefs(); applyTheme();
});
let T = {};
function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  for (const k of ['paper', 'ink', 'ink-soft', 'accent', 'warn', 'brass', 'steel', 'ghost', 'new-fill', 'new-ink'])
    T[k] = new THREE.Color(cs.getPropertyValue('--' + k).trim() || '#000');
  T.dark = T.paper.getHSL({}).l < 0.5;
}

// ---------- model binary ----------
// The website loads the gzip file next to the page; the self-contained preview embeds it as base64.
async function loadBinary() {
  const el = $('model-bin');
  let bytes;
  if (el.dataset.src) {
    const res = await fetch(el.dataset.src);
    if (!res.ok) throw Error(`model: HTTP ${res.status}`);
    bytes = new Uint8Array(await res.arrayBuffer());
  } else {
    const raw = atob(el.textContent.trim());
    bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

// ---------- renderer ----------
const canvas = $('view');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: false});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 6000);
camera.up.set(0, 0, 1);
const BASE_HALF = 220;
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.14; controls.screenSpacePanning = true;
controls.minZoom = 0.06; controls.maxZoom = 14; controls.zoomSpeed = 1.1;
let userMovedCamera = false;
controls.addEventListener('start', () => { userMovedCamera = true; camAnim = null; spinning = false; stopIntro(); });
// OrbitControls can report a change every frame while damping settles; redraw only when the
// camera really moved (a full redraw of the printer is expensive).
let camKey = '';
controls.addEventListener('change', () => {
  const p = camera.position, t = controls.target;
  const key = [p.x, p.y, p.z, t.x, t.y, t.z, camera.zoom].map(v => v.toFixed(4)).join();
  if (key === camKey) return;
  camKey = key; dirty = true; updateZoomLabel();
});

const resolution = new THREE.Vector2(1, 1);
const materials = new Map();
// Silhouettes are found on the GPU: each smooth edge carries the normals of its two faces, and
// the vertex shader drops the edge unless one face looks toward the camera and the other away.
const silDir = {value: new THREE.Vector3(0, 0, 1)};
function lineMat(color, width, silhouette = false) {
  const key = color.getHexString() + '|' + width + (silhouette ? '|sil' : '');
  let m = materials.get(key);
  if (!m) {
    m = new LineMaterial({color: color.getHex(), linewidth: width, worldUnits: false});
    m.resolution.copy(resolution);
    if (silhouette) {
      m.onBeforeCompile = sh => {
        sh.uniforms.silDir = silDir;
        sh.vertexShader = sh.vertexShader
          .replace('attribute vec3 instanceStart;', 'attribute vec3 instanceStart;\n\t\tattribute vec3 instanceN1;\n\t\tattribute vec3 instanceN2;\n\t\tuniform vec3 silDir;')
          .replace('void main() {', 'void main() {\n\t\t\tif ((dot(instanceN1, silDir) > 0.0) == (dot(instanceN2, silDir) > 0.0)) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }');
      };
      m.customProgramCacheKey = () => 'silhouette';
    }
    materials.set(key, m);
  }
  return m;
}
const faceMats = new Map();
function faceMat(color, clear = false) {
  const key = color.getHexString() + (clear ? '|clear' : '');
  let m = faceMats.get(key);
  if (!m) {
    // Clear panels (acrylic) are drawn see-through: a faint tint that hides nothing behind it.
    m = clear ? new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0.12, depthWrite: false})
      : new THREE.MeshBasicMaterial({color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 2});
    faceMats.set(key, m);
  }
  return m;
}

// ---------- parts ----------
let parts = [], byId = new Map();
function buildPart(p, buf) {
  const positions = new Float32Array(buf, p.pos[0], p.pos[1]);
  const index = new Uint32Array(buf, p.idx[0], p.idx[1]);
  const edges = new Uint32Array(buf, p.edges[0], p.edges[1]);
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setIndex(new THREE.BufferAttribute(index, 1));
  geom.computeBoundingSphere(); geom.computeBoundingBox();
  const group = new THREE.Group();
  group.visible = false;
  const mesh = new THREE.Mesh(geom, faceMat(new THREE.Color('#fff')));
  mesh.userData.part = p.id;
  group.add(mesh);
  // Feature edges
  const fe = new Float32Array(edges.length * 3);
  for (let i = 0; i < edges.length; i++) { const v = edges[i]; fe[3 * i] = positions[3 * v]; fe[3 * i + 1] = positions[3 * v + 1]; fe[3 * i + 2] = positions[3 * v + 2]; }
  const featGeom = new LineSegmentsGeometry(); featGeom.setPositions(fe);
  const feat = new LineSegments2(featGeom, lineMat(new THREE.Color('#000'), 1)); feat.frustumCulled = false;
  group.add(feat);
  // Silhouette candidates: smooth interior edges, with both face normals.
  const nt = index.length / 3, fn = new Float32Array(nt * 3);
  for (let t = 0; t < nt; t++) {
    const a = index[3 * t] * 3, b = index[3 * t + 1] * 3, c = index[3 * t + 2] * 3;
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2];
    const wx = positions[c] - positions[a], wy = positions[c + 1] - positions[a + 1], wz = positions[c + 2] - positions[a + 2];
    let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx; const l = Math.hypot(nx, ny, nz) || 1;
    fn[3 * t] = nx / l; fn[3 * t + 1] = ny / l; fn[3 * t + 2] = nz / l;
  }
  const SH = 2097152, feature = new Set();
  for (let i = 0; i < edges.length; i += 2) { const a = Math.min(edges[i], edges[i + 1]), b = Math.max(edges[i], edges[i + 1]); feature.add(a * SH + b); }
  const first = new Map(), cand = [];
  for (let t = 0; t < nt; t++) for (let j = 0; j < 3; j++) {
    const a0 = index[3 * t + j], b0 = index[3 * t + (j + 1) % 3], a = Math.min(a0, b0), b = Math.max(a0, b0), k = a * SH + b;
    const f = first.get(k);
    if (f === undefined) first.set(k, t);
    else if (f >= 0) { if (!feature.has(k)) cand.push(a, b, f, t); first.set(k, -1); }
  }
  const nc = cand.length / 4, cPos = new Float32Array(nc * 6), cNrm = new Float32Array(nc * 6);
  for (let i = 0; i < nc; i++) {
    const a = cand[4 * i], b = cand[4 * i + 1], t1 = cand[4 * i + 2], t2 = cand[4 * i + 3];
    cPos.set([positions[3 * a], positions[3 * a + 1], positions[3 * a + 2], positions[3 * b], positions[3 * b + 1], positions[3 * b + 2]], 6 * i);
    cNrm.set([fn[3 * t1], fn[3 * t1 + 1], fn[3 * t1 + 2], fn[3 * t2], fn[3 * t2 + 1], fn[3 * t2 + 2]], 6 * i);
  }
  const silGeom = new LineSegmentsGeometry(); silGeom.setPositions(nc ? cPos : new Float32Array(6));
  const nrm = new THREE.InstancedInterleavedBuffer(nc ? cNrm : new Float32Array(6), 6, 1);
  silGeom.setAttribute('instanceN1', new THREE.InterleavedBufferAttribute(nrm, 3, 0));
  silGeom.setAttribute('instanceN2', new THREE.InterleavedBufferAttribute(nrm, 3, 3));
  silGeom.instanceCount = nc;
  const sil = new LineSegments2(silGeom, lineMat(new THREE.Color('#000'), 1, true)); sil.frustumCulled = false;
  group.add(sil);
  scene.add(group);
  const box = new THREE.Box3(new THREE.Vector3(...p.box[0]), new THREE.Vector3(...p.box[1]));
  return {...p, positions, index, edges, group, mesh, feat, sil, box, center: box.getCenter(new THREE.Vector3()), diag: box.getSize(new THREE.Vector3()).length(), offset: new THREE.Vector3(), visible: false};
}

function updateSilhouettes() {
  silDir.value.subVectors(camera.position, controls.target).normalize();
}

// ---------- configuration and steps ----------
// Build options (none yet): a part with `when` shows only if that option is on.
const enabled = p => !p.when || !!prefs[p.when];
let steps = [], refStep = new Map(), mountStep = new Map(), installVec = new Map();
function rebuildSteps() {
  steps = MODEL.steps.filter(s => !s.when || prefs[s.when]).map(s => ({
    ...s, movers: s.movers.filter(m => enabled(byId.get(m.id)))
  }));
  // A part joins the build at the step that moves it in; a part that never moves (a bench
  // base) joins at its first bench step. Benches before that only show it on the table.
  refStep = new Map();
  steps.forEach((s, i) => { for (const m of s.movers) if (!m.again && !refStep.has(m.id)) refStep.set(m.id, i); });
  steps.forEach((s, i) => { for (const id of s.bench || []) if (!refStep.has(id)) refStep.set(id, i); });
  // A sub-assembly built on the bench and later carried onto the printer (`again`) stays off
  // the printer until that step.
  mountStep = new Map();
  steps.forEach((s, i) => { for (const m of s.movers) if (m.again && !mountStep.has(m.id)) mountStep.set(m.id, i); });
  installVec = new Map();
  for (const s of MODEL.steps) for (const m of s.movers) if (!m.again) installVec.set(m.id, m.vec);
}
const refOf = id => {
  if (refStep.has(id)) return refStep.get(id);
  const p = byId.get(id);
  return p.parent ? refOf(p.parent) : 0;
};
const ancestors = id => { const out = []; for (let p = byId.get(id); p.parent; p = byId.get(p.parent)) out.push(p.parent); return out; };

const stepText = s => s.text;

// ---------- state ----------
let mode = 'explore';
let stepIndex = 0, time = 0, playing = false, holdUntil = 0, autoplay = false;
const EXPLORE_PARENT = {};
const EXPLORE_VIEW = {az: 32, el: 20};
let explode = 0.7, isolated = null, selected = null, hovered = null;
let dirty = true;
// The last step (finale) slowly turns the finished printer until the user takes the camera.
let spinning = false;
const SPIN_DEG_PER_S = 14;
const duration = s => {
  if (!s.movers.length) return 0;
  return Math.max(...s.movers.map(m => m.phase * PHASE + m.delay + MOVE));
};
const ease = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

function visibleSet() {
  const out = new Set();
  if (isolated) { out.add(isolated); return out; }
  if (mode === 'explore') { for (const p of parts) if (enabled(p)) out.add(p.id); return out; }
  const s = steps[stepIndex];
  if (s.bench) {
    // Bench parts, what they already carry, and the movers with what they carry.
    const movers = new Set(s.movers.map(m => m.id));
    for (const p of parts) {
      if (!enabled(p)) continue;
      if (s.bench.includes(p.id) || movers.has(p.id)) out.add(p.id);
      else if (refOf(p.id) <= stepIndex && ancestors(p.id).some(a => s.bench.includes(a) || movers.has(a))) out.add(p.id);
    }
    return withCarriers(out);
  }
  for (const p of parts) if (enabled(p) && refOf(p.id) <= stepIndex && !(mountStep.get(p.id) > stepIndex)) out.add(p.id);
  return withCarriers(out);
}
// A piece only shows while the part that carries it shows (no screws floating where an
// extrusion will go later).
function withCarriers(set) {
  for (const id of [...set]) if (ancestors(id).some(a => !set.has(a))) set.delete(id);
  return set;
}
function ownOffsets() {
  const own = new Map();
  if (mode === 'explore') {
    for (const [id, v] of installVec) if (!EXPLORE_PARENT[id]) own.set(id, v.map(x => x * explode));
    return own;
  }
  const s = steps[stepIndex];
  for (const m of s.movers) {
    const u = Math.min(1, Math.max(0, (time - m.phase * PHASE - m.delay) / MOVE));
    const k = 1 - ease(u);
    if (k > 0) own.set(m.id, m.vec.map(x => x * k));
  }
  // Bench shift: identical sub-assemblies far apart in the CAD sit side by side while worked on.
  if (s.shift && !isolated) for (const id of s.shift.ids) {
    const o = own.get(id) || [0, 0, 0];
    own.set(id, o.map((x, k) => x + s.shift.vec[k]));
  }
  return own;
}
function applyPose() {
  const vis = visibleSet(), own = ownOffsets();
  const total = id => {
    const o = own.get(id) || [0, 0, 0];
    const p = byId.get(id);
    const parent = (mode === 'explore' && EXPLORE_PARENT[id]) || p.parent;
    if (!parent || isolated) return o;
    const q = total(parent);
    return [o[0] + q[0], o[1] + q[1], o[2] + q[2]];
  };
  let visChanged = false;
  for (const p of parts) {
    const v = vis.has(p.id);
    if (v !== p.visible) { visChanged = true; p.visible = v; p.group.visible = v; }
    if (v) { const o = total(p.id); p.offset.set(o[0], o[1], o[2]); p.group.position.copy(p.offset); }
  }
  if (visChanged) restyle();
  updateTrails();
  dirty = true;
}

// ---------- styling ----------
const tint = (hex, amount) => new THREE.Color(hex).lerp(T.paper, amount);
function partStyle(p, s) {
  const lw = LINEWORK[prefs.linework];
  const movers = new Set(mode === 'steps' && !isolated ? s.movers.map(m => m.id) : []);
  const bench = new Set(mode === 'steps' && !isolated ? (s.bench || []) : []);
  let ink = prefs.hue === null ? T.ink.clone() : new THREE.Color().setHSL(prefs.hue / 360, T.dark ? 0.55 : 0.65, T.dark ? 0.68 : 0.38);
  if (p.hue !== undefined && p.hue !== null) ink = new THREE.Color().setHSL(p.hue / 360, T.dark ? 0.55 : 0.65, T.dark ? 0.68 : 0.38);
  if (prefs.highlight && p.kind === 'insert') ink = T.brass.clone();
  let face = T.paper.clone();
  if (prefs.fill) {
    if (p.kind === 'primary') face = tint(prefs.primary, T.dark ? 0.62 : 0.8);
    else if (p.kind === 'accent') face = tint(prefs.accent, T.dark ? 0.62 : 0.8);
    else face = tint('#' + T.steel.getHexString(), T.dark ? 0.72 : 0.78);
  }
  if (prefs.highlight) {
    if (p.kind === 'insert') face = tint('#' + T.brass.getHexString(), T.dark ? 0.55 : 0.72);
    else if (['bolt', 'bearing', 'rail', 'tnut', 'nut', 'washer', 'shim', 'leadscrew'].includes(p.kind)) face = tint('#' + T.steel.getHexString(), T.dark ? 0.6 : 0.72);
  }
  const focus = new Set(mode === 'steps' ? s.focus || [] : []);
  const isFocus = isolated || mode === 'explore' || !s.movers.length && !focus.size || focus.has(p.id) || movers.has(p.id) || bench.has(p.id) || (s.bench && !movers.has(p.id));
  // As in the official manual: parts added in this step are drawn light blue.
  if (movers.has(p.id) || (movers.size && ancestors(p.id).some(a => movers.has(a)) && refOf(p.id) === stepIndex)) { ink = T['new-ink'].clone(); face = T['new-fill'].clone(); }
  else if (!isFocus && prefs.context === 'faded') { ink = ink.lerp(T.paper, 0.58); face = face.lerp(T.paper, 0.45); }
  if (p.id === hovered || p.id === selected) ink = T.accent.clone();
  return {ink, face, outline: lw.outline, edge: lw.edge};
}
function restyle() {
  if (!parts.length) return;
  const s = steps[stepIndex];
  for (const p of parts) {
    if (!p.visible) continue;
    const st = partStyle(p, s);
    p.mesh.material = faceMat(st.face, p.kind === 'glass');
    p.feat.material = lineMat(st.ink, st.edge);
    p.sil.material = lineMat(st.ink, st.outline, true);
  }
  scene.background = T.paper;
  trailMat.color.copy(T.accent).lerp(T.paper, 0.35);
  dirty = true;
}

// ---------- trails (assembly paths) ----------
const trailGeom = new THREE.BufferGeometry();
const trailArr = new Float32Array(600 * 6);
trailGeom.setAttribute('position', new THREE.BufferAttribute(trailArr, 3));
const trailMat = new THREE.LineDashedMaterial({color: 0xe40002, dashSize: 3.2, gapSize: 1.6, transparent: true, opacity: 0.9});
const trails = new THREE.LineSegments(trailGeom, trailMat);
trails.frustumCulled = false;
scene.add(trails);
function updateTrails() {
  let n = 0;
  if (prefs.trails && !isolated) {
    for (const p of parts) {
      if (!p.visible || n >= 600) continue;
      const len = p.offset.length();
      if (len < 0.5) continue;
      if (mode === 'steps' && !steps[stepIndex].movers.some(m => m.id === p.id)) continue;
      if (mode === 'explore' && p.kind !== 'bolt' && p.kind !== 'insert') continue;
      const a = p.center, b = p.center.clone().add(p.offset);
      trailArr.set([a.x, a.y, a.z, b.x, b.y, b.z], n * 6); n++;
    }
  }
  trailGeom.setDrawRange(0, n * 2);
  trailGeom.attributes.position.needsUpdate = true;
  trailGeom.computeBoundingSphere();
  if (n) trails.computeLineDistances();
  trails.visible = n > 0;
}

// ---------- camera ----------
let camAnim = null;
function viewVectors(az, el) {
  const a = az * Math.PI / 180, e = el * Math.PI / 180;
  const dir = new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e));
  const right = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
  const up = new THREE.Vector3().crossVectors(dir, right);
  return {dir, right, up};
}
function currentAngles() {
  const d = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
  return {az: Math.atan2(d.y, d.x) * 180 / Math.PI, el: Math.asin(Math.max(-1, Math.min(1, d.z))) * 180 / Math.PI};
}
function freeRect() {
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const r = {x: 0, y: 0, w: W, h: H};
  const card = $('dock').getBoundingClientRect(), top = $('topbar').getBoundingClientRect();
  r.y = top.bottom + 8; r.h = H - r.y;
  if (card.width && card.left < 40 && card.width < W * 0.6) { r.x = card.right + 8; r.w = W - r.x; }
  else if (card.height) { r.h = card.top - r.y - 8; }
  // Keep the drawing clear of the corner logo.
  const logo = $('logo-corner').getBoundingClientRect();
  if (logo.width) r.h = Math.min(r.h, logo.top - 12 - r.y);
  r.w = Math.max(r.w, 120); r.h = Math.max(r.h, 120);
  return r;
}
// Frames a box, or a list of part boxes: each part's own corners are projected, which centres an
// L-shaped or sparse group much better than the corners of one box around all of it.
function frameBox(boxes, az, el, margin = 0.84) {
  if (!Array.isArray(boxes)) boxes = [boxes];
  const {dir, right, up} = viewVectors(az, el);
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
  const box = new THREE.Box3(), c = new THREE.Vector3();
  for (const b of boxes) {
    box.union(b);
    for (let i = 0; i < 8; i++) {
      c.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z);
      const x = c.dot(right), y = c.dot(up);
      minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y);
    }
  }
  const W = canvas.clientWidth, H = canvas.clientHeight, fr = freeRect();
  const labelRoom = prefs.labels && mode === 'steps' ? 0.74 : 1;
  const s = Math.max((maxx - minx) / (fr.w * margin * labelRoom), (maxy - miny) / (fr.h * margin), 0.02);
  const zoom = BASE_HALF / (s * H / 2);
  const ox = fr.x + fr.w / 2 - W / 2, oy = fr.y + fr.h / 2 - H / 2;
  const center = box.getCenter(new THREE.Vector3());
  const cx = (minx + maxx) / 2, cy = (miny + maxy) / 2, cd = center.dot(dir);
  const target = right.clone().multiplyScalar(cx - ox * s).add(up.clone().multiplyScalar(cy + oy * s)).add(dir.clone().multiplyScalar(cd));
  return {target, zoom: Math.min(controls.maxZoom, Math.max(controls.minZoom, zoom)), az, el};
}
function placeCamera(target, az, el, zoom) {
  const {dir} = viewVectors(az, el);
  controls.target.copy(target);
  camera.position.copy(target).addScaledVector(dir, 2000);
  camera.zoom = zoom; camera.updateProjectionMatrix();
  controls.update();
}
function animateCameraTo(goal, instant) {
  const from = {...currentAngles(), target: controls.target.clone(), zoom: camera.zoom};
  if (instant || matchMedia('(prefers-reduced-motion: reduce)').matches) { placeCamera(goal.target, goal.az, goal.el, goal.zoom); camAnim = null; return; }
  let daz = goal.az - from.az; daz = ((daz + 540) % 360) - 180;
  camAnim = {from, goal, daz, t0: performance.now(), dur: 900 / (autoplay ? autoSpeed : 1)};
}
// The part boxes a step frames: what moves (both ends of its travel) and the bench, or the focus parts.
function stepBox(s) {
  const box = [];
  const add = (p, off) => { const b = p.box.clone(); if (off) b.translate(off); box.push(b); };
  const vis = visibleSet();
  const ids = s.movers.map(m => m.id).filter(id => vis.has(id));
  if (mode === 'steps' && !isolated && ids.length) {
    const savedTime = time;
    for (const t of [0, 1e9]) {
      time = t; const own = ownOffsets();
      const total = id => { const o = own.get(id) || [0, 0, 0]; const p = byId.get(id); if (!p.parent) return new THREE.Vector3(...o); return total(p.parent).add(new THREE.Vector3(...o)); };
      for (const id of ids) add(byId.get(id), total(id));
      for (const p of parts) if (vis.has(p.id) && ancestors(p.id).some(a => ids.includes(a))) add(p, total(p.id));
    }
    time = savedTime;
    for (const id of s.bench || []) if (vis.has(id)) add(byId.get(id));
    if (!box.length) for (const p of parts) if (vis.has(p.id)) add(p);
    // Keep the host of small parts in frame, so inserts are not shown alone.
    return box;
  }
  const focus = (s.focus || []).filter(id => vis.has(id));
  for (const p of parts) if (vis.has(p.id) && (!focus.length || focus.includes(p.id))) add(p, p.offset);
  return box;
}
const MIN_PX = 24, MAX_ZOOM_OUT = 3.5;
function frameCurrent(instant, entering) {
  if (!canvas.clientWidth || !canvas.clientHeight) { needsFrame = true; return; }
  const s = steps[stepIndex];
  const box = stepBox(s);
  if (!box.length) return;
  const ang = mode === 'steps' && !isolated ? s.view : (entering && !isolated ? EXPLORE_VIEW : currentAngles());
  let goal = frameBox(box, ang.az, ang.el);
  // When the parts already in place fit at a reasonable scale, the whole model is framed as it
  // stands at the end of the step, filling the view: the new part is seen where it goes. Parts
  // may then fly in from the edge of the view.
  // Two guards: every new part keeps at least MIN_PX on screen, and a part that would start its
  // move far outside the view widens the frame.
  if (mode === 'steps' && !isolated && s.movers.length) {
    const vis = visibleSet(), ids = new Set(s.movers.map(m => m.id));
    // Where everything sits at the end of the step (bench sub-assemblies may sit side by side).
    const saved = time; time = 1e9; const own = ownOffsets(); time = saved;
    const endOffset = id => { const o = new THREE.Vector3(...(own.get(id) || [0, 0, 0])), p = byId.get(id); return p.parent ? o.add(endOffset(p.parent)) : o; };
    const model = parts.filter(p => vis.has(p.id)).map(p => p.box.clone().translate(endOffset(p.id)));
    const moving = parts.filter(p => vis.has(p.id) && (ids.has(p.id) || ancestors(p.id).some(a => ids.has(a))));
    let all = frameBox(model, ang.az, ang.el, 0.92);
    const {right, up} = viewVectors(ang.az, ang.el), fr = freeRect(), W = canvas.clientWidth, H = canvas.clientHeight;
    const px = f => f.zoom * H / (2 * BASE_HALF);
    const screen = (f, v) => [W / 2 + v.clone().sub(f.target).dot(right) * px(f), H / 2 - v.clone().sub(f.target).dot(up) * px(f)];
    const size = (f, b) => {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (let i = 0; i < 8; i++) {
        const [x, y] = screen(f, new THREE.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z));
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      return Math.hypot(x1 - x0, y1 - y0);
    };
    // The point each moving part must reach into view: halfway back to where it starts,
    // so a part enters from the edge already well in sight.
    const starts = moving.map(p => {
      const end = p.box.getCenter(new THREE.Vector3()).add(endOffset(p.id));
      return end.lerp(p.box.getCenter(new THREE.Vector3()).add(p.offset), 0.5);
    });
    const offView = f => starts.some(c => { const [x, y] = screen(f, c); return x < fr.x || x > fr.x + fr.w || y < fr.y || y > fr.y + fr.h; });
    if (offView(all)) {
      // Widen evenly around the model, so the finished assembly stays in the middle.
      const mid = model.reduce((b, m) => b.union(m), new THREE.Box3()).getCenter(new THREE.Vector3());
      const pts = starts.flatMap(c => [c, mid.clone().multiplyScalar(2).sub(c)]);
      all = frameBox(model.concat(pts.map(c => new THREE.Box3(c, c.clone()))), ang.az, ang.el, 0.92);
    }
    // Only the parts added in this step count, not what they already carry (screws in an extrusion).
    if (all.zoom * MAX_ZOOM_OUT >= goal.zoom && Math.min(...moving.filter(p => ids.has(p.id)).map(p => size(all, p.box))) >= MIN_PX) goal = all;
  }
  animateCameraTo(goal, instant);
  userMovedCamera = false;
}

// ---------- labels ----------
const labelSvg = $('labels');
function project(v) {
  const p = v.clone().project(camera);
  return [(p.x + 1) / 2 * canvas.clientWidth, (1 - p.y) / 2 * canvas.clientHeight];
}
function drawLabels() {
  let html = '';
  const W = canvas.clientWidth, H = canvas.clientHeight;
  labelSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const groups = new Map();
  const s = steps[stepIndex];
  const addTo = (name, p, emph) => {
    if (!groups.has(name)) groups.set(name, {name, anchors: [], emph});
    groups.get(name).anchors.push(project(p.center.clone().add(p.offset)));
  };
  if (isolated) addTo(byId.get(isolated).name, byId.get(isolated), true);
  else if (mode === 'steps' && prefs.labels) {
    for (const id of s.bench || []) { const p = byId.get(id); if (p.visible) addTo(p.name, p, false); }
    for (const m of s.movers) { const p = byId.get(m.id); if (p.visible) addTo(p.name, p, true); }
  }
  if (hovered && !isolated && byId.get(hovered).visible) {
    const p = byId.get(hovered);
    if (!groups.has(p.name)) addTo(p.name, p, true);
  }
  if (groups.size) {
    const fr = freeRect(), list = [...groups.values()];
    const mid = list.flatMap(g => g.anchors).reduce((a, q) => a + q[0], 0) / list.reduce((n, g) => n + g.anchors.length, 0);
    for (const g of list) {
      g.cx = g.anchors.reduce((a, q) => a + q[0], 0) / g.anchors.length;
      g.cy = g.anchors.reduce((a, q) => a + q[1], 0) / g.anchors.length;
      g.text = g.name.toUpperCase() + (g.anchors.length > 1 ? `  ×${g.anchors.length}` : '');
      g.w = g.text.length * 6.9 + 6;
      g.side = g.cx < mid ? 0 : 1;
    }
    const narrow = W < 700;
    for (const side of [0, 1]) {
      const col = list.filter(g => g.side === side).sort((a, b) => a.cy - b.cy);
      if (!col.length) continue;
      const GAP = narrow ? 18 : 22, top = fr.y + 18, bottom = fr.y + fr.h - 12;
      const ys = col.map(g => Math.min(bottom, Math.max(top, g.cy)));
      for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + GAP);
      const over = Math.max(0, ys[ys.length - 1] - bottom);
      for (let i = ys.length - 1; i >= 0; i--) ys[i] = Math.min(ys[i] - over, i < ys.length - 1 ? ys[i + 1] - GAP : Infinity);
      const ext = inkExtent();
      col.forEach((g, i) => {
        const y = ys[i];
        let x, elbow, anchorX;
        if (side) {
          x = Math.min(fr.x + fr.w - g.w - 10, ext[1] + 28);
          elbow = x - 10; anchorX = x - 4;
        } else {
          x = Math.max(fr.x + 10 + g.w, ext[0] - 28);
          elbow = x + 10; anchorX = x + 4;
        }
        const cls = g.emph ? 'lead emph' : 'lead';
        // Many identical pieces: dot every one, but run leader lines only to the nearest three.
        const led = g.anchors.length > 4 ? [...g.anchors].sort((p, q) => Math.hypot(p[0] - elbow, p[1] - y) - Math.hypot(q[0] - elbow, q[1] - y)).slice(0, 3) : g.anchors;
        for (const a of led) html += `<path class="${cls}" d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${elbow.toFixed(1)} ${y.toFixed(1)}L${anchorX.toFixed(1)} ${y.toFixed(1)}"/>`;
        for (const a of g.anchors) html += `<circle class="dot${g.emph ? ' emph' : ''}" cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="2"/>`;
        html += `<text class="lab${g.emph ? ' emph' : ''}" x="${(side ? x : x).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${side ? 'start' : 'end'}">${escapeHtml(g.text)}</text>`;
      });
    }
  }
  labelSvg.innerHTML = html;
}
// Horizontal screen extent of everything drawn, so label columns sit beside the ink.
function inkExtent() {
  let lo = Infinity, hi = -Infinity;
  const c = new THREE.Vector3();
  for (const p of parts) {
    if (!p.visible) continue;
    for (let i = 0; i < 8; i++) {
      c.set(i & 1 ? p.box.max.x : p.box.min.x, i & 2 ? p.box.max.y : p.box.min.y, i & 4 ? p.box.max.z : p.box.min.z).add(p.offset);
      const x = project(c)[0]; lo = Math.min(lo, x); hi = Math.max(hi, x);
    }
  }
  return [lo, hi];
}
const escapeHtml = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

// ---------- step UI ----------
// An (i) mark that explains itself on hover, focus, click or tap, in the page's floating tip.
const INFO_UNDRAWN = '<button type="button" class="info" data-tip="Not in the 3D drawing (the CAD has no model of it)" aria-label="Not in the 3D drawing">i</button>';
function showInfo(b) {
  const tip = $('tip'), r = b.getBoundingClientRect();
  tip.textContent = b.dataset.tip; tip.hidden = false;
  const w = tip.offsetWidth, x = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2));
  tip.style.transform = `translate(${x}px, ${r.bottom + 6}px)`;
}
const hideInfo = () => { $('tip').hidden = true; };
document.addEventListener('pointerover', e => { const b = e.target.closest?.('.info'); if (b && e.pointerType === 'mouse') showInfo(b); });
document.addEventListener('pointerout', e => { if (e.target.closest?.('.info') && e.pointerType === 'mouse' && document.activeElement !== e.target.closest('.info')) hideInfo(); });
document.addEventListener('focusin', e => { if (e.target.matches?.('.info')) showInfo(e.target); });
document.addEventListener('focusout', e => { if (e.target.matches?.('.info')) hideInfo(); });
document.addEventListener('click', e => { const b = e.target.closest?.('.info'); if (b) { e.stopPropagation(); b.focus(); showInfo(b); } }, true);
function renderStepCard() {
  const s = steps[stepIndex];
  const n = stepIndex + 1, total = steps.length;
  $('step-count').textContent = `Step ${String(n).padStart(2, '0')} of ${total}`;
  $('dock-label').textContent = `Step ${n} of ${total} · ${s.title}`;
  $('step-section').textContent = s.section;
  $('step-title').textContent = s.title;
  const fin = $('step-finale');
  fin.hidden = !s.finale;
  if (s.finale) fin.innerHTML = `<b>Congratulations</b><span>${steps.length} steps · ${new Set(steps.map(st => st.chapter)).size} chapters · ${parts.length.toLocaleString('en')} parts</span>`;
  $('step-text').innerHTML = stepText(s).map(t => `<p>${escapeHtml(t)}</p>`).join('');
  $('step-notes').innerHTML = (s.notes || []).map(x => `<div class="callout ${x.kind}"><b>${escapeHtml(x.title)}</b><span>${escapeHtml(x.text)}${x.link ? ` <a href="${x.link}" target="_blank" rel="noopener">${x.link.replace('https://', '')}</a>` : ''}</span></div>`).join('');
  const pages = s.pages.length > 1 ? `pages ${s.pages[0]}–${s.pages.at(-1)}` : `page ${s.pages[0]}`;
  $('step-source').innerHTML = `Official manual, <a href="${MANUAL_URL}" target="_blank" rel="noopener">${pages}</a>`;
  // Items in this step
  const counts = new Map();
  // Sub-assemblies carried into place (`again`) were counted where they were built.
  for (const m of s.movers) { if (m.again) continue; const p = byId.get(m.id); counts.set(p.name, (counts.get(p.name) || 0) + 1); }
  // Items the CAD does not have (tape, zip ties, tools…) carry an info mark instead of a long suffix.
  const undrawn = new Set();
  for (const x of s.extras || []) { counts.set(x.name, (counts.get(x.name) || 0) + x.qty); undrawn.add(x.name); }
  $('step-items').innerHTML = counts.size ? `<h3>In this step</h3><ul>${[...counts].map(([k, v]) => `<li><span class="qty">${v}×</span>${escapeHtml(k)}${undrawn.has(k) ? INFO_UNDRAWN : ''}</li>`).join('')}</ul>` : '';
  $('prev').disabled = stepIndex === 0;
  $('next').disabled = stepIndex === steps.length - 1;
  // Ticks
  // Ticks for the current chapter only; the chapter menu jumps between chapters.
  const chapters = [...new Set(steps.map(st => st.chapter))];
  const sel = $('chapter');
  if (sel.dataset.key !== chapters.join('|')) {
    sel.dataset.key = chapters.join('|');
    sel.innerHTML = chapters.map((c, k) => {
      const first = steps.findIndex(st => st.chapter === c), last = steps.findLastIndex(st => st.chapter === c);
      return `<option value="${first}">${k + 1}. ${escapeHtml(c)} · steps ${first + 1}–${last + 1}</option>`;
    }).join('');
  }
  sel.selectedIndex = chapters.indexOf(s.chapter);
  $('ticks').innerHTML = steps.map((st, i) => st.chapter !== s.chapter ? '' : `<button type="button" class="tick${i === stepIndex ? ' on' : ''}${i < stepIndex ? ' done' : ''}${i && st.section !== steps[i - 1].section ? ' chapter-start' : ''}" data-i="${i}" title="${escapeHtml(st.section + ': ' + st.title)}" aria-label="Step ${i + 1}: ${escapeHtml(st.section)}">${i + 1}</button>`).join('');
  try { history.replaceState(null, '', '#' + s.id); } catch {}
  updateScrub();
}
function updateScrub() {
  const d = duration(steps[stepIndex]);
  $('scrub').value = d ? Math.round(Math.min(1, time / d) * 1000) : 1000;
  $('scrub').disabled = !d;
  $('play').setAttribute('aria-label', playing ? 'Pause' : 'Play');
  $('play').classList.toggle('playing', playing);
}
function goStep(i, opts = {}) {
  stepIndex = Math.max(0, Math.min(steps.length - 1, i));
  isolated = null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  time = opts.end || reduce ? 1e9 : 0;
  playing = !opts.end && !reduce && duration(steps[stepIndex]) > 0;
  applyPose(); restyle(); renderStepCard();
  if (prefs.follow || opts.frame || steps[stepIndex].finale) frameCurrent(opts.instant);
  startFinale(steps[stepIndex].finale, reduce);
  renderPartsPanel();
}
// Finale: the camera turns around the printer and a short burst of confetti falls once.
function startFinale(on, reduce) {
  spinning = !!on && !reduce;
  const box = $('confetti');
  box.innerHTML = '';
  if (!on || reduce) return;
  if (autoplay) setAutoplay(false);
  const colors = ['var(--accent)', 'var(--ink)', 'var(--steel)', 'var(--accent)'];
  box.innerHTML = Array.from({length: 90}, (_, i) => {
    const x = Math.random() * 100, d = 2.4 + Math.random() * 2.2, w = Math.random() * 0.9;
    return `<i style="left:${x.toFixed(1)}%;background:${colors[i % 4]};animation-duration:${d.toFixed(2)}s;animation-delay:${w.toFixed(2)}s;--r:${Math.round(360 + Math.random() * 720)}deg;--dx:${Math.round(Math.random() * 120 - 60)}px"></i>`;
  }).join('');
  clearTimeout(startFinale.timer);
  startFinale.timer = setTimeout(() => { box.innerHTML = ''; }, 6000);
}

// ---------- panels ----------
function togglePanel(name) {
  for (const el of document.querySelectorAll('.panel')) {
    const open = el.id === 'panel-' + name && el.hidden;
    el.hidden = !open;
    document.querySelector(`[data-panel="${el.id.slice(6)}"]`)?.setAttribute('aria-expanded', String(open));
  }
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-panel]');
  if (t) { togglePanel(t.dataset.panel); return; }
  if (!e.target.closest('.panel')) for (const el of document.querySelectorAll('.panel')) if (!el.hidden) togglePanel(el.id.slice(6));
});
document.addEventListener('keydown', e => {
  if (e.target.matches('input, select, textarea')) return;
  if (e.key === 'h' || e.key === 'H') setHand(!document.body.classList.contains('hand'));
  if (e.key === 'Escape') { for (const el of document.querySelectorAll('.panel')) el.hidden = true; if (isolated) { isolated = null; applyPose(); restyle(); frameCurrent(); renderPartsPanel(); } }
  if (mode !== 'steps') return;
  if (e.key === 'ArrowRight') goStep(stepIndex + 1);
  if (e.key === 'ArrowLeft') goStep(stepIndex - 1);
  if (e.key === ' ') { e.preventDefault(); $('play').click(); }
});

function bindOptions() {
  const sync = () => {
    $('opt-highlight').checked = prefs.highlight;
    $('opt-fill').checked = prefs.fill;
    for (const b of document.querySelectorAll('[name=linework]')) b.checked = b.value === prefs.linework;
    $('opt-context').checked = prefs.context === 'faded';
    $('opt-labels').checked = prefs.labels;
    $('opt-trails').checked = prefs.trails;
    $('opt-follow').checked = prefs.follow;
    $('opt-hue').value = prefs.hue ?? 210;
    $('hue-state').textContent = prefs.hue === null ? 'Graphite' : `Hue ${prefs.hue}°`;
    for (const [k, el] of [['primary', $('sw-primary')], ['accent', $('sw-accent')]])
      for (const b of el.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.hex === prefs[k]));
    $('swatch-row').hidden = !prefs.fill;
  };
  const swatches = (el, key) => {
    el.innerHTML = FILAMENTS.map(f => `<button type="button" class="sw" data-hex="${f.hex}" style="--c:${f.hex}" title="${f.name}" aria-label="${f.name}"></button>`).join('');
    el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; prefs[key] = b.dataset.hex; savePrefs(); sync(); restyle(); });
  };
  swatches($('sw-primary'), 'primary'); swatches($('sw-accent'), 'accent');
  $('opt-highlight').addEventListener('change', e => { prefs.highlight = e.target.checked; savePrefs(); restyle(); });
  $('opt-fill').addEventListener('change', e => { prefs.fill = e.target.checked; savePrefs(); sync(); restyle(); });
  for (const b of document.querySelectorAll('[name=linework]')) b.addEventListener('change', e => { prefs.linework = e.target.value; savePrefs(); restyle(); });
  $('opt-context').addEventListener('change', e => { prefs.context = e.target.checked ? 'faded' : 'full'; savePrefs(); restyle(); });
  $('opt-labels').addEventListener('change', e => { prefs.labels = e.target.checked; savePrefs(); dirty = true; });
  $('opt-trails').addEventListener('change', e => { prefs.trails = e.target.checked; savePrefs(); updateTrails(); dirty = true; });
  $('opt-follow').addEventListener('change', e => { prefs.follow = e.target.checked; savePrefs(); if (prefs.follow) frameCurrent(); });
  $('opt-hue').addEventListener('input', e => { prefs.hue = +e.target.value; savePrefs(); sync(); restyle(); });
  $('hue-reset').addEventListener('click', () => { prefs.hue = null; for (const p of parts) p.hue = null; savePrefs(); sync(); restyle(); });
  $('reset-all').addEventListener('click', () => {
    prefs = {...defaults, theme: prefs.theme}; savePrefs(); for (const p of parts) p.hue = null;
    rebuildSteps(); isolated = null; selected = null; sync(); restyle(); stepIndex = 0; setMode('explore'); renderBom();
  });
  sync();
}

function renderPartsPanel() {
  const list = $('parts-list');
  const vis = new Set(parts.filter(p => p.visible).map(p => p.id));
  const groups = new Map();
  for (const p of parts) {
    if (!enabled(p)) continue;
    const g = KIND_LABEL[p.kind];
    if (!groups.has(g)) groups.set(g, new Map());
    const m = groups.get(g);
    if (!m.has(p.name)) m.set(p.name, []);
    m.get(p.name).push(p);
  }
  let html = '';
  for (const [g, m] of groups) {
    html += `<h3>${g}</h3><ul>`;
    for (const [name, ps] of m) {
      const first = ps[0], on = ps.some(p => p.id === selected);
      html += `<li><button type="button" class="part-row${on ? ' on' : ''}${ps.some(p => vis.has(p.id)) ? '' : ' off'}" data-part="${first.id}"><span>${escapeHtml(name)}</span><span class="qty">${ps.length > 1 ? ps.length + '×' : ''}</span></button></li>`;
    }
    html += '</ul>';
  }
  list.innerHTML = html;
  const sel = selected && byId.get(selected);
  $('part-detail').hidden = !sel;
  if (sel) {
    const st = steps.findIndex(s => s.movers.some(m => m.id === sel.id) || (s.bench || []).includes(sel.id));
    $('pd-name').textContent = sel.name;
    $('pd-source').textContent = (sel.note ? sel.note + ' · ' : '') + 'CAD: ' + sel.source;
    $('pd-step').textContent = st >= 0 ? `Step ${st + 1}: ${steps[st].section}` : 'Comes with its parent part';
    $('pd-goto').hidden = st < 0;
    $('pd-goto').dataset.step = st;
    $('pd-isolate').textContent = isolated === sel.id ? 'Show all parts' : 'Isolate';
    $('pd-hue').value = sel.hue ?? 210;
  }
}
function selectPart(id) {
  selected = id; restyle(); renderPartsPanel(); dirty = true;
}
$('parts-list').addEventListener('click', e => {
  const b = e.target.closest('[data-part]'); if (!b) return;
  selectPart(b.dataset.part === selected ? null : b.dataset.part);
});
$('pd-isolate').addEventListener('click', () => {
  isolated = isolated === selected ? null : selected;
  applyPose(); restyle(); renderPartsPanel(); frameCurrent();
});
$('pd-goto').addEventListener('click', e => { setMode('steps'); goStep(+e.target.dataset.step); togglePanel('parts'); });
$('pd-hue').addEventListener('input', e => { const p = byId.get(selected); if (p) { p.hue = +e.target.value; restyle(); } });
$('pd-clear').addEventListener('click', () => selectPart(null));

function renderBom() {
  const rows = new Map();
  for (const p of parts) {
    if (!enabled(p)) continue;
    const key = p.name;
    if (!rows.has(key)) rows.set(key, {name: key, kind: p.kind, n: 0});
    rows.get(key).n++;
  }
  for (const st of steps) for (const x of st.extras || []) {
    const key = `${x.name}\u0000undrawn`;
    if (!rows.has(key)) rows.set(key, {name: x.name, kind: x.kind || 'bolt', n: 0, undrawn: true});
    rows.get(key).n += x.qty;
  }
  const sorted = [...rows.values()].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name));
  $('bom').innerHTML = `<table><thead><tr><th>Item</th><th>Qty</th></tr></thead><tbody>${sorted.map(r => `<tr class="k-${r.kind}"><td>${escapeHtml(r.name)}${r.undrawn ? INFO_UNDRAWN : ''}</td><td>${r.n}</td></tr>`).join('')}</tbody></table>`;
}

// ---------- mode switch ----------
function setMode(m) {
  stopIntro();
  mode = m;
  document.body.dataset.mode = m;
  isolated = null; playing = false; setAutoplay(false);
  if (m !== 'steps') startFinale(false);
  if (m === 'explore') $('dock-label').textContent = 'Exploded view';
  if (m === 'explore') { try { history.replaceState(null, '', location.pathname + location.search); } catch {} }
  applyPose(); restyle();
  if (m === 'steps') renderStepCard();
  frameCurrent(false, true);
  renderPartsPanel();
}
$('step-total').textContent = MODEL.steps.length;
$('start-building').addEventListener('click', () => { setMode('steps'); goStep(0, {frame: true}); });
$('to-explore').addEventListener('click', () => setMode('explore'));
$('explode').addEventListener('input', e => {
  stopIntro(); explode = +e.target.value / 100; $('explode-val').textContent = Math.round(explode * 100) + '%'; applyPose(); });

// ---------- transport ----------
$('prev').addEventListener('click', () => goStep(stepIndex - 1));
$('next').addEventListener('click', () => goStep(stepIndex + 1));
$('replay').addEventListener('click', () => {
  if (steps[stepIndex].finale) { frameCurrent(); startFinale(true, matchMedia('(prefers-reduced-motion: reduce)').matches); return; }
  time = 0; playing = true; holdUntil = 0; applyPose(); updateScrub();
});
$('play').addEventListener('click', () => {
  const d = duration(steps[stepIndex]);
  if (playing) { playing = false; setAutoplay(false); }
  else if (time >= d) { if (stepIndex < steps.length - 1) goStep(stepIndex + 1); }
  else playing = true;
  updateScrub();
});
$('scrub').addEventListener('input', e => { playing = false; setAutoplay(false); time = duration(steps[stepIndex]) * e.target.value / 1000; applyPose(); updateScrub(); });
// Autoplay runs every step in turn; a double click runs it at double speed (moves, holds and
// camera moves all twice as fast).
let autoSpeed = 1;
function setAutoplay(on, speed = 1) {
  autoplay = on; holdUntil = 0; autoSpeed = on ? speed : 1;
  $('autoplay').setAttribute('aria-pressed', String(on));
  $('autoplay').title = on ? 'Stop autoplay' : 'Autoplay every step (double-click for 2× speed)';
  $('autoplay').querySelector('span').textContent = on && speed > 1 ? `Auto ${speed}×` : 'Auto';
}
function startAutoplay(speed) {
  setAutoplay(true, speed);
  const d = duration(steps[stepIndex]);
  if (time >= d && stepIndex === steps.length - 1) goStep(0);
  else if (time < d) { playing = true; updateScrub(); }
}
$('autoplay').addEventListener('click', () => { if (autoplay) setAutoplay(false); else startAutoplay(1); });
// The two clicks of a double click have switched autoplay on and off again by now.
$('autoplay').addEventListener('dblclick', () => startAutoplay(2));
$('ticks').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) goStep(+b.dataset.i); });
$('chapter').addEventListener('change', e => goStep(+e.target.value));
$('fit').addEventListener('click', () => { stopIntro(); frameCurrent(); });
// Hand tool: a one-finger or left-button drag moves the drawing instead of turning it.
function setHand(on) {
  controls.mouseButtons.LEFT = on ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
  controls.touches.ONE = on ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
  document.body.classList.toggle('hand', on);
  $('hand').setAttribute('aria-pressed', String(on));
  $('rotate').setAttribute('aria-pressed', String(!on));
}
$('rotate').addEventListener('click', () => setHand(false));
$('hand').addEventListener('click', () => setHand(!document.body.classList.contains('hand')));
canvas.addEventListener('pointerdown', () => document.body.classList.add('grabbing'));
canvas.addEventListener('wheel', stopIntro, {passive: true});
addEventListener('pointerup', () => document.body.classList.remove('grabbing'));
$('zoom-in').addEventListener('click', () => zoomBy(1.25));
$('zoom-out').addEventListener('click', () => zoomBy(0.8));
$('dock-toggle').addEventListener('click', () => {
  const c = document.body.classList.toggle('dock-collapsed');
  $('dock-toggle').setAttribute('aria-expanded', String(!c));
  $('dock-toggle').textContent = c ? 'Show text' : 'Hide text';
});
function zoomBy(f) {
  stopIntro(); camera.zoom = Math.min(controls.maxZoom, Math.max(controls.minZoom, camera.zoom * f)); camera.updateProjectionMatrix(); dirty = true; updateZoomLabel(); }
let fitZoom = 1;
function updateZoomLabel() { $('zoom-val').textContent = Math.round(camera.zoom / (fitZoom || 1) * 100) + '%'; }

// ---------- picking ----------
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
let pickQueued = null, downAt = null;
// No hover picking while dragging: ray casts against the whole printer would slow the orbit.
canvas.addEventListener('pointermove', e => { if (!e.buttons) pickQueued = e; });
canvas.addEventListener('pointerleave', () => { pickQueued = null; if (hovered) { hovered = null; restyle(); $('tip').hidden = true; } });
canvas.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', e => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 4) return;
  const id = pick(e);
  selectPart(id && id !== selected ? id : null);
  if (id) { if ($('panel-parts').hidden) togglePanel('parts'); }
});
function pick(e) {
  const r = canvas.getBoundingClientRect();
  pointer.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(parts.filter(p => p.visible).map(p => p.mesh), false);
  return hits[0]?.object.userData.part || null;
}
function doPick() {
  if (!pickQueued) return;
  const e = pickQueued; pickQueued = null;
  const id = pick(e);
  if (id !== hovered) { hovered = id; restyle(); }
  const tip = $('tip');
  if (id) { tip.hidden = false; tip.textContent = byId.get(id).name; tip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 12}px)`; }
  else tip.hidden = true;
}

// ---------- level of detail ----------
// While the camera or the parts move, pieces only a few pixels across (screws, T-nuts, inserts
// on a whole-printer view) are skipped; the frame after the motion draws everything again.
// The parts moving in the current step, and the selected or hovered part, always draw.
let wasMoving = false, lastCamKey = '';
function cameraMoving() {
  const p = camera.position, t = controls.target;
  const key = [p.x, p.y, p.z, t.x, t.y, t.z, camera.zoom].map(v => v.toFixed(3)).join();
  const moved = key !== lastCamKey || !!camAnim;
  lastCamKey = key;
  return moved;
}
function cullTiny(moving) {
  const keep = new Set(mode === 'steps' && !isolated ? steps[stepIndex].movers.map(m => m.id) : []);
  if (selected) keep.add(selected);
  if (hovered) keep.add(hovered);
  const pxPerMm = camera.zoom * canvas.clientHeight / (2 * BASE_HALF);
  for (const p of parts) {
    if (!p.visible) continue;
    const tiny = moving && p.diag * pxPerMm < 7 && !keep.has(p.id) && !ancestors(p.id).some(a => keep.has(a));
    if (tiny === !!p.culled) continue;
    p.culled = tiny;
    p.group.visible = !tiny;
  }
}

// ---------- intro ----------
// On load the exploded view plays a loop: the assembled printer from the front right turns to
// the back left while it explodes to 150%, holds, then plays back. Any interaction stops it.
const INTRO = {from: {az: -58, el: 22, explode: 0}, to: {az: 118, el: 20, explode: 1.5}, rest: 2.5, move: 6, hold: 7};
let intro = null;
function startIntro() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  intro = {t0: performance.now()};
  introFrames();
  introPose(performance.now());
}
// The two framings the loop moves between, for the space the card currently leaves free.
function introFrames() {
  const frameAt = ({az, el, explode: e}) => {
    explode = e; applyPose();
    const box = new THREE.Box3();
    for (const p of parts) if (p.visible) box.union(p.box.clone().translate(p.offset));
    return frameBox(box, az, el);
  };
  intro.a = frameAt(INTRO.from); intro.b = frameAt(INTRO.to);
}
function stopIntro() { intro = null; }
function introPose(now) {
  const {rest, move, hold} = INTRO, cycle = rest + move + hold + move;
  const t = ((now - intro.t0) / 1000) % cycle;
  const k = t < rest ? 0 : t < rest + move ? ease((t - rest) / move) : t < rest + move + hold ? 1 : 1 - ease((t - rest - move - hold) / move);
  const {from, to} = INTRO, {a, b} = intro;
  explode = from.explode + (to.explode - from.explode) * k;
  $('explode').value = Math.round(explode * 100); $('explode-val').textContent = Math.round(explode * 100) + '%';
  applyPose();
  // The drawing grows about linearly as it explodes, so the scale (1 / zoom) is interpolated.
  placeCamera(a.target.clone().lerp(b.target, k), from.az + (to.az - from.az) * k, from.el + (to.el - from.el) * k, 1 / (1 / a.zoom + (1 / b.zoom - 1 / a.zoom) * k));
  fitZoom = camera.zoom; updateZoomLabel();
}

// ---------- resize + loop ----------
let needsFrame = false;
function resize() {
  const W = canvas.clientWidth, H = canvas.clientHeight;
  if (!W || !H) return;
  renderer.setSize(W, H, false);
  const a = W / H;
  camera.left = -BASE_HALF * a; camera.right = BASE_HALF * a; camera.top = BASE_HALF; camera.bottom = -BASE_HALF;
  camera.updateProjectionMatrix();
  resolution.set(W, H);
  for (const m of materials.values()) m.resolution.copy(resolution);
  dirty = true;
  if (needsFrame && parts.length) { needsFrame = false; frameCurrent(true, mode === 'explore'); }
}
// Keep the drawing centred in the space the card leaves free when the window changes size or
// the card is shown, hidden or changes height. A view the user has moved is left alone.
let reframeTimer = 0;
function reframe() {
  if (!parts.length) return;
  if (intro && mode === 'explore') introFrames();
  else if (!userMovedCamera && !isolated && (mode === 'explore' || prefs.follow)) frameCurrent();
}
const scheduleReframe = () => { clearTimeout(reframeTimer); reframeTimer = setTimeout(reframe, 120); };
new ResizeObserver(() => { resize(); scheduleReframe(); }).observe(canvas);
new ResizeObserver(scheduleReframe).observe($('dock'));
let lastT = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  if (camAnim) {
    const u = Math.min(1, (now - camAnim.t0) / camAnim.dur), k = ease(u), {from, goal} = camAnim;
    const t = from.target.clone().lerp(goal.target, k);
    placeCamera(t, from.az + camAnim.daz * k, from.el + (goal.el - from.el) * k, from.zoom + (goal.zoom - from.zoom) * k);
    if (u >= 1) { camAnim = null; fitZoom = goal.zoom; updateZoomLabel(); }
    dirty = true;
  } else if (intro && mode === 'explore') introPose(now);
  else controls.update();
  if (spinning && mode === 'steps' && !camAnim && !isolated) {
    const a = currentAngles();
    placeCamera(controls.target.clone(), a.az + SPIN_DEG_PER_S * dt, a.el, camera.zoom);
  }
  if (mode === 'steps') {
    const d = duration(steps[stepIndex]);
    if (playing) {
      time += dt * (autoplay ? autoSpeed : 1);
      if (time >= d) { time = d; playing = false; }
      applyPose(); updateScrub();
    }
    // Autoplay: hold on the finished step, then move on; after the last step start again.
    if (autoplay && !playing && time >= d) {
      if (!holdUntil) holdUntil = now + (d ? 1600 : 3200) / autoSpeed;
      if (now >= holdUntil) { holdUntil = 0; goStep(stepIndex < steps.length - 1 ? stepIndex + 1 : 0); }
    }
  }
  doPick();
  const moving = cameraMoving() || (mode === 'steps' && playing);
  if (moving !== wasMoving) { wasMoving = moving; dirty = true; }
  if (dirty) {
    cullTiny(moving);
    updateSilhouettes();
    renderer.render(scene, camera);
    drawLabels();
    dirty = false;
  }
  requestAnimationFrame(loop);
}

// ---------- exports (teardown hidden-line renderer in a worker) ----------
let worker = null, jobId = 0;
const jobs = new Map();
function ensureWorker() {
  if (worker) return worker;
  const src = JSON.parse($('worker-src').textContent);
  const url = URL.createObjectURL(new Blob([src], {type: 'text/javascript'}));
  worker = new Worker(url);
  URL.revokeObjectURL(url);
  worker.onmessage = ({data}) => { const j = jobs.get(data.id); if (!j) return; jobs.delete(data.id); data.error ? j.reject(new Error(data.error)) : j.resolve(data); };
  worker.postMessage({type: 'init', parts: parts.map(p => ({id: p.id, name: p.name, clear: p.kind === 'glass', positions: p.positions.slice(), index: p.index.slice(), edges: p.edges.slice()}))});
  return worker;
}
const hex = c => '#' + c.getHexString();
async function buildSvg() {
  const vis = parts.filter(p => p.visible);
  const ang = currentAngles();
  const annotate = $('ex-labels').checked && vis.length <= 24;
  const w = ensureWorker(), id = ++jobId;
  const result = await new Promise((resolve, reject) => {
    jobs.set(id, {resolve, reject});
    w.postMessage({type: 'render', id, ids: vis.map(p => p.id), offsets: Object.fromEntries(vis.map(p => [p.id, p.offset.toArray()])), camera: {azimuth: ang.az, elevation: ang.el, roll: 0}, fill: prefs.fill || prefs.highlight, annotate});
  });
  const svg = composeSvg(result.markup, vis, $('ex-transparent').checked);
  const s = steps[stepIndex];
  const base = mode === 'explore' ? `voron-trident-r2-exploded-${Math.round(explode * 100)}` : isolated ? `voron-trident-r2-${isolated}` : `voron-trident-r2-step-${String(stepIndex + 1).padStart(2, '0')}-${s.id}`;
  return {svg, name: `${base}-${prefs.linework}`};
}
async function exportSheet(format) {
  const status = $('export-status');
  const btns = document.querySelectorAll('[data-export]');
  btns.forEach(b => b.disabled = true);
  const t0 = performance.now();
  const timer = setInterval(() => { status.textContent = `Drawing hidden lines\u2026 ${Math.round((performance.now() - t0) / 1000)} s`; }, 500);
  status.textContent = 'Drawing hidden lines\u2026';
  try {
    const {svg, name} = await buildSvg();
    if (format === 'svg') await save(name + '.svg', new Blob([svg], {type: 'image/svg+xml'}));
    if (format === 'png') await save(name + '.png', await rasterize(svg));
    if (format === 'pdf') await save(name + '.pdf', await toPdf(svg));
    status.textContent = `Saved ${name}.${format}`;
  } catch (err) {
    status.textContent = 'Export failed: ' + err.message;
  } finally {
    clearInterval(timer);
    btns.forEach(b => b.disabled = false);
  }
}
const WIDTHS = {
  technical: {outline: .35, edge: .22, detail: .13, texture: .09, axis: .13},
  patent: {outline: .24, edge: .15, detail: .10, texture: .065, axis: .1},
  service: {outline: .5, edge: .28, detail: .16, texture: 0, axis: .16}
};
function composeSvg(markup, vis, transparent) {
  // Export ink is always dark-on-white (theme never changes the file).
  const saved = T; T = {...T, paper: new THREE.Color('#ffffff'), ink: new THREE.Color('#202020'), dark: false};
  const s = steps[stepIndex], doc = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`, 'image/svg+xml');
  const widths = WIDTHS[prefs.linework], styles = new Map(vis.map(p => [p.id, partStyle(p, s)]));
  for (const g of doc.querySelectorAll('[data-item]')) {
    const st = styles.get(g.getAttribute('data-item')); if (!st) continue;
    g.setAttribute('stroke', hex(st.ink));
  }
  for (const path of doc.querySelectorAll('[data-line-role]')) {
    const role = path.getAttribute('data-line-role');
    path.setAttribute('stroke-width', widths[role] ?? .2);
    path.setAttribute('stroke-linecap', role === 'axis' ? 'butt' : 'round');
    path.setAttribute('stroke-linejoin', 'round');
    if (role === 'axis') path.setAttribute('stroke-dasharray', '6 1 1 1');
    if (!path.closest('[data-item]')) path.setAttribute('stroke', '#202020');
  }
  for (const f of doc.querySelectorAll('[data-fill]')) {
    const st = styles.get(f.getAttribute('data-fill'));
    f.setAttribute('fill', st ? hex(st.face) : 'none'); f.setAttribute('stroke', 'none');
  }
  for (const el of doc.querySelectorAll('[data-ink-fill]')) { el.setAttribute('fill', '#202020'); if (el.tagName === 'text') el.setAttribute('font-family', 'Helvetica, Arial, sans-serif'); }
  T = saved;
  const inner = doc.documentElement.innerHTML;
  const title = mode === 'explore' ? 'Exploded view' : isolated ? byId.get(isolated).name : `Step ${stepIndex + 1}: ${s.section}, ${s.title}`;
  const caption = `VORON TRIDENT R2 · ${title.toUpperCase()} · NTS · PROJECTED FROM THE VORON DESIGN CAD (GPL-3.0) · UNOFFICIAL COMMUNITY MANUAL, NOT ENDORSED BY VORON DESIGN`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-labelledby="t d">
<title id="t">VORON Trident R2 — ${escapeHtml(title)}</title>
<desc id="d">Hidden-line drawing projected from trident_assembly.step (VoronDesign/Voron-Trident, GPL-3.0). Linework: ${LINEWORK[prefs.linework].label}. Not to scale. Independent community manual by Iconic FAB, not affiliated with or endorsed by VORON Design.</desc>
${transparent ? '' : '<rect width="420" height="297" fill="#ffffff"/>'}
<g fill="none" stroke="#202020" stroke-linecap="round" stroke-linejoin="round">${inner}</g>
<text x="14" y="289" font-family="Helvetica, Arial, sans-serif" font-size="2.6" fill="#202020" letter-spacing=".2">${escapeHtml(caption)}</text>
</svg>`;
}
async function rasterize(svg) {
  const url = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
  try {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('PNG renderer could not read the drawing')); img.src = url; });
    const c = document.createElement('canvas'); c.width = 4961; c.height = 3508;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return await new Promise(res => c.toBlob(res, 'image/png'));
  } finally { URL.revokeObjectURL(url); }
}
function loadScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src.split('/').pop())); document.head.appendChild(s); });
}
async function toPdf(svg) {
  if (!window.jspdf) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  if (!window.jspdf?.jsPDF?.API?.svg) await loadScript('https://cdn.jsdelivr.net/npm/svg2pdf.js@2.2.1/dist/svg2pdf.umd.min.js');
  const {jsPDF} = window.jspdf;
  const pdf = new jsPDF({orientation: 'landscape', unit: 'mm', format: [420, 297], compress: true});
  const el = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
  const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-9999px;top:0;width:420px;height:297px;overflow:hidden';
  host.appendChild(document.importNode(el, true)); document.body.appendChild(host);
  try { await pdf.svg(host.firstChild, {x: 0, y: 0, width: 420, height: 297}); }
  finally { host.remove(); }
  return pdf.output('blob');
}
let downloadsCap;
async function save(filename, blob) {
  if (downloadsCap === undefined) downloadsCap = window.claude?.use ? await Promise.race([window.claude.use('downloads'), new Promise(r => setTimeout(() => r(null), 3000))]) : null;
  if (downloadsCap) {
    try { await downloadsCap.save({filename, data: blob}); return; }
    catch (e) { if (e?.code === 'declined') throw new Error('Save cancelled'); if (!['unavailable', 'not_granted', 'capability_disabled', 'capability_removed'].includes(e?.code)) throw new Error(e?.message || 'Save failed'); }
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
for (const b of document.querySelectorAll('[data-export]')) b.addEventListener('click', () => exportSheet(b.dataset.export));

// ---------- boot ----------
async function boot() {
  readTokens();
  applyTheme();
  $('load-state').textContent = 'Unpacking the STEP model…';
  const buf = await loadBinary();
  $('load-state').textContent = 'Building linework…';
  await new Promise(r => setTimeout(r, 20));
  parts = MODEL.parts.map(p => buildPart(p, buf));
  byId = new Map(parts.map(p => [p.id, p]));
  rebuildSteps();
  bindOptions();
  renderBom();
  resize();
  const fromHash = steps.findIndex(s => s.id === location.hash.slice(1));
  if (fromHash >= 0) { mode = 'steps'; document.body.dataset.mode = 'steps'; goStep(fromHash, {instant: true, frame: true}); }
  else { mode = 'explore'; document.body.dataset.mode = 'explore'; $('dock-label').textContent = 'Exploded view'; applyPose(); restyle(); frameCurrent(true, true); renderPartsPanel(); }
  fitZoom = camera.zoom; updateZoomLabel();
  if (mode === 'explore') startIntro();
  document.body.classList.add('ready');
  $('loading').hidden = true;
  requestAnimationFrame(loop);
}
boot().catch(err => { $('load-state').textContent = 'The model could not load: ' + err.message; console.error(err); });
