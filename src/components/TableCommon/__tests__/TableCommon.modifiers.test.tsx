import { render, screen } from "@testing-library/react";
import TableCommon, { type ColumnDefinition } from "../index";

/**
 * Tests for the new visual modifier props on TableCommon
 * (`striped`, `bordered`, `compact`).
 *
 * SPEC: Component contract derived from
 *   openspec/changes/table-gallery-page/specs/shared-components/spec.md
 *   (MODIFIED Generic TableCommon component requirement, scenarios for
 *   Striped / Bordered / Compact / Modifier defaults are no-op /
 *   Modifiers combinable).
 *
 *   Coverage:
 *   - Default: no modifier classes when none of the props are passed.
 *   - `striped={true}` adds the striped class to the rendered <table>.
 *   - `bordered={true}` adds the bordered class to the rendered <table>.
 *   - `compact={true}` adds the compact class to the rendered <table>.
 *   - Combining all three adds all three classes.
 *   - Explicit `false` for each prop adds no modifier class.
 *
 *   Vitest is configured with `css.modules.classNameStrategy: "non-scoped"`
 *   (see vitest.config.ts), so CSS-module class names are emitted verbatim
 *   ("striped", "bordered", "compact"), letting us assert via
 *   `toHaveClass("striped" | "bordered" | "compact")`.
 *
 *   The new props do not exist yet — these tests are TDD and will fail
 *   until task §2 (extend TableCommon) lands.
 */

type Row = { id: string; label: string };

const columns: ColumnDefinition<Row>[] = [
  { key: "label", header: "Label" },
];

const data: Row[] = [{ id: "1", label: "First" }];

const renderCell = (item: Row) => item.label;

function renderTable(props: {
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
}) {
  return render(
    <TableCommon<Row>
      columns={columns}
      data={data}
      renderCell={renderCell}
      hasPagination={false}
      {...props}
    />
  );
}

describe("TableCommon modifier props", () => {
  describe("defaults (no modifier props passed)", () => {
    it("renders the <table> with none of the striped/bordered/compact classes", () => {
      renderTable({});
      const table = screen.getByRole("table");
      expect(table).not.toHaveClass("striped");
      expect(table).not.toHaveClass("bordered");
      expect(table).not.toHaveClass("compact");
    });
  });

  describe("striped prop", () => {
    it("adds the striped class to <table> when striped={true}", () => {
      renderTable({ striped: true });
      const table = screen.getByRole("table");
      expect(table).toHaveClass("striped");
      expect(table).not.toHaveClass("bordered");
      expect(table).not.toHaveClass("compact");
    });

    it("does NOT add the striped class when striped is explicitly false", () => {
      renderTable({ striped: false });
      const table = screen.getByRole("table");
      expect(table).not.toHaveClass("striped");
    });
  });

  describe("bordered prop", () => {
    it("adds the bordered class to <table> when bordered={true}", () => {
      renderTable({ bordered: true });
      const table = screen.getByRole("table");
      expect(table).toHaveClass("bordered");
      expect(table).not.toHaveClass("striped");
      expect(table).not.toHaveClass("compact");
    });

    it("does NOT add the bordered class when bordered is explicitly false", () => {
      renderTable({ bordered: false });
      const table = screen.getByRole("table");
      expect(table).not.toHaveClass("bordered");
    });
  });

  describe("compact prop", () => {
    it("adds the compact class to <table> when compact={true}", () => {
      renderTable({ compact: true });
      const table = screen.getByRole("table");
      expect(table).toHaveClass("compact");
      expect(table).not.toHaveClass("striped");
      expect(table).not.toHaveClass("bordered");
    });

    it("does NOT add the compact class when compact is explicitly false", () => {
      renderTable({ compact: false });
      const table = screen.getByRole("table");
      expect(table).not.toHaveClass("compact");
    });
  });

  describe("combining modifiers", () => {
    it("adds all three modifier classes when striped, bordered, and compact are true", () => {
      renderTable({ striped: true, bordered: true, compact: true });
      const table = screen.getByRole("table");
      expect(table).toHaveClass("striped");
      expect(table).toHaveClass("bordered");
      expect(table).toHaveClass("compact");
    });

    it("adds no modifier class when all three are explicitly false", () => {
      renderTable({ striped: false, bordered: false, compact: false });
      const table = screen.getByRole("table");
      expect(table).not.toHaveClass("striped");
      expect(table).not.toHaveClass("bordered");
      expect(table).not.toHaveClass("compact");
    });
  });
});
