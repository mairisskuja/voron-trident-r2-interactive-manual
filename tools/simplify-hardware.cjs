// Simplifies the hardware meshes of the assembly for the line drawing.
//   build/assembly.json -> build/hardware.json  ({protoId: {position, index}})
// Knurls, threads and belt teeth carry most of the triangles but add little to line art.
// meshoptimizer (MIT) collapses edges on the welded mesh while keeping every surface within a
// small distance of the CAD: 0.25% of the part's size, between 0.006 and 0.05 mm. Printed parts
// and extrusions are not touched. build-data.cjs reads the result.
// Usage: node tools/simplify-hardware.cjs
const fs = require('fs');
const path = require('path');
const {MeshoptSimplifier} = require('meshoptimizer');

const root = path.join(__dirname, '..');
const HARDWARE = /Heat Set|SHCS|BHCS|FHCS|T-?Nut|Chain Link|Belt|Leadscrew|Motor|PTFE_Tube|Screw|Nut|Washer|Spacer|F695|Pulley|Bearing|Magnet|Terminal|Fan|DIN 913|^=>/i;

(async () => {
  await MeshoptSimplifier.ready;
  const asm = JSON.parse(fs.readFileSync(path.join(root, 'build/assembly.json')));
  const protos = new Set(asm.instances.filter(i => HARDWARE.test(i.name)).map(i => i.proto));
  const out = {};
  let before = 0, after = 0;
  for (const id of protos) {
    const {position: P, index: I} = asm.protos[id];
    if (!I.length) continue;
    // Weld: the STEP tessellation repeats vertices along every face border.
    const map = new Map(), pos = [], rem = new Uint32Array(P.length / 3);
    for (let v = 0; v < P.length / 3; v++) {
      const k = P[3 * v].toFixed(4) + ',' + P[3 * v + 1].toFixed(4) + ',' + P[3 * v + 2].toFixed(4);
      let w = map.get(k);
      if (w === undefined) { w = pos.length / 3; map.set(k, w); pos.push(P[3 * v], P[3 * v + 1], P[3 * v + 2]); }
      rem[v] = w;
    }
    const idx = [];
    for (let t = 0; t < I.length; t += 3) {
      const a = rem[I[t]], b = rem[I[t + 1]], c = rem[I[t + 2]];
      if (a !== b && b !== c && a !== c) idx.push(a, b, c);
    }
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let v = 0; v < pos.length; v += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], pos[v + k]); mx[k] = Math.max(mx[k], pos[v + k]); }
    const err = Math.min(0.05, Math.max(0.006, Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) * 0.0025));
    const [s] = MeshoptSimplifier.simplify(Uint32Array.from(idx), Float32Array.from(pos), 3, 0, err, ['ErrorAbsolute']);
    // Keep only the vertices still in use.
    const used = new Map(), position = [], index = [];
    for (const v of s) {
      let w = used.get(v);
      if (w === undefined) { w = position.length / 3; used.set(v, w); position.push(+pos[3 * v].toFixed(4), +pos[3 * v + 1].toFixed(4), +pos[3 * v + 2].toFixed(4)); }
      index.push(w);
    }
    out[id] = {position, index};
    before += I.length / 3; after += index.length / 3;
  }
  fs.writeFileSync(path.join(root, 'build/hardware.json'), JSON.stringify(out));
  console.log(`hardware: ${Object.keys(out).length} meshes, ${before} -> ${after} triangles`);
})();
