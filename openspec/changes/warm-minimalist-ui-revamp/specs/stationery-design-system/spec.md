# stationery-design-system Specification Delta

## Purpose
Modernizes the Household Coordination App design system from skeuomorphic paper notebook styling to warm minimalist functionalism, rooted in color wheel harmony, intentional negative space, tactile status stamps, community identity stickers, and ergonomic button interaction psychology.

## Requirements

### Requirement: 60-30-10 Warm Anti-Glare Color Palette
The frontend SHALL expose calibrated CSS custom properties for Daytime Warm Linen and Night Journal environments, enforcing the 60-30-10 distribution rule without pure `#FFFFFF` digital glare.

#### Scenario: Daytime Warm Linen tokens active in light mode
- **WHEN** the application is loaded in default light mode
- **THEN** the base canvas background is `--canvas-bg` (`#F4EFEA`), elevated cards use `--canvas-card` (`#FDFAF6`), primary ink is `--ink-primary` (`#1E232B`), and borders use `--border-stone` (`#E3DDD5`).

#### Scenario: Night Journal tokens active in dark mode
- **WHEN** the dark mode class (`.dark`) is toggled on the document root
- **THEN** the base canvas shifts to deep espresso `--canvas-bg` (`#141312`), cards use roasted walnut `--canvas-card` (`#1F1D1A`), and borders use warm amber-stone `--border-stone` (`#2E2A26`).

#### Scenario: Toned complementary accents for status signaling (Sage & Slate Navy)
- **WHEN** dynamic states are rendered
- **THEN** running cycles and primary action triggers use refined slate navy (`#28415C`), clean/success states use calming sage green (`#3E6B52`), reset/dirty states use muted crimson (`#9B3B42`), and orange and purple hues are omitted.

### Requirement: Intentional Negative Space and Seamless Unified Canvas
The application SHALL provide generous active white space (minimum 24px-32px section separation, 16px-24px card padding), SHALL render on a seamless unified canvas without vertical side borders (`border-x`) or artificial desk margin shading, and SHALL NOT render ruled notebook lines (`.notebook-ruled-surface`), faux red margin lines, spiral spines, or washi tape strips.

#### Scenario: Clean card rendering on seamless canvas
- **WHEN** the dashboard, appliance cards, or chore items render
- **THEN** they render on soft porcelain card surfaces bounded by 1px muted stone hairlines floating naturally over the seamless canvas ground without vertical side border lines or desk margin shading.

### Requirement: StatusStamp Primitive for System State Output
The frontend SHALL provide a dedicated `StatusStamp` component for rendering dynamic appliance and duty states.

#### Scenario: StatusStamp visual attributes
- **WHEN** a `StatusStamp` is rendered for an appliance state (`CLEAN`, `DIRTY`, `RUNNING`, `NEEDS EMPTYING`)
- **THEN** it renders with an un-filled transparent interior, a 1.5px dashed or double border matching the state accent color, uppercase tabular monospace typography, and a subtle rotational angle within ±1.5°.

#### Scenario: StatusStamp state transition animation
- **WHEN** an appliance state transitions
- **THEN** the stamp animates with an 180ms scale pulse (`scale(1.04) -> scale(1.0)`) and semantic `role="status"` accessibility attributes.

### Requirement: IdentitySticker Primitive for Roommates and Chores
The frontend SHALL provide an `IdentitySticker` component representing roommate avatars and domestic chore categories.

#### Scenario: Roommate avatar sticker display
- **WHEN** an active roommate is displayed in chore duties or appliance history logs
- **THEN** their selected domestic glyph sticker (e.g., ☕, 🌿, 🐱, ☀️) renders with a rounded die-cut border, subtle micro-shadow, and a natural rotational tilt within ±2°.

### Requirement: 4-State Ergonomic Button System
All primary action buttons on appliance and chore cards SHALL satisfy Fitts's law touch ergonomics and provide immediate 4-state sensory feedback.

#### Scenario: Primary button mobile thumb affordance
- **WHEN** rendered on an appliance card
- **THEN** the action button spans the full width of the card's lower boundary (`w-full`) with a minimum height of 46px and an explicit domestic verb label (e.g., "Start Cycle", "Mark Emptied").

#### Scenario: Button tactile depression on tap
- **WHEN** a user taps an action button
- **THEN** the button immediately depresses (`translate-y-[1px]`), collapses its contact shadow, triggers an 80ms synthesized wood-block click, and disables pointer events while awaiting API resolution.

### Requirement: Zero-Dependency Web Audio Synthesizer
The application SHALL synthesize subtle organic acoustic micro-feedback using the browser Web Audio API without downloading external audio files.

#### Scenario: Audio click on primary completion
- **WHEN** an appliance state change or chore completion occurs and audio is unmuted
- **THEN** the sound engine synthesizes an ~80ms triangle-wave pitch decay impulse (140Hz to 40Hz) with exponential gain decay.

#### Scenario: Audio muting control
- **WHEN** a user toggles mute in the header or settings
- **THEN** all audio synthesis is suppressed without impacting visual state transitions.
