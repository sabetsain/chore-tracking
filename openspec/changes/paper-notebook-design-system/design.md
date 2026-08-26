## Context

The Household Coordination application is a self-hostable system built with FastAPI, PostgreSQL, and React 19. All 9 phases of the core MVP (47 tasks across household management, weekly chore rotation, appliance state engine, real-time WebSockets, and Web Push notifications) are complete and covered by 100% passing test suites.

However, the frontend currently uses standard corporate SaaS styling (flat slate-50/indigo-600 cards). To resolve domestic user fatigue, a detailed design specification (`DESIGN.md`) and high-fidelity Stitch UI prototypes were developed around a **Paper Notebook Design System** metaphor. This technical design outlines how to incorporate the authentic stationery elements into the React application cleanly, efficiently, and with zero regression.

## Goals / Non-Goals

**Goals:**
- Implement the Paper Notebook Design System across all React frontend views using Tailwind CSS tokens, CSS custom properties, and modular React primitives.
- Replace generic UI components with tactile stationery primitives (`PaperCard`, `RubberStampBadge`, `WashiTape`, `PaperclipFastener`, `ScribbleCheckbox`, `TallyCounter`, `SpiralSpine`, `NotebookTab`).
- Provide hardware-accelerated CSS 3D page turns for tab switching with full `prefers-reduced-motion` fallbacks.
- Implement the procedural zero-asset Web Audio sound engine (`soundEngine.ts`) with user preference persistence.
- Refactor `Onboarding.tsx` into the interactive Notebook Cover with Moleskine/Kraft/Leather materials and pull-chain desk lamp toggle.
- Maintain 100% pass rate across all 48 Vitest unit/integration tests and WCAG 2.1 AA accessibility compliance.

**Non-Goals:**
- Modify backend FastAPI routers, SQLAlchemy models, database migrations, or WebSocket message protocols.
- Introduce heavyweight 3D rendering engines (such as Three.js / WebGL), which would bloat bundle size and mobile battery consumption.
- Alter existing authentication flows, PIN encryption, or invite code generation logic.

## Decisions

### Decision 1: Pure CSS 3D Transforms over Three.js / WebGL
- **Choice**: Implement 3D page flips using CSS perspective (`perspective: 1400px`), `rotateY()`, and `cubic-bezier(0.25, 1, 0.5, 1)` transitions.
- **Why**: Stitch UI's raw prototype injected a Three.js WebGL canvas. In a React 19 PWA, Three.js adds 600KB+ bundle weight, increases battery/GPU drain on mobile, and complicates React component lifecycle. Pure CSS 3D achieves 60fps hardware acceleration with zero external dependencies.
- **Alternatives Considered**:
  - *Three.js Canvas*: High visual fidelity for page bending, but excessive bundle overhead and severe mobile performance penalty.
  - *Flat 2D Slide*: Low CPU overhead, but loses the tactile physical book metaphor.

### Decision 2: Procedural Web Audio API over Audio Asset Bundling
- **Choice**: Generate sound effects (stamp thuds, page rustles, pencil scratches) dynamically using Web Audio API oscillators, biquad filters, and noise buffers in `soundEngine.ts`.
- **Why**: Zero HTTP downloads, zero latency, zero asset management, and customizable acoustic parameters (frequencies, decay times).
- **Alternatives Considered**:
  - *MP3/WAV Audio Files*: Requires asset bundling, network preloading, and can suffer from playback delays.

### Decision 3: Modular Stationery Component Primitives (`frontend/src/components/stationery/`)
- **Choice**: Create isolated, reusable stationery primitives rather than inlining complex CSS hacks inside domain views.
- **Why**: Promotes clean separation of concerns, simplifies Vitest component testing, and allows individual primitives (`RubberStampBadge`, `PaperclipFastener`, `WashiTape`) to be tested in isolation.
- **Alternatives Considered**:
  - *Monolithic View Restyling*: Faster initial prototype, but results in duplicated SVG paths and difficult maintenance.

### Decision 4: CSS Variable Token Bridge with Tailwind Config Extension
- **Choice**: Map Tailwind utility classes (`bg-paper-sheet`, `text-ink-navy`, `border-stamp-clean`) directly to CSS custom properties (`var(--paper-sheet)`, `var(--ink-navy)`).
- **Why**: Allows seamless runtime theme switching (Daytime Paper vs. Night Journal) simply by adding the `.dark` class to `document.documentElement` without re-rendering the DOM tree.

## Risks / Trade-offs

- **[Risk: CSS 3D Transform glitches on older mobile browsers]** → Mitigation: Enforce `backface-visibility: hidden` and `transform-style: preserve-3d`. On devices with `prefers-reduced-motion` or small screens, degrade gracefully to instant swaps or opacity fades.
- **[Risk: SVG Noise/Turbulence filter performance overhead]** → Mitigation: Limit `feTurbulence` filter usage to static stamp masks or pre-rendered SVG assets rather than animating live filter parameters during scrolling.
- **[Risk: Existing Vitest DOM queries breaking due to structural restyling]** → Mitigation: Preserve all existing `role`, `aria-label`, `button` text, and test selectors so all 48 test suites continue to pass without breaking assertions.
- **[Risk: Accidental sound playback on auto-load]** → Mitigation: Sound effects default to OFF (`localStorage.getItem('chores_sound_enabled') === 'true'`), and the Web Audio context is only initialized after user opt-in and gesture.

## Migration Plan

1. **Phase 1: Foundation & Asset Setup**
   - Update `frontend/index.html` with Google Fonts preconnect (`Patrick Hand`, `Caveat`, `Nunito Sans`, `JetBrains Mono`).
   - Extend `frontend/tailwind.config.js` with stationery tokens, custom shadows, and font families.
   - Update `frontend/src/index.css` with 24px baseline grid rules, margin guides, and CSS variables.
   - Implement `frontend/src/utils/soundEngine.ts`.
2. **Phase 2: Stationery Component Primitives**
   - Build `PaperCard.tsx`, `RubberStampBadge.tsx`, `WashiTape.tsx`, `PaperclipFastener.tsx`, `ScribbleCheckbox.tsx`, `TallyCounter.tsx`, `SpiralSpine.tsx`, and `NotebookTab.tsx`.
3. **Phase 3: Core View Refactoring**
   - Refactor `Header.tsx` to render spiral spine and die-cut index tabs.
   - Refactor `ApplianceDashboard.tsx` and `ApplianceCard.tsx` with animated rubber stamps and 1-tap state mutation.
   - Refactor `ChoreDutyView.tsx` with ruled notebook layout, hand-drawn checkboxes, and continuous duty tally clusters.
   - Refactor `UpForGrabsPool.tsx` with pinned washi-taped post-it cards.
   - Refactor `ChoreSwapModal.tsx` and `ChoreLogModal.tsx` with paperclip memo slip styling.
   - Refactor `Onboarding.tsx` into the interactive Notebook Cover with Moleskine/Kraft/Leather cover customizer.
   - Refactor `SettingsView.tsx` with desk lamp toggle and audio preference switch.
4. **Phase 4: Verification**
   - Run `npm --prefix frontend test` to verify 100% test pass continuity across all test suites.
