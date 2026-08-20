import { defineConfig } from "@playwright/test";

/**
 * Playwright config for browser-only verification that unit tests cannot cover.
 *
 * SECURITY: `channel: "chrome"` deliberately drives the SYSTEM Google Chrome
 * rather than a Playwright-bundled Chromium. Per the security review of this
 * dependency (see openspec/changes/.../design.md and
 * .claude/agent-memory/security-reviewer/dep_playwright_review.md), the bundled
 * build lags stable by ~130 patch revisions and is fetched as a ~350 MB archive
 * with no published integrity verification, while the system Chrome is
 * fully patched and auto-updating. Do NOT run `playwright install`, and do not
 * drop the channel pin — switching to Firefox or WebKit is a new security
 * decision that needs its own review.
 */
export default defineConfig({
  testDir: "./e2e",
  // Animation timings are the subject under test, so never run these in
  // parallel on one machine — background work skews frame sampling.
  workers: 1,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    channel: "chrome",
  },
  projects: [{ name: "chrome", use: { channel: "chrome" } }],
  webServer: {
    command: "yarn dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
