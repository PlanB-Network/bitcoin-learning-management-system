# Agent guide — local development & bug reproduction

Read this before touching the local environment. It exists because agents (and
humans) keep rediscovering the same traps.

## TL;DR

```bash
./scripts/local-dev.sh up        # start everything (postgres, minio, typesense, cdn, dev servers)
./scripts/local-dev.sh status    # what's running
./scripts/local-dev.sh logs --errors
./scripts/local-dev.sh context --preset career-step3   # seed test user + scenario
./scripts/local-dev.sh down
```

- Academy front: http://localhost:8181 — API: http://localhost:3000
- Test user: `testuser` / `test1234` (created by `context`)
- Logs (all services, greppable): `/tmp/blms-dev/combined.log`

## Two stacks — pick ONE, never both

| | `scripts/local-dev.sh` (preferred for piloting) | `docker compose up` (README option 1) |
|---|---|---|
| Containers | `blms-local-*` | `bitcoin-learning-management-system-*` |
| Dev servers | on host (pnpm, hot reload) | inside containers |
| Seeding/presets | built-in (`context`) | manual SQL |

They bind the same ports (5432, 8108, 9000). `local-dev.sh up` refuses to start
if the compose stack is running. If you hit `port is already allocated`, the
other stack is up.

Compose caveat: only `apps/*` and a subset of `packages/*/src` are volume-mounted
into containers — an edit in a non-mounted package silently does nothing until
you `docker cp` or rebuild. Check the `volumes:` list in `compose.yml`.

## Seeding scenarios (context command)

Never hand-craft SQL for user/profile state — use presets, or extend them
(`_apply_preset` / `_apply_career_preset` in `scripts/local-dev.sh`):

```bash
./scripts/local-dev.sh context --list                  # all presets
./scripts/local-dev.sh context --preset career-step3   # career profile ready for step 4
./scripts/local-dev.sh context --preset assignment-can-rank --course btc402
./scripts/local-dev.sh context --set progress_percentage=100 --course btc402
```

Rules learned the hard way:
- **Always `gen_random_uuid()`** for ids. zod validates UUIDs strictly (RFC
  version/variant nibbles); a hand-made `1111...` id passes the DB but makes
  tRPC output validation fail with an opaque 500 — the UI just shows empty data.
- Prefer referencing existing rows (e.g. `users.job_titles` is seeded by
  migrations) over inserting new ones; enums and NOT NULL columns bite.
- Career portal access is gated on having *bought* a course from
  `COURSES_CAREER_ACCESS` (`packages/shared/src/utils.ts`) — the `career-*`
  presets handle that.

## S3 / file uploads

Both stacks provide a local MinIO (`S3_FORCE_PATH_STYLE=true` is required —
MinIO doesn't support vhost-style buckets). If uploads return 500 with
`ECONNREFUSED :9000`, MinIO isn't up or `S3_ENDPOINT` points to the wrong host
(inside compose containers it must be `http://minio:9000`, not `localhost`).
MinIO console: http://localhost:9001 (minioadmin/minioadmin).

## Misc traps

- First run needs migrations: `pnpm run dev:db:migrate` (compose) — local-dev.sh
  does it automatically.
- Content (courses, tutorials) comes from a separate repo, synced via
  `./scripts/local-dev.sh sync` or `curl -X POST localhost:3000/api/github/sync`.
  Most piloting works without a full sync; presets create stubs when needed.
- The API dies at boot if postgres isn't ready and waits for a file change;
  compose now uses healthcheck-gated `depends_on`, but if you see
  `ENOTFOUND postgres`, restart the api container.
- Register endpoint is public: `POST /api/trpc/auth.credentials.register`
  `{"json":{"username":"...","password":"..."}}` — handy to create extra users
  with a session from a driven browser.
