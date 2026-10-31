// Export worker. Runs the teardown skill's hidden-line renderer
// (tools/teardown/assets/geometry.js, sheet.js, projection.js, prepended at build time)
// on the same STEP-derived meshes the preview shows.
let store = new Map();
const built = new Map();
function teardownPart(id) {
  if (built.has(id)) return built.get(id);
  const s = store.get(id);
  const P = s.positions, I = s.index, E = s.edges;
  const vertices = new Array(P.length / 3);
  for (let i = 0; i < vertices.length; i++) vertices[i] = [P[3 * i], P[3 * i + 1], P[3 * i + 2]];
  // Clear panels hide nothing in the drawing: their edges are drawn, their faces are not.
  const triangles = new Array(s.clear ? 0 : I.length / 3);
  for (let t = 0; t < triangles.length; t++) triangles[t] = [I[3 * t], I[3 * t + 1], I[3 * t + 2]];
  const lines = new Array(E.length / 2);
  for (let i = 0; i < lines.length; i++) lines[i] = {a: vertices[E[2 * i]], b: vertices[E[2 * i + 1]], role: 'edge'};
  const part = {id, name: s.name, vertices, triangles, lines, explosion: [0, 0, 0]};
  built.set(id, part);
  return part;
}
self.onmessage = ({data}) => {
  if (data.type === 'init') {
    store = new Map(data.parts.map(p => [p.id, p]));
    built.clear();
    return;
  }
  if (data.type === 'render') {
    try {
      const parts = data.ids.map(id => {
        const p = teardownPart(id);
        p.explosion = data.offsets[id] || [0, 0, 0];
        return p;
      });
      const result = TechnicalProjection.render(parts, {
        explosion: 1, fitExplosion: 1, camera: data.camera,
        fill: !!data.fill, annotate: !!data.annotate, labels: !!data.annotate
      });
      self.postMessage({id: data.id, markup: result.markup});
    } catch (err) {
      self.postMessage({id: data.id, error: String(err && err.message || err)});
    }
  }
};
