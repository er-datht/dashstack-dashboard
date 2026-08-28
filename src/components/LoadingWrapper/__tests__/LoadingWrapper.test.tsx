import { render, screen } from "@testing-library/react";
import LoadingWrapper from "../index";

/**
 * Tests for LoadingWrapper's loading-accent colour contract.
 *
 * SPEC: Component contract derived from
 *   openspec/changes/unify-loading-accent-color/specs/shared-components/spec.md
 *   (MODIFIED Requirement: LoadingWrapper component — scenarios
 *   "Loading state" / "Loaded state" / "Spinner colour per theme" /
 *   "Scrim matches the surface it covers")
 *   and openspec/changes/unify-loading-accent-color/specs/loading-indicator-color/spec.md
 *   (Requirements: "Loading indicators follow the app theme, not the OS",
 *   "Loading text stays neutral").
 *
 *   WHAT THESE TESTS CAN AND CANNOT ASSERT
 *   --------------------------------------
 *   Vitest runs jsdom with `css.modules.classNameStrategy: "non-scoped"` and
 *   never loads `src/index.css`, so NO unit test in this repo can read a
 *   resolved colour. `getComputedStyle(el).color` returns the literal string
 *   "var(--color-loading-accent)", not an rgb() triple. Asserting an rgb()
 *   value here would pass or fail for the wrong reason. Per design.md D7,
 *   computed-colour verification is delegated to a Playwright spec (tasks §6).
 *
 *   What jsdom CAN prove, and what this file therefore covers:
 *
 *   1. NEGATIVE — the dead / OS-driven classes are gone. This is the entire
 *      bug class the change exists to fix: classes that look correct but
 *      generate no CSS (`bg-surface-dark` — the numbered/named palette lives
 *      in `:root`, not `@theme`, so Tailwind emits no such utility), and
 *      classes that track `prefers-color-scheme` instead of `data-theme`
 *      (every `dark:` variant — there is no `@custom-variant dark`).
 *      These assertions FAIL today and PASS after implementation.
 *   2. POSITIVE — the replacement token is actually referenced by the spinner
 *      and the scrim, and the label moved onto the `.text-secondary` utility.
 *   3. BEHAVIOUR — children vs. indicator, already in the spec.
 *
 *   SPEC: tasks 3.2 and 3.3 name the values but not the mechanism (inline
 *   style vs. an arbitrary-value Tailwind class). `styleAndClass()` below
 *   accepts either, so the test pins the contract without dictating the diff.
 *
 *   SPEC: the "Loading state" scenario says the indicator is shown "instead of
 *   children". The current component keeps children mounted under a dimming
 *   scrim, and this change does not touch that structure, so these tests
 *   assert the indicator's presence rather than the children's absence.
 */

/** Inline style + class list, so a token reference is found either way. */
const styleAndClass = (el: Element): string =>
  `${el.getAttribute("style") ?? ""} ${el.getAttribute("class") ?? ""}`;

/** The Loader2 icon renders as the only <svg> in the tree. */
const getSpinner = (container: HTMLElement): SVGElement => {
  const spinner = container.querySelector("svg");
  if (!spinner) throw new Error("no spinner rendered");
  return spinner;
};

/**
 * The scrim is the overlay element between the root wrapper and the spinner.
 * Walking up from the spinner keeps this resilient to the class renames the
 * change itself performs.
 */
const getScrim = (container: HTMLElement): HTMLElement => {
  const root = container.firstElementChild;
  let el: HTMLElement | null = getSpinner(container).parentElement;
  while (el && el.parentElement !== root) {
    el = el.parentElement;
  }
  if (!el) throw new Error("no scrim rendered");
  return el;
};

/** Every test below renders the same tree; only the props vary. */
const renderLoading = (
  props: Partial<Parameters<typeof LoadingWrapper>[0]> = {},
) =>
  render(
    <LoadingWrapper isLoading {...props}>
      <p>child content</p>
    </LoadingWrapper>,
  );

describe("LoadingWrapper", () => {
  describe("loading behavior", () => {
    it("renders children and no indicator when isLoading is false", () => {
      const { container } = renderLoading({ isLoading: false });

      expect(screen.getByText("child content")).toBeInTheDocument();
      expect(container.querySelector("svg")).toBeNull();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("renders the loading indicator and default text when isLoading is true", () => {
      const { container } = renderLoading();

      expect(container.querySelector("svg")).not.toBeNull();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders a custom loadingText when provided", () => {
      renderLoading({ loadingText: "Fetching todos" });

      expect(screen.getByText("Fetching todos")).toBeInTheDocument();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  describe("dead and OS-driven classes are gone", () => {
    /*
     * Two failure modes, one table:
     *   - `dark:` compiles to a prefers-color-scheme media query in this
     *     project, so it follows the OS instead of the app's data-theme, and
     *     forest has no representation in a two-state variant.
     *   - `bg-surface-dark` and the numbered grays generate no utility at all
     *     (the named/numbered palette lives in `:root`, not `@theme`).
     * Scanning the whole overlay rather than one element is deliberate: a dead
     * class is wrong wherever it appears, not just where it appears today.
     */
    it.each([
      "dark:",
      "bg-surface-dark",
      "bg-white",
      "text-gray-600",
      "text-gray-400",
    ])("renders no `%s` anywhere in the overlay", (dead) => {
      expect(renderLoading().container.innerHTML).not.toContain(dead);
    });
  });

  describe("loading accent utilities are applied", () => {
    /*
     * SCOPE, stated plainly: these assert only that the element CARRIES the
     * utility. They cannot assert what it resolves to — jsdom never loads
     * src/index.css and CSS Modules are swapped for a non-scoped proxy — so on
     * their own they would still pass if `.icon-brand` or `.bg-scrim` were
     * deleted from the stylesheet.
     *
     * That gap is closed in e2e/loading-accent-color.spec.ts, in the
     * "LoadingWrapper overlay" describe block, which loads /todo in each theme
     * and reads the spinner's computed `color` and the scrim's computed
     * `background-color`. Both halves are needed: this file catches the class
     * being dropped from the markup, the e2e catches the utility being broken
     * in the stylesheet. Neither substitutes for the other.
     */
    it("applies the icon-brand utility to the spinner", () => {
      // `.icon-brand` is `color: var(--color-loading-accent)` in src/index.css.
      expect(getSpinner(renderLoading().container)).toHaveClass("icon-brand");
    });

    it("applies the bg-scrim utility to the overlay", () => {
      // `.bg-scrim` is `var(--color-scrim)` in src/index.css — a literal rgba
      // derived from --color-background, never a fixed white. (Not surface, and
      // not color-mix; index.css documents why both were rejected.)
      expect(getScrim(renderLoading().container)).toHaveClass("bg-scrim");
    });

    it("keeps the loading text on the neutral text-secondary utility", () => {
      renderLoading();

      // The <p> sits inside the element carrying the default loadingClassName.
      const label = screen.getByText("Loading...");
      const labelGroup = label.parentElement as HTMLElement;
      expect(styleAndClass(labelGroup)).toContain("text-secondary");
    });
  });

  describe("consumer overrides", () => {
    it("still honours an explicit loadingClassName", () => {
      renderLoading({ loadingClassName: "custom-loading" });

      const labelGroup = screen.getByText("Loading...")
        .parentElement as HTMLElement;
      expect(labelGroup).toHaveClass("custom-loading");
    });
  });
});
