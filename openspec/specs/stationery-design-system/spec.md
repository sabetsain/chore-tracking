# stationery-design-system Specification

## Purpose
Establishes the design tokens, typography, luxury paper materiality, multi-sensory audio, micro-haptics, and responsive layout rules for the Household Coordination App per the Paper Notebook Design System (DESIGN.md v2.1.0).

## Requirements

### Requirement: Stationery Color Palette and Theme Tokens
The frontend SHALL define and expose physical stationery CSS custom properties and Tailwind CSS color tokens for both Daytime Paper (light mode) and Night Journal (dark mode) environments.

#### Scenario: Daytime Paper theme tokens active in light mode
- **WHEN** the application is loaded in light mode
- **THEN** the base page background is `--paper-bg` (`#FAF7F0`), card surfaces use `--paper-card` (`#FAF6EE`), primary ink is `--ink-navy` (`#0F172A`), secondary ink is `--ink-graphite` (`#475569`), and margin guidelines use `--rule-margin` (`rgba(239, 68, 68, 0.65)`).

#### Scenario: Night Journal theme tokens active in dark mode
- **WHEN** the dark mode class (`.dark`) is toggled on the document root
- **THEN** the desk backdrop shifts to `--night-desk` (`#080D17`), page sheets use `--night-page` (`#1A2234`), text ink uses `--night-gel-white` (`#F8FAFC`), and stamp colors switch to high-contrast dark-mode stamp inks (`#34D399`, `#F87171`, `#60A5FA`, `#FBBF24`).

### Requirement: Editorial Typographic Hierarchy and 24px Baseline Grid
The application SHALL load `Fraunces`, `Plus Jakarta Sans`, `Caveat`, and `JetBrains Mono` via preconnected web fonts, and SHALL provide CSS ruled background utility classes locked to a 24px pitch.

#### Scenario: Ruled paper line alignment
- **WHEN** a container renders with `.notebook-ruled-surface`
- **THEN** repeating horizontal rules with a 24px line-height and a vertical 2px red margin rule guideline at 42px left offset are displayed.

#### Scenario: Typographic role mapping
- **WHEN** headings, status badges, controls, and data codes are rendered
- **THEN** view titles use `Fraunces`, rubber stamp badges use uppercase `Caveat`, buttons and body text use `Plus Jakarta Sans`, and invite/PIN codes use `JetBrains Mono`.

### Requirement: Reusable Stationery Primitives
The application SHALL provide a dedicated suite of accessible React stationery primitives in `frontend/src/components/stationery/` comprising `PaperCard`, `RubberStampBadge`, `WashiTape`, `PaperclipFastener`, `ScribbleCheckbox`, `TallyCounter`, `SpiralSpine`, and `NotebookTab`.

#### Scenario: Rubber stamp badge rendering and rotation
- **WHEN** a `RubberStampBadge` is rendered for an appliance state (`CLEAN`, `DIRTY`, `RUNNING`, `EMPTYING`)
- **THEN** it renders with an uppercase distressed border, spring drop animation, and natural rotation between -4deg and +4deg, accompanied by semantic `role="status"` accessibility attributes.

#### Scenario: Scribble checkbox strikethrough animation
- **WHEN** a user completes a single weekly chore
- **THEN** the `ScribbleCheckbox` animates a hand-drawn SVG strikethrough path with CSS stroke-dashoffset interpolation over 320ms.

#### Scenario: Continuous duty tally mark cluster rendering
- **WHEN** continuous duty chore instances are logged
- **THEN** `TallyCounter` renders individual instances as handwritten tally groups (4 vertical strokes plus a diagonal slash for 5-counts).

#### Scenario: Paperclip fastener for modals and slips
- **WHEN** a dialog modal such as `ChoreSwapModal` or `ChoreLogModal` is displayed
- **THEN** it renders as an angled paper memo slip fastened with a metallic SVG `PaperclipFastener` marked `aria-hidden="true"`.

### Requirement: Velocity-Sensitive Multi-Sensory Audio
The procedural sound engine SHALL modulate synthesized sound envelope, resonance, and filter frequencies based on user interaction velocity and action weight.

#### Scenario: Heavy action resonance modulation
- **WHEN** a user triggers a major state change (e.g. stamping an appliance dirty or running)
- **THEN** the sound engine synthesizes a deeper 65Hz desk-impact sub-bass layer and a distinct 1.6kHz rubber snap with ±5% procedural pitch jitter.

#### Scenario: Rapid sequential checkoff sound variation
- **WHEN** multiple items are checked off in quick succession
- **THEN** the sound engine dynamically modulates the noise filter cutoff and attack decay to prevent acoustic fatigue.

### Requirement: Micro-Haptic Signatures
The application SHALL emit distinct vibration signatures for key physical actions on supported mobile browsers via `navigator.vibrate`.

#### Scenario: Rubber stamp drop haptic pulse
- **WHEN** an appliance state transition stamp is dropped
- **THEN** the device triggers a double-thud vibration pattern `[20, 40, 30]`.

#### Scenario: Pencil checkbox toggle haptic tick
- **WHEN** a chore duty checkbox is completed
- **THEN** the device triggers a crisp single micro-tick vibration `[12]`.

### Requirement: Zero-Latency Optimistic UI Mutations
The application SHALL apply state transitions to local UI and audio layers immediately at 0ms latency prior to server roundtrip confirmation.

#### Scenario: Optimistic appliance state advancement
- **WHEN** a user taps to change an appliance state
- **THEN** the rubber stamp immediately animates down, sound/haptics fire instantly, and the query cache updates optimistically with automatic rollback on network failure.
