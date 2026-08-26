> **TDD Requirement**: All implementation tasks MUST strictly follow the `/tdd` skill workflow. Write failing tests at agreed public seams (API endpoints, public service boundaries, UI user interactions) before writing production code (Red → Green). Implement vertical slices one at a time.

## 1. Project Scaffolding & Test Harness Setup

- [x] 1.1 Scaffold backend directory with Python 3.12 requirements (`fastapi`, `uvicorn`, `sqlalchemy`, `asyncpg`, `alembic`, `pydantic`, `pywebpush`, `python-jose`, `passlib`, `pytest`, `pytest-asyncio`, `httpx`)
- [x] 1.2 Scaffold frontend directory with Vite, React 19, TypeScript, Tailwind CSS, Lucide React, Vitest, and React Testing Library
- [x] 1.3 Configure root `docker-compose.yml` for local development (PostgreSQL 16, backend, frontend) and setup pytest test database fixtures

## 2. Database Models & Schema Migrations (TDD)

- [x] 2.1 Write model tests verifying table relationships, cascade deletes, and constraints for `Household`, `Member`, `Chore`, `ChoreAssignment`, `ChoreLog`, `Appliance`, `ApplianceStateLog`, and `PushSubscription`
- [x] 2.2 Implement SQLAlchemy async declarative models passing all model tests
- [x] 2.3 Configure Alembic async migrations, run initial migration, and write migration upgrade/downgrade test

## 3. Household Core & Member Authentication (TDD)

- [x] 3.1 Write failing API tests for household creation (`POST /api/v1/households`) and invite code generation
- [x] 3.2 Implement household creation endpoint to make tests pass (Green)
- [x] 3.3 Write failing API tests for roommate join flow (`POST /api/v1/households/join`) with invite code, nickname, and PIN
- [x] 3.4 Implement join endpoint and session JWT issuance to make tests pass (Green)
- [x] 3.5 Write failing API tests for member login (`POST /api/v1/auth/login`) and PIN verification
- [x] 3.6 Implement login endpoint to make tests pass (Green)
- [x] 3.7 Write failing API tests for member 'away' status toggle (`PATCH /api/v1/members/me/status`) and admin actions (`PATCH /api/v1/households/invite-code`, `DELETE /api/v1/members/{id}`)
- [x] 3.8 Implement status toggle and admin endpoints with role authorization to make tests pass (Green)

## 4. Chore Management Backend (TDD)

- [x] 4.1 Write failing API tests for chore CRUD operations (`POST/GET/PATCH/DELETE /api/v1/chores`)
- [x] 4.2 Implement chore CRUD endpoints to make tests pass (Green)
- [x] 4.3 Write failing unit/integration tests for weekly round-robin duty rotation engine, including skipping 'away' members
- [x] 4.4 Implement weekly rotation engine to make tests pass (Green)
- [x] 4.5 Write failing API tests for hybrid completion (`POST /api/v1/chores/assignments/{id}/complete` and `POST /api/v1/chores/assignments/{id}/log`)
- [x] 4.6 Implement completion and logging endpoints to make tests pass (Green)
- [x] 4.7 Write failing API tests for "Up for Grabs" pool listing (`GET /api/v1/chores/up-for-grabs`) and claiming (`POST /api/v1/chores/assignments/{id}/claim`)
- [x] 4.8 Implement Up for Grabs pool endpoints to make tests pass (Green)
- [x] 4.9 Write failing API tests for 1-to-1 chore swaps (`POST /api/v1/chores/assignments/{id}/swap`)
- [x] 4.10 Implement chore swap endpoint to make tests pass (Green)


## 5. Appliance State Tracking Backend (TDD)

- [x] 5.1 Write failing API tests for appliance listing and preset seeding (`GET/POST /api/v1/appliances`)
- [x] 5.2 Implement appliance listing and preset initialization to make tests pass (Green)
- [x] 5.3 Write failing API tests for 4-state state machine transitions (`POST /api/v1/appliances/{id}/state`) and state log audit history
- [x] 5.4 Implement state transition logic and history endpoint to make tests pass (Green)
- [x] 5.5 Write failing API tests for IoT sensor webhook ingestion (`POST /api/v1/appliances/{id}/sensor-event`)
- [x] 5.6 Implement sensor webhook handler to make tests pass (Green)

## 6. Real-Time WebSockets & Web Push Notifications (TDD)

- [x] 6.1 Write failing integration tests for household WebSocket room connection and event broadcasting
- [x] 6.2 Implement FastAPI WebSocket manager (`WS /api/v1/ws/{household_id}`) broadcasting state events to make tests pass (Green)
- [x] 6.3 Write failing tests for VAPID key retrieval, push subscription storage, and push dispatch payload construction
- [x] 6.4 Implement Web Push subscription endpoints and background push dispatcher to make tests pass (Green)

## 7. Frontend UI Components & State Management (TDD)

- [x] 7.1 Write component tests and implement App shell layout, navigation header, and household status badge
- [x] 7.2 Write component tests and implement Onboarding flow (Household creation, invite code entry, and PIN login)
- [x] 7.3 Write component tests and implement Appliance Dashboard (1-tap state toggles, elapsed duration chip, and activity feed)
- [x] 7.4 Write component tests and implement Chore Duty view (Weekly duty cards, single-tap complete, duty log button, and Away toggle)
- [x] 7.5 Write component tests and implement "Up for Grabs" pool view and 1-tap claim interaction
- [x] 7.6 Write integration tests for TanStack Query and WebSocket live sync handling state updates in real time

## 8. PWA Service Worker & Push Client (TDD)

- [x] 8.1 Write tests and implement `manifest.json`, PWA icons, and mobile install prompt
- [x] 8.2 Implement Service Worker push listener and notification click handler
- [x] 8.3 Implement Web Push subscription prompt and toggle in household settings

## 9. End-to-End Verification & Documentation

- [x] 9.1 Run full backend pytest test suite and frontend Vitest suite, ensuring 100% pass rate
- [x] 9.2 Build and verify Docker Compose stack (`docker compose up --build`)
- [x] 9.3 Perform multi-client end-to-end sync verification simulating simultaneous roommate actions
- [x] 9.4 Create README.md with self-hosting instructions and API documentation links
