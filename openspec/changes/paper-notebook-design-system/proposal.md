## Why

The current household coordination application provides complete functional capabilities (chore rotation, appliance state machine, live WebSocket synchronization, and Web Push notifications), but uses a generic SaaS aesthetic (cold slate/indigo cards) that creates corporate productivity fatigue in a home environment. 

Rooted in the project's comprehensive design specification (`DESIGN.md`) and incorporating the authentic stationery elements demonstrated in the Stitch UI prototypes (warm cream paper, distressed rubber stamps, washi tape, handwritten tallies, and book cover onboarding), this change implements the **Paper Notebook Design System** across the entire React frontend. This transforms the app into an engaging, tactile kitchen-table journal tailored specifically for roommates.

## What Changes

- **Design Foundation & Tokens**: Extend Tailwind CSS with paper/ink color tokens (`--paper-bg`, `--paper-sheet`, `--ink-navy`, `--stamp-*`, `--hl-*`), 24px baseline grid rules, authentic typography (`Patrick Hand`, `Caveat`, `Nunito Sans`, `JetBrains Mono`), and tactile elevation shadows.
- **Stationery Primitives**: Build accessible, reusable stationery components (`PaperCard`, `RubberStampBadge`, `WashiTape`, `PaperclipFastener`, `ScribbleCheckbox`, `TallyCounter`, `SpiralSpine`, `NotebookTab`).
- **CSS 3D Page Turn Engine**: Implement performant, lightweight CSS 3D perspective transitions for tab switching (`perspective: 1400px`, `rotateY`, `backface-visibility: hidden`) with full `prefers-reduced-motion` compliance (avoiding heavyweight WebGL/Three.js dependencies).
- **Procedural Sound Engine**: Integrate the zero-asset Web Audio API sound engine (`soundEngine.ts`) for opt-in tactile audio feedback (stamp thud, page rustle, pencil scribble) with a toggle in settings.
- **Interactive Component Refactoring**:
  - `Header`: Render wire spiral coil, rivet spine, and die-cut index tabs.
  - `ApplianceDashboard` & `ApplianceCard`: 1-tap state transitions with animated rubber stamp badges and stamp thud effects.
  - `ChoreDutyView`: Ruled notebook lines, red margin guide, hand-drawn checkboxes, and handwritten 5-count tally mark clusters (`||||` + slash).
  - `UpForGrabsPool`: Pinned memo/cork board with pastel post-it notes and washi tape fasteners.
  - `ChoreSwapModal` & `ChoreLogModal`: Paperclipped legal memo slips.
  - `Onboarding`: Interactive Notebook Cover with Moleskine, Kraft, and Leather cover customizer and desk lamp pull-chain dark mode switch.
  - `SettingsView`: Desk stationery settings sheet with desk lamp toggle and audio preference switch.
- **100% Test Continuity**: Maintain all 48 Vitest test suites and ARIA accessibility standards (WCAG 2.1 AA).

## Capabilities

### New Capabilities
- `stationery-design-system`: Defines requirements and specifications for the Paper Notebook Design System, including design tokens, stationery primitives, 24px baseline alignment, CSS 3D page turns, procedural sound synthesis, and component presentation patterns.

### Modified Capabilities
<!-- No requirement changes to existing backend or domain specifications; all existing API contracts and business logic are preserved. -->

## Impact

- **Frontend Codebase**: `frontend/index.html`, `frontend/tailwind.config.js`, `frontend/src/index.css`, `frontend/src/App.tsx`, `frontend/src/components/`, `frontend/src/utils/`.
- **Dependencies**: No external runtime NPM packages added; Google Fonts loaded via preconnect CDN in `index.html`; Web Audio API used for sound effects.
- **Backend / APIs**: Zero changes to FastAPI routes, database models, or WebSocket schemas.
- **Tests**: Vitest tests will be updated/extended to verify stationery components and retain 100% pass coverage.
