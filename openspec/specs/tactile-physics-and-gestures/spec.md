# tactile-physics-and-gestures Specification

## Purpose
Specifies spring-based layout physics, shared element morphing transitions, and touch gesture interactions across the user interface.

## Requirements

### Requirement: Spring Physics and Shared Element Transitions
The application SHALL use spring-based physics with mass, stiffness, and damping profiles for all layout morphing and card expansions via `framer-motion`.

#### Scenario: Expanding appliance card into detailed slip
- **WHEN** the user taps an appliance card to view detailed cycle logs
- **THEN** the originating card lifts and seamlessly morphs into the paperclipped inspection slip container with shared layout animation (`layoutId`), preserving visual continuity without sudden overlay appearance.

#### Scenario: Morphing chore card into swap proposal slip
- **WHEN** the user taps to propose a chore swap
- **THEN** the chore item smoothly expands into the perforated swap slip with spring physics deceleration.

### Requirement: Inertial Touch Gesture Page Turns
The application SHALL support fluid, touch-tracked horizontal swipe gestures on mobile and tablet viewports via `@use-gesture/react`.

#### Scenario: Swiping horizontal page with finger tracking
- **WHEN** the user drags a page horizontally on a touch device
- **THEN** the page tracks the finger displacement with natural damping and elastic rubber-banding at boundaries.

#### Scenario: Releasing drag past threshold or with flick velocity
- **WHEN** the user releases a horizontal drag past the 30% width threshold or with a flick velocity exceeding 0.5px/ms
- **THEN** the page turn completes with natural momentum, navigating to the adjacent notebook section (`Appliances` <-> `Chores` <-> `Settings`).

#### Scenario: Releasing drag below threshold
- **WHEN** the user releases a horizontal drag without sufficient distance or velocity
- **THEN** the page springs back to its resting position with elastic damping.

### Requirement: Tension-Based Drag to Claim
The application SHALL allow roommates to claim Up-for-Grabs sticky notes by physically dragging them downward.

#### Scenario: Dragging sticky note past tear-off threshold
- **WHEN** the user drags an unassigned post-it note downward past the 80px tension threshold
- **THEN** the washi tape visually detaches, an adhesive tear sound effect plays, and the task transitions into the user's active chore duty list.

#### Scenario: Releasing sticky note below tear threshold
- **WHEN** the user releases a dragged post-it note before reaching 80px of displacement
- **THEN** the note springs back under the washi tape with rubber-band tension.
