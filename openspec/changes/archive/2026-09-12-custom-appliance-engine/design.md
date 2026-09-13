## Context

The Household Coordination app manages shared domestic machinery. In the MVP, appliances were limited to three presets (`dishwasher`, `washer`, `dryer`) using a hardcoded 4-state loop. Households frequently have other domestic machines (espresso makers, robotic vacuums, air purifiers, fermentation chambers, rice cookers) that operate on different linear cycles (e.g. 2-state or 3-state loops) and benefit from operational timers.

Following a thorough design grill-me session, key operational edge cases (cycle aborting, step editing mid-cycle, timer notification delivery, and legacy migration shapes) have been aligned.

## Goals / Non-Goals

**Goals:**
- Enable roommates to create custom appliances with linear cycles of 2 to 5 steps chosen from a canonical state pool (`empty`, `dirty`, `running`, `needs_attention`, `clean`).
- Enforce that the current state is always a valid step of the appliance using database check constraints (`ck_appliance_current_state_in_steps`).
- Replace hardcoded backend transition dictionaries with deterministic next-step linear validation.
- Provide cycle timers for appliances, requiring user duration entry on start and mandatory human confirmation when the timer finishes.
- Deliver an intuitive guided "Add Appliance" modal dialog matching the luxury stationery aesthetic (`DESIGN.md`).
- Support cycle abort/reset returning the appliance to Step 1 and clearing active timers.
- Allow editing cycle steps at any time, auto-resetting to Step 1 upon step modification.
- Deliver multi-channel timer completion alerts (in-app acoustic chime, visual alert stamp, and Web Push).
- Ensure seamless backwards-compatibility and migration for existing household appliances.

**Non-Goals:**
- Branching or non-linear state graphs (e.g. state A branching to B or C based on conditional rules).
- Automatic IoT sensor power-signature profiling (handled in Phase 5).
- Unrestricted free-form string states (states must come from the canonical stationery-styled pool to guarantee high-craft visual rendering).

## Decisions

### Decision 1: Positional Step Slots (`state_step_1` .. `state_step_5`) on `appliances`
- **Decision**: Represent an appliance's linear cycle directly as 5 columns on the `appliances` table: `state_step_1`, `state_step_2`, `state_step_3`, `state_step_4`, `state_step_5`. Non-empty slots define the cycle order.
- **Why**:
  - Allows PostgreSQL check constraint `CHECK (current_state IN (state_step_1, state_step_2, state_step_3, state_step_4, state_step_5))` to guarantee state validity at the database engine level.
  - Transparent querying, simple migrations, and zero join table overhead.

### Decision 2: Canonical Universe of Supported States
- **Decision**: Define a curated pool of 5 canonical states:
  - `empty`: Idle, clear, awaiting load.
  - `dirty`: Loaded with items needing a run.
  - `running`: Active operation / cycle.
  - `needs_attention`: Finished running; awaiting unloading/cleaning.
  - `clean`: Sanitized, ready for use/storage.
- **Why**: Keeps the stationery design system cohesive, ensuring every state has a curated rubber stamp, organic ink color, and Lucide icon.

### Decision 3: Deterministic Next-State Computation
- **Decision**: To find the next state for an appliance with current state $S$:
  - Collect non-null steps: $L = [step_1, \dots, step_k]$.
  - If $S \notin L$, fallback to $step_1$.
  - Next state is $L[(index(S) + 1) \pmod k]$.
  - Transition requests must match this next state unless `force=true`.

### Decision 4: Mandatory Run Timer & Confirmation Gate
- **Decision**: When an appliance has `timer_enabled=true`, transitioning into `running` requires `timer_duration_minutes > 0`.
- Duration input UI provides quick-tap chips (15m, 30m, 45m, 60m, plus default) and custom minute entry.
- When the countdown finishes (`now >= timer_ends_at`):
  - The appliance remains in `running` state.
  - UI displays an alert badge: "Timer Complete (00:00) — Confirmation Needed".
  - Plays an acoustic chime via `soundEngine` and sends a Web Push notification to the household.
  - Action button displays "Confirm & Mark [Next State]".
  - A human must physically click the button to advance the state, preventing phantom completions.

### Decision 5: Cycle Interruption / Abort Action
- **Decision**: Provide an "Abort / Reset Cycle" action (via `POST /api/v1/appliances/{id}/reset`).
- Resetting returns the appliance to `state_step_1`, clears `timer_started_at`, `timer_ends_at`, and `timer_duration_minutes`, logs the reset with `trigger_source='reset'`, and broadcasts the update.

### Decision 6: Editing Cycle Steps with Auto-Reset Safeguard
- **Decision**: Roommates can update appliance settings or cycle steps at any time via `PUT /api/v1/appliances/{id}`.
- If cycle steps are modified, the backend automatically resets `current_state` to the new `state_step_1` and clears any running timers to avoid invalid intermediate states.

### Decision 7: Legacy Appliance Migration Strategy
- **Decision**: The Alembic migration updates existing appliances to streamlined 3-step cycles:
  - Washer & Dryer: `['empty', 'running', 'needs_attention']`, `timer_enabled=true`, default 45m.
  - Dishwasher: `['dirty', 'running', 'needs_attention']`, `timer_enabled=true`, default 60m (emptying immediately resets to dirty for new dishes).
  - Existing records in `clean_needs_emptying` migrate to `needs_attention`.

## Risks / Trade-offs

- **[Risk] State `clean_needs_emptying` deprecation**: Legacy code and active records used `clean_needs_emptying`.
  - **Mitigation**: The migration updates active records to `needs_attention`, and backend accepts `clean_needs_emptying` as an alias during transition requests for backwards-compatibility.
- **[Risk] Multiple tabs / clients observing timer completion**:
  - **Mitigation**: WebSocket broadcast on timer start synchronizes `timer_ends_at`. Clients independently evaluate `now >= timer_ends_at` and trigger chime/banner when reaching 00:00 without duplicate backend load.
