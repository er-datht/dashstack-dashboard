import { Layers } from "lucide-react";
import { getNavSections } from "../navigationData";
import { ROUTES } from "../../../routes/routes";
import type { TFunction } from "i18next";

/**
 * Tests for the sidebar nav data after the add-ui-elements-page rename.
 *
 * SPEC: openspec/changes/add-ui-elements-page/specs/sidebar-navigation/spec.md
 *
 *   - The PAGES section's UI Elements entry SHALL use:
 *       id: "ui-elements"
 *       label: t("navigation:uiElements")  (plural key)
 *       route: ROUTES.UI_ELEMENTS         (resolves to "/ui-elements")
 *       icon: Layers
 *   - The legacy singular id "ui-element" / `navigation:uiElement` /
 *     `ROUTES.UI_ELEMENT` SHALL no longer appear anywhere in the nav data.
 */

// A stub TFunction that returns the key (or fallback when given). Mirrors
// the global react-i18next mock shape so we can drive getNavSections directly.
const tStub = ((key: string, fallback?: string) =>
  fallback ?? key) as unknown as TFunction;

describe("navigationData — UI Elements rename", () => {
  it("PAGES section contains a nav item with the plural id 'ui-elements'", () => {
    const sections = getNavSections(tStub);
    const pagesSection = sections.find((s) =>
      s.items.some((item) => item.id === "ui-elements")
    );
    expect(pagesSection).toBeDefined();

    const uiElementsItem = pagesSection!.items.find(
      (item) => item.id === "ui-elements"
    )!;
    expect(uiElementsItem).toBeDefined();
    expect(uiElementsItem.id).toBe("ui-elements");
  });

  it("UI Elements nav item links to ROUTES.UI_ELEMENTS (resolves to /ui-elements) and uses the Layers icon", () => {
    const sections = getNavSections(tStub);
    const uiElementsItem = sections
      .flatMap((s) => s.items)
      .find((item) => item.id === "ui-elements");

    expect(uiElementsItem).toBeDefined();

    // Reference ROUTES via index access so this test compiles both before
    // and after the rename. The spec requires the resolved value to be
    // exactly "/ui-elements".
    const routesAsRecord = ROUTES as unknown as Record<string, string>;
    expect(uiElementsItem!.route).toBe(routesAsRecord.UI_ELEMENTS);
    expect(uiElementsItem!.route).toBe("/ui-elements");
    expect(uiElementsItem!.icon).toBe(Layers);
  });

  it("UI Elements nav item label uses the plural translation key 'navigation:uiElements'", () => {
    // Track every key passed to t() so we can assert the plural key is used
    // and the legacy singular key never is.
    const calls: string[] = [];
    const tSpy = ((key: string, fallback?: string) => {
      calls.push(key);
      return fallback ?? key;
    }) as unknown as TFunction;

    getNavSections(tSpy);

    expect(calls).toContain("navigation:uiElements");
    expect(calls).not.toContain("navigation:uiElement");
  });

  it("does NOT contain a nav item with the legacy singular id 'ui-element'", () => {
    const sections = getNavSections(tStub);
    const allItems = sections.flatMap((s) => s.items);
    const legacyItem = allItems.find((item) => item.id === "ui-element");
    expect(legacyItem).toBeUndefined();
  });

  it("does NOT reference the legacy ROUTES.UI_ELEMENT constant on any nav item", () => {
    const sections = getNavSections(tStub);
    const allItems = sections.flatMap((s) => s.items);

    // Confirm none of the items resolve to the legacy "/ui-element" path.
    const legacyRouteUsage = allItems.find(
      (item) => item.route === "/ui-element"
    );
    expect(legacyRouteUsage).toBeUndefined();

    // ROUTES.UI_ELEMENT itself should be removed from the route constants.
    // SPEC: route-config spec — "the previous singular UI_ELEMENT constant
    // SHALL be removed."
    expect(
      (ROUTES as unknown as Record<string, string>).UI_ELEMENT
    ).toBeUndefined();
  });
});
