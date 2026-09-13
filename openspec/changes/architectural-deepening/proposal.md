## Why

As the Household Coordination codebase prepares for platform expansion, an architectural review via `/improve-codebase-architecture` and a comprehensive `/grill-me` alignment session identified several shallow modules, tight couplings, and leaky abstractions across both the backend and frontend:

1. **Leaky Chore Seams & Fat Routers**: Chore domain logic, assignment lifecycles, and rotations are split awkwardly between `backend/app/routers/chores.py` (594 lines) and `backend/app/services/chore_service.py` (384 lines). The router directly executes business validations, database queries, and WebSocket broadcasts instead of acting as a thin network adapter.
2. **Unencapsulated Appliance State Machine**: `backend/app/routers/appliances.py` (382 lines) contains inline state transition checks, canonical state alias mapping, timer resets, audit logging (`ApplianceStateLog`), push alerts, and speculative IoT smart plug power threshold heuristics. These operations lack a dedicated domain service.
3. **Speculative Hardware Ingestion**: The smart plug power-sensing webhook (`POST /api/v1/appliances/{id}/sensor-event`) and its associated schema and test suite add premature complexity that was evaluated during grilling and decided to be removed.
4. **Scattered Household Onboarding & Auth**: Household creation, unique invite code generation/rotation, member joining, PIN authentication, and initial appliance seeding are scattered across `households.py`, `auth.py`, and `members.py`, with default appliance definitions hardcoded inside the router.
5. **Frontend Orchestration Clutter & Prop-Drilling**: `frontend/src/App.tsx` (441 lines) manually manages 30+ separate TanStack queries and mutations and drills 18+ callback props down into view components (`ChoreDutyView`, `ApplianceDashboard`).
6. **Duplicated Chore Card Markup & Outdated Stationery Skeuomorphism**: No standalone `ChoreCard` component exists; ~400 lines of card markup and actions are duplicated across `ChoreDutyView.tsx` and `UpForGrabsPool.tsx`. Furthermore, lingering skeuomorphic styling needs to be aligned with the **Warm Minimalist Functionalism** defined in `DESIGN.md`.

---

## What Changes

### 1. Deep Backend Domain Services (Candidates 1, 2, 3)
- **Unified Chore Domain Module (`chore_service.py`)**:
  - Consolidate chore template CRUD, weekly duty assignments (claiming, unclaiming, completing, uncompleting, reassigning, swapping, continuous duty logs), and bucket rotation algorithms into `backend/app/services/chore_service.py`.
  - Service functions raise explicit domain exceptions (`ChoreNotFoundError`, `ChoreValidationError`, `ChorePermissionError`).
  - Encapsulate `db.commit()` and WebSocket broadcasts (`CHORE_UPDATED`, `CHORE_ROTATION_CHANGED`) inside the service.
  - Thin `backend/app/routers/chores.py` from 594 lines to <100 lines as a pure HTTP translation adapter.
- **Encapsulated Appliance State Machine (`appliance_service.py`)**:
  - Create `backend/app/services/appliance_service.py` to encapsulate appliance CRUD, multi-step state transitions, canonical alias mapping (`clean_needs_emptying` <-> `needs_attention`), force transitions, timer start/stop calculations, `ApplianceStateLog` audit logging, and reset handling.
  - Service functions raise explicit domain exceptions (`ApplianceNotFoundError`, `ApplianceTransitionError`, `ApplianceValidationError`, `AppliancePermissionError`).
  - Encapsulate `db.commit()`, `ApplianceStateLog` persistence, `ws_manager.broadcast("APPLIANCE_STATE_CHANGED")`, and push notifications (`notify_household_appliance_clean`).
  - Thin `backend/app/routers/appliances.py` from 382 lines to <80 lines.
  - **Prune/Remove Smart Plug Webhook**: Delete the `POST /api/v1/appliances/{id}/sensor-event` endpoint, `SensorEventCreate` schema, and `test_appliance_sensor.py`, updating affected integration tests.
- **Unified Household & Membership Service (`household_service.py`)**:
  - Create `backend/app/services/household_service.py` to handle household creation, unique invite code generation/regeneration, member onboarding/joining, member status management, and login authentication/PIN verification.
  - Delegate initial appliance seeding to `appliance_service.seed_default_appliances(db, household_id)`.
  - Service functions raise explicit domain exceptions (`HouseholdNotFoundError`, `MemberNotFoundError`, `NicknameConflictError`, `InvalidCredentialsError`).
  - Thin `households.py`, `auth.py`, and `members.py` to simple HTTP adapters.

### 2. Frontend Domain Hooks & Orchestration Thinning (Candidate 4)
- Create `frontend/src/hooks/useAppliances.ts` and `frontend/src/hooks/useChores.ts`:
  - `useAppliances()`: Encapsulates queries (`['appliances']`), mutations (update state, create, update, reset), cache invalidations, badging count calculations, and sound engine effects.
  - `useChores()`: Encapsulates queries (`['chores', 'assignments']`, `['chores', 'up-for-grabs']`), mutations (claim, unclaim, complete, uncomplete, reassign, swap, rotate, create, update, delete), cache invalidations, and sound engine effects.
- Adopt the **Container / Optional Domain Prop** pattern: View components (`ChoreDutyView`, `ApplianceDashboard`) accept an optional domain prop (`chores?: ChoreDomain = useChores()`), allowing default automatic execution in runtime while enabling effortless mock object injection in unit tests without configuring TanStack Query providers.
- Thin `frontend/src/App.tsx` from 441 lines to <80 lines, focusing purely on top-level navigation, authentication guards, and global providers.

### 3. Unified Chore Card Presentation Module (Candidate 5)
- Extract a unified `frontend/src/components/ChoreCard.tsx` with variant support (`mine`, `roommate`, `pool`).
- Encapsulate duty state display, action buttons (complete, unclaim, swap, reassign, log duty), sound triggers, and confetti celebrations.
- Strictly adhere to `DESIGN.md` (Warm Minimalist Functionalism):
  - Eliminate skeuomorphic spirals, fake washi tape, and lined notebook textures.
  - Implement warm anti-glare card surfaces (`#FDFAF6` light / `#1F1D1A` dark) with subtle 1px border (`#E5DFD7`).
  - Maintain Swiss-grid typography, clear visual hierarchy, geometric `IdentitySticker` badges, tactile status stamps, and 44x44px minimum touch targets.
- Remove ~400 lines of duplicated card rendering from `ChoreDutyView.tsx` and `UpForGrabsPool.tsx`.

---

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `chore-management`: Deepen chore service domain, raise explicit domain exceptions, thin HTTP router, extract unified `ChoreCard` component aligned with warm minimalist design system.
- `appliance-tracking`: Deepen appliance state machine service, raise explicit domain exceptions, thin HTTP router, remove speculative IoT smart plug power ingestion webhook.
- `household-core`: Deepen household onboarding, membership, and authentication into `household_service`, delegating default appliance seeding to `appliance_service`.

---

## Impact

- **Backend Architecture**:
  - New service modules: `backend/app/services/appliance_service.py`, `backend/app/services/household_service.py`.
  - Consolidated service module: `backend/app/services/chore_service.py`.
  - Dramatically thinned routers (<100 lines each): `routers/chores.py`, `routers/appliances.py`, `routers/households.py`, `routers/auth.py`, `routers/members.py`.
  - Pruned files/endpoints: `POST /appliances/{id}/sensor-event`, `SensorEventCreate` schema, and `backend/tests/test_appliance_sensor.py`.
- **Frontend Architecture**:
  - New custom domain hooks: `frontend/src/hooks/useAppliances.ts`, `frontend/src/hooks/useChores.ts`.
  - New presentation component: `frontend/src/components/ChoreCard.tsx`.
  - Refactored components: `frontend/src/components/ChoreDutyView.tsx`, `frontend/src/components/UpForGrabsPool.tsx`, `frontend/src/components/ApplianceDashboard.tsx`.
  - Thinned top-level orchestrator: `frontend/src/App.tsx` (<80 lines).
- **Test Suites**:
  - Backend pytest suites updated to test domain services directly alongside thinned HTTP router integration tests.
  - Frontend Vitest suites updated to test `ChoreCard` and view components with mock domain objects.
- **Knowledge Graph**:
  - Knowledge graph updated via `/graphify --update` after implementation.
