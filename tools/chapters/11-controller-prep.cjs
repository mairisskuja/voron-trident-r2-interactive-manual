// Controller Preparation (manual pp. 233–236): jumpers and stepper drivers on the controller
// board. The CAD carries only a dummy board outline (el-ctrl-board, 10-electronics), so these
// steps are informational. Page 233 is the chapter title page.
module.exports = ctx => {
  const board = ['el-ctrl-board'];
  const view = {az: -60, el: -50};
  const DOCS = {kind: 'tip', title: 'Controller board', text: 'The assembly manual will outline the wiring for a Fysetc Spider V2.2 board. You can find additional documentation and alternative configurations on docs.vorondesign.com.'};
  return [
    {
      id: 'cp-jumpers-remove', section: 'Controller Preparation', title: 'Remove all jumpers', pages: [234],
      view, focus: board, movers: [],
      text: [
        'Begin by removing all the jumpers from the controller board (MCU):',
        '1) the jumpers in the “driver sockets”;',
        '2) all the jumpers on the “Fan Voltage Selection”;',
        '3) the “USB 5V power supply” jumper;',
        '4) the “Probe Voltage Selection” jumper;',
        '5) the “LED Voltage Selection” jumper.',
        'See manual page 234 for where each one sits.'
      ],
      notes: [DOCS]
    },
    {
      id: 'cp-jumpers-set', section: 'Controller Preparation', title: 'Set the jumpers', pages: [235],
      view, focus: board, movers: [],
      text: [
        'Add the following jumpers to the controller board (MCU):',
        '1) the jumpers in the “driver sockets” as shown, to set TMC2209 UART mode;',
        '2) the “Fan Voltage Selection” jumpers to match your fan’s voltage (the manual shows 24VDC);',
        '3) make sure the Power Selection header is set to the lower position (DC5V);',
        '4) the jumper in the “Probe Voltage Selection” header to 24VDC;',
        '5) the included wire jumper to the 24VDC position.',
        'See manual page 235 for the jumper positions.'
      ],
      notes: [{kind: 'warn', title: 'Jumpers', text: 'Several jumpers need to be set on the MCU. Add the following JUMPERS to the controller board (MCU).'}]
    },
    {
      id: 'cp-drivers', section: 'Stepper Drivers', title: 'Stepper drivers', pages: [236],
      view, focus: board, movers: [],
      text: ['Plug the six stepper drivers into the driver sockets highlighted on manual page 236.'],
      extras: [{name: 'TMC2209 stepper driver', qty: 6, kind: 'electronics'}]
    }
  ];
};
