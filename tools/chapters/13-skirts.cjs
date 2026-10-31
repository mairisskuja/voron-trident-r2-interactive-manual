// Skirts (manual pp. 269–290): heat set inserts, LCD, logo and keystone inserts, front, rear and
// side skirts with the electronics bay fans, and the bottom panel.
// The CAD holds skirts for all three sizes; only the *_250 ones are used. The skirt corners and
// feet (Skirt:1/Corners) belong to the Feet chapter (pp. 111–117) and the power inlet skirt
// (Rear_Skirt_Power_Inlet) to the Power Inlet pages (pp. 221–222); they are left alone here.
module.exports = ctx => {
  const {I, pick, free, center, dist, add, each, hostOf, part, auto, move, notes} = ctx;
  const S = re => new RegExp('Skirt:1/(Rear:1/)?' + re);
  const inst = id => part(id).inst[0];
  const one = re => pick(re, 1)[0];

  // Drop-in T-nuts from the shared Frame_Hardware pool: the free one nearest each screw.
  const tnut = (kind, screw, pt) => {
    const c = pt || center(screw);
    const cand = free(new RegExp(`Frame_Hardware:1/T-Nuts:1/2020 Drop-in T-nut, ${kind}`))
      .map(i => [i, dist(center(i), c)]).sort((a, b) => a[1] - b[1])[0];
    if (!cand || cand[1] > 10) throw Error(`no free ${kind} T-nut near ${c.map(v => v.toFixed(0))}`);
    return cand[0];
  };
  const tnuts = (prefix, kind, screws, parent, ptOf) => screws.map((s, n) => {
    const i = tnut(kind, s, ptOf && ptOf(s));
    return add(`${prefix}-${n + 1}`, `${kind} T-nut`, i, 'tnut', {parent});
  });

  // ---------- printed skirts ----------
  const frontL = add('sk-front-l', 'Front skirt left', one(S('Front:1/Left:1/front_skirt_left_250')), 'primary', {note: '250 size'});
  const frontR = add('sk-front-r', 'Front skirt right', one(S('Front:1/Right:1/front_skirt_right_250')), 'primary', {note: '250 size'});
  const keystone = add('sk-keystone', 'Rear skirt keystone', one(S('Rear_Skirt_Keystone:1/rear_skirt_keystone')), 'primary');
  const rearC = add('sk-rear-c', 'Rear skirt center', one(S('Rear:1/Center:1/rear_skirt_center_250')), 'primary', {note: '250 size'});
  const side = {};
  for (const [k, grp] of [['l', 'Side_Skirt_No_Fan'], ['r', 'Side_Skirt_Fan']]) {
    const G = re => S(grp + ':1/' + re);
    side[k] = {
      a: add(`sk-side-${k}-a`, 'Side skirt A', one(G('Side Skirt A:\\d/side_skirt_a_250')), 'primary', {note: '250 size'}),
      b: add(`sk-side-${k}-b`, 'Side skirt B', one(G('Side Skirt B:\\d/side_skirt_b_250')), 'primary', {note: '250 size'}),
      sup: add(`sk-sup-${k}`, 'Side fan support', one(G('Side Fan Support:\\d/side_fan_support')), 'primary'),
      ga: add(`sk-grill-${k}-a`, 'Fan grill A', one(G('\\[a\\]_fan_grill_a_x2')), 'accent'),
      gb: add(`sk-grill-${k}-b`, 'Fan grill B', one(G('\\[a\\]_fand_grill_b_x2')), 'accent'),
      G
    };
  }
  const L = side.l, R = side.r;

  // ---------- heat set inserts (p.270) ----------
  const ins = [
    add('sk-front-l-insert', 'M3 heat set insert', one(S('Front:1/Left:1/M3 Heat Set')), 'insert', {parent: frontL}),
    add('sk-front-r-insert', 'M3 heat set insert', one(S('Front:1/Right:1/M3 Heat Set')), 'insert', {parent: frontR}),
    add('sk-keystone-insert', 'M3 heat set insert', one(S('Rear_Skirt_Keystone:1/M3 Heat Set')), 'insert', {parent: keystone}),
    add('sk-sup-l-insert', 'M3 heat set insert', one(L.G('Side Fan Support:\\d/Side_Fan_Support_Hardware:1/M3 Heat Set')), 'insert', {parent: L.sup}),
    add('sk-sup-r-insert', 'M3 heat set insert', one(R.G('Side Fan Support:\\d/Side_Fan_Support_Hardware:1/M3 Heat Set')), 'insert', {parent: R.sup})
  ];

  // ---------- LCD (pp. 271–275) ----------
  const LCD = re => S('Front:1/Mini12864 Assembly:1/' + re);
  // The thin rod drawn with the case front (x -253..-136, z -523) is the piece of filament that
  // pins the hinge (p.275); it is split off so it goes in with the hinge.
  const caseFront = pick(LCD('LCD Case Front:1/=>'), 2).sort((a, b) => ctx.volume(b) - ctx.volume(a));
  const lcdCase = add('sk-lcd-case', 'LCD case front', caseFront[0], 'primary', {note: 'mini12864 case'});
  const filament = add('sk-lcd-filament', 'Filament (short piece)', caseFront[1], 'misc', {parent: lcdCase});
  const lcdCover = add('sk-lcd-cover', 'Mini12864 case front insert', pick(LCD('LCD Case Front:1/\\[a\\]_mini12864_case_front_insert'), 2), 'accent', {parent: lcdCase});
  const lcdIns = each('sk-lcd-insert', 'M3 heat set insert', pick(LCD('Mini12864 Hardware:1/M3 Heat Set'), 4), 'insert', {parent: lcdCase});
  const screen = add('sk-lcd-screen', 'Mini 12864 screen', pick(LCD('Mini12864 Screen:1/(?!Jog:)'), 8), 'electronics', {parent: lcdCase});
  const knob = add('sk-lcd-jog', 'Encoder knob', pick(LCD('Mini12864 Screen:1/Jog:'), 2), 'electronics', {parent: screen});
  const shield = add('sk-lcd-shield', 'Knob light shield', one(LCD('BTT_Knob_Light_Shield')), 'primary', {parent: screen, note: 'optional light blocker'});
  const lcdRear = add('sk-lcd-rear', 'LCD case rear', one(LCD('LCD Case Rear')), 'primary', {parent: lcdCase});
  const m3x12 = pick(LCD('Mini12864 Hardware:1/M3x12 SHCS'), 6).sort((a, b) => center(a)[2] - center(b)[2]);
  const lcdBack = each('sk-lcd-m3x12', 'M3x12 SHCS', m3x12.slice(0, 4), 'bolt', {parent: lcdRear});
  const hinge = add('sk-lcd-hinge', 'LCD case hinge', [one(LCD('LCD Case Hinge')), one(LCD('=>\\[0:1:1:461\\]'))], 'accent', {parent: lcdCase});
  const pin = add('sk-lcd-m3x40', 'M3x40 SHCS', one(LCD('Mini12864 Hardware:1/M3x40 SHCS')), 'bolt', {parent: hinge});
  const lcdMount = each('sk-lcd-mount', 'M3x12 SHCS', m3x12.slice(4), 'bolt', {parent: hinge});

  // ---------- fans, retainers, grills (pp. 272, 283, 286) ----------
  const fans = [1, 2].map(n => add(`sk-fan-${n}`, '60x20 fan', pick(S(`Side_Skirt_Fan:1/6020 Fan:${n}$`), 2), 'fan'));
  const fanHosts = fans.map(id => [id, inst(id)]);
  const fanIns = each('sk-fan-insert', 'M3 heat set insert', pick(R.G('Fan_Mounting_Hardware:1/M3 Heat Set'), 8), 'insert', i => ({parent: hostOf(i, fanHosts)}));
  const rets = [1, 2].map(n => add(`sk-ret-${n}`, 'Fan grill retainer', one(L.G(`Fan Grill Retainer:${n}/\\[a\\]_fan_grill_retainer`)), 'accent'));
  const retHosts = rets.map(id => [id, inst(id)]);
  const retIns = each('sk-ret-insert', 'M3 heat set insert', pick(L.G('Fan Grill Retainer:\\d/Fan Grill Retainer Hardware:1/M3 Heat Set'), 8), 'insert', i => ({parent: hostOf(i, retHosts)}));
  // Grill screws: parent is the grill they hold (nearest grill centre, the boxes are thin).
  const grillOf = (s, k) => [side[k].ga, side[k].gb].sort((a, b) => Math.abs(center(inst(a))[1] - center(s)[1]) - Math.abs(center(inst(b))[1] - center(s)[1]))[0];
  const lGrillScrews = each('sk-grill-l-m3x8', 'M3x8 SHCS', pick(L.G('Fan Grill Retainer:\\d/Fan Grill Retainer Hardware:1/M3x8 SHCS'), 8), 'bolt', i => ({parent: grillOf(i, 'l')}));
  const rGrillScrews = each('sk-grill-r-m3x8', 'M3x8 SHCS', pick(R.G('Fan_Mounting_Hardware:1/M3x8 SHCS'), 8), 'bolt', i => ({parent: grillOf(i, 'r')}));
  for (const k of ['l', 'r']) {
    for (const g of ['ga', 'gb']) part(side[k][g]).parent = side[k].sup;
  }
  // Fans and retainers are prepared on their own (p.272), so they have no parent; they ride
  // along with their support when it goes onto the printer (movers marked `again`).

  // ---------- logo and keystone inserts (p.276) ----------
  const logos = [
    add('sk-logo-l', 'Skirt logo', one(S('Front:1/Left:1/\\[a\\]_skirt_logo')), 'accent', {parent: frontL}),
    add('sk-logo-r', 'Skirt logo', one(S('Front:1/Right:1/\\[a\\]_skirt_logo')), 'accent', {parent: frontR})
  ];
  const ksIns = [add('sk-keystone-1', 'Keystone insert', one(S('Rear_Skirt_Keystone:1/\\[a\\]_Keystone_Insert:')), 'accent', {parent: keystone}),
    add('sk-keystone-2', 'Keystone insert', one(S('Rear_Skirt_Keystone:1/\\[a\\]_Keystone_Insert \\(1\\)')), 'accent', {parent: keystone})];

  // ---------- skirt screws and T-nuts ----------
  const byX = (re, n) => pick(re, n).sort((a, b) => center(a)[0] - center(b)[0]);
  const flS = byX(S('Front:1/Left:1/M3x8 SHCS'), 2), frS = byX(S('Front:1/Right:1/M3x8 SHCS'), 2);
  const ksS = byX(S('Rear_Skirt_Keystone:1/M3x8 SHCS'), 2), rcS = byX(S('Rear:1/Center:1/M3x8 SHCS'), 2);
  const sideS = k => [one(side[k].G('Side Skirt A:\\d/M3x8 SHCS')), one(side[k].G('Side Skirt B:\\d/M3x8 SHCS'))];
  const supS = k => one(side[k].G('Side Fan Support:\\d/Side_Fan_Support_Hardware:1/M5x10 BHCS'));
  // T-nuts sit in the bottom slot, 5 mm above the screw tip centre; LCD ones in the rear slot.
  const below = s => [center(s)[0], center(s)[1], -516];
  const tFront = tnuts('sk-tnut-front', 'M3', [...flS, ...frS], 'a-bot-f', below);
  const tLcd = tnuts('sk-tnut-lcd', 'M3', lcdMount.map(inst), 'a-bot-f', s => [center(s)[0], 6, -510]);
  const tRear = tnuts('sk-tnut-rear', 'M3', [...ksS, ...rcS], 'c', below);
  const tSide = {}, tSideM5 = {};
  for (const [k, ex] of [['l', 'a-bot-l'], ['r', 'a-bot-r']]) {
    tSide[k] = tnuts(`sk-tnut-${k}`, 'M3', sideS(k), ex, below);
    tSideM5[k] = tnuts(`sk-tnut-${k}-m5`, 'M5', [supS(k)], ex, below);
  }
  const fl = each('sk-front-l-m3x8', 'M3x8 SHCS', flS, 'bolt', {parent: frontL});
  const fr = each('sk-front-r-m3x8', 'M3x8 SHCS', frS, 'bolt', {parent: frontR});
  const ks = each('sk-keystone-m3x8', 'M3x8 SHCS', ksS, 'bolt', {parent: keystone});
  const rc = each('sk-rear-c-m3x8', 'M3x8 SHCS', rcS, 'bolt', {parent: rearC});
  const sideScrews = {}, supScrew = {};
  for (const k of ['l', 'r']) {
    const [a, b] = sideS(k);
    sideScrews[k] = [add(`sk-side-${k}-a-m3x8`, 'M3x8 SHCS', a, 'bolt', {parent: side[k].a}), add(`sk-side-${k}-b-m3x8`, 'M3x8 SHCS', b, 'bolt', {parent: side[k].b})];
    supScrew[k] = add(`sk-sup-${k}-m5x10`, 'M5x10 BHCS', supS(k), 'bolt', {parent: side[k].sup});
  }

  // ---------- bottom panel (pp. 289–290) ----------
  const B = re => new RegExp('Panels:1/Opaque Panels:1/Bottom Panel:1/' + re);
  const bottom = add('bp-panel', 'Bottom panel', one(B('Panel:1$')), 'panel');
  const holders = [];
  for (const n of [1, 2]) {
    const h = add(`bp-hinge-${n}`, 'Bottom panel hinge', pick(B(`Bottom_panel_hinge:${n}/bottom_panel_hinge`), 2), 'primary');
    add(`bp-hinge-${n}-vhb`, 'VHB tape', one(B(`Bottom_panel_hinge:${n}/Bottom_Panel_Hinge_VHB`)), 'misc', {parent: h});
    add(`bp-hinge-${n}-m3x8`, 'M3x8 SHCS', one(B(`Bottom_panel_hinge:${n}/M3x8 SHCS`)), 'bolt', {parent: h});
    holders.push(h);
  }
  for (const n of [1, 2, 3, 4]) {
    const c = add(`bp-clip-${n}`, 'Bottom panel clip', one(B(`Bottom_panel_clip:${n}/bottom_panel_clip`)), 'primary');
    add(`bp-clip-${n}-vhb`, 'VHB tape', one(B(`Bottom_panel_clip:${n}/Bottom_Panel_Clip_VHB`)), 'misc', {parent: c});
    add(`bp-clip-${n}-m3x8`, 'M3x8 SHCS', one(B(`Bottom_panel_clip:${n}/M3x8 SHCS`)), 'bolt', {parent: c});
    holders.push(c);
  }
  const vhb = holders.map(h => h + '-vhb'), bpScrews = holders.map(h => h + '-m3x8');

  // ---------- steps ----------
  const UP = [0, 0, -90];          // skirts come up from below (the printer stands upside down in the manual)
  const DROP = [0, 0, -40];        // T-nuts into the bottom slot
  const UNDER = {az: -60, el: -35};
  const FAN_TIP = {kind: 'tip', title: 'Electronics cooling fan', text: '2x 0.25mm² (AWG24) or larger. Both fans are wired in parallel to the controller board; see manual page 286.'};
  return [
    {
      id: 'sk-inserts', section: 'Skirts', title: 'Heat set inserts', pages: [269, 270],
      bench: [frontL, frontR, keystone, L.sup, R.sup], view: {az: -60, el: -30},
      movers: auto(ins, 0, 0.12),
      text: ['Press one M3 heat set insert into each front skirt, the rear keystone skirt and both side fan supports, in the hole on the edge that faces the bottom panel.'],
      notes: [notes.INSERTS]
    },
    {
      id: 'sk-lcd-prep', section: 'Preparation', title: 'LCD case', pages: [271],
      bench: [lcdCase], view: {az: -70, el: 15},
      movers: [{id: lcdCover, vec: [0, -40, 0], phase: 0, delay: 0}, ...auto(lcdIns, 1, 0.12)],
      text: ['Fit the accent front cover into the LCD case.', 'Hold it firmly in place and press 4 M3 heat set inserts into the back of the case.'],
      notes: [
        {kind: 'tip', title: 'Front cover', text: 'The front cover is held in place by the heat set inserts. Hold the front face firmly in place while inserting the heat set inserts.'},
        {kind: 'warn', title: 'Built-in support', text: 'Remove the highlighted section. It’s a built-in support for printability.'}
      ]
    },
    {
      id: 'sk-fan-prep', section: 'Preparation', title: 'Fans and grill retainers', pages: [272],
      bench: [...fans, ...rets], shift: {ids: rets, vec: [400, 0, -80]}, view: {az: 20, el: 15},
      movers: [...auto(fanIns, 0, 0.05), ...auto(retIns, 0, 0.05, 0.1)],
      text: ['Press 4 M3 heat set inserts into the corner holes of each 60x20 fan.', 'Press 4 M3 heat set inserts into each fan grill retainer.'],
      notes: [notes.INSERTS]
    },
    {
      id: 'sk-lcd-screen', section: 'LCD', title: 'Screen and back cover', pages: [273],
      bench: [lcdCase], view: {az: 110, el: 15},
      movers: [{id: screen, vec: [0, 45, 0], phase: 0, delay: 0}, {id: lcdRear, vec: [0, 100, 0], phase: 1, delay: 0}, ...auto(lcdBack, 2, 0.1)],
      text: ['Place the Mini 12864 screen in the case.', 'Close it with the LCD case rear and 4 M3x12 SHCS.']
    },
    {
      id: 'sk-lcd-knob', section: 'LCD', title: 'Knob light blocker', pages: [274],
      bench: [lcdCase], view: {az: -70, el: 10},
      movers: [{id: shield, vec: [0, -35, 0], phase: 0, delay: 0}, {id: knob, vec: [0, -50, 0], phase: 1, delay: 0}],
      text: ['Optional: thread the light blocker onto the encoder.', 'Press the knob onto the encoder.'],
      notes: [{kind: 'tip', title: 'Option: light blocker', text: 'Some LCDs come with a smaller encoder knob. This extra piece prevents excess light bleed. Threads onto the encoder before the knob is pressed on.'}]
    },
    {
      id: 'sk-lcd-hinge', section: 'LCD', title: 'Hinge', pages: [275],
      bench: [lcdCase], view: {az: -60, el: 25},
      movers: [{id: hinge, vec: [0, 0, 40], phase: 0, delay: 0}, ...auto([pin], 1), {id: filament, vec: [140, 0, 0], phase: 2, delay: 0}],
      text: ['Place the LCD case hinge on top of the case.', 'Join them with an M3x40 SHCS through the hinge knuckles.', 'Push a piece of filament through the small hole next to it.']
    },
    {
      id: 'sk-logos', section: 'Skirts', title: 'Logo and keystone inserts', pages: [276],
      bench: [frontL, frontR, keystone], view: {az: -60, el: 20},
      movers: [...move(logos, [0, 30, 0], 0, 0.15), ...move(ksIns, [0, -30, 0], 0, 0.15, 0.3)],
      text: ['Press a logo insert into each front skirt.', 'Clip the two keystone inserts into the rear keystone skirt.'],
      notes: [{kind: 'tip', title: 'Logo inserts', text: 'These will stay in place without any adhesive. Alternatively they can be glued in place.'}]
    },
    {
      id: 'sk-front', section: 'Skirts', title: 'Front skirts', pages: [277],
      view: {az: -100, el: -35},
      movers: [...move(tFront, DROP, 0, 0.08), ...move(tLcd, [0, 40, 0], 0, 0.08, 0.3), ...move([frontL, frontR], UP, 1, 0.2)],
      text: ['Drop 4 M3 T-nuts into the bottom slot of the front extrusion for the skirts.', 'Drop 2 M3 T-nuts into the rear slot of the front extrusion for the LCD.', 'Place both front skirts.']
    },
    {
      id: 'sk-front-lcd', section: 'Skirts', title: 'Fix the front skirts and LCD', pages: [278],
      view: {az: -100, el: -30},
      movers: [...auto([...fl, ...fr], 0, 0.1), {id: lcdCase, vec: [0, 0, -90], phase: 1, delay: 0}, ...auto(lcdMount, 2, 0.12)],
      text: ['Fix the front skirts with 4 M3x8 SHCS.', 'Fit the LCD between them and fix its hinge with 2 M3x12 SHCS.']
    },
    {
      id: 'sk-keystone', section: 'Skirts', title: 'Rear keystone skirt', pages: [279],
      view: {az: 60, el: -35},
      movers: [...move(tRear, DROP, 0, 0.08), {id: keystone, vec: UP, phase: 1, delay: 0}, ...auto(ks, 2, 0.12)],
      text: ['Drop 4 M3 T-nuts into the bottom slot of the rear extrusion.', 'Place the keystone skirt at the rear right and fix it with 2 M3x8 SHCS.']
    },
    {
      id: 'sk-rear-center', section: 'Skirts', title: 'Rear center skirt', pages: [280],
      view: {az: 80, el: -35},
      movers: [{id: rearC, vec: UP, phase: 0, delay: 0}, ...auto(rc, 1, 0.12)],
      text: ['Place the rear center skirt next to it and fix it with 2 M3x8 SHCS.']
    },
    {
      id: 'sk-left-skirts', section: 'Skirts', title: 'Left side skirts', pages: [281, 282],
      view: {az: 180, el: -35},
      movers: [...move([...tSide.l, ...tSideM5.l], DROP, 0, 0.1), ...move([L.a, L.b], UP, 1, 0.2), ...auto(sideScrews.l, 2, 0.12)],
      text: ['Drop 2 M3 T-nuts and 1 M5 T-nut (in the middle) into the bottom slot of the left extrusion.', 'Place side skirts A and B at either end and fix each with an M3x8 SHCS.']
    },
    {
      id: 'sk-left-grills', section: 'Skirts', title: 'Grills on the left fan support', pages: [283],
      bench: [L.sup], view: {az: 150, el: 20},
      movers: [...move(rets, [30, 0, 0], 0, 0.15), ...move([L.ga, L.gb], [-30, 0, 0], 1, 0.15), ...auto(lGrillScrews, 2, 0.05)],
      text: ['Place the two fan grill retainers behind the side fan support.', 'Fix a fan grill over each opening with 4 M3x8 SHCS into the retainer.'],
      notes: [{kind: 'tip', title: 'No fans on this side', text: 'This side only gets grills; the fans go on the other side.'}]
    },
    {
      id: 'sk-left-support', section: 'Skirts', title: 'Mount the left fan support', pages: [283],
      view: {az: 180, el: -30},
      movers: [{id: L.sup, vec: UP, phase: 0, delay: 0}, ...move(rets, UP).map(m => ({...m, delay: 0, again: true})), ...auto([supScrew.l], 1)],
      text: ['Fit the fan support between the side skirts and fix it with an M5x10 BHCS into the M5 T-nut.']
    },
    {
      id: 'sk-right-skirts', section: 'Skirts', title: 'Right side skirts', pages: [284, 285],
      view: {az: 0, el: -35},
      movers: [...move([...tSide.r, ...tSideM5.r], DROP, 0, 0.1), ...move([R.a, R.b], UP, 1, 0.2), ...auto(sideScrews.r, 2, 0.12)],
      text: ['Drop 2 M3 T-nuts and 1 M5 T-nut into the bottom slot of the right extrusion.', 'Place side skirts A and B and fix each with an M3x8 SHCS.']
    },
    {
      id: 'sk-right-fans', section: 'Skirts', title: 'Electronics cooling fans', pages: [286],
      bench: [R.sup], view: {az: 30, el: 20},
      movers: [...move(fans, [-40, 0, 0], 0, 0.15), ...move([R.ga, R.gb], [30, 0, 0], 1, 0.15), ...auto(rGrillScrews, 2, 0.05)],
      text: ['Place the two 60x20 fans in the side fan support.', 'Fix a fan grill over each fan with 4 M3x8 SHCS into the fan’s inserts.'],
      notes: [FAN_TIP]
    },
    {
      id: 'sk-right-support', section: 'Skirts', title: 'Mount the right fan support', pages: [287],
      view: {az: 0, el: -30},
      movers: [{id: R.sup, vec: UP, phase: 0, delay: 0}, ...move(fans, UP).map(m => ({...m, delay: 0, again: true})), ...auto([supScrew.r], 1)],
      text: ['Fit the fan support between the right side skirts and fix it with an M5x10 BHCS.']
    },
    {
      id: 'sk-wiring', section: 'Wiring', title: 'Fans and display', pages: [288],
      view: {az: -40, el: -20}, focus: [...fans, lcdCase], movers: [],
      text: ['Connect the electronics cooling fans to FAN0 on the controller board.', 'Connect the display ribbon cables to EXP1 and EXP2. See manual page 288 for the diagram.'],
      notes: [
        FAN_TIP,
        {kind: 'tip', title: 'Which is which?', text: 'The socket with 1 dot below it is EXP1; the socket with 2 dots is EXP2.'},
        {kind: 'warn', title: 'Warning: display hookup', text: 'Before connecting the display make sure to review the documentation on the VORON documentation site.', link: 'https://voron.link/ypdmcb2'},
        {kind: 'warn', title: 'FYSETC mini12864', text: 'If you are using a “FYSETC mini12864” please review section 3.3 of the FYSETC Spider documentation.', link: 'https://voron.link/m6etwnl'}
      ],
      extras: [{name: 'Fan wire 2x 0.25 mm² (AWG24)', qty: 1, kind: 'misc'}, {name: 'Display ribbon cables (EXP1, EXP2)', qty: 2, kind: 'electronics'}]
    },
    {
      id: 'bp-panel', section: 'Bottom Panel', title: 'Bottom panel', pages: [289],
      view: {az: -60, el: -40},
      movers: [{id: bottom, vec: [0, 0, -150], phase: 0, delay: 0}],
      text: ['Lay the bottom panel on the skirts.']
    },
    {
      id: 'bp-clips', section: 'Bottom Panel', title: 'Hinges and clips', pages: [290],
      view: {az: -60, el: -40},
      movers: [...move(vhb, [0, 0, -15], 0, 0.05), ...move(holders, [0, 0, -40], 0, 0.08), ...auto(bpScrews, 1, 0.08)],
      text: ['Apply VHB tape to the 2 bottom panel hinges and 4 bottom panel clips.', 'Place the hinges at the rear and the clips at the front and sides.', 'Fix each one with an M3x8 SHCS into the skirt inserts.'],
      notes: [{kind: 'tip', title: 'Apply VHB tape', text: 'VHB tape is a double sided adhesive tape.'}]
    }
  ];
};
