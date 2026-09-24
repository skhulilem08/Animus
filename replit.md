# Gimmi

Gimmi is a community-centered native mobile app for sharing thoughts, images, clips, and private conversations across community boundaries.

## Run & Operate

- Replit managed workflows:
  - `artifacts/gimmi: expo` — Expo mobile preview
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

- `artifacts/gimmi` — Expo / React Native mobile application
- `artifacts/api-server` — Express API and SQL-backed server routes
- `lib/db/src/schema/index.ts` — PostgreSQL schema source of truth
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `artifacts/gimmi/constants/colors.ts` — mobile semantic color tokens

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
- Use [Apple Design Skill](https://github.com/dickwu/apple-design-skill) as the HIG review reference; if installing it for Claude Code, use `.claude/skills/apple-design/` in this project or `~/.claude/skills/apple-design/` for the user. Refer also to [Emil Kowalski's motion guidance](https://x.com/emilkowalski?s=11), [Taste Skill](https://www.tasteskill.dev/), and [Impeccable](https://impeccable.style/docs/) for restraint, hierarchy, and interaction craft.
- Design learning references: [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) is the platform authority; use [NN/g](https://www.nngroup.com/articles/) for visual hierarchy/usability, [IxDF mobile UX](https://www.interaction-design.org/literature/topics/mobile-ux-design) for mobile patterns, [Laws of UX](https://lawsofux.com/) for interaction principles, and [W3C WAI](https://www.w3.org/WAI/fundamentals/accessibility-intro/) for accessibility review. Do not use these as generic templates or override the attached Gimmi PNG.
- Keep a minimal, premium iOS feel with borderless top/bottom navigation, shared components, and HIG-sized text. Messages uses the same stationary underline tabs as Profile rather than a segmented pill switch; avoid decorative controls without actions.
- The 12 sources reviewed for the Messages page and their applied takeaways are in `artifacts/gimmi/docs/messages-design-references.md`.
- Use native Liquid Glass and purposeful motion on supported iOS, consistent with HIG. On unsupported iOS versions (including iOS 7–18), Android, and web, use solid surfaces instead of simulated glass or blur; implement native fallbacks with React Native styles and web fallbacks with CSS.
- On both own and other-user profile pages, place the avatar and community badge in the left column, with compact bold identity and follower/following details on the right; tint the badge from that profile owner's community color, not a generic fallback blue. Keep action buttons below the summary with a clear primary/secondary hierarchy. Make the visible profile buttons slim while preserving a 44pt touch target. Edit Profile uses the viewer's community tint; Follow uses system blue as in the reference. Profile post grids represent text with an icon, not squashed copy; use a restrained animated hover preview on pointer devices and tap through to the full post on touch devices.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
