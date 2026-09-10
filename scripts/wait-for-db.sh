#!/usr/bin/env bash
set -eo pipefail

# Ensure working directory is repo root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Configurable timeout and interval
TIMEOUT="${DB_TIMEOUT:-${1:-30}}"
INTERVAL="${DB_INTERVAL:-1}"
POSTGRES_USER="${POSTGRES_USER:-chores}"
POSTGRES_DB="${POSTGRES_DB:-chores_db}"

# Helper to ensure podman socket if docker is podman
if command -v podman >/dev/null 2>&1 && [ -L /usr/local/bin/docker ]; then
    if ! docker ps >/dev/null 2>&1; then
        mkdir -p "${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/podman"
        nohup podman system service --time=0 "unix://${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/podman/podman.sock" >/dev/null 2>&1 &
        sleep 1
    fi
fi

echo "Waiting for database container (${POSTGRES_DB}) to become ready (timeout: ${TIMEOUT}s)..."

elapsed=0
while [ "$elapsed" -lt "$TIMEOUT" ]; do
    if docker compose exec -T db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
        echo "Database is ready and accepting connections (${elapsed}s elapsed)."
        exit 0
    fi
    sleep "$INTERVAL"
    elapsed=$((elapsed + INTERVAL))
done

echo "Error: Timed out after ${TIMEOUT}s waiting for database to become ready." >&2
exit 1
