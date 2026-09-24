---
name: Expo dependency resolution
description: Why an unrelated pnpm change can cause Metro to fail while TypeScript still passes.
---

In this workspace, pnpm dependency-tree changes can select a different peer instance for React Native Worklets. Its Babel plugin relies on an undeclared Babel traversal package; without an explicit workspace package extension, Metro can return a 500 for the Expo entry bundle even though TypeScript passes.

**Why:** Removing an unused UI dependency triggered a fresh pnpm resolution that exposed the missing runtime dependency. Reinstalling with a package extension restored Metro without changing application code.

**How to apply:** After pnpm changes, check that Metro bundles a real page before trusting typechecks. If this particular missing-module error returns, check workspace package metadata rather than changing the app's Babel plugin.