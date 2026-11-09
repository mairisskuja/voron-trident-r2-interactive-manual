// Stealthburner (manual pp. 188–189). The toolhead is built from its own manual; here the
// finished toolhead (as the CAD has it: Stealthburner with Clockwork 2 extruder and Revo
// Voron hotend) goes onto the X carriage in one move.
module.exports = ctx => {
  const {pick, add} = ctx;
  const T = re => new RegExp('X Axis:1/Toolhead_Assembly:1/' + re);
  // The CAD holds two variants each of the CW2 cable cover and chain anchor; the plain cable
  // cover and the 3-hole anchor (matching the 3-hole cable bridge) are drawn.
  const cw2 = pick(T('CW2_Assembly:1/')).filter(i => !/Cable_Cover_For_PCB|Chain_Anchor_2_Hole/.test(ctx.I[i].path.join('/')));
  if (cw2.length !== 77) throw Error(`CW2: expected 77 instances, found ${cw2.length}`);
  const sb = add('sb-body', 'Stealthburner toolhead', [...pick(T('Stealthburner_Assembly:1/'), 55), ...pick(T('SB TOOLHEAD-Revo Voron:1/'), 25)], 'toolhead', {note: 'with Revo Voron hotend'});
  const ex = add('sb-cw2', 'Clockwork 2 extruder', cw2, 'toolhead', {parent: sb});
  const adxl = add('sb-adxl', 'ADXL345 accelerometer mount', pick(T('ADXL_Assembly - Generic:1/'), 17), 'electronics', {parent: sb});
  return [
    {
      id: 'sb-build', section: 'Stealthburner', title: 'Build the toolhead', pages: [189],
      bench: [sb], view: {az: -60, el: 15},
      movers: [{id: ex, vec: [0, 0, 70], phase: 0, delay: 0}, {id: adxl, vec: [-50, 0, 0], phase: 1, delay: 0}],
      text: ['This printer uses the Stealthburner toolhead. Build it, with its Clockwork 2 extruder, by following the Stealthburner assembly manual, then return here.', 'The CAD shows it with a Revo Voron hotend and an accelerometer mount.'],
      notes: [{kind: 'tip', title: 'Universal toolhead', text: 'This printer uses the Stealthburner toolhead, which is compatible with several of the printers in the VORON lineup. To keep things organized, Stealthburner’s files are maintained separately. Follow the Stealthburner assembly manual to build your toolhead, and return here to proceed.', link: 'https://voron.link/6hbi9n3'},
        {kind: 'tip', title: 'Interactive Stealthburner manual', text: 'Every step of the Stealthburner manual animated in 3D, like this one, for the current Clockwork 2.5 extruder and your choice of hotend:', link: 'https://iconic-fab.com/voron/stealthburner/r2/'}]
    },
    {
      id: 'sb-mount', section: 'Stealthburner', title: 'Toolhead onto the X carriage', pages: [189],
      view: {az: -60, el: 20},
      movers: [{id: sb, vec: [0, -150, 40], phase: 0, delay: 0}],
      text: ['Mount the finished toolhead on the X carriage. In the CAD it hangs on the two M3x12 SHCS left 3 mm proud on page 146.', 'For the details, follow the Stealthburner assembly manual.'],
      notes: [{kind: 'tip', title: 'Stealthburner manual', text: 'Follow the Stealthburner assembly manual to build your toolhead, and return here to proceed.', link: 'https://voron.link/6hbi9n3'},
        {kind: 'tip', title: 'Interactive Stealthburner manual', text: 'Every step of the Stealthburner manual animated in 3D, like this one, for the current Clockwork 2.5 extruder and your choice of hotend:', link: 'https://iconic-fab.com/voron/stealthburner/r2/'}]
    }
  ];
};
