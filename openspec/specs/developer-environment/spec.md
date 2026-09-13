# developer-environment Specification

## Purpose
Defines local development orchestration, containerized dependencies, database migration pipelines, and process lifecycle management for the Household Coordination App.

## Requirements

### Requirement: Containerized Database Isolation and Service Profiles
The system SHALL configure containerized services such that PostgreSQL runs isolated as a background dependency by default, while full-stack containerization is accessible via explicit profile flags.

#### Scenario: Launching database container by default
- **WHEN** a developer executes `docker compose up -d` without additional profile flags
- **THEN** only the `chores-db` container is created and started on port `5432`, leaving the host free to run backend and frontend servers natively.

#### Scenario: Launching full containerized stack for production simulation
- **WHEN** a developer or deployment script executes `docker compose --profile full up -d`
- **THEN** all three services (`chores-db`, `chores-backend`, `chores-frontend`) are built and started according to their container specifications.

### Requirement: Database Readiness Verification
The system SHALL verify that the PostgreSQL database container is healthy and actively accepting connections before downstream migration or backend processes attempt connection.

#### Scenario: Gating on database readiness during container boot
- **WHEN** `scripts/wait-for-db.sh` is invoked while the database container is initializing
- **THEN** the script polls PostgreSQL using `pg_isready` at 1-second intervals until the database engine returns exit code 0 or until the timeout is reached.

#### Scenario: Handling database initialization timeout
- **WHEN** the database container fails to become ready within the configured timeout period (default 30 seconds)
- **THEN** `scripts/wait-for-db.sh` exits with a non-zero exit code and emits a clear diagnostic message indicating that PostgreSQL did not become ready.

### Requirement: Standalone Database Migration Pipeline
The system SHALL provide an executable migration runner that executes Alembic migrations from the repository root, resolves the appropriate Python environment, and interfaces cleanly with production deployment pipelines.

#### Scenario: Running pending migrations to head
- **WHEN** a developer or deployment job executes `scripts/migrate.sh up` (or without arguments)
- **THEN** the script resolves the Python environment, executes `alembic upgrade head`, and reports the outcome.

#### Scenario: Rolling back the latest migration revision
- **WHEN** a developer executes `scripts/migrate.sh down`
- **THEN** the script executes `alembic downgrade -1` against the target database.

#### Scenario: Verifying schema synchronization against models
- **WHEN** a developer or CI check executes `scripts/migrate.sh check`
- **THEN** the script invokes `alembic check` to verify that all SQLAlchemy models in `app.models` match the current database schema, reporting drift if detected.

#### Scenario: Detecting missing Python dependencies
- **WHEN** `scripts/migrate.sh` is executed in an environment lacking Alembic or required database drivers
- **THEN** the script prints actionable instructions for configuring `backend/.venv` and installing dependencies from `backend/requirements.txt` before exiting with code 1.

### Requirement: Graceful Local Process Lifecycle and Signal Trapping
The system SHALL ensure that local developer servers (FastAPI and Vite) are cleanly terminated upon receiving interrupt signals, preventing orphaned processes from occupying ports.

#### Scenario: Terminating local servers via Ctrl+C
- **WHEN** a developer terminates `scripts/dev.sh` by pressing `Ctrl+C` (`SIGINT`)
- **THEN** the script captures the signal, sends termination signals to the background Uvicorn and Vite processes, waits for their exit, and exits with code 0 while keeping the `chores-db` container running in the background.

### Requirement: Modular Developer Orchestration Runner
The system SHALL provide a modular development script (`scripts/dev.sh`) supporting granular subcommands for running individual layers or the full hybrid stack.

#### Scenario: Running full hybrid development stack
- **WHEN** a developer executes `./scripts/dev.sh` or `./scripts/dev.sh all`
- **THEN** the script starts the database container, waits for readiness, executes pending Alembic migrations, and starts both FastAPI and Vite servers with hot-reloading.

#### Scenario: Running backend-only with automated database preparation
- **WHEN** a developer executes `./scripts/dev.sh backend`
- **THEN** the script starts the database container, waits for readiness, executes pending migrations, and launches only the local FastAPI server.

#### Scenario: Tearing down database container
- **WHEN** a developer executes `./scripts/dev.sh down`
- **THEN** the script invokes `docker compose down` to gracefully halt and remove the database container while preserving persistent volume data.
