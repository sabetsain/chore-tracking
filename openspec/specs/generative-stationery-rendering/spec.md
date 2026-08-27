# generative-stationery-rendering Specification

## Purpose
Specifies procedural hand-drawn inking, dynamic tally clusters, and micro-particle celebration feedback across the application.

## Requirements

### Requirement: Procedural Hand-Drawn Inking
The application SHALL dynamically generate hand-drawn SVG paths and canvas elements with organic roughness and micro-wobble via `roughjs`.

#### Scenario: Rendering organic hand-drawn checkboxes
- **WHEN** chore checklist items are rendered in `ChoreDutyView`
- **THEN** checkboxes display with unique procedural perimeter roughness rather than uniform geometric squares.

#### Scenario: Animating pencil scribble strikethrough
- **WHEN** a roommate checks off a weekly chore duty
- **THEN** a randomized hand-drawn strikethrough path animates across the chore label over 280ms.

### Requirement: Organic Continuous Duty Tally Mark Clusters
The application SHALL render logged continuous duty counts as dynamic, handwritten tally mark clusters with organic angle and pressure variations.

#### Scenario: Rendering tally mark vertical strokes
- **WHEN** duty counts between 1 and 4 are logged for a continuous duty chore
- **THEN** the system draws 1 to 4 distinct vertical strokes with natural angle jitter (±3°) and slight stroke width variations.

#### Scenario: Rendering diagonal crossbar on fifth tally
- **WHEN** the 5th duty instance is logged in a weekly cycle
- **THEN** the system renders a diagonal crossbar strike across the four preceding strokes to complete the 5-count cluster.

### Requirement: Micro-Particle Paper Fleck Bursts
The application SHALL trigger subtle, non-distracting paper dust and graphite particle celebrations via `canvas-confetti` upon completing major household actions.

#### Scenario: Triggering celebration on all weekly chores completed
- **WHEN** the final weekly chore duty is checked off
- **THEN** a soft micro-burst of cream, gold, and slate paper flecks disperses gently from the checklist and settles over 1.2s.
