# Evidence: CAD, official manual and decisions

This file covers the Frame and A/B Drive and Idler chapters. Every later chapter has its own record in [docs/transcripts/](docs/transcripts/): the page-by-page transcript, then "CAD vs manual" and "Not drawn".

What each fact on the page comes from. Sources are pinned in [CREDITS.md](CREDITS.md): the STEP at VoronDesign/Voron-Trident `7fcb325` and the assembly manual version 2026-06-24.

## Geometry

- `trident_assembly.step` is the 250 mm build: 250 mm MIC6 bed, MGN9 300 mm rails, 300 mm lead screws. It also holds skirts for all three sizes.
- 585 unique solids are placed 1,595 times. `tools/step/convert_ocp.py` reads the assembly tree with native OpenCascade (XCAF), meshes each solid once and records every placement. The WebAssembly OpenCascade used for the Stealth Press runs out of its 4 GB memory on this file and returns empty meshes.
- Axes: Z up, millimetres. Front is y = 0, back y = 390; left x = −390, right x = 0. B idler front left, A idler front right, B drive rear left, A drive rear right, as on manual page 25.

## Where the CAD settles what the manual leaves open

| Manual | CAD | Page shows |
| --- | --- | --- |
| p.16 draws one M5x16 BHCS in one end of an A extrusion | Every A extrusion has a BHCS in both ends; C both ends; H the lower end. 21 screws (18 frame + 4 on the Y extrusions, minus the bed G screw) | Both ends |
| pp.29–30 show M3x40 SHCS twice | 2 per idler in total | Installed on p.29's step; p.30 says they thread into the idler front |
| pp.37/44 bearing stacks are hard to count | 8 F695 + 8 M5 shims per drive, in two stacks | As the CAD |
| pp.34–35 don't say which half takes which inserts | M3 inserts in `*_stepper_upper`, M5 inserts in `*_stepper_lower`, one M3x8 locating screw in each | As the CAD |
| p.26 parts unnamed | 3 inserts in `[a]_idler_carrier_b`, 2 in `[a]_idler_front` | CAD names |

## Not drawn

- Printed tools (110 mm Y alignment spacers, BA pulley alignment tool, 35 mm PTFE jig): the CAD has one copy of each, parked inside the frame, not in use positions. They are listed as "not displayed".
- The temporary spacer under the first Y extrusion (p.19) is not in the CAD.

## Decisions

- Front idler steps show both idlers side by side (`shift` in the catalog); in the CAD they are 370 mm apart. The manual says to build both ("Twice the fun").
- Drive steps keep the CAD orientation and view from below for the upside-down assembly the manual recommends.
- Parts added in a step are drawn light blue, as in the manual. Hardware labels use the manual's blue.
- Pages 7–11 (hardware reference) and chapter title pages are not steps. Their tips appear where they apply.

## Whole model

- 1,527 of the 1,595 CAD instances are drawn. Left out on purpose:
  - the 300 and 350 mm skirt variants;
  - the four parked printed tools, listed as "not displayed" where they are used;
  - the alternatives the CAD stacks in the same place: logo covers (the bearing covers are drawn), the D2F endstop parts and the XY-PCB bumper, the Gates idlers, the 2-hole cable bridge and Z chain parts, the Panasonic probe, the second Clockwork 2 cable cover, and the Adam's Tech power inlet;
  - Cable Frame Anchors 9–11, which no page installs;
  - one spare M3 T-nut in the rear bottom extrusion, where the CAD has two T-nuts at the same position.
- Hardware meshes (screws, inserts, T-nuts, belts, lead screws, motors and similar) are simplified at build time to a size-based triangle budget. Printed parts and extrusions keep full detail.
- The clear panels are drawn see-through (outlines only) so they don't hide the printer.
