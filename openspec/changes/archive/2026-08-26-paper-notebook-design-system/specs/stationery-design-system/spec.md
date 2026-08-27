## ADDED Requirements

### Requirement: Stationery Color Palette and Theme Tokens
The frontend SHALL define and expose physical stationery CSS custom properties and Tailwind CSS color tokens for both Daytime Paper (light mode) and Night Journal (dark mode) environments.

#### Scenario: Daytime Paper theme tokens active in light mode
- **WHEN** the application is loaded in light mode
- **THEN** the base page background is `--paper-bg` (`#FAF6EE`), card surfaces use `--paper-card` (`#FFFDF9`), primary ink is `--ink-navy` (`#1E293B`), secondary ink is `--ink-graphite` (`#475569`), and margin guidelines use `--rule-margin` (`rgba(239, 68, 68, 0.65)`).

#### Scenario: Night Journal theme tokens active in dark mode
- **WHEN** the dark mode class (`.dark`) is toggled on the document root
- **THEN** the desk backdrop shifts to `--night-desk` (`#0B1120`), page sheets use `--night-page` (`#1E293B`), text ink uses `--night-gel-white` (`#F8FAFC`), and stamp colors switch to high-contrast dark-mode stamp inks (`#34D399`, `#F87171`, `#60A5FA`, `#FBBF24`).

### Requirement: Typographic Hierarchy and 24px Baseline Grid
The application SHALL load `Patrick Hand`, `Caveat`, `Nunito Sans`, and `JetBrains Mono` via preconnected web fonts, and SHALL provide CSS ruled background utility classes locked to a 24px pitch.

#### Scenario: Ruled paper line alignment
- **WHEN** a container renders with `.notebook-ruled-surface`
- **THEN** repeating horizontal rules with a 24px line-height and a vertical 2px red margin rule guideline at 42px left offset are displayed.

#### Scenario: Typographic role mapping
- **WHEN** headings, status badges, and data codes are rendered
- **THEN** view titles use `Patrick Hand`, rubber stamp badges use uppercase `Caveat`, body text uses `Nunito Sans`, and invite/PIN codes use `JetBrains Mono`.

### Requirement: Reusable Stationery Primitives
The application SHALL provide a dedicated suite of accessible React stationery primitives in `frontend/src/components/stationery/` comprising `PaperCard`, `RubberStampBadge`, `WashiTape`, `PaperclipFastener`, `ScribbleCheckbox`, `TallyCounter`, `SpiralSpine`, and `NotebookTab`.

#### Scenario: Rubber stamp badge rendering and rotation
- **WHEN** a `RubberStampBadge` is rendered for an appliance state (`CLEAN`, `DIRTY`, `RUNNING`, `EMPTYING`)
- **THEN** it renders with an uppercase distressed border and a natural rotation between -4deg and +4deg, accompanied by semantic `role="status"` accessibility attributes.

#### Scenario: Scribble checkbox strikethrough animation
- **WHEN** a user completes a single weekly chore
- **THEN** the `ScribbleCheckbox` animates a hand-drawn SVG strikethrough path with CSS stroke-dashoffset interpolation over 320ms.

#### Scenario: Continuous duty tally mark cluster rendering
- **WHEN** continuous duty chore instances are logged
- **THEN** `TallyCounter` renders individual instances as handwritten tally groups (4 vertical strokes plus a diagonal slash for 5-counts).

#### Scenario: Paperclip fastener for modals and slips
- **WHEN** a dialog modal such as `ChoreSwapModal` or `ChoreLogModal` is displayed
- **THEN** it renders as an angled paper memo slip fastened with a metallic SVG `PaperclipFastener` marked `aria-hidden="true"`.

### Requirement: Lightweight CSS 3D Page Turn Engine
The application SHALL provide a hardware-accelerated CSS 3D page turn transition when navigating between primary notebook tabs without requiring external WebGL or Three.js dependencies.

#### Scenario: Switching tabs with CSS 3D page flip
- **WHEN** the user switches between `Appliances`, `Chores`, and `Settings` tabs
- **THEN** the main viewport executes a 3D horizontal `rotateY` page turn using `perspective: 1400px` and a 380ms `cubic-bezier(0.25, 1, 0.5, 1)` easing.

#### Scenario: Reduced motion accessibility compliance
- **WHEN** the user agent has `prefers-reduced-motion: reduce` enabled
- **THEN** 3D page rotations and perspective transforms are disabled and replaced with instantaneous transitions or a 120ms opacity fade.

### Requirement: Procedural Web Audio Sound Engine
The application SHALL provide a procedural Web Audio API engine (`soundEngine.ts`) capable of synthesizing zero-download sound effects (stamp thud, page flip rustle, pencil scribble) with an opt-in toggle persisted in local storage.

#### Scenario: Sound synthesis when audio enabled
- **WHEN** sound effects are enabled in settings and an appliance state changes or a tab switches
- **THEN** the sound engine synthesizes the corresponding sound wave via procedural Web Audio oscillators and filtered noise buffers without downloading external audio files.

#### Scenario: Total silence when audio disabled
- **WHEN** sound effects are disabled (the default state)
- **THEN** no Web Audio context is initialized or invoked upon user interactions.

### Requirement: Interactive Component Presentation & Functional Integrity
All existing core views (`Header`, `ApplianceDashboard`, `ChoreDutyView`, `UpForGrabsPool`, `Onboarding`, `SettingsView`) SHALL adopt the Paper Notebook visual styling while preserving 100% of their existing React Query mutations, WebSocket listeners, Web Push subscriptions, and Vitest test assertions.

#### Scenario: 1-tap appliance state advancement with stamp animation
- **WHEN** a user taps the 1-tap state mutation button on an `ApplianceCard`
- **THEN** the backend mutation is dispatched, live WebSocket updates are received, and the `RubberStampBadge` animates with a stamp-thud impact.

#### Scenario: Interactive Notebook Cover onboarding
- **WHEN** an unauthenticated user arrives at the `Onboarding` view
- **THEN** the view presents an interactive book cover with Moleskine, Kraft, and Leather cover material options, a desk lamp dark mode pull-chain, and tabbed forms for Join House, Create House, and Log In.
