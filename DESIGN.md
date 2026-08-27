# Household Coordination App — Paper Notebook Design System

> **Document Version**: 2.0.0  
> **Status**: Approved Design Specification  
> **Design Philosophy**: Tactile Domestic Stationery & Living Paper Notebook  
> **Target Platform**: Responsive Web & PWA (Desktop, Tablet, Mobile)  

---

## 1. Executive Design Vision & Visual Thesis

### 1.1 The Physical Notebook Metaphor
Modern digital task managers and household coordination software suffer from a common affliction: **sterile corporate SaaS aesthetic fatigue**. Standard flat interfaces—filled with rounded generic cards, neutral gray borders, and cold synthetic gradients—feel like Jira for the home. Roommates and families do not want to manage their living spaces with an enterprise productivity tool; domestic life is tactile, personal, collaborative, and grounded in shared physical reality.

The **Paper Notebook Design System** transforms the Household Coordination App into a warm, inviting, living kitchen-table binder. The entire user interface is conceptualized as an authentic physical spiral-bound notebook or ring binder resting on a domestic desk surface.

```
+-------------------------------------------------------------------------------+
|  DESK SURFACE (Wood Grain / Warm Slate / Natural Linen)                       |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | [===] SPIRAL / RIVET BINDING SPINE                                      |  |
|  |                                                [Appliances] [Chores] [P]|  |
|  |  +-------------------------------------------------------------------+  |  |
|  |  | |                                                         |       |  |  |
|  |  | |  ROOMMATE LOGBOOK                            AUG 2026   |       |  |  |
|  |  | |---------------------------------------------------------| [TAB] |  |  |
|  |  | |                                                         |       |  |  |
|  |  | |  APPLIANCE DASHBOARD                                    | [TAB] |  |  |
|  |  | |                                                         |       |  |  |
|  |  | |  +--------------------+      +--------------------+     | [TAB] |  |  |
|  |  | |  | DISHWASHER         |      | WASHING MACHINE    |     |       |  |  |
|  |  | |  | [ STAMP: CLEAN ]   |      | [ STAMP: RUNNING ] |     |       |  |  |
|  |  | |  | Tap to empty...    |      | Finishes in 32m    |     |       |  |  |
|  |  | |  +--------------------+      +--------------------+     |       |  |  |
|  |  | |                                                         |       |  |  |
|  |  | |  ====================================================== |       |  |  |
|  |  | |  Ruled Blue Margin Line & Warm Cream Heavyweight Paper  |       |  |  |
|  |  +-------------------------------------------------------------------+  |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### 1.2 Materiality, Paper Textures & Physics
The interface treats every visual element as a tangible piece of domestic stationery:
- **Heavyweight Paper Pages**: Unbleached, warm-cream fibrous stock with subtle tactile tooth and organic noise rather than sterile stark white.
- **Ruled Paper & Margin Rules**: Faint blue horizontal guide rules aligned with an exact baseline grid, complemented by classic vertical red left-margin lines.
- **Stationery Index Dividers**: Die-cut tab dividers protruding from page edges with manila or pastel cardstock colors, creating an intuitive multi-section binder.
- **Fasteners & Adhesives**: Translucent matte washi tape strips holding memo notes, brass binder rings/rivets along the spine, and metallic paperclips binding dialog slips.
- **Inks, Pencils & Stamps**:
  - **Ballpoint/Fountain Navy Ink**: Crisp, dark navy for primary headings, written records, and deliberate actions.
  - **Graphite Pencil**: Soft, slightly grainy slate for secondary metadata, timestamps, and transient notes.
  - **Distressed Rubber Stamps**: Inked rubber stamp impressions with weathered bleed textures, angled rotational skews ($\pm 1.5^{\circ}$ to $\pm 4^{\circ}$), and authentic stamped borders for state indicators (`CLEAN`, `DIRTY`, `RUNNING`, `EMPTYING`).
  - **Highlighter Overlays**: Semi-transparent, multiply-blended pastel highlighter strokes accentuating active statuses or current member assignments.

### 1.3 Lighting, Elevation & Natural Imperfection
Depth is achieved through **soft directional ambient lighting** (simulating an overhead desk lamp positioned at top-left) rather than generic computer drop-shadows:
- **Page Lift**: Subtle ambient occlusion beneath page corners and lifted card edges.
- **Paper Stack Layering**: Multiple stacked sheet borders creating physical sheet depth along the right and bottom edges.
- **Natural Organic Imperfection**: Elements feature slight rotational variations ($\pm 0.4^{\circ}$ to $\pm 1.8^{\circ}$) to eliminate uncanny computational symmetry.

---

## 2. Color Palette & Surface Semantics

The color palette is derived directly from physical artist and stationery materials, organized into clear functional roles.

```
+-------------------------------------------------------------------------------+
|                             STATIONERY PALETTE                                |
|                                                                               |
|   Cream Page       Manila Card      Navy Pen Ink     Graphite Pencil  Margin  |
|   [ #FAF6EE ]      [ #FEF7E0 ]      [ #1E293B ]        [ #475569 ]    [#EF4444|
|                                                                               |
|   STAMP INKS:                                                                 |
|   [ Clean Green ]  [ Dirty Red ]    [ Running Blue ]   [ Empty Amber ]        |
|   [ #15803D ]      [ #B91C1C ]      [ #1D4ED8 ]        [ #B45309 ]            |
|                                                                               |
|   HIGHLIGHTERS (multiply blend):                                              |
|   [ #FEF08A (Y) ]  [ #BBF7D0 (G) ]  [ #FECDD3 (P) ]    [ #BAE6FD (B) ]        |
+-------------------------------------------------------------------------------+
```

### 2.1 Daytime Paper Palette (Light Mode)

| Role | Color Value | Physical Metaphor & Visual Function |
| :--- | :--- | :--- |
| **Base Page Surface** | `#FAF6EE` | Base warm cream sketchbook paper framing the workspace. |
| **Active Sheet** | `#FCFBF7` | Crisp heavyweight bond paper representing the active working sheet. |
| **Index Cardstock** | `#FFFDF9` | Dense cardstock surface for appliance and chore units. |
| **Manila Folder** | `#FEF7E0` | Manila cardstock used for divider tabs and proposed swap slips. |
| **Post-It Memo** | `#FEF9C3` | Canary yellow sticky note paper for up-for-grabs tasks. |
| **Desk Mat Backdrop** | `#EAE4D5` | Warm linen / bleached oak desk framing the notebook. |
| **Navy Ink (Primary)** | `#1E293B` | Dark blue ballpoint ink for primary headings and major actions. |
| **Graphite Pencil** | `#475569` | 2B pencil lead for secondary text, borders, and functional icons. |
| **Muted Lead** | `#94A3B8` | Light pencil guidelines, inactive states, and timestamps. |
| **Notebook Rule Line** | `rgba(148, 163, 184, 0.35)` | Faint blue ruled guidelines for horizontal text alignment. |
| **Margin Guideline** | `rgba(239, 68, 68, 0.65)` | Classic vertical red left-margin rule. |
| **Stamp Clean** | `#15803D` | Forest green ink for `CLEAN` appliance state badges. |
| **Stamp Dirty** | `#B91C1C` | Crimson oxblood ink for `DIRTY` appliance state badges. |
| **Stamp Running** | `#1D4ED8` | Indigo blueprint ink for `RUNNING` appliance cycle badges. |
| **Stamp Empty** | `#B45309` | Rust amber ink for `EMPTYING` appliance transition badges. |

### 2.2 Pastel Highlighter Palette (Multiply Blend Overlays)
Used with optical multiply blending on light surfaces to emulate real felt-tip highlighter markers:

| Role | Color Value | Usage & Meaning |
| :--- | :--- | :--- |
| **Yellow Highlighter** | `rgba(254, 240, 138, 0.65)` | Primary callout, active member highlight, selected items. |
| **Green Highlighter** | `rgba(187, 247, 208, 0.60)` | Completed duties, active status confirmation. |
| **Pink Highlighter** | `rgba(254, 205, 211, 0.60)` | Urgent notices, pending swap alerts, attention required. |
| **Blue Highlighter** | `rgba(186, 230, 253, 0.60)` | Active running timers, appliance cycle indicators. |
| **Orange Highlighter** | `rgba(254, 215, 170, 0.60)` | Up-for-grabs pool markers, voluntary tasks. |

### 2.3 Night Journal Palette (Dark Mode)
Night mode is conceptualized as an **artist's night journal** worked with white gel pens, metallic inks, and luminous graphite under dim desk lamp illumination:

| Role | Color Value | Physical Metaphor & Visual Function |
| :--- | :--- | :--- |
| **Night Desk Surface** | `#0B1120` | Dark slate desk surface under low room lighting. |
| **Night Journal Page** | `#1E293B` | Charcoal black-paper sketchbook page. |
| **Night Cardstock** | `#283548` | Dense dark cardstock card for individual modules. |
| **White Gel Pen Ink** | `#F8FAFC` | Opaque white gel pen ink for primary headings and text. |
| **Silver Graphite** | `#CBD5E1` | Luminous silver-gray pencil lead for secondary text and borders. |
| **Night Rule Line** | `rgba(255, 255, 255, 0.08)` | Faint ruled lines on dark paper. |
| **Night Margin Guideline**| `rgba(248, 113, 113, 0.40)` | Muted coral red margin rule. |
| **Night Stamp Clean** | `#34D399` | Luminous emerald stamp ink on dark paper. |
| **Night Stamp Dirty** | `#F87171` | Phosphor coral stamp ink on dark paper. |
| **Night Stamp Running** | `#60A5FA` | Electric cyan stamp ink on dark paper. |
| **Night Stamp Empty** | `#FBBF24` | Warm amber stamp ink on dark paper. |

---

## 3. Typography & Text Hierarchy

```
+-------------------------------------------------------------------------------+
|                             TYPOGRAPHIC HIERARCHY                             |
|                                                                               |
|  [H1]  Patrick Hand (28px - 34px)          - "Household Logbook"              |
|  [H2]  Patrick Hand (22px - 26px)          - "Weekly Duty Schedule"           |
|  [H3]  Nunito Bold (17px - 19px)           - "Dishwasher (Main Kitchen)"      |
|  [Body] Nunito Regular (15px / 24px pitch) - "Please empty before dinner."    |
|  [Meta] Nunito / Mono (12px - 13px)        - "Turned on by Alex at 14:32"     |
|  [Stamp] Caveat / Sans Bold (14px)         - "CLEAN - NEEDS EMPTYING"         |
+-------------------------------------------------------------------------------+
```

### 3.1 Typeface Selection Rules
1. **Display & Section Titles (`Patrick Hand` & `Caveat`)**:
   - Natural, organic, open letterforms that mimic neat penmanship on paper.
   - High legibility even at fast scanning speeds, avoiding illegible script while maintaining warmth and personality.
2. **Body Copy & Form Controls (`Nunito`)**:
   - A humanist sans-serif with rounded terminals that mirrors the friendly geometry of paper typography without causing reading fatigue.
3. **Monospace Metadata (`JetBrains Mono`)**:
   - Evokes typewriter or stamped numeric codes for PINs, household invite codes, and elapsed time counters.

### 3.2 Baseline Grid & Ruled Pitch Rules
- All standard body text must lock to a **24px line-height baseline pitch**.
- Ruled horizontal guide lines must coincide exactly with the text baseline grid to maintain the illusion of handwriting on ruled stationary.
- Margin guidelines must maintain consistent left-hand clearance (red vertical margin line positioned 42px from sheet edge with text indented accordingly).

### 3.3 Type Scale Hierarchy

| Hierarchy Level | Typeface | Size / Line-Height | Weight / Tracking | Design Application |
| :--- | :--- | :--- | :--- | :--- |
| **Title / H1** | `Patrick Hand` | 32px / 36px | Regular / `-0.01em` | Notebook Cover title, Main View header |
| **Section / H2** | `Patrick Hand` | 24px / 28px | Regular / `0` | Card group titles, Tab headers |
| **Card / H3** | `Nunito` | 18px / 24px | Bold (700) / `0` | Appliance names, Chore task titles |
| **Body (Lead)** | `Nunito` | 16px / 24px | SemiBold (600) / `0` | Important instructions, callouts |
| **Body (Standard)** | `Nunito` | 15px / 24px | Regular (400) / `0` | Descriptions, roommate duty notes |
| **Caption / Meta** | `Nunito` | 13px / 20px | Regular (400) / `+0.01em` | Timestamps, secondary actor metadata |
| **Stamp Badge** | `Caveat` / `Nunito` | 14px / 16px | ExtraBold (800) / `+0.12em` | Rubber stamp state badges (uppercase) |
| **Numeric Code** | `JetBrains Mono` | 15px / 20px | Medium (500) / `+0.08em` | Household invite codes, PIN codes |

---

## 4. Motion, Spring Physics & Interaction Rules

```
       PAGE TURN PHYSICS (Perspective 1400px)
       
       Left Tab (Origin: 0% 50%)              Right Tab (Origin: 100% 50%)
          [========]                              [========]
          /        /                                \        \
         /   3D   /                                  \   3D   \
        /  Flip  /                                    \  Flip  \
       +--------+                                      +--------+
       RotateY(0 -> -90deg) -> Swap -> RotateY(90deg -> 0)
       Dynamic shadow gradient simulates paper bowing during turn
```

### 4.1 3D Page Turn Mechanics
- Navigation between primary tabs (`Appliances`, `Chores`, `Settings`) triggers a 3D skeletal page turn.
- **Directional Continuity**:
  - Moving forward (left to right tab): Page leaves rotating forward to the left (`rotateY(-90deg)`), enter page unfolds from the right (`rotateY(90deg -> 0deg)`).
  - Moving backward (right to left tab): Page leaves rotating backward to the right (`rotateY(90deg)`), enter page unfolds from the left (`rotateY(-90deg -> 0deg)`).
- **Curvature Shadowing**: As the page turns through the 3D plane, dynamic gradient overlays simulate physical paper bowing and shadow casting.
- **Spring & Timing Profile**: Fast, crisp execution (approx. `380ms`) with natural deceleration to feel physical yet snappy.

### 4.2 Tactile Micro-Interactions

```
STAMP THUD TIMELINE:
Scale:   1.45x ---------------> 0.94x ------> 1.0x (Settle)
Opacity: 0.0   ---------------> 1.0   ------> 0.95
Time:    0ms                    140ms        220ms
Audio:   [ Resonant Stamping Impact Sound + Haptic Pulse ]
```

1. **Rubber Stamp Impression**:
   - When an appliance state changes (e.g. to `CLEAN`), the stamp impression drops with a rapid scale compression (`1.45x` down to `0.94x`, settling at `1.0x` over `220ms`).
   - The impact imparts a micro-shake ($\pm 0.4^{\circ}$) to the parent card container.
2. **Pencil Scribble Checkoff**:
   - Completing a weekly chore duty draws an animated hand-drawn strikethrough or circle around the task name over `320ms`.
3. **Paper Slip Peeling & Dragging**:
   - Hovering or grabbing an up-for-grabs memo card triggers a subtle lift angle with expanded shadow, mimicking sticky paper peeling away from the desk.
4. **Shared Element Transitions (Layout Morphing)**:
   - Opening modal details or slips should physically morph the originating card into the expanded slip rather than popping an unrelated overlay over the screen.

### 4.3 Reduced Motion Accessibility
- When the user prefers reduced motion (`prefers-reduced-motion: reduce`):
  - 3D rotations, perspective shifts, and page flips are replaced with instant or gentle 120ms cross-fades.
  - Card rotational tilts are normalized to $0^{\circ}$.

---

## 5. Stationery Component Design Rules

### 5.1 Binder Spine & Index Tab Dividers

```
+-------------------------------------------------------------------------------+
| (O) (O) (O)  ROOMMATE LOGBOOK - 42 MAPLE AVE       [Alex (Admin)]             |
| [SPIRAL RINGS]                                                                |
|                                       +------------+ +------------+ +-------+ |
|                                       | APPLIANCES | |   CHORES   | | SETT. | |
|                                    +--+            +-+            +-+       | |
|                                    | (ACTIVE TAB PULLED TO FOREGROUND)      | |
+-------------------------------------------------------------------------------+
```

- **Index Tab Dividers**:
  - Shaped as die-cut index cards along the top edge or side edge.
  - **Active State**: Pulled to the absolute visual foreground, matching the active page sheet background (`#FCFBF7`), overlapping the top page border seamlessly.
  - **Inactive State**: Sits slightly recessed in a darker cardstock tone (`#EAE3D2`) with an overlaid top shadow.
- **Spiral Binding & Rivets**:
  - Displays continuous double-loop wire binding coils with metallic specular reflections or twin brass grommets along the spine edge.

---

### 5.2 Appliance Dashboard & Rubber Stamp Badges

```
+----------------------------------------------------------------+
|  +----------------------------------------------------------+  |
|  | [WASHING MACHINE]                     [Last: Sam (1h ago)]|  |
|  |                                                          |  |
|  |     +---------------------------------------------+      |  |
|  |     |  * * * * * * * * * * * * * * * * * * * * *  |      |  |
|  |     |  *             [ CLEAN ]                  * |      |  |
|  |     |  *       NEEDS EMPTYING IMMEDIATELY       * |      |  |
|  |     |  * * * * * * * * * * * * * * * * * * * * *  |      |  |
|  |     +---------------------------------------------+      |  |
|  |                                                          |  |
|  |  Running duration: 45 min    [TAP TO EMPTY DISHWASHER]   |  |
|  +----------------------------------------------------------+  |
+----------------------------------------------------------------+
```

- **Appliance Card Container**:
  - Shaped as an individual index card resting upon the page with a subtle pencil-line perimeter.
  - Alternating cards feature slight pseudo-random rotational skews ($-0.4^{\circ}$ and $+0.6^{\circ}$) for organic variety.
- **Rubber Stamp State Badges**:
  - Distressed rubber stamp impression with weathered edges and double-stroke perimeter.
  - Distinct rotational angles for each state:
    - `CLEAN`: Rotated $-2.5^{\circ}$ (Forest green ink).
    - `DIRTY`: Rotated $+3.2^{\circ}$ (Crimson oxblood ink).
    - `RUNNING`: Rotated $-1.2^{\circ}$ (Blueprint indigo ink).
    - `EMPTYING`: Rotated $+1.8^{\circ}$ (Rust amber ink).

---

### 5.3 Chore Duty Checklist & Tally Marks

```
+----------------------------------------------------------------+
|  WEEKLY CHORE LOG: AUG 24 - AUG 30           [Status: ON DUTY] |
|  ------------------------------------------------------------- |
|  [x] Deep Clean Kitchen Counters ............. Assigned: Sam   |
|      (Scribbled strikethrough with green highlighter)          |
|                                                                |
|  [ ] Empty Living Room Trash ................. Assigned: Alex  |
|      Duty instances logged: [ 3 times this week ] [+ LOG]      |
|                                                                |
|  [ ] Mop Bathroom Floors ..................... Assigned: Jordan|
|      [REQUEST SWAP SLIP]                                       |
+----------------------------------------------------------------+
```

- **Ruled Paper Surface**: Ruled blue horizontal guide lines with 24px baseline alignment and a red vertical margin guide.
- **Hand-Drawn Checkboxes**: Slightly irregular, hand-drawn checkboxes that fill with an organic pencil checkmark or strikethrough on completion.
- **Continuous Duty Tally Marks**: Continuous duties (e.g. trash runs, wiping counters) render logged duty counts as organic handwritten tally mark clusters (four vertical strokes and a diagonal crossbar: `||||`) rather than cold numeric dials.
- **Tear-Off Swap Slips**: Propose-swap actions appear as perforated paper slips with dashed cutoff borders.

---

### 5.4 Up-for-Grabs Memo Board & Washi Tape

```
+----------------------------------------------------------------+
|  PINNED MEMO BOARD: UP-FOR-GRABS TASKS                         |
|                                                                |
|     +------------------+          +------------------+         |
|     | [WASHI TAPE]     |          | [WASHI TAPE]     |         |
|     | Clean Refrigerator|         | Water Balcony Pl. |         |
|     | Away: Jordan     |          | Unassigned       |         |
|     | [ CLAIM CHORE ]  |          | [ CLAIM CHORE ]  |         |
|     +------------------+          +------------------+         |
|      (Yellow Post-It)              (Pastel Mint Post-It)       |
+----------------------------------------------------------------+
```

- **Post-It Memo Cards**: Pinned square memo slips resting on the cork or wood backing with varied natural tilts (`-2^{\circ}` to `+1.5^{\circ}`).
- **Washi Tape Strip**: Translucent matte washi tape strip mounted at the top center of each card, featuring semi-transparent texture and jagged torn edges.

---

### 5.5 Modal Dialogs & Metallic Paperclips

```
+----------------------------------------------------------------+
|  BACKGROUND DIMMED DESK SURFACE                                |
|                                                                |
|              +-----------------------------------+             |
|              | [METALLIC PAPERCLIP]              |             |
|              |                                   |             |
|              |   PROPOSE CHORE SWAP SLIP         |             |
|              |   -----------------------------   |             |
|              |   Swap: [ Deep Clean Kitchen ]    |             |
|              |   With: [ Mop Bathroom Floor ]    |             |
|              |                                   |             |
|              |   [ CANCEL ]   [ CONFIRM SWAP ]   |             |
|              +-----------------------------------+             |
|               (Slightly rotated -1.2deg card)                  |
+----------------------------------------------------------------+
```

- **Paperclipped Memo Slip**: Modals appear as physical manila or yellow legal slips clipped over the notebook.
- **Fastener**: Realistic metallic paperclip anchored at the top-left corner casting a distinct drop shadow onto the slip.
- **Rotation**: Fixed organic tilt of $-1.2^{\circ}$ or $+1.0^{\circ}$.

---

### 5.6 Onboarding & Interactive Notebook Cover

```
+----------------------------------------------------------------+
|  +----------------------------------------------------------+  |
|  | +======================================================+ |  |
|  | |                                                      | |  |
|  | |                 HOUSEHOLD COORDINATION               | |  |
|  | |                   * LOGBOOK & DIARY *                | |  |
|  | |                                                      | |  |
|  | |            [ GOLD FOIL EMBOSSED CREST ]              | |  |
|  | |                                                      | |  |
|  | |         [ Create New House ]   [ Enter Code ]        | |  |
|  | |                                                      | |  |
|  | +======================================================+ |  |
|  |  (Leather Stitched Border / Kraft Paper Cover Texture)   |  |
|  +----------------------------------------------------------+  |
+----------------------------------------------------------------+
```

- **Notebook Cover Customizer**: Household admins can select from physical cover finishes:
  1. **Classic Moleskine**: Matte black oilcloth texture (`#1C1917`) with gold-foil stamped lettering.
  2. **Raw Kraft Notebook**: Heavy brown fiber paper (`#B89772`) with dark brown ink and stamped crest.
  3. **Tan Saddle Leather**: Rich warm brown leather (`#78350F`) with debossed perimeter stitching.
  4. **Pastel Spiral**: Soft sage mint with silver double-loop wire binding.
- **Cover Opening Sequence**: Entering or logging in initiates a smooth 3D cover open transition (`rotateY(-110deg)`), revealing the inner cream pages.

---

### 5.7 Settings & Desk Lamp Switch
- **Night Mode Pull-Chain**: The dark mode toggle is styled as a retro desk lamp pull-chain or brass rocker switch. Toggling illuminates or dims the ambient desk surface.
- **Sound & Haptic Controls**: Styled as embossed card toggles with pen-marked indicators.

---

## 6. Multi-Sensory Sonic & Haptic Identity

Domestic tools make distinct, satisfying sounds. The app includes an opt-in procedural sound and haptic engine to provide subtle, gratifying tactile feedback.

```
+-------------------------------------------------------------------------------+
|                        MULTI-SENSORY FEEDBACK MATRIX                          |
|                                                                               |
|  [ User Action ]      [ Audio Signature ]             [ Haptic Feedback ]     |
|  ------------------   -----------------------------   ----------------------  |
|  Page Flip            Dry paper rustle / friction     Light flutter (15ms)    |
|  Rubber Stamp State   Heavy desk thud + snap click    Dual-pulse (20ms, 30ms) |
|  Pencil Checkoff      Graphite scratch micro-pulses   Crisp tap (10ms)        |
|  Washi Tape Peel      Adhesive friction tear          Soft tick (12ms)        |
|  Pull-Chain Switch    Brass metallic click            Sharp impact (25ms)     |
+-------------------------------------------------------------------------------+
```

### 6.1 Sound Design Rules
- **Procedural Generation**: Sound effects must be dynamically synthesized with micro-variations in pitch, envelope, and filtering so repeated actions never sound robotic or identical.
- **Subtlety & Non-Intrusiveness**: Sounds must remain quiet, warm, and natural (avoiding harsh electronic beeps or chime sounds).
- **User Preference Default**: Audio is opt-in by default and persists in user settings.

### 6.2 Haptic Vibration Rules
- On mobile devices supporting vibration, key physical actions trigger precise micro-haptic patterns (e.g. 20ms pulse for rubber stamps, crisp 10ms tap for pencil checkboxes).

---

## 7. Responsive Layout & Spatial Architecture

```
+-------------------------------------------------------------------------------+
|                        RESPONSIVE LAYOUT MATRIX                               |
|                                                                               |
|  [Desktop >= 1024px]        [Tablet 768px - 1023px]    [Mobile < 768px]       |
|  +-----------------------+  +-----------------------+  +-------------------+  |
|  | Desk Mat Backdrop     |  | Single Page Binder    |  | Pocket Journal    |  |
|  | +---------+---------+|  | +-------------------+ |  | +---------------+ |  |
|  | | Left    | Right   |||  | | Header / Top Tabs | |  | | Compact Header| |  |
|  | | Summary | Active  |||  | |-------------------| |  | | Top Mini Tabs | |  |
|  | | & Stats | Page    |||  | | Full Page View    | |  | | Full Screen    | |  |
|  | | & Memos | Page    |||  | | Swipe Gesture     | |  | | Swipe Gesture  | |  |
|  | +---------+---------+|  | +-------------------+ |  | +---------------+ |  |
|  +-----------------------+  +-----------------------+  +-------------------+  |
+-------------------------------------------------------------------------------+
```

### 7.1 Spatial Layout Breakpoints

#### 1. Desktop Two-Page Spread ($\ge 1024\text{px}$)
- **Environment**: Centered binder spread resting on a textured desk mat backdrop.
- **Left Page (Summary Ledger & Memo Pinboard)**:
  - Household overview, roommate presence avatars, weekly chore progress ring, and pinned up-for-grabs notes.
- **Right Page (Active Working Sheet)**:
  - Primary selected view (`Appliances`, `Chores`, or `Settings`).
- **Center Gutter**: Rendered spiral wire spine with deep binding shadows.

#### 2. Tablet Portrait ($768\text{px} - 1023\text{px}$)
- **Environment**: Single-page heavy binder format with prominent right-hand or top die-cut index tabs.
- **Interaction**: Fast tap navigation and horizontal swipe gestures with 3D page turns.

#### 3. Mobile Pocket Journal ($< 768\text{px}$)
- **Environment**: Full-bleed pocket notebook experience optimized for one-thumb reach.
- **Header**: Compact rivet header with household name and member avatar.
- **Navigation**: Top index tabs or bottom ribbon bookmark.
- **Gestures**: Horizontal edge-swipe gesture support to leaf forward and backward between pages.

---

## 8. Accessibility & Quality Standards

The Paper Notebook Design System adheres strictly to **WCAG 2.1 AA standards** to guarantee universal usability and readability:

### 8.1 Color Contrast Standards

| Text / UI Element | Background Surface | Contrast Ratio | WCAG Compliance Level |
| :--- | :--- | :--- | :--- |
| **Navy Ink (`#1E293B`)** | Base Cream (`#FAF6EE`) | **12.8:1** | Pass (Exceeds AAA) |
| **Graphite Pencil (`#475569`)** | Base Cream (`#FAF6EE`) | **7.4:1** | Pass (AAA) |
| **Clean Stamp Ink (`#15803D`)** | Manila Card (`#FEF7E0`) | **6.1:1** | Pass (AA) |
| **Dirty Stamp Ink (`#B91C1C`)** | Manila Card (`#FEF7E0`) | **6.4:1** | Pass (AA) |
| **Running Stamp Ink (`#1D4ED8`)** | Manila Card (`#FEF7E0`) | **6.9:1** | Pass (AA) |
| **Empty Stamp Ink (`#B45309`)** | Manila Card (`#FEF7E0`) | **5.8:1** | Pass (AA) |
| **Night Gel White (`#F8FAFC`)** | Night Charcoal (`#1E293B`) | **13.4:1** | Pass (AAA) |
| **Night Graphite (`#CBD5E1`)** | Night Charcoal (`#1E293B`) | **9.1:1** | Pass (AAA) |

### 8.2 Focus Affordances & Keyboard Navigation
- **Tactile Focus Rings**: Interactive elements feature a distinct dashed pencil outline offset by 3px when focused via keyboard.
- **WAI-ARIA Tablist Compliance**: Tab navigation supports standard arrow keys (`ArrowLeft`, `ArrowRight`, `Home`, `End`) for full keyboard navigation.

### 8.3 Screen Reader Semantics
- Decorative physical artifacts (spiral coils, paperclips, washi tape strips, ruled guide lines) are strictly hidden from assistive technology (`aria-hidden="true"`).
- Rubber stamp badges and appliance state changes broadcast updates to screen readers via semantic live regions (`aria-live="polite"`).
- All buttons and interactive controls provide clear, accessible label descriptions.

---
*End of Design Specification — Household Coordination App*
