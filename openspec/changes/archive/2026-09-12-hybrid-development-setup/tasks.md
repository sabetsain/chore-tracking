## 1. Docker Compose & Database Readiness

- [x] 1.1 Update [docker-compose.yml](file:///workspace/docker-compose.yml) to add `profiles: ["full"]` to `backend` and `frontend` services, keeping `db` unprofiled.
- [x] 1.2 Verify that `docker compose up -d` starts only the `chores-db` container and that `docker compose --profile full config` validates full stack definitions.
- [x] 1.3 Implement [scripts/wait-for-db.sh](file:///workspace/scripts/wait-for-db.sh) to poll `pg_isready` on the `chores-db` container with configurable timeout and retry intervals.
- [x] 1.4 Make [scripts/wait-for-db.sh](file:///workspace/scripts/wait-for-db.sh) executable and verify successful probe against a running container.

## 2. Standalone Alembic Migration Runner

- [x] 2.1 Update [backend/alembic.ini](file:///workspace/backend/alembic.ini) to support execution from both the repo root and the `backend/` directory without path resolution failures.
- [x] 2.2 Implement [scripts/migrate.sh](file:///workspace/scripts/migrate.sh) supporting subcommands: `up`, `down`, `check`, `history`, `current`.
- [x] 2.3 Implement Python environment auto-detection in [scripts/migrate.sh](file:///workspace/scripts/migrate.sh) checking `backend/.venv`, `$VIRTUAL_ENV`, and PATH with descriptive error messages when dependencies are missing.
- [x] 2.4 Verify migration execution: run `./scripts/migrate.sh up` against the database container and run `./scripts/migrate.sh current` to verify head status.

## 3. Modular Local Development Runner & Signal Handling

- [x] 3.1 Implement [scripts/dev.sh](file:///workspace/scripts/dev.sh) with subcommands: `all` (default), `backend`, `frontend`, `db`, `down`.
- [x] 3.2 Implement `SIGINT` (Ctrl+C) and `SIGTERM` trap handling in [scripts/dev.sh](file:///workspace/scripts/dev.sh) to cleanly terminate child processes (Uvicorn / Vite) without leaving orphaned port locks.
- [x] 3.3 Verify `./scripts/dev.sh down` cleanly stops the database container while preserving volume data.
- [x] 3.4 Update [README.md](file:///workspace/README.md) with comprehensive documentation of the hybrid development setup, migration workflow, and production compose profiles.

## 4. End-to-End Verification & Knowledge Graph Sync

- [x] 4.1 Run full backend test suite (`pytest backend/tests -v`).
- [x] 4.2 Run full frontend test suite (`npm --prefix frontend test -- --run`) and TypeScript build (`npm --prefix frontend run build`).
- [x] 4.3 Update the repository knowledge graph using `/graphify --update`.
