# Belts: transcript, pp. 142–163

Source: `Assembly_Manual_Trident.pdf` (version 2026-06-24). Tip texts verbatim from `pdftotext -layout`; illustration descriptions are my own from 1000 px renders. Conventions as in the pilot transcript. Teal arrows on the belt pages show the routing direction.

Skipped: **p.142** (chapter title page).

---

## p.143 — BELTS
Shows: The printer in perspective with both belt paths highlighted blue, plus a top view and a front view showing the two paths stacked.
Tips:
- THE VORON BELT PATH: VORON printers use a belt path based on the popular CoreXY pattern. The individual belt paths are stacked on top of each other and the crossing often found in CoreXY designs is omitted. Compared to many other implementations, the motors are moved to a less intrusive position. To learn more about the principles behind CoreXY visit https://voron.link/ef72dd6. Equal belt tension is important to the proper function of a CoreXY motion system. We recommend to run one belt to get the required length, remove the belt from the printer and cut the second belt to the exact same length. As both belt paths have the same length this is an easy way of getting a consistent tension.

## p.144 — BELTS: OVERVIEW
Shows: Top view of the printer with one belt path; five circled zooms: the B drive (rear left), the A drive (rear right), the left XY joint, the right XY joint (with the cable bridge) and the A front idler (front right).
Tips: none.

## p.145 — BELTS: OVERVIEW
Shows: The same for the other belt path; zooms at both drives, both XY joints and the B front idler (front left).
Tips: none.

## p.146 — BELTS
Shows: Left: the two X carriage halves, an M3x12 SHCS going into the front of each. Right: a carriage half with its M3 inserts, and a side view dimensioning the screw head standing 3 mm proud.
Hardware labels: M3x12 SHCS, M3 Heat Set Insert.
Tips: none.

## p.147 — BELTS
Shows: Left: the left carriage half on the rail carriage; two belt ends (blue) laid against it; 2 M3x8 SHCS. Right: clamped.
Hardware labels: GT2 Belt 6mm wide, M3x8 SHCS.
Tips:
- CLAMP BELTS: Clamp both A and B belts in place by installing the left X carriage part. The belt teeth face away from the extrusion.

## p.148 — A BELT
Shows: Two close-ups of the A belt (blue) wrapping round a bearing stack/pulley, with arrows.
Tips:
- A BELT ROUTING: Follow the path pointed out by the arrows. Needle nose pliers, tweezers or similar tools can help in this step.

## p.149 — A BELT
Shows: Close-up of the A belt round the drive and turning along the side extrusion.
Tips: none.

## p.150 — A BELT
Shows: Left: the belt passing the right XY joint under the cable bridge. Right: the belt looping round the front idler.
Tips: none.

## p.151 — A BELT
Shows: The belt round the right XY joint idler, heading back along the X extrusion.
Tips: none.

## p.152 — B BELT
Shows: Left: the B belt round an XY joint idler. Right: the belt looping round the front idler.
Tips:
- B BELT ROUTING: Follow the path pointed out by the arrows. Needle nose pliers, tweezers or similar tools can help in this step.

## p.153 — B BELT
Shows: Left: belt along the X extrusion past an XY joint. Right: belt round the drive pulley and bearing stack.
Tips: none.

## p.154 — B BELT
Shows: Left: belt round the drive and along the side extrusion. Right: belt round the left XY joint idler towards the carriage.
Tips: none.

## p.155 — A/B BELTS
Shows: The right X carriage half (blue) added beside the left one.
Tips:
- X CARRIAGE: Use the second part of the X carriage to capture the belt ends.

## p.156 — A/B BELTS
Shows: Left: front view, 2 M3x8 SHCS into the right half. Right: 2 M3x30 SHCS through the side joining the halves.
Hardware labels: M3x30 SHCS (×2 labels), M3x8 SHCS.
Tips:
- FIX BELTS: Lightly tighten the screws. The belt must still be able to move.
- LEAVE LOOSE: Lightly tighten the screws.

## p.157 — A/B BELTS
Shows: Left: belt ends pulled down with arrows. Middle and right: the M3x8 and M3x30 screws highlighted.
Tips:
- PULL TIGHT: Grab both belt ends with a pair of pliers and pull the belt tight. As both belts are cut to the exact same total length and the belt paths are equal in length in this design, make sure the same length of belt protrudes from the carriage.
- TIGHTEN SCREWS: Fully tighten the carriage screws.

## p.158 — A/B BELTS
Shows: The logo cover and the bearing cover (both accent parts).
Tips:
- OPTIONAL: DOUBLE SHEAR SHAFT SUPPORT: Adding a bearing on the outboard side of each A/B motor supports the shaft at both ends, reducing deflection under belt tension and improving motion accuracy. Requires motor shafts at least 35 mm long. For motors with shorter shafts (typically 22–25 mm), use the decorative accent piece provided instead.
- LOGO COVER: Decorative accent piece for motors with short shafts.
- BEARING COVER: Holds the bearing that supports the motor shaft.

## p.159 — A/B BELTS - LOGO COVER
Shows: The logo cover (blue) set on top of a drive, then 2 M3x6 BHCS.
Hardware labels: M3x6 BHCS.
Tips: none.

## p.160 — A/B BELTS - BEARING COVER
Shows: An F695 bearing pressed into the bearing cover; the printed circlip on top.
Hardware labels: F695 Bearing.
Tips:
- FLANGED BEARING: The bearing should press-fit into the mount so it stays locked in place during operation.
- CIRCLIP: This printed circlip holds the bearing in place and keeps it from walking up the shaft.

## p.161 — A/B BELTS - BEARING COVER
Shows: The bearing cover (blue) on top of a drive, then 2 M3x6 BHCS.
Hardware labels: M3x6 BHCS.
Tips: none.

## p.162 — X CARRIAGE
Shows: Left: the probe bracket (blue) under the carriage. Right: the inductive probe (blue) with 2 M3x30 SHCS; its cable going up.
Hardware labels: M3x30 SHCS, Inductive Probe.
Tips:
- PROBE WIRES: Cut the probe wires to about 150mm.
- OTHER PROBE TYPES: The picture shows the recommended Omron TL-Q5MC probe. Other probes with a similar form factor and characteristics might work as well. A design for a PINDA probe adapter is included in the released files.

## p.163 — X CARRIAGE
Shows: Left: front view, probe tip dimensioned 6 mm below the printed part. Right: carriage from above, a slot highlighted.
Tips:
- ADJUST PROBE POSITION: The position can be fine-tuned later. Set an initial position of about 6mm below the plastic part.
- CHANNEL FOR PROBE CABLE: Guide the probe cable into the highlighted slot.

---

## Steps (tools/chapters/06-belts.cjs)

| # | id | Pages | Content |
| --- | --- | --- | --- |
| 1 | bt-path | 143–145 | Belt path explanation (no movers) |
| 2 | bt-hooks | 146 | 2 M3x12 SHCS in the carriage halves, 3 mm proud |
| 3 | bt-clamp | 147 | Left carriage half, 2 M3x8 SHCS |
| 4 | bt-belt-a | 148–151 | A belt drops in from above |
| 5 | bt-belt-b | 152–154 | B belt drops in from above |
| 6 | bt-capture | 155–156 | Right half, 2 M3x8, 2 M3x30 SHCS |
| 7 | bt-tension | 157 | Pull tight, tighten (no movers) |
| 8 | bt-cover-bearing | 158, 160 | F695 and circlip into both bearing covers (bench, side by side) |
| 9 | bt-cover-mount | 159, 161 | Covers onto the drives, 2 M3x6 BHCS each |
| 10 | bt-probe | 162–163 | Probe bracket, Omron probe, 2 M3x30 SHCS |

## CAD vs manual

| Manual | CAD | Page shows |
| --- | --- | --- |
| pp.148–154 routing by arrows | `A_Belt` and `B_Belt` are single closed solids in their routed shape. A is the upper level (z −158…−152), B the lower (z −168…−162). A: carriage – left XY joint – left side to the rear – across the back – A drive (rear right) – right side to the A front idler – back to the right XY joint – carriage. B mirrors it | Each belt drops in from 120 mm above; the step text describes the loop from the CAD shape and points to the manual pages |
| p.147 belt ends clamped | The CAD belt is a closed loop; no separate ends | Belts appear in the routing steps |
| p.146 M3x12 SHCS | 2 `M3x12 SHCS` in the front of the carriage halves (y ≈ 175); the CAD's Stealthburner hangs on them | As the CAD (chapter 08) |
| pp.147/156 M3x8 SHCS | 4 `M3x8 SHCS` at ±10 mm around the MGN12H block: 2 through each half into the rail carriage | 2 with the left half, 2 with the right |
| p.156 M3x30 SHCS | 2 run along X through the left half into the side inserts of the right half | As the CAD |
| p.158 logo cover *or* bearing cover | Both `[a]_cover_logo_x2` and `[a]_cover_bearing_x2` (with `circlip_x2` and an F695) sit in the same place on each drive | Bearing cover drawn; logo covers left out (the viewer can't show alternatives yet); the step text says the logo cover goes on the same way |
| p.159/161 M3x6 BHCS | 2 per drive in the cover corners (`*_Drive_Hardware`) | As the CAD |
| p.162 probe | `Probes` holds the Omron TL-Q5MC (2 `M3x30 SHCS`) and a Panasonic GX-H15A (2 `M3x16 SHCS`) in the same place | Omron drawn, as the manual recommends; Panasonic left out |
| p.162 probe bracket | `probe_bracket` (inserts from p.120) | Rises in from below, then the probe from the front |

## Not drawn

- Belt cutting and tensioning; pliers, needle nose pliers or tweezers.
- Probe wires and the probe cable channel routing.
- Logo covers (see above).
