// Z Axis chapter (manual pp. 77–117): Z motor mounts, Z rails and rail stops, the three Z
// joints, the Z motors with their lead screws, and the feet.
// The bed-side halves of the Z joints (z_bed_*, GE5C, their M3x6/M5x16) are installed in the
// Bed Frame pages (pp. 176–182) and are left to that chapter. The Z motor covers, their M3x6
// BHCS and M2x10 self-tapping screws are installed in Wiring Preparation (pp. 196–202).

module.exports = ctx => {
  const {I, pick, free, center, dist, add, each, hostOf, part, auto, move, ext, notes} = ctx;
  const inst = id => part(id).inst[0];
  const extHosts = Object.entries(ext).map(([id, [i]]) => [id, i]);
  const onExt = i => ({parent: hostOf(i, extHosts)});
  const cz = i => center(i)[2];

  // Drop-in T-nuts from the shared frame pool: the one at the tip of each screw. It slides in
  // from the face the screw comes through, so it travels along the dominant screw direction.
  const TNUT = /Frame_Hardware:1\/T-Nuts:1\/2020 Drop-in T-nut, M/;
  const tnuts = (prefix, size, screws) => {
    const re = new RegExp(TNUT.source + size);
    const out = screws.map((s, n) => {
      const t = free(re).sort((a, b) => dist(center(a), center(s)) - dist(center(b), center(s)))[0];
      if (dist(center(t), center(s)) > 10) throw Error(`${prefix}: no M${size} T-nut at screw ${s}`);
      const d = center(s).map((v, k) => v - center(t)[k]);
      const k = d.map(Math.abs).indexOf(Math.max(...d.map(Math.abs)));
      const vec = [0, 0, 0]; vec[k] = Math.sign(d[k]) * 35;
      return [add(`${prefix}-${n + 1}`, `M${size} T-nut`, t, 'tnut', onExt(t)), vec];
    });
    return {ids: out.map(o => o[0]), vec: Object.fromEntries(out)};
  };
  const tnutMovers = (tn, phase = 0, gap = 0.06) => tn.ids.map((id, n) => ({id, vec: tn.vec[id], phase, delay: n * gap}));

  // ---------- Z motor mounts (p. 81) and their frame screws (pp. 82–83, 87–88, 92–93) ----------
  const ZM = 'Z Assembly:1/Z_Motors:1/';
  const mount = {}, mountIns = {}, mountM5 = {}, mountTn = {};
  for (const [s, sub, printed] of [['left', 'Z_Stepper_Left', 'Z_Mount_Left_Printed'], ['right', 'Z_Stepper_Right', 'Z_Stepper_Right_Printed'], ['rear', 'Z_Stepper_Rear', 'Z_Stepper_Rear_Printed']]) {
    const P = re => new RegExp(ZM + sub + ':1/.*' + re);
    mount[s] = add(`z-mount-${s}`, `Z stepper ${s}`, pick(P(`${printed}:1/z_stepper_${s}`), 1), 'primary');
    mountIns[s] = add(`z-mount-${s}-insert`, 'M3 heat set insert', pick(P('M3 Heat Set'), 1), 'insert', {parent: mount[s]});
    const m5 = pick(P('M5x16 BHCS'), 2);
    mountM5[s] = each(`z-mount-${s}-m5x16`, 'M5x16 BHCS', m5, 'bolt', {parent: mount[s]});
    mountTn[s] = tnuts(`z-mount-${s}-tnut`, 5, m5);
  }

  // ---------- Z rails, carriages and rail stops (pp. 84–86, 89–91, 94–96) ----------
  const rail = {}, railM3 = {}, railTn = {}, mgn = {}, stop = {};
  for (const [s, k, motion, post] of [['left', 3, 'Z_Left', 'b-fl'], ['right', 4, 'Z_Right', 'b-fr'], ['rear', 5, 'Z_Rear', 'h']]) {
    const R = `Z_Rails:1/MGN9 - 300mm:${k}/`;
    const ri = pick(new RegExp(R + '=>'), 1)[0];
    rail[s] = add(`z-rail-${s}`, 'MGN9 rail, 300 mm', ri, 'rail', {parent: post});
    mgn[s] = add(`z-mgn-${s}`, 'MGN9H carriage', pick(new RegExp(`${motion}:1/${motion}_Motion:1/MGN Carriage`), 9), 'rail', {parent: rail[s]});
    const m3 = pick(new RegExp(R + 'M3x8 SHCS'), 8).sort((a, b) => cz(b) - cz(a));
    railM3[s] = each(`z-rail-${s}-m3x8`, 'M3x8 SHCS', m3, 'bolt', {parent: rail[s]});
    railTn[s] = tnuts(`z-rail-${s}-tnut`, 3, m3);
  }
  for (const [s, x, post] of [['left', -390, 'b-fl'], ['right', 0, 'b-fr']]) {
    const i = pick(/Z Assembly:1\/\[a\]_z_rail_stop_x2:\d$/, 2).find(j => Math.abs(center(j)[0] - x) < 5);
    stop[s] = add(`z-stop-${s}`, 'Z rail stop', i, 'accent', {parent: post});
  }

  // ---------- Z joints, Z-carriage side (pp. 79–80, 97–101, 103–106) ----------
  const joint = {};
  for (const s of ['left', 'right', 'rear']) {
    const S = s[0].toUpperCase() + s.slice(1), P = re => new RegExp(`Z_${S}:1/.*` + re);
    const j = {};
    j.carriage = add(`z-carriage-${s}`, `Z carriage ${s}`, pick(P(`Z_${S}_Printed:1/z_carriage_${s}`), 1), 'primary');
    const cBox = inst(j.carriage);
    j.cap = add(`z-carriage-${s}-cap`, `Z carriage ${s} (accent)`, pick(P(`Z_${S}_Printed:1/\\[a\\]_z_carriage_${s}`), 1), 'accent', {parent: j.carriage});
    j.m5ins = add(`z-carriage-${s}-insert`, 'M5 heat set insert', pick(P('M5 Heat Set'), 1), 'insert', {parent: j.carriage});
    // The three M3x6 BHCS that hold the accent cap sit in its plane; the other M3x6 belong to
    // z_bed (Bed Frame chapter) or to the rear cable chain insert.
    const capZ = cz(inst(j.cap));
    j.capScrews = each(`z-carriage-${s}-m3x6`, 'M3x6 BHCS', pick(P('M3x6 BHCS')).filter(i => Math.abs(cz(i) - capZ) < 3), 'bolt', {parent: j.cap});
    if (j.capScrews.length !== 3) throw Error(`z-carriage-${s}: expected 3 cap screws, found ${j.capScrews.length}`);
    j.nut = add(`z-carriage-${s}-nut`, 'Lead screw nut', pick(P('Leadscrew Nut'), 1), 'leadscrew', {parent: j.carriage});
    j.m3x12 = each(`z-carriage-${s}-m3x12`, 'M3x12 SHCS', pick(P('M3x12 SHCS'), 2), 'bolt', {parent: j.nut});
    // Each M3 lock nut is two solids in the CAD (nut and nylon ring).
    const lock = pick(P('M3 Locknut'), 4), groups = {};
    for (const i of lock) { const key = center(i).slice(0, 2).map(Math.round).join(','); (groups[key] ||= []).push(i); }
    j.locknuts = Object.values(groups).map((g, n) => add(`z-carriage-${s}-locknut-${n + 1}`, 'M3 lock nut', g, 'nut', {parent: j.nut}));
    if (j.locknuts.length !== 2) throw Error(`z-carriage-${s}: expected 2 lock nuts`);
    j.m3x8 = each(`z-carriage-${s}-m3x8`, 'M3x8 SHCS', pick(P('M3x8 SHCS'), s === 'rear' ? 4 : 3), 'bolt', {parent: j.carriage});
    joint[s] = j;
  }
  // Rear joint: cable chain insert (generic 3-hole pattern) and its inserts (p. 79, 106).
  const R = joint.rear;
  R.chain = add('z-rear-chain-insert', 'Z rear insert, 3 hole', pick(/Z_Rear_Printed:1\/z_rear_insert_3hole/, 1), 'primary', {parent: R.carriage});
  const rearM3ins = pick(/Z_Rear_Hardware:1\/M3 Heat Set/, 5);
  const chainHosts = [[R.chain, inst(R.chain)], [R.carriage, inst(R.carriage)]];
  R.chainIns = each('z-rear-chain-insert-m3', 'M3 heat set insert', rearM3ins.filter(i => hostOf(i, chainHosts) === R.chain), 'insert', {parent: R.chain});
  R.sideIns = each('z-carriage-rear-side-insert', 'M3 heat set insert', rearM3ins.filter(i => hostOf(i, chainHosts) === R.carriage), 'insert', {parent: R.carriage});
  if (R.chainIns.length !== 3 || R.sideIns.length !== 2) throw Error('rear Z joint: unexpected M3 insert split');
  R.chainScrews = each('z-rear-chain-insert-m3x6', 'M3x6 BHCS', pick(/Z_Rear_Hardware:1\/M3x6 BHCS/).filter(i => inside3(i, inst(R.chain))), 'bolt', {parent: R.chain});
  function inside3(i, host) { const c = center(i), b = I[host].bbox; return c[0] > b[0][0] - 4 && c[0] < b[1][0] + 4 && c[1] > b[0][1] && c[1] < b[1][1] && c[2] > b[0][2] && c[2] < b[1][2]; }
  if (R.chainScrews.length !== 2) throw Error(`rear chain insert: expected 2 M3x6, found ${R.chainScrews.length}`);

  // ---------- Z motors with integrated lead screws (pp. 108–110) ----------
  const motor = {}, screw = {}, motorM3 = {};
  for (const [s, sub, k] of [['left', 'Z_Stepper_Left', 1], ['right', 'Z_Stepper_Right', 3], ['rear', 'Z_Stepper_Rear', 2]]) {
    const L = new RegExp(`${ZM}${sub}:1/.*NEMA17 Leadscrew 300mm:${k}/`);
    motor[s] = add(`z-motor-${s}`, 'NEMA 17 lead screw motor', pick(new RegExp(L.source + 'Motor_Body'), 1), 'motor', {parent: mount[s]});
    screw[s] = add(`z-leadscrew-${s}`, 'Lead screw, 300 mm', pick(new RegExp(L.source + 'Leadscrew'), 1), 'leadscrew', {parent: motor[s]});
    motorM3[s] = each(`z-motor-${s}-m3x16`, 'M3x16 SHCS', pick(new RegExp(`${ZM}${sub}:1/.*M3x16 SHCS`), 4), 'bolt', {parent: motor[s]});
  }

  // ---------- Feet (pp. 111–117) ----------
  // CAD: Corner_A at front right and rear left, Corner_B at front left and rear right.
  const foot = {};
  for (const [s, path] of [['fr', 'Corner_A:1'], ['fl', 'Corner_B:1'], ['rl', 'Corner_A:2'], ['rr', 'Corner_B:3']]) {
    const P = re => new RegExp(`Skirt:1/Corners:1/${path}/.*` + re);
    const ab = /Corner_A/.test(path) ? 'a' : 'b', file = ab === 'a' ? 'skirt_corner_a_x2' : 'skirt_corner_b';
    const f = {};
    f.body = add(`z-foot-${s}`, `Skirt corner ${ab.toUpperCase()}`, pick(P(`/${file}`), 1), 'primary');
    f.cap = add(`z-foot-${s}-cap`, `Skirt corner ${ab.toUpperCase()} (accent)`, pick(P(`\\[a\\]_${file}`), 1), 'accent', {parent: f.body});
    f.ins = add(`z-foot-${s}-insert`, 'M5 heat set insert', pick(P('M5 Heat Set'), 1), 'insert', {parent: f.body});
    f.capScrews = each(`z-foot-${s}-m3x6`, 'M3x6 BHCS', pick(P('M3x6 BHCS'), 3), 'bolt', {parent: f.cap});
    const m5x10 = pick(P('M5x10 BHCS'), 1), m3x8 = pick(P('M3x8 SHCS'), 1);
    f.m5x10 = add(`z-foot-${s}-m5x10`, 'M5x10 BHCS', m5x10, 'bolt', {parent: f.body});
    f.m3x8 = add(`z-foot-${s}-m3x8`, 'M3x8 SHCS', m3x8, 'bolt', {parent: f.body});
    f.tn5 = tnuts(`z-foot-${s}-tnut-m5`, 5, m5x10);
    f.tn3 = tnuts(`z-foot-${s}-tnut-m3`, 3, m3x8);
    f.rubber = add(`z-foot-${s}-rubber`, 'Rubber foot', pick(P('Rubber Foot'), 1), 'misc', {parent: f.body});
    f.m5x16 = add(`z-foot-${s}-m5x16`, 'M5x16 BHCS', pick(P('M5x16 BHCS'), 1), 'bolt', {parent: f.rubber});
    foot[s] = f;
  }

  // ---------- tips ----------
  const TNUT_ORIENT = {kind: 'tip', title: 'T-nut orientation', text: 'Insert the t-nuts as shown in the highlight.'};
  const ARROWS = {kind: 'tip', title: 'Arrows front', text: 'Orient the part so the arrow points to the front frame extrusion.'};
  const FLAT = {kind: 'warn', title: 'Keep it flat', text: 'Make sure the top surfaces of the extrusions and the printed part sit on the same plane. This keeps the motor, leadscrew, and linear rail properly aligned.'};
  const EASY = {kind: 'tip', title: 'Easy peasy', text: 'The rail stop clicks into the extrusion channel - no hardware required. Push it all the way up against the front idler.'};
  const SEAT_STOP = {kind: 'tip', title: 'Seat against the rail stop', text: 'Push the linear rail up until it seats against the rail stop.'};
  const GAP_FRONT = {kind: 'check', title: 'Bottom gap', text: 'With the rail pushed up against the rail stop, a small gap remains at the bottom to fit the motor cover.'};
  const RAIL_SAFETY = {kind: 'warn', title: 'Rail safety', text: 'Mind the rail carriage during installation. If your rails were delivered with plastic stoppers you can also temporarily reinstall them to prevent carriages from falling off their rails and spilling their bearing balls.'};
  const CENTERED = {kind: 'tip', title: 'Centered rail installation guide', text: 'Use the MGN9 guides to position the rail in the center of the extrusion prior to fastening the screws.'};
  const NO_TIGHT = {kind: 'warn', title: 'Don’t fully tighten', text: 'For best results do not tighten fully.'};
  const MOTOR_ORIENT = {kind: 'warn', title: 'Motor orientation', text: 'Pay attention to the orientation of the cable exit.'};
  const LUBE = {kind: 'tip', title: 'Apply lubrication', text: 'Apply a thin layer of grease to metal leadscrew nuts for smooth operation. Plastic or polymer leadscrew nuts don’t need grease because they self-lubricate. Refer to the Sourcing Guide for lubricant options.', link: 'https://vorondesign.com/sourcing_guide'};
  const PART_ORIENT = {kind: 'warn', title: 'Mind the part orientation', text: 'The profile shown above are towards the front and rear of the printer.'};
  const RAIL_GUIDE = {name: 'MGN9 rail centering guide (printed)', qty: 1, kind: 'tool'};

  // ---------- steps ----------
  const frontRail = (s, pages) => {
    const az = s === 'left' ? 115 : 65;
    const sec = `Z Axis - Front ${s === 'left' ? 'Left' : 'Right'}`;
    return [
      {
        id: `z-${s}-mount`, section: sec, title: 'Z motor mount', pages: [pages[0]],
        view: {az: s === 'left' ? 60 : 120, el: 62},
        movers: [...tnutMovers(mountTn[s]), {id: mount[s], vec: [0, 0, 80], phase: 1, delay: 0}],
        text: [`Drop an M5 T-nut into the front and the ${s} bottom extrusion, next to the corner.`, `Set z_stepper_${s} into the corner over the T-nuts, with its arrow pointing to the front.`],
        notes: [TNUT_ORIENT, ARROWS]
      },
      {
        id: `z-${s}-mount-screws`, section: sec, title: 'Fix the motor mount', pages: [pages[1]],
        view: {az: s === 'left' ? 60 : 120, el: 62},
        movers: auto(mountM5[s], 0, 0.15),
        text: ['Fix the mount with 2 M5x16 BHCS into the T-nuts.'],
        notes: [FLAT]
      },
      {
        id: `z-${s}-stop`, section: sec, title: 'Rail stop', pages: [pages[2]],
        view: {az, el: 10},
        movers: [{id: stop[s], vec: [0, 0, -60], phase: 0, delay: 0}],
        text: [`Click the Z rail stop into the channel of the front ${s} post and push it up against the front idler.`],
        notes: [EASY]
      },
      {
        id: `z-${s}-rail`, section: sec, title: 'Z rail', pages: [pages[3], pages[4]],
        view: {az, el: 12},
        movers: [...tnutMovers(railTn[s]), {id: rail[s], vec: [0, 60, 0], phase: 1, delay: 0}, {id: mgn[s], vec: [0, 0, 0], phase: 1, delay: 0}, ...auto(railM3[s], 2, 0.07)],
        text: [`Drop 8 M3 T-nuts into the back face of the front ${s} post.`, 'Lay the MGN9 rail on the T-nuts, push it up until it seats against the rail stop and fix it with 8 M3x8 SHCS.'],
        notes: [TNUT_ORIENT, RAIL_SAFETY, SEAT_STOP, GAP_FRONT],
        extras: [RAIL_GUIDE]
      }
    ];
  };

  const jointBench = (s, pages, sec) => {
    const j = joint[s];
    return [
      {
        id: `z-${s}-joint-cap`, section: sec, title: 'Insert and accent cap', pages: [pages[0]],
        bench: [j.carriage], view: {az: -60, el: -35},
        movers: [...auto([j.m5ins]), {id: j.cap, vec: [0, 0, -40], phase: 1, delay: 0}, ...auto(j.capScrews, 2, 0.1)],
        text: [`Press an M5 heat set insert into z_carriage_${s}.`, `Fit the accent cover and fix it with 3 M3x6 BHCS.`],
        notes: [notes.INSERTS]
      }
    ];
  };
  const jointNut = (s, pages, sec) => {
    const j = joint[s];
    return {
      id: `z-${s}-joint-nut`, section: sec, title: 'Lead screw nut', pages,
      bench: [j.carriage], view: {az: -60, el: -35},
      movers: [{id: j.nut, vec: [0, 0, -40], phase: 0, delay: 0}, ...auto(j.m3x12, 1, 0.12), ...move(j.locknuts, [0, 0, -30], 2, 0.12)],
      text: ['Fit the lead screw nut under the joint and fix it with 2 M3x12 SHCS and 2 M3 lock nuts.'],
      notes: [NO_TIGHT]
    };
  };
  const jointMount = (s, page, sec, view) => {
    const j = joint[s], vec = s === 'rear' ? [-70, 0, 0] : [0, 70, 0];
    return {
      id: `z-${s}-joint-mount`, section: sec, title: 'Onto the Z carriage', pages: [page],
      view,
      movers: [{id: j.carriage, vec, phase: 0, delay: 0}, ...auto(j.m3x8, 1, 0.12)],
      text: [`Offer the ${s} Z joint up to the rail carriage and fix it with ${j.m3x8.length} M3x8 SHCS.`]
    };
  };
  const motorStep = (s, page, sec, view) => ({
    id: `z-${s}-motor`, section: sec, title: 'Z motor and lead screw', pages: [page],
    view,
    movers: [{id: motor[s], vec: [0, 0, -280], phase: 0, delay: 0}, {id: screw[s], vec: [0, 0, 0], phase: 0, delay: 0}, ...auto(motorM3[s], 1, 0.1)],
    text: [`Thread the lead screw through z_stepper_${s} into the lead screw nut.`, 'Fix the motor to the mount with 4 M3x16 SHCS.'],
    notes: [MOTOR_ORIENT, LUBE]
  });
  const footStep = (keys, pages, title, view, text, extraNotes = []) => ({
    id: `z-feet-${keys.join('-')}`, section: 'Feet', title, pages, view,
    movers: [
      ...move(keys.map(k => foot[k].body), [0, 0, -80], 0, 0.15),
      ...auto(keys.flatMap(k => [foot[k].m5x10, foot[k].m3x8]), 1, 0.1),
      ...move(keys.map(k => foot[k].rubber), [0, 0, -40], 2, 0.15),
      ...auto(keys.map(k => foot[k].m5x16), 3, 0.15)
    ],
    text, notes: [...extraNotes, PART_ORIENT]
  });

  const ALL_FEET = ['fr', 'fl', 'rl', 'rr'];
  return [
    // Parts preparation
    {
      id: 'z-prep-rear-inserts', section: 'Z-Axis Parts Preparation', title: 'Cable chain insert and rear joint inserts', pages: [79],
      bench: [R.chain, R.carriage], view: {az: -150, el: 20},
      movers: [...auto(R.chainIns, 0, 0.1), ...auto(R.sideIns, 1, 0.12)],
      text: ['Press 3 M3 heat set inserts into the 3 hole cable chain insert.', 'Press 2 M3 heat set inserts into the side of z_carriage_rear.'],
      notes: [
        {kind: 'tip', title: 'Generic cable chain', text: 'The 3 hole pattern is usually found on generic cable chains.'},
        {kind: 'tip', title: 'IGUS cable chain', text: 'IGUS chain have 2 mounting holes. Use the 2 hole insert with 2 M3 heat set inserts instead.'},
        {kind: 'tip', title: 'Cable chain mounting pattern', text: 'Multiple mounting patterns are available for cable chains on the market. Pick the part that matches with the hole pattern on your mounting chain. The remainder of the manual will only show the “generic” pattern.'}
      ]
    },
    {
      id: 'z-prep-rear-cap', section: 'Z-Axis Parts Preparation', title: 'Rear joint insert and accent cap', pages: [80],
      bench: [R.carriage], view: {az: -60, el: -35},
      movers: [...auto([R.m5ins]), {id: R.cap, vec: [0, 0, -40], phase: 1, delay: 0}, ...auto(R.capScrews, 2, 0.1)],
      text: ['Press an M5 heat set insert into z_carriage_rear.', 'Fit the accent cover and fix it with 3 M3x6 BHCS.'],
      notes: [notes.INSERTS]
    },
    {
      id: 'z-prep-mounts', section: 'Z-Axis Parts Preparation', title: 'Motor mount inserts', pages: [81],
      bench: [mount.left, mount.right, mount.rear], shift: {ids: [mount.rear], vec: [0, -310, 0]}, view: {az: -70, el: 40},
      movers: auto([mountIns.left, mountIns.right, mountIns.rear], 0, 0.15),
      text: ['Press one M3 heat set insert into each of the three Z motor mounts: z_stepper_left, z_stepper_right and z_stepper_rear.']
    },

    // Rear
    {
      id: 'z-rear-mount', section: 'Z Axis - Rear', title: 'Rear Z motor mount', pages: [82],
      view: {az: -70, el: 35},
      movers: [...tnutMovers(mountTn.rear), {id: mount.rear, vec: [0, 0, 80], phase: 1, delay: 0}],
      text: ['Drop 2 M5 T-nuts into the inner face of the C extrusion, either side of the vertical brace.', 'Set z_stepper_rear on the T-nuts.']
    },
    {
      id: 'z-rear-square', section: 'Z Axis - Rear', title: 'Square up the rear mount', pages: [83],
      view: {az: -80, el: 30},
      movers: auto(mountM5.rear, 0, 0.15),
      text: ['Fit 2 M5x16 BHCS into the T-nuts.', 'Align the mount with the vertical brace using the alignment tool, then snug up the screws.'],
      notes: [{kind: 'tip', title: 'Square it up', text: 'Use the alignment tool to bring the rear Z motor mount into alignment with the vertical brace, then snug up the M5 screws. Make sure the top surface of the extrusions and the printed part are flush.'}],
      extras: [{name: 'Z alignment tool, rear (printed tool)', qty: 1, kind: 'tool'}]
    },
    {
      id: 'z-rear-rail', section: 'Z Axis - Rear', title: 'Rear Z rail', pages: [84, 85, 86],
      view: {az: -155, el: 12},
      movers: [...tnutMovers(railTn.rear), {id: rail.rear, vec: [-60, 0, 0], phase: 1, delay: 0}, {id: mgn.rear, vec: [0, 0, 0], phase: 1, delay: 0}, ...auto(railM3.rear, 2, 0.07)],
      text: ['Drop 8 M3 T-nuts into the left face of the vertical brace (H extrusion).', 'Lay the MGN9 rail on the T-nuts, push it up until it seats against the brace at the top and fix it with 8 M3x8 SHCS.'],
      notes: [RAIL_SAFETY, TNUT_ORIENT, CENTERED,
        {kind: 'tip', title: 'Seat against the brace', text: 'Push the linear rail until it seats against the vertical brace.'},
        {kind: 'check', title: 'Bottom gap', text: 'With the rail seated against the top brace, a small gap should remain here to clear the cover part.'}],
      extras: [RAIL_GUIDE]
    },

    // Front left, front right
    ...frontRail('left', [87, 88, 89, 90, 91]),
    ...frontRail('right', [92, 93, 94, 95, 96]),

    // Z joints on the bench
    ...jointBench('left', [97], 'Left Z Joint'),
    jointNut('left', [98], 'Left Z Joint'),
    ...jointBench('right', [99], 'Right Z Joint'),
    jointNut('right', [100], 'Right Z Joint'),
    jointNut('rear', [101], 'Rear Z Joint'),

    // Z joints onto the carriages
    {...jointMount('left', 103, 'Left Z Joint', {az: 125, el: 15}), pages: [102, 103]},
    jointMount('right', 104, 'Right Z Joint', {az: 55, el: 15}),
    jointMount('rear', 105, 'Rear Z Joint', {az: -125, el: -8}),
    {
      id: 'z-rear-chain', section: 'Part Preparation', title: 'Cable chain insert', pages: [106],
      view: {az: -125, el: -8},
      movers: [{id: R.chain, vec: [-40, 0, 0], phase: 0, delay: 0}, ...auto(R.chainScrews, 1, 0.12)],
      text: ['Fit the cable chain insert to the side of the rear Z joint with 2 M3x6 BHCS.']
    },

    // Flip and motors
    {
      id: 'z-flip', section: 'Z Axis', title: 'Flip upside down', pages: [107],
      view: {az: -60, el: -20}, focus: ['b-fl', 'b-fr', 'b-rl', 'b-rr'], movers: [],
      text: ['Turn the printer upside down for the next assembly steps.', 'The views that follow look at the printer from below, so it stays the right way up on screen.'],
      notes: [{kind: 'tip', title: 'Flip upside down', text: 'Turn the printer upside down for the next assembly steps.'}]
    },
    motorStep('left', 108, 'Left Z Motor', {az: -105, el: -25}),
    motorStep('right', 109, 'Right Z Motor', {az: -75, el: -25}),
    motorStep('rear', 110, 'Rear Motor', {az: -80, el: -25}),

    // Feet
    {
      id: 'z-feet-assemble', section: 'Feet', title: 'Assemble four feet', pages: [111],
      bench: ALL_FEET.map(k => foot[k].body), shift: {ids: [foot.rl.body, foot.rr.body], vec: [195, -364, 0]}, view: {az: -70, el: -35},
      movers: [...auto(ALL_FEET.map(k => foot[k].ins), 0, 0.1), ...move(ALL_FEET.map(k => foot[k].cap), [0, 0, -35], 1, 0.1), ...auto(ALL_FEET.flatMap(k => foot[k].capScrews), 2, 0.04)],
      text: ['Press an M5 heat set insert into each skirt corner.', 'Fit the accent cap and fix it with 3 M3x6 BHCS.'],
      notes: [{kind: 'tip', title: 'Assemble four feet', text: 'Repeat the instructions and assemble all four feet.'}]
    },
    {
      id: 'z-feet-tnuts', section: 'Feet', title: 'T-nuts for the feet', pages: [112],
      view: {az: -60, el: -40},
      movers: tnutMovers({ids: ALL_FEET.flatMap(k => [...foot[k].tn5.ids, ...foot[k].tn3.ids]), vec: Object.assign({}, ...ALL_FEET.flatMap(k => [foot[k].tn5.vec, foot[k].tn3.vec]))}),
      text: ['At each bottom corner, drop an M5 T-nut into the side extrusion and an M3 T-nut into the front or rear extrusion, as shown.']
    },
    footStep(['fr'], [113, 114], 'Front right foot', {az: -45, el: -25},
      ['Slide a foot over the front right corner and fix it with an M5x10 BHCS and an M3x8 SHCS through the access hole.', 'Fix a rubber foot to it with an M5x16 BHCS.']),
    footStep(['fl'], [115, 116], 'Front left foot', {az: -135, el: -25},
      ['Repeat for the front left corner: M5x10 BHCS and M3x8 SHCS, then the rubber foot with an M5x16 BHCS.']),
    footStep(['rl', 'rr'], [117], 'Rear feet', {az: 90, el: -25},
      ['Fit the two rear feet the same way.'])
  ];
};
