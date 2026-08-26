## Why

Living with roommates creates daily friction around household labor, accountability, and appliance availability (e.g., dirty dishes placed into a clean dishwasher, wet laundry left sitting, forgotten chores, and asymmetric chore distributions). Existing task apps are either too generic, overly gamified, or require high-friction account creation that roommates abandon. 

This project delivers a self-hostable, low-friction Household Coordination app designed specifically for shared living spaces. It provides real-time appliance state visibility, fair weekly chore rotation with flexible execution, zero-friction roommate onboarding via invite codes, and standard Web Push notifications.

## What Changes

- **Self-Hostable Architecture**: Fullstack application composed of a Python FastAPI async backend, PostgreSQL database, React (Vite + TypeScript + Tailwind CSS) frontend PWA, and Docker Compose orchestration.
- **Household & Member Management**: Multi-household data isolation, 6-character alphanumeric invite code joining, nickname + optional PIN authentication (no mandatory email/SMTP), and admin/member role permissions.
- **Chore Management & Weekly Duty Cycles**: Weekly responsibility shifts supporting both "single check-off" tasks and "continuous duty" logging, fair round-robin rotation, away skips, 1-to-1 swaps, and an "up for grabs" claim pool.
- **Appliance State Tracking**: Real-time 4-state machine for appliances with presets (Dishwasher, Washer, Dryer) and custom devices, 1-tap manual state toggles, elapsed time counters, and recent activity audit logs.
- **Real-Time Sync & Notifications**: FastAPI WebSocket rooms broadcasting instant state changes to all roommates, and standard Web Push notifications via VAPID/Service Worker for appliance completion and chore reminders.

## Capabilities

### New Capabilities
- `household-core`: Multi-household scoping, 6-character invite code generation and validation, member join flow with nickname and optional PIN, creator-admin permissions, and member away/vacation status.
- `chore-management`: Chore definitions (cadence, effort weight, completion type), weekly duty assignments, round-robin rotation scheduler, completion logging, away skip handling, chore swaps, and unassigned chore claiming pool.
- `appliance-tracking`: Appliance configuration with preset state machines (Dishwasher, Washing Machine, Dryer, Custom), 1-tap state transitions, elapsed duration tracking, activity feed, and IoT-ready sensor event ingestion schema.
- `notification-system`: Browser Web Push API integration with backend VAPID keypair generation and subscription persistence, background service worker push listener, and real-time WebSocket event broadcasting per household.

### Modified Capabilities
<!-- None: Greenfield project -->

## Impact

- **New Codebase**: Greenfield repository initializing `/backend` (FastAPI, SQLAlchemy, Alembic, Pydantic), `/frontend` (React, Vite, Tailwind CSS, TanStack Query), and root `docker-compose.yml`.
- **APIs**: REST endpoints under `/api/v1/` for households, members, chores, appliances, and push subscriptions; WebSocket endpoint under `/api/v1/ws/{household_id}`.
- **Database**: PostgreSQL schema with tables for `households`, `members`, `chores`, `chore_assignments`, `chore_logs`, `appliances`, `appliance_state_logs`, and `push_subscriptions`.
- **Dependencies**: Python 3.12+, FastAPI, SQLAlchemy 2.0, asyncpg, Alembic, pywebpush, React 19, Vite, Tailwind CSS, Lucide React.
