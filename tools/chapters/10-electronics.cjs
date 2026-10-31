// Electronics (manual pp. 213–231): DIN mounted Raspberry Pi, 5V and 24V PSUs, controller board,
// SSR, power inlet, WAGO mains distribution, and mounting all of it on the DIN rails.
// The rails are installed in 09-wiring-prep (wp-din-rail-1 front, wp-din-rail-2 rear).
// Pages 213 (chapter title) and 232 (trivia) are not steps.
module.exports = ctx => {
  const {I, pick, free, center, dist, add, each, hostOf, auto, move, ext, notes} = ctx;
  const extHosts = Object.entries(ext).map(([id, [i]]) => [id, i]);
  const TN = /Frame:1\/Frame_Hardware:1\/T-Nuts:1\//;
  const E = re => new RegExp('Electronics:1/' + re);
  const soft = (re, n) => {
    const out = free(re);
    if (out.length !== n) console.warn(`10-electronics: ${re} expected ${n} free, found ${out.length} (taken by an earlier chapter?)`);
    return out;
  };
  const tnuts = (size, pts, tol = 6) => {
    const taken = new Set();
    return pts.map(p => {
      const i = free(TN).filter(k => !taken.has(k) && new RegExp(`M${size}\\b`).test(I[k].name))
        .sort((a, b) => dist(center(a), p) - dist(center(b), p))[0];
      if (i === undefined || dist(center(i), p) > tol) throw Error(`10-electronics: no free M${size} T-nut near ${p}`);
      taken.add(i);
      return i;
    });
  };
  const boxDist = (c, j) => Math.hypot(...c.map((v, k) => Math.max(I[j].bbox[0][k] - v, 0, v - I[j].bbox[1][k])));
  const onExt = i => ({parent: extHosts.slice().sort((a, b) => boxDist(center(i), a[1]) - boxDist(center(i), b[1]))[0][0]});
  const outOf = (i, host, d = 30) => {
    const c = center(i), h = center(ext[host][0]), b = I[ext[host][0]].bbox;
    const long = [0, 1, 2].sort((x, y) => (b[1][y] - b[0][y]) - (b[1][x] - b[0][x]))[0];
    const off = c.map((v, k) => k === long ? 0 : v - h[k]);
    const k = [0, 1, 2].sort((x, y) => Math.abs(off[y]) - Math.abs(off[x]))[0];
    const v = [0, 0, 0]; v[k] = Math.sign(off[k]) * d;
    return v;
  };
  const byVol = list => list.sort((a, b) => ctx.volume(b) - ctx.volume(a));
  const ST = 'M2x10 self tapping screw';

  // ---------- Raspberry Pi ----------
  const piClip = add('el-pi-clip', 'DIN clip', pick(E('Pi Assembly:1/DIN Clip:1/=>'), 1), 'primary');
  const piClipSt = each('el-pi-clip-m2', ST, pick(E('Pi Assembly:1/DIN Clip:1/M2x10'), 2), 'bolt', {parent: piClip});
  const piBracket = add('el-pi-bracket', 'Raspberry Pi bracket', pick(E('Pi Assembly:1/Raspberry_Bracket'), 1), 'primary', {parent: piClip});
  const pi = add('el-pi', 'Raspberry Pi', pick(E('Pi Assembly:1/Raspberry Pi'), 1), 'electronics', {parent: piBracket});
  const piSt = each('el-pi-m2', ST, pick(E('Pi Assembly:1/M2x10'), 4), 'bolt', {parent: piBracket});

  // ---------- 5V PSU ----------
  const psu5 = add('el-psu5', 'Mean Well RS-25-5 PSU', pick(E('Meanwell RS-25:1/=>'), 20), 'electronics');
  const psu5Br = add('el-psu5-bracket', 'RS-25 PSU bracket', pick(E('Meanwell RS-25:1/RS-25 PSU Bracket'), 1), 'primary', {parent: psu5});
  const psu5Bolts = each('el-psu5-m3x6', 'M3x6 BHCS', pick(E('Meanwell RS-25:1/M3x6 BHCS'), 2), 'bolt', {parent: psu5Br});

  // ---------- 24V PSU ----------
  const psu24 = add('el-psu24', 'Mean Well LRS-200-24 PSU', pick(E('Meanwell LRS-200-24:1/=>'), 2), 'electronics');
  const psu24Br = [1, 2].map(n => add(`el-psu24-bracket-${n}`, 'LRS PSU bracket', pick(E(`Meanwell LRS-200-24:1/LRS PSU Bracket:${n}/=>`), 1), 'primary', {parent: psu24}));
  const brHosts = psu24Br.map(id => [id, ctx.part(id).inst[0]]);
  const psu24Bolts = each('el-psu24-m4x6', 'M4x6 BHCS', pick(E('Meanwell LRS-200-24:1/LRS PSU Bracket:\\d/M4x6 BHCS'), 4), 'bolt', i => ({parent: hostOf(i, brHosts)}));
  const stab = add('el-psu-stabilizer', 'PSU stabilizer', pick(E('Meanwell LRS-200-24:1/PSU_Stabilizer:1/=>'), 1), 'primary');
  const stabM4 = add('el-psu-stabilizer-m4x6', 'M4x6 BHCS', pick(E('Meanwell LRS-200-24:1/PSU_Stabilizer:1/M4x6 BHCS'), 1), 'bolt', {parent: stab});
  const stabM5 = add('el-psu-stabilizer-m5x10', 'M5x10 BHCS', pick(E('Meanwell LRS-200-24:1/PSU_Stabilizer:1/M5x10 BHCS'), 1), 'bolt', {parent: stab});

  // ---------- Controller board (the CAD carries an Octopus-sized dummy) ----------
  const ctrlClips = [2, 3].map(n => add(`el-ctrl-clip-${n - 1}`, 'DIN clip', pick(E(`Controllers:1/Octopus:1/DIN Clip:${n}/=>`), 1), 'primary'));
  const clipHosts = ctrlClips.map(id => [id, ctx.part(id).inst[0]]);
  const ctrlClipSt = each('el-ctrl-clip-m2', ST, pick(E('Controllers:1/Octopus:1/DIN Clip:\\d/M2x10'), 4), 'bolt', i => ({parent: hostOf(i, clipHosts)}));
  const ctrlMounts = pick(E('Controllers:1/Octopus:1/Octopus Bracket'), 2).sort((a, b) => center(b)[0] - center(a)[0])
    .map((i, n) => add(`el-ctrl-mount-${n + 1}`, 'Controller mount', i, 'primary', {parent: ctrlClips.slice().sort((p, q) => Math.abs(center(ctx.part(p).inst[0])[0] - center(i)[0]) - Math.abs(center(ctx.part(q).inst[0])[0] - center(i)[0]))[0]}));
  const board = add('el-ctrl-board', 'Controller board', pick(E('Controllers:1/Octopus:1/=>'), 1), 'electronics', {parent: ctrlClips[0], note: 'dummy board outline'});
  const boardBolts = each('el-ctrl-board-m3x6', 'M3x6 BHCS', pick(E('Controllers:1/Octopus:1/M3x8 SHCS'), 4), 'bolt', {parent: board});

  // ---------- SSR ----------
  const ssrBr = add('el-ssr-mount', 'Relay mount', pick(E('SSR:1/SSR Mount Bracket'), 1), 'misc');
  const ssr = add('el-ssr', 'Solid state relay', [...byVol(pick(E('SSR:1/Main Relay Body'), 6)), ...pick(E('SSR:1/Square Washer'), 4)], 'electronics', {parent: ssrBr});
  const ssrBolts = each('el-ssr-m4x6', 'M4x6 BHCS', pick(E('SSR:1/M4x6 BHCS'), 2), 'bolt', {parent: ssr});

  // ---------- Power inlet (CAD: rear skirt power inlet, filtered variant) ----------
  const PI = re => new RegExp('Rear_Skirt_Power_Inlet:1/' + re);
  const inletMount = soft(PI('Filtered:1/rear_skirt_power_filtered'), 1);
  let inlet = null;
  if (inletMount.length) {
    const mount = add('el-inlet-mount', 'Power inlet mount (filtered)', inletMount, 'primary');
    const ins = each('el-inlet-insert', 'M3 heat set insert', [...soft(PI('Filtered:1/M3 Heat Set'), 2), ...soft(PI('M3 Heat Set'), 1)], 'insert', {parent: mount});
    const filt = add('el-inlet', 'Filtered inlet', soft(PI('Filtered:1/c-3-1609115'), 1), 'electronics', {parent: mount});
    const sw = add('el-inlet-switch', 'Switch', soft(PI('Filtered:1/Switch DPST'), 7), 'electronics', {parent: mount});
    const fhcs = each('el-inlet-m3x10', 'M3x10 FHCS', soft(PI('Filtered:1/M3x10 FHCS'), 2), 'bolt', {parent: filt});
    const bolts = soft(PI('M3x8 SHCS'), 2);
    const shcs = each('el-inlet-m3x8', 'M3x8 SHCS', bolts, 'bolt', {parent: mount});
    const tn = each('el-inlet-tnut', 'M3 T-nut', tnuts(3, bolts.map(i => { const c = center(i); return [c[0], 390, -516]; })), 'tnut', onExt);
    inlet = {mount, ins, filt, sw, fhcs, shcs, tn};
  }

  // ---------- WAGO 221-415 mains distribution ----------
  const wago = add('el-wago-mount', 'WAGO 221-415 mount', pick(E('3x WAGO_221-415_mount:1/=>'), 1), 'primary');
  const levers = each('el-wago', 'WAGO 221-415 lever nut', pick(E('3x WAGO_221-415_mount:1/221-415'), 3), 'electronics', {parent: wago});
  const wagoBolts = pick(E('3x WAGO_221-415_mount:1/M5x10 BHCS'), 2);
  const wagoM5 = each('el-wago-m5x10', 'M5x10 BHCS', wagoBolts, 'bolt', {parent: wago});
  // p.224 adds both T-nuts: one in the inner slot of the left bottom extrusion, one in the back.
  const wagoTn = each('el-wago-tnut', 'M5 T-nut', tnuts(5, wagoBolts.map(i => { const c = center(i); return c[1] > 370 ? [c[0], 384, -510] : [-384, c[1], -510]; }), 5), 'tnut', onExt);

  // ---------- Optional XY endstop PCB (in the CAD under the right XY joint) ----------
  const pcbInst = soft(/XY_Joint_Right_Printed:1\/Endstop_Boards:1\/D2F_XY_Endstop_PCB/, 16);
  let xy = null;
  if (pcbInst.length) {
    const pcb = add('el-xy-pcb', 'XY endstop PCB', pcbInst, 'electronics');
    const cover = soft(/XY_Joint_Right_Printed:1\/\[a\]_d2f_cover/, 1);
    const cov = cover.length ? add('el-xy-pcb-cover', 'D2F cover', cover, 'accent') : null;
    const scr = free(/XY_Joint_Right_Hardware:1\/M3x6 BHCS/).filter(i => center(i)[2] < -193);
    const bolts = each('el-xy-pcb-m3x6', 'M3x6 BHCS', scr, 'bolt', cov ? {parent: cov} : {});
    xy = {pcb, cov, bolts};
  }

  // ---------- steps ----------
  const DONT_ST = {kind: 'warn', title: 'Don’t overtighten', text: 'These screws thread directly into plastic and strip easily.'};
  const rails = ['wp-din-rail-1', 'wp-din-rail-2'];
  const UP = [0, 0, -90];   // onto the rails from below (the printer stands upright in the CAD)
  return [
    {
      id: 'el-pi-bracket', section: 'Raspberry Pi', title: 'Bracket on the DIN clip', pages: [214],
      bench: [piClip], view: {az: -60, el: 35},
      movers: [{id: piBracket, vec: [0, 0, -40], phase: 0, delay: 0}, ...auto(piClipSt, 1, 0.15)],
      text: ['Place the Raspberry Pi bracket on the DIN clip and fix it with 2 M2x10 self tapping screws.'],
      notes: [DONT_ST]
    },
    {
      id: 'el-pi', section: 'Raspberry Pi', title: 'Mount the Raspberry Pi', pages: [215],
      bench: [piClip], view: {az: -60, el: -35},
      movers: [{id: pi, vec: [0, 0, -40], phase: 0, delay: 0}, ...auto(piSt, 1, 0.1)],
      text: ['Fix the Raspberry Pi to the bracket with 4 M2x10 self tapping screws.'],
      notes: [DONT_ST]
    },
    {
      id: 'el-psu5', section: '5V PSU', title: 'DIN bracket on the 5V PSU', pages: [216],
      bench: [psu5], view: {az: -120, el: 35},
      movers: [{id: psu5Br, vec: [0, 0, 40], phase: 0, delay: 0}, ...auto(psu5Bolts, 1, 0.15)],
      text: ['Fix the RS-25 PSU bracket to the RS-25-5 PSU with 2 M3x6 BHCS.']
    },
    {
      id: 'el-psu24', section: '24V PSU', title: 'DIN brackets on the 24V PSU', pages: [217],
      bench: [psu24], view: {az: -60, el: 35},
      movers: [...move(psu24Br, [0, 0, 40], 0, 0.15), ...auto(psu24Bolts, 1, 0.1)],
      text: ['Fix the two LRS PSU brackets to the LRS-200-24 PSU with 2 M4x6 BHCS each.']
    },
    {
      id: 'el-ctrl-mounts', section: 'Controller Board', title: 'Controller mounts on the DIN clips', pages: [218],
      bench: ctrlClips, view: {az: -60, el: 35},
      movers: [...move(ctrlMounts, [0, 0, -35], 0, 0.15), ...auto(ctrlClipSt, 1, 0.1)],
      text: ['Fix a controller mount to each DIN clip with 2 M2x10 self tapping screws.'],
      notes: [{kind: 'tip', title: 'Available mounts', text: 'We also provide mounts for other controller boards. They are assembled in a similar manner.'}, DONT_ST]
    },
    {
      id: 'el-ctrl-board', section: 'Controller Board', title: 'Controller board on the mounts', pages: [219],
      bench: ctrlClips, view: {az: -60, el: -35},
      movers: [{id: board, vec: [0, 0, -40], phase: 0, delay: 0}, ...auto(boardBolts, 1, 0.1)],
      text: ['Fix the controller board to the mounts with 4 M3x6 BHCS.'],
      notes: [{kind: 'tip', title: 'Why does it look that way?', text: 'We used a dummy to keep the file size of the printers CAD manageable. The wiring section will have a fully featured image.'}]
    },
    {
      id: 'el-ssr', section: 'SSR', title: 'Solid state relay on its mount', pages: [220],
      bench: [ssrBr], view: {az: -60, el: -35},
      movers: [{id: ssr, vec: [0, 0, -40], phase: 0, delay: 0}, ...auto(ssrBolts, 1, 0.15)],
      text: ['Fix the solid state relay to the relay mount with 2 M4x6 BHCS.'],
      notes: [{kind: 'tip', title: 'Where can I find the relay mount?', text: 'The SSR mount is an off the shelf part. Look for a metal bracket in your pile of parts. There is no printed mount.'}]
    },
    ...(inlet ? [
      {
        id: 'el-inlet-prep', section: 'Power Inlet', title: 'Inserts, inlet and switch', pages: [221],
        bench: [inlet.mount], view: {az: 110, el: 25},
        movers: [...auto(inlet.ins, 0, 0.12), ...move([inlet.filt, inlet.sw], [0, 70, 0], 1, 0.2), ...auto(inlet.fhcs, 2, 0.12)],
        text: ['Press 3 M3 heat set inserts into the power inlet mount.', 'Push the switch and the filtered inlet into the mount from its outer face and fix the inlet with 2 M3x10 FHCS.'],
        notes: [notes.INSERTS, {kind: 'tip', title: 'Alternate inlets', text: 'This page displays the filtered inlet. For combo inlets, the printed parts and inlet will differ.'}, {kind: 'tip', title: 'Combo inlet variant', text: 'The CAD also holds the combo inlet version (Adam’s Tech inlet with its own printed mount). It is not drawn here.'}]
      },
      {
        id: 'el-inlet-mount', section: 'Power Inlet', title: 'Mount the power inlet', pages: [222],
        view: {az: 120, el: -35},
        movers: [...inlet.tn.map((id, n) => ({id, vec: outOf(ctx.part(id).inst[0], ctx.part(id).parent), phase: 0, delay: n * 0.12})), {id: inlet.mount, vec: [0, 0, -60], phase: 1, delay: 0}, ...auto(inlet.shcs, 2, 0.12)],
        text: ['Drop 2 M3 T-nuts into the lower back extrusion, near the rear left corner.', 'Fix the power inlet mount with 2 M3x8 SHCS.']
      }
    ] : []),
    {
      id: 'el-din-howto', section: 'DIN Mount', title: 'How DIN mounts go on', pages: [223],
      view: {az: -90, el: -50}, focus: rails, movers: [],
      text: ['Hook the fixed side of the printed mount over one edge of the DIN rail.', 'Rotate the part into place without letting the fixed side unhook, then press the free side until it snaps onto the rail.'],
      notes: [
        {kind: 'tip', title: 'Hook fixed side', text: 'Hook the fixed side of the printed mount to the side of DIN rail.'},
        {kind: 'tip', title: 'Move into position', text: 'Rotate the part into place, make sure it does not unhook from the fixed side.'},
        {kind: 'tip', title: 'Snap into place', text: 'Press to snap the free side into place. The part should now sit securely on the DIN rail.'}
      ]
    },
    {
      id: 'el-wago-prep', section: 'Mains Distribution - WAGO', title: 'Lever nuts into the mount', pages: [224],
      bench: [wago], view: {az: -60, el: -40},
      movers: move(levers, [0, 0, -30], 0, 0.15),
      text: ['Push 3 WAGO 221-415 lever nuts into the WAGO mount.']
    },
    {
      id: 'el-wago-mount', section: 'Mains Distribution - WAGO', title: 'Mount the WAGO block', pages: [224],
      view: {az: -45, el: -50},
      movers: [...wagoTn.map((id, n) => ({id, vec: outOf(ctx.part(id).inst[0], ctx.part(id).parent), phase: 0, delay: n * 0.12})), {id: wago, vec: [0, 0, -50], phase: 1, delay: 0}, ...auto(wagoM5, 2, 0.15)],
      text: ['Drop an M5 T-nut into the inner slot of the left bottom extrusion and one into the lower back extrusion, in the rear left corner.', 'Fix the WAGO mount in the rear left corner with 2 M5x10 BHCS.']
    },
    {
      id: 'el-psu24-mount', section: 'PSU Mounting', title: '24V PSU onto the rear rail', pages: [225],
      view: {az: -60, el: -45},
      movers: [{id: psu24, vec: UP, phase: 0, delay: 0}],
      text: ['Clip the 24V PSU onto the rear DIN rail as shown.']
    },
    {
      id: 'el-psu24-stabilizer', section: 'PSU Mounting', title: 'PSU stabilizer', pages: [226],
      view: {az: -30, el: -45},
      movers: [{id: stab, vec: [-40, 0, 0], phase: 0, delay: 0}, ...auto([stabM5, stabM4], 1, 0.2)],
      text: ['Fit the PSU stabilizer between the right extrusion and the PSU.', 'Fix it with an M5x10 BHCS into the T-nut and an M4x6 BHCS into the PSU.']
    },
    {
      id: 'el-ssr-mount', section: 'SSR Mounting', title: 'SSR onto the rear rail', pages: [227],
      view: {az: -60, el: -45},
      movers: [{id: ssrBr, vec: UP, phase: 0, delay: 0}],
      text: ['Pull the latch of the relay mount open, clip the SSR onto the rear DIN rail next to the 24V PSU and release the latch.'],
      notes: [{kind: 'warn', title: 'Spring loaded', text: 'Use a flat head screwdriver to pull the latch open. It will lock open. Be careful when releasing the latch, it will snap back into place. Mind your fingers.'}]
    },
    {
      id: 'el-psu5-mount', section: 'PSU Mounting', title: '5V PSU onto the rear rail', pages: [228],
      view: {az: -60, el: -45},
      movers: [{id: psu5, vec: UP, phase: 0, delay: 0}],
      text: ['Clip the 5V PSU onto the rear DIN rail, next to the SSR.']
    },
    {
      id: 'el-pi-mount', section: 'Raspberry Pi Mounting', title: 'Raspberry Pi onto the front rail', pages: [229],
      view: {az: -60, el: -45},
      movers: [{id: piClip, vec: UP, phase: 0, delay: 0}],
      text: ['Clip the Raspberry Pi onto the front DIN rail.']
    },
    {
      id: 'el-ctrl-mount', section: 'Controller Board Mounting', title: 'Controller board onto the front rail', pages: [230],
      view: {az: -60, el: -45},
      movers: move(ctrlClips, UP, 0, 0),
      text: ['Clip the controller board onto the front DIN rail, next to the Raspberry Pi.']
    },
    ...(xy ? [{
      id: 'el-xy-pcb', section: 'Option: X/Y Endstop PCB', title: 'XY endstop PCB', pages: [231],
      view: {az: 30, el: -35},
      movers: [{id: xy.pcb, vec: [0, 0, -30], phase: 0, delay: 0}, ...(xy.cov ? [{id: xy.cov, vec: [0, 0, -45], phase: 1, delay: 0}] : []), ...auto(xy.bolts, 2, 0.15)],
      text: ['Optional: place the XY endstop board under the right XY joint, cover it with the D2F cover and fix it with 2 M3x6 BHCS.'],
      notes: [{kind: 'tip', title: 'XY endstop PCB', text: 'An alternate endstop solution, used instead of sensorless homing or D2F switches on the X carriage and A motor mount. Skip this step if you’re using one of those.'}]
    }] : [])
  ];
};
