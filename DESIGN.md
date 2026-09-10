# Household Coordination App — Design System Specification

> **Status**: Living Design System Specification (Rooted in UX & Graphic Design Principles)  
> **Philosophy**: Warm Minimalist Functionalism with Playful Geometric Tactility  
> **Key Influences**: Don Norman & IxDF (Interaction Design & Affordance Psychology), Dieter Rams (Functionalism), Naoto Fukasawa (Instinctive Design), Josef Müller-Brockmann (Swiss Grid & Negative Space), Phillips Print & NotR (Community of Marks & Domestic Motion)  
> **Target Platform**: Responsive Web & Mobile PWA (iOS / Android / Desktop / Kitchen Kiosk)  

---

## 1. Core Vision & Design Philosophy

Domestic life is collaborative, physical, and shared. Managing chores, appliance states, and roommate responsibilities should never feel like navigating cold corporate project management software (Jira/Asana), nor should it be burdened with nostalgic, skeuomorphic desk clutter.

This design system establishes a **warm, minimalist functionalist canvas** enriched with **graphic, geometric "stamps and stickers"** that celebrate the community of living together.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE FIVE CORE PRINCIPLES                          │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ Principle                     │ Practical Application in the UI             │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 1. Instinctive Utility        │ "Without a thought" (Naoto Fukasawa). State │
│                               │ is grasped in <200ms. A roommate in a hurry │
│                               │ knows immediately if the washer is free.    │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 2. Radical Omission           │ "Omit everything superfluous so the         │
│                               │ essential is shown to best advantage" (Rams)│
│                               │ No fake spirals, washi tape, or lined paper.│
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 3. Active Negative Space      │ Generous breathing room (UIC Principles).    │
│                               │ White space is an active design element that│
│                               │ prevents cognitive overload and eye fatigue.│
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 4. Tonal Color Equilibrium    │ Rigorous color wheel harmony (60-30-10).    │
│                               │ Warm, anti-glare canvas with controlled,    │
│                               │ toned complementary accents. Never clashing.│
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 5. Community of Marks         │ Playful, modular identity (Phillips Print). │
│                               │ Expressive geometric stickers and tactile   │
│                               │ stamps bring warmth, agency, and celebration│
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 2. Spatial Architecture & Layout Principles

### 2.1 The "Quiet Canvas" Rule
The page acts as a quiet, architectural plane. Visual noise is minimized so that functional status indicators and interactive elements stand out clearly.

- **No Skeuomorphic Clutter**: Eliminate simulated notebook lines (ruled grids), paper margins, brass spiral bindings, washi tape strips, and paperclip props.
- **Generous Gutters & Margins**: Use intentional spacing tokens:
  - **Component Breathing Room**: Minimum `24px` to `32px` vertical separation between major dashboard sections.
  - **Card Padding**: Generous internal whitespace (`16px` on mobile, `24px` on desktop) ensuring content does not feel pinched against borders.
- **Scanning Rhythm**: Align primary labels, titles, and actions along strict left-aligned vertical axes (Swiss grid). Avoid centered text blocks except for isolated modal confirmations.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SPATIAL HIERARCHY SCHEMATIC                        │
└─────────────────────────────────────────────────────────────────────────────┘

  HOUSEHOLD // 42 BEACON                                        [● 3 AT HOME]
  ───────────────────────────────────────────────────────────────────────────
  
  ( 32px Active Negative Space )
  
  APPLIANCES (3)                                            [ + ADD APPLIANCE ]
  ┌─────────────────────────────────┐     ┌─────────────────────────────────┐
  │ DISHWASHER                      │     │ WASHING MACHINE                 │
  │                                 │     │                                 │
  │   [ ▰ C L E A N ▰ ]             │     │   [ ▰ R U N N I N G ▰ ]         │
  │   Finished 25m ago              │     │   38 min remaining              │
  │   Emptied by: Sam (☕)          │     │   Started by: Maya (🌿)         │
  │                                 │     │                                 │
  │   ┌─────────────────────────┐   │     │   ┌─────────────────────────┐   │
  │   │   [ MARK AS EMPTY ]     │   │     │   │     [ VIEW CYCLE ]      │   │
  │   └─────────────────────────┘   │     │   └─────────────────────────┘   │
  └─────────────────────────────────┘     └─────────────────────────────────┘

  ( 40px Active Negative Space )

  DUTY ROTATION // WEEK 37                                    [ + ADD CHORE ]
  ───────────────────────────────────────────────────────────────────────────
  
  [STICKER: 🧽]  Kitchen Counters         Maya (🌿)     [ TAP TO COMPLETE ]
  
  [STICKER: ♻]   Take Out Recycling       Alex (Away)   [ CLAIM POOL ]
  
  [STICKER: 🪴]  Water Balcony Plants     Sam (☕)      [ COMPLETED ● ]
```

### 2.2 Mobile-First Touch Ergonomics
- **Touch Target Minimums**: Every interactive surface must measure at least `44x44px` with clear visual affordances.
- **Thumb Zone Optimization**: Primary action triggers (e.g. cycle completion, state change, claim duty) sit within the lower half of viewport cards.
- **Reading Constraints**: Text line lengths are strictly bounded between `45` and `75` characters to prevent horizontal eye fatigue.

---

## 3. Color Harmony & Wheel Theory

The palette avoids optical vibration, chromatic clash, and 50/50 visual competition by adopting the **60-30-10 Dominance Rule** with **toned and tinted complements**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE 60 - 30 - 10 COLOR PROPORTIONS                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ██████████████████████████████  60% Canvas Ground (Warm Oatmeal / Linen)   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓               30% Structural Neutrals (Charcoal / Stone) │
│  ▒▒▒▒▒                           10% Tactile Accents (Stamps & Stickers)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Color Palette Values

#### 60% Dominant Canvas Ground (Warm & Anti-Glare)
Stark digital `#FFFFFF` is deliberately omitted to prevent clinical glare and maintain hospitality:
- **Light Canvas Ground**: `#F4EFEA` (Warm Oatmeal / Unbleached Linen)
- **Light Elevated Card Surface**: `#FDFAF6` (Soft Milk / Porcelain)
- **Dark Canvas Ground ("Night Journal")**: `#141312` (Deep Espresso / Obsidian)
- **Dark Elevated Card Surface**: `#1F1D1A` (Roasted Walnut / Deep Charcoal)

#### 30% Structural Neutrals
Crisp, authoritative typography and subtle structural framing:
- **Primary Ink**: `#1E232B` (Warm Deep Charcoal) / `#F1F5F9` (Dark Mode Ink)
- **Secondary Graphite**: `#505A69` (Muted Slate Lead) / `#94A3B8` (Dark Mode Muted)
- **Border / Divider Rule**: `#E3DDD5` (Muted Stone Hairline) / `#2E2A26` (Dark Mode Amber-Stone)

#### 10% Tactile Complementary Accents (Sage Green & Slate Navy Palette)
All accents are **toned** (mixed with a percentage of neutral slate) rather than raw 100% neon hues to eliminate chromatic vibration. Orange, terracotta, purple, and indigo are deliberately omitted in favor of a calming, focused domestic atmosphere:

| Semantic Role | Accent Color | Tone Values (Hex) | Optical Function |
| :--- | :--- | :--- | :--- |
| **Running State / Primary Action** | **Refined Slate Navy** | Navy: `#28415C`<br>Dark: `#5B8CB9` | Authoritative, calm maritime slate navy; anchors active cycles, "+ Add" actions, and primary triggers without aggressive chromatic glare. |
| **Clean State / Success** | **Earthy Sage Green** | Sage: `#3E6B52`<br>Dark: `#52B788` | Organic earthy sage; conveys clean status and completion with calm domestic satisfaction. |
| **Attention / Notice / Claim** | **Warm Sand / Muted Slate** | Stone: `#64748B`<br>Sand: `#D5CEBF` | Understated neutral accents for pool duties and badge indicators. |
| **Dirty State / Reset** | **Muted Crimson Slate** | Crimson: `#9B3B42`<br>Dark: `#FB7185` | Restrained soft crimson for appliances needing care or destructive actions. |

### 3.2 Rules for Preventing Color Clashing
1. **No Orange, Ochre, Purple, or Vibrant Indigo**: Maintain visual peace through slate navy, sage green, and warm stone neutrals.
2. **One Accent Dominates per Card**: Each card or module features exactly one dominant semantic accent. If an appliance is *Running*, slate navy is the hero; supporting labels remain graphite or stone.
3. **No Pure Black (`#000000`) or Pure White (`#FFFFFF`)**: Use nuanced, warm-undertone darks (`#1E232B` / `#111418`) and milks (`#FDFAF6`).

---

## 4. The Component Metaphor: Stamps & Stickers

The user interface balances rigorous layout order with two distinct, playful tactile primitives: **Status Stamps** and **Identity Stickers**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STAMPS VS. STICKERS SPECIFICATION                      │
├──────────────────────────────────┬──────────────────────────────────────────┤
│ Object Primitive                 │ Visual Attributes & Interaction Model    │
├──────────────────────────────────┼──────────────────────────────────────────┤
│ 1. THE STATUS STAMP              │ • Crisp, single-color inked impression   │
│    (Functional, Mechanical Seal) │   directly on the card (no solid pill).  │
│                                  │ • Monospaced or bold geometric type.     │
│   ┌──────────────────────────┐   │ • Crisp dashed or double border (1.5px). │
│   │ ▰▰▰  C L E A N  ▰▰▰      │   │ • Subtle organic rotational tilt (±1.5°).│
│   └──────────────────────────┘   │ • Communicates state cycle changes with  │
│                                  │   a momentary scale pulse animation.     │
├──────────────────────────────────┼──────────────────────────────────────────┤
│ 2. THE IDENTITY STICKER          │ • Simple, human-crafted geometric shapes │
│    (Playful, Modular, Community) │   with fluid organic contours.           │
│                                  │ • Placed at natural subtle angles (±2°). │
│    ╭──────────────╮              │ • Simple colors, unencumbered by detail. │
│    │  (•‿•) MAYA  │              │ • Curated domestic glyphs & avatars:     │
│    ╰──────────────╯              │   [☕ Mug, 🌿 Plant, 🐱 Cat, ☀️ Sun, etc.]  │
│    ╭──────────────╮              │ • Roommates choose their sticker avatar  │
│    │  [🧽 Sinks]  │              │   to mark claimed chores and audit logs. │
│    ╰──────────────╯              │ • Die-cut silhouette with subtle shadow. │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 5. Interaction Design, Affordances & Button Psychology
*(Rooted in Don Norman's "Design of Everyday Things" & IxDF Human-Centered Interaction)*

Intuitive software does not force users to ponder whether an element is clickable. It creates an unmistakable sensory conversation between the user's intent and the system's reaction.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE INTERACTION FEEDBACK LOOP                         │
└─────────────────────────────────────────────────────────────────────────────┘

  USER INTENTION                  AFFORDANCE & SIGNIFIER             EXECUTION (TAP)
  ──────────────                  ──────────────────────             ───────────────
  "Washer finished;          ➔   Solid, elevated button        ➔   Depression (-1px),
   need to unload it."            labeled "Mark Emptied"             Web Audio snap (80ms),
                                  with thumb-reach span              light haptic pulse
                                                                            │
                                                                            ▼
  EVALUATION & REWARD             INSTANT FEEDBACK (50ms)            TRANSITION (180ms)
  ───────────────────             ───────────────────────            ──────────────────
  Appliance returns to       ▲   Loading spinner on icon,      ▲   Old stamp slides out;
  [EMPTY] stamp; button           disables double-taps to            new stamp pulses in;
  anticipates "Start Cycle"       prevent race conditions            audit log updates
```

### 5.1 Signifiers vs. Affordances: Output Stamps vs. Input Buttons
A cardinal sin in UX is creating visual ambiguity between **state displays** and **action triggers**:
- **Status Stamps are OUTPUTS**: They display where the system *is*. They use a dashed/double border with a transparent interior, directly stamped onto the paper card. They do **not** look like buttons.
- **Action Triggers are INPUTS**: They trigger where the system *goes*. They possess solid background fills, raised contact shadows (`shadow-[0_2px_0_rgba(30,35,43,0.12)]`), uppercase sans typography, and prominent tap boundaries.

### 5.2 The 4 States of Every Button
Every interactive button must visibly report its state to eliminate user hesitation:
1. **Resting (Default)**: Full contrast, clear affordance, high-visibility label with an active verb.
2. **Hover / Focus**: Micro-lift (`translate-y-[-1px]`), intensified contact shadow, clear focus ring for keyboard navigation (`ring-2 ring-accent-slate`).
3. **Active / Pressed**: Immediate tactile depression (`translate-y-[1px]`, zero shadow) simulating a physical microswitch.
4. **Disabled / Loading**: `pointer-events: none`, `opacity: 0.65`, with a clean spinner replacing or accompanying the icon to prevent duplicate rapid-fire taps.

### 5.3 Fitts's Law & Touch Ergonomics
- **Full-Width Bottom Rails**: On appliance and chore cards, the primary action button spans the full width of the card's lower boundary (`w-full`, `min-h-[46px]`), positioning the tap target within effortless mobile thumb sweep range.
- **Hierarchy of Actions**:
  - **Primary Action**: Solid filled button using the semantic accent (e.g. Terracotta `#C25E3E` for active cycles, Sage `#436A54` for completions).
  - **Secondary Action**: Outlined stone button (`border border-border-stone text-ink-primary hover:bg-canvas-bg`) for history views, duty swaps, or details.
  - **Destructive Action**: Muted Crimson outline with a confirmation modal barrier to avoid irreversible domestic errors.
- **Clear Physical Verbs**: Buttons never use vague labels ("Submit", "OK", "Action"). They employ real-world domestic verbs: *"Start Cycle"*, *"Mark Clean"*, *"Mark Emptied"*, *"Claim Duty"*, *"Complete Chore"*.

---

## 6. Sensory & Audio Feedback Principles

To enrich the sense of physical accomplishment without becoming annoying:
- **Scope**: Reserved exclusively for primary accomplishments (completing a chore, changing an appliance cycle, claiming an up-for-grabs duty).
- **Implementation**: Synthesized dynamically on-the-fly via the browser **Web Audio API** (zero external assets to download, zero latency).
- **Acoustic Character**: A short (~80ms), organic wood-block click or paper snap. No synthetic chimes or beeps.
- **Controls**: A quick-toggle mute icon in the header and household settings.
- **Haptics**: On mobile devices supporting the Vibration API, trigger a light haptic tick (`15ms`) on primary completions.

---

## 7. Typography & Information Hierarchy

Typography serves as the primary navigation and structure of the app:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TYPOGRAPHIC HIERARCHY                              │
├─────────────────┬──────────────────────┬─────────────┬──────────────────────┤
│ Level           │ Font Family          │ Weight/Size │ Intended Use         │
├─────────────────┼──────────────────────┼─────────────┼──────────────────────┤
│ Primary Headings│ Plus Jakarta Sans /  │ Bold (700)  │ Household name, page │
│                 │ Space Grotesk        │ 24px - 28px │ section titles       │
├─────────────────┼──────────────────────┼─────────────┼──────────────────────┤
│ Section Labels  │ Plus Jakarta Sans    │ Med (500)   │ Appliance names,     │
│                 │                      │ 16px - 18px │ chore titles         │
├─────────────────┼──────────────────────┼─────────────┼──────────────────────┤
│ Body & Notes    │ Plus Jakarta Sans    │ Reg (400)   │ Descriptions, member │
│                 │                      │ 14px - 15px │ status, swap notes   │
├─────────────────┼──────────────────────┼─────────────┼──────────────────────┤
│ Stamps & Codes  │ JetBrains Mono /     │ Bold (700)  │ State stamps, cycle  │
│                 │ Space Mono           │ 11px - 13px │ timers, invite codes │
└─────────────────┴──────────────────────┴─────────────┴──────────────────────┘
```

- **Numbers & Counters**: Always render durations, wattages, dates, and scores with **tabular figures** (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter when values update in real time.
- **Case Sensitivity**: Headings use natural Title Case; stamps and status codes use uppercase with generous letter-spacing (`tracking-wider` / `+0.08em`).
- **Complete Retirement**: Fully retire `Fraunces` serif and `Caveat` handwriting script to achieve a modern, contemporary, high-legibility interface.

---

## 8. Migration & Implementation Instructions

When modernizing existing components in `frontend/src`:

### 8.1 Elements to Deprecate & Remove
- Remove `.notebook-ruled-surface` and horizontal `24px` gradient rules.
- Remove `.notebook-margin-guide` red left-margin line.
- Remove `SpiralSpine.tsx` brass ring bindings.
- Remove `WashiTape.tsx` tape strips across headers and modals.
- Remove `PaperclipFastener.tsx` faux metallic clips.
- Replace cursive `Caveat` rubber stamp fonts with crisp, geometric uppercase type.

### 8.2 Elements to Adopt & Standardize
- Adopt the **Sage Green & Slate Navy palette** in `index.css` via custom CSS variables:
  - `--canvas-bg: #F5F3EF` (Seamless Warm Linen)
  - `--canvas-card: #FDFAF6` (Soft Milk / Porcelain)
  - `--ink-primary: #1E232B` (Warm Charcoal)
  - `--border-stone: #E2DDD5` (Muted Stone Hairline)
  - `--accent-slate: #28415C` (Slate Navy for primary actions and running cycles)
  - `--accent-sage: #3E6B52` (Sage Green for clean states and completions)
  - `--accent-crimson: #9B3B42` (Muted Crimson for dirty and reset states)
  - (Aliases `--accent-terracotta` and `--accent-indigo` point to Slate Navy; `--accent-ochre` points to Sage Green).
- Adopt the **Seamless Unified Canvas**:
  - Eliminate outer sheet borders (`border-x`, `border-b`) and desk gutter drop-off shading on the sides of the viewport.
  - Structure the top navigation inside an integrated, floating header card with natural tactile segmented tabs.
- Implement a zero-dependency Web Audio synthesizer utility (`soundEffects.ts`) for the 80ms wood-block/paper snap.
- Introduce a standardized `StatusStamp` component for appliance & duty state badges with subtle rotation and crisp dashed/double borders.
- Introduce an `IdentitySticker` component for roommate avatars, duty tags, and reward badges with fluid organic contours and natural rotational angles.
- Implement the **4-state button system** in `ApplianceCard`, `ChoreDutyView`, and modals with full-width thumb ergonomics, physical depression on tap, and clear domestic action verbs.
