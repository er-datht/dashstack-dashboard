import { render, screen } from "@testing-library/react";
import TableCommon, { type ColumnDefinition } from "../index";

/**
 * Tests for the TableCommon loading overlay.
 *
 * SPEC: Component contract derived from
 *   openspec/changes/unify-loading-accent-color/specs/shared-components/spec.md
 *   (ADDED Requirement: TableCommon loading overlay colour — scenarios
 *   "Overlay spinner per theme" / "No unreachable theme selector").
 *
 *   WHAT THIS FILE CAN AND CANNOT ASSERT
 *   ------------------------------------
 *   The overlay's colour lives entirely in `TableCommon.module.scss`, and
 *   Vitest replaces CSS Modules with a non-scoped proxy that emits class names
 *   verbatim and loads no declarations. So this file can prove the overlay and
 *   its spinner are RENDERED and reachable, but not what colour they resolve
 *   to. `var(--color-loading-accent)` vs. the old `var(--color-primary-600)`,
 *   and the removal of the dead `:global(.dark)` override, are verified by the
 *   Playwright spec against `/table` (design.md D7, tasks §6).
 *
 *   These tests therefore pass both before and after the change — they are the
 *   guard that the recolour does not accidentally remove or detach the overlay
 *   the e2e spec depends on being on screen.
 *
 *   Kept in its own file rather than folded into TableCommon.modifiers.test.tsx
 *   to match the repo's one-concern-per-file test naming
 *   (TopNav.authUserChanged, UserMenu.manageAccount, Inbox.archive, ...).
 */

type Row = { id: string; label: string };

const columns: ColumnDefinition<Row>[] = [{ key: "label", header: "Label" }];

const renderCell = (item: Row) => item.label;

function renderTable(props: { loading?: boolean; data?: Row[] }) {
  const { loading, data = [{ id: "1", label: "First" }] } = props;
  return render(
    <TableCommon<Row>
      columns={columns}
      data={data}
      renderCell={renderCell}
      hasPagination={false}
      loading={loading}
    />
  );
}

describe("TableCommon loading overlay", () => {
  describe("when loading is true", () => {
    it("renders the loading overlay", () => {
      const { container } = renderTable({ loading: true });
      expect(container.querySelector(".loadingOverlay")).not.toBeNull();
    });

    it("renders the spinner inside the overlay", () => {
      const { container } = renderTable({ loading: true });
      const overlay = container.querySelector(".loadingOverlay");
      expect(overlay?.querySelector(".spinner")).not.toBeNull();
    });

    it("shows the loading label instead of the empty-state label when there is no data", () => {
      // This is the `/table` scenario the e2e spec drives: data={[]} with
      // loading on gives a spinner that is on screen with no network stubbing.
      renderTable({ loading: true, data: [] });
      expect(screen.getByText("loading")).toBeInTheDocument();
      expect(screen.queryByText("noData")).not.toBeInTheDocument();
    });
  });

  describe("when loading is false or omitted", () => {
    it("renders no overlay when loading is explicitly false", () => {
      const { container } = renderTable({ loading: false });
      expect(container.querySelector(".loadingOverlay")).toBeNull();
      expect(container.querySelector(".spinner")).toBeNull();
    });

    it("renders no overlay by default", () => {
      const { container } = renderTable({});
      expect(container.querySelector(".loadingOverlay")).toBeNull();
    });

    it("shows the empty-state label when there is no data and no loading", () => {
      renderTable({ data: [] });
      expect(screen.getByText("noData")).toBeInTheDocument();
    });
  });
});
