# Security Reviewer Memory

## Dependency review records

- [@playwright/test 1.62.1](dep_playwright_review.md) — allowed as devDep for E2E CSS-animation checks; no postinstall download, use system Chrome via `channel: "chrome"` not the CDN binary
- [Vitest Browser Mode is not safe here](dep_vitest_browser_mode_cve.md) — `@vitest/browser` CVE-2026-73653 (CVSS 9.4) unpatched below 3.2.7; repo pins vitest 3.2.4
