# Changelog

Changes to the interactive manual at https://iconic-fab.com/voron/trident/r2/. Dates are release dates on iconic-fab.com. Where the drawing differs from the official CAD or manual, the details are in [docs/transcripts/](docs/transcripts/) under "CAD vs manual".

## 2026-11-09

### Added

- **Link to the interactive Stealthburner manual** in the Stealthburner chapter ([`#sb-build`](https://iconic-fab.com/voron/trident/r2/#sb-build) and [`#sb-mount`](https://iconic-fab.com/voron/trident/r2/#sb-mount)): a second tip, after the official manual's link, points to https://iconic-fab.com/voron/stealthburner/r2/, which covers the toolhead step by step with the current Clockwork 2.5 extruder and a hotend picker. The official link stays first. Recorded in [docs/transcripts/08-stealthburner.md](docs/transcripts/08-stealthburner.md) as not from the manual.

### Changed

- **Navigation bar fixed to the bottom of the screen.** Back, Play, Next, Replay, the step counter, the animation slider, the hand tool, Auto, the chapter menu and the step buttons moved out of the text card into their own bar.
  - Back and Next stay in one place on every step, whatever the length of the step's text or the number of steps in the chapter.
  - The chapter's step buttons sit in one row that scrolls sideways; the current step stays in view.
  - The drawing is framed in the space between the toolbar, the card and the bar, so it no longer refits when the card changes height.
  - Phones: the text sheet sits above the bar at a fixed height (long text scrolls inside it), so the drawing does not reframe from step to step. Replay, the step counter and Auto are hidden to make room; "Hide text" still collapses the sheet to one line.
  - The exploded view has no bar; its card and the corner logo are unchanged.

## 2026-11-01

- Source published on GitHub under GPL-3.0, with a contributor guide ([docs/writing-a-chapter.md](docs/writing-a-chapter.md)). The start page links to the repository.

## 2026-10-31: full manual

The whole official manual: 14 chapters and 245 steps, pp. 12–316, from sorting the extrusions to the spool holder, on the 250 mm build.

### Added

- Chapters 3–14 (one module per chapter in `tools/chapters/`), each with a page-by-page transcript of the official manual in `docs/transcripts/`.
- Chapter menu and per-chapter step buttons.
- Finale on the last step: the finished printer turns slowly, with a congratulations banner.
- Opening animation in the exploded view; hand tool (H) to move the drawing; on phones, Rotate and Hand buttons choose what one finger does.
- Auto plays through the build; double-click it for 2× speed.
- An (i) mark beside items the CAD does not have (they are listed but not drawn).
- Clear panels drawn see-through; line drawing with GPU silhouettes.
- Phone layout: the step card is a bottom sheet with Hide / Show text.
- The model loads as a separate file, so the page opens faster.

### Fixed

- About 40 corrections from a step-by-step review against the official manual: parts passing through other parts, screws from the wrong side, the assembly order of the XY joints, bearing stack order, camera views that hid the action, T-nut counts and wiring text. Each is noted in its chapter's transcript.
- Hardware meshes simplified within 0.05 mm of the CAD (an earlier method distorted motors, inserts and grub screws).
- Steps frame the whole model centred; sub-assemblies built on the bench stay off the printer until they are mounted; screws with cube-shaped meshes move along their true axis.

## 2026-10-27: pilot

- First chapters live: Frame, A/B Drive and Idler, on the official CAD, each step linked to its page in the official manual.
- Exploded view, parts panel (find, isolate, recolour), SVG / PNG / PDF export, light and dark mode, deep links per step.
