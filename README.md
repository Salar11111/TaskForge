# TaskForge

A small task-management app: Kanban board, projects, team workload, dashboard analytics, and multi-workspace support.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 5 + SQLite · TanStack Query 5 · Zustand · better-auth 1.7 · Radix UI · dnd-kit · Vitest · Playwright

## Quick start

```bash
npm install
npm run db:push          # creates/updates prisma/dev.db
npm run db:seed          # demo workspace, 4 projects, 19 tasks, labels, a sprint and P5 sample data
npm run dev
```

Open http://localhost:3000. The seeded admin is **`admin@taskforge.app`** / **`TaskForge-2026!`** (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).

> On Windows, stop the dev/prod server before `npm run db:push` — otherwise Prisma may hit an EPERM when replacing the query engine DLL.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Development / production build / production server |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm run test:unit` | Vitest — color-token parity, error mapping, rate limiter |
| `npm run test:e2e` | Playwright Chromium — login, anonymous API access, board CRUD |
| `npm run db:push` / `db:seed` / `db:studio` | Prisma schema / seed data / database GUI |

## Auth & authorization

- **Sign up** at `/signup`; new accounts land on `/setup` to create their first workspace. The seeded admin (`admin@taskforge.app`) is for the demo workspace.
- better-auth email/password handles `/api/auth/*`; sessions are cookies.
- **Every** data route (`/api/projects`, `/api/tasks`, `/api/users`, `/api/stats`, `/api/realtime`, `/api/workspaces`) requires a session and a workspace membership — enforced in `lib/authz.ts` (`requireWorkspace`).
- All queries are scoped to the caller's workspace. Workspace selection comes from the `x-workspace-id` header (or `?workspaceId=` for EventSource); the server ignores IDs for workspaces the user is not a member of.
- Errors are mapped centrally in `lib/api-error.ts`: Zod/JSON → 400, FK → 400, duplicate → 409, missing → 404, unknown → 500. Rate limiting lives in `lib/ratelimit.ts` (coarse in-memory Edge middleware for all `/api/*` routes) and `lib/ratelimit-shared.ts` (database-backed counters for auth POSTs and workspace creation, shared across processes).
- `npm run db:seed` is destructive and refuses to run against a production database unless invoked with `--force`.
- List endpoints (`/api/tasks`, `/api/projects`, `/api/users`) accept `?limit=` (1–500, default 500) and `?offset=`; `X-Total-Count` reports the unpaginated total. Invalid values return 400.

## Architecture

- `app/api/*` — route handlers; `lib/` — auth, authz, errors, Prisma, events, API client, store, color tokens.
- `app/client-shell.tsx` mounts the shared dialogs, command palette, and SSE listener; views (`dashboard`, `projects`, `board`, `team`, `roadmap`) read from TanStack Query.
- `lib/events.ts` is an in-process, workspace-scoped pub/sub. Mutations publish events; `/api/realtime` streams them via SSE; the client invalidates affected queries. A multi-instance deployment should replace `publish` with a shared pub/sub (Redis, etc.).

## Environment

Copy `.env.example` to `.env`. Required vars: `DATABASE_URL`, `BETTER_AUTH_SECRET` (32+ random chars), `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`.

## Tests

`npm run test:unit` and `npm run test:e2e` (after `npx playwright install chromium`). CI (`.github/workflows/ci.yml`) runs lint, typecheck, build, unit, and e2e jobs.
