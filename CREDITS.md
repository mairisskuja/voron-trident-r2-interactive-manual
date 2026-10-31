# Credits and sources

## VORON Trident

The VORON Trident 3D printer is designed by the **VORON Design team** and its community contributors: https://vorondesign.com

Everything this interactive manual shows of the printer comes from their open-source release:

| Source | Used for | License |
| --- | --- | --- |
| [VoronDesign/Voron-Trident](https://github.com/VoronDesign/Voron-Trident) at commit [`7fcb325`](https://github.com/VoronDesign/Voron-Trident/tree/7fcb3257a3063225934d9608f82037aa6587d844) | `CAD/trident_assembly.step.zip`: all 3D geometry | GPL-3.0 |
| [Assembly_Manual_Trident.pdf](https://github.com/VoronDesign/Voron-Trident/blob/7fcb3257a3063225934d9608f82037aa6587d844/Manual/Assembly_Manual_Trident.pdf), version 2026-06-24 | Step order, step titles, instructions and tips (adapted) | GPL-3.0 |
| [VoronDesign/Voron-Extras](https://github.com/VoronDesign/Voron-Extras/tree/6d982a5cc6d55445e2f91c9958c2b1df93519e16/Images/Logo/SVG) | VORON stripes symbol (`Stripes_Logo.svg`): header, loading screen and favicon | GPL-3.0 |

Contributors to the Trident repository: https://github.com/VoronDesign/Voron-Trident/graphs/contributors

### What this project changed

- The STEP assembly is tessellated and rendered as line art in the browser. Geometry is not edited; hardware meshes (screws, inserts, motors, belts…) are simplified at build time to within 0.05 mm of the CAD.
- Manual pages are split into animated steps. Instruction and tip text is taken from the official manual, shortened or reworded in places to fit the interactive format. Every step links to the page of the official manual it is based on.
- Hardware counts and part lists are computed from the CAD model.

## Interactive manual

Created by **Mairis Skuja · [Iconic FAB](https://iconic-fab.com)**.

- Renderer and exports: built on the *teardown* line-art renderer by Jakub Krehel ([jakubkrehel/skills](https://github.com/jakubkrehel/skills), MIT, notice in `tools/teardown/LICENSE`).
- three.js (MIT), jsPDF (MIT) and svg2pdf.js (MIT) are loaded from public CDNs at runtime.
- Hardware mesh simplification at build time: [meshoptimizer](https://github.com/zeux/meshoptimizer) by Arseny Kapoulkine (MIT), a development dependency only.
- Social video encoding (`tools/record-social.mjs`): [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) by Vanilagy (MIT), a development dependency only.
- STEP reading at build time: [cadquery-ocp](https://github.com/CadQuery/OCP) (Apache-2.0), Python bindings for [Open CASCADE Technology](https://dev.opencascade.org/) (LGPL-2.1 with an exception), a build tool only.

## Not affiliated

This is an independent community project. It is **not affiliated with, endorsed by or supported by the VORON Design team**. "VORON" and the VORON logo belong to VORON Design and are used here only to identify the printer this manual is for. The official assembly manual is the reference: where the two differ, follow the official manual.
