# Stealthburner: transcript, pp. 188–189

Source: `Assembly_Manual_Trident.pdf` (version 2026-06-24). Tip text verbatim from `pdftotext -layout`.

## p.188 — STEALTHBURNER
Chapter title page. Not a step.

## p.189 — (untitled)
Shows: QR code and the cover of the VORON Stealthburner manual (red Stealthburner toolhead).
Tips:
- UNIVERSAL TOOLHEAD: This printer uses the Stealthburner toolhead, which is compatible with several of the printers in the VORON lineup. To keep things organized, Stealthburner’s files are maintained separately. Follow the Stealthburner assembly manual to build your toolhead, and return here to proceed.
Other text: https://voron.link/6hbi9n3

The Stealthburner manual itself is not transcribed.

---

## Steps (tools/chapters/08-stealthburner.cjs)

| # | id | Pages | Content |
| --- | --- | --- | --- |
| 1 | sb-build | 189 | Bench: the toolhead body, the Clockwork 2 extruder and the accelerometer mount come together (pointer to the Stealthburner manual) |
| 2 | sb-mount | 189 | The finished toolhead moves onto the X carriage |

## CAD vs manual

| Manual | CAD | Page shows |
| --- | --- | --- |
| p.189 "Stealthburner toolhead" | `Toolhead_Assembly` holds `Stealthburner_Assembly` (55 instances: main body, LEDs, 5015 and 4010 fans, M3x50/M3x25/M3x6 screws), `SB TOOLHEAD-Revo Voron` (25: Revo Voron hotend and its mount), `CW2_Assembly` (79: Clockwork 2 with LDO motor) and `ADXL_Assembly - Generic` (17) | Three parts: "Stealthburner toolhead" (SB + Revo, 80 instances), "Clockwork 2 extruder" (77), "ADXL345 accelerometer mount" (17) |
| — | CW2 has two cable covers (`Cable_Cover`, `Cable_Cover_For_PCB`) and two chain anchors (`Chain_Anchor_3_Hole_V2_Trident`, `_2_Hole_`) in the same place | Plain cover and 3-hole anchor drawn (matches the 3-hole cable bridge of p.139); the others left out |
| Mounting not described in the Trident manual | In the CAD the toolhead sits on the front of the X carriage, on the 2 M3x12 SHCS set 3 mm proud on p.146 | Step text says so and refers to the Stealthburner manual |
| No accelerometer in the Trident manual | ADXL mount on the toolhead | Drawn as part of the toolhead, labelled as CAD content |

## Not drawn

- Everything inside the Stealthburner manual (its own build steps, wiring).
