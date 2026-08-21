import { test, expect, type Page } from "@playwright/test";
import { boot, THEMES } from "./helpers";

/**
 * Browser-only verification for the change `unify-loading-accent-color`.
 *
 * This exists because the entire content of that change is a RESOLVED COLOUR,
 * and no unit test in this repo can read one: Vitest swaps CSS Modules for a
 * non-scoped proxy, so a jsdom test can assert a class name but never what that
 * class computes to. The unit tests in
 * `src/components/LoadingWrapper/__tests__/` cover the class/style *inputs*;
 * this file covers the *output* under each theme.
 *
 * Maps to tasks 6.1-6.2 in openspec/changes/unify-loading-accent-color/tasks.md.
 */

/** `--color-loading-accent` as it resolves in each theme. */
const ACCENT = {
  light: { r: 43, g: 95, b: 247 }, // --color-primary-600  #2b5ff7
  dark: { r: 102, g: 145, b: 255 }, // --color-primary-400  #6691ff
  forest: { r: 74, g: 222, b: 128 }, // --color-primary-light #4ade80
} as const;

/** `--color-surface` per theme — what the scrim mixes over. */
const SURFACE = {
  light: { r: 255, g: 255, b: 255 }, // #ffffff
  dark: { r: 52, g: 65, b: 82 }, // #344152
  forest: { r: 15, g: 40, b: 23 }, // #0f2817
} as const;

/** `--color-background` per theme — what the route fallback paints. */
const BACKGROUND = {
  light: { r: 245, g: 245, b: 247 }, // #f5f5f7
  dark: { r: 43, g: 53, b: 68 }, // #2b3544
  forest: { r: 10, g: 31, b: 15 }, // #0a1f0f
} as const;

/** `--color-text-secondary` per theme — the loading label. */
const TEXT_SECONDARY = {
  light: { r: 107, g: 114, b: 128 }, // #6b7280
  dark: { r: 156, g: 163, b: 175 }, // #9ca3af
  forest: { r: 134, g: 239, b: 172 }, // #86efac
} as const;

type Rgba = { r: number; g: number; b: number; a: number };

/** Parses the `rgb()` / `rgba()` / `color(srgb …)` forms getComputedStyle returns. */
function parseColor(value: string): Rgba {
  const nums = value.match(/[\d.]+/g);
  if (!nums || nums.length < 3) {
    throw new Error(`Could not parse colour: ${JSON.stringify(value)}`);
  }
  const [r, g, b, a] = nums.map(Number);
  // `color(srgb 0.17 0.37 0.97)` reports 0-1 channels; rgb() reports 0-255.
  const isUnitScale = value.startsWith("color(");
  return {
    r: isUnitScale ? Math.round(r * 255) : Math.round(r),
    g: isUnitScale ? Math.round(g * 255) : Math.round(g),
    b: isUnitScale ? Math.round(b * 255) : Math.round(b),
    a: a === undefined ? 1 : a,
  };
}

/** Channel-wise compare with a tolerance for colour-space rounding. */
function expectChannels(actual: Rgba, expected: { r: number; g: number; b: number }) {
  expect(Math.abs(actual.r - expected.r)).toBeLessThanOrEqual(2);
  expect(Math.abs(actual.g - expected.g)).toBeLessThanOrEqual(2);
  expect(Math.abs(actual.b - expected.b)).toBeLessThanOrEqual(2);
}

/** WCAG 2.1 relative luminance. */
function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  const chan = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

/**
 * WCAG contrast ratio. Computed rather than pinned, so the 3:1 floor stays a
 * real invariant: pinning expected RGB alone would let someone change an accent
 * and "fix" the test by editing the constant, floor breach and all.
 */
function contrastRatio(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

async function computed(page: Page, selector: string, prop: string) {
  return page.locator(selector).first().evaluate(
    (el, p) => getComputedStyle(el).getPropertyValue(p),
    prop
  );
}

test.describe("loading accent — TableCommon overlay spinner", () => {
  /**
   * `/table` renders a TableCommon with `data={[]} loading` that never
   * resolves (StatesAndInteractionSection.tsx), so the spinner is on screen
   * indefinitely with no network or timer to race.
   */
  for (const theme of THEMES) {
    test(`resolves to the ${theme} accent`, async ({ page }) => {
      await boot(page, theme);
      await page.goto("/table");

      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

      const spinner = page.locator('[class*="spinner"]').first();
      await expect(spinner).toBeVisible();

      const color = parseColor(await computed(page, '[class*="spinner"]', "color"));
      expectChannels(color, ACCENT[theme]);
    });
  }

  test("the three themes do not all resolve to the same colour", async ({
    page,
  }) => {
    // Guards the specific regression where a token is declared once but never
    // redefined per theme — every theme would still "pass" its own assertion
    // if the expectations were wrong in the same direction.
    const seen: string[] = [];
    for (const theme of THEMES) {
      const ctx = await page.context().newPage();
      await boot(ctx, theme);
      await ctx.goto("/table");
      await expect(ctx.locator('[class*="spinner"]').first()).toBeVisible();
      seen.push(await computed(ctx, '[class*="spinner"]', "color"));
      await ctx.close();
    }
    expect(new Set(seen).size).toBe(THEMES.length);
  });
});

test.describe("loading accent — ring spinner track", () => {
  /**
   * The ring spinners (Products / ProductDetail / Favorites) share one rule:
   * a translucent track on all sides with the solid accent on top. `/products`
   * holds its loading state for an 800ms `setTimeout` in the mock service, so
   * the clock is frozen to make the assertion deterministic rather than a race.
   */
  /*
   * All three routes render the same rule, but none is redundant: each
   * previously carried its own [data-theme] .spinner override block, which this
   * change deleted. Favorites in particular was red in light and dark, and
   * design.md's Risks section names forest-Favorites as the specific case to
   * watch, because its old forest override was already correct and must not
   * regress.
   */
  const RING_ROUTES = [
    { name: "products", url: "/products" },
    { name: "favorites", url: "/favorites" },
    { name: "product detail", url: "/products/1" },
  ];

  for (const route of RING_ROUTES) {
    for (const theme of THEMES) {
      test(`${route.name} ring matches the ${theme} accent`, async ({ page }) => {
        await boot(page, theme);
        await page.clock.install();
        await page.goto(route.url);

        const ring = page.locator('[class*="spinner"]').first();
        await expect(ring).toBeVisible();

        const arc = parseColor(
          await computed(page, '[class*="spinner"]', "border-top-color")
        );
        const track = parseColor(
          await computed(page, '[class*="spinner"]', "border-left-color")
        );

        // Arc is the accent at full opacity.
        expectChannels(arc, ACCENT[theme]);
        expect(arc.a).toBe(1);

        // Track is the same hue, but translucent — and therefore distinguishable
        // from the arc, which is what makes the rotation legible.
        expectChannels(track, ACCENT[theme]);
        expect(track.a).toBeGreaterThan(0);
        expect(track.a).toBeLessThan(1);
      });
    }
  }

  test("favorites ring is no longer the error red", async ({ page }) => {
    // #ef4444 / #f87171 — --color-error-500/400, what this spinner used to be
    // in light and dark before the change.
    await boot(page, "light");
    await page.clock.install();
    await page.goto("/favorites");
    await expect(page.locator('[class*="spinner"]').first()).toBeVisible();

    const arc = parseColor(
      await computed(page, '[class*="spinner"]', "border-top-color")
    );
    expect(arc).not.toMatchObject({ r: 239, g: 68, b: 68 });
    expect(arc).not.toMatchObject({ r: 248, g: 113, b: 113 });
  });

  test("ring track is not the old fixed gray", async ({ page }) => {
    // #e5e7eb — the literal that used to be baked in via color(gray-200) and
    // could not follow the theme.
    await boot(page, "forest");
    await page.clock.install();
    await page.goto("/products");
    await expect(page.locator('[class*="spinner"]').first()).toBeVisible();

    const track = parseColor(
      await computed(page, '[class*="spinner"]', "border-left-color")
    );
    expect(track).not.toMatchObject({ r: 229, g: 231, b: 235 });
  });
});

test.describe("loading accent — lazy-route Suspense fallback", () => {
  /**
   * This is the indicator every user sees on a cold load, and the one whose bug
   * survived longest: it referenced `border-primary-600`, which this project
   * never generates as a utility, so it rendered in inherited gray. Nothing
   * caught it because the fallback is only on screen while a chunk is in
   * flight — so the chunk is held open here deliberately.
   *
   * Covers the `LoadingFallback appearance` requirement in
   * specs/route-config/spec.md, which no unit test can reach: the component is
   * module-local to AppRoutes.tsx and observing it in jsdom would mean mounting
   * the whole router and every lazy page.
   */
  for (const theme of THEMES) {
    test(`renders in the ${theme} accent over the ${theme} background`, async ({
      page,
    }) => {
      await boot(page, theme);
      /*
       * Hold the lazy chunk so the fallback stays on screen long enough to read.
       * Gated on a deferred rather than a fixed sleep: a guessed duration is
       * both a wall-clock cost on every run and a flake source — if the reads
       * below overran it the chunk would land, LoadingFallback would unmount,
       * and the failure would surface as "element not found" rather than as the
       * colour mismatch this test is actually about.
       */
      let releaseChunk!: () => void;
      const chunkHeld = new Promise<void>((r) => {
        releaseChunk = r;
      });
      await page.route("**/pages/Products/index.tsx**", async (route) => {
        await chunkHeld;
        await route.continue();
      });
      await page.goto("/products", { waitUntil: "commit" });

      // `finally`, not a trailing call: a failed assertion must still let the
      // chunk through, or teardown blocks on the route handler until timeout
      // and the real failure is buried under a timeout error.
      try {
        const ring = page.locator(".animate-spin").first();
        await ring.waitFor();

        // ThemeContext applies data-theme in an effect, so there is a window
        // where <html> carries no attribute and :root (light) values apply —
        // without this guard the light case would pass even if the theme were
        // never applied at all.
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

        const arc = parseColor(
          await computed(page, ".animate-spin", "border-top-color")
        );
        const track = parseColor(
          await computed(page, ".animate-spin", "border-left-color")
        );

        expectChannels(arc, ACCENT[theme]);
        expect(arc.a).toBe(1);
        expectChannels(track, ACCENT[theme]);
        expect(track.a).toBeGreaterThan(0);
        expect(track.a).toBeLessThan(1);

        /*
         * Read the FALLBACK WRAPPER's own background, not document.body's.
         * body already carries `background-color: var(--color-background)` from a
         * global rule in src/index.css that this change never touched, so
         * asserting on body would pass identically with the old buggy
         * `bg-white dark:bg-gray-900` classes — it would prove nothing about the
         * element that actually changed.
         */
        const wrapperBg = parseColor(
          await page.evaluate(() => {
            const spinner = document.querySelector(".animate-spin");
            const wrapper = spinner?.parentElement?.parentElement;
            if (!wrapper) throw new Error("fallback wrapper not found");
            return getComputedStyle(wrapper).backgroundColor;
          })
        );
        expectChannels(wrapperBg, BACKGROUND[theme]);
        expect(wrapperBg.a).toBe(1);

        // The label colour is part of the LoadingFallback contract too.
        const label = parseColor(
          await computed(page, ".animate-spin ~ p", "color")
        );
        expectChannels(label, TEXT_SECONDARY[theme]);
      } finally {
        releaseChunk();
      }
    });
  }
});

test.describe("loading accent — LoadingWrapper overlay", () => {
  /**
   * `/todo` is LoadingWrapper's only consumer. This is the ONLY place that
   * verifies the `.icon-brand` and `.bg-scrim` utilities actually resolve —
   * the unit tests can assert the class is applied but never what it computes
   * to, so without this the D2 utility-collapse has no real verification.
   */
  for (const theme of THEMES) {
    test(`spinner and scrim resolve in the ${theme} theme`, async ({ page }) => {
      await boot(page, theme);
      await page.clock.install();
      await page.goto("/todo");

      // Scoped to the overlay: Todo's add-button also carries `animate-spin`
      // (out of scope for this change), and only renders while adding — so
      // scoping makes the isolation structural rather than incidental.
      const spinner = page.locator(".bg-scrim .animate-spin").first();
      await expect(spinner).toBeVisible();

      // `.icon-brand` must resolve to the accent — proves the collapsed
      // single declaration still yields a per-theme value.
      const color = parseColor(
        await computed(page, ".bg-scrim .animate-spin", "color")
      );
      expectChannels(color, ACCENT[theme]);

      // `.bg-scrim` must be a translucent form of THIS theme's PAGE
      // BACKGROUND. Two regressions are guarded here: the old
      // `bg-white/80 dark:bg-surface-dark/80` produced a white scrim in dark
      // and forest, and a surface-derived scrim would LIGHTEN the page in
      // those themes rather than dim it, since surface is lighter than
      // background there.
      const scrim = parseColor(
        await page.evaluate(() => {
          const el = document.querySelector(".bg-scrim");
          if (!el) throw new Error("scrim not found");
          return getComputedStyle(el).backgroundColor;
        })
      );
      expectChannels(scrim, BACKGROUND[theme]);
      expect(scrim.a).toBeGreaterThan(0);
      expect(scrim.a).toBeLessThan(1);
    });
  }
});

test.describe("loading accent — contrast floor", () => {
  /**
   * The spec requires >= 3:1 against --color-surface in every theme (WCAG 2.1
   * SC 1.4.11, non-text contrast). Computed from the RESOLVED colours rather
   * than pinned, so the floor cannot be silently broken by editing a constant.
   */
  for (const theme of THEMES) {
    test(`${theme} accent clears 3:1 against its surface`, async ({ page }) => {
      await boot(page, theme);
      await page.goto("/table");
      await expect(page.locator('[class*="spinner"]').first()).toBeVisible();

      const accent = parseColor(
        await computed(page, '[class*="spinner"]', "color")
      );
      // Resolve --color-surface through a probe element rather than reading the
      // custom property directly: getPropertyValue returns the raw authored
      // token (a hex string), while getComputedStyle on a real declaration
      // normalises it to rgb() — which is what parseColor expects.
      const surface = parseColor(
        await page.evaluate(() => {
          const probe = document.createElement("div");
          probe.style.color = "var(--color-surface)";
          document.body.appendChild(probe);
          const resolved = getComputedStyle(probe).color;
          probe.remove();
          return resolved;
        })
      );

      // Sanity-check the resolved surface against the documented value, so a
      // silent surface change shows up as a named failure rather than as a
      // mysteriously shifted ratio.
      expectChannels(surface, SURFACE[theme]);

      const ratio = contrastRatio(accent, surface);
      expect(
        ratio,
        `${theme}: accent rgb(${accent.r},${accent.g},${accent.b}) on surface ` +
          `rgb(${surface.r},${surface.g},${surface.b}) = ${ratio.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(3);
    });
  }
});
