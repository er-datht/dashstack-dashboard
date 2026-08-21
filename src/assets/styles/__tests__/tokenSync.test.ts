import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Guards the design-tokens rule that theme-adaptive tokens have NO static SCSS
 * twin (openspec/changes/unify-loading-accent-color/specs/design-tokens/spec.md).
 *
 * This is the one requirement in that change verifiable without a browser: it is
 * a convention about file contents, not about a rendered colour. A Sass map
 * value is frozen at build time and cannot vary with [data-theme], so adding
 * `loading-accent` to $colors would silently pin one theme's colour — the exact
 * drift the token-sync rule exists to prevent.
 */

const root = resolve(__dirname, "../../../..");
const variables = readFileSync(
  resolve(root, "src/assets/styles/_variables.scss"),
  "utf8"
);
const indexCss = readFileSync(resolve(root, "src/index.css"), "utf8");

const THEME_ADAPTIVE_TOKENS = ["loading-accent", "loading-track"] as const;

describe("theme-adaptive tokens have no static SCSS twin", () => {
  it.each(THEME_ADAPTIVE_TOKENS)(
    "does not define %s in the SCSS $colors map",
    (token) => {
      // Matches a map entry such as `loading-accent: #2b5ff7,`
      const mapEntry = new RegExp(`^\\s*${token}\\s*:`, "m");
      expect(variables).not.toMatch(mapEntry);
    }
  );

  it.each(THEME_ADAPTIVE_TOKENS)(
    "defines --color-%s once per theme in index.css",
    (token) => {
      const declarations = indexCss.match(
        new RegExp(`--color-${token}\\s*:`, "g")
      );
      // :root (light), [data-theme="dark"], [data-theme="forest"]
      expect(declarations).toHaveLength(3);
    }
  );

  it("points readers from _variables.scss to the CSS custom properties", () => {
    expect(variables).toMatch(/--color-loading-accent/);
    expect(variables).toMatch(/--color-loading-track/);
  });

  it("keeps SCSS modules off color() lookups for spinner colours", () => {
    // color() resolves at build time, which is why Products/ProductDetail were
    // stuck on light-theme blue before this change.
    const spinnerModules = [
      "src/pages/Products/Products.module.scss",
      "src/pages/ProductDetail/ProductDetail.module.scss",
      "src/pages/Favorites/Favorites.module.scss",
      "src/components/TableCommon/TableCommon.module.scss",
    ];

    for (const file of spinnerModules) {
      const source = readFileSync(resolve(root, file), "utf8");
      const spinnerRule = source.match(/\.spinner\s*\{[^}]*\}/g) ?? [];
      expect(spinnerRule.length).toBeGreaterThan(0);
      for (const rule of spinnerRule) {
        expect(rule).not.toMatch(/\bcolor\(/);
      }
    }
  });

  it("keeps the shared loading-ring mixin off color() lookups", () => {
    // The three ring spinners above are now one `@include loading-ring`, so the
    // build-time-freeze guard has to follow the declarations into the mixin —
    // otherwise the rule above passes vacuously on a body that says nothing.
    const mixins = readFileSync(
      resolve(root, "src/assets/styles/_mixins.scss"),
      "utf8"
    );
    const ring = mixins.match(/@mixin\s+loading-ring[^{]*\{[^}]*\}/)?.[0];
    expect(ring, "loading-ring is not declared in _mixins.scss").toBeDefined();
    expect(ring).not.toMatch(/\bcolor\(/);
    expect(ring).toContain("var(--color-loading-track)");
    expect(ring).toContain("var(--color-loading-accent)");
  });

  /*
   * The unit tests assert an element carries `.icon-brand` / `.bg-scrim` /
   * `.border-loading`, but nothing in jsdom links a class NAME to its
   * DEFINITION — those tests would still pass if the selector were deleted from
   * the stylesheet. Reading index.css as text closes that gap without a
   * browser, complementing the e2e which proves the resolved colour.
   */
  it.each([
    [".icon-brand", "--color-loading-accent"],
    [".border-loading", "--color-loading-track"],
    [".bg-scrim", "--color-scrim"],
  ])("declares %s and points it at %s", (selector, token) => {
    const rule = indexCss.match(
      new RegExp(`\\${selector}\\s*\\{[^}]*\\}`)
    )?.[0];
    expect(rule, `${selector} is not declared in src/index.css`).toBeDefined();
    expect(rule).toContain(`var(${token})`);
  });

  it("keeps .border-loading below the generic border utilities", () => {
    // Equal specificity in the same layer means source order decides. A
    // generic `.border-*` declared later would silently beat it.
    const loading = indexCss.indexOf(".border-loading {");
    const primary = indexCss.indexOf(".border-primary {");
    const generic = indexCss.indexOf(".border-default {");
    expect(loading).toBeGreaterThan(primary);
    expect(loading).toBeGreaterThan(generic);
  });

  /*
   * The translucent tokens are hand-written rgba literals (index.css explains at
   * length why color-mix is unusable here), which makes them the one part of the
   * token set that can silently drift from its source colour. Nothing else
   * catches that: `yarn build` never runs Playwright, and the e2e only asserts
   * the track is *some* translucent form of the accent, so a stale track that
   * still looks plausible would pass. These recompute the channels instead.
   */
  describe("translucent tokens stay in step with their source colour", () => {
    /** The text of one theme block, from its selector to the closing brace. */
    function themeBlock(selector: string) {
      const start = indexCss.indexOf(`${selector} {`);
      expect(start, `${selector} block not found`).toBeGreaterThan(-1);
      const end = indexCss.indexOf("\n}", start);
      return indexCss.slice(start, end);
    }

    const BLOCKS = {
      light: themeBlock(":root"),
      dark: themeBlock('[data-theme="dark"]'),
      forest: themeBlock('[data-theme="forest"]'),
    };

    /** Reads a custom property from a theme block, falling back to :root. */
    function declared(block: string, token: string) {
      const read = (source: string) =>
        source.match(new RegExp(`${token}\\s*:\\s*([^;]+);`))?.[1].trim();
      return read(block) ?? read(BLOCKS.light);
    }

    function hexToRgb(hex: string) {
      const m = hex.match(/^#([0-9a-f]{6})$/i);
      if (!m) throw new Error(`Not a 6-digit hex: ${hex}`);
      const n = parseInt(m[1], 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    function rgbaChannels(value: string) {
      const nums = value.match(/[\d.]+/g);
      if (!nums || nums.length < 3) throw new Error(`Not an rgba(): ${value}`);
      const [r, g, b] = nums.map(Number);
      return { r, g, b };
    }

    /** Resolves `var(--x)` one level, then the hex it points at. */
    function resolveHex(block: string, token: string) {
      const raw = declared(block, token);
      if (!raw) throw new Error(`${token} is not declared`);
      const indirect = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/)?.[1];
      const hex = indirect ? declared(block, indirect) : raw;
      if (!hex) throw new Error(`${indirect} is not declared`);
      return hexToRgb(hex);
    }

    it.each(Object.keys(BLOCKS) as (keyof typeof BLOCKS)[])(
      "%s: --color-loading-track is --color-loading-accent at 20%%",
      (theme) => {
        const accent = resolveHex(BLOCKS[theme], "--color-loading-accent");
        const track = declared(BLOCKS[theme], "--color-loading-track")!;
        expect(rgbaChannels(track)).toEqual(accent);
        expect(track).toMatch(/,\s*0?\.2\s*\)/);
      }
    );

    it.each(Object.keys(BLOCKS) as (keyof typeof BLOCKS)[])(
      "%s: --color-scrim is --color-background at 80%%",
      (theme) => {
        // Background, NOT surface: surface is lighter than background in
        // dark/forest, so a surface-derived scrim would lighten the page.
        const background = resolveHex(BLOCKS[theme], "--color-background");
        const scrim = declared(BLOCKS[theme], "--color-scrim")!;
        expect(rgbaChannels(scrim)).toEqual(background);
        expect(scrim).toMatch(/,\s*0?\.8\s*\)/);
      }
    );
  });

  it("authors translucent loading values as literal rgba, never color-mix", () => {
    // Lightning CSS emits an @supports fallback of the bare OPAQUE colour for
    // a color-mix over a custom property, which would make the track equal the
    // arc and the scrim fully opaque on pre-2023 engines.
    for (const token of ["--color-loading-track", "--color-scrim"]) {
      const declarations =
        indexCss.match(new RegExp(`${token}\\s*:[^;]+;`, "g")) ?? [];
      expect(declarations).toHaveLength(3);
      for (const declaration of declarations) {
        expect(declaration).toMatch(/rgba\(/);
        expect(declaration).not.toMatch(/color-mix/);
      }
    }
  });

  it("carries no unreachable :global(.dark) selector in TableCommon", () => {
    // ThemeContext sets data-theme only and never applies a .dark class, so
    // such a rule can never match. Covers the shared-components scenario
    // "No unreachable theme selector".
    const source = readFileSync(
      resolve(root, "src/components/TableCommon/TableCommon.module.scss"),
      "utf8"
    );
    const spinnerRule = source.match(/\.spinner\s*\{[^}]*\}/)?.[0] ?? "";
    expect(spinnerRule).not.toContain(":global(.dark)");
  });

  it("leaves no [data-theme] spinner override to defeat the token", () => {
    // These blocks outrank the base `.spinner` rule, so any survivor would
    // silently pin dark or forest back to a frozen colour.
    const spinnerModules = [
      "src/pages/Products/Products.module.scss",
      "src/pages/ProductDetail/ProductDetail.module.scss",
      "src/pages/Favorites/Favorites.module.scss",
    ];

    for (const file of spinnerModules) {
      const source = readFileSync(resolve(root, file), "utf8");
      expect(source).not.toMatch(
        /\[data-theme=["'][^"']+["']\]\s*\{[^}]*\.spinner/
      );
    }
  });
});
