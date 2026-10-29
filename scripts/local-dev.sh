#!/usr/bin/env bash
set -euo pipefail

# Local development environment manager for BLMS
# Designed to be agent-friendly: one command to start, logs readable via files.
#
# Usage:
#   ./scripts/local-dev.sh                    # Interactive menu
#   ./scripts/local-dev.sh up                 # Start everything (infra + dev servers)
#   ./scripts/local-dev.sh down               # Stop everything
#   ./scripts/local-dev.sh status             # Show current state
#   ./scripts/local-dev.sh logs [--errors]    # Show recent logs (or just errors)
#   ./scripts/local-dev.sh branch [options]   # Switch branches
#   ./scripts/local-dev.sh sync               # Trigger content sync
#
# Branch options (CLI-friendly for agents):
#   --app <branch>              Switch BLMS application branch
#   --content <branch>          Switch public content repo branch + sync
#   --content-pr <number>       Switch to a content PR's branch (handles forks) + sync
#   --content-reset             Reset content repo to upstream main
#   --private-content <branch>  Switch private content repo branch + sync
#
# Log files (agent-readable):
#   /tmp/blms-dev/combined.log  All output, chronological, prefixed by service
#   Grep for @blms/api or @blms/academy to filter by service
#   Grep for error|Error|ERROR to find errors
#
# Examples:
#   ./scripts/local-dev.sh up
#   ./scripts/local-dev.sh logs --errors
#   ./scripts/local-dev.sh branch --app fix/assignment-ranking-state-reset
#   ./scripts/local-dev.sh branch --content dev --private-content main
#   ./scripts/local-dev.sh branch --content-pr 3777   # review PR from any fork
#   ./scripts/local-dev.sh branch --content-reset      # back to upstream main

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"
ENV_EXAMPLE="$PROJECT_DIR/.env.example"
API_URL="${API_URL:-http://localhost:3000}"
# Overridable so `context` presets can target the compose stack's postgres too
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-blms-local-postgres}"
CDN_CONTAINER="blms-local-cdn"
TYPESENSE_CONTAINER="blms-local-typesense"
MINIO_CONTAINER="blms-local-minio"
LOG_DIR="/tmp/blms-dev"
LOG_FILE="$LOG_DIR/combined.log"
PID_FILE="$LOG_DIR/dev.pid"
LOCK_FILE="$LOG_DIR/local-dev.lock"
UPSTREAM_CONTENT_REPO="https://github.com/PlanB-Network/bitcoin-educational-content"
UPSTREAM_CONTENT_SLUG="PlanB-Network/bitcoin-educational-content"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${CYAN}>${NC} $*"; }
ok()      { echo -e "${GREEN}ok${NC} $*"; }
warn()    { echo -e "${YELLOW}!${NC} $*"; }
error()   { echo -e "${RED}x${NC} $*" >&2; }
header()  { echo -e "\n${BOLD}--- $* ---${NC}"; }

# ============================================================
# Helpers
# ============================================================

ensure_env() {
    if [[ ! -f "$ENV_FILE" ]]; then
        if [[ -f "$ENV_EXAMPLE" ]]; then
            info "Creating .env from .env.example"
            cp "$ENV_EXAMPLE" "$ENV_FILE"
            sed -i 's|^POSTGRES_HOST=.*|POSTGRES_HOST=localhost|' "$ENV_FILE"
            sed -i 's|^POSTGRES_DB=.*|POSTGRES_DB=postgres|' "$ENV_FILE"
            sed -i 's|^POSTGRES_USER=.*|POSTGRES_USER=postgres|' "$ENV_FILE"
            sed -i 's|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=postgres|' "$ENV_FILE"
            sed -i 's|^S3_ENDPOINT=.*|S3_ENDPOINT=http://localhost:9000|' "$ENV_FILE"
            sed -i 's|^S3_ACCESS_KEY=.*|S3_ACCESS_KEY=minioadmin|' "$ENV_FILE"
            sed -i 's|^S3_SECRET_KEY=.*|S3_SECRET_KEY=minioadmin|' "$ENV_FILE"
            sed -i 's|^S3_BUCKET=.*|S3_BUCKET=blms-local|' "$ENV_FILE"
            sed -i 's|^S3_REGION=.*|S3_REGION=us-east-1|' "$ENV_FILE"
            sed -i 's|^S3_FORCE_PATH_STYLE=.*|S3_FORCE_PATH_STYLE=true|' "$ENV_FILE"
            grep -q '^S3_FORCE_PATH_STYLE=' "$ENV_FILE" || echo 'S3_FORCE_PATH_STYLE=true' >> "$ENV_FILE"
            ok ".env created with local defaults"
            warn "Edit .env to add GITHUB_ACCESS_TOKEN if you need private content repo"
        else
            error ".env.example not found — cannot generate .env"
            exit 1
        fi
    fi
}

read_env_var() {
    local key="$1"
    local default="${2:-}"
    local val
    val=$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'") || true
    echo "${val:-$default}"
}

set_env_var() {
    local key="$1"
    local value="$2"
    if grep -qE "^${key}=" "$ENV_FILE" 2>/dev/null; then
        sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
        echo "${key}=${value}" >> "$ENV_FILE"
    fi
}

is_container_running() {
    docker ps --filter "name=^${1}$" --format '{{.Names}}' 2>/dev/null | grep -q "^${1}$"
}

is_dev_running() {
    [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

acquire_lock() {
    mkdir -p "$LOG_DIR"
    if [[ -f "$LOCK_FILE" ]]; then
        local lock_pid
        lock_pid=$(cat "$LOCK_FILE")
        if kill -0 "$lock_pid" 2>/dev/null; then
            error "Another local-dev.sh is running (PID ${lock_pid}). Wait or run 'down' first."
            exit 1
        fi
        # Stale lock — remove it
        rm -f "$LOCK_FILE"
    fi
    echo $$ > "$LOCK_FILE"
    trap 'rm -f "$LOCK_FILE"' EXIT
}

release_lock() {
    rm -f "$LOCK_FILE"
    trap - EXIT
}

wait_for_api() {
    info "Waiting for API on ${API_URL} ..."
    for i in $(seq 1 60); do
        if curl -so /dev/null "${API_URL}/api/trpc" 2>/dev/null; then
            ok "API is ready"
            return 0
        fi
        sleep 1
    done
    warn "API not responding after 60s"
    return 1
}

restart_dev_servers() {
    if ! is_dev_running; then
        info "Dev servers not running, skipping restart"
        return
    fi

    info "Restarting dev servers (env vars changed) ..."

    # Stop
    local pid
    pid=$(cat "$PID_FILE")
    local pgid
    pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ') || true
    if [[ -n "$pgid" ]]; then
        kill -- -"$pgid" 2>/dev/null || true
    fi
    kill "$pid" 2>/dev/null || true
    rm -f "$PID_FILE"
    pgrep -f "turbo.*dev.*${PROJECT_DIR}" 2>/dev/null | xargs -r kill 2>/dev/null || true
    pgrep -f "tsx.*${PROJECT_DIR}" 2>/dev/null | xargs -r kill 2>/dev/null || true
    pgrep -f "vite.*${PROJECT_DIR}" 2>/dev/null | xargs -r kill 2>/dev/null || true
    sleep 1

    # Start
    cd "$PROJECT_DIR"
    pnpm dev 2>&1 \
        | awk '{ print strftime("[%H:%M:%S]"), $0; fflush() }' \
        >> "$LOG_FILE" &
    local dev_pid=$!
    echo "$dev_pid" > "$PID_FILE"
    ok "Dev servers restarted (PID ${dev_pid})"
}

trigger_sync() {
    local pub_branch priv_branch
    pub_branch=$(read_env_var DATA_REPOSITORY_BRANCH "main")
    priv_branch=$(read_env_var PRIVATE_DATA_REPOSITORY_BRANCH "")

    info "Syncing content (public: ${BOLD}${pub_branch}${NC}, private: ${BOLD}${priv_branch:-none}${NC}) ..."

    if ! wait_for_api; then
        error "Cannot sync — API is not running"
        return 1
    fi

    # Snapshot log position before sync to only check new lines after
    local log_lines_before=0
    if [[ -f "$LOG_FILE" ]]; then
        log_lines_before=$(wc -l < "$LOG_FILE")
    fi

    local response http_code
    response=$(curl -sf -w "\n%{http_code}" -X POST "${API_URL}/api/github/sync" 2>&1) || {
        http_code=$(echo "$response" | tail -1)
        error "Sync failed (HTTP ${http_code:-???})"
        return 1
    }

    http_code=$(echo "$response" | tail -1)
    if [[ "$http_code" == "200" || "$http_code" == "201" ]]; then
        ok "Content synced"
    else
        warn "Sync returned HTTP ${http_code}"
    fi

    # Check new log lines for sync errors
    if [[ -f "$LOG_FILE" ]]; then
        local sync_errors
        sync_errors=$(tail -n +"$((log_lines_before + 1))" "$LOG_FILE" \
            | grep -i 'error processing file\|failed to sync\|failed to clone' \
            | tail -20) || true
        if [[ -n "$sync_errors" ]]; then
            echo ""
            warn "${BOLD}Sync errors detected:${NC}"
            echo "$sync_errors" | while IFS= read -r line; do
                local clean
                clean=$(echo "$line" | sed 's/^\[[0-9:]*\] @blms\/api:dev: //')
                echo -e "  ${RED}x${NC} ${clean}"
            done
            echo ""
        fi
    fi
}

# ============================================================
# Commands
# ============================================================

cmd_up() {
    acquire_lock
    header "Infrastructure"

    # .env
    ensure_env
    # Guard: the docker-compose stack (README option 1) binds the same ports
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^bitcoin-learning-management-system-'; then
        error "The docker compose stack is running (bitcoin-learning-management-system-*)."
        error "It binds the same ports (5432, 8108, 9000). Stop it first:"
        error "    docker compose down"
        exit 1
    fi

    # node_modules
    if [[ ! -d "$PROJECT_DIR/node_modules" ]]; then
        info "Installing dependencies ..."
        (cd "$PROJECT_DIR" && pnpm install)
        ok "Dependencies installed"
    else
        ok "node_modules present"
    fi

    # Ensure .env points to localhost (not docker service name)
    local current_pg_host
    current_pg_host=$(read_env_var POSTGRES_HOST "localhost")
    if [[ "$current_pg_host" != "localhost" && "$current_pg_host" != "127.0.0.1" ]]; then
        info "Patching POSTGRES_HOST from '${current_pg_host}' to 'localhost'"
        set_env_var POSTGRES_HOST "localhost"
    fi

    # PostgreSQL (data persisted in named volume)
    if is_container_running "$POSTGRES_CONTAINER"; then
        ok "PostgreSQL already running"
    else
        # Check if container exists but is stopped — just restart it (keeps data)
        if docker ps -a --filter "name=^${POSTGRES_CONTAINER}$" --format '{{.Names}}' 2>/dev/null | grep -q "^${POSTGRES_CONTAINER}$"; then
            info "Restarting PostgreSQL container (data preserved) ..."
            docker start "$POSTGRES_CONTAINER" > /dev/null
        else
            info "Creating PostgreSQL container ..."
            docker run -d \
                --name "$POSTGRES_CONTAINER" \
                -e POSTGRES_PASSWORD=postgres \
                -p 127.0.0.1:5432:5432 \
                -v blms-local-pgdata:/var/lib/postgresql/data \
                --restart unless-stopped \
                postgres:15.2 > /dev/null
        fi
        info "Waiting for PostgreSQL ..."
        for i in $(seq 1 20); do
            if docker exec "$POSTGRES_CONTAINER" pg_isready -U postgres > /dev/null 2>&1; then
                break
            fi
            sleep 1
        done
        ok "PostgreSQL running on localhost:5432"
    fi

    # Migrations
    info "Running DB migrations ..."
    (cd "$PROJECT_DIR" && pnpm dev:db:migrate:local 2>&1 | tail -3)
    ok "Migrations applied"

    # Typesense (search engine — required by sync)
    if is_container_running "$TYPESENSE_CONTAINER"; then
        ok "Typesense already running"
    else
        info "Starting Typesense container ..."
        docker rm "$TYPESENSE_CONTAINER" 2>/dev/null || true
        docker run -d \
            --name "$TYPESENSE_CONTAINER" \
            -p 127.0.0.1:8108:8108 \
            -e TYPESENSE_API_KEY=abcd \
            -e TYPESENSE_DATA_DIR=/usr/share/typesense/data \
            -e GLOG_minloglevel=2 \
            -v typesense-data-volume:/usr/share/typesense/data \
            --restart unless-stopped \
            typesense/typesense:28.0 > /dev/null
        ok "Typesense running on localhost:8108"
    fi

    # CDN (nginx for static assets)
    if is_container_running "$CDN_CONTAINER"; then
        ok "CDN already running"
    else
        info "Starting CDN container ..."
        docker rm "$CDN_CONTAINER" 2>/dev/null || true
        mkdir -p /tmp/cdn
        docker run -d \
            --name "$CDN_CONTAINER" \
            -p 127.0.0.1:8080:80 \
            -v /tmp/cdn:/var/www/cdn:ro \
            -v "$PROJECT_DIR/docker/cdn/nginx.conf:/etc/nginx/nginx.conf:ro" \
            --restart unless-stopped \
            nginx:alpine > /dev/null
        ok "CDN running on localhost:8080"
    fi

    # Ensure .env S3 vars point to local MinIO (before starting container so bucket name is correct)
    local current_s3_endpoint
    current_s3_endpoint=$(read_env_var S3_ENDPOINT "")
    if [[ "$current_s3_endpoint" != "http://localhost:9000" ]]; then
        info "Patching S3 env vars for local MinIO"
        set_env_var S3_ENDPOINT "http://localhost:9000"
        set_env_var S3_ACCESS_KEY "minioadmin"
        set_env_var S3_SECRET_KEY "minioadmin"
        set_env_var S3_BUCKET "blms-local"
        set_env_var S3_REGION "us-east-1"
    fi
    if [[ "$(read_env_var S3_FORCE_PATH_STYLE "")" != "true" ]]; then
        set_env_var S3_FORCE_PATH_STYLE "true"
    fi

    # MinIO (S3-compatible storage — required by sync for assignment PDFs)
    if is_container_running "$MINIO_CONTAINER"; then
        ok "MinIO already running"
    else
        if docker ps -a --filter "name=^${MINIO_CONTAINER}$" --format '{{.Names}}' 2>/dev/null | grep -q "^${MINIO_CONTAINER}$"; then
            info "Restarting MinIO container (data preserved) ..."
            docker start "$MINIO_CONTAINER" > /dev/null
        else
            info "Creating MinIO container ..."
            docker run -d \
                --name "$MINIO_CONTAINER" \
                -p 127.0.0.1:9000:9000 \
                -p 127.0.0.1:9001:9001 \
                -e MINIO_ROOT_USER=minioadmin \
                -e MINIO_ROOT_PASSWORD=minioadmin \
                -v blms-local-minio-data:/data \
                --restart unless-stopped \
                minio/minio server /data --console-address ":9001" > /dev/null
        fi
        info "Waiting for MinIO ..."
        for i in $(seq 1 20); do
            if curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; then
                break
            fi
            sleep 1
        done
        ok "MinIO running on localhost:9000 (console: localhost:9001)"

        # Create bucket if it doesn't exist (uses minio/mc image as a one-shot tool)
        local bucket
        bucket=$(read_env_var S3_BUCKET "blms-local")
        if docker run --rm --net=host --entrypoint sh minio/mc -c \
            "mc alias set local http://localhost:9000 minioadmin minioadmin > /dev/null 2>&1 \
             && mc mb local/${bucket} --ignore-existing > /dev/null 2>&1"; then
            ok "S3 bucket '${bucket}' ready"
        else
            warn "Could not auto-create S3 bucket '${bucket}'"
            info "Create it manually via the MinIO console at http://localhost:9001"
        fi
    fi

    # Dev servers
    header "Dev servers"

    if is_dev_running; then
        ok "Dev servers already running (PID $(cat "$PID_FILE"))"
    else
        mkdir -p "$LOG_DIR"
        # Truncate logs for fresh session
        > "$LOG_FILE"

        info "Starting dev servers in background ..."
        info "Logs: ${BOLD}${LOG_FILE}${NC}"

        # Launch pnpm dev with all output timestamped and logged
        cd "$PROJECT_DIR"
        pnpm dev 2>&1 \
            | awk '{ print strftime("[%H:%M:%S]"), $0; fflush() }' \
            >> "$LOG_FILE" &
        local dev_pid=$!

        echo "$dev_pid" > "$PID_FILE"
        ok "Dev servers started (PID ${dev_pid})"
    fi

    # Wait for API to be ready
    wait_for_api || true

    header "Ready"
    echo ""
    echo -e "  ${GREEN}App running at:${NC}    ${BOLD}http://localhost:8181${NC}"
    echo -e "  ${GREEN}API running at:${NC}    ${BOLD}http://localhost:3000${NC}"
    echo -e "  ${GREEN}MinIO console:${NC}     ${BOLD}http://localhost:9001${NC}  ${DIM}(minioadmin/minioadmin)${NC}"
    echo ""
    echo -e "  Logs:    ${BOLD}cat ${LOG_FILE}${NC}"
    echo -e "  Errors:  ${BOLD}./scripts/local-dev.sh logs --errors${NC}"
    echo -e "  Sync:    ${BOLD}./scripts/local-dev.sh sync${NC}"
    echo -e "  Stop:    ${BOLD}./scripts/local-dev.sh down${NC}"
    echo ""
    release_lock
}

cmd_down() {
    header "Stopping"

    # Stop dev servers — kill all pnpm/node/turbo children
    if [[ -f "$PID_FILE" ]]; then
        local pid
        pid=$(cat "$PID_FILE")
        # Kill process group (covers pnpm, turbo, tsx, vite, awk)
        local pgid
        pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ') || true
        if [[ -n "$pgid" ]]; then
            kill -- -"$pgid" 2>/dev/null || true
        fi
        kill "$pid" 2>/dev/null || true
        rm -f "$PID_FILE"
        # Kill orphaned processes scoped to THIS project directory only
        pgrep -f "turbo.*dev.*${PROJECT_DIR}" 2>/dev/null | xargs -r kill 2>/dev/null || true
        pgrep -f "tsx.*${PROJECT_DIR}" 2>/dev/null | xargs -r kill 2>/dev/null || true
        pgrep -f "vite.*${PROJECT_DIR}" 2>/dev/null | xargs -r kill 2>/dev/null || true
        sleep 1
        ok "Dev servers stopped"
    else
        info "Dev servers not running"
    fi

    # Stop containers (keep them — restart is faster than recreate)
    for container in "$CDN_CONTAINER" "$TYPESENSE_CONTAINER" "$MINIO_CONTAINER" "$POSTGRES_CONTAINER"; do
        if is_container_running "$container"; then
            docker stop "$container" > /dev/null
            ok "Stopped $container"
        else
            info "$container not running"
        fi
    done

    # Reset branches to defaults
    header "Resetting branches"

    local app_branch
    app_branch=$(cd "$PROJECT_DIR" && git branch --show-current 2>/dev/null || echo "")
    if [[ -n "$app_branch" && "$app_branch" != "dev" ]]; then
        (cd "$PROJECT_DIR" && git checkout dev 2>/dev/null) && ok "App branch: dev" || warn "Could not checkout dev"
    else
        ok "App branch already on dev"
    fi

    if [[ -f "$ENV_FILE" ]]; then
        local content_url content_branch private_branch
        content_url=$(read_env_var DATA_REPOSITORY_URL "")
        content_branch=$(read_env_var DATA_REPOSITORY_BRANCH "main")
        private_branch=$(read_env_var PRIVATE_DATA_REPOSITORY_BRANCH "")

        local changed=false
        if [[ -n "$content_url" && "$content_url" != "$UPSTREAM_CONTENT_REPO" ]]; then
            set_env_var DATA_REPOSITORY_URL "$UPSTREAM_CONTENT_REPO"
            changed=true
        fi
        if [[ "$content_branch" != "dev" ]]; then
            set_env_var DATA_REPOSITORY_BRANCH "dev"
            changed=true
        fi
        if [[ -n "$private_branch" && "$private_branch" != "dev" ]]; then
            set_env_var PRIVATE_DATA_REPOSITORY_BRANCH "dev"
            changed=true
        fi

        if [[ "$changed" == true ]]; then
            ok "Content branches reset to dev (upstream)"
        else
            ok "Content branches already on dev"
        fi
    fi

    rm -f "$LOCK_FILE"
    ok "Everything stopped (containers preserved, use 'nuke' to delete)"
}

cmd_nuke() {
    header "Nuking everything"
    cmd_down
    for container in "$CDN_CONTAINER" "$TYPESENSE_CONTAINER" "$MINIO_CONTAINER" "$POSTGRES_CONTAINER"; do
        docker rm "$container" 2>/dev/null && ok "Removed $container" || true
    done
    docker volume rm blms-local-pgdata 2>/dev/null && ok "Removed PostgreSQL data volume" || true
    docker volume rm blms-local-minio-data 2>/dev/null && ok "Removed MinIO data volume" || true
    rm -rf "$LOG_DIR"
    ok "All data destroyed. Next 'up' will be a fresh start."
}

cmd_status() {
    header "Status"

    # App branch
    local app_branch
    app_branch=$(cd "$PROJECT_DIR" && git branch --show-current 2>/dev/null || echo "unknown")
    echo -e "  App branch:             ${BOLD}${app_branch}${NC}"

    # Content branches
    if [[ -f "$ENV_FILE" ]]; then
        local content_branch private_branch content_repo_url
        content_branch=$(read_env_var DATA_REPOSITORY_BRANCH "main")
        private_branch=$(read_env_var PRIVATE_DATA_REPOSITORY_BRANCH "")
        content_repo_url=$(read_env_var DATA_REPOSITORY_URL "")

        local fork_indicator=""
        if [[ -n "$content_repo_url" && "$content_repo_url" != "$UPSTREAM_CONTENT_REPO" ]]; then
            fork_indicator=" ${YELLOW}(fork)${NC}"
        fi

        echo -e "  Content branch:         ${BOLD}${content_branch}${NC}${fork_indicator}"
        if [[ -n "$fork_indicator" ]]; then
            echo -e "  Content repo:           ${DIM}${content_repo_url}${NC}"
        fi
        echo -e "  Private content branch: ${BOLD}${private_branch:-not set}${NC}"
    else
        echo -e "  Content branch:         ${DIM}no .env${NC}"
    fi

    echo ""

    # Services
    local pg_status cdn_status minio_status api_status academy_status dev_status
    if is_container_running "$POSTGRES_CONTAINER"; then pg_status="${GREEN}running${NC}"; else pg_status="${RED}stopped${NC}"; fi
    if is_container_running "$CDN_CONTAINER"; then cdn_status="${GREEN}running${NC}"; else cdn_status="${RED}stopped${NC}"; fi
    if is_container_running "$MINIO_CONTAINER"; then minio_status="${GREEN}running${NC}"; else minio_status="${RED}stopped${NC}"; fi
    if is_dev_running; then
        dev_status="${GREEN}running${NC} (PID $(cat "$PID_FILE"))"
    else
        dev_status="${RED}stopped${NC}"
    fi
    if curl -so /dev/null "${API_URL}/api/trpc" 2>/dev/null; then
        api_status="${GREEN}running${NC}"
    else
        api_status="${RED}stopped${NC}"
    fi
    if curl -sf "http://localhost:8181" > /dev/null 2>&1; then
        academy_status="${GREEN}running${NC}"
    else
        academy_status="${RED}stopped${NC}"
    fi

    echo -e "  PostgreSQL (docker):  ${pg_status}  :5432"
    echo -e "  MinIO S3 (docker):    ${minio_status}  :9000 (console :9001)"
    echo -e "  CDN nginx (docker):   ${cdn_status}  :8080"
    echo -e "  Dev servers:          ${dev_status}"
    echo -e "    API:                ${api_status}  :3000"
    echo -e "    Academy:            ${academy_status}  :8181"
    echo ""

    # Log info
    if [[ -f "$LOG_FILE" ]]; then
        local log_size log_lines
        log_size=$(du -h "$LOG_FILE" | cut -f1)
        log_lines=$(wc -l < "$LOG_FILE")
        echo -e "  Log file: ${BOLD}${LOG_FILE}${NC} (${log_lines} lines, ${log_size})"
    fi
    echo ""
}

cmd_logs() {
    local mode="recent"

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --errors)  mode="errors"; shift ;;
            --api)     mode="api"; shift ;;
            --academy) mode="academy"; shift ;;
            --tail)    mode="tail"; shift ;;
            -n)        local n="$2"; shift 2 ;;
            *)         error "Unknown flag: $1"; exit 1 ;;
        esac
    done

    if [[ ! -f "$LOG_FILE" ]]; then
        error "No log file found at $LOG_FILE — run 'up' first"
        exit 1
    fi

    local count="${n:-50}"

    case "$mode" in
        recent)
            tail -n "$count" "$LOG_FILE"
            ;;
        errors)
            grep -i 'error\|ERR!\|ERR_\|ELIFECYCLE\|ENOENT\|ECONNREFUSED\|failed\|fatal\|panic\|unhandled' "$LOG_FILE" | tail -n "$count" || info "No errors found"
            ;;
        api)
            grep '@blms/api' "$LOG_FILE" | tail -n "$count"
            ;;
        academy)
            grep '@blms/academy' "$LOG_FILE" | tail -n "$count"
            ;;
        tail)
            tail -f "$LOG_FILE"
            ;;
    esac
}

cmd_branch() {
    local app_branch="" content_branch="" private_branch=""
    local content_pr="" content_reset=false
    local interactive=true

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --app)             app_branch="$2"; interactive=false; shift 2 ;;
            --content)         content_branch="$2"; interactive=false; shift 2 ;;
            --content-pr)      content_pr="$2"; interactive=false; shift 2 ;;
            --content-reset)   content_reset=true; interactive=false; shift ;;
            --private-content) private_branch="$2"; interactive=false; shift 2 ;;
            *)                 error "Unknown flag: $1"; exit 1 ;;
        esac
    done

    if [[ "$interactive" == true ]]; then
        local current_app current_content current_private current_repo_url
        current_app=$(cd "$PROJECT_DIR" && git branch --show-current 2>/dev/null || echo "unknown")

        ensure_env
        current_content=$(read_env_var DATA_REPOSITORY_BRANCH "main")
        current_private=$(read_env_var PRIVATE_DATA_REPOSITORY_BRANCH "")
        current_repo_url=$(read_env_var DATA_REPOSITORY_URL "")

        local fork_indicator=""
        if [[ -n "$current_repo_url" && "$current_repo_url" != "$UPSTREAM_CONTENT_REPO" ]]; then
            fork_indicator=" ${YELLOW}(fork)${NC}"
        fi

        echo ""
        echo -e "  Current state:"
        echo -e "    App:             ${BOLD}${current_app}${NC}"
        echo -e "    Content:         ${BOLD}${current_content}${NC}${fork_indicator}"
        echo -e "    Private content: ${BOLD}${current_private:-not set}${NC}"
        echo ""
        echo -e "  ${BOLD}1)${NC} Switch app branch"
        echo -e "  ${BOLD}2)${NC} Switch content branch"
        echo -e "  ${BOLD}3)${NC} Review a content PR (handles forks)"
        echo -e "  ${BOLD}4)${NC} Reset content to upstream main"
        echo -e "  ${BOLD}5)${NC} Switch both (app + content)"
        echo -e "  ${BOLD}6)${NC} Cancel"
        echo ""
        read -rp "$(echo -e "${CYAN}>${NC}") Choice [1-6]: " choice

        case "$choice" in
            1) _pick_app_branch; app_branch="$PICKED_BRANCH" ;;
            2) _pick_content_branch; content_branch="$PICKED_BRANCH" ;;
            3) _pick_content_pr; content_pr="$PICKED_PR" ;;
            4) content_reset=true ;;
            5)
                _pick_app_branch; app_branch="$PICKED_BRANCH"
                _pick_content_branch; content_branch="$PICKED_BRANCH"
                ;;
            *) info "Cancelled"; exit 0 ;;
        esac
    fi

    # Apply app branch
    if [[ -n "$app_branch" ]]; then
        header "Switching app branch"
        (cd "$PROJECT_DIR" && git checkout "$app_branch")
        ok "App branch: ${BOLD}${app_branch}${NC}"

        if ! (cd "$PROJECT_DIR" && git diff HEAD@{1} --name-only 2>/dev/null | grep -q pnpm-lock.yaml); then
            info "Lockfile unchanged, skipping install"
        else
            info "Lockfile changed, running pnpm install ..."
            (cd "$PROJECT_DIR" && pnpm install)
            ok "Dependencies updated"
        fi

        # Dev servers auto-reload via tsx watch / Vite HMR — no restart needed
        if is_dev_running; then
            info "Dev servers will auto-reload via HMR"
        fi
    fi

    # Apply content branch
    local need_sync=false
    ensure_env

    # --content-reset: restore upstream repo + main branch
    if [[ "$content_reset" == true ]]; then
        header "Resetting content to upstream"
        set_env_var DATA_REPOSITORY_URL "$UPSTREAM_CONTENT_REPO"
        set_env_var DATA_REPOSITORY_BRANCH "main"
        ok "Content repo: ${BOLD}${UPSTREAM_CONTENT_REPO}${NC}"
        ok "Content branch: ${BOLD}main${NC}"
        need_sync=true
    fi

    # --content-pr: resolve PR, set fork URL + branch
    if [[ -n "$content_pr" ]]; then
        header "Switching to content PR"
        _resolve_content_pr "$content_pr"
        set_env_var DATA_REPOSITORY_URL "$PR_REPO_URL"
        set_env_var DATA_REPOSITORY_BRANCH "$PR_BRANCH"
        ok "Content repo set to: ${BOLD}${PR_REPO_URL}${NC}"
        ok "Content branch set to: ${BOLD}${PR_BRANCH}${NC}"
        need_sync=true
    fi

    if [[ -n "$content_branch" ]]; then
        # When explicitly setting a branch, reset URL to upstream
        # (user likely wants a branch from the main repo, not the fork)
        local current_url
        current_url=$(read_env_var DATA_REPOSITORY_URL "")
        if [[ -n "$current_url" && "$current_url" != "$UPSTREAM_CONTENT_REPO" ]]; then
            info "Resetting content repo URL to upstream (was pointing to a fork)"
            set_env_var DATA_REPOSITORY_URL "$UPSTREAM_CONTENT_REPO"
        fi
        set_env_var DATA_REPOSITORY_BRANCH "$content_branch"
        ok "Content branch set to: ${BOLD}${content_branch}${NC}"
        need_sync=true
    fi

    if [[ -n "$private_branch" ]]; then
        set_env_var PRIVATE_DATA_REPOSITORY_BRANCH "$private_branch"
        ok "Private content branch set to: ${BOLD}${private_branch}${NC}"
        need_sync=true
    fi

    if [[ "$need_sync" == true ]]; then
        restart_dev_servers
        trigger_sync
    fi
}

_pick_app_branch() {
    info "Fetching local branches ..."
    local branches current
    current=$(cd "$PROJECT_DIR" && git branch --show-current)
    branches=$(cd "$PROJECT_DIR" && git branch --format='%(refname:short)' | sort)

    if command -v fzf &>/dev/null; then
        PICKED_BRANCH=$(echo "$branches" | fzf \
            --height=~40% --reverse \
            --prompt="app branch> " \
            --header="Current: ${current}" \
        ) || { error "Cancelled"; exit 1; }
    else
        echo "$branches"
        read -rp "$(echo -e "${CYAN}>${NC}") Branch name: " PICKED_BRANCH
        [[ -z "$PICKED_BRANCH" ]] && { error "No selection"; exit 1; }
    fi
}

_pick_content_branch() {
    ensure_env
    local repo_url
    repo_url=$(read_env_var DATA_REPOSITORY_URL "")
    if [[ -z "$repo_url" ]]; then
        error "DATA_REPOSITORY_URL not set in .env"
        exit 1
    fi

    local current
    current=$(read_env_var DATA_REPOSITORY_BRANCH "main")

    info "Fetching remote branches from content repo ..."
    local branches
    branches=$(git ls-remote --heads "$repo_url" 2>/dev/null | awk '{print $2}' | sed 's|refs/heads/||' | sort)

    if [[ -z "$branches" ]]; then
        error "Could not fetch branches from $repo_url"
        exit 1
    fi

    if command -v fzf &>/dev/null; then
        PICKED_BRANCH=$(echo "$branches" | fzf \
            --height=~40% --reverse \
            --prompt="content branch> " \
            --header="Current: ${current}" \
        ) || { error "Cancelled"; exit 1; }
    else
        echo "$branches"
        read -rp "$(echo -e "${CYAN}>${NC}") Branch name: " PICKED_BRANCH
        [[ -z "$PICKED_BRANCH" ]] && { error "No selection"; exit 1; }
    fi
}

_resolve_content_pr() {
    local pr_number="$1"

    if ! command -v gh &>/dev/null; then
        error "gh CLI not found — install it: https://cli.github.com"
        exit 1
    fi

    info "Fetching PR #${pr_number} from ${BOLD}${UPSTREAM_CONTENT_SLUG}${NC} ..."
    local pr_json
    pr_json=$(gh pr view "$pr_number" --repo "$UPSTREAM_CONTENT_SLUG" \
        --json headRefName,headRepository,headRepositoryOwner,title,number,state 2>/dev/null) || {
        error "Could not fetch PR #${pr_number} from ${UPSTREAM_CONTENT_SLUG}"
        error "Check that the PR number is correct and you have gh auth"
        exit 1
    }

    PR_BRANCH=$(echo "$pr_json" | jq -r '.headRefName')
    PR_TITLE=$(echo "$pr_json" | jq -r '.title')
    PR_NUMBER=$(echo "$pr_json" | jq -r '.number')
    PR_STATE=$(echo "$pr_json" | jq -r '.state')
    local owner repo_name
    owner=$(echo "$pr_json" | jq -r '.headRepositoryOwner.login')
    repo_name=$(echo "$pr_json" | jq -r '.headRepository.name')
    PR_REPO_URL="https://github.com/${owner}/${repo_name}"

    local fork_label=""
    if [[ "$PR_REPO_URL" != "$UPSTREAM_CONTENT_REPO" ]]; then
        fork_label=" ${YELLOW}(fork)${NC}"
    fi

    ok "PR #${PR_NUMBER}: ${PR_TITLE}"
    info "  Branch: ${BOLD}${PR_BRANCH}${NC}"
    info "  Repo:   ${BOLD}${PR_REPO_URL}${NC}${fork_label}"
    info "  State:  ${PR_STATE}"
}

_pick_content_pr() {
    if ! command -v gh &>/dev/null; then
        error "gh CLI not found — install it: https://cli.github.com"
        exit 1
    fi

    info "Fetching open PRs from ${BOLD}${UPSTREAM_CONTENT_SLUG}${NC} ..."
    local pr_list
    pr_list=$(gh pr list --repo "$UPSTREAM_CONTENT_SLUG" --state open --limit 100 \
        --json number,title,headRefName,author \
        --jq '.[] | "#\(.number)  \(.headRefName)  \(.title)  @\(.author.login)"' 2>/dev/null)

    if [[ -z "$pr_list" ]]; then
        warn "No open PRs found"
        exit 1
    fi

    local pr_count
    pr_count=$(echo "$pr_list" | wc -l | tr -d ' ')
    info "Found ${BOLD}${pr_count}${NC} open PRs"

    local selection
    if command -v fzf &>/dev/null; then
        selection=$(echo "$pr_list" | fzf \
            --height=~40% \
            --reverse \
            --prompt="pr> " \
            --header="Type to fuzzy-search · ESC to cancel" \
            --delimiter='  ' \
            --with-nth=1,3,4 \
        ) || { error "Cancelled"; exit 1; }
    else
        warn "fzf not found — install it for fuzzy search"
        echo "$pr_list"
        read -rp "$(echo -e "${CYAN}>${NC}") PR number: " selection
        [[ -z "$selection" ]] && { error "No selection made"; exit 1; }
    fi

    # Extract PR number (strip the # prefix)
    PICKED_PR=$(echo "$selection" | awk -F'  ' '{print $1}' | tr -d '#')
}

cmd_sync() {
    ensure_env
    trigger_sync
}

# ============================================================
# Context: test user & scenario management
# ============================================================

TEST_USERNAME="testuser"
TEST_EMAIL="testuser@local.dev"
TEST_PASSWORD="test1234"
ARGON2_PATH="$PROJECT_DIR/node_modules/.pnpm/argon2@0.44.0/node_modules/argon2/argon2.cjs"

_db() {
    docker exec "$POSTGRES_CONTAINER" psql -U postgres -t -A -c "$1" 2>/dev/null
}

_db_pretty() {
    docker exec "$POSTGRES_CONTAINER" psql -U postgres -c "$1" 2>/dev/null
}

_ensure_test_user() {
    local uid
    uid=$(_db "SELECT uid FROM users.accounts WHERE username = '${TEST_USERNAME}';")
    if [[ -z "$uid" ]]; then
        info "Creating test user '${TEST_USERNAME}' (password: ${TEST_PASSWORD}) ..." >&2
        local password_hash
        password_hash=$(node -e "const {hash} = require('${ARGON2_PATH}'); hash('${TEST_PASSWORD}').then(h => console.log(h))")
        uid=$(_db "INSERT INTO users.accounts (username, email, contributor_id, password_hash)
                    VALUES ('${TEST_USERNAME}', '${TEST_EMAIL}', '${TEST_USERNAME}', '${password_hash}')
                    RETURNING uid;")
        # Create account_settings row (required for login to work)
        _db "INSERT INTO users.account_settings (uid) VALUES ('${uid}');" > /dev/null
        ok "Test user created: ${uid}" >&2
    else
        # Ensure password is set (in case user was created without one)
        local has_password
        has_password=$(_db "SELECT 1 FROM users.accounts WHERE username = '${TEST_USERNAME}' AND password_hash IS NOT NULL;")
        if [[ -z "$has_password" ]]; then
            local password_hash
            password_hash=$(node -e "const {hash} = require('${ARGON2_PATH}'); hash('${TEST_PASSWORD}').then(h => console.log(h))")
            _db "UPDATE users.accounts SET password_hash = '${password_hash}' WHERE username = '${TEST_USERNAME}';" > /dev/null
            ok "Test user: ${uid} (password set)" >&2
        else
            ok "Test user: ${uid}" >&2
        fi
    fi
    echo "$uid" | tr -d '[:space:]'
}

_ensure_enrollment() {
    local uid="$1" course_id="$2"
    local exists
    exists=$(_db "SELECT 1 FROM users.course_progress WHERE uid = '${uid}' AND course_id = '${course_id}';")
    if [[ -z "$exists" ]]; then
        info "Enrolling user in course ..."
        _db "INSERT INTO users.course_progress (uid, course_id, completed_chapters_count, progress_percentage, last_updated, start_date)
             VALUES ('${uid}', '${course_id}', 0, 0, now(), now());" > /dev/null
        ok "Enrolled"
    fi
}

_resolve_course() {
    local input="$1"
    local course_id
    # Try as direct ID first
    course_id=$(_db "SELECT id FROM content.courses WHERE id = '${input}';")
    if [[ -z "$course_id" ]]; then
        # Try as name substring match
        course_id=$(_db "SELECT c.id FROM content.courses c
                         JOIN content.courses_localized cl ON c.id = cl.course_id
                         WHERE lower(cl.name) LIKE lower('%${input}%')
                         LIMIT 1;")
    fi
    if [[ -z "$course_id" ]]; then
        error "Course not found: ${input}"
        error "Available PlanB School courses:"
        _db_pretty "SELECT c.id, cl.name FROM content.courses c
                    JOIN content.courses_localized cl ON c.id = cl.course_id
                    WHERE c.is_planb_school = true AND cl.language = 'en';"
        exit 1
    fi
    echo "$course_id"
}
# Course granting access to the career portal (BTC402, see COURSES_CAREER_ACCESS)
CAREER_COURSE_ID="0b71eea1-4811-4601-a6ad-38d043b52dca"

_ensure_career_access() {
    local uid="$1"
    # Course row must exist (FK). Create a minimal stub if content is not synced.
    local course
    course=$(_db "SELECT id FROM content.courses WHERE id = '${CAREER_COURSE_ID}';")
    if [[ -z "$course" ]]; then
        info "Course BTC402 not in DB (content not synced) — creating stub"
        _db "INSERT INTO content.courses (id, level, hours, topic, subtopic, last_commit, index)
             VALUES ('${CAREER_COURSE_ID}', 'beginner', 1, 'bitcoin', 'career', 'local-dev-stub', 'btc402');" > /dev/null
    fi
    local paid
    paid=$(_db "SELECT 1 FROM users.course_payment WHERE uid = '${uid}' AND course_id = '${CAREER_COURSE_ID}' AND payment_status = 'paid';")
    if [[ -z "$paid" ]]; then
        _db "INSERT INTO users.course_payment (uid, course_id, payment_status, amount, payment_id, method)
             VALUES ('${uid}', '${CAREER_COURSE_ID}', 'paid', 0, 'local-dev-grant', 'free');" > /dev/null
    fi
    ok "Career portal access granted (paid BTC402)"
}

_ensure_career_profile() {
    # Creates/returns a career profile id for the user.
    # IMPORTANT: always use gen_random_uuid() — zod validates UUIDs strictly
    # (hand-crafted ids like 1111... fail output validation with an opaque 500).
    local uid="$1"
    local pid
    pid=$(_db "SELECT id FROM users.career_profiles WHERE uid = '${uid}';")
    if [[ -z "$pid" ]]; then
        pid=$(_db "INSERT INTO users.career_profiles (uid, id) VALUES ('${uid}', gen_random_uuid()) RETURNING id;" | head -n1)
    fi
    echo "$pid"
}

_career_fill_step1() {
    local uid="$1" pid="$2"
    _db "UPDATE users.career_profiles SET
            first_name = 'Test', last_name = 'User', country = 'France', email = '${TEST_EMAIL}'
         WHERE id = '${pid}';" > /dev/null
    _db "INSERT INTO users.career_languages (career_profile_id, language_code, level)
         VALUES ('${pid}', 'en', 'fluent') ON CONFLICT DO NOTHING;" > /dev/null
}

_career_fill_step2() {
    local pid="$1"
    # job_titles is seeded by migrations; pick a real row (never invent ids)
    _db "INSERT INTO users.career_roles (career_profile_id, role_id, level)
         SELECT '${pid}', id, 'junior' FROM users.job_titles LIMIT 1
         ON CONFLICT DO NOTHING;" > /dev/null
    _db "INSERT INTO users.career_company_sizes (career_profile_id, size)
         VALUES ('${pid}', '1To10') ON CONFLICT DO NOTHING;" > /dev/null
}

_career_fill_step3() {
    local pid="$1"
    _db "UPDATE users.career_profiles SET
            cv_url = '/api/files/cvs/${pid}',
            motivation_letter = 'Local-dev seeded motivation letter.'
         WHERE id = '${pid}';" > /dev/null
}

_apply_career_preset() {
    local preset="$1" uid="$2"
    _ensure_career_access "$uid"
    local pid
    pid=$(_ensure_career_profile "$uid")
    case "$preset" in
        career-access) ;; # access only, no profile data
        career-step1) _career_fill_step1 "$uid" "$pid" ;;
        career-step2) _career_fill_step1 "$uid" "$pid"; _career_fill_step2 "$pid" ;;
        career-step3) _career_fill_step1 "$uid" "$pid"; _career_fill_step2 "$pid"; _career_fill_step3 "$pid" ;;
        career-complete)
            _career_fill_step1 "$uid" "$pid"; _career_fill_step2 "$pid"; _career_fill_step3 "$pid"
            _db "UPDATE users.career_profiles SET are_terms_accepted = true, allow_receiving_emails = true WHERE id = '${pid}';" > /dev/null
            ;;
        career-reset)
            _db "DELETE FROM users.career_profiles WHERE uid = '${uid}';" > /dev/null
            ok "Career profile deleted"
            return
            ;;
    esac
    ok "Preset '${preset}' applied (profile ${pid})"
    _db_pretty "SELECT first_name, country, cv_url IS NOT NULL AS has_cv, motivation_letter IS NOT NULL AS has_letter, are_terms_accepted, allow_receiving_emails
                FROM users.career_profiles WHERE id = '${pid}';"
}


_apply_preset() {
    local preset="$1" uid="$2" course_id="$3"

    case "$preset" in
        assignment-can-rank)
            info "Preset: student can rank assignments"
            _db "UPDATE users.course_progress SET
                    is_selected_for_assignment = true,
                    applied_assignment_ids = null,
                    affected_assignment_id = null,
                    assignment_submission_time = null,
                    assignment_grade = null
                 WHERE uid = '${uid}' AND course_id = '${course_id}';" > /dev/null
            ;;
        assignment-ranked)
            info "Preset: student has already ranked"
            local assignment_ids
            assignment_ids=$(_db "SELECT array_agg(id) FROM content.course_assignment WHERE course_id = '${course_id}';")
            _db "UPDATE users.course_progress SET
                    is_selected_for_assignment = true,
                    applied_assignment_ids = '${assignment_ids}',
                    affected_assignment_id = null,
                    assignment_submission_time = null,
                    assignment_grade = null
                 WHERE uid = '${uid}' AND course_id = '${course_id}';" > /dev/null
            ;;
        assignment-affected)
            info "Preset: student has been assigned a project"
            local first_assignment
            first_assignment=$(_db "SELECT id FROM content.course_assignment WHERE course_id = '${course_id}' LIMIT 1;")
            local assignment_ids
            assignment_ids=$(_db "SELECT array_agg(id) FROM content.course_assignment WHERE course_id = '${course_id}';")
            _db "UPDATE users.course_progress SET
                    is_selected_for_assignment = true,
                    applied_assignment_ids = '${assignment_ids}',
                    affected_assignment_id = '${first_assignment}',
                    assignment_submission_time = null,
                    assignment_grade = null
                 WHERE uid = '${uid}' AND course_id = '${course_id}';" > /dev/null
            ;;
        assignment-submitted)
            info "Preset: student has submitted work"
            local first_assignment
            first_assignment=$(_db "SELECT id FROM content.course_assignment WHERE course_id = '${course_id}' LIMIT 1;")
            local assignment_ids
            assignment_ids=$(_db "SELECT array_agg(id) FROM content.course_assignment WHERE course_id = '${course_id}';")
            _db "UPDATE users.course_progress SET
                    is_selected_for_assignment = true,
                    applied_assignment_ids = '${assignment_ids}',
                    affected_assignment_id = '${first_assignment}',
                    assignment_submission_time = now(),
                    assignment_grade = null
                 WHERE uid = '${uid}' AND course_id = '${course_id}';" > /dev/null
            ;;
        not-selected)
            info "Preset: student not selected for assignment"
            _db "UPDATE users.course_progress SET
                    is_selected_for_assignment = false,
                    applied_assignment_ids = null,
                    affected_assignment_id = null,
                    assignment_submission_time = null,
                    assignment_grade = null
                 WHERE uid = '${uid}' AND course_id = '${course_id}';" > /dev/null
            ;;
        clean)
            info "Preset: reset to clean state"
            _db "UPDATE users.course_progress SET
                    is_selected_for_assignment = null,
                    applied_assignment_ids = null,
                    affected_assignment_id = null,
                    assignment_submission_time = null,
                    assignment_grade = null,
                    ranking = null,
                    total_score = null
                 WHERE uid = '${uid}' AND course_id = '${course_id}';" > /dev/null
            ;;
        *)
            error "Unknown preset: ${preset}"
            echo ""
            echo "Available presets:"
            echo "  assignment-can-rank   — selected, can drag-and-drop rank"
            echo "  assignment-ranked     — has submitted ranking, waiting for assignment"
            echo "  assignment-affected   — assigned to a project, can submit work"
            echo "  assignment-submitted  — has submitted work"
            echo "  not-selected          — not selected for assignment"
            echo "  clean                 — reset all assignment fields to null"
            echo "  career-access         — grant career portal access (paid BTC402)"
            echo "  career-step1|2|3      — career profile filled up to step N"
            echo "  career-complete       — career profile fully validated"
            echo "  career-reset          — delete career profile"
            exit 1
            ;;
    esac
    ok "Preset '${preset}' applied"
}

_show_context() {
    local uid="$1" course_id="$2"
    _db_pretty "SELECT
        cp.course_id,
        cl.name AS course_name,
        cp.is_selected_for_assignment,
        cp.applied_assignment_ids,
        cp.affected_assignment_id,
        cp.assignment_submission_time,
        cp.assignment_grade,
        cp.ranking,
        cp.total_score,
        cp.progress_percentage
    FROM users.course_progress cp
    JOIN content.courses_localized cl ON cl.course_id = cp.course_id AND cl.language = 'en'
    WHERE cp.uid = '${uid}' AND cp.course_id = '${course_id}';"
}

cmd_context() {
    local course="" preset="" show=false list=false setup=false
    local -a sets=()

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --course)  course="$2"; shift 2 ;;
            --preset)  preset="$2"; shift 2 ;;
            --set)     sets+=("$2"); shift 2 ;;
            --show)    show=true; shift ;;
            --list)    list=true; shift ;;
            --setup)   setup=true; shift ;;
            *)         error "Unknown flag: $1"; exit 1 ;;
        esac
    done

    # List presets
    if [[ "$list" == true ]]; then
        echo ""
        echo -e "  ${BOLD}Available presets${NC}"
        echo ""
        echo -e "  ${BOLD}assignment-can-rank${NC}    selected, can drag-and-drop rank"
        echo -e "  ${BOLD}assignment-ranked${NC}      has submitted ranking, waiting"
        echo -e "  ${BOLD}assignment-affected${NC}    assigned to a project, can submit"
        echo -e "  ${BOLD}assignment-submitted${NC}   has submitted work"
        echo -e "  ${BOLD}not-selected${NC}           not selected for assignment"
        echo -e "  ${BOLD}clean${NC}                  reset all assignment fields"
        echo ""
        echo -e "  ${BOLD}career-access${NC}          grant career portal access (paid BTC402)"
        echo -e "  ${BOLD}career-step1|2|3${NC}       career profile filled up to step N"
        echo -e "  ${BOLD}career-complete${NC}        career profile fully validated"
        echo -e "  ${BOLD}career-reset${NC}           delete career profile"
        echo ""
        echo "Career presets don't need --course:"
        echo "  ./scripts/local-dev.sh context --preset career-step3"
        echo ""
        echo "Usage: ./scripts/local-dev.sh context --preset <name> --course <id-or-name>"
        return
    fi

    # Ensure test user exists
    local uid
    uid=$(_ensure_test_user)
    # Career presets are course-independent
    if [[ "$preset" == career-* ]]; then
        _apply_career_preset "$preset" "$uid"
        return
    fi

    if [[ "$setup" == true && -z "$course" ]]; then
        echo ""
        echo -e "  User: ${BOLD}${TEST_USERNAME}${NC} (${uid})"
        echo -e "  Login via: ${BOLD}http://localhost:8181${NC}"
        echo ""
        echo -e "  PlanB School courses:"
        _db_pretty "SELECT c.id, cl.name,
                        (SELECT count(*) FROM content.course_assignment ca WHERE ca.course_id = c.id) AS assignments
                    FROM content.courses c
                    JOIN content.courses_localized cl ON c.id = cl.course_id
                    WHERE c.is_planb_school = true AND cl.language = 'en';"
        return
    fi

    # Course is required for everything else
    if [[ -z "$course" ]]; then
        error "Missing --course <id-or-name>"
        echo "Tip: use --setup to see available courses, or --list to see presets"
        exit 1
    fi

    local course_id
    course_id=$(_resolve_course "$course")
    info "Course: ${BOLD}${course_id}${NC}"

    # Ensure enrollment
    _ensure_enrollment "$uid" "$course_id"

    # Apply preset
    if [[ -n "$preset" ]]; then
        _apply_preset "$preset" "$uid" "$course_id"
    fi

    # Apply individual --set flags
    for s in "${sets[@]}"; do
        local key="${s%%=*}"
        local value="${s#*=}"
        if [[ "$value" == "null" ]]; then
            _db "UPDATE users.course_progress SET ${key} = null WHERE uid = '${uid}' AND course_id = '${course_id}';" > /dev/null
        elif [[ "$value" == "true" || "$value" == "false" ]]; then
            _db "UPDATE users.course_progress SET ${key} = ${value} WHERE uid = '${uid}' AND course_id = '${course_id}';" > /dev/null
        else
            _db "UPDATE users.course_progress SET ${key} = '${value}' WHERE uid = '${uid}' AND course_id = '${course_id}';" > /dev/null
        fi
        ok "Set ${BOLD}${key}${NC} = ${value}"
    done

    # Always show result
    if [[ -n "$preset" || "${#sets[@]}" -gt 0 || "$show" == true ]]; then
        echo ""
        _show_context "$uid" "$course_id"
    fi
}

# ============================================================
# Main
# ============================================================

COMMAND="${1:-}"
shift || true

case "$COMMAND" in
    up)       cmd_up "$@" ;;
    down)     cmd_down "$@" ;;
    status)   cmd_status "$@" ;;
    logs)     cmd_logs "$@" ;;
    branch)   cmd_branch "$@" ;;
    sync)     cmd_sync "$@" ;;
    nuke)     cmd_nuke "$@" ;;
    context)  cmd_context "$@" ;;
    "")
        echo ""
        echo -e "  ${BOLD}BLMS Local Dev${NC}"
        echo ""
        echo -e "  ${BOLD}1)${NC} up       Start everything (infra + dev servers)"
        echo -e "  ${BOLD}2)${NC} down     Stop everything"
        echo -e "  ${BOLD}3)${NC} status   Show current state"
        echo -e "  ${BOLD}4)${NC} logs     Show recent logs"
        echo -e "  ${BOLD}5)${NC} branch   Switch branches"
        echo -e "  ${BOLD}6)${NC} sync     Sync content from repos"
        echo -e "  ${BOLD}7)${NC} context  Set up test user & scenarios"
        echo ""
        read -rp "$(echo -e "${CYAN}>${NC}") Choice [1-7]: " choice
        case "$choice" in
            1) cmd_up ;;
            2) cmd_down ;;
            3) cmd_status ;;
            4) cmd_logs ;;
            5) cmd_branch ;;
            6) cmd_sync ;;
            7) cmd_context --list ;;
            *) error "Invalid choice"; exit 1 ;;
        esac
        ;;
    -h|--help)
        sed -n '2,/^$/{ s/^# \?//; p }' "$0"
        ;;
    *)
        error "Unknown command: $COMMAND"
        echo "Run with --help for usage"
        exit 1
        ;;
esac
