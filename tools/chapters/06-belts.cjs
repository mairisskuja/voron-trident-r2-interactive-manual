// Belts (manual pp. 142–163): belt path, belt clamps on the X carriage, A and B belt
// routing, capturing the belt ends, the optional double shear bearing covers, and the
// probe on the X carriage. Uses the X carriage halves and probe bracket that chapter 05
// prepared (x-car-left, x-car-right, x-probe-bracket).
module.exports = ctx => {
  const {pick, center, inside, add, each, part, auto, move, drive} = ctx;
  const inst = id => part(id).inst[0];
  const C = re => new RegExp('X Axis:1/Toolhead_Assembly:1/X_Carriage:1/X_Carriage_Hardware:1/' + re);
  const carL = 'x-car-left', carR = 'x-car-right', bracket = 'x-probe-bracket';
  const inL = i => inside(center(i), inst(carL), 1), inR = i => inside(center(i), inst(carR), 1);

  // ---------- X carriage hardware ----------
  // M3x12 SHCS: one in the front of each half, head 3 mm proud (the toolhead hangs on them).
  const m3x12 = pick(C('M3x12 SHCS'), 2).sort((a, b) => center(a)[0] - center(b)[0]);
  const hook = m3x12.map((i, n) => add(`bt-hook-${n + 1}`, 'M3x12 SHCS', i, 'bolt', {parent: n ? carR : carL}));
  // M3x8 SHCS: two per half into the MGN12 carriage; they clamp the belt ends.
  const m3x8 = pick(C('M3x8 SHCS'), 4);
  const clampL = each('bt-clamp-l', 'M3x8 SHCS', m3x8.filter(i => center(i)[0] < -195), 'bolt', {parent: carL});
  const clampR = each('bt-clamp-r', 'M3x8 SHCS', m3x8.filter(i => center(i)[0] > -195), 'bolt', {parent: carR});
  if (clampL.length !== 2 || clampR.length !== 2) throw Error('X carriage: expected 2 + 2 M3x8 SHCS');
  // M3x30 SHCS: through the left half into the side inserts of the right half.
  const join = each('bt-join', 'M3x30 SHCS', pick(C('M3x30 SHCS'), 2), 'bolt', {parent: carR});

  // ---------- belts: one routed solid each in the CAD ----------
  const beltA = add('bt-belt-a', 'GT2 belt 6 mm · A', pick(/Gantry:1\/A_Belt/, 1), 'belt', {note: 'upper belt path'});
  const beltB = add('bt-belt-b', 'GT2 belt 6 mm · B', pick(/Gantry:1\/B_Belt/, 1), 'belt', {note: 'lower belt path'});

  // ---------- bearing covers (double shear) on the A and B drives ----------
  const cover = {};
  for (const s of ['A', 'B']) {
    const k = s.toLowerCase(), P = re => new RegExp(`${s}_Drive:1/.*` + re);
    const c = add(`bt-cover-${k}`, 'Bearing cover', pick(P('_Printed:1/\\[a\\]_cover_bearing'), 1), 'accent');
    const ci = inst(c);
    const bearing = add(`bt-cover-${k}-f695`, 'F695 bearing', pick(P('_Motion:1/F695 ZZ[^/]*$'), 1), 'bearing', {parent: c});
    const clip = add(`bt-cover-${k}-circlip`, 'Circlip', pick(P('_Printed:1/circlip'), 1), 'primary', {parent: c});
    // Two M3x6 BHCS in the cover's corners (the drive's other M3x6s are elsewhere).
    const screws = each(`bt-cover-${k}-m3x6`, 'M3x6 BHCS', pick(P('_Hardware:1/M3x6 BHCS')).filter(i => inside(center(i), ci, 1)), 'bolt', {parent: c});
    if (screws.length !== 2) throw Error(`${s} bearing cover: expected 2 M3x6 BHCS, found ${screws.length}`);
    cover[s] = {c, bearing, clip, screws};
  }

  // ---------- probe ----------
  const probe = add('bt-probe', 'Inductive probe (Omron TL-Q5MC)', pick(/Probes:1\/Omron TL_Q5MC2:1\/=>/, 1), 'electronics', {parent: bracket});
  const probeScrews = each('bt-probe-m3x30', 'M3x30 SHCS', pick(/Probes:1\/Omron TL_Q5MC2:1\/M3x30 SHCS/, 2), 'bolt', {parent: bracket});

  // ---------- steps ----------
  const S = 'Belts';
  const routing = b => ({kind: 'tip', title: `${b} belt routing`, text: 'Follow the path pointed out by the arrows. Needle nose pliers, tweezers or similar tools can help in this step.'});
  const ROUTE = {kind: 'tip', title: 'Routed shape', text: 'The belt is drawn in its final, routed shape. The manual pages show the path with arrows, one corner at a time.'};
  const drives = [drive.A.upper, drive.B.upper];
  return [
    {
      id: 'bt-path', section: S, title: 'The VORON belt path', pages: [143, 144, 145],
      view: {az: -60, el: 55}, focus: ['xyl-lower', 'xyr-lower', ...drives, 'idler-a-housing', 'idler-b-housing'], movers: [],
      text: ['The two belts run on top of each other, each through its own drive, front idler and XY joint: CoreXY without the crossing.', 'Run one belt to get the required length, take it out, and cut the second belt to exactly the same length.'],
      notes: [{kind: 'tip', title: 'The VORON belt path', text: 'VORON printers use a belt path based on the popular CoreXY pattern. The individual belt paths are stacked on top of each other and the crossing often found in CoreXY designs is omitted. Compared to many other implementations, the motors are moved to a less intrusive position.', link: 'https://voron.link/ef72dd6'},
        {kind: 'tip', title: 'Equal tension', text: 'Equal belt tension is important to the proper function of a CoreXY motion system. As both belt paths have the same length, cutting both belts to the same length is an easy way of getting a consistent tension.'}],
      extras: [{name: 'GT2 belt, 6 mm wide', qty: 2, kind: 'belt'}]
    },
    {
      id: 'bt-hooks', section: S, title: 'Screws in the X carriage', pages: [146],
      bench: [carL, carR], view: {az: -70, el: 15},
      movers: auto(hook, 0, 0.15),
      text: ['Thread an M3x12 SHCS into the front of each X carriage half.', 'Leave the head standing 3 mm proud of the part.']
    },
    {
      id: 'bt-clamp', section: S, title: 'Left X carriage half', pages: [147],
      view: {az: -70, el: 15}, movers: [{id: carL, vec: [0, -60, 0], phase: 0, delay: 0}, ...auto(clampL, 1, 0.15)],
      text: ['Lay the ends of both belts against the MGN12 carriage, teeth facing away from the extrusion.', 'Clamp them by fixing the left X carriage half to the rail carriage with 2 M3x8 SHCS.'],
      notes: [{kind: 'tip', title: 'Clamp belts', text: 'Clamp both A and B belts in place by installing the left X carriage part. The belt teeth face away from the extrusion.'}]
    },
    {
      id: 'bt-belt-a', section: 'A Belt', title: 'Route the A belt', pages: [148, 149, 150, 151],
      view: {az: -60, el: 50}, movers: [{id: beltA, vec: [0, 0, 120], phase: 0, delay: 0}],
      text: ['The A belt runs on the upper level.', 'From the carriage, run it to the left XY joint, back along the left side and past the B drive, across the back and round the pulley of the A drive (rear right), forward along the right side and round the A front idler, then back through the right XY joint to the carriage.', 'Follow the arrows on manual pages 148–151.'],
      notes: [routing('A'), ROUTE]
    },
    {
      id: 'bt-belt-b', section: 'B Belt', title: 'Route the B belt', pages: [152, 153, 154],
      view: {az: -120, el: 50}, movers: [{id: beltB, vec: [0, 0, 120], phase: 0, delay: 0}],
      text: ['The B belt runs on the lower level and mirrors the A belt: from the carriage to the right XY joint, back past the A drive, across the back and round the pulley of the B drive (rear left), forward round the B front idler, then back through the left XY joint to the carriage.', 'Follow the arrows on manual pages 152–154.'],
      notes: [routing('B'), ROUTE]
    },
    {
      id: 'bt-capture', section: 'A/B Belts', title: 'Capture the belt ends', pages: [155, 156],
      view: {az: -70, el: 15}, movers: [{id: carR, vec: [0, -60, 0], phase: 0, delay: 0}, ...auto(clampR, 1, 0.15), ...auto(join, 2, 0.15)],
      text: ['Use the right X carriage half to capture the other belt ends.', 'Fix it with 2 M3x8 SHCS, then join both halves with 2 M3x30 SHCS from the side.'],
      notes: [{kind: 'tip', title: 'X carriage', text: 'Use the second part of the X carriage to capture the belt ends.'},
        {kind: 'warn', title: 'Fix belts', text: 'Lightly tighten the screws. The belt must still be able to move.'},
        {kind: 'warn', title: 'Leave loose', text: 'Lightly tighten the screws.'}]
    },
    {
      id: 'bt-tension', section: 'A/B Belts', title: 'Pull tight and tighten', pages: [157],
      view: {az: -70, el: 15}, focus: [carL, carR], movers: [],
      text: ['Grab both belt ends with pliers and pull them tight. The same length of belt must protrude from the carriage on both belts.', 'Fully tighten the carriage screws.'],
      notes: [{kind: 'tip', title: 'Pull tight', text: 'Grab both belt ends with a pair of pliers and pull the belt tight. As both belts are cut to the exact same total length and the belt paths are equal in length in this design, make sure the same length of belt protrudes from the carriage.'},
        {kind: 'check', title: 'Tighten screws', text: 'Fully tighten the carriage screws.'}],
      extras: [{name: 'Pliers', qty: 1, kind: 'tool'}]
    },
    {
      id: 'bt-cover-bearing', section: 'A/B Belts - Bearing Cover', title: 'Bearing covers', pages: [158, 160],
      bench: [cover.A.c, cover.B.c], shift: {ids: [cover.B.c], vec: [230, 0, 0]}, view: {az: -60, el: 40},
      movers: [...move([cover.A.bearing, cover.B.bearing], [0, 0, 35], 0, 0.15), ...move([cover.A.clip, cover.B.clip], [0, 0, 60], 1, 0.15)],
      text: ['Optional: if your A and B motors have shafts of at least 35 mm, support them at both ends.', 'Press an F695 bearing into each bearing cover and lock it with the printed circlip.'],
      notes: [{kind: 'tip', title: 'Optional: double shear shaft support', text: 'Adding a bearing on the outboard side of each A/B motor supports the shaft at both ends, reducing deflection under belt tension and improving motion accuracy. Requires motor shafts at least 35 mm long. For motors with shorter shafts (typically 22–25 mm), use the decorative accent piece provided instead.'},
        {kind: 'tip', title: 'Flanged bearing', text: 'The bearing should press-fit into the mount so it stays locked in place during operation.'},
        {kind: 'tip', title: 'Circlip', text: 'This printed circlip holds the bearing in place and keeps it from walking up the shaft.'}]
    },
    {
      id: 'bt-cover-mount', section: 'A/B Belts - Bearing Cover', title: 'Covers onto the drives', pages: [159, 161],
      view: {az: -95, el: 65}, movers: [...move([cover.A.c, cover.B.c], [0, 0, 50], 0, 0.15), ...auto([...cover.A.screws, ...cover.B.screws], 1, 0.08)],
      text: ['Set a cover on top of each drive, over the motor shaft, and fasten it with 2 M3x6 BHCS.', 'Short motor shafts: fit the logo cover the same way, with the same 2 M3x6 BHCS.'],
      notes: [{kind: 'tip', title: 'Logo cover', text: 'Decorative accent piece for motors with short shafts.'},
        {kind: 'tip', title: 'Bearing cover', text: 'Holds the bearing that supports the motor shaft.'}]
    },
    {
      id: 'bt-probe', section: 'X Carriage', title: 'Probe', pages: [162, 163],
      view: {az: -60, el: -5},
      movers: [{id: bracket, vec: [0, 0, -45], phase: 0, delay: 0}, {id: probe, vec: [0, -50, 0], phase: 1, delay: 0}, ...auto(probeScrews, 2, 0.15)],
      text: ['Fit the probe bracket to the X carriage.', 'Mount the inductive probe with 2 M3x30 SHCS into the bracket. Set it about 6 mm below the plastic part.', 'Cut the probe wires to about 150 mm and guide the cable into the channel in the carriage.'],
      notes: [{kind: 'tip', title: 'Probe wires', text: 'Cut the probe wires to about 150mm.'},
        {kind: 'tip', title: 'Other probe types', text: 'The picture shows the recommended Omron TL-Q5MC probe. Other probes with a similar form factor and characteristics might work as well. A design for a PINDA probe adapter is included in the released files.'},
        {kind: 'tip', title: 'Adjust probe position', text: 'The position can be fine-tuned later. Set an initial position of about 6mm below the plastic part.'},
        {kind: 'tip', title: 'Channel for probe cable', text: 'Guide the probe cable into the highlighted slot.'}]
    }
  ];
};
