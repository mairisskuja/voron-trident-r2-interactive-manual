// Wiring (manual pp. 237–268). The CAD has no wires, so most steps are informational: they say
// what to connect and carry the manual's safety notes, and leave the diagrams to the official
// manual. The cable chains are in the CAD and are installed here: 10x11 Chain Z (bed, p.244),
// 10x11 Chain X (toolhead, pp.256–257, if no earlier chapter took it) and 10x11 Chain Y
// (pp.259–261). Page 237 is the chapter title page.
module.exports = ctx => {
  const {I, pick, free, center, add, each, auto, move, part} = ctx;
  const soft = (re, n) => {
    const out = free(re);
    if (out.length !== n) console.warn(`12-wiring: ${re} expected ${n} free, found ${out.length} (taken by an earlier chapter?)`);
    return out;
  };
  const has = id => { try { part(id); return true; } catch { return false; } };
  const ids = list => list.filter(has);

  // ---------- Chain Z (bed) ----------
  const CZ = re => new RegExp('Z Assembly:1/10x11 Chain Z:1/' + re);
  const chainZ = add('wr-chain-z', '10x11 cable chain (Z)', [...pick(CZ('10x11 (Chain Link|Fixed End|Unfixed End)'), 22)], 'chain');
  const czF = pick(CZ('M3x6 FHCS'), 6);
  const czLow = each('wr-chain-z-low-m3x6', 'M3x6 FHCS', czF.filter(i => center(i)[2] < -400), 'bolt', {parent: 'wp-zc-anchor'});
  const czUp = each('wr-chain-z-up-m3x6', 'M3x6 FHCS', czF.filter(i => center(i)[2] > -400), 'bolt', {parent: chainZ});

  // ---------- Chain X (toolhead) ----------
  const CX = re => new RegExp('X Axis:1/10x11 Chain X:1/' + re);
  const cxBody = soft(CX('10x11 (Chain Link|Fixed End|Unfixed End)'), 23);
  let cx = null;
  if (cxBody.length) {
    const chain = add('wr-chain-x', '10x11 cable chain (X)', cxBody, 'chain');
    const bolts = each('wr-chain-x-m3x6', 'M3x6 FHCS', soft(CX('M3x6 FHCS'), 4), 'bolt', {parent: chain});
    // Drop-in T-nut under the chain's unfixed end, on the X extrusion.
    const end = pick(CX('10x11 Unfixed End'), 1)[0];
    const tn = free(/Gantry_Frame_Tnuts:1\/2020 Drop-in T-nut, M3/).filter(i => ctx.dist(center(i), center(end)) < 16);
    const tnut = each('wr-chain-x-tnut', 'M3 T-nut', tn, 'tnut');
    cx = {chain, bolts, tnut};
  }

  // ---------- Chain Y ----------
  const CY = re => new RegExp('Gantry:1/10x11 Chain Y:1/' + re);
  const chainY = add('wr-chain-y', '10x11 cable chain (Y)', pick(CY('10x11 (Chain Link|Fixed End|Unfixed End)'), 22), 'chain');
  const cyAnchor = add('wr-chain-y-wire-anchor', 'Chain wire anchor', pick(CY('Chain Wire Anchor'), 1), 'misc', {parent: chainY, note: 'for 3 hole chains only'});
  const cyBolts = each('wr-chain-y-m3x6', 'M3x6 FHCS', pick(CY('M3x6 FHCS'), 4), 'bolt', {parent: chainY});
  const cyEnd = pick(CY('10x11 Unfixed End'), 1)[0];
  const cyTn = each('wr-chain-y-tnut', 'M3 T-nut', free(/Gantry_Frame_Tnuts:1\/2020 Drop-in T-nut, M3/).filter(i => ctx.dist(center(i), center(cyEnd)) < 16), 'tnut', {parent: 'a-y-r'});
  // Zip tie loop on the right Y extrusion, pushed against the A motor mount (p.259).
  const loop = pick(/Cable Frame Anchors:1\/Cable Frame Anchor/).filter(i => Math.abs(center(i)[2] + 150) < 10 && center(i)[0] > -20);
  if (loop.length !== 1) throw Error('12-wiring: zip tie loop on the right Y extrusion not found');
  const cyLoop = add('wr-chain-y-ziploop', 'Zip tie loop', loop, 'primary', {parent: 'a-y-r'});

  // ---------- notes ----------
  const ISOLATED = {kind: 'warn', title: 'Isolated connectors only', text: 'Make sure that all mains connectors are properly isolated and meet the applicable safety standards.'};
  const MAINS = {kind: 'warn', title: 'Mains inlet wiring', text: 'We show the wiring in the IEC colour scheme. Depending on your region the colour scheme and wiring standards will differ. Mains wiring should only be done by qualified personnel trained in local regulations and safety standards. Depending on your local regulations you may be forbidden from wiring the mains side and/or putting the printer into operation; seek professional assistance. Failure to observe those could result in bodily harm.'};
  const MAINS2 = {kind: 'warn', title: 'Mains wiring continued', text: 'Secure the wires with cable clips / cable tie anchors. The bed heater is powered by AC voltage and receives its PE in a later step. Observe your local regulations in regards to the Protective Earth connections for the frame/other components.'};
  const ZIP = {kind: 'tip', title: 'Zip tie loops', text: 'Secure the wire bundle to the strain relief using small zip ties.'};
  const CTRL = {kind: 'tip', title: 'Controller board', text: 'The assembly manual will outline the wiring for a Fysetc Spider 2.2. You can find additional documentation and alternative configurations on docs.vorondesign.com.'};
  const ZIPTIES = {name: 'Small zip ties', qty: 1, kind: 'misc'};
  const under = {az: -60, el: -50};
  const board = ['el-ctrl-board'];
  const inlet = ids(['el-inlet-mount']);

  return [
    {
      id: 'wr-psu-voltage', section: 'Wiring', title: 'Check the PSU input voltage', pages: [238],
      view: under, focus: ['el-psu24'], movers: [],
      text: ['Before any wiring, check the input voltage switch of the 24V power supply. It sits behind the metal mesh.', 'Make sure it matches your local mains voltage.'],
      notes: [{kind: 'warn', title: 'Input voltage switch', text: 'Check the input voltage switch of the power supply. It is located in the highlighted area behind the metal mesh. Make sure the selection matches your local mains voltage. Refer to the Mean Well LRS-200 datasheet for possible settings.', link: 'https://voron.link/e0szdyh'}]
    },
    {
      id: 'wr-mains-inlet', section: 'Mains Wiring', title: 'Wire the power inlet', pages: [239, 240],
      view: {az: 120, el: -40}, focus: [...inlet, 'el-wago-mount'], movers: [],
      text: ['Attach 250 mm of wire to the inlet and switch: L, N and PE.', 'Run them to the WAGO lever nuts as shown on manual pages 239 and 240.'],
      notes: [MAINS, {kind: 'tip', title: 'Attach 250 mm of wire', text: 'Cables should be at least 0.75mm² (AWG18) or thicker depending on local regulations.'}, ISOLATED],
      extras: [{name: 'Mains wire, at least 0.75 mm² (AWG18), 250 mm', qty: 3, kind: 'misc'}]
    },
    {
      id: 'wr-mains', section: 'Mains Wiring', title: 'Mains to the PSUs and SSR', pages: [241, 242],
      view: under, focus: ['el-wago-mount', 'el-psu24', 'el-psu5', 'el-ssr'], movers: [],
      text: ['From the PE lever nut, wire protective earth to the frame, the 24V PSU, the SSR and the 5V PSU (manual page 241).', 'From the N and L lever nuts, wire N and L to the 24V PSU and the 5V PSU, and L to terminal 2 (AC load side) of the SSR (manual page 242).'],
      notes: [MAINS2, ISOLATED],
      extras: [{name: 'Cable clips / cable tie anchors', qty: 1, kind: 'misc'}]
    },
    {
      id: 'wr-bed-wiring', section: 'Bed Wiring', title: 'Bed wires', pages: [243],
      view: {az: -110, el: 30}, focus: ['wp-zc-anchor'], movers: [],
      text: [
        'Prepare the wires that run from the print bed: Z endstop 2x 0.25mm² (AWG24) or larger, protective earth 1mm² (AWG18) or larger, print bed heater 2x 1mm² (AWG18) or larger, bed thermistor 2x 0.25mm² (AWG24) or larger.',
        'The bed side connections are drawn on manual page 243.'
      ]
    },
    {
      id: 'wr-bed-chain', section: 'Bed Cable Routing', title: 'Z cable chain', pages: [244],
      view: {az: -110, el: 25},
      // M3x6 FHCS boxes are cubes, so 'auto' cannot find their axis: the screws run along x.
      // Upper ones enter the Z carriage inserts from -x, lower ones the anchor inserts from +x.
      movers: [{id: chainZ, vec: [0, 80, 0], phase: 0, delay: 0}, ...move(czUp, [-22, 0, 0], 1, 0.12), ...move(czLow, [22, 0, 0], 1, 0.12, 0.4)],
      text: ['Fit the Z cable chain between the bed and the Z chain anchor.', 'Fix each end with 3 M3x6 FHCS.']
    },
    {
      id: 'wr-bed-ziploops', section: 'Bed Cable Routing', title: 'Strain relief at both ends', pages: [245],
      view: {az: -110, el: 25}, focus: [chainZ, 'wp-zc-anchor'], movers: [],
      text: ['Tie the bed wire bundle to the strain reliefs at both ends of the chain with small zip ties.'],
      notes: [ZIP], extras: [ZIPTIES]
    },
    {
      id: 'wr-bed-mains', section: 'Bed Wiring', title: 'Bed heater and earth', pages: [246],
      view: under, focus: ['el-wago-mount', 'el-ssr'], movers: [],
      text: ['Connect the wires coming from the print bed to the SSR and the WAGO lever nuts as shown on manual page 246, including the bed’s protective earth.'],
      notes: [ISOLATED]
    },
    {
      id: 'wr-dc', section: 'DC Wiring', title: '24V and 5V outputs', pages: [247],
      view: under, focus: ['el-psu24', 'el-psu5', 'el-ctrl-board', 'el-pi'], movers: [],
      text: ['Wire the 24V PSU output (+V, -V) to the controller board and the 5V PSU output to the Raspberry Pi, as on manual page 247.', 'Clip the terminal cover onto the 24V PSU once all cables are in.'],
      notes: [
        {kind: 'tip', title: 'Cable cross section', text: 'Cables to the controller board should be 1mm² (AWG18) or larger. 0.5mm² (AWG20) is sufficient for the connection to the Raspberry Pi.'},
        {kind: 'tip', title: 'Terminal cover', text: 'After installing all cables install the Meanwell TBC-09 Terminal Cover included in the BOM on the PSU. It clips onto the terminal block.'}
      ],
      extras: [{name: 'Mean Well TBC-09 terminal cover', qty: 1, kind: 'misc'}]
    },
    {
      id: 'wr-pi-power', section: 'DC Wiring', title: 'Raspberry Pi power', pages: [248],
      view: under, focus: ['el-psu5', 'el-pi'], movers: [],
      text: ['Power the Raspberry Pi from the 5V PSU through its GPIO pins, as on manual page 248.'],
      notes: [{kind: 'tip', title: 'Raspberry Pi power', text: 'While we suggest that you power the Raspberry Pi via the GPIO pins you may also power it using the “Power-In” USB port. Cut a suitable USB cable and wire the + and ground lines to the 5V DC/DC converter instead.'}]
    },
    {
      id: 'wr-controller', section: 'Controller Wiring', title: 'Power, bed control and bed sensors', pages: [249, 250],
      view: under, focus: [...board, 'el-ssr', 'el-psu24'], movers: [],
      text: [
        'Connect the 24V PSU to PWR IN on the controller board.',
        'Connect bed control (2x 0.25mm² (AWG24) or larger) from the board to the SSR.',
        'Connect the Z endstop and the bed thermistor (each 2x 0.25mm² (AWG24) or larger).',
        'The connector positions are on manual pages 249 and 250.'
      ],
      notes: [CTRL]
    },
    {
      id: 'wr-b-motor', section: 'B Motor', title: 'B motor', pages: [251, 252],
      view: {az: 60, el: 15}, focus: ['drive-b-motor', 'wp-ziploop-left-1', 'wp-ziploop-left-2', 'wp-ziploop-left-3'], movers: [],
      text: ['Run the B motor wires down the rear left post and tie them to the zip tie loops.', 'Plug the B motor into the controller board as shown on manual page 252.'],
      notes: [ZIP], extras: [ZIPTIES]
    },
    {
      id: 'wr-chains-overview', section: 'Cable Chains - Overview', title: 'Cable chain routes', pages: [253, 254],
      view: {az: 20, el: 35}, focus: ['x-ext', 'sb-body', 'drive-a-motor'], movers: [],
      text: ['Two chains carry the toolhead wiring: one along the X extrusion from the toolhead to the endstop pod, and one along the right Y extrusion from there to the A motor. From the A motor the wires run down to the electronics compartment.'],
      notes: [{kind: 'tip', title: 'Cable chains install', text: 'You can opt to install the chains now and fish the wires through the chains or build the complete harness outside of the printer and install it in one go. Either approach does work. If you sourced a pre-built wire harness completing the harness outside of the printer is recommended.'}]
    },
    {
      id: 'wr-toolhead-wires', section: 'Toolhead Wiring', title: 'Toolhead wires', pages: [255],
      view: {az: -50, el: 30}, focus: ['sb-body'], movers: [],
      text: ['Prepare the toolhead wires: hotend cooling fan 2x 0.25mm² (AWG24), part cooling fan 2x 0.25mm² (AWG24), extruder motor 4x 0.25mm² (AWG24), inductive probe 3x 0.25mm² (AWG24), hotend heater 2x 0.5mm² (AWG20), hotend thermistor 2x 0.25mm² (AWG24), each or larger.'],
      notes: [
        {kind: 'warn', title: 'Wires, drag chains and crimps', text: 'The wires attached to the probe, fans, heater, etc. are usually not rated for use in drag chains. Add crimp connectors at the toolhead and run suitable wire down the drag chains. Refer to the sourcing guide for options.'},
        {kind: 'tip', title: 'Option: toolhead PCB', text: 'If you are planning to use a toolhead PCB consult the Board manufacturer for wiring instructions.'}
      ]
    },
    ...(cx ? [
      {
        id: 'wr-chain-x', section: 'Toolhead Cable Routing', title: 'X cable chain', pages: [256],
        view: {az: 60, el: 35},
        movers: [...cx.tnut.map(id => ({id, vec: [0, 0, 30], phase: 0, delay: 0})), {id: cx.chain, vec: [0, 0, 70], phase: 1, delay: 0}],
        text: ['Drop an M3 T-nut into the top slot of the X extrusion.', 'Lay the X cable chain along the extrusion from the toolhead.']
      },
      {
        id: 'wr-chain-x-screws', section: 'Toolhead Cable Routing', title: 'Fix the X chain', pages: [257],
        view: {az: 60, el: 40},
        movers: move(cx.bolts, [0, 0, 22], 0, 0.12), // from above; 'auto' can't orient the cube-shaped FHCS box
        text: ['Fix the chain to the toolhead with 3 M3x6 FHCS and its other end to the T-nut with one M3x6 FHCS.']
      }
    ] : []),
    {
      id: 'wr-xy-routing', section: 'Toolhead/XY Endstop PCB Routing', title: 'Endstop wires', pages: [258],
      view: {az: 30, el: 30}, focus: ids(['el-xy-pcb', ...(cx ? [cx.chain] : [])]), movers: [],
      text: ['Run the wires from the toolhead and the XY endstop through the chain toward the controller board, and tie them to the strain relief.'],
      notes: [
        {kind: 'tip', title: 'Y endstop PCB (optional)', text: '3x 0.25mm²(AWG24) or larger - only the two signal wires and one ground are required, despite the 4-pin connector.', link: 'https://voron.link/djhyygu'},
        {kind: 'tip', title: 'Zip tie loops', text: 'Secure the wire bundle to the strain relief using small zip ties. IGUS cable chains have a build-in strain relief. We omitted the loop on the part.'}
      ],
      extras: [ZIPTIES]
    },
    {
      id: 'wr-chain-y-loop', section: 'Toolhead/XY Endstop Routing', title: 'T-nut and zip tie loop', pages: [259],
      view: {az: 30, el: 30},
      movers: [...cyTn.map(id => ({id, vec: [0, 0, 30], phase: 0, delay: 0})), {id: cyLoop, vec: [0, 0, 30], phase: 1, delay: 0}],
      text: ['Drop an M3 T-nut into the top slot of the right Y extrusion.', 'Push a zip tie loop into the slot, twist it 90° to lock and push it against the motor mount.'],
      notes: [
        {kind: 'tip', title: 'Generic cable chains', text: 'The chains generally don’t include a strain relief. Rotate the zip tie loop clockwise by 90° to lock them in place, then push it against the motor mount.'},
        {kind: 'tip', title: 'Zip tie loops', text: 'Secure the wire bundle to the strain relief using small zip ties. IGUS cable chains have a build-in strain relief. Don’t install the additional part.'}
      ]
    },
    {
      id: 'wr-chain-y', section: 'Toolhead/XY Endstop Routing', title: 'Y cable chain', pages: [260],
      view: {az: 30, el: 30},
      movers: [{id: cyAnchor, vec: [0, 0, 25], phase: 0, delay: 0}, {id: chainY, vec: [60, 0, 40], phase: 1, delay: 0}],
      text: ['Lay the Y cable chain along the right Y extrusion, from the XY joint back toward the A motor.'],
      notes: [{kind: 'tip', title: 'Chain wire anchor', text: 'The CAD draws a chain wire anchor under the XY joint end, for 3 hole chains only.'}]
    },
    {
      id: 'wr-chain-y-screws', section: 'Toolhead/XY Endstop Routing', title: 'Fix the Y chain', pages: [261],
      view: {az: 30, el: 35},
      movers: move(cyBolts, [0, 0, 22], 0, 0.12), // from above; 'auto' can't orient the cube-shaped FHCS box
      text: ['Fix the chain to the XY joint with 3 M3x6 FHCS and its other end to the T-nut with one M3x6 FHCS.']
    },
    {
      id: 'wr-wiring-path', section: 'Toolhead/XY Endstop Routing', title: 'Wiring path at the A motor', pages: [262],
      view: {az: 45, el: 30}, focus: [chainY, cyLoop, 'drive-a-motor'], movers: [],
      text: ['Route the wires out of the chain past the A motor along the path drawn on manual page 262 and secure them.'],
      notes: [{kind: 'tip', title: 'Wiring path', text: 'Route the wires along the highlighted path and secure them with the zip tie loop (or the integrated strain relief on IGUS chains).'}],
      extras: [ZIPTIES]
    },
    {
      id: 'wr-rear-right-post', section: 'Toolhead/XY Endstop Routing', title: 'Down the rear right post', pages: [263],
      view: {az: 120, el: 15}, focus: ['wp-ziploop-right-1', 'wp-ziploop-right-2', 'wp-ziploop-right-3'], movers: [],
      text: ['Run the bundle down the rear right post to the electronics compartment and tie it to the zip tie loops.'],
      notes: [ZIP], extras: [ZIPTIES]
    },
    {
      id: 'wr-endstops', section: 'Controller Wiring', title: 'X and Y endstops', pages: [264],
      view: under, focus: board, movers: [],
      text: ['Connect the X endstop and the Y endstop from the endstop pod (each 2x 0.25mm² (AWG24) or larger) as shown on manual page 264.']
    },
    {
      id: 'wr-toolhead', section: 'Controller Wiring', title: 'Extruder, hotend and probe', pages: [265],
      view: under, focus: board, movers: [],
      text: ['Connect the extruder motor (4x 0.25mm² (AWG24)), hotend heater (2x 0.5mm² (AWG20)), hotend thermistor (2x 0.25mm² (AWG24)) and inductive probe (3x 0.25mm² (AWG24)), each or larger, as shown on manual page 265.'],
      notes: [{kind: 'tip', title: 'Probe hookup', text: 'The probe input of the Fysetc Spider supports a 24V probe. If you are using a different controller board you may need to wire the probe’s signal line to an endstop input using a BAT85 diode.'}]
    },
    {
      id: 'wr-a-motor-fans', section: 'Controller Wiring', title: 'A motor and toolhead fans', pages: [266],
      view: under, focus: [...board, 'drive-a-motor'], movers: [],
      text: ['Connect the A motor (4x 0.25mm² (AWG24) or larger), the hotend cooling fan and the part cooling fan (each 2x 0.25mm² (AWG24) or larger) as shown on manual page 266.']
    },
    {
      id: 'wr-fan-voltage', section: 'Controller Wiring', title: 'Fan voltage', pages: [267],
      view: under, focus: board, movers: [],
      text: ['Check the voltage rating of every fan and set the fan voltage jumpers to match.'],
      notes: [{kind: 'warn', title: 'Fan voltage', text: 'The fans recommended in the sourcing guide are 24V fans. Please check your hotend cooling (40x40x10 axial), part cooling (50x50x15 blower) and exhaust/electronics (60x60x20 axial) fans for their voltage rating and jumper the voltage selection accordingly. Refer to the Fysetc Spider manual for possible settings.'}]
    },
    {
      id: 'wr-z-motors', section: 'Controller Wiring', title: 'Z motors', pages: [268],
      view: under, focus: [...board, 'wp-zcover-left', 'wp-zcover-right', 'wp-zcover-rear'], movers: [],
      text: ['Connect the Z left, Z right and Z rear motors (each 4x 0.25mm² (AWG24) or larger) as shown on manual page 268.'],
      notes: [{kind: 'tip', title: 'Motor connections', text: '4x 0.25mm²(AWG24) or larger.'}]
    }
  ];
};
