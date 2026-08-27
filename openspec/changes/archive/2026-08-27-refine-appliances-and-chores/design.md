## Context

The Household Coordination app manages shared domestic workflows including appliance state tracking (dishwasher, washer, dryer) and weekly chore rotations.

During MVP testing, three user experience friction points emerged:
1. **Custom Appliance Selection**: The "Add Appliance" modal exposes a generic "Custom" type that behaves identically to dishwashers rather than allowing custom cycles, creating user confusion.
2. **Missing Chore Addition Interface**: Roommates cannot add new chores after onboarding; the backend endpoints exist, but there is no frontend button or modal dialog in `ChoreDutyView`.
3. **Appliance State Cycles & Badge Misalignments**:
   - Washers/dryers in `empty` state display a "NEEDS EMPTYING" rubber stamp due to a fallback in `RubberStampBadge.tsx`.
   - Emptied dishwashers require an awkward two-step transition (`clean_needs_emptying` -> `empty` -> `dirty` -> `running`) rather than transitioning directly from emptied clean to dirty.

## Goals / Non-Goals

**Goals:**
- Restrict appliance creation to preset types (`dishwasher`, `washer`, `dryer`) while keeping existing DB models backwards-compatible.
- Introduce an "Add Chore" modal slip into `ChoreDutyView` styled according to the Luxury Editorial Stationery design system (`DESIGN.md`).
- Ensure new chores immediately receive a current-week assignment without requiring manual database intervention or waiting for the weekly rollover.
- Update `RubberStampBadge.tsx` and `ApplianceCard.tsx` so washer/dryer `empty` state renders "READY TO RUN!" and dishwasher emptied state transitions directly to `dirty`.

**Non-Goals:**
- Building the full custom cycle state-machine builder for arbitrary appliances (documented in `ROADMAP.md` / future specs).
- Changing chore swapping or up-for-grabs logic.

## Decisions

### Decision 1: Restrict Appliance Creation in Frontend vs. Backend Schema
- **Decision**: Keep the database `type` column and Pydantic validator supporting `'custom'` (for schema stability and backwards-compatibility), but remove `'custom'` from the frontend selection dropdown in `ApplianceDashboard.tsx`.
- **Alternatives Considered**: Dropping `'custom'` from the database constraint would require a database migration and potentially break existing test fixtures.

### Decision 2: Dishwasher State Machine Streamlining
- **Decision**: Update `ALLOWED_TRANSITIONS` in `appliances.py` so `dishwasher` allows `clean_needs_emptying -> dirty` (as well as `empty -> dirty` and `empty -> running` for initial state compatibility).
- **In Frontend**: When a dishwasher is in `clean_needs_emptying`, the 1-tap action button is "Mark Emptied", which transitions directly to `dirty`.
- **Alternatives Considered**: Keeping `empty` as an intermediate state requiring two clicks. Rejected because an emptied dishwasher is immediately ready for dirty dishes.

### Decision 3: Washer & Dryer Stamp Clarity
- **Decision**: Update `RubberStampBadge.tsx` so `empty` state for laundry machines displays `READY TO RUN!` (using clean neutral/green or slate ink) rather than `NEEDS EMPTYING`.
- **Alternatives Considered**: Introducing a new state string `ready`. Rejected to avoid unnecessary database migrations, since `empty` already semantically represents an empty machine ready for a new load.

### Decision 4: Chore Creation UI & Current Week Assignment Seeding
- **Decision**: When `POST /api/v1/chores` is called, the backend handler will immediately invoke `get_or_generate_weekly_assignments` for the current week. The new chore will be assigned round-robin to an active member (or remain unassigned in up-for-grabs).
- **UI Design**: The "Add Chore" modal in `ChoreDutyView.tsx` will use `PaperCard` with manila/ruled styling, providing fields for Title, Description, Effort Weight (1-5), and Duty Type (`single_weekly` vs `continuous_duty`).

## Risks / Trade-offs

- **[Risk] Existing dishwashers in `empty` state**: Older households may have dishwashers currently in `empty` state.
  - **Mitigation**: Ensure `ALLOWED_TRANSITIONS` for `dishwasher` allows `empty -> dirty` and `empty -> running` so legacy state recovers seamlessly.
- **[Risk] Multiple members adding chores simultaneously**:
  - **Mitigation**: Immediate WebSocket broadcast `CHORE_UPDATED` will trigger TanStack Query cache invalidations across all connected clients.
