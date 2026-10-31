// Wiring Preparation (manual pp. 190–211): Z chain anchor, cable covers, deck panel, Z motor
// covers, deck supports, DIN rails and the zip tie loops on the rear posts.
// Pages 190 (chapter title) and 212 (trivia) are not steps.
module.exports = ctx => {
  const {I, pick, free, center, inside, dist, add, each, hostOf, auto, move, ext, notes} = ctx;
  const extHosts = Object.entries(ext).map(([id, [i]]) => [id, i]);
  const TN = /Frame:1\/Frame_Hardware:1\/T-Nuts:1\//;

  // Hardware in other chapters' subtrees: only what no earlier chapter took, with exact counts.
  const soft = (re, n) => free(re, n);
  // Pool T-nuts by position: the free T-nut of the given size nearest to each point (mm).
  const tnuts = (size, pts, tol = 6) => {
    const taken = new Set();
    return pts.map(p => {
      const i = free(TN).filter(k => !taken.has(k) && new RegExp(`M${size}\\b`).test(I[k].name))
        .sort((a, b) => dist(center(a), p) - dist(center(b), p))[0];
      if (i === undefined || dist(center(i), p) > tol) throw Error(`09-wiring-prep: no free M${size} T-nut near ${p}`);
      taken.add(i);
      return i;
    });
  };
  // Start offset out of the extrusion face a piece sits in: the largest offset of its centre
  // from the extrusion's axis, across the profile.
  const outOf = (i, host, d = 30) => {
    const c = center(i), h = center(ext[host][0]), b = I[ext[host][0]].bbox;
    const long = [0, 1, 2].sort((x, y) => (b[1][y] - b[0][y]) - (b[1][x] - b[0][x]))[0];
    const off = c.map((v, k) => k === long ? 0 : v - h[k]);
    const k = [0, 1, 2].sort((x, y) => Math.abs(off[y]) - Math.abs(off[x]))[0];
    const v = [0, 0, 0]; v[k] = Math.sign(off[k]) * d;
    return v;
  };
  // Parent = the frame extrusion whose box is nearest to the piece's centre.
  const boxDist = (c, j) => Math.hypot(...c.map((v, k) => Math.max(I[j].bbox[0][k] - v, 0, v - I[j].bbox[1][k])));
  const onExt = i => ({parent: extHosts.slice().sort((a, b) => boxDist(center(i), a[1]) - boxDist(center(i), b[1]))[0][0]});
  const tnutMovers = (ids, phase = 0, gap = 0.08, start = 0) => ids.map((id, n) => ({id, vec: outOf(ctx.part(id).inst[0], ctx.part(id).parent), phase, delay: start + n * gap}));

  // ---------- Z chain anchor (CAD: 3-hole variant, matching the 10x11 chain) ----------
  const zcA = add('wp-zc-anchor', 'Z chain lower (3 hole)', pick(/Z_Chain_Lower_Printed:1\/z_chain_lower_3hole/, 1), 'primary');
  const zcInst = ctx.part(zcA).inst[0];
  // The CAD overlays the 2-hole and 3-hole variants with 2 + 3 inserts; the 3-hole ones are
  // those the chain's three lower M3x6 FHCS thread into.
  const zcAll = pick(/Z_Chain_Lower_Hardware:1\/M3 Heat Set/, 5);
  const zcIns3 = pick(/10x11 Chain Z:1\/M3x6 FHCS/, 6).filter(i => center(i)[2] < -400)
    .map(f => zcAll.slice().sort((a, b) => dist(center(a), center(f)) - dist(center(b), center(f)))[0]);
  if (new Set(zcIns3).size !== 3) throw Error('09-wiring-prep: 3-hole Z chain anchor inserts not resolved');
  const zcIns = each('wp-zc-insert', 'M3 heat set insert', zcIns3, 'insert', {parent: zcA});
  const zcBolts = each('wp-zc-m3x8', 'M3x8 SHCS', pick(/Z_Chain_Lower_Hardware:1\/M3x8 SHCS/, 2), 'bolt', {parent: zcA});
  const zcTn = each('wp-zc-tnut', 'M3 T-nut', tnuts(3, zcBolts.map(id => center(ctx.part(id).inst[0])).map(c => [c[0], 390, -504])), 'tnut', onExt);

  // ---------- Cable covers (rear corners) ----------
  const ccR = add('wp-cc-right', 'Deck wire cover, right', pick(/Deck_Wire_Cover_Right:1\/=>/, 1), 'primary');
  const ccL = add('wp-cc-left', 'Deck wire cover, left', pick(/Deck_Wire_Cover_Left:1\/=>/, 1), 'primary');
  const ccRb = each('wp-cc-right-m3x8', 'M3x8 SHCS', pick(/Deck_Wire_Cover_Right:1\/M3x8 SHCS/, 2), 'bolt', {parent: ccR});
  const ccLb = each('wp-cc-left-m3x8', 'M3x8 SHCS', pick(/Deck_Wire_Cover_Left:1\/M3x8 SHCS/, 2), 'bolt', {parent: ccL});
  const below = ids => ids.map(id => { const c = center(ctx.part(id).inst[0]); return [c[0], c[1], -504]; });
  const ccRt = each('wp-cc-right-tnut', 'M3 T-nut', tnuts(3, below(ccRb)), 'tnut', onExt);
  const ccLt = each('wp-cc-left-tnut', 'M3 T-nut', tnuts(3, below(ccLb)), 'tnut', onExt);

  // ---------- Deck panel (Panels:1/Opaque Panels:1/Deck_Panel:1) ----------
  const deck = soft(/Opaque Panels:1\/Deck_Panel:1/, 1);
  const deckId = deck.length ? add('wp-deck-panel', 'Deck panel', deck, 'panel') : null;

  // ---------- Z motor covers ----------
  const covers = {};
  for (const [k, sub, label] of [['right', 'Z_Stepper_Right', 'right'], ['rear', 'Z_Stepper_Rear', 'rear'], ['left', 'Z_Stepper_Left', 'left']]) {
    const P = re => new RegExp(`Z_Motors:1/${sub}:1/.*` + re);
    const two = pick(P(`\\[a\\]_z_cover_${label}`), 2).sort((a, b) => ctx.volume(b) - ctx.volume(a));
    const cover = add(`wp-zcover-${k}`, `Z cover ${label}`, two[0], 'accent');
    const clip = add(`wp-zclip-${k}`, `Z cover ${label}, clip`, two[1], 'accent');
    const st = each(`wp-zclip-${k}-m2`, 'M2x10 self tapping screw', soft(P('M2x10 Self Tapping'), 1), 'bolt', {parent: clip});
    const m3 = soft(P('M3x6 BHCS'), 3);
    const bolts = each(`wp-zcover-${k}-m3x6`, 'M3x6 BHCS', m3, 'bolt', {parent: cover});
    // The centre screw threads into the mount's insert; the outer two into T-nuts in the frame.
    const outer = m3.filter(i => { const c = center(i); return c[0] > -6 || c[0] < -384 || c[1] < 6 || c[1] > 384; });
    const tn = each(`wp-zcover-${k}-tnut`, 'M3 T-nut', tnuts(3, outer.map(i => { const c = center(i); return [c[0], c[1], -504]; })), 'tnut', onExt);
    // The mount's M3 insert is pressed in by the Z Axis chapter (parts preparation).
    const ins = [];
    covers[k] = {cover, clip, st, bolts, tn, ins};
  }

  // ---------- Deck supports ----------
  const dsInst = pick(/Deck Supports:1\/Deck Support/, 6);
  const dsRear = dsInst.filter(i => center(i)[1] > 200), dsFront = dsInst.filter(i => center(i)[1] < 200);
  const ds = each('wp-deck-support', 'Deck support', [...dsRear, ...dsFront], 'primary', onExt);
  const dsR = ds.slice(0, dsRear.length), dsF = ds.slice(dsRear.length);

  // ---------- DIN rails ----------
  const rails = pick(/Electronics:1\/DIN3 Rail/, 2).sort((a, b) => center(a)[1] - center(b)[1]);
  const railIds = rails.map((i, n) => add(`wp-din-rail-${n + 1}`, 'DIN rail', i, 'misc', {note: n ? 'rear rail' : 'front rail'}));
  const railHosts = railIds.map((id, n) => [id, rails[n]]);
  const near = (i, hosts) => hosts.slice().sort((a, b) => Math.abs(center(a[1])[1] - center(i)[1]) - Math.abs(center(b[1])[1] - center(i)[1]))[0][0];
  const centres = [1, 2].map(n => add(`wp-din-center-${n}`, 'DIN center support', pick(new RegExp(`DIN_Center_Support:${n}/`), 2).sort((a, b) => ctx.volume(b) - ctx.volume(a)), 'primary'));
  for (const id of centres) ctx.part(id).parent = near(ctx.part(id).inst[0], railHosts);
  const mounts = [1, 2, 3, 4].map(n => add(`wp-din-mount-${n}`, 'DIN mount', pick(new RegExp(`Electronics:1/DIN_Mount:${n}/(=>|Din_Mount Foam)`), 2).sort((a, b) => ctx.volume(b) - ctx.volume(a)), 'primary'));
  for (const id of mounts) ctx.part(id).parent = near(ctx.part(id).inst[0], railHosts);
  const mountHosts = mounts.map(id => [id, ctx.part(id).inst[0]]);
  const dinM5 = each('wp-din-m5x16', 'M5x16 BHCS', pick(/Electronics:1\/DIN_Mount:\d\/M5x16 BHCS/, 8), 'bolt', i => ({parent: hostOf(i, mountHosts)}));
  const dinM3 = each('wp-din-m3x8', 'M3x8 SHCS', pick(/Electronics:1\/DIN_Mount:\d\/M3x8 SHCS/, 4), 'bolt', i => ({parent: hostOf(i, mountHosts)}));
  // Nine M5 T-nuts on the inside faces of the bottom side extrusions (p.205 shows 5 + 4): four
  // per side for the DIN mounts and one on the right for the 24V PSU stabilizer. The WAGO
  // mount's side T-nut goes in on p.224 (10-electronics).
  const sideM5 = [...pick(/Electronics:1\/DIN_Mount:\d\/M5x16 BHCS/, 8), ...pick(/PSU_Stabilizer:1\/M5x10 BHCS/, 1)]
    .map(i => { const c = center(i); return [c[0] > -200 ? -6 : -384, c[1], -510]; });
  const dinTn = each('wp-din-tnut', 'M5 T-nut', tnuts(5, sideM5, 4), 'tnut', onExt);

  // ---------- Zip tie loops (Cable Frame Anchors on the rear posts) ----------
  const ztLeft = pick(/Cable Frame Anchors:1\/Cable Frame Anchor/).filter(i => center(i)[0] < -370 && center(i)[1] > 380 && center(i)[2] < -200).sort((a, b) => center(b)[2] - center(a)[2]);
  const ztRight = pick(/Cable Frame Anchors:1\/Cable Frame Anchor/).filter(i => center(i)[0] > -20 && center(i)[1] > 380 && center(i)[2] < -200).sort((a, b) => center(b)[2] - center(a)[2]);
  if (ztLeft.length !== 3 || ztRight.length !== 3) throw Error('09-wiring-prep: expected 3 zip tie loops on each rear post');
  const ztL = each('wp-ziploop-left', 'Zip tie loop', ztLeft, 'primary', onExt);
  const ztR = each('wp-ziploop-right', 'Zip tie loop', ztRight, 'primary', onExt);

  // ---------- steps ----------
  const DONT = {kind: 'warn', title: 'Don’t overtighten', text: 'The screws are used to keep the DIN rails from sliding and are threaded directly into plastic.'};
  const TWIST = (what, cw = true) => ({kind: 'tip', title: 'Twist to lock', text: `Rotate the ${what}${cw ? ' clockwise' : ''} by 90° to lock them in place.`});
  const c = covers;
  const coverSteps = [['right', 'Right', [197, 198], 30], ['rear', 'Rear', [199, 200], 120], ['left', 'Left', [201, 202], 150]].flatMap(([k, K, pg, az]) => [
    {
      id: `wp-zcover-${k}-clip`, section: `${K} Z Motor Cover`, title: 'T-nuts and clip', pages: [pg[0]],
      view: {az, el: 40}, focus: [c[k].clip],
      movers: [...tnutMovers(c[k].tn, 0, 0.12), ...auto(c[k].ins, 0), {id: c[k].clip, vec: [0, 0, 40], phase: 1, delay: 0}, ...auto(c[k].st, 2)],
      text: [`Drop 2 M3 T-nuts into the top slots of the extrusions next to the ${k} Z motor.`, 'Lay the clip over the motor mount and fix it with an M2x10 self tapping screw.'],
      notes: [{kind: 'warn', title: 'Don’t overtighten', text: 'Self tapping screws thread directly into plastic and strip easily.'}]
    },
    {
      id: `wp-zcover-${k}`, section: `${K} Z Motor Cover`, title: `${K} Z motor cover`, pages: k === 'rear' ? [pg[1]] : [196, pg[1]],
      view: {az, el: 40},
      movers: [{id: c[k].cover, vec: [0, 0, 60], phase: 0, delay: 0}, ...auto(c[k].bolts, 1, 0.12)],
      text: [`Slide the ${k} Z motor cover around the lead screw and fix it with 3 M3x6 BHCS.`],
      notes: k === 'rear' ? [] : [{kind: 'tip', title: 'Cover orientation', text: 'The front motor covers have small indicator arrows on the underside that must point toward the front of the printer.'}]
    }
  ]);

  return [
    {
      id: 'wp-zchain-inserts', section: 'Z Chain Anchor', title: 'Heat set inserts', pages: [191],
      bench: [zcA], view: {az: -60, el: 30},
      movers: auto(zcIns, 0, 0.12),
      text: ['Press 3 M3 heat set inserts into the upright of the Z chain anchor.'],
      notes: [notes.INSERTS]
    },
    {
      id: 'wp-zchain-mount', section: 'Z Chain Anchor', title: 'Mount the Z chain anchor', pages: [191, 192],
      view: {az: 70, el: 35},
      movers: [...tnutMovers(zcTn, 0, 0.12), {id: zcA, vec: [0, 0, 60], phase: 1, delay: 0}, ...auto(zcBolts, 2, 0.12)],
      text: ['Drop 2 M3 T-nuts into the top slot of the lower back (C) extrusion, left of the rear Z motor.', 'Fix the Z chain anchor with 2 M3x8 SHCS, 88 mm from the rear vertical (H) extrusion as drawn.']
    },
    {
      id: 'wp-cable-covers', section: 'Cable Cover', title: 'Cable covers in the rear corners', pages: [193, 194],
      view: {az: 110, el: 40},
      movers: [...tnutMovers([...ccRt, ...ccLt], 0, 0.08), ...move([ccR, ccL], [0, 0, 50], 1, 0.15), ...auto([...ccRb, ...ccLb], 2, 0.08)],
      text: ['In both rear corners, drop 2 M3 T-nuts into the top slots of the bottom extrusions.', 'Lay a cable cover over the corner and fix it with 2 M3x8 SHCS.']
    },
    ...(deckId ? [{
      id: 'wp-deck-panel', section: 'Deck Panel', title: 'Lay in the deck panel', pages: [195],
      view: {az: -60, el: 40},
      movers: [{id: deckId, vec: [0, 0, 120], phase: 0, delay: 0}],
      text: ['Lay the deck panel on the bottom frame.'],
      notes: [{kind: 'tip', title: 'Panel orientation', text: 'Align the notch to the back and in line with the Z chain anchor.'}]
    }] : []),
    ...coverSteps,
    {
      id: 'wp-deck-supports-rear', section: 'Deck Panel', title: 'Deck supports, rear', pages: [203],
      view: {az: -135, el: -55},
      movers: dsR.map((id, n) => ({id, vec: outOf(ctx.part(id).inst[0], ctx.part(id).parent), phase: 0, delay: n * 0.15})),
      text: ['Turn the printer upside down.', 'Push the deck supports into the slots of the bottom extrusions at the back and twist them to lock.'],
      notes: [TWIST('deck supports')]
    },
    {
      id: 'wp-deck-supports-front', section: 'Deck Panel', title: 'Deck supports, front', pages: [204],
      view: {az: -60, el: -40},
      movers: dsF.map((id, n) => ({id, vec: outOf(ctx.part(id).inst[0], ctx.part(id).parent), phase: 0, delay: n * 0.15})),
      text: ['Repeat at the front.'],
      notes: [TWIST('deck supports', false)]
    },
    {
      id: 'wp-din-tnuts', section: 'DIN Rails', title: 'M5 T-nuts for the DIN rails', pages: [205],
      view: {az: -90, el: -45},
      movers: tnutMovers(dinTn, 0, 0.06),
      text: ['Drop 5 M5 T-nuts into the inner slot of the right bottom extrusion and 4 into the inner slot of the left one.']
    },
    {
      id: 'wp-din-rails', section: 'DIN Rails', title: 'DIN rails and mounts', pages: [206],
      view: {az: -90, el: -50},
      movers: [...move(railIds, [0, 0, -80], 0, 0.2), ...move(centres, [0, 0, -25], 0, 0.2), ...mounts.map(id => ({id, vec: [center(ctx.part(id).inst[0])[0] > -200 ? -40 : 40, 0, 0], phase: 0, delay: 0}))],
      text: ['Clip a DIN mount onto both ends of each DIN rail and a DIN center support in the middle.', 'Offer both rails up to the underside of the deck.']
    },
    {
      id: 'wp-din-slide', section: 'DIN Rails', title: 'Space and slide into position', pages: [207],
      view: {az: -90, el: -60},
      movers: mounts.map((id, n) => ({id, vec: [center(ctx.part(id).inst[0])[0] > -200 ? -40 : 40, 0, 0], phase: 0, delay: n * 0.08, again: true})),
      text: ['Roughly centre the DIN rails and space them about 80 mm apart.', 'Slide the mounts all the way to the extrusions.'],
      notes: [{kind: 'tip', title: 'Spacing', text: 'Roughly center the DIN rails and space them about 80mm apart.'}, {kind: 'tip', title: 'Slide into position', text: 'Slide the mounts all the way to the extrusions.'}]
    },
    {
      id: 'wp-din-m5', section: 'DIN Rails', title: 'Fix the DIN mounts', pages: [208],
      view: {az: -90, el: -40},
      movers: auto(dinM5, 0, 0.08),
      text: ['Fix each DIN mount to the extrusion with 2 M5x16 BHCS into the T-nuts.']
    },
    {
      id: 'wp-din-m3', section: 'DIN Rails', title: 'Lock the rails', pages: [209],
      view: {az: -90, el: -55},
      movers: auto(dinM3, 0, 0.12),
      text: ['Fit one M3x8 SHCS into each DIN mount to stop the rail from sliding.'],
      notes: [DONT]
    },
    {
      id: 'wp-ziploops-left', section: 'Zip Tie Loops', title: 'Rear left post', pages: [210],
      view: {az: 60, el: 15},
      movers: ztL.map((id, n) => ({id, vec: outOf(ctx.part(id).inst[0], 'b-rl'), phase: 0, delay: n * 0.15})),
      text: ['Push 3 zip tie loops into the slot of the rear left post and twist them to lock.'],
      notes: [TWIST('zip tie loops')]
    },
    {
      id: 'wp-ziploops-right', section: 'Zip Tie Loops', title: 'Rear right post', pages: [211],
      view: {az: 120, el: 15},
      movers: ztR.map((id, n) => ({id, vec: outOf(ctx.part(id).inst[0], 'b-rr'), phase: 0, delay: n * 0.15})),
      text: ['Repeat on the rear right post.'],
      notes: [TWIST('zip tie loops')]
    }
  ];
};
