# Implementation Tasks: Warm Minimalist UI Revamp

## Phase 1: Design Tokens & CSS Overhaul
- [x] 1.1 Update `frontend/src/index.css` with the 60-30-10 palette variables (`--canvas-bg`, `--canvas-card`, `--ink-primary`, `--border-stone`, and toned accent pairs) for both light and dark modes.
- [x] 1.2 Deprecate and remove `.notebook-ruled-surface`, `.notebook-margin-guide`, and cursive font declarations from `index.css`.
- [x] 1.3 Verify typography imports in `index.html` load `Plus Jakarta Sans` and `JetBrains Mono`, removing `Caveat` and `Fraunces`.

## Phase 2: Core Components & Audio Synthesis (TDD)
- [x] 2.1 Write unit tests for Web Audio synthesizer in `frontend/src/utils/soundEffects.test.ts`.
- [x] 2.2 Implement zero-dependency `soundEffects.ts` with 80ms wood-block impulse and mute toggle.
- [x] 2.3 Write component unit tests for `StatusStamp.tsx` verifying dashed/double borders, uppercase monospace type, rotation, and accessibility roles.
- [x] 2.4 Implement `frontend/src/components/stationery/StatusStamp.tsx`.
- [x] 2.5 Write component unit tests for `IdentitySticker.tsx` verifying die-cut styling, organic glyph rendering, and rotational tilt.
- [x] 2.6 Implement `frontend/src/components/stationery/IdentitySticker.tsx`.
- [x] 2.7 Update `PaperCard.tsx` to render clean soft porcelain surface (`#FDFAF6`), 1px stone hairline border, and remove faux paperclip/spiral anchor points.

## Phase 3: Appliance & Chore View Modernization
- [x] 3.1 Update `ApplianceCard.tsx`:
  - Integrate `StatusStamp` for state visualization.
  - Implement full-width 4-state action button with explicit domestic verbs ("Start Cycle", "Mark Clean", "Mark Emptied").
  - Connect audio click feedback on state advancement.
  - Display actor identity sticker in audit trail.
- [x] 3.2 Update `ChoreDutyView.tsx`:
  - Replace handwritten tally/strikethrough artifacts with clean modern checkoff interaction.
  - Display roommate `IdentitySticker` avatars alongside chore assignments.
  - Apply generous 24px-32px section negative space.
- [x] 3.3 Update `Header.tsx`:
  - Adopt clean modern typography and layout.
  - Add quick audio mute/unmute toggle button with persistent preference.
- [x] 3.4 Clean up deprecated components (`SpiralSpine.tsx`, `WashiTape.tsx`, `PaperclipFastener.tsx`) and update barrel exports in `frontend/src/components/stationery/index.ts`.

## Phase 4: Verification & Regression Testing
- [x] 4.1 Run full frontend test suite (`npm test -- --run`) ensuring 100% pass across all component and view tests.
- [x] 4.2 Run TypeScript type check and production build (`npm run build`).
- [x] 4.3 Verify light and dark mode appearance, responsive mobile layout, and touch target accessibility.
