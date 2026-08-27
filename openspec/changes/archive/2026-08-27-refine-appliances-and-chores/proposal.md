## Why

Roommates need intuitive, low-friction domestic tracking. Currently:
1. The appliance creation UI allows adding "Custom Appliances", but without custom cycle definitions or sensor rules, creating confusion; custom appliances should be deferred to a dedicated future feature.
2. The frontend lacks an "Add Chore" interface, preventing households from adding new duties after onboarding.
3. Empty washers and dryers incorrectly display a "NEEDS EMPTYING" rubber stamp rather than "READY TO RUN!", and emptied dishwashers require a redundant manual "Mark Dirty" step instead of immediately entering the dirty/loading state.

## What Changes

- **Remove Custom Appliance Creation**: Restrict appliance creation in the UI to supported presets (`dishwasher`, `washer`, `dryer`). Keep existing database schemas backwards-compatible.
- **Frontend Chore Creation UI**: Add an "Add Chore" action and stationery-styled modal slip in `ChoreDutyView` to create new weekly and continuous duties.
- **Immediate Assignment Generation**: Automatically assign newly created chores for the current week so they immediately appear on the duty ledger.
- **Appliance State Cycles Overhaul**:
  - Update washer and dryer `empty` state badge and label to display "READY TO RUN!" (or "READY") instead of "NEEDS EMPTYING".
  - Refactor dishwasher lifecycle so marking a clean dishwasher emptied transitions directly to `dirty` (ready for dirty dishes), eliminating the manual "Mark Dirty" intermediate step.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `appliance-tracking`: Streamline dishwasher state transitions to cycle from `clean_needs_emptying` directly to `dirty`, update empty washer/dryer rubber stamp to indicate ready-to-run availability, and restrict appliance creation to standard presets.
- `chore-management`: Enable household members to create chores directly from the active chore view with immediate current-week assignment generation.

## Impact

- **Frontend**: `ApplianceDashboard.tsx`, `ApplianceCard.tsx`, `RubberStampBadge.tsx`, `ChoreDutyView.tsx`, `App.tsx`, and new `CreateChoreModal.tsx` component.
- **Backend**: `backend/app/routers/appliances.py` (transitions for dishwasher), `backend/app/routers/chores.py` (triggering assignment on chore creation), and `backend/app/services/chore_service.py`.
- **Tests**: Vitest frontend tests and pytest backend tests for transitions, stamps, and chore creation.
