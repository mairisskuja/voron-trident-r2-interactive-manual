# Voron Trident Assembly Manual: pilot transcript, pp. 7–47

Source: `Assembly_Manual_Trident.pdf` (VoronDesign, GPL-3.0). The text in tips, labels and other quoted fields is verbatim from `pdftotext -layout`. Line wraps are joined, and "ﬂ"/"ﬁ" ligatures are written as "fl"/"fi". Descriptions of the illustrations are my own, based on 110 dpi renders. Where I zoomed in further, the description says so.

Conventions in the manual:
- **Blue pill** = hardware or part label.
- **Light-blue fill** = the parts added in this step.
- **Red heart** = accent-colour part.
- **Small extrusion "thumbnail"** = the sorted extrusion set from p.13, with the extrusions used in this step highlighted in blue.
- **Blue circles** = attention or zoom callouts.

Every page also carries "VORONDESIGN.COM" (top right) and the page number twice (bottom left and right). These are omitted below.

Skipped: **p.11 is blank** ("This page intentionally left blank.").

---

# HARDWARE REFERENCE (pp. 7–10)

## p.7 — HARDWARE REFERENCE
Shows: Eight reference line drawings of single fasteners, each with a red title, a description and a standard number: BHCS, SHCS, FHCS, self-tapping screw, hammerhead nut, heat set insert, post-install T-slot nut and washer. Nothing is assembled on this page.
Hardware labels: none (red titles only).
Tips:
- BUTTON HEAD CAP SCREW (BHCS): Metric fastener with a domed shape head and hex drive. Most commonly found in locations where M5 fasteners are used. — ISO 7380-1
- SOCKET HEAD CAP SCREW (SHCS): Metric fastener with a cylindrical head and hex drive. The most common fastener used on the VORON. — ISO 4762
- FLAT HEAD COUNTERSUNK SCREW (FHCS): Metric fastener with a cone shaped head and a flat top. — ISO 10642
- SELF TAPPING SCREW: Fastener with a pronounced thread profile that is driven directly into plastic.
- HAMMERHEAD NUT: Nut that can be inserted into the slot of an aluminum profile. Once in place, the nut is secured by rotating the screw, which locks it in place within the slot and prevents it from sliding out.
- HEAT SET INSERT: Use a soldering iron to heat the insert and melt it into the plastic as it's pressed in. As the plastic cools, it holds on to the knurls and ridges, giving excellent resistance to both torque and pull-out. Used in both M3 and M5 variants throughout this guide.
- POST INSTALL T-SLOT NUT (T-NUT): Nut that can be inserted into the slot of an aluminium profile. Used in both M3 and M5 variants throughout this guide. Often also called “roll-in t-nut”.
- WASHER: Usually stamped from sheet metal this type of spacer is not as consistent in thickness as the shims are. Only used in M3 size. — DIN 125
Other text: none.

## p.8 — HARDWARE REFERENCE
Shows: Six reference drawings: F695 flanged bearing, shim, GT2 toothed pulley (with a grub screw hole), GT2 idler, thumb nut and set screw.
Hardware labels: none.
Tips:
- F695 BEARING: A ball bearing with a flange used in various gantry locations.
- SHIM: Not to be confused with stamped washers. The 1mm thick version is used in all M5 callout locations. — DIN 988
- PULLEY: GT2 pulley used on the motion system of the VORON.
- IDLER: GT2 idler used in the motion system of the VORON.
- THUMB NUT: Used in the print bed as a spacer. — DIN 466-B
- SET SCREW: Small headless fastener with an internal drive. Used in pulleys and other gears. Also called a grub screw. — ISO 4026
Other text: none.

## p.9 — HARDWARE REFERENCE
Shows: Two tools: a ball-end L hex key and a standard L hex key.
Hardware labels: none.
Tips:
- BALL-END DRIVER: Some parts of this design require the use of a ball-end hex driver for assembly. We recommend you get 2.0 mm, 2.5 mm, and 3.0 mm ones.
- 2.5MM HEX DRIVER: The 2.5mm hex driver will see a lot of use in this build. A quality driver is strongly recommended. Refer to the sourcing guide for suggestions.
- ADDITIONAL TOOLS: We provide additional tool recommendations in our sourcing guide. Visit https://vorondesign.com/sourcing_guide and switch to the “VORON Tools” tab at the bottom of the page.
Other text: none.

## p.10 — HARDWARE REFERENCE
Shows: Four drawings of a blind joint:
1. A BHCS (light blue) about to be screwed into the end bore of an extrusion.
2. The screw head seated in the end of an extrusion, with a light-blue perpendicular extrusion that the head slides into.
3. A long hex key (blue) reaching through the access hole in the side of the extrusion to tighten the screw.
4. A cross-section showing the BHCS head captured in the slot of the perpendicular extrusion and its thread in the end bore.
Hardware labels: none.
Tips:
- BLIND JOINT BASICS: Blind Joints provide a cost effective and rigid assembly method. The head of the BHCS is slid into the channel of another extrusion and securely fastened through a small access hole in the extrusion. If you’ve never assembled one before we recommend you watch the linked guide.
Other text: QR code, https://voron.link/onjwmcd

## p.11 — (blank)
"This page intentionally left blank." Skipped.

---

# FRAME (pp. 12–23)

## p.12 — FRAME
Shows: Chapter title page. A black render of the completed frame cube with these parts:
- the four vertical corner posts;
- the bottom rectangle;
- the top rectangle;
- the two mid-height side (Y) extrusions;
- the rear vertical brace, a single vertical rising from the middle of the bottom-back extrusion.

No labels.
Hardware labels: none. Tips: none. Other text: none.

## p.13 — COMPONENT PREPARATION
Shows: All extrusions standing side by side, sorted by length. Small white dots mark access holes. Left to right:

| Bars | Label | Length | Notes |
|---|---|---|---|
| 4 | B Extrusion | 500mm | Each has 3 access-hole dots (top, middle, bottom) |
| 9 | A Extrusion | 370mm | |
| 1 | C Extrusion | 370mm | Same length as A, with 1 access-hole dot about 1/3 up |
| 1 | H Extrusion | 330mm | |
| 1 | E Extrusion | 330mm - not tapped | |
| 1 | D Extrusion | 240mm | |
| 1 | F Extrusion | 370mm - not tapped | 1 access-hole dot |
| 1 | G Extrusion | 232mm | |

Green "build size dependent" bars run under two groups:
- the 9 A + 1 C (left group);
- E, D, F and G (right group).

B and H are not marked as build-size dependent.
Hardware labels (pills): "B Extrusion 500mm" (×4 bars), "A Extrusion 370mm" (×9), "H Extrusion 330mm" (×1), "E Extrusion 330mm - not tapped" (×1), "F Extrusion 370mm - not tapped" (×1), "G Extrusion 232mm" (×1), "C Extrusion 370mm" (×1), "D Extrusion 240mm" (×1). Bar counts verified at 200 dpi.
Tips:
- SORT EXTRUSIONS: Collect your extrusions and sort them by length. We will highlight the extrusions used in each step and label them as shown on this page.
- BUILD SIZE DEPENDENT: The length of marked extrusions depends on the build size. The size shown is for a 250 size Trident. Add 50/100mm for a 300/350 sized Trident.
Other text: none.

## p.14 — FRAME OVERVIEW
Shows: Two isometric line drawings of the frame with circular letter badges.
- **Left (Outer frame):**
  - B on each of the 4 vertical posts (4 badges);
  - A on 9 horizontals: 4 top rectangle, 2 mid-height side (Y) rails, and 3 of the bottom rectangle (left, right, front);
  - C on the bottom-back extrusion (1 badge).
- **Right (Rear vertical brace):**
  - H on the vertical brace rising from the middle of the bottom-back (C) extrusion;
  - D on a short horizontal stub at the top of H, pointing toward the front.
Hardware labels: badges A×9, B×4, C×1 (left); D×1, H×1 (right).
Tips:
- OUTER FRAME: This view shows the locations of the A, B, and C extrusions that make up the outer frame.
- REAR VERTICAL BRACE: This view shows the locations of the D and H extrusions for the vertical brace.
Other text: none.

## p.15 — FRAME OVERVIEW
Shows:
- **Left:** The bed frame, a T-shape. F is the long bar and G is the shorter bar joined perpendicular to F at its middle.
- **Right:** The X-axis. The E extrusion has a printed X-joint/carriage block (with pulleys and bearings) at each end.
Hardware labels: badges F, G (left); E (right).
Tips:
- BED FRAME: This view shows the F and G extrusions used for the bed frame.
- X-AXIS: This view shows the E extrusion used in the X-axis of the gantry.
Other text: none.

## p.16 — FRAME
Shows: How to prepare three extrusion types with M5x16 BHCS (light blue) threaded into their end bores. Each screw is left protruding, ready to form a blind joint.
- **C Extrusion:** one M5x16 BHCS in each end (2 screws). A blue circle marks the access hole partway along the bar.
- **A Extrusion:** one M5x16 BHCS in one end only (1 screw shown).
- **H Extrusion:** one M5x16 BHCS in one end only (1 screw shown, lower end).

Extrusion thumbnail (bottom right): the A group and C are highlighted. The page does not state how many A's to prepare this way. Later pages (pp.17–21) use all 9 A's as blind-joint members.
Hardware labels: "M5x16 BHCS" (3 pills: 2 on C, 1 on H). The A-extrusion screw has no pill of its own, so 4 screw instances are drawn in total. Part pills: "C Extrusion", "A Extrusion", "H Extrusion".
Tips:
- LOWER BACK EXTRUSION: This extrusion will be used throughout the manual to mark the lower back of the printer.
- PREPARE EXTRUSIONS: The extrusions are going to be used in this section. Prepare them as shown above.
Other text: none.

## p.17 — FRAME
Shows: The first corner, built at the back-left bottom:
- a vertical B Extrusion, light blue (new);
- the C Extrusion, running along the "Back" (label on the extrusion);
- an A Extrusion, the left bottom side, running toward the front.

The C and A screw heads slide into the B's slot (blind joints). Two blue-circle zooms:
- the access hole on the B, near its lower end (with a magnified inset showing the hole);
- the access hole on the C (magnified inset).

Thumbnail highlights 1 B, 1 A and the C.
Hardware labels: "B Extrusion", "C Extrusion", "A Extrusion" (part pills). No screw pills; the screws are the M5x16 BHCS pre-installed on p.16.
Tips:
- BUILD ON A FLAT SURFACE: Build the frame on a glass or granite surface to ensure you can get it as square as possible.
- FIRST BLIND JOINT: This design relies on blind joints to assemble the frame. We outlined the basics of blind joints on page 10. If you’ve never assembled one before we recommend you watch the linked guide.
- MIND ACCESS HOLE POSITION: We do our best to call out things that may bite you later in the assembly process but may skip things that seem obvious to us. If in doubt please refer to the CAD model, it might save you some considerable time down the road.
Other text: "Back" (orientation label on the C). QR code, https://voron.link/onjwmcd

## p.18 — FRAME
Shows:
- **Left:** The corner from p.17 (B, C and A). The H Extrusion (light blue, ×1) stands vertically and attaches to the C (Back) extrusion. Thumbnail highlights H.
  - Dimension callout (orthographic inset): **175** (mm), from the B corner post to the H brace along the C extrusion, for a 250 frame.
- **Right:** The bottom rectangle is closed. Two more A Extrusions (light blue): one along the "Front" and one along the right side. Three more B Extrusions (light blue) stand at the remaining three corners. The H brace is visible at the back. Labels "Back" and "Front". Thumbnail highlights 3 B + 2 A.
Hardware labels: "H Extrusion" (×1), "B Extrusion" (pill on the group of 3 new verticals), "A Extrusion" (pill on the 2 new bottom extrusions).
Tips:
- OTHER FRAME SIZES: The distance is shown for a 250 spec frame. Add 25mm for a 300 or 50 for a 350 sized frame.
Other text: "175" (dimension), "Back", "Front".

## p.19 — FRAME
Shows: An A Extrusion (light blue, ×1) is added as a mid/upper-height side rail. This is the first Y extrusion.
- **Left:** It spans between two vertical B posts. Its M5 BHCS heads are visible at both ends.
- **Right:** A close view of one end joint (screw head highlighted light blue) where the rail meets a vertical post. A short vertical piece sits directly under the rail end; this appears to be the spacer referred to on p.20.

Thumbnail highlights 1 A.
Hardware labels: "A Extrusion" (×1).
Tips:
- SNUG, NOT TIGHT: Don't fully tighten these screws yet — alignment happens in a later step, and you'll need some play to adjust.
Other text: none.

## p.20 — FRAME
Shows:
- **Left (small):** The frame with the first Y rail (on the left side) installed. A light-blue vertical bar stands on the bottom frame near the front-right corner; this is the spacer, moved to the other side.
- **Right:** The second A Extrusion (light blue, ×1) is installed as the right-side Y rail at the same height. Labels "Back" and "Front".

Thumbnail highlights 1 A.
Hardware labels: "A Extrusion" (×1).
Tips:
- RINSE AND REPEAT: Remove the spacer and repeat the steps for the other Y extrusion.
Other text: "Back", "Front".
Unclear: The "spacer" here is not named or dimensioned. Its proportions suggest an extrusion stood on end (possibly a spare extrusion), not the printed 110mm tools from p.22.

## p.21 — FRAME
Shows:
- **Left:** The top rectangle of 4 A Extrusions (all light blue, ×4) is lowered onto the tops of the four B posts. Labels "Back" and "Front".
- **Right:** The finished cube with label "Top" on the top-back edge. Visible: the H brace at the back, both Y rails, and the bottom rectangle.

Thumbnail highlights 4 A.
Hardware labels: "A Extrusion" (one pill for the 4 extrusions).
Tips: none.
Other text: "Top", "Back", "Front".

## p.22 — FRAME
Shows: An isometric view of the full frame. Two printed spacer tools (light blue, ×2) are clipped vertically between the top-side A extrusion and the Y rail on the left side, one near the front and one near the back. They set the Y rail's position below the top frame.
Hardware labels: none.
Tips:
- FINDING THE RIGHT POSITION: Use the two printed 110mm spacer tools to set the Y gantry extrusions parallel and at the correct height. Make sure they sit at a 90° angle and are free of any rotation or twist, with their outside faces flush. Repeat for both sides.
Other text: none.

## p.23 — FRAME
Shows: Two orthographic views with 90° angle markers at every corner.
- **Left:** A view labelled "Top" at the top edge, probably a side view. It has a vertical dimension of **330** between the bottom extrusion and the Y rail, and 90° markers at 4 corners.
- **Right:** A square view, probably from the top, with 90° markers at 4 corners.

Hardware labels: none.
Tips:
- CHECK FOR SQUARENESS: Verify the angle of all corners and the overall squareness by measuring the diagonals. Refer to the second half of the linked video for additional information.
Other text: "Top", "330", "90°" ×8. QR code, https://voron.link/kdtpzam

## Frame summary: extrusion letters, lengths and join order (250 build size)

| Letter | Length (250) | Qty | Notes | Used in Frame chapter? |
|---|---|---|---|---|
| A | 370mm | 9 | build-size dependent (+50/+100) | yes: 3 bottom (L, front, R), 2 Y rails, 4 top |
| B | 500mm | 4 | vertical posts, 3 access holes each | yes |
| C | 370mm | 1 | lower back; build-size dependent; 1 access hole | yes |
| D | 240mm | 1 | rear brace top stub; build-size dependent | **no** (shown only in overview p.14) |
| E | 330mm, not tapped | 1 | X-axis; build-size dependent | no (p.15 overview) |
| F | 370mm, not tapped | 1 | bed frame; build-size dependent; 1 access hole | no (p.15 overview) |
| G | 232mm | 1 | bed frame; build-size dependent | no (p.15 overview) |
| H | 330mm | 1 | rear vertical brace | yes |

Join order:
1. **p.16 Prepare:** M5x16 BHCS in both ends of C (2). One M5x16 BHCS in one end of the A extrusions (one shown) and in one end of H (1).
2. **p.17:** B (back-left post) + C (back) + A (left bottom). These are the first blind joints. Mind the access-hole positions.
3. **p.18:** H attached vertically to C at 175mm from the post (250; +25 for 300, +50 for 350). Then A front-bottom + A right-bottom + 3 more B posts, completing the bottom rectangle and 4 posts.
4. **p.19:** A as the first Y rail (left side), supported by a spacer. Snug, not tight.
5. **p.20:** Remove the spacer, then add A as the second Y rail (right side).
6. **p.21:** 4 × A as the top rectangle.
7. **p.22:** Set both Y rails with 2 printed 110mm spacer tools per side.
8. **p.23:** Check squareness: 90° corners, diagonals, 330 dimension.

No further screws are called out in pp.17–23 beyond the p.16 preparation. The total number of M5x16 BHCS in the frame is never stated.

---

# A/B DRIVE AND IDLER (pp. 24–47)

## p.24 — A/B DRIVE AND IDLER
Shows: Chapter title page. Colour render (black parts, red accents) of the four sub-assemblies:
- two idlers (front, with a red accent face cover);
- two drives (motor mounts with NEMA17 motors and red accent top plates).

No labels.
Hardware labels: none. Tips: none. Other text: none.

## p.25 — OVERVIEW
Shows:
- **Left:** An isometric view of the frame with the drives at the back top corners and the idlers on the front posts. The lower-back C extrusion is highlighted light blue. Labels "Top", "Back", "Front".
- **Right:** A top view (Back at the top, Front at the bottom). Black labels place the four sub-assemblies:
  - **B Drive** = back-left;
  - **A Drive** = back-right;
  - **B Idler** = front-left;
  - **A Idler** = front-right.
Hardware labels (black pills): "B Drive", "A Drive", "B Idler", "A Idler".
Tips:
- WHY IS THIS HERE?: As you likely skipped over the advice to flip through the entire manual, we added graphics like these to assist you with the orientation of the part before you actually put them on the printer.
- OVERVIEW: Individual chapters start with an overview of the components that will be built/added to the printer in the chapter.
Other text: "Top", "Back", "Front".

## p.26 — COMPONENT PREPARATION
Shows: M3 heat set inserts (light blue) being installed into the front idler printed parts. Both parts carry the red accent heart.
- **Left part** (flat plate with a step; probably the front idler face cover, compare p.30): 2 × M3 inserts.
- **Middle and right** ("Same part, two views"; looks like an idler carriage half, compare p.27/28): 2 inserts in the front face (middle view) and 1 insert in the back (right view), so 3 per part.

This is to be done for both the A and B idlers ("Twice the fun").
Hardware labels: "M3 Heat Set Insert" (1 pill; 5 insert instances drawn: 2 + 2 + 1). Doing it for both idlers makes 10.
Tips:
- TWICE THE FUN: The next steps need to be done for both the identical B and A front idlers parts.
- SAME PART, TWO VIEWS: Two heat set inserts in the front, one in the back.
- HEAT SET INSERTS: This design relies heavily on heat set inserts. Make sure you have the proper inserts (check the hardware reference for a close up picture and the BOM for dimensions). If you’ve never worked with heat set inserts before we recommend you watch the linked guide.
- ACCENT PART?: Look for VORON heart next to the part. It indicates that this is an accent part.
Other text: QR code, https://voron.link/m5ybt4d
Unclear: The page does not name the parts. The identification of the left part as the face cover and the middle/right part as the carriage half is inferred from later pages.

## p.27 — IDLER CARRIAGES
Shows:
- **Left (exploded):** A bearing stack goes into the idler carriage half (accent part). Top to bottom:
  1. M5x16 BHCS
  2. M5 Shim
  3. F695 Bearing
  4. F695 Bearing
  5. M5 Shim
- **Right:** The stack seated in the carriage half (light blue).
Hardware labels (each with 1 arrow): "M5x16 BHCS" ×1, "M5 Shim" ×2 (2 pills), "F695 Bearing" ×2 (2 pills). Per idler: 1 BHCS, 2 shims, 2 F695.
Tips:
- PIN IT INSTEAD!: A 5x18mm pin can be used instead of the M5x16 BHCS.
Other text: pdftotext also returns an "A Extrusion" string on this page that is not visible in the render. It is probably a hidden or off-page leftover label; ignore it.

## p.28 — IDLER CARRIAGES
Shows: The second carriage half (light blue, mirror half) closes over the bearing stack. Two M3x25 SHCS (light blue) go through the first half into the second half's inserts. Right: the closed carriage, with the heart (accent).
Hardware labels: "M3x25 SHCS" (1 pill; 2 screws drawn).
Tips: none. Other text: none.

## p.29 — FRONT IDLERS
Shows:
- **Left:** The assembled carriage (from p.28) slides into the front idler body (light blue, new; not an accent part).
- **Right:** Two M3x40 SHCS (light blue) are inserted from one side. Two PTFE tube pieces (light blue) are inserted from the other side, forming the guide rods/sleeves the carriage rides on.
Hardware labels: "M3x40 SHCS" (1 pill; 2 screws drawn), "PTFE Tube" (1 pill; 2 tubes drawn).
Tips:
- PTFE TUBE: Use PTFE tube with an outer diameter of 4mm and an inner diameter of 3mm. Cut it to a length of 35mm using the cutting tool.
Other text: none.
Unclear: The exact relationship between the screws and the tubes (whether the screws pass through the tubes) is not explicit. The drawing suggests the two M3x40 run through the body as guides, with the PTFE pieces as sleeves.

## p.30 — FRONT IDLERS
Shows:
- **Left:** The front face cover (light blue, accent part from p.26) is placed on the idler. Two M3x40 SHCS (light blue) are shown running through the body into the cover.
- **Right:** One M3x16 SHCS with an M3 Washer is inserted into the centre hole of the cover. This is the belt-tension screw into the carriage.
Hardware labels: "M3x40 SHCS" (1 pill; 2 drawn), "M3 Washer" (×1), "M3x16 SHCS" (×1).
Tips:
- DON’T FORGET TO WASH(ER): The washer prevents the screw head from deforming the plastic under tension.
Other text: none.
Unclear: The page does not say whether these 2 M3x40 are the same screws as on p.29 or 2 additional ones. The geometry suggests the same screws, now also retaining the cover, but this needs confirming against the BOM/CAD.

## p.31 — A IDLER
Shows: An A idler variant. One M3x8 SHCS (light blue) is screwed into the lower front of the body, near the bottom edge on the right of the front face. This is the rail stop screw. Right: the result.
Hardware labels: "M3x8 SHCS" (×1).
Tips:
- ATTENTION TO DETAIL: The rail stop screw is in different locations for the B and A idlers.
Other text: none.

## p.32 — B IDLER
Shows: A B idler, viewed from the cover/carriage side. One M3x8 SHCS (light blue) is screwed into the side of the body at mid/lower height on the right-hand side. This is a different location from the A idler. Right: the result.
Hardware labels: "M3x8 SHCS" (×1).
Tips:
- ATTENTION TO DETAIL: The rail stop screw is in different locations for the B and A idlers.
Other text: none.

## p.33 — FRONT IDLERS
Shows: Check page with two finished idlers (A on the left, B on the right). Blue circles mark:
- the A rail-stop screw (lower front);
- the B rail-stop screw (side);
- the bearing stack visible through the carriage window on B.
Hardware labels: none.
Tips:
- CHECK YOUR WORK: Compare your assembled parts to the graphics shown here. Pay attention to the features highlighted by the circles, and verify that the carrier moves freely without binding.
Other text: none.

## p.34 — A DRIVE - COMPONENT PREPARATION
Shows:
- **Left:** The A drive upper plate (large plate with a motor bore and square pockets). 2 × M3 heat set inserts (light blue) go into two small holes near the motor bore.
- **Right:** The A drive lower half (motor-side frame piece). 1 × M3x8 SHCS (light blue) goes vertically into a boss near the motor bore. This is the locating screw.
Hardware labels: "M3 Heat Set Insert" (1 pill; 2 drawn), "M3x8 SHCS" (×1).
Tips:
- LOCATING SCREW: This screw is used to align the upper and lower half of the motor mounts.
Other text: none.

## p.35 — A DRIVE - COMPONENT PREPARATION
Shows:
- **Left:** The other A drive plate, the opposite half/face of the motor mount. 2 × M5 heat set inserts (light blue) go into the two bores flanking the motor opening, where the bearing-stack shafts sit.
- **Right:** The other half, viewed from another angle. 1 × M3x8 SHCS (light blue) goes into a boss on the right side. This is a second locating screw at a different position from p.34.
Hardware labels: "M5 Heat Set Insert" (1 pill; 2 drawn), "M3x8 SHCS" (×1).
Tips:
- LOCATING SCREW: This screw is used to align the upper and lower half of the motor mounts.
- FLUSH MATTERS: Each M5 heat set insert must end up exactly flush with the surface and square to it. Even a slight tilt will misalign the bearing stacks.
Other text: none.
Unclear: The page does not say which half (upper or lower) receives the M5 inserts versus the M3 inserts. pp.34 and 35 each show a different printed plate plus one M3x8. Total per A drive: 2 M3 inserts, 2 M5 inserts, 2 M3x8 SHCS.

## p.36 — A DRIVE
Shows: The A drive plate. 2 × M5x30 BHCS (light blue) are inserted downward through the two bearing-shaft holes, either side of the motor bore. The drawing shows the head side up.
Hardware labels: "M5x30 BHCS" (1 pill; 2 drawn).
Tips: none. Other text: none.

## p.37 — A DRIVE
Shows: The drive is assembled upside down.
- **Left:** Two bearing stacks (light blue) are built onto the lower half, one at each bearing position. Zoomed at 250 dpi, each stack reads top to bottom as:
  1. M5 Shim
  2. F695 (flange up)
  3. F695
  4. thin shim(s) in the middle
  5. F695
  6. F695
  7. M5 Shim
  The middle spacer looks like one or two stacked shims, so it is unclear.
- **Top right:** The other half (light blue, with its 2 inserts visible) is lowered onto the stacks.
- **Bottom right inset:** An M5x30 BHCS (light blue) drawn in two positions, showing it being driven down through the half and into the bearing stack.
Hardware labels: "M5 Shim" (1 pill, many instances), "F695 Bearing" (1 pill, many instances). Count as drawn: about 4 × F695 and 3–4 × M5 shim per stack, 2 stacks per drive.
Tips:
- UPSIDE DOWN ASSEMBLY: For ease of assembly we recommend to assemble the A and B drives upside down.
Other text: none.
Unclear: The exact bearing and shim count per stack should be confirmed against the BOM/CAD, because the rendering is ambiguous for the middle spacer.

## p.38 — A DRIVE
Shows:
- **Top left:** A GT2 20 Tooth Pulley on the NEMA 17 Stepper shaft. 2 grub screws (light blue) go into the pulley hub.
- **Bottom left:** An orthographic side view with dimension **17.5** (mm). This is the pulley position above the motor face: in this view the hub is down toward the motor and the teeth are up.
- **Bottom middle:** The printed alignment tool, marked "A" (light blue), clamped against the pulley and motor to set the height.
Hardware labels: "GT2 20 Tooth Pulley" (×1), "NEMA 17 Stepper" (×1). The grub screws have no pill (2 drawn).
Tips:
- GRUB SCREW - aka the root of all issues: Insert both grub screws and apply threadlocker to each one. Use a high-quality hex driver to prevent stripping the hex profile — ball-end drivers are not recommended. Loose grub screws account for the majority of issues users report. Save yourself hours of troubleshooting by applying threadlocker to every grub screw during the build. Check the product's application notes for instructions, and keep it away from printed parts.
- LOCK IT DOWN: For proper alignment, use an M3×30 SHCS to attach the alignment tool to the stepper motor as shown.
Other text: "17.5" (dimension), "A" (embossed on tool). QR code, https://voron.link/fx10m8e

## p.39 — A DRIVE
Shows:
- **Left:** The motor with pulley (light blue) is offered up to the underside of the assembled A drive. A blue circle marks the motor's cable connector exit.
- **Right:** 4 × M3x30 SHCS (light blue) go down through the drive into the motor's mounting holes.
Hardware labels: "M3x30 SHCS" (1 pill; 4 drawn).
Tips:
- MOTOR ORIENTATION: Pay attention to the orientation of the cable exit. Once assembled, the motor wires point away from each other, toward the outside of the printer.
Other text: none.

## p.40 — A DRIVE
Shows: Check page. A side orthographic view of the finished A drive. A blue circle around the pulley shows its teeth level with the bearing stack beside it.
Hardware labels: none.
Tips:
- CHECK YOUR WORK: Compare your assembled part to the graphic shown here. Pay attention to the pulley orientation and its alignment with the bearing stacks.
Other text: none.

## p.41 — B DRIVE - COMPONENT PREPARATION
Shows:
- **Left:** The B drive plate (mirror of A). 2 × M3 heat set inserts (light blue).
- **Right:** The B drive other half. 1 × M3x8 SHCS (light blue) locating screw on the right-side boss.
Hardware labels: "M3 Heat Set Insert" (1 pill; 2 drawn), "M3x8 SHCS" (×1).
Tips:
- LOCATING SCREW: This screw is used to align the upper and lower half of the motor mounts.
Other text: none.

## p.42 — B DRIVE - COMPONENT PREPARATION
Shows:
- **Left:** The B drive plate. 2 × M5 heat set inserts (light blue) in the bearing-shaft bores.
- **Right:** The other half. 1 × M3x8 SHCS (light blue) locating screw on the left boss.
Hardware labels: "M5 Heat Set Insert" (1 pill; 2 drawn), "M3x8 SHCS" (×1).
Tips:
- LOCATING SCREWS: This screw is used to align the upper and lower half of the motor mounts. (The title is plural here; the A drive version on p.34/35 is singular.)
- FLUSH MATTERS: Each M5 heat set insert must end up exactly flush with the surface and square to it. Even a slight tilt will misalign the bearing stacks.
Other text: none.

## p.43 — B DRIVE
Shows: The B drive plate. 2 × M5x30 BHCS (light blue) go through the two bearing-shaft holes (mirror positions of A).
Hardware labels: "M5x30 BHCS" (1 pill; 2 drawn).
Tips: none. Other text: none.

## p.44 — B DRIVE
Shows: Upside-down assembly, the same as p.37 but mirrored.
- **Left:** 2 bearing stacks (light blue) on the lower half. At 300 dpi each reads: shim, F695, F695, middle shim(s), F695, F695, shim.
- **Top right:** The other half (light blue) is lowered on.
- **Bottom right inset:** 2 × M5x30 BHCS (light blue) through the assembly.
Hardware labels: "F695 Bearing" (1 pill), "M5 Shim" (1 pill). Many instances, as on p.37.
Tips:
- UPSIDE DOWN ASSEMBLY: For ease of assembly we recommend to assemble the A and B drives upside down.
Other text: none.

## p.45 — B DRIVE
Shows:
- **Top left:** A GT2 20 Tooth Pulley on the NEMA 17 Stepper with 2 grub screws (light blue). The pulley appears flipped compared with A: the hub is on top and the teeth are toward the motor.
- **Bottom left:** The alignment tool, marked "B" (light blue), on the pulley/motor.
- **Bottom middle:** An orthographic view with dimension **7.5** (mm). This differs from the A drive's 17.5.
Hardware labels: "GT2 20 Tooth Pulley" (×1), "NEMA 17 Stepper" (×1).
Tips:
- GRUB SCREW - aka the root of all issues: (identical to p.38) Insert both grub screws and apply threadlocker to each one. Use a high-quality hex driver to prevent stripping the hex profile — ball-end drivers are not recommended. Loose grub screws account for the majority of issues users report. Save yourself hours of troubleshooting by applying threadlocker to every grub screw during the build. Check the product's application notes for instructions, and keep it away from printed parts.
- LOCK IT DOWN: For proper alignment, use an M3×30 SHCS to attach the alignment tool to the stepper motor as shown.
Other text: "7.5" (dimension), "B" (on tool). QR code, https://voron.link/fx10m8e

## p.46 — B DRIVE
Shows:
- **Left:** The motor with pulley (light blue) is offered up under the B drive. A blue circle marks the connector exit, which is on the opposite side from A.
- **Right:** 4 × M3x30 SHCS (light blue) down into the motor.
Hardware labels: "M3x30 SHCS" (1 pill; 4 drawn).
Tips:
- MOTOR ORIENTATION: Pay attention to the orientation of the cable exit. Once assembled, the motor wires point away from each other, toward the outside of the printer.
Other text: none.

## p.47 — B DRIVE
Shows: Check page. A side orthographic view of the B drive with a blue circle on the pulley, which is level with the bearing stacks (mirror of p.40).
Hardware labels: none.
Tips:
- CHECK YOUR WORK: Compare your assembled part to the graphic shown here. Pay attention to the pulley orientation and its alignment with the bearing stacks.
Other text: none.

---

# Step candidates

Reference/overview pages (7–10, 12–15, 24–25) are not steps. They are better used as chapter intros, glossary entries or tooltips:
- **p.10 Blind joint basics:** reuse as a tooltip on frame steps.
- **p.13 Extrusion table:** use as the chapter-start parts list.
- **p.25 A/B placement map:** use as the chapter intro.

Quantities are as drawn. "×2 (A+B)" means repeat for both idlers or drives.

### Frame
1. **Prepare extrusions**
   - Pages: 16 (with the 13 table)
   - Parts: C, A, H extrusions
   - Hardware: M5x16 BHCS (2 in C, 1 in each A, 1 in H)
   - Tips: LOWER BACK EXTRUSION; PREPARE EXTRUSIONS; BUILD SIZE DEPENDENT (from p.13)
2. **First corner: B + C + A blind joints**
   - Pages: 17
   - Parts: B ×1, C ×1, A ×1
   - Hardware: uses the pre-installed BHCS
   - Tips: BUILD ON A FLAT SURFACE; FIRST BLIND JOINT (+ QR onjwmcd); MIND ACCESS HOLE POSITION
3. **Rear brace H**
   - Pages: 18 (left)
   - Parts: H ×1, at 175mm from the post
   - Hardware: pre-installed BHCS
   - Tips: OTHER FRAME SIZES
4. **Close the bottom rectangle and add the posts**
   - Pages: 18 (right)
   - Parts: A ×2 (front, right), B ×3
   - Tips: none
5. **First Y rail**
   - Pages: 19
   - Parts: A ×1 (plus a temporary spacer)
   - Tips: SNUG, NOT TIGHT
6. **Second Y rail**
   - Pages: 20
   - Parts: A ×1
   - Tips: RINSE AND REPEAT
7. **Top frame**
   - Pages: 21
   - Parts: A ×4
8. **Set the Y rail height**
   - Pages: 22, with p.23 as the check note
   - Parts: 2 printed 110mm spacer tools, used on each side
   - Tips: FINDING THE RIGHT POSITION
   - Check: CHECK FOR SQUARENESS (330 dimension, diagonals, QR kdtpzam)

### Front idlers
9. **Idler heat set inserts**
   - Pages: 26
   - Parts: face cover (accent), carriage half (accent)
   - Hardware: M3 heat set insert ×5 per idler, ×2 (A+B)
   - Tips: TWICE THE FUN; SAME PART, TWO VIEWS; HEAT SET INSERTS (+ QR m5ybt4d); ACCENT PART?
10. **Idler bearing stack**
    - Pages: 27
    - Parts: carriage half
    - Hardware: M5x16 BHCS ×1, M5 shim ×2, F695 ×2, per idler, ×2
    - Tips: PIN IT INSTEAD!
11. **Close the carriage**
    - Pages: 28
    - Parts: second carriage half
    - Hardware: M3x25 SHCS ×2 per idler, ×2
12. **Carriage into the idler body**
    - Pages: 29
    - Parts: front idler body
    - Hardware: M3x40 SHCS ×2, PTFE tube 4/3mm × 35mm ×2, per idler, ×2
    - Tips: PTFE TUBE
13. **Face cover and tension screw**
    - Pages: 30
    - Parts: face cover (accent)
    - Hardware: M3x16 SHCS ×1 + M3 washer ×1 (the M3x40 ×2 shown again; confirm whether these are extra)
    - Tips: DON'T FORGET TO WASH(ER)
14. **A idler rail stop**
    - Pages: 31
    - Hardware: M3x8 SHCS ×1
    - Tips: ATTENTION TO DETAIL
15. **B idler rail stop**
    - Pages: 32, with p.33 as the check note
    - Hardware: M3x8 SHCS ×1
    - Tips: ATTENTION TO DETAIL
    - Check: CHECK YOUR WORK (carrier moves freely)

### A drive
16. **Drive inserts and locating screws**
    - Pages: 34–35
    - Parts: both A drive halves
    - Hardware: M3 insert ×2, M5 insert ×2, M3x8 SHCS ×2
    - Tips: LOCATING SCREW; FLUSH MATTERS
17. **Bearing shafts**
    - Pages: 36
    - Hardware: M5x30 BHCS ×2
18. **Bearing stacks and close the drive**
    - Pages: 37
    - Hardware: F695 and M5 shims ×2 stacks (about 4 F695 + 3–4 shims each; confirm)
    - Tips: UPSIDE DOWN ASSEMBLY
19. **Pulley on the motor**
    - Pages: 38
    - Parts: NEMA 17 stepper, GT2 20T pulley, alignment tool "A"
    - Hardware: grub screws ×2, M3x30 SHCS ×1 (for the tool)
    - Note: the pulley is set at 17.5
    - Tips: GRUB SCREW; LOCK IT DOWN (+ QR fx10m8e)
20. **Mount the motor**
    - Pages: 39, with p.40 as the check note
    - Hardware: M3x30 SHCS ×4
    - Tips: MOTOR ORIENTATION
    - Check: CHECK YOUR WORK (pulley aligned with the bearing stacks)

### B drive (mirror of A)
21. **Drive inserts and locating screws**
    - Pages: 41–42
    - Hardware: M3 insert ×2, M5 insert ×2, M3x8 SHCS ×2
    - Tips: LOCATING SCREW(S); FLUSH MATTERS
22. **Bearing shafts**
    - Pages: 43
    - Hardware: M5x30 BHCS ×2
23. **Bearing stacks and close the drive**
    - Pages: 44
    - Hardware: F695 / M5 shim stacks ×2
    - Tips: UPSIDE DOWN ASSEMBLY
24. **Pulley on the motor**
    - Pages: 45
    - Parts: NEMA 17, GT2 20T pulley (flipped compared with A), alignment tool "B"
    - Hardware: grub screws ×2, M3x30 SHCS ×1 (for the tool)
    - Note: the pulley is set at 7.5
    - Tips: GRUB SCREW; LOCK IT DOWN
25. **Mount the motor**
    - Pages: 46, with p.47 as the check note
    - Hardware: M3x30 SHCS ×4
    - Tips: MOTOR ORIENTATION (wires point outward, opposite to A)
    - Check: CHECK YOUR WORK

Optional merges if fewer steps are wanted:
- steps 3+4;
- steps 5+6;
- steps 14+15 as a single "rail stop screw (A vs B)" step with a variant toggle;
- steps 16+17 and 21+22.

# Open questions to verify against the CAD/BOM
1. **p.16:** How many A extrusions get a BHCS, and in which end(s)? The page shows one A with one screw and does not give a count.
2. **pp.19–20:** What exactly is the temporary "spacer" under the first Y rail?
3. **p.30:** Are the M3x40 SHCS the same screws as on p.29, or 2 more per idler?
4. **pp.37/44:** What is the exact F695 / M5 shim count and order per drive bearing stack? The middle spacer is ambiguous.
5. **pp.34–35 / 41–42:** Which printed half (upper or lower) receives the M3 inserts, and which receives the M5 inserts? The parts are not named on the pages.
6. **p.38 vs p.45:** The pulley dimensions differ (A = 17.5, B = 7.5) and the pulley appears flipped. This matches the drawings but is worth confirming, because it is critical for the interactive steps.
7. **Part names:** The printed parts are never named with filenames in these pages. Names such as "front idler body", "carriage half" and "face cover" are descriptive and should be mapped to the STL names.

# CAD vs manual (review of 2026-10-31)
- **pp.37/44, bearing stacks (answers question 4):** the CAD has 8 pieces per stack: M5 shim, two F695, two M5 shims, two F695, M5 shim. The step text follows the CAD.
- **p.27, front idler axle:** in the CAD one idler's M5x16 axle points head down; the page draws it head up. The drawing shows the CAD.
- **pp.39/46, motor screws:** the four M3x30 SHCS are carried by the upper drive half, so they come in from above as on the page and travel with the drive when it is mounted.
