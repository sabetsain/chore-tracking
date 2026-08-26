## 1. Foundation & Asset Setup

- [x] 1.1 Update `frontend/index.html` with Google Fonts preconnect for `Patrick Hand`, `Caveat`, `Nunito Sans`, and `JetBrains Mono`
- [x] 1.2 Extend `frontend/tailwind.config.js` with stationery color tokens (`paper`, `ink`, `stamp`, `highlighter`), custom box shadows, and font families
- [x] 1.3 Update `frontend/src/index.css` with CSS custom variables for light/dark modes, 24px baseline ruled line utilities, margin guide styles, and dashed focus indicators

## 2. Stationery Component Primitives

- [x] 2.1 Implement `RubberStampBadge` component with distressed border styling, rotational variations, and unit tests
- [x] 2.2 Implement `PaperCard` component with manila/cream cardstock texture, subtle organic tilt, and unit tests
- [x] 2.3 Implement `WashiTape` component with torn-edge clip-path and semi-transparent blend mode
- [x] 2.4 Implement `PaperclipFastener` component with metallic highlight SVG rendering
- [x] 2.5 Implement `ScribbleCheckbox` component with animated SVG hand-drawn checkmark and strikethrough
- [x] 2.6 Implement `TallyCounter` component for rendering 5-count handwritten tally clusters (`||||` + slash)
- [x] 2.7 Implement `SpiralSpine` and `NotebookTab` components for binder edge and protruding die-cut tab navigation

## 3. Procedural Sound Engine & CSS 3D Navigation

- [x] 3.1 Create `frontend/src/utils/soundEngine.ts` with procedural Web Audio synthesis for stamp thud, page rustle, and pencil scribble with local storage persistence
- [x] 3.2 Implement CSS 3D page flip transition container in `App.tsx` with `prefers-reduced-motion` safety fallback

## 4. Appliance Dashboard Refactoring

- [x] 4.1 Refactor `ApplianceCard.tsx` to use `PaperCard`, animated `RubberStampBadge`, and sound engine stamp thud trigger
- [x] 4.2 Update `ApplianceDashboard.tsx` layout to reflect the stationery notebook spread while preserving all 1-tap state mutation flows and modals

## 5. Chore Duty View & Ruled Paper Refactoring

- [x] 5.1 Refactor `ChoreDutyView.tsx` with ruled paper background, red margin guide, and `ScribbleCheckbox` for weekly check-offs
- [x] 5.2 Integrate `TallyCounter` for continuous duty instance logging in `ChoreDutyView.tsx`
- [x] 5.3 Restyle swap request button into a perforated paper slip

## 6. Up-For-Grabs Memo Board & Paperclipped Modals

- [x] 6.1 Refactor `UpForGrabsPool.tsx` into a pinned memo board with pastel post-it notes and `WashiTape` headers
- [x] 6.2 Refactor `ChoreSwapModal.tsx` and `ChoreLogModal.tsx` into paperclipped memo slips with `PaperclipFastener`

## 7. Onboarding Cover & Settings Refactoring

- [x] 7.1 Refactor `Onboarding.tsx` into the interactive Notebook Cover with Moleskine, Kraft, and Leather cover material customizer
- [x] 7.2 Implement the pull-chain desk lamp toggle for dark mode in `Onboarding.tsx` and `SettingsView.tsx`
- [x] 7.3 Update `SettingsView.tsx` with audio effects preference toggle connected to `soundEngine`

## 8. Verification & Visual Audit

- [x] 8.1 Run full frontend Vitest test suite (`npm --prefix frontend test`) to ensure all 48+ tests pass with zero regressions
- [x] 8.2 Verify keyboard navigation, ARIA live regions, contrast ratios (WCAG 2.1 AA), and responsive mobile pocket journal layout
