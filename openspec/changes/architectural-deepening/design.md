## Context

An architectural review via `/improve-codebase-architecture` identified key friction points across the codebase where shallow modules, fat routers, and leaking abstractions impaired testability and maintainability. A comprehensive `/grill-me` session walked the full design tree across five candidates to define clean interface seams, explicit error hierarchies, encapsulated side-effects, and frontend hook architecture.

---

## Goals / Non-Goals

### Goals
- Turn shallow routers into thin network adapters (<100 lines each) that delegate all domain rules to deep services.
- Establish explicit domain exception hierarchies for Chores, Appliances, and Households, decoupling domain logic from HTTP transports.
- Encapsulate database commits, audit logs, WebSocket broadcasts, and push notification triggers inside domain services for transactional consistency.
- Prune speculative, unused IoT hardware code (`POST /api/v1/appliances/{id}/sensor-event`) and its associated schema and test suite.
- Unify household creation and onboarding, delegating default appliance seeding to the appliance service.
- Encapsulate frontend TanStack queries, mutations, query cache invalidations, and audio triggers into cohesive domain hooks (`useAppliances`, `useChores`).
- Thin `App.tsx` to an unhurried, readable top-level orchestrator (<80 lines).
- Eliminate ~400 lines of duplicated chore card JSX by extracting a unified, presentationally deep `ChoreCard.tsx` strictly conforming to the **Warm Minimalist Functionalism** design system (`DESIGN.md`).

### Non-Goals
- Changing database schemas or executing database migrations (current schema already supports all capabilities).
- Altering external REST API response shapes or breaking client contracts.
- Adding speculative mobile native bridges before backend and frontend domain deepening is verified.

---

## Decisions

### Decision 1: Deep Backend Domain Services with Explicit Domain Exceptions
- **Decision**: All domain operations are moved from HTTP routers into three consolidated services:
  - `chore_service.py`: Chore definitions, duty assignments, logs, bucket rotations.
  - `appliance_service.py`: Appliance CRUD, state transitions, step sequence validation, timer lifecycles, state logs, resets.
  - `household_service.py`: Household creation, invite codes, member onboarding, authentication, PIN verification.
- **Error Seam**: Services raise explicit domain exceptions (e.g. `ApplianceTransitionError`, `ChoreNotFoundError`, `NicknameConflictError`). Routers act purely as adapters catching these exceptions and returning standard HTTP status codes (404, 400, 401, 403).
- **Session Seam**: Explicit `db: AsyncSession` parameter passed into each service function to support atomic multi-operation transactions and isolated rollback testing in pytest fixtures.

### Decision 2: Encapsulation of Transaction Commits and Real-Time Sync
- **Decision**: Service functions are responsible for calling `await db.commit()`, refreshing entities, and dispatching real-time WebSocket broadcasts (`ws_manager.broadcast`) and push alerts (`notify_household_appliance_clean`).
- **Why**: Prevents callers from having to remember to commit or manually broadcast state sync events, guaranteeing data integrity and live multiplayer presence across all household clients.

### Decision 3: Removal of Speculative IoT Smart Plug Power Ingestion
- **Decision**: Completely remove the `POST /api/v1/appliances/{id}/sensor-event` endpoint, `SensorEventCreate` schema, and `test_appliance_sensor.py`. Update integration tests (`test_e2e_simulation.py`, `test_websockets.py`) to trigger state changes via authenticated user endpoints.
- **Why**: As aligned in the grill-me session, speculative smart plug wattage heuristics (>50W triggers running, <5W triggers clean) add dead weight and maintenance friction without providing core domestic coordination value.

### Decision 4: Delegated Seeding via Appliance Service
- **Decision**: During household creation, `household_service.py` calls `appliance_service.seed_default_appliances(db, household_id)` rather than directly constructing `Appliance` ORM objects.
- **Why**: Keeps canonical step sequences (`state_step_1`..`state_step_5`), appliance icons, and default timer durations defined in exactly one place.

### Decision 5: Frontend Domain-Split Hooks with Optional Domain Prop Injection
- **Decision**:
  - `useAppliances()` manages all appliance queries, mutations, query client invalidation, app badging counts, and sound effects.
  - `useChores()` manages all assignment queries, up-for-grabs pool queries, mutations, cache invalidation, and sound effects.
  - View components (`ChoreDutyView`, `ApplianceDashboard`) accept an optional domain prop (`chores?: ChoreDomain = useChores()`).
- **Why**: Eliminates 18+ callback props from `App.tsx` down to view components in production, while preserving instant unit testability (tests can pass a plain mock domain object without configuring TanStack Query providers or mocking module imports).

### Decision 6: Unified `ChoreCard.tsx` Aligned with Warm Minimalist Functionalism
- **Decision**: Extract `ChoreCard.tsx` with variant/context support (`mine`, `roommate`, `pool`).
- **Design System Rules (`DESIGN.md`)**:
  - Warm, anti-glare card surfaces (`#FDFAF6` light / `#1F1D1A` dark) with subtle 1px border (`#E5DFD7`).
  - Radical omission of skeuomorphic brass spirals, notebook ruled lines, and fake washi tape.
  - Left-aligned Swiss typography with generous active negative space.
  - Modular geometric identity marks (`IdentitySticker`) and tactile status badges.
  - Mobile-first 44x44px minimum touch targets.

---

## Seams & Interfaces

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND DOMAIN SEAMS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   HTTP Routers (Thin Adapters < 100 lines)                                  │
│   [routers/chores.py]    [routers/appliances.py]   [routers/households.py]  │
│            │                        │                        │              │
│            ▼                        ▼                        ▼              │
│   Domain Services                                                           │
│   [chore_service.py]     [appliance_service.py]    [household_service.py]   │
│            │                        │                        │              │
│            ├─ Domain Exceptions ────┴────────────────────────┤              │
│            ├─ Database Commits & Audit Logs ─────────────────┤              │
│            └─ WebSocket Broadcasts & Push Alerts ────────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND DOMAIN SEAMS                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Top-Level Orchestrator (App.tsx < 80 lines)                               │
│   - Tabs, Auth Guards, Global Providers                                     │
│                                                                             │
│   Domain Hooks                                                              │
│   [useAppliances()]                       [useChores()]                     │
│   - React Query queries & mutations       - React Query queries & mutations │
│   - Cache invalidation                    - Cache invalidation              │
│   - Sound triggers & badging              - Sound triggers                  │
│            │                                       │                        │
│            ▼                                       ▼                        │
│   View Components                                                           │
│   [ApplianceDashboard]                    [ChoreDutyView]  [UpForGrabsPool] │
│            │                                       │              │         │
│            ▼                                       ▼              ▼         │
│   Presentation Cards                                                        │
│   [ApplianceCard]                         [ChoreCard (mine/roommate/pool)]  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
