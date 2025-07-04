#!/bin/bash

# Docker Cleanup and Restart Script
# This script performs a complete Docker cleanup and restart workflow

set -e  # Exit on any error

echo "🧹 Starting Docker cleanup and restart process..."

# Step 1: Stop all running containers
echo "📦 Stopping all running containers..."
if [ "$(docker ps -q)" ]; then
    docker stop $(docker ps -q)
    echo "✅ All running containers stopped"
else
    echo "ℹ️  No running containers to stop"
fi

# Step 2: Remove all containers (running and stopped)
echo "🗑️  Removing all containers..."
if [ "$(docker ps -aq)" ]; then
    docker rm $(docker ps -aq)
    echo "✅ All containers removed"
else
    echo "ℹ️  No containers to remove"
fi

# Step 3: Remove the specific postgres volume
echo "💾 Removing postgres volume..."
if docker volume ls | grep -q "bitcoin-learning-management-system_postgres"; then
    docker volume rm bitcoin-learning-management-system_postgres
    echo "✅ Postgres volume removed"
else
    echo "ℹ️  Postgres volume not found or already removed"
fi

# Step 4: Start services with docker compose up
echo "🚀 Starting services with docker compose up..."
docker compose up -d
echo "✅ Services started"

# Wait a moment for containers to fully start
echo "⏳ Waiting for containers to initialize..."
sleep 5

# Step 5: Stop specific containers (api, web, contribute)
echo "⏹️  Stopping specific containers (api, web, contribute)..."

# Get the project name from the current directory (Docker Compose uses lowercase with hyphens)
PROJECT_NAME=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]')

containers_to_stop=("${PROJECT_NAME}-api-1" "${PROJECT_NAME}-web-1" "${PROJECT_NAME}-contribute-1")

for container in "${containers_to_stop[@]}"; do
    if docker ps --format "table {{.Names}}" | grep -q "^${container}$"; then
        docker stop "$container"
        echo "✅ Stopped $container"
    else
        echo "ℹ️  Container $container not found or not running"
    fi
done

echo "🎉 Docker cleanup and restart process completed!"
echo ""
echo "📋 Summary:"
echo "   - All containers stopped and removed"
echo "   - Postgres volume removed"
echo "   - Services restarted with docker compose up"
echo "   - API, Web, and Contribute containers stopped"

