#!/usr/bin/env bash

set -e

psql() {
	docker exec -u postgres sovereign-university-postgres-1 psql "$@"
}

# create types databases
psql -c 'DROP DATABASE IF EXISTS types'
psql -c 'CREATE DATABASE types'

# run current migrations
cd ../.. && pnpm nx run database:migrations:run --database=types
cd libs/types

# remove current types
rm -rf ./src/sql

# generate types from the types databases
npx kanel --database "postgresql://postgres:postgres@localhost:5432/types" --config .kanelrc.cjs

# Clean sql folder
find ./src -depth -name "Migrations.*" -exec rm -rf '{}' +
find ./src -depth -name "_*" -exec rm -rf '{}' +

# clean up types databases
psql -c 'DROP DATABASE types'
