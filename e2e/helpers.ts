import type { Page } from "@playwright/test";

/**
 * Shared setup for the e2e specs.
 *
 * Not named `*.spec.ts` on purpose: `playwright.config.ts` sets `testDir: "./e2e"`
 * with the default `testMatch`, so only `*.spec.ts` / `*.test.ts` are collected
 * as suites and this file is import-only.
 *
 * NOTE ON SELECTORS (applies to every spec that imports this): Vite hashes
 * CSS-module class names in dev (`_spinner_1a2b3`), so specs match on a
 * `[class*="..."]` substring rather than an exact class.
 */

export type Theme = "light" | "dark" | "forest";

export const THEMES: readonly Theme[] = ["light", "dark", "forest"] as const;

/**
 * Seed auth (withAuth only checks for a non-empty auth_token) and the theme.
 *
 * This encodes two contracts that live outside the e2e directory — the
 * `auth_token`/`auth_user` keys read by `withAuth`, and the `theme` key read by
 * `ThemeContext`. Keeping it in one place means a key rename breaks one call
 * site, not every spec independently.
 */
export async function boot(page: Page, theme: Theme) {
  await page.addInitScript((t) => {
    localStorage.setItem("auth_token", "e2e-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ name: "E2E", email: "e2e@test.dev", role: "Admin" })
    );
    localStorage.setItem("theme", t);
  }, theme);
}
