// Quick check renders of steps, without a browser. For each step it writes
// build/snap/NNN-<id>.png: the step's start pose (left, parts on their way in) and end pose
// (right). Parts moving in this step are blue, focus parts orange, everything else grey.
// Visibility, carriers, bench steps and offsets follow src/app.js.
// Usage: node tools/snap.cjs [step id | step number | chapter section ...]   (default: all)
//        BUILD_OUT=build/x reads the model from there and writes build/x/snap/.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.join(__dirname, '..');
const dir = path.join(root, process.env.BUILD_OUT || 'build');
const MODEL = JSON.parse(fs.readFileSync(path.join(dir, 'model.json')));
const bin = zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(dir, 'model.bin.gz.b64'), 'utf8'), 'base64'));
const view = (Type, [at, len]) => new Type(bin.buffer.slice(bin.byteOffset + at, bin.byteOffset + at + len * Type.BYTES_PER_ELEMENT));
const parts = MODEL.parts.map(p => ({...p, P: view(Float32Array, p.pos), T: view(Uint32Array, p.idx), E: view(Uint32Array, p.edges)}));
const byId = new Map(parts.map(p => [p.id, p]));
const steps = MODEL.steps;

const refStep = new Map();
steps.forEach((s, i) => { for (const m of s.movers) if (!m.again && !refStep.has(m.id)) refStep.set(m.id, i); });
steps.forEach((s, i) => { for (const id of s.bench || []) if (!refStep.has(id)) refStep.set(id, i); });
const mountStep = new Map();
steps.forEach((s, i) => { for (const m of s.movers) if (m.again && !mountStep.has(m.id)) mountStep.set(m.id, i); });
const refOf = id => refStep.has(id) ? refStep.get(id) : byId.get(id).parent ? refOf(byId.get(id).parent) : 0;
const ancestors = id => { const out = []; for (let p = byId.get(id); p.parent; p = byId.get(p.parent)) out.push(p.parent); return out; };

function visibleSet(si) {
  const s = steps[si], out = new Set();
  if (s.bench) {
    const movers = new Set(s.movers.map(m => m.id));
    for (const p of parts) {
      if (s.bench.includes(p.id) || movers.has(p.id)) out.add(p.id);
      else if (refOf(p.id) <= si && ancestors(p.id).some(a => s.bench.includes(a) || movers.has(a))) out.add(p.id);
    }
  } else for (const p of parts) if (refOf(p.id) <= si && !(mountStep.get(p.id) > si)) out.add(p.id);
  for (const id of [...out]) if (ancestors(id).some(a => !out.has(a))) out.delete(id);
  return out;
}
function offsets(s, k) {
  const own = new Map();
  for (const m of s.movers) own.set(m.id, m.vec.map(x => x * k));
  if (s.shift) for (const id of s.shift.ids) own.set(id, (own.get(id) || [0, 0, 0]).map((x, j) => x + s.shift.vec[j]));
  const total = id => { const o = own.get(id) || [0, 0, 0], p = byId.get(id); if (!p.parent) return o; const q = total(p.parent); return o.map((x, j) => x + q[j]); };
  return total;
}

function camera(az, el) {
  const a = az * Math.PI / 180, e = el * Math.PI / 180;
  const dir = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
  const right = [-Math.sin(a), Math.cos(a), 0];
  const up = [dir[1] * right[2] - dir[2] * right[1], dir[2] * right[0] - dir[0] * right[2], dir[0] * right[1] - dir[1] * right[0]];
  return {dir, right, up};
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function render(si, W, H) {
  const s = steps[si], vis = visibleSet(si), cam = camera(s.view?.az ?? 30, s.view?.el ?? 25);
  const movers = new Set(s.movers.map(m => m.id)), focus = new Set(s.focus || []);
  const poses = [offsets(s, 1), offsets(s, 0)];
  // Frame: movers (both poses) with what they carry, plus bench; else focus; else everything.
  const framed = [...vis].filter(id => movers.has(id) || ancestors(id).some(a => movers.has(a)) || (s.bench || []).includes(id));
  const pick = framed.length ? framed : focus.size ? [...vis].filter(id => focus.has(id)) : [...vis];
  let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
  for (const pose of poses) for (const id of pick) {
    const p = byId.get(id), o = pose(id);
    for (let c = 0; c < 8; c++) {
      const v = [0, 1, 2].map(k => p.box[(c >> k) & 1][k] + o[k]);
      const x = dot(v, cam.right), y = dot(v, cam.up);
      mnx = Math.min(mnx, x); mxx = Math.max(mxx, x); mny = Math.min(mny, y); mxy = Math.max(mxy, y);
    }
  }
  const scale = 0.9 * Math.min(W / (mxx - mnx || 1), H / (mxy - mny || 1));
  const cx = (mnx + mxx) / 2, cy = (mny + mxy) / 2;
  const img = Buffer.alloc(W * 2 * H * 3, 255);
  poses.forEach((pose, half) => {
    const zb = new Float32Array(W * H).fill(-Infinity), x0 = half * W;
    const proj = (v, o) => {
      const w = [v[0] + o[0], v[1] + o[1], v[2] + o[2]];
      return [W / 2 + (dot(w, cam.right) - cx) * scale, H / 2 - (dot(w, cam.up) - cy) * scale, dot(w, cam.dir)];
    };
    const plot = (x, y, z, rgb) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return;
      const i = y * W + x;
      if (z < zb[i]) return;
      zb[i] = z;
      const j = (y * W * 2 + x0 + x) * 3; img[j] = rgb[0]; img[j + 1] = rgb[1]; img[j + 2] = rgb[2];
    };
    for (const id of vis) {
      const p = byId.get(id), o = pose(id);
      const base = movers.has(id) || ancestors(id).some(a => movers.has(a)) ? [90, 143, 214] : focus.has(id) ? [230, 140, 50] : [200, 200, 200];
      const n = p.P.length / 3, V = new Array(n);
      for (let v = 0; v < n; v++) V[v] = proj([p.P[3 * v], p.P[3 * v + 1], p.P[3 * v + 2]], o);
      // Clear panels are see-through, as in the viewer: only their edges are drawn.
      for (let t = 0; p.kind !== 'glass' && t < p.T.length; t += 3) {
        const a = V[p.T[t]], b = V[p.T[t + 1]], c = V[p.T[t + 2]];
        const area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        if (!area) continue;
        // Shade by the world normal against the view direction.
        const A = [p.P[3 * p.T[t]], p.P[3 * p.T[t] + 1], p.P[3 * p.T[t] + 2]], B = [p.P[3 * p.T[t + 1]], p.P[3 * p.T[t + 1] + 1], p.P[3 * p.T[t + 1] + 2]], C = [p.P[3 * p.T[t + 2]], p.P[3 * p.T[t + 2] + 1], p.P[3 * p.T[t + 2] + 2]];
        const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], w = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
        const nn = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], l = Math.hypot(...nn) || 1;
        const lam = 0.55 + 0.45 * Math.abs(dot(nn, cam.dir) / l);
        const rgb = base.map(x => Math.round(x * lam));
        const minx = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))), maxx = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
        const miny = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))), maxy = Math.min(H - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
        for (let y = miny; y <= maxy; y++) for (let x = minx; x <= maxx; x++) {
          const px = x + 0.5, py = y + 0.5;
          const l0 = ((b[0] - px) * (c[1] - py) - (b[1] - py) * (c[0] - px)) / area;
          const l1 = ((c[0] - px) * (a[1] - py) - (c[1] - py) * (a[0] - px)) / area;
          const l2 = 1 - l0 - l1;
          if (l0 < 0 || l1 < 0 || l2 < 0) continue;
          plot(x, y, l0 * a[2] + l1 * b[2] + l2 * c[2], rgb);
        }
      }
      // Feature edges, pulled slightly toward the viewer.
      for (let e = 0; e < p.E.length; e += 2) {
        const a = V[p.E[e]], b = V[p.E[e + 1]], len = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])) + 1;
        for (let k = 0; k <= len; k++) {
          const f = k / len;
          plot(Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f), a[2] + (b[2] - a[2]) * f + 0.6, [40, 40, 40]);
        }
      }
    }
  });
  return png(W * 2, H, img);
}

function png(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  const crcTable = Array.from({length: 256}, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = b => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]), c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const args = process.argv.slice(2);
const chosen = steps.map((s, i) => i).filter(i => !args.length || args.some(a => a === steps[i].id || a === String(i + 1) || a === steps[i].section));
if (!chosen.length) throw Error('no matching steps');
const out = path.join(dir, 'snap');
fs.mkdirSync(out, {recursive: true});
for (const i of chosen) {
  const file = path.join(out, `${String(i + 1).padStart(3, '0')}-${steps[i].id}.png`);
  fs.writeFileSync(file, render(i, 640, 520));
  console.log(path.relative(root, file), '·', steps[i].section, '·', steps[i].title);
}
