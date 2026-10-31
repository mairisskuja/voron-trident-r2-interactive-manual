// Records the opening "explode" loop of the interactive manual as social-media videos.
//
//   1. Serve the built site, e.g. from the repo root that holds dist/:
//        python3 -m http.server 8765 --directory dist
//   2. node tools/record-social.mjs [--url http://localhost:8765/voron/trident/r2/] [--out build/social]
//                                   [--only square|vertical] [--dpr 2]
//
// Writes, in --out:
//   voron-trident-r2-explode-1080x1080.mp4   square, H.264, 30 fps, one loop
//   voron-trident-r2-explode-1080x1920.mp4   9:16 for reels and stories
//   voron-trident-r2-explode-poster.png      1080x1080 still of the fully exploded moment
//
// How it works: headless Google Chrome is driven over the DevTools Protocol. Before the page
// loads, a script replaces performance.now and requestAnimationFrame with a virtual clock, so
// every video frame is rendered deterministically, 1/30 s apart (no screen recording). The page
// UI is hidden with CSS; each frame the WebGL canvas is copied to a 2D canvas, a caption is drawn,
// and the frame is encoded in the page with WebCodecs (avc1) and muxed with mp4-muxer
// (node_modules/mp4-muxer, a devDependency). No ffmpeg needed.
// Analytics requests are blocked so recording does not count as visits.
// Tiny parts (screws, nuts) are kept drawn while the camera moves; the live page hides them
// during motion for speed, which would make them pop in and out in a video.

import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
const URL_ = arg('url', 'http://localhost:8765/voron/trident/r2/');
const OUT = path.resolve(ROOT, arg('out', 'build/social'));
const DPR = +arg('dpr', 2);          // CSS px = video px / DPR; 2 gives the line weight of a phone screen
const ONLY = arg('only', '');
const MAX_FRAMES = +arg('frames', 0);   // debugging: stop after this many frames
const SHOTS = arg('shots', '').split(',').filter(Boolean).map(Number);   // debugging: also save these frames as PNG
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9400 + Math.floor(Math.random() * 400);
const FPS = 30;
const LOOP_S = 2.5 + 6 + 7 + 6;      // INTRO in src/app.js: rest + move + hold + move
const POSTER_S = 2.5 + 6 + 3.5;      // middle of the exploded hold

// Each format: video size; the drawing is framed between `top` and `bottom` (video px from the edges),
// the caption baseline sits `caption` px above the bottom (higher on 9:16, clear of the reels/stories UI).
const FORMATS = [
  {key: 'square', w: 1080, h: 1080, file: 'voron-trident-r2-explode-1080x1080.mp4', top: 40, bottom: 196, caption: 64, bitrate: 3_000_000, poster: 'voron-trident-r2-explode-poster.png'},
  {key: 'vertical', w: 1080, h: 1920, file: 'voron-trident-r2-explode-1080x1920.mp4', top: 220, bottom: 490, caption: 330, bitrate: 3_400_000},
].filter(f => !ONLY || f.key === ONLY);

fs.mkdirSync(OUT, {recursive: true});
const MUXER_SRC = fs.readFileSync(path.join(ROOT, 'node_modules/mp4-muxer/build/mp4-muxer.js'), 'utf8');

// ---------- Chrome + CDP ----------
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'record-social-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--mute-audio', '--no-first-run', '--no-default-browser-check', '--enable-unsafe-swiftshader', 'about:blank'], {stdio: 'ignore'});
const cleanup = () => { try { chrome.kill(); } catch {} try { fs.rmSync(profile, {recursive: true, force: true}); } catch {} };
process.on('exit', cleanup);

async function cdpJson(p, method = 'GET') {
  for (let i = 0; i < 100; i++) {
    try { return await (await fetch(`http://127.0.0.1:${PORT}${p}`, {method})).json(); } catch { await new Promise(r => setTimeout(r, 200)); }
  }
  throw new Error('Chrome did not start');
}

async function openTab() {
  const t = await cdpJson('/json/new?about:blank', 'PUT');
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pend = new Map(), handlers = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    else if (m.method && handlers.has(m.method)) handlers.get(m.method)(m.params);
  };
  const send = (method, params = {}) => new Promise((r, j) => { const i = ++id; pend.set(i, m => m.error ? j(new Error(method + ': ' + m.error.message)) : r(m.result)); ws.send(JSON.stringify({id: i, method, params})); });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  return {t, ws, send, evaluate, on: (m, f) => handlers.set(m, f), close: () => fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`).catch(() => {})};
}

// ---------- injected before the page's own scripts ----------
const PRELOAD = `(() => {
  // Virtual clock: time stands still until the recorder steps it.
  let T = 0; const q = [];
  performance.now = () => T;
  window.requestAnimationFrame = cb => { q.push(cb); return q.length; };
  window.cancelAnimationFrame = () => {};
  window.__rec = {
    step(t) { T = t; const cbs = q.splice(0); for (const cb of cbs) cb(T); },
    pending: () => q.length,
  };
  // Keep the WebGL drawing buffer so it can be copied after the page's render.
  const gc = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, opts) {
    if (/webgl/.test(type)) opts = {...(opts || {}), preserveDrawingBuffer: true};
    return gc.call(this, type, opts);
  };
  // Draw the tiny parts during motion too (see the header).
  const ch = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight');
  Object.defineProperty(Element.prototype, 'clientHeight', {configurable: true, get() {
    const v = ch.get.call(this);
    return this.id === 'view' && /cullTiny/.test(new Error().stack) ? v * 1e4 : v;
  }});
  try { localStorage.clear(); } catch {}
})();`;

// Hides the page UI. The top bar and the corner credit stay in the layout (invisible) because the
// page frames the drawing between them; they are sized here to give the area each format wants.
const css = (f) => `
  #dock, #labels, #tip, #confetti, .panel, #loading { display: none !important; }
  #topbar { visibility: hidden !important; position: fixed !important; top: 0 !important; height: ${(f.top - 8) / DPR}px !important; min-height: 0 !important; padding: 0 !important; }
  #logo-corner { display: block !important; visibility: hidden !important; position: fixed !important; left: 0 !important; right: auto !important; bottom: auto !important; top: ${(f.h - f.bottom + 12) / DPR}px !important; width: 10px !important; height: 10px !important; }
  html, body { background: #ffffff !important; }`;

// ---------- in-page recorder ----------
const RECORD = (f, frames, posterFrame, shots) => `(async () => {
  const W = ${f.w}, H = ${f.h}, FPS = ${FPS};
  const view = document.getElementById('view');
  const comp = document.createElement('canvas'); comp.width = W; comp.height = H;
  const ctx = comp.getContext('2d');
  await document.fonts.load('800 40px Nunito'); await document.fonts.load('700 20px Nunito'); await document.fonts.load('600 26px Nunito');

  // Caption, bottom-left, in the page's type and colours.
  const caption = () => {
    const x = 64, base = H - ${f.caption};
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#7b8086'; ctx.font = '600 27px Nunito';
    ctx.fillText('iconic-fab.com/voron/trident/r2', x, base);
    ctx.fillStyle = '#3b3e42'; ctx.font = '800 41px Nunito';
    ctx.fillText('VORON Trident R2 \\u00b7 Interactive Manual', x, base - 46);
    // UNOFFICIAL tag
    ctx.font = '800 19px Nunito'; ctx.letterSpacing = '2.5px';
    const label = 'UNOFFICIAL', tw = ctx.measureText(label).width, th = 34, ty = base - 46 - 41 - 22 - th;
    ctx.strokeStyle = '#ed3024'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(x + 1.25, ty, tw + 26, th, th / 2); ctx.stroke();
    ctx.fillStyle = '#ed3024'; ctx.fillText(label, x + 14, ty + th / 2 + 7);
    ctx.letterSpacing = '0px';
  };
  const draw = () => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(view, 0, 0, W, H);
    caption();
  };

  const muxer = new Mp4Muxer.Muxer({target: new Mp4Muxer.ArrayBufferTarget(), video: {codec: 'avc', width: W, height: H, frameRate: FPS}, fastStart: 'in-memory'});
  let err = null;
  const enc = new VideoEncoder({output: (c, m) => muxer.addVideoChunk(c, m), error: e => err = e});
  const cfg = {codec: 'avc1.640028', width: W, height: H, bitrate: ${f.bitrate}, bitrateMode: 'variable', framerate: FPS, avc: {format: 'avc'}, latencyMode: 'quality'};
  const sup = await VideoEncoder.isConfigSupported(cfg);
  if (!sup.supported) throw new Error('H.264 config not supported');
  enc.configure(cfg);

  let poster = null; const shots = {};
  const gl = view.getContext('webgl2') || view.getContext('webgl'), dbg = gl.getExtension('WEBGL_debug_renderer_info');
  console.log('renderer: ' + (dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '?') + ', canvas ' + view.width + 'x' + view.height);
  const tStart = Date.now();
  for (let i = 0; i < ${frames}; i++) {
    __rec.step(i * 1000 / FPS);
    if (!__rec.pending()) throw new Error('page loop stopped at frame ' + i);
    draw();
    if (i === ${posterFrame}) poster = comp.toDataURL('image/png');
    if (${JSON.stringify(shots)}.includes(i)) shots[i] = comp.toDataURL('image/png');
    if (i % 60 === 59) console.log('frame ' + (i + 1) + '/${frames}, ' + ((Date.now() - tStart) / 1000).toFixed(0) + ' s');
    const vf = new VideoFrame(comp, {timestamp: Math.round(i * 1e6 / FPS), duration: Math.round(1e6 / FPS)});
    enc.encode(vf, {keyFrame: i % (FPS * 2) === 0});
    vf.close();
    for (let w = 0; enc.encodeQueueSize > 6; w++) { if (w % 400 === 399) console.log('frame ' + i + ' waiting, encoder queue ' + enc.encodeQueueSize + ' ' + enc.state); await new Promise(r => setTimeout(r, 5)); }
    if (err) throw err;
  }
  console.log('frame: flushing encoder'); await enc.flush(); enc.close(); muxer.finalize(); console.log('frame: muxed ' + muxer.target.buffer.byteLength + ' bytes');
  const bytes = new Uint8Array(muxer.target.buffer);
  let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  window.__mp4 = btoa(s); console.log('frame: encoded base64');
  return {mp4len: window.__mp4.length, poster, shots};
})()`;

async function record(f) {
  const tab = await openTab();
  const {send, evaluate} = tab;
  await send('Fetch.enable', {patterns: [{urlPattern: '*googletagmanager.com*'}, {urlPattern: '*google-analytics.com*'}]});
  tab.on('Fetch.requestPaused', p => send('Fetch.failRequest', {requestId: p.requestId, errorReason: 'BlockedByClient'}).catch(() => {}));
  await send('Emulation.setDeviceMetricsOverride', {width: f.w / DPR, height: f.h / DPR, deviceScaleFactor: DPR, mobile: false});
  await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-color-scheme', value: 'light'}, {name: 'prefers-reduced-motion', value: 'no-preference'}]});
  tab.on('Runtime.consoleAPICalled', p => { const t = p.args.map(a => a.value ?? '').join(' '); if (/^(frame|renderer)/.test(t)) console.log('  ' + f.key + ' ' + t); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', {source: PRELOAD});
  await send('Page.addScriptToEvaluateOnNewDocument', {source: `document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(css(f))}; document.head.appendChild(s); });`});
  await send('Page.navigate', {url: URL_.split('#')[0]});
  const t0 = Date.now();
  for (;;) {
    const st = await evaluate(`document.body?.classList.contains('ready') ? 'ready' : (document.getElementById('load-state')?.textContent || '')`).catch(() => '');
    if (st === 'ready') break;
    if (/could not load/.test(st)) throw new Error(st);
    if (Date.now() - t0 > 180000) throw new Error('page did not become ready: ' + st);
    await new Promise(r => setTimeout(r, 500));
  }
  await evaluate(MUXER_SRC + ';0');
  const frames = MAX_FRAMES || Math.round(LOOP_S * FPS);
  const started = Date.now();
  const res = await evaluate(RECORD(f, frames, f.poster ? Math.round(POSTER_S * FPS) : -1, SHOTS));
  const file = path.join(OUT, f.file);
  // Fetch the file in slices: one huge CDP message can stall.
  const parts = [];
  for (let o = 0; o < res.mp4len; o += 1 << 20) parts.push(await evaluate(`window.__mp4.slice(${o}, ${o + (1 << 20)})`));
  fs.writeFileSync(file, Buffer.from(parts.join(''), 'base64'));
  console.log(`${f.file}: ${frames} frames, ${(fs.statSync(file).size / 1e6).toFixed(2)} MB, ${((Date.now() - started) / 1000).toFixed(0)} s`);
  if (f.poster && res.poster) {
    const pf = path.join(OUT, f.poster);
    fs.writeFileSync(pf, Buffer.from(res.poster.split(',')[1], 'base64'));
    console.log(`${f.poster}: ${(fs.statSync(pf).size / 1e3).toFixed(0)} kB`);
  }
  for (const [i, d] of Object.entries(res.shots)) fs.writeFileSync(path.join(OUT, `${f.key}-frame${i}.png`), Buffer.from(d.split(',')[1], 'base64'));
  await tab.close();
}

try {
  await cdpJson('/json/version');
  for (const f of FORMATS) await record(f);
} catch (e) {
  console.error(e); process.exitCode = 1;
} finally {
  cleanup();
}
process.exit();
