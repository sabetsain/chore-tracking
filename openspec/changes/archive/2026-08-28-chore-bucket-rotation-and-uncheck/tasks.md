## 1. Backend Core & API Implementation (TDD)

- [x] 1.1 Write backend unit and integration tests in `backend/tests/test_chore_rotation.py` and `backend/tests/test_chore_completion.py` verifying greedy LPT bucket partitioning, dynamic new chore placement, collaborative reassignment, and uncomplete authorization.
- [x] 1.2 Implement the greedy LPT bucket partitioning algorithm and epoch-based rotation schedule in `backend/app/services/chore_service.py`.
- [x] 1.3 Add dynamic lowest-weight bucket placement for newly created chores in `backend/app/routers/chores.py` and `backend/app/services/chore_service.py`.
- [x] 1.4 Implement the `POST /api/v1/chores/assignments/{assignment_id}/uncomplete` endpoint and add assigned-member authorization checks to both complete and uncomplete handlers in `backend/app/routers/chores.py`.
- [x] 1.5 Implement the `PATCH /api/v1/chores/assignments/{assignment_id}/reassign` endpoint for collaborative 1-week overrides and broadcast `CHORE_UPDATED` WebSocket events.


## 2. Frontend Stationery UI & Interaction (TDD)

- [x] 2.1 Write frontend component tests in `frontend/src/components/ChoreDutyView.test.tsx` and `frontend/src/components/stationery/stationery.test.tsx` covering unchecking completed chores, reassignment dropdowns, and read-only permissions for other members' duties.
- [x] 2.2 Add `uncompleteChoreAssignment` and `reassignChoreAssignment` methods to API client and App context.
- [x] 2.3 Update `ScribbleCheckbox.tsx` to support toggleable unchecking with tactile pencil and eraser sound effects.
- [x] 2.4 Update `ChoreDutyView.tsx` to allow unchecking completed tasks, display an inline member reassignment dropdown, and render read-only checkboxes for duties assigned to roommates.

## 3. End-to-End Verification & Knowledge Graph Sync

- [x] 3.1 Run full backend test suite with `backend/.venv/bin/pytest backend/tests`.
- [x] 3.2 Run full frontend test suite with `npm --prefix frontend test -- --run` and run `npm --prefix frontend run build`.
- [x] 3.3 Rebuild frontend container image in Docker and verify real-time WebSocket sync.
