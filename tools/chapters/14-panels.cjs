// Panels and finishing touches (manual pp. 291–316): roll-in nuts, rear, side and top panels
// with their clips, door latches, hinges and handles, the PTFE inlet / exhaust cover, the spool
// holder, the bowden retainer and the reverse bowden tube.
// The deck panel, deck supports and deck wire covers (also under Panels:1) belong to the
// Deck Panel pages (pp. 203–204); the bottom panel is in the Skirts chapter (pp. 289–290).
module.exports = ctx => {
  const {pick, center, add, each, part, auto, move} = ctx;
  const one = re => pick(re, 1)[0];
  const P = re => new RegExp('Panels:1/' + re);
  const F = re => new RegExp('Filament_Path:1/' + re);

  // ---------- clipped panels (rear, sides, top) ----------
  // Each clip is a printed part with one or two M3x12 SHCS and M3 hammerhead nuts.
  // `out` points from the frame to the outside of the panel.
  const clipped = (key, name, base, out, kind) => {
    const R = re => new RegExp(base + '/' + re);
    const panel = add(`pn-${key}`, name, one(R('=>')), 'glass');
    const tape = add(`pn-${key}-tape`, 'Foam tape 3 mm', one(R('.*Foam Tape')), 'misc', {parent: panel});
    const clips = [], screws = [], nuts = [];
    const groups = [...new Set(pick(R('(Corner|Midspan) Clip 6mm:\\d+/')).map(i => ctx.I[i].path.slice(0, -1).join('/')))];
    groups.sort();
    groups.forEach((g, n) => {
      const corner = /Corner Clip/.test(g), G = re => new RegExp(g.replace(/[()[\]]/g, '\\$&') + '/' + re);
      const clip = add(`pn-${key}-clip-${n + 1}`, corner ? 'Corner clip 6mm' : 'Midspan clip 6mm', one(G('=>')), 'primary');
      clips.push(clip);
      pick(G('M3x12 SHCS'), corner ? 2 : 1).forEach((i, k) => screws.push(add(`${clip}-m3x12-${k + 1}`, 'M3x12 SHCS', i, 'bolt', {parent: clip})));
      pick(G('M3 Hammerhead T-Nut'), corner ? 2 : 1).forEach((i, k) => nuts.push(add(`${clip}-nut-${k + 1}`, 'M3 hammerhead nut', i, 'tnut', {parent: clip})));
    });
    return {panel, tape, clips, screws, nuts, out};
  };
  const rear = clipped('rear', 'Rear panel', 'Opaque Panels:1/Rear Panel:1', [0, 1, 0]);
  const right = clipped('right', 'Side panel (right)', 'Transparent Panels:1/Side Panel:1', [1, 0, 0]);
  const left = clipped('left', 'Side panel (left)', 'Transparent Panels:1/Side Panel:2', [-1, 0, 0]);
  const top = clipped('top', 'Top panel', 'Transparent Panels:1/Top Panel:1', [0, 0, 1]);
  if (rear.clips.length !== 7 || right.clips.length !== 8 || left.clips.length !== 8 || top.clips.length !== 8) throw Error('unexpected panel clip count');
  const sc = (v, k) => v.map(x => x * k);

  // ---------- door ----------
  const latches = ['Top', 'Bottom'].map(w => {
    const D = re => P(`Door Latch ${w}:1/` + re), k = w.toLowerCase();
    const latch = add(`pn-latch-${k}`, 'Door latch', one(D('=>')), 'primary');
    const magnets = each(`pn-latch-${k}-magnet`, '3x6 mm magnet', pick(D('3x6mm Magnet'), 2), 'misc', {parent: latch});
    const screw = add(`pn-latch-${k}-m3x8`, 'M3x8 SHCS', one(D('M3x8 SHCS')), 'bolt', {parent: latch});
    const nut = add(`pn-latch-${k}-nut`, 'M3 hammerhead nut', one(D('M3 Hammerhead T-Nut')), 'tnut', {parent: latch});
    return {latch, magnets, screw, nut};
  });
  const doors = ['Left', 'Right'].map(w => {
    const D = re => P(`Transparent Panels:1/Front Door ${w}:1/` + re), k = w.toLowerCase();
    const panel = add(`pn-door-${k}`, `Door panel (${k})`, one(D('Door Panel')), 'glass');
    const handles = ['A', 'B'].map(h => {
      const H = re => D(`Door Handle ${h}:\\d/` + re), id = `pn-door-${k}-handle-${h.toLowerCase()}`;
      const handle = add(id, 'Door handle', one(H('=>')), 'primary');
      const magnet = add(`${id}-magnet`, '3x6 mm magnet', one(H('3x6mm Magnet')), 'misc', {parent: handle});
      const vhb = add(`${id}-vhb`, 'VHB tape', one(H('Handle_VHB')), 'misc', {parent: handle});
      return {handle, magnet, vhb};
    });
    const hinges = pick(D('Door Hinge:\\d/Door_Hinge')).map(i => ctx.I[i].path.slice(0, -1).join('/'));
    const hingeGroups = [...new Set(hinges)].sort((a, b) => center(one(new RegExp(b.replace(/[()[\]]/g, '\\$&') + '/M3x8')))[2] - center(one(new RegExp(a.replace(/[()[\]]/g, '\\$&') + '/M3x8')))[2]);
    const hs = hingeGroups.map((g, n) => {
      const G = re => new RegExp(g.replace(/[()[\]]/g, '\\$&') + '/' + re), id = `pn-door-${k}-hinge-${n + 1}`;
      const hinge = add(id, 'Door hinge', pick(G('Door_Hinge_X6'), 2), 'primary');
      const screw = add(`${id}-m3x8`, 'M3x8 SHCS', one(G('M3x8 SHCS')), 'bolt', {parent: hinge});
      const nut = add(`${id}-nut`, 'M3 hammerhead nut', one(G('M3 Hammerhead T-Nut')), 'tnut', {parent: hinge});
      const vhb = add(`${id}-vhb`, 'VHB tape', one(G('Hinge_VHB')), 'misc', {parent: hinge});
      return {hinge, screw, nut, vhb};
    });
    if (hs.length !== 3) throw Error('expected 3 hinges per door');
    return {panel, handles, hinges: hs};
  });
  const handles = doors.flatMap(d => d.handles), hinges = doors.flatMap(d => d.hinges);

  // ---------- PTFE inlet / exhaust cover (pp. 292, 307–310) ----------
  const plate = add('pn-plate', 'Exhaust cover', one(F('PTFE Plate:1/PTFE_Plate_Printed:1/ExhaustCover')), 'primary');
  const inlet = add('pn-inlet', 'Filament inlet', one(F('PTFE Plate:1/PTFE_Plate_Printed:1/Filament_Inlet')), 'primary', {parent: plate});
  const grill = add('pn-exhaust-grill', 'Exhaust grill', one(F('PTFE Plate:1/PTFE_Plate_Printed:1/Exhaust Grill')), 'primary');
  const PH = re => F('PTFE Plate:1/PTFE_Plate_Hardware:1/' + re);
  const plateNuts = each('pn-plate-tnut', 'M5 T-nut', pick(PH('2020 Drop-in T-nut, M5'), 2), 'tnut', {parent: 'a-top-b'});
  const insHost = i => ctx.inside(center(i), part(inlet).inst[0]) ? inlet : plate;
  const plateIns = each('pn-plate-insert', 'M3 heat set insert', pick(PH('M3 Heat Set'), 4), 'insert', i => ({parent: insHost(i)}));
  const inletBolt = add('pn-inlet-m3x6', 'M3x6 BHCS', one(PH('M3x6 BHCS')), 'bolt', {parent: inlet});
  const m3x12 = pick(PH('M3x12 SHCS'), 2).sort((a, b) => center(b)[1] - center(a)[1]);
  const inletClamp = add('pn-inlet-m3x12', 'M3x12 SHCS', m3x12[0], 'bolt', {parent: inlet});
  const grillScrews = [add('pn-grill-m3x8', 'M3x8 SHCS', one(PH('M3x8 SHCS')), 'bolt', {parent: grill}),
    add('pn-grill-m3x12', 'M3x12 SHCS', m3x12[1], 'bolt', {parent: grill})];
  const plateScrews = each('pn-plate-m5x10', 'M5x10 BHCS', pick(PH('M5x10 BHCS'), 2), 'bolt', {parent: plate});

  // ---------- spool holder (pp. 311–312) ----------
  const SH = re => F('Spool Holder:1/' + re);
  const spoolNuts = each('pn-spool-tnut', 'M5 T-nut', pick(SH('Spool_Holder_Hardware:1/2020 Drop-in T-nut, M5'), 2), 'tnut', {parent: 'a-top-r'});
  const spoolBase = add('pn-spool-base', 'Spool holder base', one(SH('Spool_Holder_Printed:1/Spool_Holder_Base')), 'primary');
  const spoolScrews = each('pn-spool-m5x16', 'M5x16 BHCS', pick(SH('Spool_Holder_Hardware:1/M5x16 BHCS'), 2), 'bolt', {parent: spoolBase});
  const spoolArm = add('pn-spool-arm', 'Spool holder', one(SH('Spool_Holder_Printed:1/Spool_Holder:')), 'primary');
  const spoolPtfe = add('pn-spool-ptfe', 'PTFE tube 4×2 mm, 86 mm', one(SH('Spool_Holder_Hardware:1/PTFE Insert')), 'ptfe', {parent: spoolArm});

  // ---------- bowden retainer and tube (pp. 313–315) ----------
  const BH = re => F('PTFE Holder:1/' + re);
  const holder = add('pn-bowden', 'PTFE holder', one(BH('PTFE_Holder_Printed:1/PTFE_Holder')), 'primary');
  const byX = re => pick(re, 2).sort((a, b) => center(a)[0] - center(b)[0]);
  const holderIns = each('pn-bowden-insert', 'M3 heat set insert', byX(BH('PTFE_Holder_Hardware:1/M3 Heat Set')), 'insert', {parent: holder});
  const [mountI, clampI] = byX(BH('PTFE_Holder_Hardware:1/M3x12 SHCS'));
  const holderMount = add('pn-bowden-mount', 'M3x12 SHCS', mountI, 'bolt', {parent: holder});
  const holderClamp = add('pn-bowden-clamp', 'M3x12 SHCS', clampI, 'bolt', {parent: holder});
  const tube = add('pn-ptfe-tube', 'PTFE tube 4×3 mm (reverse bowden)', one(F('PTFE_Tube A')), 'ptfe');

  // ---------- steps ----------
  const TAPE = {kind: 'tip', title: 'Apply foam tape', text: 'Use 3mm foam tape on the contact areas between the panels and the frame to mitigate noise from vibrations.'};
  const HAMMER = {kind: 'tip', title: 'Hammerhead nuts?', text: 'A drop of threadlocker will turn the hammerhead nuts into a 1/4 turn quick release for the panels. Best done once the assembly is finished.'};
  const VHB = {kind: 'tip', title: 'Apply VHB tape', text: 'VHB Tape is a double sided adhesive tape.'};
  const prep = (p, page, title, view) => ({
    id: `pn-${p.panel.slice(3)}-prep`, section: 'Panels', title, pages: [page],
    bench: [p.panel, ...p.clips], view,
    movers: [{id: p.tape, vec: sc(p.out, -40), phase: 0, delay: 0}, ...auto(p.screws, 1, 0.04), ...move(p.nuts, sc(p.out, -25), 2, 0.04)],
    text: ['Apply 3 mm foam tape around the edge of the panel, on the side facing the frame.', `Push an M3x12 SHCS through each clip (${p.clips.length} clips) and start an M3 hammerhead nut on each screw.`],
    notes: [TAPE, HAMMER],
    extras: [{name: 'Foam tape 3 mm', qty: 1, kind: 'misc'}]
  });
  const fit = (p, pages, title, view, where) => ({
    id: `pn-${p.panel.slice(3)}`, section: 'Panels', title, pages, view,
    movers: [{id: p.panel, vec: sc(p.out, 200), phase: 0, delay: 0}, ...move(p.clips, sc(p.out, 60), 1, 0.08)],
    text: [`Place the ${where}.`, 'Hook the hammerhead nuts of each clip into the extrusion slots and turn the screws to lock the panel in place.']
  });
  return [
    {
      id: 'pn-tnuts', section: 'Panels', title: 'Roll-in nuts for the inlet', pages: [292],
      view: {az: 110, el: 20},
      movers: move(plateNuts, [0, 40, 0], 0, 0.15),
      text: ['Roll 2 M5 T-nuts into the rear slot of the top rear extrusion.'],
      notes: [{kind: 'tip', title: 'What are these for?', text: 'These roll-in nuts are used later when installing the filament inlet and spool holder. It\'s easier to install them now, before the panel is in the way.'}]
    },
    prep(rear, 293, 'Prepare the rear panel', {az: 110, el: 15}),
    fit(rear, [294], 'Rear panel', {az: 120, el: 20}, 'rear panel, with the notch at the top'),
    {
      id: 'pn-frame-tape', section: 'Panels', title: 'Foam tape on the Y extrusions', pages: [295],
      view: {az: -30, el: 15},
      // The CAD draws the optional tape strips on the outer faces of the Y extrusions.
      movers: pick(/Gantry_Frame:1\/Foam Tape \(3mm, optional\)/, 2).map((i, n) => {
        const left = center(i)[0] < -195;
        return {id: add(`pn-y-tape-${left ? 'l' : 'r'}`, 'Foam tape 3 mm', i, 'misc', {parent: left ? 'a-y-l' : 'a-y-r'}), vec: [left ? -40 : 40, 0, 0], phase: 0, delay: n * 0.15};
      }),
      text: ['Apply 3 mm foam tape along the outer face of both Y extrusions, where the side panels touch them.'],
      notes: [TAPE]
    },
    prep(right, 296, 'Prepare the right side panel', {az: 10, el: 15}),
    fit(right, [297], 'Right side panel', {az: 20, el: 20}, 'right side panel'),
    prep(left, 298, 'Prepare the left side panel', {az: 170, el: 15}),
    fit(left, [299], 'Left side panel', {az: 160, el: 20}, 'left side panel'),
    prep(top, 300, 'Prepare the top panel', {az: -60, el: 50}),
    fit(top, [301], 'Top panel', {az: -60, el: 40}, 'top panel'),
    {
      id: 'pn-latch-prep', section: 'Panels', title: 'Latches and handle magnets', pages: [302],
      bench: [...latches.map(l => l.latch), ...handles.map(h => h.handle)], view: {az: 100, el: 30},
      // The bottom latch and handles sit 480 mm below the top ones; on the bench they move up.
      shift: {ids: [latches[1].latch, ...handles.filter(h => center(part(h.handle).inst[0])[2] < -270).map(h => h.handle)], vec: [0, 0, 420]},
      movers: [...auto(latches.map(l => l.screw), 0, 0.15), ...move(latches.flatMap(l => l.magnets), [0, -30, 0], 1, 0.08),
        ...move(handles.map(h => h.magnet), [0, 25, 0], 1, 0.08, 0.2), ...move(latches.map(l => l.nut), [0, 25, 0], 2, 0.15)],
      text: ['Push an M3x8 SHCS through each door latch.', 'Glue 2 magnets into each latch and 1 magnet into each of the 4 door handles.', 'Start an M3 hammerhead nut on each latch screw.'],
      notes: [{kind: 'tip', title: 'Glue into place', text: 'Use a fast acting glue like super-glue.'},
        {kind: 'warn', title: 'Mind the magnet polarity', text: 'Ensure the magnets are facing in the right direction prior to glueing them into place.'}],
      extras: [{name: 'Super glue', qty: 1, kind: 'misc'}]
    },
    {
      id: 'pn-latches', section: 'Panels', title: 'Door latches', pages: [303],
      view: {az: -70, el: 15},
      movers: move(latches.map(l => l.latch), [0, -50, 0], 0, 0.2),
      text: ['Fix one latch to the middle of the top front extrusion and one to the middle of the bottom front extrusion.']
    },
    {
      id: 'pn-hinge-prep', section: 'Panels', title: 'Door hinges', pages: [304],
      bench: hinges.map(h => h.hinge), view: {az: -70, el: 10},
      shift: {ids: doors[1].hinges.map(h => h.hinge), vec: [-320, 0, 0]},
      movers: [...auto(hinges.map(h => h.screw), 0, 0.05), ...move(hinges.map(h => h.nut), [0, 25, 0], 1, 0.05), ...move(hinges.map(h => h.vhb), [0, -25, 0], 2, 0.05)],
      text: ['Push an M3x8 SHCS through each of the 6 door hinges and start an M3 hammerhead nut on it.', 'Apply VHB tape to the door side of each hinge.'],
      notes: [VHB],
      extras: [{name: 'VHB tape', qty: 1, kind: 'misc'}]
    },
    {
      id: 'pn-door-prep', section: 'Panels', title: 'Assemble the doors', pages: [305],
      bench: doors.map(d => d.panel), view: {az: -60, el: 15},
      movers: [...move(handles.map(h => h.vhb), [0, -20, 0], 0, 0.05), ...move(handles.map(h => h.handle), [0, -40, 0], 1, 0.05), ...move(hinges.map(h => h.hinge), [0, -40, 0], 1, 0.05, 0.2)],
      text: ['Apply VHB tape to the door handles.', 'Stick a handle to the top and bottom inner corner of each door panel, and 3 hinges along its outer edge.'],
      notes: [VHB]
    },
    {
      id: 'pn-doors', section: 'Panels', title: 'Hang the doors', pages: [306],
      view: {az: -70, el: 20},
      movers: [...move(doors.map(d => d.panel), [0, -150, 0], 0, 0),
        ...move([...handles.map(h => h.handle), ...hinges.map(h => h.hinge)], [0, -150, 0], 0, 0).map(m => ({...m, again: true}))],
      text: ['Hook the hinge nuts into the front corner posts and turn the screws to lock them.', 'The handle magnets hold the closed doors against the latches.']
    },
    {
      id: 'pn-inlet-prep', section: 'PTFE Inlet - Preparation', title: 'Heat set inserts', pages: [307],
      bench: [plate, inlet], view: {az: 110, el: 15},
      shift: {ids: [inlet], vec: [80, 0, 0]},
      movers: auto(plateIns, 0, 0.12),
      text: ['Press 2 M3 heat set inserts into the exhaust cover and 2 into the filament inlet.'],
      notes: [ctx.notes.INSERTS]
    },
    {
      id: 'pn-inlet-asm', section: 'PTFE Inlet - Preparation', title: 'Filament inlet on the cover', pages: [308],
      bench: [plate], view: {az: 110, el: 15},
      movers: [{id: inlet, vec: [0, 30, 0], phase: 0, delay: 0}, ...auto([inletBolt], 1), ...auto([inletClamp], 2)],
      text: ['Fix the filament inlet to the exhaust cover with an M3x6 BHCS.', 'Thread an M3x12 SHCS into the inlet. It clamps the PTFE tube later.']
    },
    {
      id: 'pn-inlet', section: 'PTFE Inlet', title: 'Mount the exhaust cover', pages: [309],
      view: {az: 110, el: 15},
      movers: [{id: plate, vec: [0, 80, 0], phase: 0, delay: 0}, ...auto(plateScrews, 1, 0.15)],
      text: ['Hang the exhaust cover on the top rear extrusion with 2 M5x10 BHCS into the roll-in nuts.'],
      notes: [{kind: 'tip', title: 'Roll-in nuts?', text: 'The two M5 roll-in nuts for the cover plate were installed in an earlier step.'}]
    },
    {
      id: 'pn-grill', section: 'PTFE Inlet', title: 'Exhaust grill', pages: [310],
      view: {az: -90, el: 10},
      movers: [{id: grill, vec: [0, -40, 0], phase: 0, delay: 0}, ...auto(grillScrews, 1, 0.15)],
      text: ['Fit the exhaust grill and fix it with an M3x8 SHCS and an M3x12 SHCS.']
    },
    {
      id: 'pn-spool-base', section: 'Spool Holder', title: 'Spool holder base', pages: [311],
      view: {az: 20, el: 35},
      movers: [...move(spoolNuts, [0, 0, 40], 0, 0.15), {id: spoolBase, vec: [0, 0, 60], phase: 1, delay: 0}, ...auto(spoolScrews, 2, 0.15)],
      text: ['Roll 2 M5 T-nuts into the top slot of the right top extrusion, toward the front.', 'Fix the spool holder base with 2 M5x16 BHCS.'],
      notes: [{kind: 'tip', title: 'Install location?', text: 'The spool holder is installed on the right-hand side top extrusion, toward the front of the printer.'}]
    },
    {
      id: 'pn-spool-ptfe', section: 'Spool Holder', title: 'PTFE tube in the spool holder', pages: [312],
      bench: [spoolArm], view: {az: 60, el: 30},
      movers: [{id: spoolPtfe, vec: [0, 0, 25], phase: 0, delay: 0}],
      text: ['Slip an 86 mm PTFE tube into the top of the spool holder.'],
      notes: [{kind: 'tip', title: 'Insert PTFE tube', text: 'Use a 86mm PTFE tube with a 2 mm inner diameter. Bend the tube slightly to slip it into the mounting holes.'}]
    },
    {
      id: 'pn-spool-arm', section: 'Spool Holder', title: 'Spool holder on the base', pages: [312],
      view: {az: 30, el: 30},
      movers: [{id: spoolArm, vec: [80, 0, 0], phase: 0, delay: 0}],
      text: ['Slide the spool holder into its base.']
    },
    {
      id: 'pn-bowden-prep', section: 'Spool Holder', title: 'PTFE holder', pages: [313],
      bench: [holder], view: {az: 70, el: 20},
      // The mount screw and its insert sit on a 45° diagonal (x-z); their boxes fool 'auto'.
      movers: [{id: holderIns[0], vec: [10, 0, -10], phase: 0, delay: 0}, ...auto([holderIns[1]], 0, 0, 0.15), ...auto([holderClamp], 1)],
      text: ['Press 2 M3 heat set inserts into the PTFE holder.', 'Thread an M3x12 SHCS into the insert at the outer end.']
    },
    {
      id: 'pn-bowden', section: 'Spool Holder', title: 'Mount the PTFE holder', pages: [314],
      view: {az: 40, el: 30},
      movers: [{id: holder, vec: [0, 0, 60], phase: 0, delay: 0}, {id: holderMount, vec: [-22, 0, 22], phase: 1, delay: 0}],
      text: ['Clip the PTFE holder onto the right top extrusion, toward the rear, and fix it with an M3x12 SHCS.']
    },
    {
      id: 'pn-ptfe-tube', section: 'Spool Holder', title: 'Reverse bowden tube', pages: [315],
      view: {az: 45, el: 35},
      movers: [{id: tube, vec: [0, 0, 80], phase: 0, delay: 0}],
      text: ['Run the PTFE tube from the PTFE holder through the filament inlet to the toolhead.', 'Lock it with the clamp screws in the holder and the inlet.'],
      notes: [{kind: 'tip', title: 'Install PTFE tube', text: 'Run the PTFE tube as one continuous piece from the bowden retainer to the toolhead, passing it through the inlet to hold it in place. Avoid sharp bends in the filament path. For the reverse bowden, use a PTFE tube with a 3mm inner and 4mm outer diameter. When tightening the screw that locks the tube in place, make sure not to crush it.'}]
    },
    {
      // The finale: the finished printer spins, with a congratulations banner (src/app.js).
      id: 'pn-next', section: 'Next Steps', title: 'You built a Trident!', pages: [316, 317, 319], finale: true,
      view: {az: -50, el: 18}, movers: [],
      text: ['Congratulations, the physical assembly is done. Take a moment to admire it.', 'Next comes the software side, which starts on the Voron Docs website.'],
      notes: [
        {kind: 'tip', title: 'What next?', text: 'This document only covers the physical assembly of the printer. Now its time to start on the software side. That process starts on the Voron Docs website.', link: 'https://docs.vorondesign.com/build/software/'},
        {kind: 'tip', title: 'Voron Trident on GitHub', text: 'Sources, STLs and CAD for the Trident.', link: 'https://github.com/VoronDesign/Voron-Trident'},
        {kind: 'tip', title: 'How to get help', text: 'If you need assistance with your build, we’re here to help. Head on over to our Discord group and post your questions. Alternatively, you can use our subreddit (reddit.com/r/VORONDesign).', link: 'https://discord.gg/voron'},
        {kind: 'tip', title: 'Easter eggs', text: 'The official manual has some easter eggs hiding in it. You might not spot them on a cursory glance.'}
      ]
    }
  ];
};
