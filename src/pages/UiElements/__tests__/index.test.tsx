import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UiElements from "../index";

/**
 * Tests for the UI Elements page (src/pages/UiElements/index.tsx).
 *
 * SPEC: Behavior derived from
 *   openspec/changes/add-ui-elements-page/specs/ui-elements-page/spec.md
 *
 *   Key requirements covered:
 *   - Page header renders the Layers icon + `t("uiElements:title")`.
 *   - Default filter value is "all" — Bar, Pie, and Donut sections all render.
 *   - Selecting "Bar Chart" hides the Pie and Donut sections.
 *   - Selecting "Pie Chart" hides the Bar and Donut sections.
 *   - Selecting "Donut Chart" hides the Bar and Pie sections.
 *   - Filter state is local; remounting the page resets to "all".
 *
 * recharts uses `ResponsiveContainer` which relies on a sized parent and
 * does not render its children in jsdom without a measured viewport. To keep
 * tests deterministic we mock recharts so chart-shape components become
 * lightweight DOM stubs. The page-level behavior we test is section
 * visibility (driven by the filter), not the recharts internals.
 *
 * react-i18next is globally mocked in src/test/setup.ts to return keys
 * verbatim, so we assert against translation keys.
 */

// Partial recharts mock: replace ResponsiveContainer with a fixed-size div so
// charts render their children, and stub the chart primitives to inert spans.
// The page's behavior under test (section visibility based on filter) does
// not depend on actual recharts rendering.
vi.mock("recharts", () => {
  const Stub = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 200 }}>{children}</div>
    ),
    BarChart: Stub,
    Bar: () => null,
    PieChart: Stub,
    Pie: () => null,
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
  };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <UiElements />
    </MemoryRouter>
  );
}

describe("UiElements page", () => {
  describe("page header", () => {
    it("renders the page title from the uiElements:title translation key", () => {
      renderPage();
      expect(screen.getByText("uiElements:title")).toBeInTheDocument();
    });

    it("renders a Layers icon in the header badge", () => {
      // lucide-react renders icons as <svg> with a `lucide-layers` class.
      const { container } = renderPage();
      const layersIcon = container.querySelector("svg.lucide-layers");
      expect(layersIcon).toBeInTheDocument();
    });

    it("renders the Filter By dropdown alongside the title", () => {
      renderPage();
      // The filter dropdown's label uses uiElements:filter.label
      expect(screen.getByText("uiElements:filter.label")).toBeInTheDocument();
    });
  });

  describe("default filter ('all')", () => {
    it("renders all three section titles (Bar, Pie, Donut) on first mount", () => {
      renderPage();
      expect(screen.getByText("uiElements:sections.bar")).toBeInTheDocument();
      expect(screen.getByText("uiElements:sections.pie")).toBeInTheDocument();
      expect(screen.getByText("uiElements:sections.donut")).toBeInTheDocument();
    });
  });

  describe("filter selection scopes visible sections", () => {
    function selectFilterOption(optionKey: string) {
      // Open the dropdown by clicking the trigger button.
      // The trigger is the first button on the page (filter pill).
      const triggerButtons = screen.getAllByRole("button");
      // The filter trigger should be near the top of the header. The first
      // button on the page is the filter pill (no other buttons exist on the
      // page shell besides the dropdown).
      fireEvent.click(triggerButtons[0]);

      // Click the option whose label matches the given translation key.
      const optionNode = screen
        .getAllByText(optionKey)
        .find((node) => node.closest("button"));
      if (!optionNode)
        throw new Error(`Could not find filter option for ${optionKey}`);
      fireEvent.click(optionNode.closest("button") as HTMLElement);
    }

    it("shows only the Bar Chart section when 'bar' is selected", () => {
      renderPage();
      selectFilterOption("uiElements:filter.options.bar");

      expect(screen.getByText("uiElements:sections.bar")).toBeInTheDocument();
      expect(
        screen.queryByText("uiElements:sections.pie")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("uiElements:sections.donut")
      ).not.toBeInTheDocument();
    });

    it("shows only the Pie Chart section when 'pie' is selected", () => {
      renderPage();
      selectFilterOption("uiElements:filter.options.pie");

      expect(screen.getByText("uiElements:sections.pie")).toBeInTheDocument();
      expect(
        screen.queryByText("uiElements:sections.bar")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("uiElements:sections.donut")
      ).not.toBeInTheDocument();
    });

    it("shows only the Donut Chart section when 'donut' is selected", () => {
      renderPage();
      selectFilterOption("uiElements:filter.options.donut");

      expect(screen.getByText("uiElements:sections.donut")).toBeInTheDocument();
      expect(
        screen.queryByText("uiElements:sections.bar")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("uiElements:sections.pie")
      ).not.toBeInTheDocument();
    });

    it("returns to all three sections when 'all' is re-selected after another value", () => {
      renderPage();
      selectFilterOption("uiElements:filter.options.pie");
      // Sanity: only Pie is visible after the first selection.
      expect(
        screen.queryByText("uiElements:sections.bar")
      ).not.toBeInTheDocument();

      selectFilterOption("uiElements:filter.options.all");

      expect(screen.getByText("uiElements:sections.bar")).toBeInTheDocument();
      expect(screen.getByText("uiElements:sections.pie")).toBeInTheDocument();
      expect(screen.getByText("uiElements:sections.donut")).toBeInTheDocument();
    });
  });

  describe("filter state is local (not persisted)", () => {
    it("resets to the default 'all' filter when the page is remounted (simulated reload)", () => {
      const { unmount } = renderPage();

      // Pick a non-default filter on the first mount.
      const triggerButtons = screen.getAllByRole("button");
      fireEvent.click(triggerButtons[0]);
      const donutOption = screen
        .getAllByText("uiElements:filter.options.donut")
        .find((node) => node.closest("button"))!;
      fireEvent.click(donutOption.closest("button") as HTMLElement);

      // After selection, only the Donut section should be visible.
      expect(
        screen.queryByText("uiElements:sections.bar")
      ).not.toBeInTheDocument();

      // Unmount + remount simulates a fresh navigation / reload.
      unmount();
      renderPage();

      // After remount, all three sections are visible again — confirming the
      // selected filter did not persist.
      expect(screen.getByText("uiElements:sections.bar")).toBeInTheDocument();
      expect(screen.getByText("uiElements:sections.pie")).toBeInTheDocument();
      expect(screen.getByText("uiElements:sections.donut")).toBeInTheDocument();
    });
  });
});
