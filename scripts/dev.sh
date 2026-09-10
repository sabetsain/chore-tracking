#!/usr/bin/env bash
set -eo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    trap - SIGINT SIGTERM EXIT
    echo ""
    echo "Shutting down development servers..."

    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        pkill -P "$BACKEND_PID" 2>/dev/null || true
        kill -TERM "$BACKEND_PID" 2>/dev/null || true
    fi

    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        pkill -P "$FRONTEND_PID" 2>/dev/null || true
        kill -TERM "$FRONTEND_PID" 2>/dev/null || true
    fi

    # Wait for processes to exit (up to 3s)
    local waited=0
    while [ "$waited" -lt 30 ]; do
        local still_running=0
        if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
            still_running=1
        fi
        if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
            still_running=1
        fi
        if [ "$still_running" -eq 0 ]; then
            break
        fi
        sleep 0.1
        waited=$((waited + 1))
    done

    # Force kill if still running
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill -9 "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill -9 "$FRONTEND_PID" 2>/dev/null || true
    fi

    echo "Development servers stopped. (Database container remains active)"
    exit 0
}

resolve_uvicorn() {
    if [ -x "${REPO_ROOT}/backend/.venv/bin/uvicorn" ]; then
        UVICORN_CMD=("${REPO_ROOT}/backend/.venv/bin/uvicorn")
    elif [ -n "$VIRTUAL_ENV" ] && [ -x "${VIRTUAL_ENV}/bin/uvicorn" ]; then
        UVICORN_CMD=("${VIRTUAL_ENV}/bin/uvicorn")
    elif command -v uvicorn >/dev/null 2>&1; then
        UVICORN_CMD=("uvicorn")
    elif python3 -m uvicorn --version >/dev/null 2>&1; then
        UVICORN_CMD=("python3" "-m" "uvicorn")
    else
        echo "Error: Uvicorn not found in backend/.venv, active virtual environment, or system PATH." >&2
        echo "" >&2
        echo "To set up the backend virtual environment, run:" >&2
        echo "  python3 -m venv backend/.venv" >&2
        echo "  backend/.venv/bin/pip install -r backend/requirements.txt" >&2
        echo "" >&2
        exit 1
    fi
}

resolve_frontend() {
    if [ ! -d "${REPO_ROOT}/frontend/node_modules" ]; then
        echo "Error: Frontend node_modules not found." >&2
        echo "" >&2
        echo "To install frontend dependencies, run:" >&2
        echo "  npm --prefix frontend install" >&2
        echo "" >&2
        exit 1
    fi
}

start_db() {
    echo "Starting PostgreSQL database container..."
    docker compose up -d
    "${REPO_ROOT}/scripts/wait-for-db.sh"
}

run_migrations() {
    "${REPO_ROOT}/scripts/migrate.sh" up
}

stop_db() {
    echo "Stopping database container..."
    docker compose down
    echo "Database container halted cleanly. (Volume data preserved)"
}

start_backend() {
    resolve_uvicorn
    echo "Starting FastAPI backend on http://localhost:8000 (docs: http://localhost:8000/docs)..."
    (cd "${REPO_ROOT}/backend" && exec "${UVICORN_CMD[@]}" app.main:app --host 0.0.0.0 --port 8000 --reload) &
    BACKEND_PID=$!
}

start_frontend() {
    resolve_frontend
    echo "Starting Vite frontend on http://localhost:5173..."
    if [ -x "${REPO_ROOT}/frontend/node_modules/.bin/vite" ]; then
        (cd "${REPO_ROOT}/frontend" && exec ./node_modules/.bin/vite) &
    else
        (cd "${REPO_ROOT}/frontend" && exec npm run dev) &
    fi
    FRONTEND_PID=$!
}

CMD="${1:-all}"

case "$CMD" in
    all)
        trap cleanup SIGINT SIGTERM
        start_db
        run_migrations
        start_backend
        start_frontend
        echo ""
        echo "Household Coordination stack is live!"
        echo "  Frontend: http://localhost:5173"
        echo "  Backend:  http://localhost:8000 (Docs: /docs)"
        echo "Press Ctrl+C to halt local servers."
        while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
            sleep 1 &
            wait $! 2>/dev/null || true
        done
        cleanup
        ;;
    backend)
        trap cleanup SIGINT SIGTERM
        start_db
        run_migrations
        start_backend
        echo ""
        echo "FastAPI backend is live on http://localhost:8000 (Docs: /docs)"
        echo "Press Ctrl+C to halt backend server."
        while kill -0 "$BACKEND_PID" 2>/dev/null; do
            sleep 1 &
            wait $! 2>/dev/null || true
        done
        cleanup
        ;;
    frontend)
        trap cleanup SIGINT SIGTERM
        start_frontend
        echo ""
        echo "Vite frontend is live on http://localhost:5173"
        echo "Press Ctrl+C to halt frontend server."
        while kill -0 "$FRONTEND_PID" 2>/dev/null; do
            sleep 1 &
            wait $! 2>/dev/null || true
        done
        cleanup
        ;;
    db)
        start_db
        echo "Database is ready for connections on port 5432."
        ;;
    down)
        stop_db
        ;;
    *)
        echo "Usage: $0 [all|backend|frontend|db|down]" >&2
        echo "  all       - Boot DB, run migrations, start backend & frontend (default)" >&2
        echo "  backend   - Boot DB, run migrations, start FastAPI server" >&2
        echo "  frontend  - Start Vite dev server" >&2
        echo "  db        - Boot DB container and wait for readiness" >&2
        echo "  down      - Stop DB container cleanly" >&2
        exit 1
        ;;
esac
