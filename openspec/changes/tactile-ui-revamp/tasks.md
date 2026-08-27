## 1. Dependencies and Foundation Setup

- [ ] 1.1 Install frontend animation and generative libraries (`framer-motion`, `@use-gesture/react`, `roughjs`, `canvas-confetti`, `@types/canvas-confetti`)
- [ ] 1.2 Verify clean frontend build (`npm --prefix frontend run build`) and test suite baseline

## 2. Spring Physics and Layout Animations

- [ ] 2.1 Refactor `RubberStampBadge` to use `framer-motion` spring dynamics (`stiffness`, `damping`, `mass`) on stamp drops
- [ ] 2.2 Refactor `PaperCard` with spring-based hover lifts and shared layout morphing capabilities (`layoutId`)
- [ ] 2.3 Connect appliance detail inspection slip modal with shared element transition morphing from `ApplianceCard`
- [ ] 2.4 Add spring morphing to `ChoreSwapModal` and `ChoreLogModal` slips

## 3. Generative Inking, Checkboxes and Tally Clusters

- [ ] 3.1 Refactor `ScribbleCheckbox` using `roughjs` to dynamically draw organic hand-drawn borders and strikethroughs
- [ ] 3.2 Refactor `TallyCounter` using `roughjs` to render 1-to-5 organic handwritten tally mark clusters on dynamic canvas/SVG
- [ ] 3.3 Integrate `canvas-confetti` micro-particle dust celebrations for duty completions

## 4. Gesture Physics and Swipe Navigation

- [ ] 4.1 Implement horizontal inertial swipe page-turn gesture using `@use-gesture/react` in main notebook viewport
- [ ] 4.2 Implement tension-based drag-to-claim mechanics for post-it notes in `UpForGrabsPool`

## 5. Multi-Sensory Audio and Micro-Haptics

- [ ] 5.1 Upgrade `soundEngine.ts` with velocity sensitivity and dynamic pitch/resonance modulation
- [ ] 5.2 Implement mobile micro-haptic vibration triggers (`navigator.vibrate`) for stamp drops, checkbox ticks, and page turns
- [ ] 5.3 Write comprehensive unit tests for sound engine and haptics

## 6. Ambient Hardware and PWA Integrations

- [ ] 6.1 Create `useWakeLock` hook and add Countertop Fridge Kiosk mode toggle in `SettingsView`
- [ ] 6.2 Create `useAppBadging` hook to dynamically synchronize `navigator.setAppBadge` with pending chore and appliance counts
- [ ] 6.3 Implement native Web Share API button for household invite slips
- [ ] 6.4 Enhance service worker push event handler with actionable notification buttons

## 7. Verification and Testing

- [ ] 7.1 Run full frontend Vitest test suite and ensure 100% passing tests
- [ ] 7.2 Run frontend production build (`npm run build`) and verify bundle sizes
- [ ] 7.3 Rebuild and verify Docker Compose frontend container
