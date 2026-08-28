## Context

Currently, the household chore service assigns chores on an individual basis using a simple round-robin sequence based on the previous week's assignee. This approach does not take into account the relative difficulty (effort weights 1–5 stars) of chores, resulting in unfair weekly workloads. In addition, chore completion is currently a one-way transition with no support for accidental check-off recovery, and there is no direct way for roommates to reassign a specific weekly task without initiating a 1-to-1 swap.

## Goals / Non-Goals

**Goals:**
- Implement a greedy number partitioning algorithm (Longest Processing Time first) to group all active household chores into $N$ balanced effort buckets.
- Rotate bucket ownership cyclically every Sunday at midnight so members experience an equitable rotation of chore bundles.
- Place new chores into the bucket with the lowest cumulative weight and immediately assign them to the current week's bucket holder.
- Provide a collaborative reassignment endpoint allowing any roommate to reassign a chore for the current week without altering future bucket configurations.
- Provide an uncomplete endpoint and enforce ownership so only the assigned member can check or uncheck their tasks.
- Enhance the Luxury Editorial Stationery UI with toggleable `ScribbleCheckbox` physics and reassignment controls.

**Non-Goals:**
- Karma bidding or monetary chore bounties (deferred to Phase 3 in `ROADMAP.md`).
- Subtask checklists or photo proof receipts (deferred to Phase 3).

## Decisions

### 1. Partitioning Strategy: Greedy LPT (Longest Processing Time) Bucket Partitioning
- **Decision**: Sort active chores in descending order of `effort_weight`, and greedily place each chore into the bucket currently having the lowest sum of effort points. Tie-breaks are resolved deterministically by chore creation order.
- **Rationale**: Greedy LPT is guaranteed to approximate optimal multiway number partitioning with minimal computation complexity ($O(M \log M)$), perfectly suited for household chore sets (typically 5–30 chores).
- **Alternatives Considered**:
  - *Pure Random Shuffle*: High variance in weekly effort points across roommates.
  - *Dynamic Programming / Integer Linear Programming*: Overkill for $N \le 10$ and chore sets under 50 items.

### 2. Cyclical Weekly Rotation
- **Decision**: Compute the week index as weeks elapsed since a fixed epoch (`week_index = (week_start_date - epoch_date).days // 7`). Member $i$ is assigned `Bucket[(i + week_index) % N]`.
- **Rationale**: Deterministic epoch-based rotation ensures that week navigation (past, present, future) produces consistent, predictable assignments without requiring extra database tables.

### 3. Separation of Persistent Buckets and Transient Weekly Overrides
- **Decision**: Manual reassignments update only the active `ChoreAssignment.member_id` for that specific week. Future weeks recompute assignments from the base chore templates and bucket rotation.
- **Rationale**: Allows roommates to cover for each other without creating "chore creep" or destabilizing future rotation schedules.

### 4. Assigned Member Check / Uncheck Authorization
- **Decision**: `POST /assignments/{id}/complete` and `POST /assignments/{id}/uncomplete` verify that `current_member.id == assignment.member_id` (or household admin).
- **Rationale**: Prevents accidental clicks by roommates while maintaining easy self-recovery if the assignee mistakenly taps the checkbox.

## Risks / Trade-offs

- **[Risk: Member count changes or Away status mid-week]** → *Mitigation*: When a member goes away, their current week's assignments are placed into the Up for Grabs pool, and subsequent weeks partition across active members.
- **[Risk: Accidental double-taps on slow network]** → *Mitigation*: Check and uncheck actions are idempotent and provide optimistic UI feedback in the frontend.
