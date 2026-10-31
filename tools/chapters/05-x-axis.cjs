// X Axis (manual pp. 118–140): part preparation, both XY joints, the X extrusion with its
// MGN12 rail, the gantry onto the Y carriages, the XY cable bridge and squaring.
// The X carriage halves and the probe bracket get their inserts here (p.120); the Belts
// chapter (06) mounts them, so their ids are part of this module's interface:
//   x-car-left, x-car-right, x-probe-bracket.
module.exports = ctx => {
  const {I, pick, free, at, center, inside, add, each, hostOf, part, auto, move, notes} = ctx;
  const inst = id => part(id).inst[0];
  const X = 'Gantry:1/X Axis:1/';
  const R = s => new RegExp(X.replace(/\//g, '\\/') + s);

  // ---------- XY joints ----------
  const joint = {};
  for (const S of ['Left', 'Right']) {
    const s = S.toLowerCase(), k = s[0], id = x => `xy${k}-${x}`;
    const P = re => R(`XY Joint - ${S}:1\\/.*` + re);
    const lower = add(id('lower'), `XY ${s} lower`, pick(P(`Printed:1/xy_${s}_lower`), 1), 'primary');
    const upper = add(id('upper'), `XY ${s} upper`, pick(P(`Printed:1/xy_${s}_upper`), 1), 'primary', {parent: lower});
    const accent = add(id('accent'), `XY ${s}`, pick(P(`Printed:1/\\[a\\]_xy_${s}:`), 1), 'accent', {parent: lower});
    const on = {parent: lower};
    // Inserts: 5 M3 and 2 M5 in the underside of the lower half. The right joint's other
    // M3 inserts belong to the cable bridge (z ≈ −104) and the D2F endstop accent variant.
    const m3ins = each(id('m3-insert'), 'M3 heat set insert', pick(P('Hardware:1/M3 Heat Set')).filter(i => Math.abs(center(i)[2] + 183) < 1.5), 'insert', on);
    if (m3ins.length !== 5) throw Error(`${S} XY joint: expected 5 M3 inserts, found ${m3ins.length}`);
    const m5ins = each(id('m5-insert'), 'M5 heat set insert', pick(P('Hardware:1/M5 Heat Set'), 2), 'insert', on);
    const locate = add(id('m3x8'), 'M3x8 SHCS', pick(P('Hardware:1/M3x8 SHCS'), 1), 'bolt', on);
    const stackInst = pick(P('Bearing_Stack'), 4).sort((a, b) => center(a)[2] - center(b)[2]); // bottom first
    const stack = stackInst.map((i, n) => add(id(`stack-${n + 1}`), /Spacer/.test(I[i].name) ? 'M5 shim' : 'F695 bearing', i, /Spacer/.test(I[i].name) ? 'shim' : 'bearing', on));
    // The CAD carries a generic and a Gates idler in the same place; the generic one is drawn.
    const idlerInst = pick(P('Motion:1/GT2 20T Idler(?! Gates)[^/]*$'), 3);
    const idler = add(id('idler'), 'GT2 20T idler', idlerInst, 'motion', on);
    const m5x40 = pick(P('Hardware:1/M5x40 BHCS'), 2);
    const sc = center(stackInst[0]);
    m5x40.sort((a, b) => ctx.dist(center(a), sc) - ctx.dist(center(b), sc));
    const shaft = add(id('m5x40-stack'), 'M5x40 BHCS', m5x40[0], 'bolt', on);
    const axle = add(id('m5x40-idler'), 'M5x40 BHCS', m5x40[1], 'bolt', on);
    const m3x40 = each(id('m3x40'), 'M3x40 SHCS', pick(P('Hardware:1/M3x40 SHCS'), 2), 'bolt', on);
    const m3x6 = each(id('m3x6'), 'M3x6 BHCS', pick(P('Hardware:1/M3x6 BHCS')).filter(i => center(i)[2] > -190), 'bolt', {parent: accent});
    if (m3x6.length !== 3) throw Error(`${S} XY joint: expected 3 M3x6 BHCS`);
    // Joint to Y carriage: the CAD names the left ones M3x16, the right ones M3x12; both are
    // the same 12 mm screw in the CAD geometry, and the manual (p.138) says M3x12 SHCS.
    const carScrews = each(id('m3x12'), 'M3x12 SHCS', pick(P(`Hardware:1/${S === 'Left' ? 'M3x16' : 'M3x12'} SHCS`), 4), 'bolt', on);
    const m5x16 = pick(P('Hardware:1/M5x16 BHCS'));
    const bottom = add(id('m5x16'), 'M5x16 BHCS', m5x16.filter(i => center(i)[2] < -170), 'bolt', on);
    joint[S] = {lower, upper, accent, m3ins, m5ins, locate, stack, idler, shaft, axle, m3x40, m3x6, carScrews, bottom};
    if (S === 'Left') joint[S].top = each(id('m5x10'), 'M5x10 BHCS', pick(P('Hardware:1/M5x10 BHCS'), 2), 'bolt', on);
    else joint[S].top = m5x16.filter(i => center(i)[2] > -150); // the cable bridge screws, below
    // The Y rail carriages (MGN9H) sit in this subtree. The Y Axis chapter may already have
    // taken them with the Y rails; if not, they appear (without moving) when the gantry lands.
    joint[S].ycar = free(P('MGN9H'));
  }
  const L = joint.Left, Rt = joint.Right;

  // Cable bridge (generic 3-hole chain pattern, as drawn on p.139) and its inserts.
  const bridge = add('x-bridge', 'Cable bridge (3-hole)', pick(R('XY Joint - Right:1/.*\\[a\\]_cable_bridge_3hole'), 1), 'accent');
  const igusInsert = at(R('XY Joint - Right:1/.*Hardware:1/M3 Heat Set'), [0, 217, -104]);
  const bridgeIns = each('x-bridge-insert', 'M3 heat set insert', pick(R('XY Joint - Right:1/.*Hardware:1/M3 Heat Set')).filter(i => center(i)[2] > -110 && i !== igusInsert), 'insert', {parent: bridge});
  if (bridgeIns.length !== 3) throw Error('cable bridge: expected 3 inserts');
  const bridgeScrews = each('x-bridge-m5x16', 'M5x16 BHCS', Rt.top, 'bolt', {parent: bridge});

  // ---------- X carriage halves and probe bracket (inserts only; mounted in chapter 06) ----------
  const C = re => R('Toolhead_Assembly:1/X_Carriage:1/.*' + re);
  const carL = add('x-car-left', 'X carriage frame left', pick(C('x_carriage_frame_left'), 1), 'primary');
  const carR = add('x-car-right', 'X carriage frame right', pick(C('x_carriage_frame_right'), 1), 'primary');
  const bracket = add('x-probe-bracket', 'Probe bracket', pick(C('probe_bracket'), 1), 'primary');
  const carHosts = [[carL, inst(carL)], [carR, inst(carR)], [bracket, inst(bracket)]];
  const carIns = each('x-car-insert', 'M3 heat set insert', pick(C('M3 Heat Set'), 8), 'insert', i => ({parent: hostOf(i, carHosts)}));

  // ---------- X extrusion, T-nuts, MGN12 rail ----------
  const xExt = add('x-ext', 'X extrusion · 330 mm', pick(R('HFSB5-20-330'), 1), 'extrusion', {note: 'gantry (the manual’s E extrusion)'});
  const xe = inst(xExt);
  const onExt = (re, n) => {
    const out = free(new RegExp('Gantry_Frame_Tnuts:1/2020 Drop-in T-nut, ' + re)).filter(i => inside(center(i), xe, 1));
    return out;
  };
  const m5Nuts = onExt('M5');
  if (m5Nuts.length !== 6) throw Error(`X extrusion: expected 6 M5 T-nuts, found ${m5Nuts.length}`);
  // Six M3 T-nuts in the front slot for the rail; the extra M3 T-nut on top (x ≈ −76) is
  // not on p.134 (likely the X cable chain), so it is left for a later chapter.
  const m3Nuts = onExt('M3').filter(i => center(i)[1] < 207);
  if (m3Nuts.length !== 6) throw Error(`X extrusion: expected 6 M3 rail T-nuts, found ${m3Nuts.length}`);
  const m5NutIds = each('x-m5-tnut', 'M5 T-nut', m5Nuts.sort((a, b) => center(a)[0] - center(b)[0]), 'tnut', {parent: xExt});
  const m3NutIds = each('x-m3-tnut', 'M3 T-nut', m3Nuts.sort((a, b) => center(a)[0] - center(b)[0]), 'tnut', {parent: xExt});
  const rail = add('x-rail', 'MGN12 rail', pick(R('MGN12 rail:1/=>'), 1), 'rail', {parent: xExt});
  const block = add('x-rail-carriage', 'MGN12H carriage', pick(R('MGN12 rail:1/MGN12H:1/'), 9), 'rail', {parent: rail});
  const railScrews = free(/Gantry_Frame_Screws:1\/M3x8 SHCS/).filter(i => inside(center(i), xe, 4));
  if (railScrews.length !== 6) throw Error(`X rail: expected 6 M3x8 SHCS, found ${railScrews.length}`);
  const railScrewIds = each('x-rail-m3x8', 'M3x8 SHCS', railScrews.sort((a, b) => center(a)[0] - center(b)[0]), 'bolt', {parent: rail});

  // Y carriages, if still free: shown on their rails (frame Y extrusions) from the gantry step.
  const ycar = [];
  if (L.ycar.length) ycar.push(add('x-ycar-left', 'MGN9H carriage (Y rail)', L.ycar, 'rail', {parent: 'a-y-l'}));
  if (Rt.ycar.length) ycar.push(add('x-ycar-right', 'MGN9H carriage (Y rail)', Rt.ycar, 'rail', {parent: 'a-y-r'}));

  // ---------- steps ----------
  const S = 'X Axis';
  const LOCATING = {kind: 'tip', title: 'Locating screw', text: 'This screw is used to align the upper and lower half of the XY joint.'};
  const LOOSEY = {kind: 'warn', title: 'Loosey goosey', text: 'The M5x40 screw should be snug but not tight - the idler must spin freely.'};
  const CHECK = {kind: 'check', title: 'Check your work', text: 'Compare your assembled part to the graphic shown here.'};
  const LOOSE = {kind: 'warn', title: 'Leave loose', text: 'Lightly tighten the screws.'};
  const stackIn = (j, phase) => j.stack.map((pid, n) => ({id: pid, vec: [0, 0, 20 + n * 7], phase, delay: n * 0.06}));
  const jointSteps = (j, S2, p) => {
    const side = S2.toLowerCase();
    return [
      {
        id: `x-xy${side[0]}-locate`, section: `${S2} XY Joint`, title: 'Locating screw', pages: [p[0]],
        bench: [j.lower], view: {az: -55, el: 35},
        // The manual fits the screw into the upturned upper half (pp.123/129). In the CAD its
        // head sits in a pocket of the lower half and its shank stands up into the upper half,
        // so on the upright model it drops in from above.
        movers: [{id: j.locate, vec: [0, 0, 40], phase: 0, delay: 0}],
        text: [`Turn the ${side} XY joint upper half (xy_${side}_upper) upside down and fit an M3x8 SHCS into it as the locating screw.`, `The model stays upright and shows the screw where it ends up: its head sits in the lower half (xy_${side}_lower).`],
        notes: S2 === 'Right' ? [{kind: 'tip', title: 'Cable path', text: 'The printed parts for the right XY joint have a small channel to guide the endstop wires.'}, LOCATING] : [LOCATING]
      },
      {
        id: `x-xy${side[0]}-stack`, section: `${S2} XY Joint`, title: 'Bearing stack', pages: [p[1]],
        bench: [j.lower], view: {az: -55, el: 30},
        movers: stackIn(j, 0),
        text: ['Insert an M5x40 BHCS through the upper half from the top, then flip the upper half over.', 'Slide the bearing stack onto the screw: M5 shim, two F695 bearings, M5 shim. The model shows the stack where it ends up, on the lower half.'],
        notes: S2 === 'Right' ? [{kind: 'tip', title: 'Flip it over', text: 'Insert the M5x40 screw, then flip the part over to install the bearing stack.'}] : []
      },
      {
        id: `x-xy${side[0]}-upper`, section: `${S2} XY Joint`, title: 'Upper half and idler', pages: [p[2]],
        bench: [j.lower], view: {az: -55, el: 30},
        // The upper half arrives with the bearing-stack M5x40 already through it (pp.124/130).
        movers: [{id: j.upper, vec: [0, 0, 60], phase: 0, delay: 0}, {id: j.shaft, vec: [0, 0, 60], phase: 0, delay: 0}, {id: j.idler, vec: [0, -50, 0], phase: 1, delay: 0}, {id: j.axle, vec: [0, 0, 70], phase: 2, delay: 0}],
        text: [`Set the lower half (xy_${side}_lower) onto the upturned upper half, over the bearing stack, then turn the joint so the upper half faces up. On the upright model the upper half, with its M5x40 BHCS, closes from above.`, 'Slide in the GT2 20 tooth idler and hold it with the second M5x40 BHCS.'],
        notes: S2 === 'Right' ? [LOOSEY, {kind: 'tip', title: 'Mind the orientation', text: 'We are back to working with the upper half facing upwards.'}] : [LOOSEY]
      },
      {
        id: `x-xy${side[0]}-accent`, section: `${S2} XY Joint`, title: 'Accent part', pages: S2 === 'Right' ? [p[3], p[4]] : [p[3]],
        bench: [j.lower], view: {az: -55, el: 30},
        movers: [...auto(j.m3x40, 0, 0.15), {id: j.accent, vec: [0, 0, -50], phase: 1, delay: 0}],
        text: ['Fit 2 M3x40 SHCS from the top through both halves.', `Add the ${side} XY joint accent part ([a]_xy_${side}) underneath.`],
        notes: S2 === 'Right' ? [{kind: 'tip', title: 'Right XY joint accent parts', text: 'The right XY joint has multiple accent parts. Pick the one that matches your setup. The rest of the manual shows only the "plain" accent part.'},
          {kind: 'tip', title: 'Plain accent part', text: 'Use this XY joint accent part when running endstops on the X carriage and A motor mount, or when using sensorless homing.'},
          {kind: 'tip', title: 'XY endstop PCB', text: 'Use the XY joint accent part for the endstop PCB when running an endstop PCB. It takes 2 M3 heat set inserts.'}] : []
      },
      {
        id: `x-xy${side[0]}-close`, section: `${S2} XY Joint`, title: 'Fasten the accent part', pages: [S2 === 'Right' ? p[5] : p[4]],
        bench: [j.lower], view: {az: -55, el: -35},
        movers: auto(j.m3x6, 0, 0.12),
        text: ['Fasten the accent part with 3 M3x6 BHCS from below.'],
        notes: [CHECK]
      }
    ];
  };

  const allNuts = [...m5NutIds, ...m3NutIds];
  return [
    {
      id: 'x-prep-carriage', section: S, title: 'Inserts: X carriage and probe bracket', pages: [119, 120],
      // The probe bracket sits behind the carriage in the CAD; set it out in front to be seen.
      bench: [carL, carR, bracket], shift: {ids: [bracket], vec: [0, -50, -45]}, view: {az: -60, el: 22},
      movers: auto(carIns, 0, 0.1),
      text: ['The X axis is made of the left and right XY joints, the X linear rail and the X carriage.', 'Press 2 M3 heat set inserts into the probe bracket and 2 into the front of each X carriage half.', 'Press 2 more into the side of the right X carriage half.'],
      notes: [notes.INSERTS]
    },
    {
      id: 'x-prep-bridge', section: S, title: 'Inserts: cable bridge', pages: [121],
      bench: [bridge], view: {az: -60, el: 40},
      movers: auto(bridgeIns, 0, 0.12),
      text: ['Press 3 M3 heat set inserts into the top of the cable bridge.'],
      notes: [{kind: 'tip', title: 'Which to choose?', text: 'Pick the style that matches the mounting pattern of your cable chains.'},
        {kind: 'tip', title: 'Generic cable chains', text: 'The 3 hole pattern is usually found on generic cable chains.'},
        {kind: 'tip', title: 'IGUS cable chains', text: 'IGUS chains have 2 mounting holes.'}]
    },
    {
      id: 'x-prep-joints', section: S, title: 'Inserts: XY joints', pages: [122],
      bench: [L.lower, Rt.lower], shift: {ids: [Rt.lower], vec: [-280, 0, 0]}, view: {az: -60, el: -40},
      movers: [...auto([...L.m5ins, ...Rt.m5ins], 0, 0.1), ...auto([...L.m3ins, ...Rt.m3ins], 1, 0.06)],
      text: ['Press 2 M5 heat set inserts and 5 M3 heat set inserts into the underside of each XY joint lower half.']
    },
    ...jointSteps(Rt, 'Right', [123, 124, 125, 126, 127, 128]),
    ...jointSteps(L, 'Left', [129, 130, 131, 132, 133]),
    {
      id: 'x-tnuts', section: S, title: 'T-nuts in the X extrusion', pages: [134],
      bench: [xExt], view: {az: -65, el: 25},
      // Top-slot M5 T-nuts drop in from above, bottom-slot ones from below.
      movers: [...m5NutIds.map((id, n) => ({id, vec: [0, 0, center(part(id).inst[0])[2] > -160 ? 30 : -30], phase: 0, delay: n * 0.06})), ...move(m3NutIds, [0, -30, 0], 1, 0.06)],
      text: ['Take the 330 mm E extrusion.', 'Insert 2 M5 T-nuts at each end of the top slot and 1 M5 T-nut at each end of the bottom slot.', 'Insert 6 M3 T-nuts in the front slot for the rail.'],
      notes: [{kind: 'tip', title: 'T-nut orientation', text: 'Insert the t-nuts as shown in the highlight.'}]
    },
    {
      id: 'x-rail', section: S, title: 'MGN12 rail', pages: [135],
      bench: [xExt], view: {az: -70, el: 18},
      movers: [{id: rail, vec: [0, -60, 0], phase: 0, delay: 0}, {id: block, vec: [0, 0, 0], phase: 0, delay: 0}, ...auto(railScrewIds, 1, 0.08)],
      text: ['Place the MGN12 rail on the front of the extrusion, centred, and fasten it with 6 M3x8 SHCS into the M3 T-nuts.'],
      notes: [{kind: 'warn', title: 'Mind the carriage', text: 'Temporarily secure the carriage with a piece of sticky tape to prevent it from sliding off the rail. Dropping the carriage likely irreparably damages it.'},
        {kind: 'tip', title: 'Centered rail installation guide', text: 'Use the MGN12 guides to position the rail in the center of the extrusion prior to tightening the screws.'}],
      extras: [{name: 'MGN12 rail guide (printed tool)', qty: 2, kind: 'tool'}, {name: 'Sticky tape', qty: 1, kind: 'misc'}]
    },
    {
      id: 'x-joint-left', section: S, title: 'Left XY joint onto the extrusion', pages: [136],
      bench: [xExt], view: {az: -60, el: 20},
      movers: [{id: L.lower, vec: [-80, 0, 0], phase: 0, delay: 0}, ...auto(L.top, 1, 0.12), ...auto([L.bottom], 1, 0.3)],
      text: ['Slide the left XY joint onto the left end of the extrusion.', 'Fit 2 M5x10 BHCS from the top and 1 M5x16 BHCS from below into the T-nuts.'],
      notes: [LOOSE]
    },
    {
      id: 'x-joint-right', section: S, title: 'Right XY joint onto the extrusion', pages: [137],
      bench: [xExt, L.lower], view: {az: -40, el: 20},
      movers: [{id: Rt.lower, vec: [80, 0, 0], phase: 0, delay: 0}, ...auto([Rt.bottom], 1)],
      text: ['Slide the right XY joint onto the right end of the extrusion.', 'Fit 1 M5x16 BHCS from below. The top screws come with the cable bridge.'],
      notes: [LOOSE]
    },
    {
      id: 'x-gantry', section: S, title: 'X axis onto the Y carriages', pages: [138],
      view: {az: -110, el: 35},
      movers: [
        {id: xExt, vec: [0, 0, 160], phase: 0, delay: 0},
        ...move([L.lower, Rt.lower], [0, 0, 160]).map(m => ({...m, delay: 0, again: true})),
        ...ycar.map(id => ({id, vec: [0, 0, 0], phase: 0, delay: 0})),
        ...auto([...L.carScrews, ...Rt.carScrews], 1, 0.06)
      ],
      text: ['Lower the X axis onto the carriages of the Y rails.', 'Fasten each XY joint to its carriage with 4 M3x12 SHCS from below.']
    },
    {
      id: 'x-bridge', section: 'XY Cable Bridge', title: 'Cable bridge', pages: [139],
      view: {az: 200, el: 35},
      movers: [{id: bridge, vec: [0, 0, 60], phase: 0, delay: 0}, ...auto(bridgeScrews, 1, 0.15)],
      text: ['Set the cable bridge on the right XY joint and fasten it with 2 M5x16 BHCS into the T-nuts.'],
      notes: [{kind: 'tip', title: 'Using an umbilical?', text: 'Skip the cable bridge if you’re using an umbilical setup. Use M5x10 BHCS screws to attach the XY joint instead.'}]
    },
    {
      id: 'x-square', section: 'X Axis Squaring', title: 'Square the gantry', pages: [140],
      view: {az: -90, el: 70}, focus: [xExt, L.lower, Rt.lower], movers: [],
      text: ['Move the gantry all the way back until both XY joints touch the A and B drives.', 'Fully tighten all screws on the X axis.'],
      notes: [{kind: 'tip', title: 'Squaring the gantry', text: 'Move the gantry all the way back until it hits the A and B drive on both sides. Fully tighten all screws on the X axis.', link: 'https://voron.link/cekh81l'}]
    }
  ];
};
