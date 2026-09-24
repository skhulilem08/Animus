---
name: Metro during API codegen
description: How to interpret Expo Metro module errors while regenerating the shared API client.
---

When regenerating the shared API client while Expo Metro is running, a single "Unable to resolve ./generated/api" error can occur during Orval's output-cleaning window.

**Why:** Codegen temporarily removes generated files before writing replacements, and the Metro watcher may attempt a bundle in that gap. In a profile update, subsequent bundles and live page renders succeeded without a restart.

**How to apply:** Let codegen finish, then check a fresh app preview or later Metro log entry before diagnosing a persistent missing-module issue. Do not restart Expo solely because of a transient error emitted during generation.