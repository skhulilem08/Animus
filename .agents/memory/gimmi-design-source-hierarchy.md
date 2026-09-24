---
name: Gimmi design source hierarchy
description: Defines which source controls Gimmi's visual structure, product behavior, and platform conventions.
---

For Gimmi, treat the attached multi-screen PNG as the strict visual source for screen composition, density, spacing, and information patterns. Treat the attached product specification MD as the behavioral source. Use Apple HIG for platform conventions, accessibility, system colors, and interaction behavior, without replacing the reference composition.

**Why:** The product is inspired by a fictional app that has no reliable public UI specification. The user supplied the PNG specifically to define the visuals and repeatedly rejected invented web-style or alternative compositions.

**How to apply:** Build native-first with Iconoir controls, Apple system typography on iOS, and Plus Jakarta Sans on Android. Resolve visual ambiguity in favor of the PNG and behavioral ambiguity in favor of the MD. See replit.md for the current platform material fallback and profile layout preferences.