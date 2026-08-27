## Context

The Household Coordination App features the Paper Notebook Design System (v2.0.0 in `DESIGN.md`), establishing a warm, tactile domestic stationery metaphor. However, current interactions rely on rigid CSS keyframe animations, deterministic SVGs, and basic duration-based transitions. This design document establishes the technical architecture to upgrade the UI into a fluid, zero-latency, tactile living logbook using spring physics, generative hand-drawn inking, swipe gesture mechanics, multi-sensory haptics, and modern PWA hardware hooks.

## Goals / Non-Goals

**Goals:**
- Implement spring physics (`stiffness`, `damping`, `mass`) and shared element layout morphing (`layoutId`) across appliance cards and modal slips using `framer-motion`.
- Enable inertial horizontal swipe page turns and tension-based post-it note drag-to-claim gestures using `@use-gesture/react`.
- Procedurally generate organic, hand-drawn checkboxes, ruled guide wobble, and dynamic 1-to-5 tally mark clusters using `roughjs`.
- Deliver celebratory paper fleck and graphite bursts on completed duties via lightweight `canvas-confetti`.
- Upgrade the zero-download Web Audio synthesizer with velocity-sensitive pitch/resonance modulation and mobile micro-haptic pulses (`navigator.vibrate`).
- Integrate the Screen Wake Lock API for always-on countertop fridge kiosk setups and the Web App Badging API for homescreen icon pending chore counters.
- Maintain 100% passing test rates across Vitest test suites and zero runtime regressions.

**Non-Goals:**
- No backend database schema changes or database migrations (all capabilities operate at the frontend and PWA hardware seam).
- No heavy 3D WebGL or Three.js dependencies (all 3D page turns use CSS/Framer perspective transforms).
- No removal or flattening of the Paper Notebook design thesis.

## Decisions

### 1. Framer Motion for Spring Physics and Layout Morphing
- **Decision**: Use `framer-motion` for spring-based component transitions and shared element morphing (`layoutId`).
- **Rationale**: `framer-motion` provides first-class declarative React integration, physics-accurate springs (stiffness/damping), and seamless layout morphing between resting cards and expanded slips without manual coordinate calculations.
- **Alternatives Considered**:
  - *CSS Transitions*: Lacks physical spring momentum and cannot perform cross-component layout morphing (`layoutId`).
  - *GSAP / Anime.js*: Powerful for timeline sequences, but more imperative and less integrated with React state and component lifecycle.

### 2. Rough.js for Procedural Hand-Drawn Inking & Tally Marks
- **Decision**: Use `roughjs` to dynamically draw canvas/SVG paths for checkboxes, strikethroughs, and tally mark clusters.
- **Rationale**: `roughjs` applies mathematical Bézier perturbation and variable stroke pressure, creating genuine hand-drawn organic variation where no two checkmarks or tallies are pixel-identical.
- **Alternatives Considered**:
  - *Static SVG assets*: Look identical and robotic when repeated across multiple cards.
  - *Handmade canvas math*: Reinventing rough stroke jitter algorithms increases maintenance complexity.

### 3. Procedural Multi-Sensory Audio & Micro-Haptics
- **Decision**: Synthesize all audio in real-time via the Web Audio API and trigger micro-haptics via `navigator.vibrate`.
- **Rationale**: Zero network latency, 0 KB external audio asset footprint, and dynamic velocity/frequency modulation so repeated clicks never sound repetitive.
- **Alternatives Considered**:
  - *Static MP3/WAV audio files*: Increases bundle size, requires network requests, and cannot modulate pitch/resonance dynamically.

### 4. Progressive Enhancement for Hardware & PWA APIs
- **Decision**: Guard Screen Wake Lock, App Badging, and Vibration APIs behind feature detection (`if ('wakeLock' in navigator)`).
- **Rationale**: Enables cutting-edge kiosk and homescreen experiences on modern mobile/tablet browsers while cleanly falling back on unsupported platforms without errors.

## Risks / Trade-offs

- **[Risk] Animation performance on low-tier mobile devices** → **Mitigation**: Constrain animations to GPU-accelerated transforms (`transform`, `opacity`), keep confetti bursts to `< 30` particles, and strictly adhere to `prefers-reduced-motion`.
- **[Risk] Audio autoplay policies** → **Mitigation**: Audio context is lazily initialized/resumed only after an explicit user interaction gesture, with an opt-in toggle persisted in `localStorage`.
- **[Risk] React 19 compatibility** → **Mitigation**: Install latest React 19-compatible releases of `framer-motion`, `@use-gesture/react`, `roughjs`, and `canvas-confetti`.

## Migration Plan

1. Install frontend dependencies: `framer-motion`, `@use-gesture/react`, `roughjs`, `canvas-confetti`, and relevant types.
2. Upgrade stationery primitives (`PaperCard`, `RubberStampBadge`, `ScribbleCheckbox`, `TallyCounter`, `NotebookTab`) with spring physics and procedural inking.
3. Integrate `@use-gesture/react` swipe navigation into the main notebook layout container.
4. Upgrade `soundEngine.ts` with velocity sensitivity and micro-haptics.
5. Add countertop kiosk mode toggle and app badging hooks in `SettingsView` and root app shell.
6. Verify all 74+ tests pass and add unit tests for new interaction primitives.
