## 1. Backend Transition & Chore Assignment Adjustments

- [x] 1.1 Update `ALLOWED_TRANSITIONS` in `backend/app/routers/appliances.py` for `dishwasher` to allow direct transition from `clean_needs_emptying` to `dirty`.
- [x] 1.2 Update chore creation endpoint in `backend/app/routers/chores.py` to auto-provision an assignment for the active current week.
- [x] 1.3 Update pytest suites in `test_appliance_state.py` and `test_chores_crud.py` to verify dishwasher state transitions and immediate weekly assignment creation.

## 2. Appliance UI & Rubber Stamp Improvements

- [x] 2.1 Remove "Custom Appliance" option from the `<select>` dropdown in `ApplianceDashboard.tsx` and default to `dishwasher`.
- [x] 2.2 Update `RubberStampBadge.tsx` so `empty` state displays "READY TO RUN!" instead of "NEEDS EMPTYING", and adjust color/styling appropriately.
- [x] 2.3 Update `ApplianceCard.tsx` transition config so dishwasher in `clean_needs_emptying` transitions directly to `dirty` with a "Mark Emptied" button.
- [x] 2.4 Update frontend Vitest tests in `ApplianceDashboard.test.tsx` and `RubberStampBadge.test.tsx` to verify new button actions and stamps.

## 3. Chore Creation UI Implementation

- [x] 3.1 Create stationery-styled `CreateChoreModal.tsx` dialog with Title, Description, Effort Weight (1-5), and Duty Type (`single_weekly` vs `continuous_duty`).
- [x] 3.2 Add "+ Add Chore" action button to `ChoreDutyView.tsx` and connect it to `CreateChoreModal` and `api.createChore`.
- [x] 3.3 Add Vitest tests for `ChoreDutyView.tsx` verifying chore creation and modal interactions.

## 4. End-to-End Verification & Graph Update

- [x] 4.1 Run full backend test suite (`pytest`) and frontend test suite (`vitest`).
- [x] 4.2 Rebuild frontend production build (`npm run build`).
