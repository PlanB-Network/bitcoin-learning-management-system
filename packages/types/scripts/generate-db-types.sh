#!/usr/bin/env bash

set -e

psql() {
	docker exec -u postgres dev-postgres-1 psql "$@"
}

# create types databases
psql -c 'DROP DATABASE IF EXISTS types'
psql -c 'CREATE DATABASE types'

# run current migrations
cd ../.. && nx run database:migrations:run --database=types
cd packages/types

# remove current types
rm -rf ./src/sql

# generate types from the types databases
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/types" pnpm kanel

# Clean sql folder
find ./src -depth -name "Migrations.*" -exec rm -rf '{}' +
find ./src -depth -name "_*" -exec rm -rf '{}' +

# clean up types databases
psql -c 'DROP DATABASE types'

