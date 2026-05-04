import { render, screen, fireEvent } from "@testing-library/react";
import FilterByDropdown from "../FilterByDropdown";
import type { FilterValue } from "../../types";

/**
 * Tests for the FilterByDropdown component used on the UI Elements page.
 *
 * SPEC: Component contract derived from
 *   openspec/changes/add-ui-elements-page/specs/ui-elements-page/spec.md
 *   and openspec/changes/add-ui-elements-page/design.md (Decision 2):
 *
 *   - Props: { value: FilterValue; onChange: (next: FilterValue) => void }
 *   - FilterValue = "all" | "bar" | "pie" | "donut"
 *   - Trigger displays the translated label for the current selection.
 *   - Clicking the trigger toggles a menu listing exactly four options in
 *     this order: all (Charts), bar (Bar Chart), pie (Pie Chart), donut
 *     (Donut Chart). Option labels come from `uiElements:filter.options.*`.
 *   - Clicking an option calls onChange with the new value.
 *   - The component owns its own open/close state.
 *
 * react-i18next is globally mocked in src/test/setup.ts to return keys
 * verbatim, so we assert against the raw translation keys.
 */

describe("FilterByDropdown", () => {
  describe("trigger rendering", () => {
    it("renders the current selection's translated label in the trigger when value is 'all'", () => {
      render(<FilterByDropdown value="all" onChange={vi.fn()} />);
      // The trigger button must surface the currently selected option label.
      // SPEC: assumed the trigger renders `t("uiElements:filter.options.all")`.
      expect(
        screen.getByText("uiElements:filter.options.all")
      ).toBeInTheDocument();
    });

    it("renders the 'Filter By' label alongside the selection trigger", () => {
      render(<FilterByDropdown value="all" onChange={vi.fn()} />);
      expect(screen.getByText("uiElements:filter.label")).toBeInTheDocument();
    });

    it("reflects a non-default value in the trigger", () => {
      render(<FilterByDropdown value="bar" onChange={vi.fn()} />);
      expect(
        screen.getByText("uiElements:filter.options.bar")
      ).toBeInTheDocument();
    });
  });

  describe("menu open/close", () => {
    it("does not render the option menu items by default (menu closed)", () => {
      render(<FilterByDropdown value="all" onChange={vi.fn()} />);
      // While closed, only the trigger label for the active option exists.
      // The bar/pie/donut option menu items should NOT be rendered yet.
      expect(
        screen.queryByText("uiElements:filter.options.bar")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("uiElements:filter.options.pie")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("uiElements:filter.options.donut")
      ).not.toBeInTheDocument();
    });

    it("opens the menu and lists exactly the four options in order when the trigger is clicked", () => {
      render(<FilterByDropdown value="all" onChange={vi.fn()} />);

      // First button is the trigger pill.
      const trigger = screen.getAllByRole("button")[0];
      fireEvent.click(trigger);

      // After opening, all four option labels must be present.
      const expectedKeys = [
        "uiElements:filter.options.all",
        "uiElements:filter.options.bar",
        "uiElements:filter.options.pie",
        "uiElements:filter.options.donut",
      ];

      for (const key of expectedKeys) {
        // 'all' may also appear in the trigger; getAllByText is safe.
        expect(screen.getAllByText(key).length).toBeGreaterThanOrEqual(1);
      }

      // Order: collect the option menu item texts (excluding the trigger label
      // for the currently selected value) and verify the expected sequence.
      const allLabels = screen.getAllByText(
        /uiElements:filter\.options\.(all|bar|pie|donut)/
      );
      const orderedTexts = allLabels.map((node) => node.textContent);
      // The last 4 occurrences (in DOM order) should follow all → bar → pie → donut.
      const tail = orderedTexts.slice(-4);
      expect(tail).toEqual([
        "uiElements:filter.options.all",
        "uiElements:filter.options.bar",
        "uiElements:filter.options.pie",
        "uiElements:filter.options.donut",
      ]);
    });
  });

  describe("onChange behavior", () => {
    it("calls onChange with the clicked option's value", () => {
      const onChange = vi.fn<(next: FilterValue) => void>();
      render(<FilterByDropdown value="all" onChange={onChange} />);

      // Open the menu.
      const trigger = screen.getAllByRole("button")[0];
      fireEvent.click(trigger);

      // Click the "Bar Chart" option. The option's clickable element should be
      // the closest button/menuitem ancestor of the label.
      const barOption = screen
        .getAllByText("uiElements:filter.options.bar")
        .find((node) => node.closest("button"))!;
      fireEvent.click(barOption.closest("button") as HTMLElement);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("bar");
    });

    it("calls onChange with 'donut' when the donut option is clicked", () => {
      const onChange = vi.fn<(next: FilterValue) => void>();
      render(<FilterByDropdown value="all" onChange={onChange} />);

      const trigger = screen.getAllByRole("button")[0];
      fireEvent.click(trigger);

      const donutOption = screen
        .getAllByText("uiElements:filter.options.donut")
        .find((node) => node.closest("button"))!;
      fireEvent.click(donutOption.closest("button") as HTMLElement);

      expect(onChange).toHaveBeenCalledWith("donut");
    });
  });
});
