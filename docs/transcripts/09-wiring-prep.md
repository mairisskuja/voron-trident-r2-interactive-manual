# Wiring Preparation, pp. 190–212

Source: `Assembly_Manual_Trident.pdf` (version 2026-06-24). Tip text is verbatim from `pdftotext -layout`. Descriptions of the illustrations are my own, from 900 px renders. Header "VORONDESIGN.COM" and page numbers omitted.

## p.190 — WIRING PREPARATION
Chapter title page: render of the printer with gantry, bed and Z motors, deck still open. Not a step.

## p.191 — Z CHAIN ANCHOR
Shows: left, the Z chain anchor (L-shaped printed part with an upright) with 3 light-blue inserts going into the upright. Right, two light-blue T-nuts dropping into the top slot of the lower back extrusion, left of the rear Z motor and the rear vertical brace.
Hardware labels: M3 Heat Set Insert, M3 T-Nut.
Tips: none.

## p.192 — Z CHAIN ANCHOR
Shows: the anchor on the back extrusion, fixed with two light-blue screws. Inset: printer from behind with the anchor highlighted (Top / Front / Back labels). Side view with a dimension of 88 mm from the rear vertical extrusion to the anchor upright.
Hardware labels: M3x8 SHCS.

## p.193 — CABLE COVER
Shows: three panels at a rear bottom corner above a Z/skirt corner: two T-nuts into the top slots of the two bottom extrusions; the light-blue cable cover laid over the corner; two M3x8 SHCS. Inset highlights a rear corner.
Hardware labels: M3 T-Nut, M3x8 SHCS.

## p.194 — CABLE COVER
Same as p.193, mirrored, at the other rear corner.
Hardware labels: M3 T-Nut, M3x8 SHCS.

## p.195 — DECK PANEL
Shows: the deck panel (light blue) lowered onto the bottom frame between the lead screws; second view seated. A blue circle marks the notch at the Z chain anchor.
Tips:
- PANEL ORIENTATION: Align the notch to the back and in line with the Z chain anchor.

## p.196 — FRONT MOTOR COVERS
Shows: the two front motor covers from below, each with a blue indicator arrow.
Tips:
- COVER ORIENTATION: The front motor covers have small indicator arrows on the underside that must point toward the front of the printer.

## p.197 — RIGHT Z MOTOR COVER
Shows: three panels at the front right Z motor: two T-nuts into the top slots of the front and right bottom extrusions; a light-blue strip (clip) laid across the motor mount; an M2x10 self-tapping screw into the clip.
Hardware labels: M3 T-Nut, M2x10 ST.

## p.198 — RIGHT Z MOTOR COVER
Shows: the cover lowered around the lead screw; three M3x6 BHCS.
Hardware labels: M3x6 BHCS.

## p.199 — REAR Z MOTOR COVER
Shows: two T-nuts on the back extrusion either side of the rear Z motor, the clip, and an M2x10 ST. The Z chain anchor is visible.
Hardware labels: M3 T-Nut, M2x10 ST.

## p.200 — REAR Z MOTOR COVER
Shows: the rear cover around the lead screw and rear vertical brace; three M3x6 BHCS.
Hardware labels: M3x6 BHCS.

## p.201 — LEFT Z MOTOR COVER
As p.197, front left motor.
Hardware labels: M3 T-Nut, M2x10 ST.

## p.202 — LEFT Z MOTOR COVER
As p.198, front left motor.
Hardware labels: M3x6 BHCS.

## p.203 — DECK PANEL
Shows: printer upside down (inset: Top at the bottom, back extrusion highlighted). Two light-blue deck supports in the slot of the back extrusion either side of the rear Z motor; close-ups of a support going in and being rotated (black arrow).
Tips:
- TWIST TO LOCK: Rotate the deck supports clockwise by 90° to lock them in place.

## p.204 — DECK PANEL
Shows: upside down, front extrusion highlighted: two deck supports between the front Z motors, then rotated.
Tips:
- TWIST TO LOCK: Rotate the deck supports by 90° to lock them in place.

## p.205 — DIN RAILS
Shows: upside down, two views with light-blue M5 T-nuts in the inner slot of a bottom side extrusion: 5 in the first view, 4 in the second (insets highlight the left and right side extrusions).
Hardware labels: M5 T-Nut.

## p.206 — DIN RAILS
Shows: two DIN rails (light blue) with a DIN mount on each end and a centre support, laid across the underside of the deck.
Hardware labels: DIN Center Support.

## p.207 — DIN RAILS
Shows: top views: rails roughly centred; then the mounts slid outward (blue arrows) to the extrusions.
Tips:
- SPACING: Roughly center the DIN rails and space them about 80mm apart.
- SLIDE INTO POSITION: Slide the mounts all the way to the extrusions.

## p.208 — DIN RAILS
Shows: two close-ups, two M5x16 BHCS per mount going into the side extrusion.
Hardware labels: M5x16 BHCS.

## p.209 — DIN RAILS
Shows: underside view of both rails, one M3x8 SHCS in each mount.
Hardware labels: M3x8 SHCS.
Tips:
- DON’T OVERTIGHTEN: The screws are used to keep the DIN rails from sliding and are threaded directly into plastic.

## p.210 — ZIP TIE LOOPS
Shows: three zip tie loops on a rear post (inset highlights a rear post; the Z chain anchor sits at its foot), close-ups of a loop entering the slot and rotated.
Tips:
- TWIST TO LOCK: Rotate the zip tie loops clockwise by 90° to lock them in place.

## p.211 — ZIP TIE LOOPS
As p.210 on the other rear post.
Tips:
- TWIST TO LOCK: Rotate the zip tie loops clockwise by 90° to lock them in place.

## p.212 — trivia
"VORON Trident was released on August 16, 2021." Not a step.

---

## CAD vs manual

| Manual | CAD | Page shows |
| --- | --- | --- |
| p.191 one Z chain anchor | `z_chain_lower_2hole` and `z_chain_lower_3hole` overlap in the same place with 2 + 3 inserts | The 3-hole variant (matches the 10x11 chain's 3 lower M3x6 FHCS); its 3 inserts picked as those nearest to the chain FHCS |
| p.192 88 mm from the H extrusion | Anchor at x ≈ −278 | Text quotes the manual's 88 mm |
| pp.193–194 which corner first | Covers `Deck_Wire_Cover_Right/Left` | Merged into one step; T-nuts from the pool at z −504 under each screw |
| p.195 deck panel (Panels subtree) | `Panels:1/Opaque Panels:1/Deck_Panel:1` | Installed here as `wp-deck-panel` |
| p.197 "clip" unnamed | Each `[a]_z_cover_*` is two solids: the cover and a small strip | Small solid named "Z cover …, clip", fixed by the M2x10 ST |
| pp.198–202 3x M3x6 per cover | 2 screws go into frame T-nuts, the centre one into an M3 heat set insert in the Z mount | Insert is taken with free(); if the Z Axis chapter already installed it, it is skipped |
| pp.203–204: 2 supports at the back, 2 at the front | 6 deck supports: front ×2, back ×1, right ×2 (y ≈ 74 and 342), left ×1 (y ≈ 74) | p.203 step takes the 2 in the back half (y > 200), p.204 the 4 in the front half |
| p.205 5 M5 T-nuts on one side, 4 on the other | Side T-nuts: 4 for DIN mounts per side, + PSU stabilizer (right) + WAGO mount (left) | 9 T-nuts here (right 5, left 4, matching the page); the WAGO mount's two T-nuts (left side and back) go in on p.224 in Electronics |
| p.207 slide the mounts | Mounts sit against the extrusions | Mounts start 40 mm inboard on p.206 and slide out on p.207 |
| pp.210–211 which post first | 3 `Cable Frame Anchor` on each rear post | p.210 rear left (B motor wires, p.251), p.211 rear right (p.263) |
| — | DIN mounts and centre supports carry 1 mm foam tape | Drawn as part of the mount |

## Not drawn

- Printer flipped upside down (pp.203–211): the CAD stays upright; those steps are viewed from below.
