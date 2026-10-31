# Electronics, pp. 213–232

Source: `Assembly_Manual_Trident.pdf` (version 2026-06-24). Tip text verbatim from `pdftotext -layout`; illustration notes are my own, from 900 px renders.

## p.213 — ELECTRONICS
Chapter title page. Not a step.

## p.214 — RASPBERRY PI
Shows: DIN clip; the Raspberry Pi bracket (light blue) set on it; two screws through the bracket into the clip.
Hardware labels: M2x10 Self Tapping.
Tips:
- DON’T OVERTIGHTEN: These screws thread directly into plastic and strip easily.

## p.215 — RASPBERRY PI
Shows: the Raspberry Pi (light blue) on the bracket; four screws in its corner holes.
Hardware labels: Raspberry Pi, M2x10 Self Tapping.
Tips:
- DON’T OVERTIGHTEN: These screws thread directly into plastic and strip easily.

## p.216 — 5V PSU
Shows: the RS-25-5 PSU with its printed DIN bracket (light blue) on top; two screws.
Hardware labels: RS25-5 PSU, M3x6 BHCS.

## p.217 — 24V PSU
Shows: the LRS-200 PSU with two printed DIN brackets; two screws each.
Hardware labels: M4x6 BHCS.

## p.218 — CONTROLLER BOARD
Shows: two DIN clips with a controller mount (light blue) on each; two screws each.
Hardware labels: M2x10 Self Tapping.
Tips:
- AVAILABLE MOUNTS: We also provide mounts for other controller boards. They are assembled in a similar manner.

## p.219 — CONTROLLER BOARD
Shows: a plain board outline (blue) on the two mounts; four screws.
Hardware labels: M3x6 BHCS.
Tips:
- WHY DOES IT LOOK THAT WAY?: We used a dummy to keep the file size of the printers CAD manageable. The wiring section will have a fully featured image.

## p.220 — SSR
Shows: the solid state relay on a metal relay mount; two screws.
Hardware labels: M4x6 BHCS, Solid State Relay, Relay Mount.
Tips:
- WHERE CAN I FIND THE RELAY MOUNT?: The SSR mount is an off the shelf part. Look for a metal bracket in your pile of parts. There is no printed mount.

## p.221 — POWER INLET
Shows: the inlet mount with three inserts (one on top, two on the face); then the switch and the filtered inlet (light blue) pushed in, two FHCS for the inlet.
Hardware labels: M3 Heat Set Insert, Switch, Filtered Inlet, M3x10 FHCS.
Tips:
- ALTERNATE INLETS: This page displays the filtered inlet. For combo inlets, the printed parts and inlet will differ.

## p.222 — POWER INLET
Shows: printer upside down; two T-nuts in the back extrusion near the left rear corner; the inlet mount placed; two screws. Inset highlights the location.
Hardware labels: M3x8 SHCS.

## p.223 — (DIN mount how-to)
Shows: three stages of a printed mount going onto a DIN rail.
Tips:
- HOOK FIXED SIDE: Hook the fixed side of the printed mount to the side of DIN rail.
- MOVE INTO POSITION: Rotate the part into place, make sure it does not unhook from the fixed side.
- SNAP INTO PLACE: Press to snap the free side into place. The part should now sit securely on the DIN rail.

## p.224 — MAINS DISTRIBUTION - WAGO
Shows: the L-shaped WAGO mount with three 221-415 lever nuts (light blue); two M5 T-nuts in the corner extrusions; the mount fixed with two screws in the rear corner next to the Z/skirt corner.
Hardware labels: WAGO 221-415 Lever Nuts, M5 T-Nut, M5x10 BHCS.

## p.225 — PSU MOUNTING
Shows: the 24V PSU (light blue) lowered (blue arrow) onto the rear DIN rail; inset top view of the electronics bay with its position.

## p.226 — PSU MOUNTING
Shows: the PSU stabilizer bracket (light blue) between the side extrusion and the PSU; close-up with an M5x10 into the extrusion and an M4x6 into the PSU.
Hardware labels: M4x6 BHCS, M5x10 BHCS.

## p.227 — SSR MOUNTING
Shows: SSR on the rear DIN rail next to the 24V PSU terminals; close-ups of the spring latch of the relay mount; inset location.
Tips:
- SPRING LOADED: Use a flat head screwdriver to pull the latch open. It will lock open. Be careful when releasing the latch, it will snap back into place. Mind your fingers.

## p.228 — PSU MOUNTING
Shows: the 5V PSU (light blue) lowered onto the rear rail next to the SSR; inset location.

## p.229 — RASPBERRY PI MOUNTING
Shows: the Pi assembly lowered onto the front rail; inset location.

## p.230 — CONTROLLER BOARD MOUNTING
Shows: the controller board assembly lowered onto the front rail; inset location.

## p.231 — OPTION: X/Y ENDSTOP PCB
Shows: under the right XY joint, the XY endstop board placed, then an accent cover (red heart), then two screws.
Hardware labels: XY Endstop Board, M3x6 BHCS.
Tips:
- XY ENDSTOP PCB: An alternate endstop solution, used instead of sensorless homing or D2F switches on the X carriage and A motor mount. Skip this step if you're using one of those.

## p.232 — trivia
"Around 1100 images have been created for use in this manual. Slightly below 700 made it into the final document." Not a step.

---

## CAD vs manual

| Manual | CAD | Page shows |
| --- | --- | --- |
| p.219 board fixed with 4 M3x6 BHCS | `Controllers:1/Octopus:1` carries an Octopus-sized dummy and 4 M3x8 SHCS | CAD geometry, labelled "M3x6 BHCS" as the manual |
| p.218 controller mount | `Octopus Bracket` ×2 | Named "Controller mount" |
| p.221 power inlet | In the skirt subtree: `Skirt:1/Rear:1/Rear_Skirt_Power_Inlet:1`, two variants (Filtered, Adam's Tech combo) | Filtered variant (as the manual), with 3 inserts, 2 M3x10 FHCS, 2 M3x8 SHCS, 2 M3 T-nuts from the pool at (−340/−269, 390, −516). Combo variant described in a tip |
| p.221 switch | "Switch DPST" is 7 solids | One part |
| p.224 two M5 T-nuts | One in the inner slot of the left bottom extrusion (−384, 302, −510), one in the back (−282, 384, −510) | Both move here (p.205 shows only 4 on the left side) |
| p.221 switch and filtered inlet | Flange and bezel on the outer (+y) face; the FHCS heads on that face too | They push in from the outer face; the step is viewed from outside |
| p.226 PSU stabilizer | `Meanwell LRS-200-24:1/PSU_Stabilizer` with M4x6 + M5x10 | As CAD |
| p.231 XY endstop PCB is optional | CAD has the D2F XY endstop PCB, `[a]_d2f_cover` and 2 M3x6 BHCS under the right XY joint (X Axis subtree), and also D2F switches on the A drive | Drawn with free(): only what the X Axis chapter left |
| pp.225–230 rail positions | Rear rail: SSR, 5V PSU, 24V PSU; front rail: Pi, controller | As CAD; parts approach from below (the CAD stays upright) |

## Not drawn

- Mains/DC wires (next chapter).
