## Why

In shared domestic living, households frequently operate non-standard appliances (espresso machines, robotic vacuums, air purifiers, fermentation chambers, rice cookers) that do not fit into the hardcoded 3-appliance preset system (Dishwasher, Washing Machine, Dryer).

Currently:
1. The backend hardcodes allowed state transitions in a Python dictionary (`ALLOWED_TRANSITIONS`) and enforces a rigid database check constraint (`ck_appliance_state`), preventing new appliances with customized lifecycles.
2. Appliance lifecycles are restricted to 4 fixed states (`empty`, `dirty`, `running`, `clean_needs_emptying`).
3. Timers do not exist on appliances—members cannot set a cycle duration, and there is no domestic accountability for verifying that a finished appliance has actually been handled by a human.
4. The frontend creation UI only permits selecting from the 3 fixed presets, lacking a guided setup to add custom machinery with tailored cycle steps.

## What Changes

- **Database-Enforced Linear State Machine**:
  - Add positional cycle step columns (`state_step_1` through `state_step_5`) to the `appliances` table. The non-null/non-empty slots define the appliance's linear lifecycle ($S_1 \rightarrow S_2 \rightarrow \dots \rightarrow S_k \rightarrow S_1$).
  - Replace the rigid `ck_appliance_state` constraint with:
    - `ck_appliance_current_state_in_steps`: Enforces `current_state IN (state_step_1, state_step_2, state_step_3, state_step_4, state_step_5)`.
    - `ck_appliance_canonical_states`: Enforces that each configured step belongs to the canonical universe of states (`empty`, `dirty`, `running`, `needs_attention`, `clean`).
  - Backfill existing appliances (`washer`, `dryer`, `dishwasher`) into their appropriate linear step configurations (streamlined 3-step loops).
- **Dynamic Transition Validation & Cycle Control**:
  - Remove hardcoded transition dictionaries in `appliances.py`. The backend deterministically validates that any state update request transitions to the immediate next non-null step in the appliance's configured cycle (wrapping back to `state_step_1`).
  - Add an "Abort / Reset Cycle" action (`POST /api/v1/appliances/{id}/reset`) to return an in-progress appliance to Step 1 and clear any active timer.
  - Allow updating cycle steps at any time (`PUT /api/v1/appliances/{id}`), automatically resetting `current_state` to Step 1 and clearing active timers if steps change.
- **Mandatory Cycle Timers & Multi-Channel Completion Alerts**:
  - Add timer fields: `timer_enabled` (boolean), `default_timer_minutes`, `timer_duration_minutes`, `timer_started_at`, and `timer_ends_at`.
  - When starting an appliance with `timer_enabled = true`, the user must provide a timer duration using quick-tap chips (15m, 30m, 45m, 60m, default) or custom minutes.
  - When the timer reaches 00:00, the appliance does NOT auto-advance; it triggers an in-app acoustic chime (`soundEngine`), shows a "Timer Complete — Confirmation Needed" alert, and dispatches a Web Push notification to the household until a roommate physically confirms the transition.
- **Guided "Add & Edit Appliance" UI & Card Redesign**:
  - Introduce a guided "Add Appliance" stationery modal in `ApplianceDashboard.tsx` allowing roommates to specify the appliance name, icon, select 2 to 5 cycle steps in order, and configure timer options.
  - Update `ApplianceCard.tsx` to render dynamic action buttons based on the appliance's next configured state, countdown timers for active runs, and confirmation prompts upon timer expiry.
  - Add new luxury stationery rubber stamps for `needs_attention` and `clean`.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `appliance-tracking`: Support linear custom appliance lifecycles via database-enforced step slots, canonical state universe, mandatory run timers, cycle reset/editing safeguards, and human confirmation upon timer completion.

## Impact

- **Database**: New Alembic migration modifying `appliances` table (adding `state_step_1..5`, timer columns, dropping old check constraint, adding new constraints, backfilling existing rows to 3-step cycles).
- **Backend API**: `backend/app/models.py`, `backend/app/schemas.py`, `backend/app/routers/appliances.py` (dynamic next-state validation, reset endpoint, update endpoint, timer requirements).
- **Frontend**: `frontend/src/types/index.ts`, `frontend/src/components/ApplianceCard.tsx`, `frontend/src/components/ApplianceDashboard.tsx`, new `AddApplianceModal.tsx`, `frontend/src/components/stationery/RubberStampBadge.tsx`.
- **Tests**: Pytest suites (`test_appliance_state.py`, `test_appliances_crud.py`, `test_models.py`, `test_migrations.py`) and Vitest frontend suites (`ApplianceDashboard.test.tsx`, `ApplianceCard.test.tsx`).
