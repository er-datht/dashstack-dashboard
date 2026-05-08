import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TablePage from "../index";

/**
 * Smoke tests for the Tables gallery page (src/pages/Table/index.tsx).
 *
 * SPEC: Behavior derived from
 *   openspec/changes/table-gallery-page/specs/table-gallery-page/spec.md
 *
 *   Coverage:
 *   - Header renders the Table icon, the `tables:title` translation key,
 *     and the FilterByDropdown (label `tables:filterBy.label`).
 *   - Default filter ("all") renders all three section cards.
 *   - Selecting "Basic Tables" / "Cell Content" / "States & Interaction"
 *     scopes the visible sections to just that one.
 *   - All 12 variant cards mount when filter = "all" (counted by variant
 *     subtitle text rather than by <table> elements, since the showcase
 *     contains a Loading variant whose table may or may not render
 *     internally).
 *   - Clicking a Pencil button in the With Action Icons variant fires a
 *     toast carrying the `tables:toast.edited` key.
 *   - Clicking a row in the Clickable Rows variant fires a toast carrying
 *     the `tables:toast.selected` key.
 *   - The Paginated variant renders 5 rows at a time and a 5-page
 *     pagination control for the 25-row dataset.
 *
 *   The page rewrite (and its sub-components) does not exist yet — these
 *   tests are TDD and will fail until tasks §5–§9 land.
 *
 *   react-i18next is globally mocked in src/test/setup.ts to return keys
 *   verbatim, so we assert against translation keys.
 */

function renderPage() {
  return render(
    <MemoryRouter>
      <TablePage />
    </MemoryRouter>
  );
}

/**
 * Open the FilterByDropdown trigger and click the option whose label matches
 * the given translation key. Mirrors the helper used in the UiElements page
 * tests: the trigger is the first <button> on the page.
 */
function selectFilterOption(optionKey: string) {
  const triggerButtons = screen.getAllByRole("button");
  fireEvent.click(triggerButtons[0]);

  const optionNode = screen
    .getAllByText(optionKey)
    .find((node) => node.closest("button"));
  if (!optionNode) {
    throw new Error(`Could not find filter option for ${optionKey}`);
  }
  fireEvent.click(optionNode.closest("button") as HTMLElement);
}

describe("Tables gallery page", () => {
  describe("page header", () => {
    it("renders the page title from the tables:title translation key", () => {
      renderPage();
      expect(screen.getByText("tables:title")).toBeInTheDocument();
    });

    it("renders the Table lucide icon in the header badge", () => {
      // lucide-react emits its icon component class as `lucide-table` on the SVG.
      const { container } = renderPage();
      const tableIcon = container.querySelector("svg.lucide-table");
      expect(tableIcon).toBeInTheDocument();
    });

    it("renders the FilterByDropdown alongside the title", () => {
      renderPage();
      expect(screen.getByText("tables:filterBy.label")).toBeInTheDocument();
    });
  });

  describe("default filter ('all') renders all three sections", () => {
    it("shows the Basic, Cell Content, and States & Interaction section titles", () => {
      renderPage();
      expect(
        screen.getByText("tables:sections.basic.title")
      ).toBeInTheDocument();
      expect(
        screen.getByText("tables:sections.cellContent.title")
      ).toBeInTheDocument();
      expect(
        screen.getByText("tables:sections.states.title")
      ).toBeInTheDocument();
    });

    it("mounts all 12 variant cards (one per spec variant subtitle)", () => {
      const { container } = renderPage();

      // Spec-defined variant titles, by section. The Loading variant
      // intentionally renders without a subtitle (its centered spinner is the
      // only label needed; a top-left "Loading" label conflicts visually with
      // the centered overlay) — its presence is asserted via the spinner SVG
      // below instead.
      const expectedVariantKeys = [
        // Basic Tables
        "tables:variants.basic.default",
        "tables:variants.basic.striped",
        "tables:variants.basic.bordered",
        "tables:variants.basic.compact",
        // Cell Content
        "tables:variants.cellContent.avatars",
        "tables:variants.cellContent.statusBadges",
        "tables:variants.cellContent.colorDots",
        "tables:variants.cellContent.actions",
        // States & Interaction
        "tables:variants.states.empty",
        "tables:variants.states.paginated",
        "tables:variants.states.clickable",
      ];

      for (const key of expectedVariantKeys) {
        expect(screen.getByText(key)).toBeInTheDocument();
      }

      // Loading variant: assert by the loading-overlay element which only
      // mounts when TableCommon receives loading={true}. Vitest is configured
      // with non-scoped CSS-module class names (see vitest.config.ts), so the
      // class name is emitted verbatim.
      const overlay = container.querySelector(".loadingOverlay");
      expect(overlay).toBeInTheDocument();
    });
  });

  describe("filter scopes visible sections", () => {
    it("shows only the Basic Tables section when 'basic' is selected", () => {
      renderPage();
      selectFilterOption("tables:filterBy.basic");

      expect(
        screen.getByText("tables:sections.basic.title")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("tables:sections.cellContent.title")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("tables:sections.states.title")
      ).not.toBeInTheDocument();
    });

    it("shows only the Cell Content section when 'cellContent' is selected", () => {
      renderPage();
      selectFilterOption("tables:filterBy.cellContent");

      expect(
        screen.getByText("tables:sections.cellContent.title")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("tables:sections.basic.title")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("tables:sections.states.title")
      ).not.toBeInTheDocument();
    });

    it("shows only the States & Interaction section when 'statesAndInteraction' is selected", () => {
      renderPage();
      selectFilterOption("tables:filterBy.statesAndInteraction");

      expect(
        screen.getByText("tables:sections.states.title")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("tables:sections.basic.title")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("tables:sections.cellContent.title")
      ).not.toBeInTheDocument();
    });
  });

  describe("interactive variants fire toasts", () => {
    it("shows a toast with the tables:toast.edited key when a Pencil button is clicked", () => {
      renderPage();

      // Scope to the With Action Icons variant card via its subtitle.
      const actionsCard = screen
        .getByText("tables:variants.cellContent.actions")
        .closest("div");
      if (!actionsCard) {
        throw new Error("Could not find the With Action Icons variant card");
      }

      // Pencil buttons render with an accessible name from the i18n key
      // (verbatim under the global mock). SPEC: assumed the Pencil button's
      // aria-label key is `tables:actions.edit` — verify during implementation.
      const pencilButtons = within(actionsCard as HTMLElement).getAllByRole(
        "button",
        { name: "tables:actions.edit" }
      );
      expect(pencilButtons.length).toBeGreaterThan(0);
      fireEvent.click(pencilButtons[0]);

      // Toast surfaces with role="status" (aria-live="polite") per the
      // ProductStock pattern referenced in tasks §9.1.
      const toast = screen.getByRole("status");
      expect(toast).toHaveTextContent("tables:toast.edited");
    });

    it("shows toast.deleted on Trash2 click and does not remove the row from the DOM", () => {
      renderPage();

      const actionsCard = screen
        .getByText("tables:variants.cellContent.actions")
        .closest("div");
      if (!actionsCard) {
        throw new Error("Could not find the With Action Icons variant card");
      }

      const tableEl = (actionsCard as HTMLElement).querySelector("table");
      if (!tableEl) throw new Error("Actions variant did not render a <table>");
      const rowsBefore = tableEl.querySelectorAll("tbody tr").length;
      expect(rowsBefore).toBeGreaterThan(0);

      const trashButtons = within(actionsCard as HTMLElement).getAllByRole(
        "button",
        { name: "tables:actions.delete" }
      );
      expect(trashButtons.length).toBe(rowsBefore);
      fireEvent.click(trashButtons[0]);

      const toast = screen.getByRole("status");
      expect(toast).toHaveTextContent("tables:toast.deleted");

      // No mutation: the row count is unchanged, and no ConfirmModal opens.
      const rowsAfter = tableEl.querySelectorAll("tbody tr").length;
      expect(rowsAfter).toBe(rowsBefore);
    });

    it("shows a toast with the tables:toast.selected key when a row in Clickable Rows is clicked", () => {
      renderPage();

      // Scope to the Clickable Rows variant card via its subtitle.
      const clickableCard = screen
        .getByText("tables:variants.states.clickable")
        .closest("div");
      if (!clickableCard) {
        throw new Error("Could not find the Clickable Rows variant card");
      }

      // Click the first body row inside the Clickable Rows variant's table.
      const tableEl = (clickableCard as HTMLElement).querySelector("table");
      if (!tableEl) {
        throw new Error("Clickable Rows variant did not render a <table>");
      }
      const firstBodyRow = tableEl.querySelector("tbody tr");
      if (!firstBodyRow) {
        throw new Error("Clickable Rows variant has no <tbody> rows");
      }
      fireEvent.click(firstBodyRow);

      const toast = screen.getByRole("status");
      expect(toast).toHaveTextContent("tables:toast.selected");
    });
  });

  describe("Basic Tables variants apply the right modifier classes", () => {
    function tableInVariant(variantKey: string): HTMLTableElement {
      const card = screen.getByText(variantKey).closest("div");
      if (!card) throw new Error(`Could not find variant card for ${variantKey}`);
      const table = (card as HTMLElement).querySelector("table");
      if (!table) throw new Error(`Variant ${variantKey} did not render a <table>`);
      return table as HTMLTableElement;
    }

    it("Default variant carries none of the modifier classes", () => {
      renderPage();
      const table = tableInVariant("tables:variants.basic.default");
      expect(table).not.toHaveClass("striped");
      expect(table).not.toHaveClass("bordered");
      expect(table).not.toHaveClass("compact");
    });

    it("Striped variant carries only the striped class", () => {
      renderPage();
      const table = tableInVariant("tables:variants.basic.striped");
      expect(table).toHaveClass("striped");
      expect(table).not.toHaveClass("bordered");
      expect(table).not.toHaveClass("compact");
    });

    it("Bordered variant carries only the bordered class", () => {
      renderPage();
      const table = tableInVariant("tables:variants.basic.bordered");
      expect(table).toHaveClass("bordered");
      expect(table).not.toHaveClass("striped");
      expect(table).not.toHaveClass("compact");
    });

    it("Compact variant carries only the compact class", () => {
      renderPage();
      const table = tableInVariant("tables:variants.basic.compact");
      expect(table).toHaveClass("compact");
      expect(table).not.toHaveClass("striped");
      expect(table).not.toHaveClass("bordered");
    });
  });

  describe("Paginated variant", () => {
    it("renders 5 rows at a time and a 5-page pagination control for the 25-row dataset", () => {
      renderPage();

      const paginatedCard = screen
        .getByText("tables:variants.states.paginated")
        .closest("div");
      if (!paginatedCard) {
        throw new Error("Could not find the Paginated variant card");
      }

      const tableEl = (paginatedCard as HTMLElement).querySelector("table");
      if (!tableEl) {
        throw new Error("Paginated variant did not render a <table>");
      }

      // 5 rows per page.
      const bodyRows = tableEl.querySelectorAll("tbody tr");
      expect(bodyRows.length).toBe(5);

      // react-paginate exposes page buttons with accessible name "Page N"
      // (and "Page N is your current page" for the active page). For a 25-row
      // dataset at pageSize=5 we expect 5 pages.
      const scoped = within(paginatedCard as HTMLElement);
      expect(
        scoped.getByRole("button", { name: /^Page 1\b/ })
      ).toBeInTheDocument();
      expect(
        scoped.getByRole("button", { name: /^Page 5\b/ })
      ).toBeInTheDocument();
      expect(
        scoped.queryByRole("button", { name: /^Page 6\b/ })
      ).not.toBeInTheDocument();
    });
  });
});
