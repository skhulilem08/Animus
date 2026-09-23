# Gimmi

Gimmi is a community-centered native mobile app for sharing thoughts, images, clips, and private conversations across community boundaries.

## Run & Operate

- Replit managed workflows:
  - `artifacts/animus: expo` — Expo mobile preview
  - `artifacts/api-server: API Server` — Express API
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — provided automatically by Replit's built-in PostgreSQL database

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/animus` — Expo / React Native mobile application
- `artifacts/api-server` — Express API and SQL-backed server routes
- `lib/db/src/schema/index.ts` — PostgreSQL schema source of truth
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `artifacts/animus/constants/colors.ts` — mobile semantic color tokens

## Architecture decisions

- Follow Apple Human Interface Guidelines for navigation, spacing, hierarchy, accessibility, and system-color behavior.
- Use Iconoir as the primary icon family for custom in-app controls; use Apple system symbols only where native platform tab affordances require them.
- Treat multi-step user actions as database transactions so partial likes, messages, notifications, or seed records cannot be committed.
- Keep community identity visible in public experiences while keeping private messaging and calling focused on the participants.
- Keep premium functionality represented as coming soon until its implementation is explicitly scoped.

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

- The user wants Gimmi to follow Apple HIG and use Iconoir icons.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
