#!/usr/bin/env bash
# Mainnet deploy, run by GitHub Actions over SSH.
#
# The CI deploy key in /home/ubuntu/.ssh/authorized_keys is pinned to this
# script (restrict,command="..."), so that key can do nothing else. The client
# may pass the commit SHA it built as its SSH command. We then take compose.yml
# and the cdn nginx.conf from that exact commit instead of the branch head.
#
# Replaces the old github-hook (port 8080) + ci-hook-mainnet.sh, which was
# turned off on 2026-10-25.
set -euo pipefail

branch="mainnet"
project_dir="/home/ubuntu/mainnet"
log="/var/log/ci-hook.log"
min_free_gb=15
raw="https://raw.githubusercontent.com/PlanB-Network/bitcoin-learning-management-system"

exec 9>/tmp/deploy-mainnet.lock
if ! flock -n 9; then
  echo "Another deploy is already running." >&2
  exit 1
fi

ref="refs/heads/$branch"
sha="${SSH_ORIGINAL_COMMAND:-}"
if [[ "$sha" =~ ^[0-9a-f]{40}$ ]]; then
  ref="$sha"
elif [[ -n "$sha" ]]; then
  echo "Ignoring unexpected argument; deploying the $branch branch head." >&2
fi

echo "Deploy (mainnet, $ref) started at $(date -R)" | tee -a "$log"

free_gb() { df --output=avail -BG "$project_dir" | tail -1 | tr -dc '0-9'; }

if (( $(free_gb) < min_free_gb )); then
  echo "Less than ${min_free_gb}G free, pruning images older than 7 days." | tee -a "$log"
  docker image prune -af --filter "until=168h" >/dev/null
  if (( $(free_gb) < min_free_gb )); then
    echo "Still less than ${min_free_gb}G free; aborting so production keeps running." | tee -a "$log" >&2
    exit 1
  fi
fi

cd "$project_dir"
mkdir -p well-known cdn corestore data

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
curl -fsSL "$raw/$ref/docker/compose.yml" -o "$tmp/compose.yml"
curl -fsSL "$raw/$ref/docker/cdn/nginx.conf" -o "$tmp/nginx.conf"

# Check the new compose file together with the server's override and .env
# before replacing anything.
cp compose.override.yml .env "$tmp/" 2>/dev/null || true
docker compose --project-directory "$tmp" -f "$tmp/compose.yml" \
  $( [[ -f "$tmp/compose.override.yml" ]] && echo -f "$tmp/compose.override.yml" ) \
  config -q

mv "$tmp/compose.yml" compose.yml
mv "$tmp/nginx.conf" cdn/nginx.conf

export PLANB_ENVIRONMENT=mainnet
docker compose pull -q
# Only recreates containers whose image or config changed. Removes services
# that left compose.yml (e.g. contribute).
docker compose up -d --remove-orphans

docker image prune -af --filter "until=168h" >/dev/null || true

echo "Deploy (mainnet, $ref) finished at $(date -R), $(free_gb)G free" | tee -a "$log"
