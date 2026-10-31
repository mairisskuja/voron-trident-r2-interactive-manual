// Part and step catalog for the VORON Trident R2 interactive manual. This file holds the
// shared helpers and the first two chapters (Frame, A/B Drive and Idler); every later chapter
// is a module in tools/chapters/ (NN-name.cjs, loaded in order) that receives the helpers.
// CHAPTERS=03,04 builds only those chapter modules after the first two (for quick checks).
//
// Parts are picked from build/assembly.json (tools/step/convert_ocp.py) by their path in
// the STEP product tree, so the selection reads like the CAD browser. Every pick states how
// many instances it expects, and the build stops if the CAD no longer matches.
// Step order, titles and tips follow the official assembly manual (version 2026-06-24);
// `pages` holds the manual pages each step is based on.

const fs = require('fs');
const path = require('path');

module.exports = function catalog(asm) {
  const I = asm.instances;
  const center = i => I[i].bbox[0].map((v, k) => (v + I[i].bbox[1][k]) / 2);
  const inside = (c, i, m = 0.5) => c.every((v, k) => v > I[i].bbox[0][k] - m && v < I[i].bbox[1][k] + m);
  const volume = i => I[i].bbox[1].reduce((s, v, k) => s * (v - I[i].bbox[0][k]), 1);
  const pick = (re, n) => {
    const out = I.map((_, i) => i).filter(i => re.test(I[i].path.join('/')));
    if (n !== undefined && out.length !== n) throw Error(`${re}: expected ${n} instances, found ${out.length}`);
    return out;
  };
  // The one instance of `re` nearest to a point (mm), for parts the CAD names alike.
  const at = (re, p) => pick(re).sort((a, b) => dist(center(a), p) - dist(center(b), p))[0];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

  const parts = [], used = new Set();
  const add = (id, name, inst, kind, extra = {}) => {
    inst = [].concat(inst);
    if (inst.some(i => i === undefined)) throw Error(`${id}: missing instance`);
    inst.forEach(i => used.add(i));
    parts.push({id, name, inst, kind, ...extra});
    return id;
  };
  // Like pick, but only instances no earlier part has taken (shared pools such as
  // Frame_Hardware hold hardware for several chapters).
  const free = (re, n) => {
    const out = pick(re).filter(i => !used.has(i));
    if (n !== undefined && out.length !== n) throw Error(`${re}: expected ${n} free instances, found ${out.length}`);
    return out;
  };
  const part = id => { const p = parts.find(q => q.id === id); if (!p) throw Error(`unknown part ${id}`); return p; };
  // Hardware gets one part per instance, so each piece can travel along its own axis.
  const each = (prefix, name, list, kind, extra = {}) => list.map((i, n) => add(`${prefix}-${n + 1}`, name, i, kind, typeof extra === 'function' ? extra(i) : extra));
  // Parent = the smallest listed host whose box holds the piece's centre.
  const hostOf = (i, hosts) => {
    const h = hosts.filter(([, j]) => inside(center(i), j)).sort((a, b) => volume(a[1]) - volume(b[1]))[0];
    if (!h) throw Error(`no host for instance ${i} ${I[i].name}`);
    return h[0];
  };

  // ---------- Frame ----------
  const EXT = 'HFSB5-2020';
  const ext = {
    'b-fr': [at(/Corner Extrusions.*B Extrusion/, [0, 0, -270]), 'B extrusion · 500 mm', 'front right post'],
    'b-rr': [at(/Corner Extrusions.*B Extrusion/, [0, 390, -270]), 'B extrusion · 500 mm', 'rear right post'],
    'b-rl': [at(/Corner Extrusions.*B Extrusion/, [-390, 390, -270]), 'B extrusion · 500 mm', 'rear left post'],
    'b-fl': [at(/Corner Extrusions.*B Extrusion/, [-390, 0, -270]), 'B extrusion · 500 mm', 'front left post'],
    'c': [pick(/Bottom Extrusions.*-C Extrusion/, 1)[0], 'C extrusion · 370 mm', 'lower back'],
    'a-bot-f': [at(/Bottom Extrusions.*-A Extrusion/, [-195, 0, -510]), 'A extrusion · 370 mm', 'bottom front'],
    'a-bot-l': [at(/Bottom Extrusions.*-A Extrusion/, [-390, 195, -510]), 'A extrusion · 370 mm', 'bottom left'],
    'a-bot-r': [at(/Bottom Extrusions.*-A Extrusion/, [0, 195, -510]), 'A extrusion · 370 mm', 'bottom right'],
    'h': [pick(/Rear Extrusion.*-H Extrusion/, 1)[0], 'H extrusion · 330 mm', 'rear vertical brace'],
    'a-y-l': [at(/Gantry_Frame.*-A Extrusion/, [-390, 195, -160]), 'A extrusion · 370 mm', 'left Y extrusion'],
    'a-y-r': [at(/Gantry_Frame.*-A Extrusion/, [0, 195, -160]), 'A extrusion · 370 mm', 'right Y extrusion'],
    'a-top-f': [at(/Top Extrusions.*-A Extrusion/, [-195, 0, -30]), 'A extrusion · 370 mm', 'top front'],
    'a-top-r': [at(/Top Extrusions.*-A Extrusion/, [0, 195, -30]), 'A extrusion · 370 mm', 'top right'],
    'a-top-b': [at(/Top Extrusions.*-A Extrusion/, [-195, 390, -30]), 'A extrusion · 370 mm', 'top rear'],
    'a-top-l': [at(/Top Extrusions.*-A Extrusion/, [-390, 195, -30]), 'A extrusion · 370 mm', 'top left']
  };
  if (new Set(Object.values(ext).map(e => e[0])).size !== 15) throw Error('two frame extrusions resolved to the same instance');
  for (const [id, [i, name, where]] of Object.entries(ext)) {
    if (!I[i].name.startsWith(EXT)) throw Error(`${id} is not an extrusion`);
    add(id, name, i, 'extrusion', {note: where});
  }
  // Blind-joint screws: every M5x16 BHCS of the frame and the Y extrusions sits in the end of
  // the extrusion that holds it. The bed frame's G screw belongs to a later chapter.
  const frameScrews = [...pick(/Frame_Hardware:1\/Screws:1\/M5x16 BHCS/, 18), ...pick(/Gantry_Frame_Screws:1\/M5x16 BHCS/, 4)];
  const extHosts = Object.entries(ext).map(([id, [i]]) => [id, i]);
  const gExt = pick(/Bed Extrusions.*G Extrusion/, 1)[0];
  const blind = frameScrews.filter(i => !inside(center(i), gExt));
  if (blind.length !== 21) throw Error(`expected 21 frame blind-joint screws, found ${blind.length}`);
  const blindIds = each('m5x16-frame', 'M5x16 BHCS', blind, 'bolt', i => ({parent: hostOf(i, extHosts)}));
  const screwsOf = host => blindIds.filter(id => parts.find(p => p.id === id).parent === host);

  // ---------- Front idlers (A = front right, B = front left) ----------
  const idler = {};
  for (const s of ['A', 'B']) {
    const base = `Front Idler ${s}:1`, P = re => new RegExp(base + '.*' + re);
    const k = s.toLowerCase(), id = x => `idler-${k}-${x}`;
    const housing = add(id('housing'), 'Idler housing', pick(P('idler_housing'), 1), 'primary');
    const carA = add(id('carrier-a'), 'Idler carrier A', pick(P('idler_carrier_a'), 1), 'accent');
    const carB = add(id('carrier-b'), 'Idler carrier B', pick(P('idler_carrier_b'), 1), 'accent');
    const front = add(id('front'), 'Idler front', pick(P('idler_front'), 1), 'accent');
    const instOf = pid => parts.find(p => p.id === pid).inst[0];
    const hosts = [[carB, instOf(carB)], [front, instOf(front)]];
    const inserts = each(id('insert'), 'M3 heat set insert', pick(P('M3 Heat Set'), 5), 'insert', i => ({parent: hostOf(i, hosts)}));
    // Bearing stack, top to bottom as on page 27: BHCS, shim, F695, F695, shim.
    const stack = [...pick(P('M5 1mm Spacer'), 2), ...pick(P('F695'), 2)].sort((a, b) => center(b)[2] - center(a)[2]);
    const stackIds = stack.map((i, n) => add(id(`stack-${n + 1}`), /Spacer/.test(I[i].name) ? 'M5 shim' : 'F695 bearing', i, /Spacer/.test(I[i].name) ? 'shim' : 'bearing', {parent: carA}));
    const axle = add(id('m5x16'), 'M5x16 BHCS', pick(P('M5x16 BHCS'), 1), 'bolt', {parent: carA});
    const m3x25 = each(id('m3x25'), 'M3x25 SHCS', pick(P('M3x25 SHCS'), 2), 'bolt', {parent: carA});
    const ptfe = each(id('ptfe'), 'PTFE tube 4×3 mm, 35 mm', pick(P('PTFE'), 2), 'ptfe', {parent: housing});
    const m3x40 = each(id('m3x40'), 'M3x40 SHCS', pick(P('M3x40 SHCS'), 2), 'bolt', {parent: housing});
    const m3x16 = add(id('m3x16'), 'M3x16 SHCS', pick(P('M3x16 SHCS'), 1), 'bolt', {parent: front});
    const washer = add(id('washer'), 'M3 washer', pick(P('M3 Washer'), 1), 'washer', {parent: front});
    const stop = add(id('m3x8'), 'M3x8 SHCS', pick(P('M3x8 SHCS'), 1), 'bolt', {parent: housing});
    idler[s] = {housing, carA, carB, front, inserts, stackIds, axle, m3x25, ptfe, m3x40, m3x16, washer, stop};
  }

  // ---------- A and B drives (A = rear right, B = rear left) ----------
  const drive = {};
  for (const s of ['A', 'B']) {
    const k = s.toLowerCase(), id = x => `drive-${k}-${x}`;
    const P = re => new RegExp(`${s}_Drive:1/.*` + re);
    const upper = add(id('upper'), `${k}_stepper_upper`, pick(P(`${s}_Drive_Printed:1/${k}_stepper_upper`), 1), 'primary');
    const lower = add(id('lower'), `${k}_stepper_lower`, pick(P(`${s}_Drive_Printed:1/${k}_stepper_lower`), 1), 'primary');
    const hosts = [[upper, parts.find(p => p.id === upper).inst[0]], [lower, parts.find(p => p.id === lower).inst[0]]];
    const hosted = i => ({parent: hostOf(i, hosts)});
    // The CAD's third M3 insert belongs to the Y endstop (a later chapter).
    const m3ins = each(id('m3-insert'), 'M3 heat set insert', pick(P('_Hardware:1/M3 Heat Set')).filter(i => inside(center(i), hosts[0][1])), 'insert', hosted);
    const m5ins = each(id('m5-insert'), 'M5 heat set insert', pick(P('_Hardware:1/M5 Heat Set'), 2), 'insert', hosted);
    const locate = each(id('m3x8'), 'M3x8 SHCS', pick(P('_Hardware:1/M3x8 SHCS'), 2), 'bolt', hosted);
    const shafts = each(id('m5x30'), 'M5x30 BHCS', pick(P('_Hardware:1/M5x30 BHCS'), 2), 'bolt', {parent: upper});
    const stackInst = pick(P('_Motion:1/Bearing_Stack'), 16);
    const stack = stackInst.map((i, n) => add(id(`stack-${n + 1}`), /Spacer/.test(I[i].name) ? 'M5 shim' : 'F695 bearing', i, /Spacer/.test(I[i].name) ? 'shim' : 'bearing', {parent: upper}));
    const motor = add(id('motor'), 'NEMA 17 stepper motor', pick(P('_Motion:1/NEMA17 Motor'), 2), 'motor');
    const pulleyInst = pick(P('_Motion:1/GT2 20T Pulley'), 3).sort((a, b) => volume(b) - volume(a));
    const pulley = add(id('pulley'), 'GT2 20T pulley', pulleyInst[0], 'motion', {parent: motor});
    const grubs = each(id('grub'), 'Grub screw', pulleyInst.slice(1), 'bolt', {parent: pulley});
    // The motor screws pass through the mount into the motor: they ride on the upper half, so
    // they don't travel through the mount while the motor comes up.
    const m3x30 = each(id('m3x30'), 'M3x30 SHCS', pick(P('_Hardware:1/M3x30 SHCS'), 4), 'bolt', {parent: upper});
    drive[s] = {upper, lower, m3ins, m5ins, locate, shafts, stack, stackInst, motor, pulley, grubs, m3x30};
  }

  // ---------- steps ----------
  const auto = (ids, phase = 0, gap = 0.08, start = 0) => ids.map((id, n) => ({id, vec: 'auto', phase, delay: start + n * gap}));
  const move = (ids, vec, phase = 0, gap = 0.1, start = 0) => [].concat(ids).map((id, n) => ({id, vec, phase, delay: start + n * gap}));
  const BLIND = {kind: 'tip', title: 'Blind joint basics', text: 'The head of the BHCS slides into the channel of the other extrusion and is tightened through a small access hole. Watch the linked guide if you have never built one.', link: 'https://voron.link/onjwmcd'};
  const INSERTS = {kind: 'tip', title: 'Heat set inserts', text: 'This design relies heavily on heat set inserts. Check the hardware reference and the BOM for the right size, and watch the linked guide if they are new to you.', link: 'https://voron.link/m5ybt4d'};
  const GRUB = {kind: 'warn', title: 'Grub screw – aka the root of all issues', text: 'Insert both grub screws and apply threadlocker to each one. Use a high-quality hex driver; ball-end drivers are not recommended. Loose grub screws account for the majority of issues users report. Keep threadlocker away from printed parts.', link: 'https://voron.link/fx10m8e'};
  const ORIENT = {kind: 'warn', title: 'Motor orientation', text: 'Pay attention to the orientation of the cable exit. Once assembled, the motor wires point away from each other, toward the outside of the printer.'};
  const UPSIDE = {kind: 'tip', title: 'Upside down assembly', text: 'For ease of assembly, build the A and B drives upside down. The view here is from below.'};
  const LOCATE = {kind: 'tip', title: 'Locating screw', text: 'This screw aligns the upper and lower half of the motor mount.'};
  const FLUSH = {kind: 'warn', title: 'Flush matters', text: 'Each M5 heat set insert must end up exactly flush with the surface and square to it. Even a slight tilt will misalign the bearing stacks.'};

  // Bearing stacks enter from below in the order they sit, lowest piece furthest out.
  const stackMovers = (d, phase) => {
    const order = d.stack.map((pid, n) => [pid, center(d.stackInst[n])[2]]).sort((a, b) => b[1] - a[1]);
    return order.map(([pid], n) => ({id: pid, vec: [0, 0, -(22 + (n >> 1) * 7)], phase, delay: (n >> 1) * 0.05}));
  };

  const driveSteps = s => {
    const d = drive[s], k = s.toLowerCase(), first = s === 'A' ? 34 : 41, side = s === 'A' ? 'rear right' : 'rear left';
    const pulleyH = s === 'A' ? '17.5' : '7.5';
    return [
      {
        id: `${k}-drive-prep`, section: `${s} Drive`, title: 'Inserts and locating screws', pages: [first, first + 1],
        // The halves sit apart on the bench, so each locating screw enters only its own half.
        bench: [d.upper, d.lower], shift: {ids: [d.lower], vec: [0, 70, -40]}, view: {az: 35, el: 20},
        movers: [...auto(d.m3ins, 0, 0.12), ...auto(d.m5ins, 0, 0.12, 0.3), ...auto(d.locate, 1, 0.15)],
        text: [`Press 2 M3 heat set inserts into ${k}_stepper_upper and 2 M5 heat set inserts into ${k}_stepper_lower, the bores either side of the motor opening.`, `Fit one M3x8 SHCS into each half as a locating screw.`],
        notes: [LOCATE, FLUSH]
      },
      {
        id: `${k}-drive-shafts`, section: `${s} Drive`, title: 'Bearing shafts', pages: [first + 2],
        bench: [d.upper], view: {az: 35, el: -32},
        movers: auto(d.shafts, 0, 0.15),
        text: [`Push 2 M5x30 BHCS through the bearing bores of ${k}_stepper_upper. They become the shafts for the bearing stacks.`],
        notes: [UPSIDE]
      },
      {
        id: `${k}-drive-stacks`, section: `${s} Drive`, title: 'Bearing stacks', pages: [first + 3],
        bench: [d.upper], view: {az: 35, el: -28},
        movers: [...stackMovers(d, 0), {id: d.lower, vec: [0, 0, -95], phase: 1, delay: 0}],
        text: ['Build a bearing stack on each shaft: M5 shim, two F695 bearings, two M5 shims, two F695 bearings, M5 shim.', `Close the stacks with ${k}_stepper_lower and tighten the M5x30s into its inserts.`],
        notes: [UPSIDE]
      },
      {
        id: `${k}-drive-pulley`, section: `${s} Drive`, title: 'Pulley on the motor', pages: [first + 4],
        bench: [d.motor], view: {az: 40, el: 16},
        movers: [{id: d.pulley, vec: [0, 0, 45], phase: 0, delay: 0}, ...auto(d.grubs, 1, 0.15)],
        text: [`Slide the GT2 20 tooth pulley onto the stepper shaft and set it ${pulleyH} mm above the motor face with the printed “${s}” alignment tool.`, 'Fix the tool to the motor with an M3x30 SHCS while you set the pulley.'],
        notes: [GRUB, {kind: 'tip', title: 'Lock it down', text: 'For proper alignment, use an M3x30 SHCS to attach the alignment tool to the stepper motor.'}],
        extras: [{name: `BA pulley alignment tool (“${s}” side)`, qty: 1, kind: 'tool'}]
      },
      {
        id: `${k}-drive-motor`, section: `${s} Drive`, title: 'Mount the motor', pages: [first + 5, first + 6],
        bench: [d.upper, d.lower], view: {az: 40, el: -22},
        movers: [{id: d.motor, vec: [0, 0, -110], phase: 0, delay: 0}, ...auto(d.m3x30, 1, 0.1)],
        text: [`Offer the motor up to the ${s} drive and fix it with 4 M3x30 SHCS.`, `The ${s} drive goes to the ${side} of the printer.`],
        notes: [ORIENT, {kind: 'check', title: 'Check your work', text: 'Compare your drive with the drawing. The pulley teeth must line up with the bearing stacks.'}]
      }
    ];
  };

  const A = idler.A, B = idler.B;
  const both = x => [].concat(A[x], B[x]);
  // The B idler sits 370 mm from the A idler in the CAD; on the bench it moves next to it.
  const SIDE_BY_SIDE = {ids: [B.housing, B.carA, B.carB, B.front], vec: [300, 0, 0]};
  const steps = [
    // Frame
    {
      id: 'frame-prepare', section: 'Frame', title: 'Prepare the extrusions', pages: [13, 16],
      bench: ['c', 'h', 'a-bot-f', 'a-bot-l', 'a-bot-r', 'a-y-l', 'a-y-r', 'a-top-f', 'a-top-r', 'a-top-b', 'a-top-l'], view: {az: 38, el: 24},
      movers: auto(blindIds, 0, 0.04),
      text: ['Sort your extrusions by length: 4 B (500 mm), 9 A (370 mm), C (370 mm) and H (330 mm) are used in this chapter.', 'Thread an M5x16 BHCS into both ends of every A extrusion and of the C extrusion, and into the lower end of the H extrusion. Leave the heads standing proud for the blind joints.'],
      notes: [
        {kind: 'tip', title: 'Lower back extrusion', text: 'The C extrusion marks the lower back of the printer throughout the manual.'},
        {kind: 'tip', title: 'Build size dependent', text: 'Lengths shown are for a 250 Trident. Add 50/100 mm to the A, C, D, E, F and G extrusions for a 300/350.'}
      ]
    },
    {
      id: 'frame-corner', section: 'Frame', title: 'First corner', pages: [17],
      view: {az: -140, el: 22},
      movers: [...move(['c', 'a-bot-l'], [0, 0, 60], 0, 0.15), {id: 'b-rl', vec: [0, 0, 320], phase: 1, delay: 0}],
      text: ['Lay the C extrusion (back) and an A extrusion (left side) on a flat surface.', 'Slide a B extrusion down over both screw heads. These are your first blind joints.'],
      notes: [{kind: 'tip', title: 'Build on a flat surface', text: 'Build the frame on a glass or granite surface so you can get it as square as possible.'}, BLIND,
        {kind: 'warn', title: 'Mind access hole position', text: 'If in doubt, check the CAD model. It might save you considerable time down the road.'}]
    },
    {
      id: 'frame-brace', section: 'Frame', title: 'Rear vertical brace', pages: [18],
      view: {az: -150, el: 20},
      movers: [{id: 'h', vec: [0, 0, 200], phase: 0, delay: 0}],
      text: ['Fit the H extrusion upright on the C extrusion, 175 mm from the corner post.'],
      notes: [{kind: 'tip', title: 'Other frame sizes', text: 'The distance is for a 250 frame. Add 25 mm for a 300 or 50 mm for a 350.'}]
    },
    {
      id: 'frame-bottom', section: 'Frame', title: 'Close the bottom frame', pages: [18],
      view: {az: 38, el: 22},
      movers: [...move(['a-bot-f', 'a-bot-r'], [0, 0, 60], 0, 0.15), ...move(['b-fl', 'b-fr', 'b-rr'], [0, 0, 320], 1, 0.15)],
      text: ['Add the front and right bottom A extrusions, then slide the three remaining B extrusions over the screw heads at the other corners.']
    },
    {
      id: 'frame-y-left', section: 'Frame', title: 'First Y extrusion', pages: [19],
      view: {az: 52, el: 18},
      movers: [{id: 'a-y-l', vec: [0, 0, 260], phase: 0, delay: 0}],
      text: ['Slide an A extrusion down between the left posts. This is the first Y extrusion. A spacer underneath holds it at height for now.'],
      notes: [{kind: 'warn', title: 'Snug, not tight', text: 'Don’t fully tighten these screws yet. Alignment happens in a later step, and you’ll need some play to adjust.'}]
    },
    {
      id: 'frame-y-right', section: 'Frame', title: 'Second Y extrusion', pages: [20],
      view: {az: 38, el: 18},
      movers: [{id: 'a-y-r', vec: [0, 0, 260], phase: 0, delay: 0}],
      text: ['Remove the spacer and repeat on the right side.'],
      notes: [{kind: 'tip', title: 'Rinse and repeat', text: 'Same steps as the left Y extrusion.'}]
    },
    {
      id: 'frame-top', section: 'Frame', title: 'Top frame', pages: [21],
      view: {az: 38, el: 26},
      movers: move(['a-top-f', 'a-top-r', 'a-top-b', 'a-top-l'], [0, 0, 140], 0, 0.15),
      text: ['Lower the four top A extrusions onto the posts to close the cube.']
    },
    {
      id: 'frame-square', section: 'Frame', title: 'Set the Y extrusions and square the frame', pages: [22, 23],
      view: {az: 30, el: 14}, focus: ['a-y-l', 'a-y-r', 'a-top-l', 'a-top-r'], movers: [],
      text: ['Use the two printed 110 mm spacer tools between the top frame and each Y extrusion to set them parallel and at the correct height. Repeat for both sides.', 'Then tighten every blind joint.'],
      notes: [
        {kind: 'tip', title: 'Finding the right position', text: 'The spacers must sit at a 90° angle, free of any rotation or twist, with their outside faces flush.'},
        {kind: 'check', title: 'Check for squareness', text: 'Verify the angle of every corner and measure the diagonals. The second half of the linked video shows how.', link: 'https://voron.link/kdtpzam'}
      ],
      extras: [{name: '110 mm Y alignment spacer (printed tool)', qty: 2, kind: 'tool'}]
    },

    // Front idlers
    {
      id: 'idler-inserts', section: 'Front Idlers', shift: SIDE_BY_SIDE, title: 'Heat set inserts', pages: [26],
      bench: both('carB').concat(both('front')), view: {az: 28, el: 18},
      movers: auto(both('inserts'), 0, 0.1),
      text: ['Press 3 M3 heat set inserts into each idler carrier B (two in the front, one in the back) and 2 into each idler front.', 'Do this for both front idlers.'],
      notes: [{kind: 'tip', title: 'Twice the fun', text: 'The next steps need to be done for both the identical B and A front idlers.'}, INSERTS,
        {kind: 'tip', title: 'Accent part?', text: 'The red VORON heart next to a part in the manual marks an accent part. Here: the idler carriers and fronts.'}]
    },
    {
      id: 'idler-stacks', section: 'Front Idlers', shift: SIDE_BY_SIDE, title: 'Idler bearing stacks', pages: [27],
      bench: both('carA'), view: {az: 30, el: 22},
      movers: [...[A, B].flatMap(d => d.stackIds.map((id, n) => ({id, vec: [0, 0, 18 + (3 - n) * 8], phase: 0, delay: n * 0.05}))), ...[A, B].map(d => ({id: d.axle, vec: 'auto', phase: 1, delay: 0}))],
      text: ['Stack an M5 shim, two F695 bearings and a second M5 shim in idler carrier A, and hold them with an M5x16 BHCS.'],
      notes: [{kind: 'tip', title: 'Pin it instead!', text: 'A 5×18 mm pin can be used instead of the M5x16 BHCS.'}]
    },
    {
      id: 'idler-carriage', section: 'Front Idlers', shift: SIDE_BY_SIDE, title: 'Close the carriage', pages: [28],
      bench: both('carA'), view: {az: 30, el: 22},
      movers: [...move([A.carB, B.carB], [0, -45, 0]), ...auto(both('m3x25'), 1, 0.1)],
      text: ['Close each carriage with idler carrier B and two M3x25 SHCS.']
    },
    {
      id: 'idler-housing', section: 'Front Idlers', shift: SIDE_BY_SIDE, title: 'Into the idler housing', pages: [29],
      bench: both('carA').concat(both('carB')), view: {az: 30, el: 22},
      movers: [...move([A.housing, B.housing], [0, 70, 0]), ...move(both('ptfe'), [0, -55, 0], 1, 0.08), ...auto(both('m3x40'), 2, 0.1)],
      text: ['Slide the carriage into the idler housing. Insert two 35 mm PTFE tubes and two M3x40 SHCS. The carriage rides on them.'],
      notes: [{kind: 'tip', title: 'PTFE tube', text: 'Use PTFE tube with 4 mm outer and 3 mm inner diameter. Cut it to 35 mm with the cutting tool.'}],
      extras: [{name: 'PTFE cutting jig, 35 mm (printed tool)', qty: 1, kind: 'tool'}]
    },
    {
      id: 'idler-front', section: 'Front Idlers', shift: SIDE_BY_SIDE, title: 'Idler front and tension screw', pages: [30],
      bench: both('housing'), view: {az: 24, el: 16},
      movers: [...move([A.front, B.front], [0, -45, 0]), ...auto([A.m3x16, B.m3x16], 1, 0.12), {id: A.washer, vec: 'auto-of:' + A.m3x16, phase: 1, delay: 0}, {id: B.washer, vec: 'auto-of:' + B.m3x16, phase: 1, delay: 0.12}],
      text: ['Fit the idler front. The two M3x40 SHCS thread into its inserts.', 'Add the M3x16 SHCS with an M3 washer in the centre. This is the belt tension screw.'],
      notes: [{kind: 'tip', title: 'Don’t forget to wash(er)', text: 'The washer keeps the screw head from deforming the plastic under tension.'}]
    },
    {
      id: 'idler-a-stop', section: 'Front Idlers', title: 'A idler rail stop', pages: [31],
      bench: [A.housing], view: {az: 40, el: 14},
      movers: auto([A.stop]),
      text: ['Fit an M3x8 SHCS in the lower front of the A idler housing. It is the rail stop.'],
      notes: [{kind: 'warn', title: 'Attention to detail', text: 'The rail stop screw is in a different location on the A and B idlers.'}]
    },
    {
      id: 'idler-b-stop', section: 'Front Idlers', title: 'B idler rail stop', pages: [32, 33],
      bench: [B.housing], view: {az: 40, el: 14},
      movers: auto([B.stop]),
      text: ['Fit an M3x8 SHCS in the side of the B idler housing.'],
      notes: [{kind: 'warn', title: 'Attention to detail', text: 'The rail stop screw is in a different location on the A and B idlers.'},
        {kind: 'check', title: 'Check your work', text: 'Compare both idlers with the drawing, and check that each carrier moves freely without binding.'}]
    },

    ...driveSteps('A'),
    ...driveSteps('B')
  ];

  const kinds = {
    extrusion: 'Extrusions', primary: 'Printed, primary colour', accent: 'Printed, accent colour ([a] files)',
    motor: 'Motors', motion: 'Pulleys', bearing: 'Bearings', shim: 'Shims', bolt: 'Screws', washer: 'Washers',
    insert: 'Heat set inserts', ptfe: 'PTFE tube', tool: 'Printed tools',
    rail: 'Linear rails', leadscrew: 'Lead screws', belt: 'Belts', tnut: 'T-nuts', nut: 'Nuts',
    chain: 'Cable chains', toolhead: 'Toolhead', bed: 'Print bed', electronics: 'Electronics',
    fan: 'Fans', panel: 'Panels', glass: 'Clear panels', misc: 'Other'
  };

  const ctx = {
    asm, I, pick, free, at, center, inside, volume, dist, add, each, hostOf, part, parts, kinds,
    auto, move, notes: {BLIND, INSERTS, GRUB, ORIENT, UPSIDE, LOCATE, FLUSH},
    ext, blindIds, idler, drive, SIDE_BY_SIDE
  };
  const dir = path.join(__dirname, 'chapters');
  const only = process.env.CHAPTERS ? process.env.CHAPTERS.split(',') : null;
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /^\d\d-.*\.cjs$/.test(f)).sort() : [];
  // Chapters as in the manual's table of contents; the step grid shows one chapter at a time.
  const CHAPTERS = {'03': 'Y Axis', '04': 'Z Axis', '05': 'X Axis', '06': 'Belts', '07': 'Print Bed', '08': 'Stealthburner',
    '09': 'Wiring Preparation', '10': 'Electronics', '11': 'Controller Preparation', '12': 'Wiring', '13': 'Skirts', '14': 'Panels & Finishing Touches'};
  steps.forEach(s => { s.chapter = s.section === 'Frame' ? 'Frame' : 'A/B Drive and Idler'; });
  for (const f of files) {
    if (only && !only.some(o => f.startsWith(o))) continue;
    const chapter = CHAPTERS[f.slice(0, 2)];
    if (!chapter) throw Error(`${f}: no chapter title for ${f.slice(0, 2)}`);
    steps.push(...require(path.join(dir, f))(ctx).map(s => ({chapter, ...s})));
  }
  if (!files.length) steps.push(
    {
      id: 'pilot-end', chapter: 'A/B Drive and Idler', section: 'A/B Drive and Idler', title: 'Where they go next', pages: [25],
      view: {az: 30, el: 28}, movers: [],
      text: ['The frame is square, and both drives and front idlers are built. In the Y Axis chapter they go on the frame: B drive rear left, A drive rear right, B idler front left, A idler front right.', 'More chapters are on the way.']
    }
  );
  return {parts, steps, kinds};
};
