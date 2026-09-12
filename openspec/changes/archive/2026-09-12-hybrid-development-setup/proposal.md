## Why

In the current development environment, Docker Compose orchestrates the full production-like stack (PostgreSQL 16, FastAPI backend, and Nginx frontend). While this provides a representative deployment simulation, it introduces significant development friction:
1. **Slow Feedback Loops**: Frontend HMR and backend hot-reloading across container boundaries suffer from filesystem notification latency and container rebuild overhead.
2. **Debugger Inconvenience**: Running FastAPI in a container makes attaching interactive IDE debuggers (VS Code / PyCharm / pdb) cumbersome.
3. **Container-Tethered Migrations**: Database migrations are coupled to container boot (`sh -c "alembic upgrade head && uvicorn ..."`), providing no standalone developer tool to run, inspect, rollback, or verify Alembic migrations independently.

Transitioning to a **hybrid development setup**—where the PostgreSQL database runs isolated in a lightweight container while the frontend (Vite) and backend (FastAPI) run natively on the host—delivers sub-second feedback, native debugging, and clean process lifecycles. Furthermore, establishing an explicit database migration workflow ensures production deployability, as pre-deploy release jobs in cloud platforms (Render, Fly.io, AWS ECS, Kubernetes) require standalone migration execution rather than startup hooks.

## What Changes

- **Docker Compose Service Isolation with Profiles**:
  - Update [docker-compose.yml](file:///workspace/docker-compose.yml) to tag `backend` and `frontend` services with `profiles: ["full"]`.
  - Running `docker compose up -d` boots **only** the `chores-db` container on port `5432`.
  - The complete containerized production stack remains accessible at any time via `docker compose --profile full up -d`.
- **Database Readiness Probing (`scripts/wait-for-db.sh`)**:
  - Introduce a dedicated readiness script that polls `docker compose exec db pg_isready` (with timeout and backoff) to ensure PostgreSQL is fully accepting TCP connections before migrations or services attempt to connect.
- **Standalone Database Migration Pipeline (`scripts/migrate.sh`)**:
  - Create a standalone migration runner supporting standard operational actions:
    - `./scripts/migrate.sh up`: Run `alembic upgrade head`
    - `./scripts/migrate.sh down`: Roll back one revision (`alembic downgrade -1`)
    - `./scripts/migrate.sh check`: Detect uncommitted model-to-database schema drift (`alembic check`)
    - `./scripts/migrate.sh history`: View migration timeline and current head (`alembic history --verbose`)
    - `./scripts/migrate.sh current`: Display currently applied revision (`alembic current`)
  - Auto-detect Python virtual environments (`backend/.venv`, active `$VIRTUAL_ENV`, or system Python), providing actionable setup instructions if dependencies are missing.
  - Reusable as the production release phase / pre-deploy command in CI/CD pipelines.
- **Alembic Configuration Harmonization (`backend/alembic.ini`)**:
  - Ensure paths in [backend/alembic.ini](file:///workspace/backend/alembic.ini) allow executing native `alembic` commands seamlessly whether invoked from the repository root or the `backend/` directory.
- **Modular Local Development Orchestrator (`scripts/dev.sh`)**:
  - Orchestrate local execution with automatic readiness gating, migration execution, and graceful process management.
  - Trap `SIGINT` (Ctrl+C) and `SIGTERM` to immediately terminate local child processes (Uvicorn and Vite), preventing orphaned processes from locking ports `8000` or `5173`.
  - Keep `chores-db` running in the background upon server exit to enable instant subsequent restarts.
  - Provide a clean teardown command (`./scripts/dev.sh down` or `docker compose down`) to cleanly stop containers when development concludes.
  - Support modular subcommands for flexibility:
    - `./scripts/dev.sh` (or `all`): Start DB ➔ wait ➔ migrate ➔ launch FastAPI & Vite concurrently.
    - `./scripts/dev.sh backend`: Start DB ➔ wait ➔ migrate ➔ launch only FastAPI.
    - `./scripts/dev.sh frontend`: Launch only Vite.
    - `./scripts/dev.sh db`: Start only the DB container.
    - `./scripts/dev.sh down`: Stop the DB container.
- **Separation of Concerns & Schema Preservation**:
  - Guarantee zero modifications to application domain logic (`backend/app/routers/`, `backend/app/models/`, `backend/app/services/`, `frontend/src/components/`).
  - Add no schema revisions in `backend/alembic/versions/` to keep the Alembic DAG completely linear and prevent branch merge conflicts.
- **Developer Documentation Updates**:
  - Update [README.md](file:///workspace/README.md) with instructions for hybrid execution, migration workflows, and production profile usage.

## Capabilities

### New Capabilities
- `developer-environment`: Hybrid development orchestration, containerized database lifecycle, standalone migration execution, and process signal management.

### Modified Capabilities
- None.

## Impact

- **Container Configuration**: [docker-compose.yml](file:///workspace/docker-compose.yml) (service profiles).
- **Tooling & Scripts**: New executable scripts in `scripts/` (`wait-for-db.sh`, `migrate.sh`, `dev.sh`).
- **Alembic Configuration**: [backend/alembic.ini](file:///workspace/backend/alembic.ini).
- **Documentation**: [README.md](file:///workspace/README.md).
- **Database Schema**: No migrations or schema changes. Existing migrations `0001`, `0002`, `0003` remain intact.
