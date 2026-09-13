## 1. Backend Chore Domain Consolidation (Candidate 1)

- [x] 1.1 Define domain exceptions (`ChoreNotFoundError`, `ChoreValidationError`, `ChorePermissionError`) in `backend/app/services/chore_service.py`.
- [x] 1.2 Move chore template CRUD operations (`list_chores`, `create_chore`, `update_chore`, `delete_chore`) from `routers/chores.py` into `chore_service.py` with encapsulated commits and WebSocket broadcasts.
- [x] 1.3 Move duty assignment operations (`claim_chore`, `unclaim_chore`, `complete_chore`, `uncomplete_chore`, `reassign_chore`, `swap_chore`, `log_duty`) into `chore_service.py`.
- [x] 1.4 Move bucket rotation triggers and recalculations (`activate_rotation`, `deactivate_rotation`, `reshuffle_rotation`) into `chore_service.py`.
- [x] 1.5 Refactor `backend/app/routers/chores.py` to act as a thin HTTP adapter (<100 lines) mapping domain exceptions to HTTP status codes (404, 400, 403).
- [x] 1.6 Verify and maintain all backend chore tests in `backend/tests/test_chores_crud.py`, `test_chore_completion.py`, `test_chore_rotation.py`, `test_chore_swap.py`, `test_chore_unclaim_and_management.py`.

## 2. Encapsulated Appliance State Machine & Removal of Sensor Events (Candidate 2)

- [x] 2.1 Define domain exceptions (`ApplianceNotFoundError`, `ApplianceTransitionError`, `ApplianceValidationError`, `AppliancePermissionError`) in `backend/app/services/appliance_service.py`.
- [x] 2.2 Implement `backend/app/services/appliance_service.py` with:
  - `list_appliances` and `create_appliance`
  - `transition_appliance_state`: cycle step sequence validation, canonical state alias mapping (`clean_needs_emptying` <-> `needs_attention`), force overrides, timer duration handling, `ApplianceStateLog` audit trail, `ws_manager` broadcast, and push notification triggers
  - `reset_appliance`: cycle abort/reset to Step 1 and timer clearing
  - `update_appliance`: step editing with auto-reset to Step 1
  - `get_appliance_history`: state transition audit log retrieval
  - `seed_default_appliances`: canonical Washer, Dryer, and Dishwasher seeding
- [x] 2.3 Remove the speculative IoT smart plug endpoint `POST /api/v1/appliances/{id}/sensor-event` from `routers/appliances.py`, remove `SensorEventCreate` from `schemas.py`, and remove `test_appliance_sensor.py`.
- [x] 2.4 Update integration tests (`test_e2e_simulation.py`, `test_websockets.py`) that referenced `sensor-event` to use standard user state transitions.
- [x] 2.5 Refactor `backend/app/routers/appliances.py` into a thin HTTP adapter (<80 lines) delegating to `appliance_service.py` and translating domain exceptions.
- [x] 2.6 Run and verify backend appliance test suites (`test_appliance_state.py`, `test_appliances_crud.py`).

## 3. Household Onboarding & Auth Service (Candidate 3)

- [x] 3.1 Define domain exceptions (`HouseholdNotFoundError`, `MemberNotFoundError`, `NicknameConflictError`, `InvalidCredentialsError`, `InviteCodeGenerationError`) in `backend/app/services/household_service.py`.
- [x] 3.2 Implement `backend/app/services/household_service.py` with:
  - `create_household`: unique 6-character invite code generation, admin member creation, delegating appliance seeding to `appliance_service.seed_default_appliances()`, and JWT token issuance
  - `join_household`: invite code verification, nickname collision check, member addition, and JWT token issuance
  - `regenerate_invite_code`: admin invite code regeneration
  - `login_member`: household lookup, PIN verification, and JWT token issuance
  - `get_me`, `update_member_status`, `delete_member`
- [x] 3.3 Refactor `backend/app/routers/households.py`, `backend/app/routers/auth.py`, and `backend/app/routers/members.py` into thin adapters delegating to `household_service.py`.
- [x] 3.4 Run and verify household and auth backend test suites (`test_households.py`, `test_auth.py`, `test_member_admin.py`).

## 4. Frontend Domain Hooks & Orchestrator Thinning (Candidate 4)

- [x] 4.1 Create `frontend/src/hooks/useAppliances.ts` encapsulating `useQuery` for appliances, mutations (`updateState`, `create`, `update`, `reset`), query invalidation, badging count, and sound triggers.
- [x] 4.2 Create `frontend/src/hooks/useChores.ts` encapsulating `useQuery` for assignments and pool, mutations (`claim`, `unclaim`, `complete`, `uncomplete`, `reassign`, `swap`, `rotate`, `create`, `update`, `delete`), query invalidation, and sound triggers.
- [x] 4.3 Update `ApplianceDashboard.tsx` to accept an optional `appliances?: ApplianceDomain` prop (defaulting to `useAppliances()`).
- [x] 4.4 Update `ChoreDutyView.tsx` to accept an optional `chores?: ChoreDomain` prop (defaulting to `useChores()`), replacing the 18 callback props.
- [x] 4.5 Refactor `frontend/src/App.tsx` from 441 lines to <80 lines, eliminating prop drilling while preserving tab navigation and global providers.
- [x] 4.6 Verify frontend test suite passes (`npm --prefix frontend test -- --run`).

## 5. Unified ChoreCard Component & Warm Minimalist Presentation (Candidate 5)

- [x] 5.1 Implement `frontend/src/components/ChoreCard.tsx` supporting `variant?: 'mine' | 'roommate' | 'pool'`.
- [x] 5.2 Align `ChoreCard.tsx` strictly with `DESIGN.md` (Warm Minimalist Functionalism: `#FDFAF6` card surface, subtle border, Swiss grid typography, geometric `IdentitySticker`, tactile status stamps, 44x44px touch ergonomics, eliminating fake notebook clutters).
- [x] 5.3 Integrate `ChoreCard` into `ChoreDutyView.tsx` and `UpForGrabsPool.tsx`, removing ~400 lines of duplicated card markup.
- [x] 5.4 Add unit tests for `ChoreCard` in `frontend/src/components/ChoreCard.test.tsx`.
- [x] 5.5 Run full frontend test suite (`npm --prefix frontend test -- --run`) and verify production build (`npm --prefix frontend run build`).

## 6. Full Verification & Knowledge Graph Update

- [x] 6.1 Run full backend test suite (`backend/.venv/bin/pytest backend/tests`).
- [x] 6.2 Run full frontend test suite (`npm --prefix frontend test -- --run`).
- [x] 6.3 Run `/graphify --update` to refresh `graphify-out/graph.json`, `graph.html`, and `GRAPH_REPORT.md`.
