---
name: Orval Zod exports
description: Why code generation needs an idempotent export surface for Zod validators.
---

Generating separate TypeScript schemas alongside split Zod validators can cause Orval to add a second wildcard export to the public entry point. Several names then collide with validator exports, so codegen succeeds but the following library typecheck fails.

**Why:** A regenerated entry point failed repeatedly until redundant TypeScript schema output was removed. The API client already owns generated contract types; the server package only needs Zod validators.

**How to apply:** When changing the OpenAPI generation configuration, run codegen twice and confirm both runs typecheck. Do not reintroduce a second wildcard export of duplicate contract types.