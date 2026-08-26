# Household Coordination App — Paper Notebook Design System

> **Document Version**: 1.0.0  
> **Status**: Approved Specification & Implementation Guide  
> **Design Philosophy**: Tactile Stationery & Living Paper Notebook  
> **Target Platform**: Responsive Web & PWA (Desktop, Tablet, Mobile)  

---

## 1. Executive Design Vision & Visual Thesis

### 1.1 The Physical Notebook Metaphor
Modern digital task managers and household software suffer from a common affliction: **sterile corporate SaaS aesthetic fatigue**. Standard flat interfaces—filled with rounded generic cards, neutral gray borders, and cold synthetic gradients—feel like Jira for the home. Roommates and families do not want to manage their living spaces with an enterprise productivity tool; domestic life is tactile, personal, collaborative, and grounded in shared physical reality.

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
|  |  | |  [#] APPLIANCE DASHBOARD                                | [TAB] |  |  |
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
The interface treats every visual element as a tangible piece of stationery:
- **Heavyweight Paper Pages**: Unbleached, warm-cream fibrous stock (`#faf6ee` / `#fcfbf7`) with subtle tactile tooth and organic noise rather than sterile `#ffffff`.
- **Ruled Paper & Margin Rules**: Faint blue horizontal guide rules aligned with an exact baseline grid, complemented by classic vertical red left-margin lines.
- **Stationery Index Dividers**: Die-cut tab dividers protruding from page edges with manila or pastel cardstock colors, creating an intuitive multi-section binder.
- **Fasteners & Adhesives**: Translucent matte washi tape strips holding memo notes, brass binder rings/rivets along the spine, and metallic silver paperclips binding dialog slips.
- **Inks, Pencils & Stamps**:
  - **Ballpoint/Fountain Navy Ink**: Crisp, dark navy (`#1e293b`) for primary headings, written records, and deliberate actions.
  - **Graphite Pencil**: Soft, slightly grainy slate (`#475569`) for secondary metadata, timestamps, and transient notes.
  - **Distressed Rubber Stamps**: Inked rubber stamp impressions with weathered bleed textures, angled rotations ($\pm 2^{\circ}$ to $\pm 5^{\circ}$), and authentic stamped borders for state indicators (`CLEAN`, `DIRTY`, `RUNNING`, `EMPTYING`).
  - **Highlighter Overlays**: Semi-transparent, multiply-blended pastel highlighter strokes accentuating active statuses or current member assignments.

### 1.3 Lighting, Elevation & Shadows
Depth is achieved through **soft directional ambient lighting** (simulating an overhead desk lamp positioned at $270^{\circ}$ top-left) rather than generic computer drop-shadows:
- **Page Lift**: Subtle ambient occlusion beneath page corners and lifted card edges.
- **Paper Stack Layering**: Multiple stacked sheet borders creating physical sheet depth along the right and bottom edges.
- **Natural Organic Imperfection**: Elements feature slight pseudo-random rotational skews ($\pm 0.5^{\circ}$ to $\pm 1.8^{\circ}$) to eliminate uncanny computational symmetry.

---

## 2. Color Tokens & Surface Hierarchy

The color palette is derived directly from physical artist and stationery materials.

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

| Token Name | Hex Value | Physical Metaphor & Usage |
| :--- | :--- | :--- |
| `--paper-bg` | `#FAF6EE` | Base warm cream sketchbook paper (main background) |
| `--paper-sheet` | `#FCFBF7` | Crisp heavyweight bond paper (active foreground page) |
| `--paper-card` | `#FFFDF9` | Index cardstock surface for appliance & chore cards |
| `--paper-manila` | `#FEF7E0` | Manila folder/cardstock for dividers and swap slips |
| `--paper-postit` | `#FEF9C3` | Canary yellow sticky note paper for up-for-grabs tasks |
| `--desk-surface` | `#EAE4D5` | Warm linen / bleached oak desk backdrop framing binder |
| `--ink-navy` | `#1E293B` | Dark blue ballpoint ink (primary text & headers) |
| `--ink-graphite` | `#475569` | 2B pencil graphite (secondary text, borders, icons) |
| `--ink-muted` | `#94A3B8` | Light pencil guideline / timestamp text |
| `--rule-line` | `rgba(148, 163, 184, 0.35)` | Notebook horizontal blue rule lines |
| `--rule-margin` | `rgba(239, 68, 68, 0.65)` | Classic left vertical red margin guideline |
| `--stamp-clean` | `#15803D` | Forest green rubber stamp ink (`CLEAN` badge) |
| `--stamp-dirty` | `#B91C1C` | Crimson oxblood rubber stamp ink (`DIRTY` badge) |
| `--stamp-running` | `#1D4ED8` | Blueprint indigo rubber stamp ink (`RUNNING` badge) |
| `--stamp-empty` | `#B45309` | Rust amber rubber stamp ink (`EMPTYING` badge) |

### 2.2 Pastel Highlighter Palette (Semi-Transparent Overlays)
Used with `mix-blend-mode: multiply` on light surfaces to emulate real felt-tip highlighter markers:

| Token Name | RGBA Value | Usage |
| :--- | :--- | :--- |
| `--hl-yellow` | `rgba(254, 240, 138, 0.65)` | Primary callout, active member highlight |
| `--hl-green` | `rgba(187, 247, 208, 0.60)` | Completed duties, active status confirmation |
| `--hl-pink` | `rgba(254, 205, 211, 0.60)` | Urgent notifications, pending swap alerts |
| `--hl-blue` | `rgba(186, 230, 253, 0.60)` | Running timers, secondary category tags |
| `--hl-orange` | `rgba(254, 215, 170, 0.60)` | Up-for-grabs pool markers, attention items |

### 2.3 Night Journal Palette (Dark Mode)
Night mode is styled as an **artist's night journal** or **black-leather diary** worked with white gel pens, metallic inks, and luminous graphite:

| Token Name | Hex Value | Physical Metaphor & Usage |
| :--- | :--- | :--- |
| `--night-desk` | `#0B1120` | Dark slate desk surface under low room lighting |
| `--night-page` | `#1E293B` | Charcoal black-paper sketchbook page |
| `--night-card` | `#283548` | Dense dark cardstock card |
| `--night-gel-white` | `#F8FAFC` | Opaque white gel pen ink (primary headings & text) |
| `--night-graphite` | `#CBD5E1` | Silver-gray pencil lead (secondary text) |
| `--night-rule-line` | `rgba(255, 255, 255, 0.08)` | Faint ruled lines on dark paper |
| `--night-margin` | `rgba(248, 113, 113, 0.40)` | Muted coral margin line |
| `--night-stamp-clean` | `#34D399` | Luminous emerald stamp ink on dark paper |
| `--night-stamp-dirty` | `#F87171` | Phosphor coral stamp ink on dark paper |
| `--night-stamp-running` | `#60A5FA` | Electric blue stamp ink on dark paper |
| `--night-stamp-empty` | `#FBBF24` | Warm amber stamp ink on dark paper |

### 2.4 Tailwind CSS Configuration Extension

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: 'var(--paper-bg, #faf6ee)',
          sheet: 'var(--paper-sheet, #fcfbf7)',
          card: 'var(--paper-card, #fffdf9)',
          manila: 'var(--paper-manila, #fef7e0)',
          postit: 'var(--paper-postit, #fef9c3)',
          desk: 'var(--desk-surface, #eae4d5)',
        },
        ink: {
          navy: 'var(--ink-navy, #1e293b)',
          graphite: 'var(--ink-graphite, #475569)',
          muted: 'var(--ink-muted, #94a3b8)',
          margin: 'var(--rule-margin, #ef4444)',
        },
        stamp: {
          clean: 'var(--stamp-clean, #15803d)',
          dirty: 'var(--stamp-dirty, #b91c1c)',
          running: 'var(--stamp-running, #1d4ed8)',
          empty: 'var(--stamp-empty, #b45309)',
        },
        highlighter: {
          yellow: 'var(--hl-yellow, rgba(254, 240, 138, 0.65))',
          green: 'var(--hl-green, rgba(187, 247, 208, 0.60))',
          pink: 'var(--hl-pink, rgba(254, 205, 211, 0.60))',
          blue: 'var(--hl-blue, rgba(186, 230, 253, 0.60))',
          orange: 'var(--hl-orange, rgba(254, 215, 170, 0.60))',
        },
      },
      boxShadow: {
        'paper-sm': '0 1px 3px rgba(30, 41, 59, 0.08), 0 1px 2px rgba(30, 41, 59, 0.04)',
        'paper-md': '0 4px 8px -1px rgba(30, 41, 59, 0.10), 0 2px 4px -2px rgba(30, 41, 59, 0.06)',
        'paper-lg': '0 10px 20px -3px rgba(30, 41, 59, 0.12), 0 4px 6px -4px rgba(30, 41, 59, 0.08)',
        'paper-lifted': '0 14px 28px rgba(30, 41, 59, 0.15), 0 10px 10px rgba(30, 41, 59, 0.08), 0 0 1px rgba(30, 41, 59, 0.2)',
        'binder-spine': 'inset -8px 0 12px -4px rgba(0, 0, 0, 0.15), inset 4px 0 6px -2px rgba(255, 255, 255, 0.4)',
        'page-stack': '2px 2px 0px #e2d9c8, 4px 4px 0px #d5cbba, 6px 6px 0px #c8bea9',
      },
      fontFamily: {
        hand: ['"Patrick Hand"', '"Caveat"', 'cursive', 'sans-serif'],
        display: ['"Caveat"', '"Patrick Hand"', 'cursive', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier Prime"', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

---

## 3. Typography System & Font Pairing

```
+-------------------------------------------------------------------------------+
|                             TYPOGRAPHIC HIERARCHY                             |
|                                                                               |
|  [H1]  Patrick Hand / Caveat (28px - 34px) - "Household Logbook"              |
|  [H2]  Patrick Hand (22px - 26px)          - "Weekly Duty Schedule"           |
|  [H3]  Nunito Bold (17px - 19px)           - "Dishwasher (Main Kitchen)"      |
|  [Body] Nunito Regular (15px / 24px pitch) - "Please empty before dinner."    |
|  [Meta] Nunito / Mono (12px - 13px)        - "Turned on by Alex at 14:32"     |
|  [Stamp] Caveat / Sans Bold (14px)         - "CLEAN - NEEDS EMPTYING"         |
+-------------------------------------------------------------------------------+
```

### 3.1 Typeface Selection Rationale
1. **Display & Headings: `Patrick Hand` & `Caveat`**
   - Natural, organic, open letterforms that mimic neat penmanship on paper.
   - High legibility even at fast reading speeds, avoiding illegible cursive script while maintaining a warm handwritten spirit.
2. **Body Copy & Form Inputs: `Nunito`**
   - A humanist sans-serif with subtle rounded terminals.
   - Mirrors the friendly geometry of paper typography without fatiguing the eyes during long reading sessions.
3. **Monospace Metadata: `JetBrains Mono` / `Courier Prime`**
   - Mimics typewriter or stamped numeric codes (PIN codes, invite codes, elapsed time counters).

### 3.2 Baseline Grid & Ruled Line Pitch
To preserve the paper notebook illusion, all body typography is locked to a **24px line-height baseline grid** that aligns perfectly with the CSS notebook ruled lines.

```css
/* Exact 24px Ruled Line Alignment */
.notebook-ruled-surface {
  background-color: var(--paper-sheet);
  background-image: linear-gradient(
    to bottom,
    transparent 23px,
    var(--rule-line) 23px,
    var(--rule-line) 24px
  );
  background-size: 100% 24px;
  line-height: 24px;
}

.notebook-margin-guide {
  position: relative;
  padding-left: 52px;
}

.notebook-margin-guide::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 42px;
  width: 2px;
  background-color: var(--rule-margin);
  pointer-events: none;
}
```

### 3.3 Type Scale Hierarchy Table

| Level | Font Family | Size / Line-Height | Weight / Tracking | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Title / H1** | `Patrick Hand` | 32px / 36px | Regular / `-0.01em` | Notebook Cover title, Main View header |
| **Section / H2** | `Patrick Hand` | 24px / 28px | Regular / `0` | Card group titles, Tab headers |
| **Card / H3** | `Nunito` | 18px / 24px | Bold (700) / `0` | Appliance names, Chore task titles |
| **Body (Lead)** | `Nunito` | 16px / 24px | SemiBold (600) / `0` | Important instructions, callouts |
| **Body (Standard)** | `Nunito` | 15px / 24px | Regular (400) / `0` | Descriptions, roommate duty notes |
| **Caption / Meta** | `Nunito` | 13px / 20px | Regular (400) / `+0.01em` | Timestamps, secondary actor metadata |
| **Stamp Badge** | `Caveat` / `Nunito` | 14px / 16px | ExtraBold (800) / `+0.12em` | Rubber stamp state badges (uppercase) |
| **Numeric Code** | `JetBrains Mono` | 15px / 20px | Medium (500) / `+0.08em` | 6-char household codes, 4-digit PINs |

### 3.4 Google Fonts Web Loading Strategy
To ensure optimal performance with zero layout shift (CLS):

```html
<!-- frontend/index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Patrick+Hand&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
```

---

## 4. Motion, Physics & Page-Flip Engine

```
       PAGE TURN PHYSICS (Perspective 1400px)
       
       Left Tab (Origin: 0% 50%)              Right Tab (Origin: 100% 50%)
          [========]                              [========]
         /        /                                \        \
        /   3D   /                                  \   3D   \
       /  Flip  /                                    \  Flip  \
      +--------+                                      +--------+
      RotateY(0 -> -90deg) -> Swap -> RotateY(90deg -> 0)
      Dynamic Shadow Gradient overlays sheet during turn
```

### 4.1 3D Horizontal Page Turn Mechanism
Tab navigation between **Appliances**, **Chores**, and **Settings** triggers a true 3D skeletal page turn:
1. **Perspective Container**: The main binder viewport is wrapped in `perspective: 1400px`.
2. **Directional Awareness**:
   - Moving from a left tab to a right tab flips the current page forward to the left (`rotateY(-180deg)` with `transform-origin: left center`).
   - Moving from a right tab to a left tab turns the page backwards from the left (`rotateY(180deg)` with `transform-origin: right center`).
3. **Curvature & Cast Shadow**:
   - As the page rotates beyond $30^{\circ}$, an internal dynamic gradient simulates the paper bowing and casting a soft shadow across the facing page.
4. **Easing & Timing**:
   - Duration: `380ms`
   - Easing: `cubic-bezier(0.25, 1, 0.5, 1)` (smooth, natural physical acceleration and gentle settle).

```css
/* Page Flip Animation Classes */
.notebook-viewport {
  perspective: 1400px;
  perspective-origin: 50% 50%;
}

.notebook-page-leaf {
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transition: transform 380ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 380ms ease-out;
}

.page-flip-forward-exit {
  transform-origin: left center;
  animation: pageFlipLeft 380ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

.page-flip-forward-enter {
  transform-origin: right center;
  animation: pageRevealRight 380ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes pageFlipLeft {
  0% {
    transform: rotateY(0deg);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  50% {
    box-shadow: -12px 16px 24px rgba(0,0,0,0.18);
  }
  100% {
    transform: rotateY(-90deg);
    box-shadow: -20px 24px 30px rgba(0,0,0,0.02);
  }
}

@keyframes pageRevealRight {
  0% {
    transform: rotateY(90deg);
    opacity: 0.8;
  }
  100% {
    transform: rotateY(0deg);
    opacity: 1;
  }
}
```

### 4.2 Tactile Micro-Interactions

```
STAMP THUD TIMELINE:
Scale:   1.4x ----------------> 0.95x ------> 1.0x (Settle)
Opacity: 0.0  ----------------> 1.0   ------> 1.0
Time:    0ms                    140ms        220ms
Audio:   [ Thud / Stamping Impact Click (Web Audio API) ]
```

1. **Rubber Stamp Impression (`stamp-thud`)**:
   - When an appliance state changes (e.g., to `CLEAN`), the stamp badge stamps down with a rapid scale reduction (`scale(1.4) -> scale(0.95) -> scale(1.0)` over `220ms`).
   - Generates a brief $0.4^{\circ}$ subtle shake to the parent cardstock container.
2. **Pencil Scribble Checkoff (`pencil-scribble`)**:
   - Checking off a weekly chore activates an SVG path drawing animation that renders an irregular hand-drawn strikethrough or circle around the task name over `320ms`.
   - Uses `stroke-dasharray` and `stroke-dashoffset` interpolation.
3. **Paper Slip Peeling & Dragging**:
   - Hovering over a memo slip or up-for-grabs card triggers an organic $1.5^{\circ}$ lift with an expanded bottom-right shadow, mimicking sticky paper curling slightly away from the table.

```css
/* Keyframe Definitions for Micro-Interactions */
@keyframes stampThud {
  0% {
    transform: scale(1.45) rotate(var(--stamp-angle, -3deg));
    opacity: 0;
  }
  65% {
    transform: scale(0.94) rotate(var(--stamp-angle, -3deg));
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(var(--stamp-angle, -3deg));
    opacity: 0.92;
  }
}

@keyframes pencilStrikethrough {
  0% {
    stroke-dashoffset: 100%;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animate-stamp-thud {
  animation: stampThud 240ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.animate-scribble-check {
  stroke-dasharray: 100%;
  animation: pencilStrikethrough 320ms ease-in-out forwards;
}
```

### 4.3 Reduced Motion Accessibility
When `prefers-reduced-motion: reduce` is active:
- 3D rotations and perspective transforms are completely deactivated.
- Transitions switch to instantaneous or simple $120\text{ms}$ opacity fades (`opacity 0 -> 1`).
- Card rotations are reset to $0^{\circ}$.

---

## 5. Tactile Stationery Kit & Component Guidelines

### 5.1 Header & Tab Dividers

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
  - Mounted along the top edge (mobile & desktop) or right side edge (wide desktop).
  - Designed as die-cut index cards with subtle rounded top corners (`rounded-t-lg`).
  - Active tab is visually brought to the absolute foreground (`z-20`, background matching the active sheet `#fcfbf7`, and extending 4px downward to merge seamlessly with the page border).
  - Inactive tabs feature a darker cardstock tone (`#eae3d2`) with an overlaid top shadow.
- **Spiral Binding & Rivets**:
  - Left edge (desktop) or top edge (mobile) displays an authentic SVG wire spiral coil with metallic highlight reflections or twin brass grommets.

```tsx
// Example Header Tab Component Pattern
export function NotebookTab({
  label,
  icon: Icon,
  isActive,
  badgeCount,
  onClick,
  colorClass = "bg-paper-manila"
}: NotebookTabProps) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={clsx(
        "relative px-5 py-2.5 font-hand text-lg font-bold transition-all duration-150 rounded-t-md border-t-2 border-x-2",
        isActive
          ? "bg-paper-sheet text-ink-navy border-slate-400 z-20 shadow-[0_-3px_6px_rgba(0,0,0,0.06)] translate-y-[2px]"
          : "bg-[#e5decb] hover:bg-[#eae3d3] text-ink-graphite border-slate-300 z-10 translate-y-2 opacity-85"
      )}
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4 opacity-80" />
        <span>{label}</span>
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs font-mono rounded-full bg-stamp-dirty text-white">
            {badgeCount}
          </span>
        )}
      </div>
    </button>
  );
}
```

---

### 5.2 Appliance Dashboard & Cards

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

- **Index Card Container**:
  - Styled as an individual $4\times 6$ manila or crisp white memo card (`#fffdfa`) resting upon the page.
  - Border: Subtle $1\text{px}$ pencil rule (`border-slate-300`).
  - Subtle random tilt: `[transform: rotate(-0.4deg)]` and `[transform: rotate(0.6deg)]` alternating across grid items.
- **Rubber Stamp State Badges**:
  - Large, bold, double-bordered distressed badges with uppercase typography.
  - Weathered texture generated via SVG turbulence filter or distressed CSS borders.
  - Rotated naturally between $-2^{\circ}$ and $+4^{\circ}$.

```css
/* Authentic Weathered Rubber Stamp CSS */
.rubber-stamp {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.85rem;
  text-transform: uppercase;
  font-family: 'Caveat', 'Patrick Hand', cursive, sans-serif;
  font-weight: 800;
  letter-spacing: 0.12em;
  border: 2.5px solid currentColor;
  border-radius: 4px;
  position: relative;
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' result='noise'/><feColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 7 -2'/></filter><rect width='100%' height='100%' filter='url(%23noise)' fill='black'/></svg>");
}

.stamp-clean {
  color: var(--stamp-clean);
  transform: rotate(-2.5deg);
}

.stamp-dirty {
  color: var(--stamp-dirty);
  transform: rotate(3.2deg);
}

.stamp-running {
  color: var(--stamp-running);
  transform: rotate(-1.2deg);
}

.stamp-empty {
  color: var(--stamp-empty);
  transform: rotate(1.8deg);
}
```

---

### 5.3 Chore Duty View & Weekly Checklist

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

- **Ruled Notebook Sheet**:
  - Rendered with continuous $24\text{px}$ blue ruled lines and a left red margin rule.
- **Hand-Drawn Checkboxes**:
  - Interactive checkboxes shaped as hand-drawn squares with uneven strokes.
  - On toggle: Plays pencil scribble sound (if enabled) and animates an organic pencil checkmark or cross-hatch.
- **Continuous Duty Tally Marks**:
  - For continuous duties (e.g., trash runs), logged instances are rendered as handwritten tally clusters (four vertical strokes with a diagonal slash: `||||` / ) rather than cold numeric counters.
- **Tear-Off Swap Slips**:
  - Styled as perforated paper slips with a dashed cutoff border (`border-t-2 border-dashed border-slate-400`).

---

### 5.4 Up-for-Grabs Pool & Sticky Notes

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

- **Post-It / Memo Card Styling**:
  - Square or $3\times 3$ ratio card with slight drop shadow (`shadow-paper-md`).
  - Rotations varied naturally across items: `rotate-1`, `-rotate-2`, `rotate-1.5`.
- **Translucent Washi Tape Strip**:
  - Positioned at the top center of each card.
  - Rendered with semi-transparent frosted texture (`backdrop-blur-[1px] bg-yellow-200/70 border-t border-b border-yellow-300/50`) and jagged torn edges (`mask-image` or polygon clip-path).

```tsx
// Washi Tape Component
export function WashiTape({ className = "bg-amber-200/70" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 backdrop-blur-[0.5px] shadow-sm z-10 opacity-80",
        "border-y border-white/40",
        "[clip-path:polygon(0%_15%,5%_0%,95%_0%,100%_20%,97%_85%,100%_100%,3%_95%,0%_80%)]",
        className
      )}
    />
  );
}
```

---

### 5.5 Modal Dialogs & Fasteners

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

- **Paperclipped Memo Slip**:
  - Modals appear not as rigid dark glass panes, but as a fresh manila or yellow legal memo slip clipped over the notebook.
  - Organic rotation: Fixed at $-1.2^{\circ}$ or $+1.0^{\circ}$.
  - Fastener: Realistic SVG metallic paperclip rendered over the top-left or top-center edge, casting a distinct drop shadow onto the slip.

```tsx
// Metallic Paperclip SVG Component
export function PaperclipFastener() {
  return (
    <svg
      className="absolute -top-5 left-8 w-8 h-14 z-30 drop-shadow-[1px_3px_2px_rgba(0,0,0,0.25)] pointer-events-none"
      viewBox="0 0 32 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer Loop */}
      <path
        d="M10 20 V48 C10 54 22 54 22 48 V12 C22 4 4 4 4 12 V50 C4 60 28 60 28 50 V18"
        stroke="#94a3b8"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chrome Highlight Reflection */}
      <path
        d="M10 20 V48 C10 54 22 54 22 48 V12 C22 4 4 4 4 12 V50 C4 60 28 60 28 50 V18"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-70"
      />
    </svg>
  );
}
```

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
|  | |                                                      | |  |
|  | |                                                      | |  |
|  | +======================================================+ |  |
|  |  (Leather Stitched Border / Kraft Paper Cover Texture)   |  |
|  +----------------------------------------------------------+  |
+----------------------------------------------------------------+
```

When users arrive unauthenticated, they are presented with the **Notebook Cover**:
- **Cover Material Customizer**: Household admins can configure the household's visual cover style:
  1. **Classic Moleskine**: Matte black oilcloth texture (`#1c1917`) with gold-foil stamped lettering.
  2. **Raw Kraft Notebook**: Heavy brown fiber paper (`#b89772`) with dark brown ink and stamped badge.
  3. **Tan Saddle Leather**: Rich warm brown leather (`#78350f`) with debossed perimeter stitching.
  4. **Pastel Spiral**: Soft sage mint (`#64748b` / `#94a3b8`) with silver double-loop wire binding.
- **Cover Interaction**:
  - Clicking "Open Notebook" or logging in initiates a cover-open animation (`transform: rotateY(-110deg)`), revealing the inner cream pages.

---

### 5.7 Settings & Night Journal Toggle

- **Desk Lamp Switch**:
  - The dark mode toggle is styled as a retro **Desk Lamp Pull-Chain** or **Brass Rocker Switch**.
  - Toggling illuminates or dims the desk backdrop.
- **Audio & Haptic Switches**:
  - Styled as embossed paper toggles with pen-marked check indicators.

---

## 6. Sound & Haptic Engine

Domestic tools make distinct, satisfying sounds. The app includes an **opt-in Web Audio API sound engine** that generates lightweight, procedural, zero-download audio effects.

```
+-------------------------------------------------------------------------------+
|                       PROCEDURAL WEB AUDIO ARCHITECTURE                       |
|                                                                               |
|  [ Trigger Event ]                                                            |
|         |                                                                     |
|         +---> Page Flip -----> Pink Noise Burst -> Bandpass Filter (1.2kHz)   |
|         |                                                                     |
|         +---> Rubber Stamp --> Sub Sine Oscillator (65Hz) + Noise Pop (1.8kHz)|
|         |                                                                     |
|         +---> Pencil Check --> Multi-pulse Filtered Noise Scratch (3.4kHz)    |
|         |                                                                     |
|         +---> Haptic (Mobile)-> navigator.vibrate([15, 30, 20])               |
+-------------------------------------------------------------------------------+
```

### 6.1 Audio Effects Specification

1. **Page Rustle (`playPageFlipSound`)**:
   - Synthesized using a bandpass-filtered noise burst ($800\text{Hz} - 2.8\text{kHz}$) with an exponential decay envelope ($160\text{ms}$).
   - Recreates the dry friction of turning a heavy paper sheet.
2. **Rubber Stamp Thud (`playStampSound`)**:
   - Dual-layer synthesis:
     - **Body**: $65\text{Hz}$ sine wave dropping rapidly to $30\text{Hz}$ over $75\text{ms}$ (desk impact resonance).
     - **Snap**: Short high-frequency click ($1.6\text{kHz}$) with sharp attack ($10\text{ms}$) simulating the hard rubber die.
3. **Pencil Scribble (`playPencilScribbleSound`)**:
   - Three rapid micro-pulses ($40\text{ms}$ each) of high-pass filtered white noise ($3.2\text{kHz}$), simulating graphite scratching on fibrous paper.
4. **Washi Tape Peel (`playTapePeelSound`)**:
   - Light tearing sound combining granular noise with linear frequency modulation over $120\text{ms}$.

### 6.2 Implementation Code (`soundEngine.ts`)

```typescript
// frontend/src/utils/soundEngine.ts
class StationerySoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;

  constructor() {
    // Read persisted user preference (default: off)
    this.isEnabled = localStorage.getItem('chores_sound_enabled') === 'true';
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('chores_sound_enabled', enabled ? 'true' : 'false');
    if (enabled && !this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  private getContext(): AudioContext | null {
    if (!this.isEnabled) return null;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playStampSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sub-bass thud (desk resonance)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.09);

    oscGain.gain.setValueAtTime(0.45, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);

    // Rubber slap click
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);

    // Mobile Haptic Trigger
    if ('vibrate' in navigator) {
      navigator.vibrate?.([20, 30, 25]);
    }
  }

  public playPageFlipSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.15;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.linearRampToValueAtTime(2200, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }
}

export const soundEngine = new StationerySoundEngine();
```

---

## 7. Responsive Architecture & Breakpoints

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
|  | +---------+---------+|  | +-------------------+ |  | | Swipe Gesture  | |  |
|  +-----------------------+  +-----------------------+  +-------------------+  |
+-------------------------------------------------------------------------------+
```

### 7.1 Breakpoint Specifications

#### 1. Desktop Desk Surface ($\ge 1024\text{px}$)
- **Layout**: Centered two-page spread or expansive single-page binder framed by an ambient desk surface with subtle wood grain / linen texture.
- **Left Page (Summary Ledger)**: Persistent household status dashboard, active roommate presence indicators, weekly chore progress ring, and mini calendar.
- **Right Page (Active Working Sheet)**: Primary workspace displaying the selected tab (`Appliances`, `Chores`, or `Settings`).
- **Spine**: Rendered center spiral coil or stitched gutter with deep binding shadow.

#### 2. Tablet Portrait ($768\text{px} - 1023\text{px}$)
- **Layout**: Single-page heavy binder format with prominent right-hand or top die-cut index tabs.
- **Interaction**: Fast tap navigation with full 3D page turns.

#### 3. Mobile Pocket Journal ($< 768\text{px}$)
- **Layout**: Full-bleed pocket notebook experience optimized for one-thumb reach.
- **Header**: Compact brass rivet header with household title and current member avatar badge.
- **Navigation**: Top index tabs or bottom notebook bookmark ribbon.
- **Gestures**: Horizontal touch swipe gesture support to leaf forward and backward between notebook pages.

---

## 8. Accessibility (a11y) & Standards Compliance

The paper notebook aesthetic adheres strictly to **WCAG 2.1 AA standards** to guarantee universal usability:

### 8.1 Contrast Compliance Matrix

| Foreground Element | Background Surface | Contrast Ratio | WCAG AA Status |
| :--- | :--- | :--- | :--- |
| **Ink Navy (`#1E293B`)** | Base Cream (`#FAF6EE`) | **12.8:1** | Pass (Exceeds AAA) |
| **Graphite Pencil (`#475569`)** | Base Cream (`#FAF6EE`) | **7.4:1** | Pass (AAA) |
| **Clean Stamp (`#15803D`)** | Manila Card (`#FEF7E0`) | **6.1:1** | Pass (AA) |
| **Dirty Stamp (`#B91C1C`)** | Manila Card (`#FEF7E0`) | **6.4:1** | Pass (AA) |
| **Running Stamp (`#1D4ED8`)** | Manila Card (`#FEF7E0`) | **6.9:1** | Pass (AA) |
| **Night Gel White (`#F8FAFC`)**| Night Charcoal (`#1E293B`) | **13.4:1** | Pass (AAA) |
| **Night Graphite (`#CBD5E1`)** | Night Charcoal (`#1E293B`) | **9.1:1** | Pass (AAA) |

### 8.2 Focus Indicators & Keyboard Navigation
- **Tactile Focus Rings**: Replaces standard blue browser outlines with a distinct dashed graphite pencil border:
  ```css
  :focus-visible {
    outline: 2px dashed #1e293b;
    outline-offset: 3px;
    border-radius: 2px;
  }
  .dark :focus-visible {
    outline: 2px dashed #f8fafc;
    outline-offset: 3px;
  }
  ```
- **Tablist Keyboard Support**: Full arrow-key navigation (`ArrowLeft` / `ArrowRight`) across notebook index tabs conforming to WAI-ARIA 1.2 Tablist guidelines.

### 8.3 Screen Reader Semantics
- Decorative physical artifacts (spiral rings, paperclips, washi tape strips, ruled background lines) are explicitly marked `aria-hidden="true"`.
- Rubber stamp badges use semantic status containers: `<span role="status" aria-label="Status: Clean, needs emptying">...</span>`.
- The live appliance status and chore updates broadcast state transitions to screen readers via `aria-live="polite"` regions.

---

## 9. Implementation Roadmap & Component Migration Guide

To transition the existing application from standard Tailwind styling to the Paper Notebook Design System without breaking existing functionality or tests, follow this staged migration path:

```
+-------------------------------------------------------------------------------+
|                         STAGED MIGRATION ROADMAP                              |
|                                                                               |
|  Phase 1: Foundation (Fonts, Tailwind Theme, CSS Variables, Sound Engine)     |
|       |                                                                       |
|  Phase 2: Stationery Primitives (Tabs, Cards, Stamps, Clips, Washi Tape)      |
|       |                                                                       |
|  Phase 3: Header, Page-Flip Engine & Main Shell Wrapper                       |
|       |                                                                       |
|  Phase 4: Appliance Dashboard & Rubber Stamp Integration                      |
|       |                                                                       |
|  Phase 5: Chore Duty View, Ruled Lines & Hand Scribble Checklist              |
|       |                                                                       |
|  Phase 6: Up-for-Grabs Memo Board & Modals (Paperclip Slips)                  |
|       |                                                                       |
|  Phase 7: Onboarding Cover, Settings & Dark Mode Desk Lamp                    |
|       |                                                                       |
|  Phase 8: Vitest Test Suite Updates & Accessibility Audit                      |
+-------------------------------------------------------------------------------+
```

### Phase 1: Foundation & Asset Setup
1. **Fonts**: Update `frontend/index.html` with Google Fonts preconnect and stylesheets (`Patrick Hand`, `Caveat`, `Nunito`, `JetBrains Mono`).
2. **Tailwind Config**: Extend `frontend/tailwind.config.js` with color tokens, custom box-shadows, and font families as specified in Section 2.4.
3. **Global CSS**: Enhance `frontend/src/index.css` with CSS custom properties, baseline grid ruled line classes, rubber stamp masks, and dashed focus outlines.
4. **Sound Engine**: Create `frontend/src/utils/soundEngine.ts` with procedural Web Audio API synthesis.

### Phase 2: Stationery Primitives (`frontend/src/components/stationery/`)
Create reusable, accessible stationery primitives:
- `IndexTab.tsx`: Protruding die-cut tab with active elevation.
- `PaperCard.tsx`: Cardstock memo container with subtle organic tilt and texture.
- `RubberStamp.tsx`: Distressed inked badge supporting `CLEAN`, `DIRTY`, `RUNNING`, `EMPTYING`.
- `WashiTape.tsx`: Translucent tape strip with jagged cut edges.
- `Paperclip.tsx`: Chrome wire paperclip fastener SVG.
- `ScribbleCheck.tsx`: Animated hand-drawn SVG strikethrough/checkbox.
- `SpiralSpine.tsx`: Metal wire binder coil / rivet spine element.

### Phase 3: Header & Page-Flip Integration
- Refactor `Header.tsx` to render binder spine rings and `IndexTab` dividers.
- Refactor `App.tsx` layout shell to wrap tab switching with the `PageFlip` transition container.

### Phase 4: Appliance Dashboard Refactoring
- Upgrade `ApplianceCard.tsx` to use `PaperCard` with animated `RubberStamp` badges.
- Connect one-tap state mutation buttons to the `soundEngine.playStampSound()` trigger.

### Phase 5: Chore Duty View & Checklist Refactoring
- Update `ChoreDutyView.tsx` with ruled notebook background and margin rules.
- Replace HTML checkboxes with `ScribbleCheck` components and tally marks.
- Refactor swap button into a perforated tear-off swap slip.

### Phase 6: Up-For-Grabs Pool & Modals
- Refactor `UpForGrabsPool.tsx` into a pinned post-it memo board with `WashiTape` headers.
- Update `ChoreSwapModal.tsx` and `ChoreLogModal.tsx` to render as paperclipped legal slips.

### Phase 7: Onboarding & Settings
- Refactor `Onboarding.tsx` into the interactive **Notebook Cover** with cover material selection.
- Update `SettingsView.tsx` with desk lamp night mode toggle and sound effects switch.

### Phase 8: Verification & Vitest Test Suites
- Run `npm --prefix frontend test` to verify all 47 existing test suites continue to pass.
- Add unit tests for `soundEngine.ts` and stationery component primitives.

---

## 10. Design Token Cheat Sheet (Quick Reference)

```css
/* Core Design Tokens Reference */
:root {
  /* Paper Surfaces */
  --paper-bg: #faf6ee;
  --paper-sheet: #fcfbf7;
  --paper-card: #fffdf9;
  --paper-manila: #fef7e0;
  --paper-postit: #fef9c3;
  --desk-surface: #eae4d5;

  /* Inks */
  --ink-navy: #1e293b;
  --ink-graphite: #475569;
  --ink-muted: #94a3b8;
  --rule-line: rgba(148, 163, 184, 0.35);
  --rule-margin: rgba(239, 68, 68, 0.65);

  /* Stamp Inks */
  --stamp-clean: #15803d;
  --stamp-dirty: #b91c1c;
  --stamp-running: #1d4ed8;
  --stamp-empty: #b45309;

  /* Highlighters */
  --hl-yellow: rgba(254, 240, 138, 0.65);
  --hl-green: rgba(187, 247, 208, 0.60);
  --hl-pink: rgba(254, 205, 211, 0.60);
  --hl-blue: rgba(186, 230, 253, 0.60);
  --hl-orange: rgba(254, 215, 170, 0.60);
}

.dark {
  --paper-bg: #0b1120;
  --paper-sheet: #1e293b;
  --paper-card: #283548;
  --paper-manila: #334155;
  --paper-postit: #3b4252;
  --desk-surface: #070b14;

  --ink-navy: #f8fafc;
  --ink-graphite: #cbd5e1;
  --ink-muted: #64748b;
  --rule-line: rgba(255, 255, 255, 0.08);
  --rule-margin: rgba(248, 113, 113, 0.40);

  --stamp-clean: #34d399;
  --stamp-dirty: #f87171;
  --stamp-running: #60a5fa;
  --stamp-empty: #fbbf24;
}
```

---
*End of Design Specification — Household Coordination App*
