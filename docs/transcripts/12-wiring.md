# Wiring, pp. 237–268

Source: `Assembly_Manual_Trident.pdf` (version 2026-06-24). Tip text verbatim from `pdftotext -layout` (line wraps joined). Illustration notes are my own. Most pages are wiring diagrams; the interactive manual refers to them by page number and does not redraw them.

## p.237 — WIRING
Chapter title page: photo of a tangle of wires. Not a step.

## p.238 — (PSU input voltage)
Shows: the LRS-200 PSU with the voltage switch area highlighted.
Tips:
- INPUT VOLTAGE SWITCH: Check the input voltage switch of the power supply. It is located in the highlighted area behind the metal mesh. Make sure the selection matches your local mains voltage. Refer to the Mean Well LRS-200 datasheet for possible settings (https://voron.link/e0szdyh).

## p.239 — (mains inlet wiring)
Shows: inlet and switch with L, N, PE wires.
Tips:
- ATTACH 250 MM OF WIRE: Cables should be at least 0.75mm² (AWG18) or thicker depending on local regulations.
- MAINS INLET WIRING: We show the wiring in the IEC colour scheme. Depending on your region the colour scheme and wiring standards will differ. Mains wiring should only be done by qualified personnel trained in local regulations and safety standards. Depending on your local regulations you may be forbidden from wiring the mains side and/or putting the printer into operation; seek professional assistance. Failure to observe those could result in bodily harm.
- ISOLATED CONNECTORS ONLY: Make sure that all mains connectors are properly isolated and meet the applicable safety standards.

## p.240
Shows: inlet wires N, L, PE to the WAGO lever nuts.
Tips:
- ISOLATED CONNECTORS ONLY: Make sure that all mains connectors are properly isolated and meet the applicable safety standards

## p.241 — (mains continued)
Shows: protective earth (green/yellow) from the PE lever nut to the frame, the LRS-200-24 PSU, the SSR (centre screw) and the RS-25-5 PSU.
Tips:
- MAINS WIRING CONTINUED: Secure the wires with cable clips / cable tie anchors. The bed heater is powered by AC voltage and receives its PE in a later step. Observe your local regulations in regards to the Protective Earth connections for the frame/other components.

## p.242
Shows: N (blue) and L (brown) from the lever nuts to the LRS-200-24 PSU and the RS-25-5 PSU, and L to terminal 2 of the SSR (AC load side).

## p.243 — BED WIRING
Shows: bed underside diagram, wires to the bed-side WAGO block.
Labels: Z ENDSTOP 2x 0.25mm²(AWG24) or larger; PROTECTIVE EARTH 1mm²(AWG18) or larger; PRINT BED 2x 1mm²(AWG18) or larger; BED THERMISTOR 2x 0.25mm²(AWG24) or larger.

## p.244 — BED CABLE ROUTING
Shows: the Z cable chain (light blue) from the bed carrier down to the Z chain anchor; close-ups of three FHCS at each end.
Hardware labels: M3x6 FHCS.

## p.245 — BED CABLE ROUTING
Shows: zip ties (blue) at the strain reliefs at both chain ends.
Tips:
- ZIP TIE LOOPS: Secure the wire bundle to the strain relief using small zip ties.

## p.246
Shows: diagram "From Print Bed" to the SSR / WAGO, PE.

## p.247
Shows: DC diagram: LRS-200-24 +V/−V to the 24V controller board, RS-25-5 to the 5V Raspberry Pi.
Tips:
- CABLE CROSS SECTION: Cables to the controller board should be 1mm² (AWG18) or larger. 0.5mm² (AWG20) is sufficient for the connection to the Raspberry Pi.
- TERMINAL COVER: After installing all cables install the Meanwell TBC-09 Terminal Cover included in the BOM on the PSU. It clips onto the terminal block.

## p.248
Shows: 5V PSU to the Pi GPIO.
Tips:
- RASPBERRY PI POWER: While we suggest that you power the Raspberry Pi via the GPIO pins you may also power it using the “Power-In” USB port. Cut a suitable USB cable and wire the + and ground lines to the 5V DC/DC converter instead.

## p.249 — CONTROLLER BOARD
Shows: Spider board diagram: BED CONTROL (2x 0.25mm²(AWG24) or larger) to SSR, 24V PSU to PWR IN, Z ENDSTOP and BED THERMISTOR (2x 0.25mm²(AWG24) or larger), Raspberry Pi.
Tips:
- CONTROLLER BOARD: The assembly manual will outline the wiring for a Fysetc Spider 2.2. You can find additional documentation and alternative configurations on docs.vorondesign.com.

## p.250
Shows: board diagram with the connections of p.249.

## p.251 — B MOTOR
Shows: B motor wires down the rear left post through the three zip tie loops.
Tips:
- ZIP TIE LOOPS: Secure the wire bundle to the strain relief using small zip ties.

## p.252 — CONTROLLER WIRING
Shows: B Motor into the board's motor header (drawn at M1).

## p.253 — CABLE CHAINS - OVERVIEW
Shows: printer with the X and Y chains highlighted.
Tips:
- CABLE CHAINS INSTALL: You can opt to install the chains now and fish the wires through the chains or build the complete harness outside of the printer and install it in one go. Either approach does work. If you sourced a pre-built wire harness completing the harness outside of the printer is recommended.

## p.254 — CABLE CHAINS - OVERVIEW
Shows: route Toolhead → chain → Endstop Pod → chain → A Motor → To Electronics Compartment.

## p.255
Shows: toolhead wire list.
Labels: HOTEND COOLING FAN 2x 0.25mm²(AWG24); PART COOLING FAN 2x 0.25mm²(AWG24); EXTRUDER MOTOR 4x 0.25mm²(AWG24); INDUCTIVE PROBE 3x 0.25mm²(AWG24); HOTEND HEATER 2x 0.5mm²(AWG20); HOTEND THERMISTOR 2x 0.25mm²(AWG24) — each "or larger".
Tips:
- OPTION: TOOLHEAD PCB: If you are planning to use a toolhead PCB consult the Board manufacturer for wiring instructions.
- WIRES, DRAG CHAINS AND CRIMPS: The wires attached to the probe, fans, heater, etc. are usually not rated for use in drag chains. Add crimp connectors at the toolhead and run suitable wire down the drag chains. Refer to the sourcing guide for options.

## p.256 — TOOLHEAD CABLE ROUTING
Shows: an M3 T-nut into the top slot of the X extrusion; the X chain (light blue) laid along it from the toolhead.
Hardware labels: M3 T-Nut.

## p.257 — TOOLHEAD CABLE ROUTING
Shows: 3 FHCS at the toolhead end, 1 at the extrusion end.
Hardware labels: M3x6 FHCS.

## p.258 — TOOLHEAD/XY ENDSTOP PCB ROUTING
Shows: endstop PCB wires "To Controller Board"; routing under the XY joint.
Tips:
- Y ENDSTOP PCB (OPTIONAL): 3x 0.25mm²(AWG24) or larger - only the two signal wires and one ground are required, despite the 4-pin connector. See https://voron.link/djhyygu for details.
- ZIP TIE LOOPS: Secure the wire bundle to the strain relief using small zip ties. IGUS cable chains have a build-in strain relief. We omitted the loop on the part.

## p.259 — TOOLHEAD/XY ENDSTOP ROUTING
Shows: an M3 T-nut in the right Y extrusion; a zip tie loop pushed against the A motor mount.
Hardware labels: M3 T-Nut.
Tips:
- GENERIC CABLE CHAINS: The chains generally don’t include a strain relief. Rotate the zip tie loop clockwise by 90° to lock them in place, then push it against the motor mount.
- ZIP TIE LOOPS: Secure the wire bundle to the strain relief using small zip ties. IGUS cable chains have a build-in strain relief. Don’t install the additional part.

## p.260
Shows: the Y chain (light blue) along the right Y extrusion.

## p.261
Shows: 3 FHCS at the XY joint end, 1 at the extrusion end.
Hardware labels: M3x6 FHCS.

## p.262
Shows: the wire path past the A drive (blue / black line).
Tips:
- WIRING PATH: Route the wires along the highlighted path and secure them with the zip tie loop (or the integrated strain relief on IGUS chains).

## p.263
Shows: wires down the rear right post through the three zip tie loops.
Tips:
- ZIP TIE LOOPS: Secure the wire bundle to the strain relief using small zip ties.

## p.264
Shows: X ENDSTOP, Y ENDSTOP (2x 0.25mm²(AWG24) or larger) from the Endstop Pod to the board.

## p.265
Shows: EXTRUDER MOTOR (4x 0.25mm²), HOTEND HEATER (2x 0.5mm²(AWG20)), HOTEND THERMISTOR (2x 0.25mm²), INDUCTIVE PROBE (3x 0.25mm²) to the board.
Tips:
- PROBE HOOKUP: The probe input of the Fysetc Spider supports a 24V probe. If you are using a different controller board you may need to wire the probe’s signal line to an endstop input using a BAT85 diode.

## p.266
Shows: A MOTOR (4x 0.25mm²(AWG24)), HOTEND COOLING FAN and PART COOLING FAN (2x 0.25mm²(AWG24)).

## p.267
Tips:
- FAN VOLTAGE: The fans recommended in the sourcing guide are 24V fans. Please check your hotend cooling (40x40x10 axial), part cooling (50x50x15 blower) and exhaust/electronics (60x60x20 axial) fans for their voltage rating and jumper the voltage selection accordingly. Refer to the Fysetc Spider manual for possible settings.

## p.268
Shows: Z Left, Z Right, Z Rear motors to the board.
Tips:
- MOTOR CONNECTIONS: 4x 0.25mm²(AWG24) or larger

---

## CAD vs manual

| Manual | CAD | Page shows |
| --- | --- | --- |
| p.244 bed chain | `Z Assembly:1/10x11 Chain Z` (20 links, 2 ends, 6 M3x6 FHCS) | Installed; lower 3 FHCS into the Z chain anchor inserts |
| pp.256–257 X chain | `Gantry:1/X Axis:1/10x11 Chain X` (21 links, 2 ends, 4 FHCS) + Gantry_Frame drop-in T-nut M3:79 at (−76, 211, −154) | Installed via free() |
| p.259 T-nut and zip tie loop | Gantry_Frame drop-in T-nut M3:54 at (0, 315, −154); `Cable Frame Anchor:8` at (0, 343, −150) | Installed |
| p.261 FHCS | Chain Y has a "Chain Wire Anchor (For 3 hole chains only)" plate under the fixed end | Not in the manual. It sits between the cable bridge and the chain's fixed end, so it goes in at the start of the p.260 step, before the chain (dropping it in after the chain would pass it through the chain end) |
| p.259 zip tie loop | `Cable Frame Anchor:8` sits in the top slot of the right Y extrusion | Drops into the top slot from above, as on p.259 |
| pp.244, 257, 261 FHCS direction | Chain X and Y FHCS point down (heads up); the Z chain's upper FHCS enter the Z carriage inserts from −x, the lower ones the anchor inserts from +x, matching the side-on screws in the p.244 insets | movers set by hand (the 6 mm cube-shaped FHCS boxes defeat the automatic axis) |
| p.252 etc. port positions | No wires in the CAD | Text points to the manual page |

## Not drawn

- All wires, crimps, zip ties, cable clips, TBC-09 terminal cover (extras).
- `Cable Frame Anchor` 9, 10, 11 (rear right post at z −87; top rear extrusion) are not shown being installed on pp.190–268, so they are not placed by these chapters.
