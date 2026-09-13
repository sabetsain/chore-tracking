#!/usr/bin/env bash
set -eo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONFIG_PATH="${REPO_ROOT}/backend/alembic.ini"

# Resolve Alembic command
if [ -x "${REPO_ROOT}/backend/.venv/bin/alembic" ] && "${REPO_ROOT}/backend/.venv/bin/python3" -c "import alembic" >/dev/null 2>&1; then
    ALEMBIC_CMD=("${REPO_ROOT}/backend/.venv/bin/alembic")
elif [ -n "$VIRTUAL_ENV" ] && [ -x "${VIRTUAL_ENV}/bin/alembic" ] && "${VIRTUAL_ENV}/bin/python3" -c "import alembic" >/dev/null 2>&1; then
    ALEMBIC_CMD=("${VIRTUAL_ENV}/bin/alembic")
elif command -v alembic >/dev/null 2>&1; then
    ALEMBIC_CMD=("alembic")
elif python3 -m alembic --help >/dev/null 2>&1; then
    ALEMBIC_CMD=("python3" "-m" "alembic")
else
    echo "Error: Alembic not found or backend/.venv has an invalid/cross-platform Python interpreter." >&2
    echo "" >&2
    echo "If you are running on host macOS after using a container worktree, re-create the local venv:" >&2
    echo "  rm -rf backend/.venv" >&2
    echo "  python3 -m venv backend/.venv" >&2
    echo "  backend/.venv/bin/pip install -r backend/requirements.txt" >&2
    echo "" >&2
    exit 1
fi

CMD="${1:-up}"

case "$CMD" in
    up)
        echo "Applying pending migrations to head..."
        "${ALEMBIC_CMD[@]}" -c "$CONFIG_PATH" upgrade head
        ;;
    down)
        echo "Rolling back latest migration revision (-1)..."
        "${ALEMBIC_CMD[@]}" -c "$CONFIG_PATH" downgrade -1
        ;;
    check)
        echo "Checking database schema synchronization against models..."
        "${ALEMBIC_CMD[@]}" -c "$CONFIG_PATH" check
        ;;
    history)
        echo "Fetching migration history..."
        "${ALEMBIC_CMD[@]}" -c "$CONFIG_PATH" history --verbose
        ;;
    current)
        echo "Checking current database revision..."
        "${ALEMBIC_CMD[@]}" -c "$CONFIG_PATH" current
        ;;
    *)
        echo "Usage: $0 [up|down|check|history|current]" >&2
        echo "  up       - Apply pending migrations to head (default)" >&2
        echo "  down     - Roll back latest migration revision (-1)" >&2
        echo "  check    - Check for schema drift between models and database" >&2
        echo "  history  - View migration timeline" >&2
        echo "  current  - Show current applied database revision" >&2
        exit 1
        ;;
esac
