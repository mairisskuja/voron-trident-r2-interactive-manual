# Controller Preparation, pp. 233–236

Source: `Assembly_Manual_Trident.pdf` (version 2026-06-24). Text verbatim from `pdftotext -layout`.

## p.233 — CONTROLLER PREPARATION
Chapter title page: colour render of a Fysetc Spider board with 8 driver sockets. Not a step.

## p.234 — (jumpers, remove)
Shows: board drawing with numbered callouts 1–5.
Tips:
- CONTROLLER BOARD: The assembly manual will outline the wiring for a Fysetc Spider V2.2 board. You can find additional documentation and alternative configurations on docs.vorondesign.com.
- JUMPERS: Several jumpers need to be configured on the controller board. Begin by removing all the JUMPERS from the controller board (MCU).
Other text: 1) Remove the jumpers in the “driver sockets”. 2) Remove all the jumpers on the “Fan Voltage Selection” 3) Remove the “USB 5V power supply” jumper 4) Remove the “Probe Voltage Selection” jumper. 5) Remove the “LED Voltage Selection” jumper

## p.235 — (jumpers, set)
Shows: board drawing with callouts 1–5.
Tips:
- JUMPERS: Several jumpers need to be set on the MCU. Add the following JUMPERS to the controller board (MCU).
Other text: 1) Set the jumpers in the “driver sockets” as shown to set TMC2209 UART mode. 2) Set the Jumpers for the “Fan Voltage Selection” header so they match your fan's voltage. Shown here are the settings for 24VDC. 3) Ensure the Power Selection header is set to the lower position (DC5V). 4) Set the jumper in “Probe Voltage Selection” header to 24VDC. 5) Set the included wire jumper to the 24VDC position.

## p.236 — STEPPER DRIVERS
Shows: board drawing, callout 1 with a blue band over six driver sockets.

---

## CAD vs manual

- The CAD's board is a dummy outline (Octopus size); the manual wires a Fysetc Spider V2.2. All three steps are informational with focus on `el-ctrl-board`.
- Driver count (6) read from the highlight on p.236; the manual text gives no number.

## Not drawn

- Jumpers, stepper drivers (listed as extras).
