## Why

The current web app user interface relies on a literal "paper notebook" skeuomorphic theme (ruled 24px background lines, faux red margin guides, brass spiral rings, paperclip fasteners, washi tape strips, and cursive `Caveat` rubber stamps). While tactile, this introduces significant visual clutter, competes with primary chore and appliance status scanning, and clashes with modern mobile-first usability standards (such as Fitts's law, <200ms scan times, and clean digital hierarchy).

Following an extensive exploration of graphic design history (Swiss grid, Bauhaus functionalism), UX philosophies (Dieter Rams' radical omission, Naoto Fukasawa's instinctive design, Don Norman's button affordances), and contemporary case studies (NotR's domestic logistics, Phillips Print's community of marks), we are modernizing the UI. The revamp establishes a warm, anti-glare minimalist canvas with ample negative space, combined with playful, geometric "stamps and stickers" celebrating the community of shared domestic living.

## What Changes

- **Deprecation of Skeuomorphic Props**: Completely remove 24px ruled background lines (`.notebook-ruled-surface`), vertical red margin guides (`.notebook-margin-guide`), brass spiral binder rings (`SpiralSpine`), washi tape strips (`WashiTape`), faux paperclips (`PaperclipFastener`), and cursive handwriting fonts (`Caveat`).
- **Warm Anti-Glare Palette (60-30-10 Rule)**:
  - 60% Canvas Ground: Warm Oatmeal / Linen (`#F4EFEA`) with Soft Milk / Porcelain cards (`#FDFAF6`). No stark digital white (`#FFFFFF`).
  - 30% Structural Neutrals: Deep Charcoal Umber (`#1E232B`) and Muted Stone hairlines (`#E3DDD5`).
  - 10% Toned Complementary Accents: Terracotta Rust (`#C25E3E`) + Muted Slate Blue (`#3B5B75`), Earthy Sage (`#436A54`) + Soft Clay Rose (`#B06573`), Honey Ochre (`#D9822B`) + Deep Indigo (`#283654`).
  - Warm "Night Journal" Dark Mode: Deep Espresso ground (`#141312`) with Roasted Walnut cards (`#1F1D1A`) and warm Amber-Stone borders (`#2E2A26`).
- **Tactile Component Primitives**:
  - `StatusStamp`: Crisp, single-color inked impression directly on the card surface (no solid background pill), framed by a double or dashed border with subtle organic tilt (±1.5°), signaling appliance/chore state.
  - `IdentitySticker`: Simple, human-crafted geometric shapes with fluid organic contours placed at natural subtle angles (±2°), providing roommate avatars and domestic chore category glyphs.
- **Interaction Ergonomics & 4-State Buttons**:
  - Unmistakable separation of Output Stamps (non-clickable status seals) vs. Input Buttons (elevated solid action triggers).
  - Full-width mobile-friendly touch targets (`min-h-[46px]`, `w-full`) in the natural thumb sweep zone.
  - 4 explicit states: Resting, Hover/Focus micro-lift, Active/Pressed physical depression (`translate-y-[1px]`), and Disabled/Loading spinner.
  - Real-world domestic action verbs: "Start Cycle", "Mark Clean", "Mark Emptied", "Claim Duty".
- **Zero-Dependency Web Audio Micro-Feedback**:
  - Synthesize a subtle, organic wood-block / paper-snap click (~80ms) on primary completions via the browser Web Audio API, with an instantaneous mute toggle.
- **Contemporary Typographic Hierarchy**:
  - Adopt high-legibility geometric sans (`Plus Jakarta Sans` / `Space Grotesk`) across all headings, controls, and body copy, paired with tabular numbers (`JetBrains Mono`) for stamps, wattages, and timers.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `stationery-design-system`: Overhaul design tokens from skeuomorphic paper/notebook to warm minimalist functionalism, replace cursive stamps and paper fasteners with `StatusStamp` and `IdentitySticker` primitives, integrate the 4-state button affordance model, and replace external procedural sound files with zero-dependency Web Audio click synthesis.

## Impact

- **Frontend**:
  - `frontend/src/index.css`: Replace CSS variables with the new 60-30-10 palette, remove `.notebook-ruled-surface` and `.notebook-margin-guide`, add status stamp and identity sticker styles.
  - `frontend/src/components/stationery/`: Deprecate `SpiralSpine`, `WashiTape`, `PaperclipFastener`; create `StatusStamp.tsx` and `IdentitySticker.tsx`; update `PaperCard.tsx` to warm porcelain surface without fake deckle/paperclip artifacts.
  - `frontend/src/utils/soundEffects.ts`: Implement Web Audio oscillator/noise synthesis for ~80ms wood-block tap.
  - `frontend/src/components/ApplianceCard.tsx`: Update to clean card architecture with `StatusStamp`, full-width 4-state action button, and tabular timer figures.
  - `frontend/src/components/ChoreDutyView.tsx`: Integrate `IdentitySticker` avatars, clear action buttons, and active negative space.
  - `frontend/src/components/Header.tsx`: Modernize header layout, add quick audio mute toggle.
- **Testing & Verification**:
  - Vitest test suite update for all modernized stationery components, button states, and dashboard views.
