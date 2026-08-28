## Why

Current chore assignment assigns chores individually via simple round-robin or manual claim. This leads to unbalanced workloads where one roommate may receive multiple heavy cleaning tasks while another receives trivial tasks. Furthermore, if a member accidentally marks a chore as completed, there is no way to undo or uncheck the chore.

Implementing balanced chore buckets ensures fair distribution of household duties by grouping chores into equal-effort bundles that rotate among active roommates weekly. Introducing collaborative reassignment allows roommates to easily cover for each other for a single week without disrupting long-term rotation balance, while check/uncheck support with ownership guardrails provides safe, reversible duty tracking.

## What Changes

- **Balanced Chore Bucket Partitioning**: Automatically partition active household chores into $N$ equal-difficulty buckets (where $N$ is the count of active members) using a multiway number partitioning algorithm over effort weights.
- **Weekly Bucket Rotation**: Rotate bucket ownership each week so every roommate cycles through all chore bundles equitably over time.
- **Dynamic Bucket Balancing on Chore / Member Changes**: Dynamically place newly created chores into the bucket with the lowest effort weight, and re-partition into $N$ buckets whenever members join, leave, or toggle away status.
- **Collaborative 1-Week Manual Reassignment**: Allow any household member to reassign a specific weekly chore assignment to any active member. This override applies strictly to the current week's assignment instance; the chore remains anchored in its original bucket for future rotations.
- **Ownership-Guarded Completion & Uncheck (Undo)**: Enforce that only the assigned member can check off a chore. If accidentally marked as done, the assigned member can uncheck the chore to revert its status to `pending`, clearing completion timestamps and broadcasting the state change.
- **Stationery UI Enhancements**: Update `ChoreDutyView` and `ScribbleCheckbox` to allow unchecking with tactile pencil/eraser feedback, show read-only status for non-owned chores, and provide a direct reassignment selector.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `chore-management`: Update weekly assignment generation from individual round-robin to balanced multi-chore bucket rotation, add mid-cycle bucket placement for new chores, introduce collaborative assignment override, and add uncheck/uncomplete capability with assigned-member authorization.

## Impact

- **Backend**:
  - `app.services.chore_service`: Implement bucket partitioning and weekly cycle rotation calculation.
  - `app.routers.chores`: Add uncomplete endpoint (`POST /assignments/{assignment_id}/uncomplete`) and reassignment endpoint (`PATCH /assignments/{assignment_id}/reassign`). Update `complete` endpoint to enforce assigned member ownership.
  - `app.websocket`: Broadcast `uncompleted` and `reassigned` chore events.
- **Frontend**:
  - `ChoreDutyView.tsx`: Support unchecking completed tasks, display interactive reassignment dropdown, and enforce read-only checkbox for duties assigned to roommates.
  - `stationery/ScribbleCheckbox.tsx`: Support toggleable checked/unchecked transition.
- **Database**:
  - Existing `chores` and `chore_assignments` schemas support all required fields (`effort_weight`, `member_id`, `status`, `completed_at`, `completed_by_member_id`). No destructive migrations required.
