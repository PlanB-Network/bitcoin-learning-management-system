#!/usr/bin/env bash
set -euo pipefail

# Review content from a specific branch of the bitcoin-educational-content repo
# Usage: ./scripts/review-content.sh [branch-name]   # direct branch
#        ./scripts/review-content.sh --pr             # pick from open PRs
#        ./scripts/review-content.sh                  # interactive: choose PR or branch

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"
API_URL="${API_URL:-http://localhost:3000}"

# Detect docker compose command (prefer standalone docker-compose)
if command -v docker-compose &>/dev/null; then
    COMPOSE="docker-compose"
elif docker compose version &>/dev/null; then
    COMPOSE="docker compose"
else
    echo "Error: neither 'docker-compose' nor 'docker compose' found" >&2
    exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${CYAN}→${NC} $*"; }
ok()    { echo -e "${GREEN}✓${NC} $*"; }
warn()  { echo -e "${YELLOW}!${NC} $*"; }
error() { echo -e "${RED}✗${NC} $*" >&2; }

# ---------- Read DATA_REPOSITORY_URL from .env ----------

if [[ ! -f "$ENV_FILE" ]]; then
    error ".env file not found at $ENV_FILE"
    exit 1
fi

REPO_URL=$(grep -E '^DATA_REPOSITORY_URL=' "$ENV_FILE" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
if [[ -z "$REPO_URL" ]]; then
    error "DATA_REPOSITORY_URL not set in .env"
    exit 1
fi

# Extract owner/repo from URL (supports https and git@ formats)
REPO_SLUG=$(echo "$REPO_URL" | sed -E 's|.*github\.com[:/]||; s|\.git$||')

CURRENT_BRANCH=$(grep -E '^DATA_REPOSITORY_BRANCH=' "$ENV_FILE" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "main")
[[ -z "$CURRENT_BRANCH" ]] && CURRENT_BRANCH="main"

# ---------- Helpers ----------

pick_from_branches() {
    info "Fetching remote branches from ${BOLD}${REPO_SLUG}${NC} ..."
    BRANCHES=$(git ls-remote --heads "$REPO_URL" 2>/dev/null | awk '{print $2}' | sed 's|refs/heads/||' | sort)

    if [[ -z "$BRANCHES" ]]; then
        error "Could not fetch branches from $REPO_URL"
        exit 1
    fi

    BRANCH_COUNT=$(echo "$BRANCHES" | wc -l | tr -d ' ')
    info "Found ${BOLD}${BRANCH_COUNT}${NC} branches (current: ${BOLD}${CURRENT_BRANCH}${NC})"

    DECORATED=$(echo "$BRANCHES" | while IFS= read -r b; do
        if [[ "$b" == "$CURRENT_BRANCH" ]]; then
            echo "$b  ← current"
        else
            echo "$b"
        fi
    done)

    if command -v fzf &>/dev/null; then
        SELECTION=$(echo "$DECORATED" | fzf \
            --height=~40% \
            --reverse \
            --prompt="branch> " \
            --header="Type to fuzzy-search · ESC to cancel" \
        ) || { error "Cancelled"; exit 1; }
        BRANCH=$(echo "$SELECTION" | awk '{print $1}')
    else
        warn "fzf not found — install it for fuzzy search"
        echo "$DECORATED"
        read -rp "$(echo -e "${CYAN}→${NC}") Type branch name: " BRANCH
        [[ -z "$BRANCH" ]] && { error "No selection made"; exit 1; }
    fi
}

pick_from_prs() {
    if ! command -v gh &>/dev/null; then
        error "gh CLI not found — install it: https://cli.github.com"
        exit 1
    fi

    info "Fetching open PRs from ${BOLD}${REPO_SLUG}${NC} ..."
    PR_LIST=$(gh pr list --repo "$REPO_SLUG" --state open --limit 100 \
        --json number,title,headRefName,author \
        --jq '.[] | "#\(.number)  \(.headRefName)  \(.title)  @\(.author.login)"' 2>/dev/null)

    if [[ -z "$PR_LIST" ]]; then
        warn "No open PRs found"
        exit 1
    fi

    PR_COUNT=$(echo "$PR_LIST" | wc -l | tr -d ' ')
    info "Found ${BOLD}${PR_COUNT}${NC} open PRs"

    if command -v fzf &>/dev/null; then
        SELECTION=$(echo "$PR_LIST" | fzf \
            --height=~40% \
            --reverse \
            --prompt="pr> " \
            --header="Type to fuzzy-search · ESC to cancel" \
            --delimiter='  ' \
            --with-nth=1,3,4 \
            --preview-window=hidden \
        ) || { error "Cancelled"; exit 1; }
        # Extract the branch name (second field)
        BRANCH=$(echo "$SELECTION" | awk -F'  ' '{print $2}')
    else
        warn "fzf not found — install it for fuzzy search"
        echo "$PR_LIST"
        read -rp "$(echo -e "${CYAN}→${NC}") Type branch name from a PR above: " BRANCH
        [[ -z "$BRANCH" ]] && { error "No selection made"; exit 1; }
    fi
}

# ---------- Get branch name ----------

MODE=""
BRANCH=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --pr)  MODE="pr"; shift ;;
        --branch) MODE="branch"; shift ;;
        -*)    error "Unknown flag: $1"; exit 1 ;;
        *)     BRANCH="$1"; shift ;;
    esac
done

if [[ -n "$BRANCH" ]]; then
    : # already set from positional arg
elif [[ "$MODE" == "pr" ]]; then
    pick_from_prs
elif [[ "$MODE" == "branch" ]]; then
    pick_from_branches
else
    # Interactive: choose mode first
    info "Current content branch: ${BOLD}${CURRENT_BRANCH}${NC}"
    echo ""
    echo -e "  ${BOLD}1)${NC} Open PR"
    echo -e "  ${BOLD}2)${NC} Branch"
    echo -e "  ${BOLD}3)${NC} Reset to main"
    echo ""
    read -rp "$(echo -e "${CYAN}→${NC}") Pick source [1/2/3]: " CHOICE
    case "$CHOICE" in
        1) pick_from_prs ;;
        2) pick_from_branches ;;
        3) BRANCH="main" ;;
        *) error "Invalid choice"; exit 1 ;;
    esac
fi

# ---------- Confirm ----------

if [[ "$BRANCH" == "$CURRENT_BRANCH" ]]; then
    warn "Already on branch ${BOLD}${BRANCH}${NC}"
    read -rp "$(echo -e "${CYAN}→${NC}") Re-sync anyway? [y/N] " CONFIRM
    [[ "$CONFIRM" != [yY]* ]] && exit 0
fi

echo ""
info "Switching content branch: ${BOLD}${CURRENT_BRANCH}${NC} → ${BOLD}${BRANCH}${NC}"

# ---------- Update .env ----------

if grep -qE '^DATA_REPOSITORY_BRANCH=' "$ENV_FILE"; then
    sed -i "s|^DATA_REPOSITORY_BRANCH=.*|DATA_REPOSITORY_BRANCH=${BRANCH}|" "$ENV_FILE"
else
    echo "DATA_REPOSITORY_BRANCH=${BRANCH}" >> "$ENV_FILE"
fi
ok "Updated .env"

# ---------- Restart API container ----------

info "Restarting API container ..."
(cd "$PROJECT_DIR" && $COMPOSE up -d api)
ok "API container restarted"

# ---------- Wait for API to be ready ----------

info "Waiting for API to be ready ..."
for i in $(seq 1 30); do
    if curl -sf "${API_URL}/api/health" > /dev/null 2>&1 || curl -sf "${API_URL}" > /dev/null 2>&1; then
        ok "API is ready"
        break
    fi
    if [[ $i -eq 30 ]]; then
        warn "API not responding after 30s, triggering sync anyway"
    fi
    sleep 1
done

# ---------- Trigger sync ----------

info "Triggering full content sync (this may take a few minutes) ..."
echo ""

RESPONSE=$(curl -sf -w "\n%{http_code}" -X POST "${API_URL}/api/github/sync" 2>&1) || {
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    error "Sync request failed (HTTP ${HTTP_CODE:-???})"
    error "Is the API running? Check: docker compose logs api"
    exit 1
}

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "201" ]]; then
    ok "Sync completed on branch ${BOLD}${BRANCH}${NC}"
    if [[ -n "$BODY" ]]; then
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    fi
else
    warn "Sync returned HTTP ${HTTP_CODE}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
fi
