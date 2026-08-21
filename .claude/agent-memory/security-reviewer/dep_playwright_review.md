---
name: dep-playwright-review
description: Security review record for @playwright/test 1.62.1 as a devDependency (E2E CSS-animation verification) — verdict, and why the system-Chrome route was preferred over the CDN browser download
metadata:
  type: project
---

`@playwright/test` was reviewed on 2026-08-20 for addition as a **devDependency only**, to verify CSS show/hide animations on modals in a real browser (jsdom cannot run CSS animations, and Vitest replaces CSS Modules with a non-scoped proxy). Verdict: **allow with conditions** at exact version `1.62.1`, driving the **already-installed system Google Chrome** via `channel: "chrome"` rather than downloading Playwright's bundled Chromium.

Findings worth keeping (these correct common assumptions):

- **`@playwright/test` has NO postinstall browser download.** Verified against registry metadata, the GitHub source `packages/playwright/package.json`, and the docs. `yarn add -D @playwright/test` fetches JS only (~a few MB). Browsers download only when you explicitly run `playwright install`. The packages that DO auto-download on install are `@playwright/browser-chromium` / `-firefox` / `-webkit` — **do not add those.**
- **Tiny dependency tree**: `@playwright/test` → `playwright` → `playwright-core`, plus `fsevents` as an optionalDependency. Three first-party packages, all Apache-2.0, all published by the Microsoft Playwright team.
- **`fsevents` is the only install script in the tree**, and Playwright pins it **exact at `2.3.2`** while this repo already resolves `fsevents@2.3.3` (via Vite/chokidar). So installing Playwright adds a *second* fsevents copy whose `install: node-gyp rebuild` runs at install time. fsevents is macOS-only, optional, and only a file-watching perf optimization — `--ignore-scripts` is therefore safe here and breaks nothing.
- **Bundled Chromium lags patched Chrome.** Playwright 1.62.1 pins Chromium revision 1234 / `151.0.7922.34`, while Chrome stable was already at `151.0.7922.137+` (Aug 11 2026, five high-severity UAF fixes) and the local machine had `.169`. Using `channel: "chrome"` gets the auto-updating, fully-patched browser AND skips the ~350 MB CDN download.
- **Browser CDN downloads are not documented as checksum/signature verified** — Playwright retries and discards corrupt archives but publishes no integrity-verification mechanism. Another reason to prefer the system browser.
- The local browser cache at `~/Library/Caches/ms-playwright` is **global, not per-repo**, and already held 539 MB (chromium build 1228). A stale cached build does not satisfy a newer Playwright pin, so `playwright install` would still download.

**Why:** the team needed a real browser for five verification tasks (theme parity across 3 themes, scrollbar-induced horizontal shift, reopen-mid-exit, `prefers-reduced-motion`, 90vh short-viewport layout) that no jsdom unit test can cover.

**How to apply:** if Playwright is revisited or upgraded, keep the exact pin (repo convention is exact versions everywhere — no carets) and keep `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` + `channel: "chrome"` unless a test genuinely needs Firefox/WebKit. If someone proposes `@playwright/browser-*` packages or drops the skip flag, that reintroduces the unverified CDN download. See [[dep-vitest-browser-mode-cve]] for why Vitest Browser Mode was not the cheaper shortcut it appears to be.
