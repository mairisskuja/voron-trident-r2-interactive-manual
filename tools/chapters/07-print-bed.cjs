// Print Bed chapter (manual pp. 164–187): build plate, Z endstop, bed connection Wago mount,
// bed frame (F and G extrusions, z_bed parts with GE5C bearings) and bed wiring.
// The z_bed_* printed parts, their GE5C bearings and the screws that hold them live in the
// Z_Left / Z_Right / Z_Rear subtrees; only the pieces these pages install are taken here.
module.exports = ctx => {
  const {I, pick, free, center, inside, add, each, hostOf, part, auto, move} = ctx;
  const inst = id => part(id).inst[0];
  const Z = 'Z Assembly:1/';

  // ---------- Build plate (Bed Components) ----------
  const B = re => new RegExp(Z + 'Bed Components:1/' + re);
  const plate = add('bed-plate', 'Build plate · 250 mm MIC6', pick(B('250mm MIC6 Bed:1/=>'), 1), 'bed');
  const magnet = add('bed-magnet', 'Magnet sheet', pick(B('Magnet Sheet'), 1), 'bed', {parent: plate});
  const heater = add('bed-heater', 'Bed heater', pick(B('Bed heater'), 1), 'bed', {parent: plate});
  const sheet = add('bed-sheet', 'Flex sheet', pick(B('Flex Sheet'), 1), 'bed', {parent: plate});
  const fuse = add('bed-fuse', 'Thermal fuse', pick(B('250mm MIC6 Bed:1/Thermal Fuse'), 1), 'electronics', {parent: plate});
  const fuseScrew = add('bed-fuse-m3x12', 'M3x12 SHCS', pick(B('M3x12 SHCS'), 1), 'bolt', {parent: fuse});
  const fuseWasher = add('bed-fuse-washer', 'M3 washer', pick(B('M3 Washer'), 1), 'washer', {parent: fuse});
  const ring = add('bed-pe-ring', 'Ring terminal (PE)', pick(B('250mm MIC6 Bed:1/Ring Terminal'), 2), 'electronics', {parent: plate});
  const peScrew = add('bed-pe-m3x6', 'M3x6 BHCS', pick(B('M3x6 BHCS'), 1), 'bolt', {parent: ring});

  // ---------- Z endstop ----------
  const E = re => new RegExp(Z + 'Z Endstop Assembly:1/.*' + re);
  const endstop = add('bed-zend', 'Z endstop', pick(E('z_endstop:1'), 1), 'primary');
  const pulley = add('bed-zend-pulley', 'GT2 20T pulley, deflanged', pick(E('GT2 20T 6mm Deflanged'), 1), 'motion', {parent: endstop});
  const sw = add('bed-zend-switch', 'Microswitch (D2F, no lever)', pick(E('D2F Microswitch'), 6), 'electronics', {parent: endstop});
  const m2 = each('bed-zend-m2x10', 'M2x10 self tapping screw', pick(E('M2x10 Self Tapping'), 2), 'bolt', {parent: sw});
  const jst = add('bed-zend-jst', 'JST 3-pin connector', pick(E('JST 3pin'), 4), 'electronics', {parent: endstop});
  const shaft = add('bed-zend-shaft', '5 mm shaft, 28 mm', pick(E('5x28 Shaft'), 1), 'motion', {parent: pulley});
  const zendM3x20 = each('bed-zend-m3x20', 'M3x20 SHCS', pick(E('M3x20 SHCS'), 2), 'bolt', {parent: endstop});

  // ---------- Bed connection (Wago 221-412 mount) ----------
  const W = re => new RegExp(Z + '3x Wago 221-412 Mount:1/.*' + re);
  const wagoMount = add('bed-wago-mount', 'Wago 221-412 mount', pick(W('wago_221-412_mount'), 1), 'primary');
  const wagos = each('bed-wago', 'WAGO 221-412 lever nut', pick(W('221-412:'), 3), 'electronics', {parent: wagoMount});
  const wagoScrews = each('bed-wago-m5x10', 'M5x10 BHCS', pick(W('M5x10 BHCS'), 2), 'bolt', {parent: wagoMount});

  // ---------- Bed frame: F and G extrusions ----------
  const F = add('bed-ext-f', 'F extrusion · 370 mm', pick(/Bed Extrusions.*-F Extrusion/, 1), 'extrusion', {note: 'bed frame, front'});
  const G = add('bed-ext-g', 'G extrusion · 232 mm', pick(/Bed Extrusions.*-G Extrusion/, 1), 'extrusion', {parent: F, note: 'bed frame, centre'});
  // The pilot's frame step left this one M5x16 BHCS: it sits in the front end of G.
  const gScrew = add('bed-ext-g-m5x16', 'M5x16 BHCS', free(/Frame_Hardware:1\/Screws:1\/M5x16 BHCS/).filter(i => inside(center(i), inst(G))), 'bolt', {parent: G});
  // T-nuts from the shared pool: those inside the F and G extrusions (top slots and G's sides).
  const inExt = i => inside(center(i), inst(F)) || inside(center(i), inst(G));
  const extHosts = [[F, inst(F)], [G, inst(G)]];
  const m5nuts = free(/T-Nuts:1\/2020 Drop-in T-nut, M5/).filter(inExt);
  const m3nuts = free(/T-Nuts:1\/2020 Drop-in T-nut, M3/).filter(inExt);
  if (m5nuts.length !== 8 || m3nuts.length !== 5) throw Error(`bed frame T-nuts: expected 8 M5 + 5 M3, found ${m5nuts.length} + ${m3nuts.length}`);
  const tnut5 = each('bed-tnut-m5', 'M5 T-nut', m5nuts, 'tnut', i => ({parent: hostOf(i, extHosts)}));
  const tnut3 = each('bed-tnut-m3', 'M3 T-nut', m3nuts, 'tnut', i => ({parent: hostOf(i, extHosts)}));
  const isTop = id => Math.abs(center(inst(id))[2] - (-236.9)) < 1;
  const top5 = tnut5.filter(isTop), side5 = tnut5.filter(id => !isTop(id));
  const top3 = tnut3.filter(isTop), side3 = tnut3.filter(id => !isTop(id));
  if (top5.length !== 6 || side5.length !== 2 || top3.length !== 3 || side3.length !== 2) throw Error('bed frame T-nut slots do not match pp.174–175');

  // ---------- z_bed parts (no parent: a parent would hide them on their own bench; the
  // install step carries them with the frame through `again` movers) with GE5C bearings (Z_Left / Z_Rear / Z_Right subtrees) ----------
  const zbed = {};
  for (const [k, sub, hostExt] of [['left', 'Z_Left', F], ['rear', 'Z_Rear', G], ['right', 'Z_Right', F]]) {
    const P = re => new RegExp(Z + sub + ':1/' + re);
    const body = add(`bed-zbed-${k}`, `Z bed ${k}`, pick(P(`${sub}_Printed:1/z_bed_${k}`), 1), 'primary', {note: hostExt === F ? 'on the F extrusion' : 'on the G extrusion'});
    const ge5c = pick(P(`${sub}_Hardware:1/GE5C`), 2);
    const bearing = add(`bed-zbed-${k}-ge5c`, 'GE5C bearing', ge5c, 'bearing', {parent: body});
    const bc = center(ge5c[0]);
    // The three M3x6 BHCS that hold the bearing: the ones at bearing height inside z_bed.
    // (The lower M3x6 BHCS of the subtree hold the accent plates of the Z carriages.)
    const m3x6 = pick(P(`${sub}_Hardware:1/M3x6 BHCS`)).filter(i => inside(center(i), inst(body)) && Math.abs(center(i)[2] - bc[2]) < 2);
    if (m3x6.length !== 3) throw Error(`z_bed_${k}: expected 3 GE5C M3x6 BHCS, found ${m3x6.length}`);
    const holds = each(`bed-zbed-${k}-m3x6`, 'M3x6 BHCS', m3x6, 'bolt', {parent: body});
    // M5x16 BHCS: two into the T-nuts of the bed frame, one through the bearing into the Z carriage.
    const m5 = pick(P(`${sub}_Hardware:1/M5x16 BHCS`), 3);
    const pivot = m5.filter(i => Math.hypot(center(i)[0] - bc[0], center(i)[1] - bc[1]) < 1);
    const mount = m5.filter(i => !pivot.includes(i));
    if (pivot.length !== 1 || mount.length !== 2) throw Error(`z_bed_${k}: M5x16 split failed`);
    const mountIds = each(`bed-zbed-${k}-m5x16`, 'M5x16 BHCS', mount, 'bolt', {parent: body});
    const pivotId = add(`bed-zbed-${k}-pivot`, 'M5x16 BHCS', pivot[0], 'bolt', {parent: bearing});
    zbed[k] = {body, bearing, holds, mountIds, pivotId};
  }

  // ---------- Bed mounting: thumb nuts and M3x16 SHCS ----------
  const thumbs = each('bed-thumb', 'M4 thumb nut', pick(B('M4 Knurled Nut'), 3), 'nut', i => ({parent: center(i)[1] < I[inst(F)].bbox[1][1] ? F : G}));
  const m3x16 = each('bed-m3x16', 'M3x16 SHCS', pick(B('M3x16 SHCS'), 3), 'bolt', {parent: plate});

  // ---------- notes ----------
  const DONT_OVERTIGHTEN = {kind: 'warn', title: 'Don’t overtighten', text: 'The screws are used to position the bearing and are threaded directly into plastic.'};
  const zbedSteps = (k, label, pages, view, slideVec) => {
    const z = zbed[k];
    return [
      {
        id: `bed-zbed-${k}-bearing`, section: 'Bed Frame', title: `GE5C bearing, ${label}`, pages: [pages[0]],
        // The manual draws z_bed upside down here: bearing and screws go in from the underside.
        bench: [z.body], view: {az: view.az, el: -40},
        movers: [{id: z.bearing, vec: [0, 0, -50], phase: 0, delay: 0}, ...auto(z.holds, 1, 0.12)],
        text: [`Turn z_bed_${k} over and press a GE5C bearing into its underside.`, 'Hold it in place with 3 M3x6 BHCS.'],
        notes: [DONT_OVERTIGHTEN]
      },
      {
        id: `bed-zbed-${k}-mount`, section: 'Bed Frame', title: `Mount z_bed_${k}`, pages: [pages[1]],
        bench: [F], view,
        movers: [{id: z.body, vec: slideVec, phase: 0, delay: 0}, ...auto(z.mountIds, 1, 0.15)],
        text: [`Place z_bed_${k} on the ${k === 'rear' ? 'rear end of the G extrusion' : `${k} end of the F extrusion`}.`, 'Fix it with 2 M5x16 BHCS into the M5 T-nuts below.']
      }
    ];
  };

  const plateDown = {az: 60, el: -35};
  return [
    // Print bed
    {
      id: 'bed-magnet', section: 'Print Bed', title: 'Magnet sheet', pages: [165, 166],
      bench: [plate], view: {az: -70, el: 40},
      movers: [{id: magnet, vec: [0, 0, 40], phase: 0, delay: 0}],
      text: ['Find the top of the build plate: its mounting holes are counterbored.', 'Clean the top with isopropyl alcohol and apply the magnet sheet. Press it on firmly.'],
      notes: [
        {kind: 'tip', title: 'Which side is which?', text: 'The top of the plate has mounting holes counterbored so screw heads sit flush with or below the surface. The back has additional tapped holes for the protective earth (PE) connection and a thermal fuse.'},
        {kind: 'tip', title: 'Magnet application', text: 'Clean the plate with isopropyl alcohol or similar cleaner prior to applying the magnet. Use the edge of a plastic object or a small roller to firmly press the magnet on the plate to get a good bond. If you have never done this before we recommend you watch the linked guide.', link: 'https://voron.link/rm6tpld'}
      ],
      extras: [{name: 'Isopropyl alcohol', qty: 1, kind: 'misc'}]
    },
    {
      id: 'bed-heater', section: 'Print Bed', title: 'Bed heater', pages: [167],
      bench: [plate], view: plateDown,
      movers: [{id: heater, vec: [0, 0, -40], phase: 0, delay: 0}],
      text: ['Turn the plate over. Center the heater on the underside, wires to the back, and press it on firmly.'],
      notes: [{kind: 'tip', title: 'Heater application', text: 'The heater is installed in the same fashion as the magnet. Center it on the underside of the build plate and make sure to firmly press it on the build plate.'}]
    },
    {
      id: 'bed-fuse', section: 'Print Bed', title: 'Thermal fuse', pages: [168],
      bench: [plate], view: plateDown,
      movers: [{id: fuse, vec: [0, 0, -30], phase: 0, delay: 0}, {id: fuseWasher, vec: 'auto-of:' + fuseScrew, phase: 1, delay: 0}, ...auto([fuseScrew], 1)],
      text: ['Fix the thermal fuse to the tapped hole at the back of the plate with an M3x12 SHCS and an M3 washer.', 'Wire it in-line with the heater wires.'],
      notes: [{kind: 'tip', title: 'Thermal fuse', text: 'While not required to operate the printer, a thermal fuse attached to the build plate adds an additional layer of protection against potentially dangerous malfunctions. The thermal fuse is wired in-line with the heater wires. Depending on the tapped holes in the plate you may need to use a shorter screw.'}],
      extras: [{name: 'Heater and thermistor wires', qty: 1, kind: 'misc'}]
    },
    {
      id: 'bed-pe', section: 'Heated Bed', title: 'Protective earth', pages: [169],
      bench: [plate], view: plateDown,
      movers: [{id: ring, vec: [0, 0, -25], phase: 0, delay: 0}, ...auto([peScrew], 1)],
      text: ['Crimp a ring terminal on the protective earth wire and fix it to the back of the plate with an M3x6 BHCS.'],
      notes: [{kind: 'warn', title: 'Protective earth (PE)', text: '1mm² (AWG18) or larger.'}],
      extras: [{name: 'Protective earth wire, 1 mm² (AWG18) or larger', qty: 1, kind: 'misc'}]
    },

    // Z endstop
    {
      id: 'bed-zend-build', section: 'Z Endstop', title: 'Pulley and switch', pages: [170],
      bench: [endstop], view: {az: -60, el: 30},
      movers: [{id: pulley, vec: [0, 0, 40], phase: 0, delay: 0}, {id: sw, vec: [0, 0, -35], phase: 1, delay: 0}, ...auto(m2, 2, 0.15)],
      text: ['Remove the top flange and the set screws from a GT2 20 tooth pulley, then press it fully into the Z endstop.', 'Fit a microswitch without lever in the shown orientation and fix it with 2 M2x10 self tapping screws.'],
      notes: [
        {kind: 'tip', title: 'Remove flange & set screws', text: 'Use a bottle opener or some pliers to remove the top flange.', link: 'https://voron.link/ict0j6x'},
        {kind: 'tip', title: 'Press fit', text: 'Apply the required force to fully seat the pulley in the printed part.'},
        {kind: 'warn', title: 'Switch without lever', text: 'This part requires a switch without lever to be installed in the shown orientation. You can remove the lever from microswitches by gently pressing on the lever’s hinge point.'}
      ]
    },
    {
      id: 'bed-zend-shaft', section: 'Z Endstop', title: 'Connector and shaft', pages: [171],
      bench: [endstop], view: {az: -60, el: 30},
      movers: [{id: jst, vec: [0, -30, 0], phase: 0, delay: 0}, {id: shaft, vec: [0, 0, 45], phase: 1, delay: 0}],
      text: ['Fit the 3-pin connector and solder the outer two terminals of the microswitch to it.', 'Push the 5 mm shaft into the pulley.'],
      notes: [
        {kind: 'tip', title: 'Solder connector', text: 'Solder a connection from the outer two terminals of the microswitch to the connector.'},
        {kind: 'tip', title: 'Preventing mishaps', text: 'You can add a notch to the Z endstop point and capture it with a grub screw to prevent it from falling out.'}
      ],
      extras: [{name: 'Soldering iron and solder', qty: 1, kind: 'tool'}]
    },

    // Bed connection
    {
      id: 'bed-wago', section: 'Bed Connection', title: 'Wago lever nuts', pages: [172],
      bench: [wagoMount], view: {az: -150, el: -35},
      movers: move(wagos, [0, 0, -30], 0, 0.15),
      text: ['Press 3 WAGO 221-412 lever nuts into the Wago 221-412 mount.']
    },

    // Bed frame
    {
      id: 'bed-frame-join', section: 'Bed Frame', title: 'F and G extrusions', pages: [173],
      bench: [F], view: {az: -60, el: 35},
      movers: [...auto([gScrew], 0), {id: G, vec: [-200, 0, 0], phase: 1, delay: 0}],
      text: ['Thread an M5x16 BHCS into one end of the G extrusion.', 'Slide its head into the back channel of the F extrusion and fix G 175 mm from the left end of F with a blind joint.'],
      notes: [{kind: 'tip', title: 'Other frame sizes', text: 'The distance is shown for a 250 spec frame. Add 25mm for a 300 or 50 for a 350 sized frame.'}, ctx.notes.BLIND]
    },
    {
      id: 'bed-frame-tnuts', section: 'Bed Frame', title: 'T-nuts on top', pages: [174],
      bench: [F], view: {az: -60, el: 40},
      movers: [...move(top5, [0, 0, 30], 0, 0.08), ...move(top3, [0, 0, 30], 1, 0.12)],
      text: ['Drop M5 T-nuts and M3 T-nuts into the top slots: an M5 pair and an M3 at each end of F, and an M5 pair and an M3 at the rear end of G, as shown.']
    },
    {
      id: 'bed-frame-side-tnuts', section: 'Bed Frame', title: 'T-nuts on the sides of G', pages: [175],
      bench: [F], view: {az: -110, el: 30},
      movers: [...move(side3, [30, 0, 0], 0, 0.12), ...move(side5, [-30, 0, 0], 1, 0.12)],
      text: ['Add 2 M3 T-nuts to the right side of the G extrusion and 2 M5 T-nuts to its left side.']
    },
    ...zbedSteps('left', 'front left', [176, 177], {az: -120, el: 35}, [0, 0, 30]),
    ...zbedSteps('rear', 'rear', [178, 179], {az: -40, el: 35}, [0, 0, 30]),
    ...zbedSteps('right', 'front right', [180, 181], {az: -60, el: 35}, [0, 0, 30]),
    {
      id: 'bed-frame-install', section: 'Bed Frame', title: 'Bed frame onto the Z joints', pages: [182],
      view: {az: -55, el: 25},
      movers: [{id: F, vec: [0, 0, 100], phase: 0, delay: 0}, ...['left', 'rear', 'right'].map(k => ({id: zbed[k].body, vec: [0, 0, 100], phase: 0, delay: 0, again: true})), ...auto(['left', 'rear', 'right'].map(k => zbed[k].pivotId), 1, 0.15)],
      text: ['Set the bed frame onto the three Z joints.', 'Fix each z_bed part with an M5x16 BHCS through its GE5C bearing.']
    },
    {
      id: 'bed-frame-settle', section: 'Bed Frame', title: 'Loosen and retighten', pages: [183],
      view: {az: -90, el: 88}, focus: ['left', 'rear', 'right'].flatMap(k => zbed[k].mountIds), movers: [],
      text: ['Slightly loosen the 6 M5x16 BHCS that hold the bed frame to the printed parts, shake the frame gently, then tighten them again.'],
      notes: [{kind: 'tip', title: 'Loosen and retighten', text: 'Slightly loosen the screws that hold the bed frame to the printed parts and gently shake the bed frame before retightening them.'}]
    },
    {
      id: 'bed-mount', section: 'Bed Frame', title: 'Mount the bed', pages: [184],
      view: {az: -60, el: 30},
      movers: [...move(thumbs, [0, 0, 30], 0, 0.12), {id: plate, vec: [0, 0, 90], phase: 1, delay: 0}, ...auto(m3x16, 2, 0.12), {id: sheet, vec: [0, 0, 40], phase: 3, delay: 0}],
      text: ['Place an M4 thumb nut over each of the three M3 T-nuts on top of the bed frame.', 'Lay the bed on the thumb nuts and fix it with 3 M3x16 SHCS.'],
      notes: [
        {kind: 'warn', title: 'Don’t tighten fully', text: 'Only tighten one screw fully. Leave the remaining screws slightly loose. This will allow for thermal expansion without putting additional stress on the plate.'},
        {kind: 'tip', title: 'Variable screw size', text: 'If you are using a thicker bed (9.5mm) you may need to change the M3x16 screws out for M3x20.'},
        {kind: 'tip', title: 'Flex sheet', text: 'The CAD also shows the flex sheet in place on the magnet. The manual does not cover it in this chapter.'}
      ]
    },
    {
      id: 'bed-zend-mount', section: 'Bed Frame', title: 'Z endstop on the bed frame', pages: [185],
      view: {az: -10, el: -25},
      movers: [{id: endstop, vec: [50, 0, 0], phase: 0, delay: 0}, ...auto(zendM3x20, 1, 0.15)],
      text: ['Fix the Z endstop to the right side of the G extrusion, at the rear, with 2 M3x20 SHCS into the M3 T-nuts.'],
      notes: [{kind: 'warn', title: 'Adjust Z endstop position', text: 'The shaft of the Z Endstop must not touch the print bed. Adjust the position if required.'}]
    },
    {
      id: 'bed-wago-mount', section: 'Bed Wiring', title: 'Bed connection on the bed frame', pages: [186],
      view: {az: -170, el: -25},
      movers: [{id: wagoMount, vec: [-50, 0, 0], phase: 0, delay: 0}, ...auto(wagoScrews, 1, 0.15)],
      text: ['Fix the Wago 221-412 mount to the left side of the G extrusion with 2 M5x10 BHCS into the M5 T-nuts.']
    },
    {
      id: 'bed-wiring', section: 'Bed Wiring', title: 'Wire the bed', pages: [187],
      view: {az: -120, el: -30}, focus: [heater, fuse, ring, wagoMount, endstop], movers: [],
      text: ['Connect the protective earth wire to one Wago lever nut, one heater wire to the next, and the other heater wire, which runs through the thermal fuse, to the third. The thermistor wires run on to the electronics.', 'See manual page 187 for the wiring diagram.'],
      extras: [{name: 'Bed wiring (heater, thermistor, PE)', qty: 1, kind: 'misc'}]
    }
  ];
};
