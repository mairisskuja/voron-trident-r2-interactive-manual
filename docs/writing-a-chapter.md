# Writing or fixing a chapter

How the chapters of the VORON Trident R2 interactive manual are written and checked. Paths are relative to the repository root. Set up the build first (see the [README](../README.md#build)).

## What this is

The project is an animated 3D companion to the official VORON Trident assembly manual. Each step of the official manual is shown on the real CAD model: the parts installed in that step fly into place and are labelled. Next to the model, the step text and the manual's tips are shown.

- **Chapters 1–2** (Frame, A/B Drive and Idler, manual pp. 12–47) live in `tools/catalog.cjs` with the shared helpers.
- **Chapters 3–14** are modules in `tools/chapters/`.
- **Not official:** this is an independent community project. It is not affiliated with or endorsed by VORON Design.
- **License:** GPL-3.0, the same as Voron-Trident. Respect the VORON team's work. Follow the official manual closely and never contradict it. Where the CAD differs from the manual, show the CAD and say so in your transcript.

## Read first

1. `evidence.md`: how CAD and manual differences are recorded.
2. `tools/catalog.cjs`: the helpers and the pilot chapters. This is the pattern to follow, so read all of it.
3. `docs/pilot-transcript.md`: how manual pages were transcribed. Read the start and a few pages.
4. The manual is the official [Assembly_Manual_Trident.pdf](https://github.com/VoronDesign/Voron-Trident/blob/7fcb3257a3063225934d9608f82037aa6587d844/Manual/Assembly_Manual_Trident.pdf) (version 2026-06-24, 321 pages); save it as `source/Assembly_Manual_Trident.pdf` (`source/` is not committed).
   - Verbatim text: `pdftotext -f P -l P -layout source/Assembly_Manual_Trident.pdf -`.
   - Page images: `pdftoppm -f P -l P -scale-to 1000 -png source/Assembly_Manual_Trident.pdf build/chNN/pages/p` (NN is the chapter number).
   - Look at the images of every instruction page. The text alone does not say where parts go.
5. The CAD is `build/assembly.json` (43 MB, so query it with node rather than reading it).
   - It is `{protos, instances: [{proto, name, path: [...product tree], matrix, bbox: [[min], [max]]}]}`.
   - It is in mm with Z up. Front is y = 0 and back y = 390; left x = −390, right x = 0. Top frame z ≈ −30, bottom frame z ≈ −510. This is the 250 mm build.
   - Explore the subtrees for your chapter, for example `node -e` with a script that groups `path.slice(0, n)` and counts.

## What a chapter consists of

Keep a fix inside the chapter it belongs to. A change to a shared file (`tools/catalog.cjs` helpers, `tools/build-data.cjs`, `tools/snap.cjs`, `src/*`) affects every chapter: check the whole manual after it.

A chapter has two files:

1. **`tools/chapters/NN-name.cjs`**: `module.exports = ctx => [ ...steps ]`. It adds parts with `ctx.add` / `ctx.each` and returns the chapter's steps in manual order.
2. **`docs/transcripts/NN-name.md`**: a page-by-page transcript in the pilot style:
   - the verbatim tip titles and texts, the hardware callouts, and a short description of each illustration
   - then a **"CAD vs manual"** section listing every place where the CAD differs or settles something the manual leaves open, and what you chose
   - then **"Not drawn"**: items in the manual that are not in the CAD.

### ctx (from tools/catalog.cjs)

| Helper | Meaning |
| --- | --- |
| `pick(re, n)` | Instance indices whose `path.join('/')` matches `re`. Throws unless exactly `n` are found (when `n` is given) |
| `free(re, n)` | Like `pick`, but only instances no earlier part has taken. **Use this for shared pools** (see below) |
| `at(re, [x,y,z])` | The instance of `re` nearest to a point |
| `center(i)`, `inside(c, i, m)`, `volume(i)`, `dist(a, b)` | Geometry on instance bounding boxes |
| `add(id, name, inst, kind, extra)` | Adds one part, which may span several instances. Returns the id. `extra` can hold `{parent, note}` |
| `each(prefix, name, list, kind, extra)` | One part per instance, for hardware. Ids are `prefix-1..n`. `extra` may be a function of the instance |
| `hostOf(i, [[partId, inst], ...])` | The smallest host whose box contains the instance's centre. Use it to set `parent` |
| `part(id)` | The part record. `part(id).inst[0]` is its instance |
| `auto(ids, phase, gap, start)` | Movers along each fastener's own axis. Use for bolts and inserts only |
| `move(ids, [dx,dy,dz], phase, gap, start)` | Movers with a fixed vector in mm, the start offset the part travels from |
| `notes` | `{BLIND, INSERTS, GRUB, ORIENT, UPSIDE, LOCATE, FLUSH}`: reusable tips from the pilot |
| `ext` | The frame extrusion ids: `b-fr b-rr b-rl b-fl c a-bot-f a-bot-l a-bot-r h a-y-l a-y-r a-top-f a-top-r a-top-b a-top-l` |
| `idler`, `drive` | The pilot's sub-assemblies, `idler.A.housing`, `drive.B.upper` and so on |
| `kinds` | Allowed `kind` values. Use only these: `extrusion primary accent motor motion bearing shim bolt washer insert ptfe tool rail leadscrew belt tnut nut chain toolhead bed electronics fan panel misc` |

### Parts

- **Hardware** gets one part per instance (`each`), so each piece can fly along its own axis.
  - Name hardware the way the manual does: "M5x16 BHCS", "M3 heat set insert", "M5 T-nut", "M3 T-nut", "F695 bearing", "M5 shim", "M3 washer".
  - The pilot names drop-in T-nuts "M5 T-nut"; the manual says "M5 T-Nut".
- **Printed parts:**
  - A file name starting with `[a]_` is an accent part: kind `accent`, and the name drops the `[a]_` and `_x2`.
  - Everything else printed is kind `primary`.
  - Name printed parts by the CAD file name, readable. For example, `[a]_z_rail_stop_x2` becomes "Z rail stop".
- **Ids** are short, lowercase and prefixed with your chapter, for example `y-…`, `z-…`, `x-…`. They must be unique across the whole manual.
- **`parent`**: a part that sits in or on another part gets `parent`. Examples: an insert in its printed part, a bolt in what it holds, a T-nut in its extrusion. It travels with its parent and only shows while the parent shows. Parents must be pilot ids (`ext`, `idler`, `drive`) or your own ids. An id from a later chapter can't be a parent, because that part doesn't exist yet when the step plays.
- **CAD variants:** the CAD holds variants the 250 build doesn't use: 300/350 skirts and the parked printed `Tools`. Skip them. Where the manual offers options (endstop types, cable chain brands…), draw what the CAD has and describe the alternatives in a note.
- **Shared pools:**
  - `Frame:1/Frame_Hardware:1/T-Nuts` (33 M5 + 62 M3 T-nuts) and `Frame_Hardware/Screws` serve many chapters, and so may `Gantry_Frame_Hardware`.
  - Take only the instances that sit where your pages install them. Filter by position, for example inside or near the part they hold. Never take "whatever is left".
  - Write the expected counts so conflicts show up.
- **Target:** every CAD instance in your subtrees should end up in a step, except the variants and tools above. List the ones left out, and why, in the chapter transcript.

### Steps

```js
{
  id: 'y-rear-tnuts',            // unique, chapter-prefixed
  section: 'Y Axis',             // the manual's page header, title case: 'Y Axis', 'Rear Brace', 'Z Axis - Rear'
  title: 'T-nuts for the A drive', // short, sentence case
  pages: [51],                   // manual pages this step is based on (required)
  bench: [...],                  // optional: work on these parts alone, off the printer (a sub-assembly)
  shift: {ids, vec},             // optional: move identical sub-assemblies side by side on the bench
  view: {az, el},                // camera: az in degrees around Z (0 = from +x, 90 = from +y/back, -90 = from front), el above horizon (negative = from below)
  focus: [...],                  // optional: frame the camera on these when the step has no movers
  movers: [...auto(...), ...move(...)],
  text: ['Imperative sentences, one action each. Quantities and hardware as in the manual.'],
  notes: [{kind: 'tip'|'warn'|'check', title, text, link?}],
  extras: [{name, qty, kind}]    // items used but not drawn (not in the CAD): tape, zip ties, tools, wires…
}
```

- **Visibility:**
  - A part appears from the step that moves it.
  - In a non-bench step everything installed so far shows.
  - In a bench step only the bench parts, what they carry, and the movers show.
- **Moving a finished sub-assembly onto the printer** (for example the drives onto the frame): a part can be installed by **one** step only, so a later step uses movers marked `again`, as in `move(ids, vec).map(m => ({...m, again: true}))`. Move the roots of the sub-assembly: its children follow through `parent`. For the A drive the roots are `drive.A.upper`, `drive.A.lower` and `drive.A.motor`.
- **Movers:**
  - `phase` orders the motion: phase 0 first, then 1 and so on.
  - `delay` staggers parts within a phase.
  - Vectors are the offset the part starts from, in mm. Use about 30–80 mm for small parts and 100–300 for extrusions.
  - Bolts and inserts use `auto`.
- **Granularity:** about one step per manual instruction page. Merge pages that repeat ("rinse and repeat") when that reads better, but keep `pages` complete. Chapter title pages, trivia pages and "intentionally blank" pages are not steps.
- **Text voice:** VORON's own tone, which is plain, direct and a bit playful in the tips.
  - `text`: short imperative sentences.
  - `notes`: the manual's red-headed tips, nearly verbatim. Title Case → sentence case, as the pilot does. Keep links (`voron.link/...`) when the manual gives them.
  - Never invent facts. A CAD-derived fact goes in your transcript's "CAD vs manual" section.
- **Steps with nothing to draw** (wiring, controller jumpers, mains), where the CAD has no wires:
  - Make an informational step with `movers: []` and `focus` on the components involved.
  - The text says what to do, and the notes carry the manual's safety warnings verbatim. Wiring diagrams stay in the official manual, so say "see manual page N" for them.

## Check your work

```bash
CHAPTERS=NN BUILD_OUT=build/chNN node tools/build-data.cjs        # must finish without errors
BUILD_OUT=build/chNN node tools/snap.cjs "<section>" ...          # or step ids / numbers
```

`snap.cjs` writes `build/chNN/snap/NNN-<id>.png`. Each image shows the start pose on the left and the end pose on the right. Moving parts are blue and focus parts orange.

- Read the snapshots and compare them with the manual page images: the right parts, the right places, a sensible direction of travel, and a camera that shows the action.
- With `CHAPTERS=NN`, only the pilot and your chapter are loaded, so other new chapters' parts are absent. That is expected.
