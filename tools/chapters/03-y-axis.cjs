// Chapter 03: Y Axis (manual pp. 49–75). T-nuts, front idlers and A/B drives onto the frame,
// the Y endstop pod, the Rear Brace (D extrusion), the Z extrusion braces and the Y rails.
// The pilot already placed the Y extrusions (a-y-l, a-y-r) and their blind-joint screws.
module.exports = ctx => {
  const {I, pick, free, center, inside, add, each, hostOf, part, auto, move, ext, idler, drive} = ctx;
  const inst = id => part(id).inst[0];
  // Finished sub-assemblies move onto the frame with `again` movers: they were installed (or
  // benched) in the pilot, and keep their pilot install vector for the exploded view.
  const again = ms => ms.map(m => ({...m, again: true}));

  // Drop-in T-nuts travel out of their slot: away from the host extrusion's axis, along the
  // larger of the two cross-section offsets.
  const tnutVec = (t, host, d = 40) => {
    const b = I[inst(host)].bbox, size = b[1].map((v, k) => v - b[0][k]);
    const long = size.indexOf(Math.max(...size));
    const hc = center(inst(host)), tc = center(t);
    const off = tc.map((v, k) => (k === long ? 0 : v - hc[k]));
    const k = [0, 1, 2].sort((a, c) => Math.abs(off[c]) - Math.abs(off[a]))[0];
    const v = [0, 0, 0]; v[k] = Math.sign(off[k]) * d; return v;
  };
  const tnuts = (prefix, name, list, host) => {
    const ids = each(prefix, name, list, 'tnut', {parent: host});
    return {ids, movers: (phase = 0, gap = 0.06) => ids.map((id, n) => ({id, vec: tnutVec(inst(id), host), phase, delay: n * gap}))};
  };
  const inExt = (i, id) => inside(center(i), ext[id][0]);

  // ---------- Y extrusion and front post T-nuts (Gantry_Frame_Tnuts, M5) ----------
  const GM5 = /Gantry_Frame_Tnuts:1\/2020 Drop-in T-nut, M5/;
  const byY = list => list.sort((a, b) => center(a)[1] - center(b)[1] || center(b)[2] - center(a)[2]);
  const m5Right = byY(free(GM5).filter(i => inExt(i, 'a-y-r')));
  const m5Left = byY(free(GM5).filter(i => inExt(i, 'a-y-l')));
  if (m5Right.length !== 6 || m5Left.length !== 6) throw Error(`Y extrusion M5 T-nuts: ${m5Right.length}/${m5Left.length}, expected 6/6`);
  const tnR = tnuts('y-tnut-r', 'M5 T-nut', m5Right, 'a-y-r');
  const tnL = tnuts('y-tnut-l', 'M5 T-nut', m5Left, 'a-y-l');
  const postR = free(GM5).filter(i => inExt(i, 'b-fr')), postL = free(GM5).filter(i => inExt(i, 'b-fl'));
  if (postR.length !== 2 || postL.length !== 2) throw Error('front post T-nuts: expected 2 + 2');
  const tnPR = tnuts('y-tnut-post-r', 'M5 T-nut', postR, 'b-fr');
  const tnPL = tnuts('y-tnut-post-l', 'M5 T-nut', postL, 'b-fl');

  // ---------- Front idlers onto the frame ----------
  const idlerRoots = s => [idler[s].housing, idler[s].carA, idler[s].carB, idler[s].front];
  const idlerScrews = s => each(`y-idler-${s.toLowerCase()}-m5x10`, 'M5x10 BHCS', pick(new RegExp(`Front Idler ${s}:1/.*M5x10 BHCS`), 4), 'bolt', {parent: idler[s].housing});
  const idlerA = idlerScrews('A'), idlerB = idlerScrews('B');

  // ---------- A and B drives onto the frame ----------
  const driveRoots = s => [drive[s].upper, drive[s].lower, drive[s].motor];
  const driveHosts = s => [[drive[s].upper, inst(drive[s].upper)], [drive[s].lower, inst(drive[s].lower)]];
  const dA = pick(/A_Drive_Hardware:1\/M5x10 BHCS/, 8), dB = pick(/B_Drive_Hardware:1\/M5x10 BHCS/, 8);
  const onY = (list, x) => list.filter(i => Math.abs(center(i)[0] - x) < 5);
  const onD = list => list.filter(i => center(i)[1] > 380);
  // Rear-bottom screw on the Y extrusion: on A the CAD holds both the sensorless M5x10 and the
  // endstop pod's M5x16 there (we draw the pod); on B the manual installs it "in a later step".
  const rearBottom = i => center(i)[1] > 365 && center(i)[2] < -160;
  const aY = onY(dA, 0).filter(i => !rearBottom(i)), bY = onY(dB, -390).filter(i => !rearBottom(i));
  if (aY.length !== 3 || bY.length !== 3) throw Error('drive Y extrusion screws: expected 3 + 3');
  const yA = each('y-drive-a-m5x10', 'M5x10 BHCS', aY, 'bolt', i => ({parent: hostOf(i, driveHosts('A'))}));
  const yB = each('y-drive-b-m5x10', 'M5x10 BHCS', bY, 'bolt', i => ({parent: hostOf(i, driveHosts('B'))}));

  // ---------- Y endstop pod (individual endstop switch option) ----------
  const pod = add('y-endstop-pod', 'Y endstop pod', pick(/Y_Endstop:1\/\[a\]_y_endstop_pod/, 1), 'accent');
  const sw = add('y-endstop-switch', 'D2F-L microswitch', pick(/Y_Endstop:1\/D2F-L Microswitch/, 7), 'electronics', {parent: pod});
  const m2 = each('y-endstop-m2x10', 'M2x10 self tapping screw', pick(/A_Drive_Hardware:1\/M2x10 Self Tapping/, 2), 'bolt', {parent: pod});
  const podScrew = add('y-endstop-m5x16', 'M5x16 BHCS', pick(/A_Drive_Hardware:1\/M5x16 BHCS/, 1), 'bolt', {parent: pod});

  // ---------- Rear Brace: D extrusion ----------
  const dExt = add('y-ext-d', 'D extrusion · 240 mm', pick(/Gantry_Frame:1\/HFSB5-2020-240-D Extrusion/, 1), 'extrusion', {note: 'rear brace between the drives'});
  const m5D = free(GM5).filter(i => inside(center(i), inst(dExt))).sort((a, b) => center(a)[0] - center(b)[0]);
  if (m5D.length !== 10) throw Error(`D extrusion T-nuts: expected 10, found ${m5D.length}`);
  const tnD = tnuts('y-tnut-d', 'M5 T-nut', m5D, dExt);
  const dScrews = [
    ...each('y-drive-a-d-m5x10', 'M5x10 BHCS', onD(dA), 'bolt', i => ({parent: hostOf(i, driveHosts('A'))})),
    ...each('y-drive-b-d-m5x10', 'M5x10 BHCS', onD(dB), 'bolt', i => ({parent: hostOf(i, driveHosts('B'))}))
  ];
  if (dScrews.length !== 8) throw Error('D extrusion screws: expected 8');

  // ---------- Rear vertical extrusion upper braces ----------
  const hInst = ext.h[0];
  const m5H = free(/Frame_Hardware:1\/T-Nuts:1\/2020 Drop-in T-nut, M5/).filter(i => inside(center(i), hInst) && center(i)[2] > -200);
  if (m5H.length !== 2) throw Error(`H extrusion brace T-nuts: expected 2, found ${m5H.length}`);
  const tnH = tnuts('y-tnut-h', 'M5 T-nut', m5H, 'h');
  const braceR = add('y-brace-r', 'Rear vertical extrusion upper brace, right', pick(/Rear_VertExt_Upper_Brace_Right/, 1), 'primary');
  const braceL = add('y-brace-l', 'Rear vertical extrusion upper brace, left', pick(/Rear_VertExt_Upper_Brace_Left/, 1), 'primary');
  const braceHosts = [[braceR, inst(braceR)], [braceL, inst(braceL)]];
  const braceScrews = each('y-brace-m5x10', 'M5x10 BHCS', pick(/Rear_VertExt_Upper_Brace_Hardware.*M5x10 BHCS/, 4), 'bolt', i => ({parent: hostOf(i, braceHosts)}));
  const screwsOf = b => braceScrews.filter(id => part(id).parent === b);

  // ---------- Y rails ----------
  const rail = s => add(`y-rail-${s}`, 'MGN9 rail · 300 mm', pick(new RegExp(`Gantry_Frame:1/MGN9 - 300mm:${s === 'r' ? 1 : 2}/=>`), 1), 'rail');
  const railR = rail('r'), railL = rail('l');
  const GM3 = /Gantry_Frame_Tnuts:1\/2020 Drop-in T-nut, M3/;
  const m3Of = id => free(GM3).filter(i => inExt(i, id) && center(i)[2] < -160).sort((a, b) => center(a)[1] - center(b)[1]);
  const m3R = m3Of('a-y-r'), m3L = m3Of('a-y-l');
  if (m3R.length !== 8 || m3L.length !== 8) throw Error(`Y rail M3 T-nuts: ${m3R.length}/${m3L.length}, expected 8/8`);
  const tnRailR = tnuts('y-rail-tnut-r', 'M3 T-nut', m3R, 'a-y-r');
  const tnRailL = tnuts('y-rail-tnut-l', 'M3 T-nut', m3L, 'a-y-l');
  const railScrews = (s, id) => each(`y-rail-${s}-m3x8`, 'M3x8 SHCS', pick(new RegExp(`Gantry_Frame:1/MGN9 - 300mm:${s === 'r' ? 1 : 2}/M3x8 SHCS`), 8).sort((a, b) => center(a)[1] - center(b)[1]), 'bolt', {parent: id});
  const rsR = railScrews('r', railR), rsL = railScrews('l', railL);

  // ---------- notes ----------
  const TNUT = {kind: 'tip', title: 'T-nut orientation', text: 'Insert the t-nuts as shown in highlight.'};
  const IDLER_ORIENT = {kind: 'tip', title: 'Idler orientation', text: 'The rail stop screws you installed into the front idlers earlier need to sit on the bottom side of the extrusion.'};
  const LOOSE = {kind: 'warn', title: 'Don’t tighten fully', text: 'Keep the M5 screws slightly loose to allow the front idler to slide into place.'};
  const SLIDE_IDLER = {kind: 'tip', title: 'Slide into place', text: 'Move the front idler flush against the vertical extrusion and lock it into place. Then tighten down all screws.'};
  const ROOM = {kind: 'tip', title: 'Make room', text: 'Loosening the idler stack M5x30s and the stepper mount screws provides the clearance needed to slide onto the extrusion.'};
  const ARROWS = {kind: 'warn', title: 'Arrows up', text: 'The arrow points towards the gantry extrusion.'};
  const CARRIAGE = {kind: 'warn', title: 'Mind the carriage', text: 'The carriages are designed to slide along the rail easily. This unfortunately also includes sliding off the rails. Dropping the carriage will likely damage it.'};
  const CENTER = {kind: 'tip', title: 'Centered rail installation guide', text: 'Use the MGN9 guides to position the rail in the center of the extrusion prior to tightening the screws.'};
  const SHORT = {kind: 'tip', title: 'Slightly short MGN9 rail?', text: 'Center it in the available space.'};
  const GUIDES = {name: 'MGN9 centered rail installation guide (printed tool)', qty: 2, kind: 'tool'};

  const railSteps = (s, side, tn, r, rs, pages, az) => [
    {
      id: `y-rail-${s}-place`, section: 'Y Axis', title: `${side} Y rail on its T-nuts`, pages: [pages[0]],
      view: {az, el: -35},
      movers: [...tn.movers(0, 0.06), {id: r, vec: [0, 0, -70], phase: 1, delay: 0}],
      text: [`Drop 8 M3 T-nuts into the slot of the ${side.toLowerCase()} Y extrusion that now faces up.`, 'Lay the MGN9 rail on top. Every other hole in the rail stays empty.'],
      notes: [{...TNUT, text: 'Insert the t-nuts as shown in highlight. Every other hole in the rail will be left empty.'}, CARRIAGE]
    },
    {
      id: `y-rail-${s}-screws`, section: 'Y Axis', title: `Fix the ${side.toLowerCase()} Y rail`, pages: [pages[1]],
      view: {az, el: -35},
      movers: auto(rs, 0, 0.08),
      text: ['Fix the rail with 8 M3x8 SHCS, one in every other hole.', 'Center the rail on the extrusion with the MGN9 guides, then tighten from the center outward.'],
      notes: [CENTER, SHORT],
      extras: [GUIDES]
    }
  ];

  return [
    // Y Axis: T-nuts
    {
      id: 'y-tnuts-right', section: 'Y Axis', title: 'T-nuts in the right Y extrusion', pages: [51],
      view: {az: -40, el: 22},
      movers: tnR.movers(0, 0.08),
      text: ['Drop 6 M5 T-nuts into the right Y extrusion: one in the top and one in the bottom slot at the front end, two in the top and two in the bottom slot at the back end.'],
      notes: [TNUT]
    },
    {
      id: 'y-tnuts-left', section: 'Y Axis', title: 'T-nuts in the left Y extrusion', pages: [52],
      view: {az: -140, el: 22},
      movers: tnL.movers(0, 0.08),
      text: ['Repeat on the left Y extrusion: 6 M5 T-nuts, one top and one bottom at the front, two top and two bottom at the back.'],
      notes: [TNUT]
    },
    {
      id: 'y-tnuts-posts', section: 'Y Axis', title: 'T-nuts in the front posts', pages: [53],
      view: {az: 70, el: 15},
      movers: [...tnPR.movers(0, 0.1), ...tnPL.movers(0, 0.1).map(m => ({...m, delay: m.delay + 0.2}))],
      text: ['Drop 2 M5 T-nuts into the inward-facing slot of each front post, one above and one below the Y extrusion.'],
      notes: [TNUT]
    },

    // Y Axis: front idlers
    {
      id: 'y-idler-a', section: 'Y Axis', title: 'A idler onto the frame', pages: [54, 55],
      view: {az: -35, el: 18},
      movers: [...again(move(idlerRoots('A'), [0, 70, 0])), ...auto(idlerA, 1, 0.12)],
      text: ['Fit the A idler to the front end of the right Y extrusion with 4 M5x10 BHCS: two into the Y extrusion, two into the front post.', 'Keep the screws loose, slide the idler flush against the post, then tighten all screws.'],
      notes: [IDLER_ORIENT, LOOSE, SLIDE_IDLER]
    },
    {
      id: 'y-idler-b', section: 'Y Axis', title: 'B idler onto the frame', pages: [56, 57],
      view: {az: -145, el: 18},
      movers: [...again(move(idlerRoots('B'), [0, 70, 0])), ...auto(idlerB, 1, 0.12)],
      text: ['Repeat with the B idler on the left Y extrusion: 4 M5x10 BHCS, two into the Y extrusion and two into the front post.', 'Slide it flush against the post, then tighten all screws.'],
      notes: [IDLER_ORIENT, LOOSE, SLIDE_IDLER]
    },

    // Y Axis: drives
    {
      id: 'y-drive-a', section: 'Y Axis', title: 'A drive onto the frame', pages: [58],
      view: {az: -25, el: 30},
      movers: [...again(move(driveRoots('A'), [0, -80, 0])), ...auto(yA, 1, 0.12)],
      text: ['Fit the A drive over the back end of the right Y extrusion with M5x10 BHCS into the T-nuts above and below.', 'Leave the screws slightly loose, slide the motor mount against the rear post and tighten the screws.'],
      notes: [ROOM, {kind: 'tip', title: 'Slide into place', text: 'Leave the four M5x10 screws slightly loose, slide the motor mount into place against the vertical and tighten the screws.'},
        {kind: 'tip', title: 'Endstop pod', text: 'With the endstop pod (shown in this guide), the rear screw under the A motor mount is an M5x16 BHCS that also holds the pod. It is fitted a few steps on.'}]
    },
    {
      id: 'y-drive-b', section: 'Y Axis', title: 'B drive onto the frame', pages: [59],
      view: {az: -155, el: 30},
      movers: [...again(move(driveRoots('B'), [0, -80, 0])), ...auto(yB, 1, 0.12)],
      text: ['Fit the B drive over the back end of the left Y extrusion with 3 M5x10 BHCS.', 'Leave them slightly loose, slide the motor mount against the rear post and tighten the screws.'],
      notes: [ROOM, {kind: 'tip', title: 'Slide into place', text: 'Leave the three M5x10 screws slightly loose, slide the motor mount into place against the vertical and tighten the screws.'},
        {kind: 'tip', title: 'Missing screw?', text: 'The second screw on the bottom of the motor mount will be installed in a later step.'}]
    },

    // Y Axis: endstop
    {
      id: 'y-endstop-pod', section: 'Y Axis', title: 'Y endstop pod', pages: [60, 61, 62],
      bench: [pod], view: {az: 35, el: 30},
      movers: [{id: sw, vec: [0, -40, 0], phase: 0, delay: 0}, ...auto(m2, 1, 0.15)],
      text: ['Press the D2F-L microswitch into the endstop pod.', 'Fix it with 2 M2x10 self tapping screws.'],
      notes: [
        {kind: 'tip', title: 'Option: individual endstop switches', text: 'Use this endstop pod if you’re using individual endstop switches — on the toolhead carriage for X, and under the A motor mount for Y. Subsequent steps show this option.'},
        {kind: 'tip', title: 'Option: XY endstop PCB', text: 'Use this endstop bumper if you’re using the optional XY endstop PCB on the XY joint. The trigger point can be adjusted with the screw. The bumper takes an M3 heat set insert and an M3x12 SHCS (see manual page 62); it is not drawn here.'}
      ]
    },
    {
      id: 'y-endstop-mount', section: 'Y Axis', title: 'Endstop pod under the A drive', pages: [63],
      view: {az: -30, el: -30},
      movers: [{id: pod, vec: [0, 0, -50], phase: 0, delay: 0}, ...auto([podScrew], 1)],
      text: ['Fit the endstop pod under the A motor mount with an M5x16 BHCS into the Y extrusion T-nut.'],
      notes: [{kind: 'tip', title: 'Option: sensorless homing', text: 'Skip the endstop pod if you’re using sensorless homing, and use an M5x10 BHCS for the A motor mount.'}]
    },

    // Rear Brace
    {
      id: 'y-d-tnuts', section: 'Rear Brace', title: 'T-nuts in the D extrusion', pages: [64],
      bench: [dExt], view: {az: -70, el: 28},
      movers: tnD.movers(0, 0.06),
      text: ['Drop 10 M5 T-nuts into the D extrusion: two in the top and two in the bottom slot at each end, and two more in the bottom slot near the middle.'],
      notes: [TNUT]
    },
    {
      id: 'y-d-slide', section: 'Rear Brace', title: 'Rear crossbar between the drives', pages: [65],
      view: {az: -70, el: 32},
      movers: [{id: dExt, vec: [0, -110, 0], phase: 0, delay: 0}, ...auto(dScrews, 1, 0.07)],
      text: ['Slide the D extrusion between the A and B drives.', 'Fix it with 8 M5x10 BHCS, two from above and two from below at each drive.'],
      notes: [{kind: 'tip', title: 'Slide into place', text: 'The rear crossbar can be slid into place. You may need to loosen the M3/M5 screws on the motor mount temporarily to slide the extrusion in.'}]
    },
    {
      id: 'y-d-offset', section: 'Rear Brace', title: 'Offset extrusion', pages: [66],
      view: {az: -125, el: 18}, focus: [dExt, 'h'], movers: [],
      text: ['Check the position of the D extrusion against the upright H extrusion behind it.'],
      notes: [{kind: 'tip', title: 'Offset extrusion', text: 'The extrusion between the A and B drives is offset inwards. The upright extrusion extends past it towards the back of the printer.'}]
    },
    {
      id: 'y-brace-right', section: 'Rear Brace', title: 'First upper brace', pages: [67],
      view: {az: 60, el: 10},
      movers: [...tnH.movers(0, 0.12), {id: braceR, vec: [0, 0, -50], phase: 1, delay: 0}, ...auto(screwsOf(braceR), 2, 0.15)],
      text: ['Drop 2 M5 T-nuts into the side slots at the top of the H extrusion.', 'Fit the first upper brace in the corner between the H and D extrusions with 2 M5x10 BHCS.'],
      notes: [TNUT, ARROWS]
    },

    // Z Extrusion
    {
      id: 'y-brace-left', section: 'Z Extrusion', title: 'Second upper brace', pages: [68],
      view: {az: 110, el: 8},
      movers: [{id: braceL, vec: [0, 0, -50], phase: 0, delay: 0}, ...auto(screwsOf(braceL), 1, 0.15)],
      text: ['Fit the second upper brace on the other side of the H extrusion with 2 M5x10 BHCS.'],
      notes: [ARROWS]
    },
    {
      id: 'y-z-position', section: 'Z Extrusion', title: 'Position the rear extrusion', pages: [69],
      view: {az: -90, el: 70}, focus: ['h', dExt, 'c', 'b-rl', 'b-rr'], movers: [],
      text: ['Set the H extrusion 175 mm from the frame upright, parallel to the uprights and equidistant from both, then tighten.'],
      notes: [
        {kind: 'tip', title: 'Adjust positioning', text: 'Position the rear extrusion to match the dimensions shown. Make sure it sits parallel to the frame uprights and equidistant from both.'},
        {kind: 'tip', title: 'Other frame sizes', text: 'The distance is shown for a 250 spec frame. Add 25mm for a 300 or 50 for a 350 sized frame.'}
      ]
    },

    // Y Axis: flip
    {
      id: 'y-flip', section: 'Y Axis', title: 'Flip the printer', pages: [70],
      view: {az: -60, el: -30}, focus: ['a-y-l', 'a-y-r'], movers: [],
      text: ['Turn the printer upside down. The Y rails go on the faces of the Y extrusions that now point up; the views below look from underneath.'],
      notes: [{kind: 'tip', title: 'Upside down assembly', text: 'For ease of assembly we recommend to flip the printer on its head for the next steps.'}]
    },

    // Linear Rails
    {
      id: 'y-rails-prep', section: 'Linear Rails', title: 'Prepare the linear rails', pages: [71],
      bench: [railL, railR], view: {az: -40, el: 25}, movers: [],
      text: ['Clean the shipping oil off both MGN9 rails and re-grease the carriages.', 'Only every other mounting hole gets a screw.'],
      notes: [
        {kind: 'warn', title: 'Handle with care', text: 'The carriage can slide off the rail if not handled properly. Dropping the carriage will likely damage it. Any marks, dents or nicks might cause the linear rail to misbehave in operation.'},
        {kind: 'tip', title: 'Linear rails - preparation and mounting', text: 'Most linear rails arrive coated in shipping oil. To ensure smooth motion and a long service life, this oil must be removed and the rail carriage re-greased. See the VORON sourcing guide for a list of recommended lubricants. We skip every other mounting hole on the rails; if your rails have an even number of mounting holes, work from the outside inward and double up on the center screws. When tightening, work from the center outward to ensure the rail sits flush against the extrusion.', link: 'https://voron.link/agu0nes'}
      ],
      extras: [{name: 'Rail cleaner and grease', qty: 1, kind: 'misc'}]
    },
    ...railSteps('l', 'Left', tnRailL, railL, rsL, [72, 73], -150),
    ...railSteps('r', 'Right', tnRailR, railR, rsR, [74, 75], -30)
  ];
};
