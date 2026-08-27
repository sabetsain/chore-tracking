## Why

While the initial Paper Notebook Design System established a distinctive visual thesis, its interactions currently rely on static CSS keyframes, deterministic SVGs, and basic duration-based transitions. In a shared domestic household context, roommates need an interface that feels extraordinarily fluid, zero-latency, tactile, and physically alive. By introducing spring physics, generative hand-drawn inking, shared element morphing, gesture mechanics, multi-sensory haptics, and modern PWA hardware hooks (such as countertop fridge kiosk wake lock and homescreen badging), we transform the digital logbook into a seamless, tactile kitchen-table appliance.

## What Changes

- **Spring Physics & Shared Element Morphing**: Integrate `framer-motion` for true mass/stiffness/damping spring mechanics and layout morphing (`layoutId`), allowing resting index cards and chore items to fluidly expand into paperclipped inspection slips without layout popping.
- **Thumb Gesture & Inertial Page Navigation**: Integrate `@use-gesture/react` to provide natural horizontal swipe page turns with finger tracking, rubber-band resistance, and physics-driven tear-off dragging for up-for-grabs post-it notes.
- **Generative Procedural Inking & Tally Marks**: Integrate `roughjs` to dynamically compute hand-drawn checkboxes, ruled guide wobble, and randomized organic tally mark clusters so repeated actions feel authentically sketched.
- **Paper Dust & Graphite Particle Celebrations**: Integrate lightweight `canvas-confetti` for celebratory paper fleck and graphite bursts upon completing duty shifts or stamping appliances clean.
- **Velocity-Sensitive Audio & Micro-Haptics**: Upgrade the procedural Web Audio synthesizer to modulate resonance and noise filtering based on interaction velocity, paired with targeted Web Vibration API haptic pulses for mobile devices.
- **Zero-Latency Optimistic UX**: Enhance TanStack Query mutation pipelines so stamp drops, checkmarks, and duty logs trigger 0ms visual/audio gratification with automatic background synchronization and rollback.
- **Countertop Fridge Kiosk & Hardware APIs**: Introduce Screen Wake Lock API for always-on kitchen displays, App Badging API (`navigator.setAppBadge`) for live homescreen icon pending chore counts, and native Web Share API for exporting household notes.

## Capabilities

### New Capabilities
- `tactile-physics-and-gestures`: Spring-driven motion physics, shared layout morphing transitions, inertial swipe page turns, and tension-based drag-and-drop memo interactions.
- `generative-stationery-rendering`: Procedural canvas/SVG hand-drawn inking, dynamic organic tally mark generation, dynamic highlighter displacement, and micro-particle bursts.
- `ambient-hardware-pwa-integration`: Screen Wake Lock API for fridge kiosk mode, Web App Badging API for homescreen counts, Web Share API for export slips, and interactive Web Push notification action buttons.

### Modified Capabilities
- `stationery-design-system`: Upgraded from static CSS keyframes to spring-driven physics, velocity-sensitive procedural audio synthesis, micro-haptics, and 0ms optimistic mutation pipelines.

## Impact

- **Frontend Dependencies**: Adds lightweight UI and interaction libraries: `framer-motion`, `@use-gesture/react`, `roughjs`, `canvas-confetti`.
- **Frontend Components**: Enhances `frontend/src/components/stationery/` primitives (`PaperCard`, `RubberStampBadge`, `ScribbleCheckbox`, `TallyCounter`, `NotebookTab`), view headers, dialog modals, and dashboard cards.
- **State & Sync**: Extends TanStack Query mutation hooks for optimistic state reconciliation and WebSocket real-time broadcast handling.
- **Browser APIs**: Leverages Screen Wake Lock, Badging, and Web Vibration APIs with graceful fallbacks on unsupported browsers.
- **Backward Compatibility**: Fully preserves all existing API contracts, WebSocket payloads, database schemas, and 100% passing Vitest/pytest test suites.
