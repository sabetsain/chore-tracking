## Context

The Household Coordination app operates with a FastAPI backend, a React 19 / Vite frontend, and a PostgreSQL 16 database. Initially, Docker Compose managed the entire stack. As the application expands across multiple concurrent worktrees, fast development feedback loops and clean local debugging require moving frontend and backend execution onto the host system while isolating PostgreSQL in a persistent container.

During the discovery and grill-me alignment session, critical decisions were locked in:
1. An explicit standalone migration script matches production deployment practices (pre-deploy release phases) rather than runtime startup hooks.
2. Docker Compose profiles enable a single, unified `docker-compose.yml` supporting both hybrid dev and full containerized deployments.
3. Clean process lifecycles and signal trapping prevent orphaned port locks without requiring destructive database volume resets.
4. Modular runner commands support both all-in-one terminal execution and decoupled multi-terminal / IDE debugger workflows.

## Goals / Non-Goals

**Goals:**
- Enable running `docker compose up -d` to spin up strictly the `chores-db` container without starting backend or frontend containers.
- Retain full container stack deployment via `docker compose --profile full up -d`.
- Implement a robust database readiness probe (`scripts/wait-for-db.sh`) that avoids connection race conditions during cold database boots.
- Provide an explicit, standalone database migration runner (`scripts/migrate.sh`) executing Alembic commands from repository root with Python venv auto-detection.
- Provide a modular development runner (`scripts/dev.sh`) that handles signals (`SIGINT`/`SIGTERM`) to terminate local servers cleanly while leaving the database container running for instant subsequent boots.
- Support decoupled development with subcommands (`./scripts/dev.sh backend`, `./scripts/dev.sh frontend`, `./scripts/dev.sh down`).
- Preserve strict separation of concerns with zero modifications to application domain models, routers, or components, and zero new database schema migrations.

**Non-Goals:**
- Automatic database wiping/dropping on shutdown (volume data must persist across normal dev lifecycles).
- Automatically executing Alembic migrations in FastAPI application startup code.
- Managing multiple PostgreSQL database versions simultaneously.

## Decisions

### Decision 1: Compose Service Profiles (`profiles: ["full"]`)
- **Decision**: Add `profiles: ["full"]` to the `backend` and `frontend` services in [docker-compose.yml](file:///workspace/docker-compose.yml).
- **Rationale**:
  - `docker compose up -d` without flags launches only unprofiled services (i.e. `db`), which is the exact behavior needed for hybrid development.
  - Production deployments and full containerized integration testing simply pass `--profile full`.
  - Avoids maintaining separate, drift-prone `docker-compose.dev.yml` and `docker-compose.prod.yml` files.

### Decision 2: Standalone Shell Migration Runner (`scripts/migrate.sh`)
- **Decision**: Create an executable shell script that interfaces directly with Alembic.
- **Workflow**:
  ```
  ./scripts/migrate.sh [command]
     ├── up        ➔ alembic upgrade head
     ├── down      ➔ alembic downgrade -1
     ├── check     ➔ alembic check (model-to-DB sync validation)
     ├── history   ➔ alembic history --verbose
     └── current   ➔ alembic current
  ```
- **Rationale**:
  - Parity with production: cloud deployment platforms (Fly.io, Render, AWS ECS, K8s Jobs) execute standalone pre-deploy migration scripts. Running migrations inside app startup causes database lock timeouts when scaling across multiple replicas.
  - Automatic environment detection: checks `backend/.venv/bin/alembic`, active `$VIRTUAL_ENV`, and PATH `alembic` before running.

### Decision 3: Socket & `pg_isready` Readiness Gate (`scripts/wait-for-db.sh`)
- **Decision**: Implement a polling gate using `docker compose exec -T db pg_isready -U chores -d chores_db` with a configurable timeout (default 30 seconds).
- **Rationale**:
  - PostgreSQL containers report "running" to Docker before the database engine finishes internal initialization and socket listening.
  - Gating migrations behind a true readiness probe guarantees zero `ConnectionRefusedError` crashes on cold boot.

### Decision 4: Signal Trapping & Process Group Management in `scripts/dev.sh`
- **Decision**: The unified dev runner traps `SIGINT` and `SIGTERM`, forwarding the kill signal to Uvicorn and Vite PIDs.
- **Lifecycle Diagram**:
  ```
  [scripts/dev.sh all]
          │
          ├─▶ docker compose up -d (starts chores-db)
          ├─▶ scripts/wait-for-db.sh (polls until pg_isready)
          ├─▶ scripts/migrate.sh up (applies pending revisions)
          ├─▶ Launch uvicorn (PID A) & vite (PID B)
          │
      [Ctrl + C / SIGINT]
          │
          ├─▶ trap handler fires
          ├─▶ kill PID A (Uvicorn) & kill PID B (Vite)
          ├─▶ wait for process exit
          └─▶ Exit cleanly (chores-db remains active in background)
  ```
- **Rationale**:
  - Leaves ports `8000` and `5173` immediately free for the next run.
  - Leaves `chores-db` container running so subsequent boots take <1s instead of waiting for database cold start.
  - Clean teardown available at any time via `./scripts/dev.sh down` (which runs `docker compose down`).

### Decision 5: Separation of Concerns & Alembic DAG Freeze
- **Decision**: No schema migrations will be added or modified in `backend/alembic/versions/`.
- **Rationale**:
  - Keeps the Alembic DAG strictly linear (`0001` ➔ `0002` ➔ `0003`).
  - Guarantees zero migration branching or merge conflicts when integrating across feature worktrees.
