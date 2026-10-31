# Voron Trident Assembly Manual: Print Bed transcript, pp. 164–187

Source: `Assembly_Manual_Trident.pdf` (version 2026-06-24, VoronDesign, GPL-3.0). Tip texts and labels are verbatim from `pdftotext -layout`. Line wraps are joined and ligatures written out. Descriptions of the illustrations are my own, based on 1000 px renders. Page furniture ("VORONDESIGN.COM", page numbers) is omitted.

Chapter module: `tools/chapters/07-print-bed.cjs` (21 steps).

---

## p.164 — PRINT BED
Chapter title page. Not a step.

## p.165 — PRINT BED
Shows: the build plate from above (Back/Top/Front labels; two counterbored holes at the front corners, one counterbored hole at the back centre with two small tapped holes beside it), a perspective view, and a side section labelled Top/Bottom. A small section shows a screw head sitting in a counterbore.
Hardware labels: none.
Tips:
- WHICH SIDE IS WHICH?: The top of the plate has mounting holes counterbored so screw heads sit flush with or below the surface. The back has additional tapped holes for the protective earth (PE) connection and a thermal fuse.
Step: merged into `bed-magnet`.

## p.166 — PRINT BED
Shows: the magnet sheet (light blue) above the build plate, top side up.
Hardware labels: Magnet Sheet, Build Plate.
Tips:
- MAGNET APPLICATION: Clean the plate with isopropyl alcohol or similar cleaner prior to applying the magnet. Use the edge of a plastic object or a small roller to firmly press the magnet on the plate to get a good bond. If you have never done this before we recommend you watch the linked guide.
Other text: QR code, https://voron.link/rm6tpld
Step: `bed-magnet`.

## p.167 — PRINT BED
Shows: the plate turned over (Bottom label), the heater (light blue) above it, and a plan view with the heater centred and its lead exiting at the back edge. A square thermistor pocket sits in the heater centre.
Hardware labels: none.
Tips:
- HEATER APPLICATION: The heater is installed in the same fashion as the magnet. Center it on the underside of the build plate and make sure to firmly press it on the build plate.
Step: `bed-heater`.

## p.168 — PRINT BED
Shows: underside of the plate; the thermal fuse (light blue) with an M3x12 SHCS and M3 washer fixed to the back edge beside the heater lead. A plan view shows the thermistor wires (blue/black) and the heater wires (brown) running out, with the fuse on a heater wire.
Hardware labels: M3x12 SHCS, M3 Washer. Red labels: THERMISTOR WIRES, HEATER WIRES.
Tips:
- THERMAL FUSE: While not required to operate the printer, a thermal fuse attached to the build plate adds an additional layer of protection against potentially dangerous malfunctions. The thermal fuse is wired in-line with the heater wires. Depending on the tapped holes in the plate you may need to use a shorter screw.
Step: `bed-fuse`.

## p.169 — HEATED BED
Shows: underside of the plate; a ring terminal on a green/yellow wire fixed with an M3x6 BHCS at the back, next to the heater lead and thermal fuse.
Hardware labels: M3x6 BHCS, Ring Terminal.
Tips:
- PROTECTIVE EARTH (PE): 1mm²(AWG18) or larger
Step: `bed-pe`.

## p.170 — Z ENDSTOP
Shows: a GT2 20 tooth pulley; the pulley (flange removed) pressed into the top of the Z endstop part; a microswitch without lever going in from below; the switch fixed with two M2x10 self tapping screws.
Hardware labels: GT2 20 Tooth Pulley, Microswitch, M2x10 Self Tapping.
Tips:
- REMOVE FLANGE & SET SCREWS: Use a bottle opener or some pliers to remove the top flange.
- PRESS FIT: Apply the required force to fully seat the pulley in the printed part.
- SWITCH WITHOUT LEVER: This part requires a switch without lever to be installed in the shown orientation. You can remove the lever from microswitches by gently pressing on the lever’s hinge point.
Other text: QR code, https://voron.link/ict0j6x
Step: `bed-zend-build`.

## p.171 — Z ENDSTOP
Shows: a 3-pin connector (light blue) fitted in the side of the endstop; a 5 mm shaft pushed into the pulley; a plan view with two black solder bridges from the outer switch terminals to the connector.
Hardware labels: 5mm Shaft.
Tips:
- PREVENTING MISHAPS: You can add a notch to the Z endstop point and capture it with a grub screw to prevent it from falling out.
- SOLDER CONNECTOR: Solder a connection from the outer two terminals of the microswitch to the connector.
Step: `bed-zend-shaft`.

## p.172 — BED CONNECTION
Shows: three Wago lever nuts (light blue) in the Wago mount, and the finished mount from another angle.
Hardware labels: WAGO 221-412 Lever Nuts.
Tips: none.
Step: `bed-wago`.

## p.173 — BED FRAME
Shows: the extrusion thumbnail with F and G highlighted; an M5x16 BHCS going into one end of the G extrusion; G joined to F in a T with a "175" dimension from the end of F to G.
Hardware labels: G Extrusion, F Extrusion, M5x16 BHCS.
Tips:
- OTHER FRAME SIZES: The distance is shown for a 250 spec frame. Add 25mm for a 300 or 50 for a 350 sized frame.
Step: `bed-frame-join`.

## p.174 — BED FRAME
Shows: the T-shaped bed frame with T-nuts in the top slots: an M5 pair and an M3 near each end of F, and (zoom) M5 T-nuts and an M3 T-nut at the far end of G.
Hardware labels: M5 T-Nut (×3 labels), M3 T-Nut (×3 labels).
Tips: none.
Step: `bed-frame-tnuts`.

## p.175 — BED FRAME
Shows: two views of the bed frame: M3 T-nuts in one side slot of G near its rear end, and two M5 T-nuts (light blue) in the other side slot of G.
Hardware labels: M3 T-Nut, M5 T-Nut.
Tips: none.
Step: `bed-frame-side-tnuts`.

## p.176 — BED FRAME
Shows: a GE5C bearing (light blue) going into a printed part (the front left bed mount; thumbnail of the bed frame highlights the front left corner); three M3x6 BHCS around the bearing.
Hardware labels: GE5C Bearing, M3x6 BHCS.
Tips:
- DON’T OVERTIGHTEN: The screws are used to position the bearing and are threaded directly into plastic.
Step: `bed-zbed-left-bearing`.

## p.177 — BED FRAME
Shows: the same printed part (light blue) placed on the left end of the F extrusion, then fixed with two M5x16 BHCS.
Hardware labels: M5x16 BHCS.
Tips: none.
Step: `bed-zbed-left-mount`.

## p.178 — BED FRAME
Shows: as p.176 for the rear part (thumbnail highlights the rear end of G).
Hardware labels: GE5C Bearing, M3x6 BHCS.
Tips:
- DON’T OVERTIGHTEN: The screws are used to position the bearing and are threaded directly into plastic.
Step: `bed-zbed-rear-bearing`.

## p.179 — BED FRAME
Shows: the rear part (light blue) on the rear end of G, fixed with two M5x16 BHCS.
Hardware labels: M5x16 BHCS.
Tips: none.
Step: `bed-zbed-rear-mount`.

## p.180 — BED FRAME
Shows: as p.176 for the front right part.
Hardware labels: GE5C Bearing, M3x6 BHCS.
Tips:
- DON’T OVERTIGHTEN: The screws are used to position the bearing and are threaded directly into plastic.
Step: `bed-zbed-right-bearing`.

## p.181 — BED FRAME
Shows: the front right part (light blue) on the right end of F, fixed with two M5x16 BHCS.
Hardware labels: M5x16 BHCS.
Tips: none.
Step: `bed-zbed-right-mount`.

## p.182 — BED FRAME
Shows: front view of the printer with the bed frame (light blue) sitting on the three Z joints; three zooms each show an M5x16 BHCS going down through the bearing into the Z joint.
Hardware labels: M5x16 BHCS (×3).
Tips: none.
Step: `bed-frame-install`.

## p.183 — BED FRAME
Shows: top view of the printer; the six screws holding the bed frame to the printed parts are highlighted (two at the rear, two at each front corner).
Hardware labels: none.
Tips:
- LOOSEN AND RETIGHTEN: Slightly loosen the screws that hold the bed frame to the printed parts and gently shake the bed frame before retightening them.
Step: `bed-frame-settle`.

## p.184 — BED FRAME
Shows: three M4 thumb nuts on the bed frame (two on F, one on G); the bed (light blue) laid on them; three M3x16 SHCS going down through the bed.
Hardware labels: M4 Thumb Nuts, M3x16 SHCS.
Tips:
- VARIABLE SCREW SIZE: If you are using a thicker bed (9.5mm) you may need to change the M3x16 screws out for M3x20
- DON’T TIGHTEN FULLY: Only tighten one screw fully. Leave the remaining screws slightly loose. This will allow for thermal expansion without putting additional stress on the plate.
Step: `bed-mount`.

## p.185 — BED FRAME
Shows: the Z endstop (light blue) on the side of the bed frame under the rear of the bed, fixed with two M3x20 SHCS; a locator thumbnail (back centre); a side zoom circling the shaft tip just clear of the bed.
Hardware labels: M3x20 SHCS.
Tips:
- ADJUST Z ENDSTOP POSITION: The shaft of the Z Endstop must not touch the print bed. Adjust the position if required.
Step: `bed-zend-mount`.

## p.186 — BED WIRING
Shows: the Wago mount (light blue) on the side of the bed frame under the bed, then fixed with two M5x10 BHCS.
Hardware labels: M5x10 BHCS.
Tips: none.
Step: `bed-wago-mount`.

## p.187 — BED WIRING
Shows: wiring diagram in plan view: the PE wire (green/yellow) to the first lever nut, a blue wire to the second, a brown heater wire via the thermal fuse to the third; the black thermistor pair and a brown wire leave downwards. The Z endstop connector is drawn beside the bed.
Hardware labels: none.
Tips: none.
Step: `bed-wiring` (informational; the diagram stays in the manual).

---

## CAD vs manual

| Manual | CAD | Shown |
| --- | --- | --- |
| pp.176–181 call the bearing holders "printed parts", unnamed | `z_bed_left`, `z_bed_rear`, `z_bed_right`, in the Z_Left / Z_Rear / Z_Right subtrees | CAD names: "Z bed left/rear/right" |
| pp.176/178/180 draw the 3 M3x6 BHCS entering from the top, heads over the bearing rim | The three M3x6 BHCS at bearing height (z ≈ −226) have their heads on the underside of z_bed (no heads visible from above) | CAD and manual agree: the drawings show z_bed upside down (the extrusion key and the M5 holes of the underside face up). Bearing and screws go in from below; the bearing steps are viewed from below |
| p.173 "175" from the end of F | G sits 175 mm from the left end of F (x −380 → −205) | G slides along the F channel from the left end |
| p.174–175 T-nut counts are hard to read | 8 M5 (F top 4, G top 2, G left side 2) + 5 M3 (F top 2, G top 1, G right side 2) | As the CAD |
| p.185 "side of the bed frame" | Z endstop on the right (+x) side of G near its rear end, M3x20 into the two M3 side T-nuts | As the CAD |
| p.186 Wago mount side | Left (−x) side of G, M5x10 into the two M5 side T-nuts | As the CAD |
| p.184 thumb nuts | Each M4 thumb nut sits over one of the three top M3 T-nuts; the M3x16 SHCS pass through the bed and nut into the T-nut | As the CAD |
| Manual never mentions a flex sheet | `Flex Sheet` in Bed Components, on the magnet | Shown last in `bed-mount` with a note saying the manual does not cover it here |
| p.170 "GT2 20 Tooth Pulley" | `GT2 20T 6mm Deflanged` (flange already removed) | As the CAD |
| p.171 3-pin connector unnamed | `JST 3pin Recepticle` | "JST 3-pin connector" |
| Microswitch | `D2F Microswitch` (6 solids: plunger, 3 contacts, 2 body) | One part |
| p.172 lever nuts pressed in from the open (lever) side | The mount lies flat on the side of G with its pocket opening downward (−z) | Lever nuts come in from below; viewed from below |
| p.182 bed frame set on the Z joints | The z_bed parts reach past the front posts (x −399 … 9) | The frame comes down from above (a move from the front would pass through the posts) |
| p.187 wiring | PE to one lever nut, one heater wire to the next, the other heater wire through the thermal fuse to the third; thermistor wires run on | Text follows the diagram |
| p.182 | The pivot M5x16 BHCS of each z_bed goes through the GE5C into the M5 heat set insert of the Z carriage | Parent = the GE5C bearing |

## Not drawn

- Wires: heater, thermistor, PE wire, thermal fuse leads, endstop wiring (pp.168, 169, 171, 187). Listed as extras.
- Isopropyl alcohol, soldering iron, roller (pp.166, 171).
- The optional grub screw and notch in the Z endstop shaft (p.171).
- The Z joints / Z carriages themselves (built in the Z Axis chapter); with `CHAPTERS=07` the bed frame lands on empty space.
