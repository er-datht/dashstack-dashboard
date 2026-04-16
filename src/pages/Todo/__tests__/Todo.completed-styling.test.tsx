import { render, screen } from "@testing-library/react";
import Todo from "../index";
import type { TodoItem } from "../../../types/todo";

/**
 * Tests for the `simplify-completed-todo-styling` change.
 *
 * The file supersedes the prior per-card + starred + completed-row contracts.
 * The new contract (see openspec/changes/simplify-completed-todo-styling):
 *  - Card background is keyed on `todo.starred` ONLY. Completion no longer
 *    changes the card background.
 *      - starred → `bg-warning-light` (no border, no hover shift)
 *      - not starred → `bg-surface border border-gray-200 dark:border-gray-700
 *                       hover:bg-gray-50 dark:hover:bg-gray-700/50`
 *  - `bg-primary` MUST NEVER appear on the card.
 *  - Text: `font-semibold text-primary` on every row; `line-through` is added
 *    only when `completed: true`. Never `text-gray-900`, `dark:text-gray-100`,
 *    `!text-on-primary`, or `font-bold`.
 *  - Checkbox:
 *      - completed → `bg-primary-600 border-primary-600` with `<Check>` icon
 *        whose className includes `text-white` (plain, no `!`).
 *      - active → `bg-transparent border-2 border-gray-300 dark:border-gray-600`
 *        with no `<Check>` icon rendered.
 *  - Hover-gated action wrapper (`opacity-0 group-hover:opacity-100
 *    transition-opacity`) renders on EVERY row, containing a star button and
 *    a delete button whose icon is Lucide `<XCircle>` (class
 *    `lucide-circle-x`). Lucide `<Trash2>` (class `lucide-trash-2`) MUST NOT
 *    be rendered on any row.
 *  - Star icon has `fill-current` when `starred: true`, regardless of
 *    `completed`.
 *  - List parent uses `space-y-3` and does NOT use `divide-y`.
 */

// Mock the useTodos hook so we control the rendered todos.
// Path must match the component's import: `../../hooks/useTodos`.
const mockUseTodosReturn = {
  todos: [] as TodoItem[],
  isLoading: false,
  error: null as string | null,
  addTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  refetch: vi.fn(),
  isAddingTodo: false,
  isUpdatingTodo: false,
  isDeletingTodo: false,
};

vi.mock("../../../hooks/useTodos", () => ({
  useTodos: () => mockUseTodosReturn,
}));

// Helper: build a minimal TodoItem.
const makeTodo = (overrides: Partial<TodoItem> = {}): TodoItem => ({
  id: overrides.id ?? 1,
  text: overrides.text ?? "Sample todo",
  completed: overrides.completed ?? false,
  starred: overrides.starred ?? false,
  createdAt: overrides.createdAt ?? "2026-01-01T00:00:00.000Z",
});

// Helper: from a checkbox button element, walk up to the per-card row
// container <div> that holds the background / border / radius classes
// (checkbox → flex wrapper → card container).
const getRowContainer = (checkbox: HTMLElement): HTMLElement => {
  const flexWrapper = checkbox.parentElement;
  const row = flexWrapper?.parentElement;
  if (!row) throw new Error("Row container not found");
  return row as HTMLElement;
};

// Helper: find the action button with a given aria-label within the same row
// as the given text. We walk: text → flex wrapper → card container.
const getActionButton = (
  todoText: string,
  ariaLabel: string
): HTMLButtonElement => {
  const textEl = screen.getByText(todoText);
  const row = textEl.parentElement?.parentElement;
  if (!row) throw new Error("Row not found for todo text");
  const btn = row.querySelector(
    `button[aria-label="${ariaLabel}"]`
  ) as HTMLButtonElement | null;
  if (!btn) throw new Error(`Action button "${ariaLabel}" not found`);
  return btn;
};

// Helper: given a button, walk up its ancestors (up to a limit to avoid the
// document root) and return true if ANY ancestor has a className string
// containing BOTH `opacity-0` and `group-hover:opacity-100`.
const hasHoverGatedAncestor = (btn: HTMLElement): boolean => {
  let node: HTMLElement | null = btn.parentElement;
  let depth = 0;
  while (node && depth < 10) {
    const cls = node.className ?? "";
    if (
      typeof cls === "string" &&
      cls.includes("opacity-0") &&
      cls.includes("group-hover:opacity-100")
    ) {
      return true;
    }
    node = node.parentElement;
    depth += 1;
  }
  return false;
};

// Helper: given a checkbox button, get the corresponding checkbox aria-label
// for a given completed state.
const checkboxLabel = (completed: boolean): string =>
  completed ? "actions.incomplete" : "actions.complete";

describe("Todo page — simplified completed styling", () => {
  beforeEach(() => {
    // Reset todos before each test; default to empty.
    mockUseTodosReturn.todos = [];
    mockUseTodosReturn.isLoading = false;
    mockUseTodosReturn.error = null;
  });

  // ---------------------------------------------------------------------------
  // List container (parent of the row cards).
  // ---------------------------------------------------------------------------
  describe("list container", () => {
    it("uses `space-y-3` and does NOT include any `divide-y` utility", () => {
      mockUseTodosReturn.todos = [
        makeTodo({ id: 1, text: "Done task", completed: true }),
        makeTodo({ id: 2, text: "Open task", completed: false }),
      ];
      render(<Todo />);

      // Grab a row card, then step up to its parent (the list container).
      const checkbox = screen.getByRole("button", {
        name: "actions.complete",
      });
      const row = getRowContainer(checkbox);
      const listParent = row.parentElement as HTMLElement | null;
      if (!listParent) throw new Error("List parent not found");

      const tokens = listParent.className.split(/\s+/);
      expect(tokens).not.toContain("divide-y");
      expect(tokens).not.toContain("divide-gray-200");
      expect(tokens).not.toContain("dark:divide-gray-700");
      expect(tokens).toContain("space-y-3");
    });
  });

  // ---------------------------------------------------------------------------
  // Card background keyed on `starred` only.
  // ---------------------------------------------------------------------------
  describe("card background keyed on `starred` only", () => {
    it("completed + non-starred card uses `bg-surface` + `border` + border colors; no `bg-primary`, no `bg-warning-light`", () => {
      mockUseTodosReturn.todos = [
        makeTodo({
          id: 1,
          text: "Done task",
          completed: true,
          starred: false,
        }),
      ];
      render(<Todo />);
      const checkbox = screen.getByRole("button", { name: "actions.incomplete" });
      const row = getRowContainer(checkbox);
      const tokens = row.className.split(/\s+/);

      // Base classes.
      expect(tokens).toContain("rounded-xl");
      expect(tokens).toContain("p-4");
      expect(tokens).toContain("transition-colors");
      expect(tokens).toContain("group");

      // Background + border come from the NOT-starred branch.
      expect(tokens).toContain("bg-surface");
      expect(tokens).toContain("border");
      expect(tokens).toContain("border-gray-200");
      expect(tokens).toContain("dark:border-gray-700");

      // Completion MUST NOT influence the card background.
      expect(tokens).not.toContain("bg-primary");
      expect(tokens).not.toContain("bg-warning-light");
      expect(tokens).not.toContain("hover-bg-primary-dark");
    });

    it("completed + starred card uses `bg-warning-light`; no `bg-primary`, no standalone `border`", () => {
      mockUseTodosReturn.todos = [
        makeTodo({
          id: 1,
          text: "Done + starred",
          completed: true,
          starred: true,
        }),
      ];
      render(<Todo />);
      const checkbox = screen.getByRole("button", { name: "actions.incomplete" });
      const row = getRowContainer(checkbox);
      const tokens = row.className.split(/\s+/);

      // Starred wins regardless of completion.
      expect(tokens).toContain("bg-warning-light");

      // No blue card.
      expect(tokens).not.toContain("bg-primary");
      expect(tokens).not.toContain("hover-bg-primary-dark");

      // No standalone border / no border colors / no hover shift on starred.
      expect(tokens).not.toContain("border");
      expect(tokens).not.toContain("border-gray-200");
      expect(tokens).not.toContain("dark:border-gray-700");
      expect(tokens).not.toContain("hover:bg-gray-50");
      expect(tokens).not.toContain("dark:hover:bg-gray-700/50");
    });

    it("active + non-starred card uses `bg-surface` + `border` + gray border colors + gray hover; no `bg-primary`, no `bg-warning-light`", () => {
      mockUseTodosReturn.todos = [
        makeTodo({
          id: 2,
          text: "Open task",
          completed: false,
          starred: false,
        }),
      ];
      render(<Todo />);
      const checkbox = screen.getByRole("button", { name: "actions.complete" });
      const row = getRowContainer(checkbox);
      const tokens = row.className.split(/\s+/);

      expect(tokens).toContain("bg-surface");
      expect(tokens).toContain("border");
      expect(tokens).toContain("border-gray-200");
      expect(tokens).toContain("dark:border-gray-700");
      expect(tokens).toContain("hover:bg-gray-50");
      expect(tokens).toContain("dark:hover:bg-gray-700/50");

      expect(tokens).not.toContain("bg-primary");
      expect(tokens).not.toContain("bg-warning-light");
    });

    it("active + starred card uses `bg-warning-light`; no standalone `border`, no gray hover", () => {
      mockUseTodosReturn.todos = [
        makeTodo({
          id: 3,
          text: "Starred active task",
          completed: false,
          starred: true,
        }),
      ];
      render(<Todo />);
      const checkbox = screen.getByRole("button", { name: "actions.complete" });
      const row = getRowContainer(checkbox);
      const tokens = row.className.split(/\s+/);

      expect(tokens).toContain("bg-warning-light");
      expect(tokens).not.toContain("bg-primary");
      expect(tokens).not.toContain("bg-surface");
      expect(tokens).not.toContain("border");
      expect(tokens).not.toContain("border-gray-200");
      expect(tokens).not.toContain("dark:border-gray-700");
      expect(tokens).not.toContain("hover:bg-gray-50");
      expect(tokens).not.toContain("dark:hover:bg-gray-700/50");
    });

    it("`bg-primary` NEVER appears on the card across all four {completed, starred} combinations", () => {
      const combos: Array<{ completed: boolean; starred: boolean; label: string }> = [
        { completed: false, starred: false, label: "Active not starred" },
        { completed: true, starred: false, label: "Completed not starred" },
        { completed: false, starred: true, label: "Active starred" },
        { completed: true, starred: true, label: "Completed starred" },
      ];

      for (const { completed, starred, label } of combos) {
        mockUseTodosReturn.todos = [
          makeTodo({ id: 1, text: label, completed, starred }),
        ];
        const { unmount } = render(<Todo />);
        const checkbox = screen.getByRole("button", {
          name: checkboxLabel(completed),
        });
        const row = getRowContainer(checkbox);
        const tokens = row.className.split(/\s+/);
        expect(tokens).not.toContain("bg-primary");
        expect(tokens).not.toContain("hover-bg-primary-dark");
        unmount();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Checkbox styling.
  // ---------------------------------------------------------------------------
  describe("checkbox styling", () => {
    it("completed rows: checkbox is filled primary (`bg-primary-600 border-primary-600`) with a white `<Check>` icon", () => {
      mockUseTodosReturn.todos = [
        makeTodo({ id: 1, text: "Done task", completed: true }),
      ];
      render(<Todo />);
      const checkbox = screen.getByRole("button", { name: "actions.incomplete" });

      const tokens = checkbox.className.split(/\s+/);
      expect(tokens).toContain("bg-primary-600");
      expect(tokens).toContain("border-primary-600");

      // Must not revert to the outlined-white variant or keep `bg-transparent`
      // on completion.
      expect(tokens).not.toContain("bg-transparent");
      expect(tokens).not.toContain("border-white");

      // <Check> icon present and colored plain `text-white` (no `!` modifier,
      // and not `!text-on-primary`).
      const checkIcon = checkbox.querySelector(".lucide-check");
      expect(checkIcon).not.toBeNull();
      const iconClass = checkIcon!.getAttribute("class") ?? "";
      const iconTokens = iconClass.split(/\s+/);
      expect(iconTokens).toContain("text-white");
      expect(iconTokens).not.toContain("!text-on-primary");
      expect(iconTokens).not.toContain("!text-white");
    });

    it("active rows: checkbox is transparent with gray border (`bg-transparent border-2 border-gray-300 dark:border-gray-600`) and has NO `<Check>` icon", () => {
      mockUseTodosReturn.todos = [
        makeTodo({ id: 2, text: "Open task", completed: false }),
      ];
      render(<Todo />);
      const checkbox = screen.getByRole("button", { name: "actions.complete" });

      const tokens = checkbox.className.split(/\s+/);
      expect(tokens).toContain("bg-transparent");
      expect(tokens).toContain("border-2");
      expect(tokens).toContain("border-gray-300");
      expect(tokens).toContain("dark:border-gray-600");

      // No `<Check>` icon on active rows.
      expect(checkbox.querySelector(".lucide-check")).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Text styling — theme-semantic `text-primary`, `font-semibold`, and
  // conditional `line-through`.
  // ---------------------------------------------------------------------------
  describe("text styling", () => {
    const combos: Array<{
      completed: boolean;
      starred: boolean;
      label: string;
    }> = [
      { completed: false, starred: false, label: "Active not starred" },
      { completed: true, starred: false, label: "Completed not starred" },
      { completed: false, starred: true, label: "Active starred" },
      { completed: true, starred: true, label: "Completed starred" },
    ];

    it("every row's text uses `text-primary` + `font-semibold` and NEVER uses `text-gray-900`, `dark:text-gray-100`, `!text-on-primary`, or `font-bold`", () => {
      for (const { completed, starred, label } of combos) {
        mockUseTodosReturn.todos = [
          makeTodo({ id: 1, text: label, completed, starred }),
        ];
        const { unmount } = render(<Todo />);
        const textEl = screen.getByText(label);
        const tokens = textEl.className.split(/\s+/);

        expect(tokens).toContain("text-primary");
        expect(tokens).toContain("font-semibold");

        expect(tokens).not.toContain("text-gray-900");
        expect(tokens).not.toContain("dark:text-gray-100");
        expect(tokens).not.toContain("!text-on-primary");
        expect(tokens).not.toContain("font-bold");

        unmount();
      }
    });

    it("`line-through` is present ONLY when `completed: true` (both starred and non-starred)", () => {
      for (const { completed, starred, label } of combos) {
        mockUseTodosReturn.todos = [
          makeTodo({ id: 1, text: label, completed, starred }),
        ];
        const { unmount } = render(<Todo />);
        const textEl = screen.getByText(label);
        const tokens = textEl.className.split(/\s+/);

        if (completed) {
          expect(tokens).toContain("line-through");
        } else {
          expect(tokens).not.toContain("line-through");
        }

        unmount();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Action wrapper — hover-gated on every row.
  // ---------------------------------------------------------------------------
  describe("action wrapper (hover-gated) on every row", () => {
    const combos: Array<{
      completed: boolean;
      starred: boolean;
      label: string;
    }> = [
      { completed: false, starred: false, label: "Active not starred" },
      { completed: true, starred: false, label: "Completed not starred" },
      { completed: false, starred: true, label: "Active starred" },
      { completed: true, starred: true, label: "Completed starred" },
    ];

    it("every row wraps the star + delete buttons in `opacity-0 group-hover:opacity-100 transition-opacity`", () => {
      for (const { completed, starred, label } of combos) {
        mockUseTodosReturn.todos = [
          makeTodo({ id: 1, text: label, completed, starred }),
        ];
        const { unmount } = render(<Todo />);

        const starLabel = starred ? "actions.unstar" : "actions.star";
        const starBtn = getActionButton(label, starLabel);
        const deleteBtn = getActionButton(label, "actions.delete");

        expect(hasHoverGatedAncestor(starBtn)).toBe(true);
        expect(hasHoverGatedAncestor(deleteBtn)).toBe(true);

        // The wrapper also carries `transition-opacity`.
        let foundTransition = false;
        let node: HTMLElement | null = starBtn.parentElement;
        let depth = 0;
        while (node && depth < 10) {
          const cls = node.className ?? "";
          if (
            typeof cls === "string" &&
            cls.includes("opacity-0") &&
            cls.includes("group-hover:opacity-100") &&
            cls.includes("transition-opacity")
          ) {
            foundTransition = true;
            break;
          }
          node = node.parentElement;
          depth += 1;
        }
        expect(foundTransition).toBe(true);

        unmount();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Star + delete buttons on every row, and Trash2 must not appear anywhere.
  // ---------------------------------------------------------------------------
  describe("star + delete buttons on every row", () => {
    const combos: Array<{
      completed: boolean;
      starred: boolean;
      label: string;
    }> = [
      { completed: false, starred: false, label: "Active not starred" },
      { completed: true, starred: false, label: "Completed not starred" },
      { completed: false, starred: true, label: "Active starred" },
      { completed: true, starred: true, label: "Completed starred" },
    ];

    it("every row has both a star button AND a delete button whose icon is Lucide `XCircle`", () => {
      for (const { completed, starred, label } of combos) {
        mockUseTodosReturn.todos = [
          makeTodo({ id: 1, text: label, completed, starred }),
        ];
        const { unmount } = render(<Todo />);

        // Star button present for every row.
        const starBtn = screen.queryByRole("button", {
          name: /actions\.(star|unstar)/,
        });
        expect(starBtn).not.toBeNull();

        // Delete button present, using XCircle (circle-x) and NOT Trash2.
        const deleteBtn = getActionButton(label, "actions.delete");
        expect(deleteBtn.querySelector(".lucide-circle-x")).not.toBeNull();
        expect(deleteBtn.querySelector(".lucide-trash-2")).toBeNull();

        unmount();
      }
    });

    it("star icon has `fill-current` when `starred: true` regardless of `completed`", () => {
      const starredCombos: Array<{ completed: boolean; label: string }> = [
        { completed: false, label: "Active starred" },
        { completed: true, label: "Completed starred" },
      ];

      for (const { completed, label } of starredCombos) {
        mockUseTodosReturn.todos = [
          makeTodo({ id: 1, text: label, completed, starred: true }),
        ];
        const { unmount } = render(<Todo />);

        const starBtn = getActionButton(label, "actions.unstar");
        const starIcon = starBtn.querySelector(".lucide-star");
        expect(starIcon).not.toBeNull();
        const iconTokens = (starIcon!.getAttribute("class") ?? "").split(/\s+/);
        expect(iconTokens).toContain("fill-current");

        unmount();
      }
    });

    it("star icon does NOT have `fill-current` when `starred: false` regardless of `completed`", () => {
      const unstarredCombos: Array<{ completed: boolean; label: string }> = [
        { completed: false, label: "Active not starred" },
        { completed: true, label: "Completed not starred" },
      ];

      for (const { completed, label } of unstarredCombos) {
        mockUseTodosReturn.todos = [
          makeTodo({ id: 1, text: label, completed, starred: false }),
        ];
        const { unmount } = render(<Todo />);

        const starBtn = getActionButton(label, "actions.star");
        const starIcon = starBtn.querySelector(".lucide-star");
        expect(starIcon).not.toBeNull();
        const iconTokens = (starIcon!.getAttribute("class") ?? "").split(/\s+/);
        expect(iconTokens).not.toContain("fill-current");

        unmount();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // No `Trash2` anywhere in the DOM for any row state.
  // ---------------------------------------------------------------------------
  describe("no Trash2 icon rendered anywhere", () => {
    const combos: Array<{
      completed: boolean;
      starred: boolean;
      label: string;
    }> = [
      { completed: false, starred: false, label: "Active not starred" },
      { completed: true, starred: false, label: "Completed not starred" },
      { completed: false, starred: true, label: "Active starred" },
      { completed: true, starred: true, label: "Completed starred" },
    ];

    it("no `.lucide-trash-2` anywhere in the DOM for any {completed, starred} combination", () => {
      for (const { completed, starred, label } of combos) {
        mockUseTodosReturn.todos = [
          makeTodo({ id: 1, text: label, completed, starred }),
        ];
        const { container, unmount } = render(<Todo />);

        expect(container.querySelector(".lucide-trash-2")).toBeNull();

        unmount();
      }
    });
  });
});
