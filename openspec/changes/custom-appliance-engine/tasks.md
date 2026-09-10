## 1. Database Schema & Migration

- [x] 1.1 Create Alembic migration to add `state_step_1` through `state_step_5`, timer columns (`timer_enabled`, `default_timer_minutes`, `timer_duration_minutes`, `timer_started_at`, `timer_ends_at`), drop `ck_appliance_state`, backfill existing appliances to 3-step cycles (`needs_attention`), and add new check constraints (`ck_appliance_current_state_in_steps`, `ck_appliance_canonical_states`).
- [x] 1.2 Update `Appliance` model in `backend/app/models.py` with the new columns, constraints, and helper methods (`get_ordered_steps()`, `get_next_state()`).
- [x] 1.3 Update Pydantic schemas in `backend/app/schemas.py` (`ApplianceCreate`, `ApplianceUpdate`, `ApplianceOut`, `ApplianceStateUpdate`) with validation for step slots and timer parameters.

## 2. Backend API & Transition Validation

- [x] 2.1 Refactor `update_appliance_state` in `backend/app/routers/appliances.py` to deterministically calculate next state from the appliance's non-null step slots instead of static dictionaries.
- [x] 2.2 Add timer duration validation when transitioning an appliance with `timer_enabled=true` into `running`, recording `timer_started_at` and `timer_ends_at`.
- [x] 2.3 Implement `POST /api/v1/appliances/{id}/reset` to abort active runs, reset state to `state_step_1`, and clear active timers.
- [x] 2.4 Implement `PUT /api/v1/appliances/{id}` allowing cycle step and timer editing, with automatic reset to `state_step_1` when steps change.
- [x] 2.5 Add timer completion notification service method in `backend/app/services/push_service.py` to notify household members when a timer ends.
- [x] 2.6 Update backend pytest suites (`test_appliance_state.py`, `test_appliances_crud.py`, `test_models.py`, `test_migrations.py`) using TDD.

## 3. Frontend Types, Rubber Stamps, & Timer Engine

- [x] 3.1 Update TypeScript types in `frontend/src/types/index.ts` to include step slot fields, timer metadata, and the canonical state union (`empty | dirty | running | needs_attention | clean`).
- [x] 3.2 Update `RubberStampBadge.tsx` to support stamps and colors for all canonical states (`empty`, `dirty`, `running`, `needs_attention`, `clean`).
- [x] 3.3 Update `ApplianceCard.tsx` with:
  - Dynamic single-button label and target from `appliance.state_steps`.
  - Timer duration quick-dial dialog (15m, 30m, 45m, 60m chips + custom input) before transitioning to running.
  - Live timer countdown display with acoustic chime (via `soundEngine`) when hitting 00:00.
  - Mandatory human confirmation prompt when timer finishes.
  - Secondary "Abort / Reset Cycle" action.

## 4. Guided "Add & Edit Appliance" Modal UI

- [x] 4.1 Build `AddApplianceModal.tsx` stationery dialog with name, icon picker, sequential cycle step builder (2 to 5 steps), and timer settings.
- [x] 4.2 Integrate `AddApplianceModal` into `ApplianceDashboard.tsx` with an "+ Add Appliance" trigger and edit triggers.
- [x] 4.3 Add Vitest unit tests in `ApplianceDashboard.test.tsx` and `ApplianceCard.test.tsx`.

## 5. Verification & Testing

- [x] 5.1 Run full backend test suite (`pytest`).
- [x] 5.2 Run full frontend test suite (`vitest`).
- [x] 5.3 Verify production frontend build (`npm run build`).
