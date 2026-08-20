---
name: dep-vitest-browser-mode-cve
description: Do not add @vitest/browser at this repo's Vitest version — CVE-2026-73653 (CVSS 9.4) is unpatched below 3.2.7 and the repo pins vitest 3.2.4
metadata:
  type: project
---

**Do not reach for Vitest Browser Mode (`@vitest/browser`) as the "we already have Vitest" shortcut for real-browser testing** without first bumping Vitest.

- **CVE-2026-73653** (critical, CVSS 9.4, published 2026-08-13): `@vitest/browser` Browser Mode provider commands (`upload`, `takeScreenshot`, `screenshotMatcher`, `stopChunkTrace`, `deleteTracing`, `annotateTraces`) fail to enforce the `allowWrite` permission gate and do not confine paths to the project root. Any client that can reach the Browser Mode API can read, create, overwrite, or delete files anywhere the Vitest process can reach — even with `allowWrite: false`. Patched in **3.2.7**, 4.1.10, 5.0.0-beta.6.
- **CVE-2026-53633** (critical): exposed Browser Mode API can proxy CDP and overwrite config files.
- Related: **CVE-2026-47429** — `@vitest/ui`, arbitrary file read/execute while the UI server is listening.

**Why:** this repo pins `vitest` at `3.2.4`, which is **below the 3.2.7 patch floor**. Adding `@vitest/browser` would resolve it to a version matching the installed Vitest, landing squarely in the vulnerable range. The vulnerable code lives in `@vitest/browser`, which is *not* currently in the tree — so the repo is not exposed today, and `vitest@3.2.4` on its own is not the vulnerable artifact.

**How to apply:** if anyone proposes browser-mode testing via Vitest, require a `vitest` + `@vitest/coverage-v8` bump to **≥ 3.2.7** in the same change, and treat the Browser Mode API port as untrusted-inbound (never expose it beyond localhost, never in CI with a shared network). Independently, bumping `vitest` 3.2.4 → 3.2.7+ is worthwhile hygiene even while staying jsdom-only, since it costs little. Playwright was chosen instead — see [[dep-playwright-review]].
