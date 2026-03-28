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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"
ENV_EXAMPLE="$PROJECT_DIR/.env.example"
API_URL="${API_URL:-http://localhost:3000}"
POSTGRES_CONTAINER="blms-local-postgres"
CDN_CONTAINER="blms-local-cdn"
TYPESENSE_CONTAINER="blms-local-typesense"
LOG_DIR="/tmp/blms-dev"
LOG_FILE="$LOG_DIR/combined.log"
PID_FILE="$LOG_DIR/dev.pid"
LOCK_FILE="$LOG_DIR/local-dev.lock"

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

trigger_sync() {
    local pub_branch priv_branch
    pub_branch=$(read_env_var DATA_REPOSITORY_BRANCH "main")
    priv_branch=$(read_env_var PRIVATE_DATA_REPOSITORY_BRANCH "")

    info "Syncing content (public: ${BOLD}${pub_branch}${NC}, private: ${BOLD}${priv_branch:-none}${NC}) ..."

    if ! wait_for_api; then
        error "Cannot sync — API is not running"
        return 1
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
}

# ============================================================
# Commands
# ============================================================

cmd_up() {
    acquire_lock
    header "Infrastructure"

    # .env
    ensure_env

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
    echo -e "  ${GREEN}App running at:${NC}  ${BOLD}http://localhost:8181${NC}"
    echo -e "  ${GREEN}API running at:${NC}  ${BOLD}http://localhost:3000${NC}"
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
    for container in "$CDN_CONTAINER" "$TYPESENSE_CONTAINER" "$POSTGRES_CONTAINER"; do
        if is_container_running "$container"; then
            docker stop "$container" > /dev/null
            ok "Stopped $container"
        else
            info "$container not running"
        fi
    done

    rm -f "$LOCK_FILE"
    ok "Everything stopped (containers preserved, use 'nuke' to delete)"
}

cmd_nuke() {
    header "Nuking everything"
    cmd_down
    for container in "$CDN_CONTAINER" "$TYPESENSE_CONTAINER" "$POSTGRES_CONTAINER"; do
        docker rm "$container" 2>/dev/null && ok "Removed $container" || true
    done
    docker volume rm blms-local-pgdata 2>/dev/null && ok "Removed PostgreSQL data volume" || true
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
        local content_branch private_branch
        content_branch=$(read_env_var DATA_REPOSITORY_BRANCH "main")
        private_branch=$(read_env_var PRIVATE_DATA_REPOSITORY_BRANCH "")
        echo -e "  Content branch:         ${BOLD}${content_branch}${NC}"
        echo -e "  Private content branch: ${BOLD}${private_branch:-not set}${NC}"
    else
        echo -e "  Content branch:         ${DIM}no .env${NC}"
    fi

    echo ""

    # Services
    local pg_status cdn_status api_status academy_status dev_status
    if is_container_running "$POSTGRES_CONTAINER"; then pg_status="${GREEN}running${NC}"; else pg_status="${RED}stopped${NC}"; fi
    if is_container_running "$CDN_CONTAINER"; then cdn_status="${GREEN}running${NC}"; else cdn_status="${RED}stopped${NC}"; fi
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
    local interactive=true

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --app)             app_branch="$2"; interactive=false; shift 2 ;;
            --content)         content_branch="$2"; interactive=false; shift 2 ;;
            --private-content) private_branch="$2"; interactive=false; shift 2 ;;
            *)                 error "Unknown flag: $1"; exit 1 ;;
        esac
    done

    if [[ "$interactive" == true ]]; then
        local current_app current_content current_private
        current_app=$(cd "$PROJECT_DIR" && git branch --show-current 2>/dev/null || echo "unknown")

        ensure_env
        current_content=$(read_env_var DATA_REPOSITORY_BRANCH "main")
        current_private=$(read_env_var PRIVATE_DATA_REPOSITORY_BRANCH "")

        echo ""
        echo -e "  Current state:"
        echo -e "    App:             ${BOLD}${current_app}${NC}"
        echo -e "    Content:         ${BOLD}${current_content}${NC}"
        echo -e "    Private content: ${BOLD}${current_private:-not set}${NC}"
        echo ""
        echo -e "  ${BOLD}1)${NC} Switch app branch"
        echo -e "  ${BOLD}2)${NC} Switch content branch"
        echo -e "  ${BOLD}3)${NC} Switch both"
        echo -e "  ${BOLD}4)${NC} Cancel"
        echo ""
        read -rp "$(echo -e "${CYAN}>${NC}") Choice [1/2/3/4]: " choice

        case "$choice" in
            1) _pick_app_branch; app_branch="$PICKED_BRANCH" ;;
            2) _pick_content_branch; content_branch="$PICKED_BRANCH" ;;
            3)
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

    if [[ -n "$content_branch" ]]; then
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
        echo "Usage: ./scripts/local-dev.sh context --preset <name> --course <id-or-name>"
        return
    fi

    # Ensure test user exists
    local uid
    uid=$(_ensure_test_user)

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
