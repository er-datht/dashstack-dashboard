## 1. Tests (TDD)

- [x] 1.1 Review existing `src/pages/Todo/__tests__/Todo.completed-styling.test.tsx` and note assertions that will no longer hold under the new contract (row walk depth, implicit `divide-y`, star-button presence on completed rows, `Trash2` vs `XCircle`, font-weight)
- [x] 1.2 Update `Todo.completed-styling.test.tsx` so the existing completed-row assertions (bg-primary, border-2 border-white checkbox, !text-on-primary text, hover-bg-primary-dark) still target the new per-card row container
- [x] 1.3 Add new test: list parent does NOT include `divide-y` or `divide-gray-*` classes and DOES include `space-y-3` (or equivalent 12px vertical spacing utility)
- [x] 1.4 Add new test: active-row card container includes `bg-surface`, `border`, and `rounded-xl` classes; completed-row card container includes `bg-primary`, `rounded-xl`, and does NOT include `border` as a standalone utility
- [x] 1.5 Add new test: active-row text span has `font-semibold`; completed-row text span has `font-bold`
- [x] 1.6 Add new test: active-row delete button renders a Lucide `XCircle` icon (NOT `Trash2`); completed-row delete button renders a Lucide `Trash2` icon (NOT `XCircle`). Assert via `lucide` class names or `data-lucide` attribute (in lucide-react v0.546.0, `XCircle` emits `lucide-circle-x` and `Trash2` emits `lucide-trash-2`)
- [x] 1.7 Add new test: completed row does NOT render a star `<button>` in the DOM (`queryByRole('button', { name: /actions\.(star|unstar)/ })` returns null for a completed todo)
- [x] 1.8 Add new test: completed row delete button is NOT inside an element with `opacity-0 group-hover:opacity-100`; active-row action wrapper IS `opacity-0 group-hover:opacity-100`
- [x] 1.9 Add new test: completed row delete button classes include `bg-white/10`, `hover:bg-white/20`, and `rounded-lg`
- [x] 1.10 Add new test: `starred + completed` todo still has no star `<button>` rendered; toggling `completed: false` in a follow-up render re-reveals the star button with `fill-current` on the Star icon (render twice with different props, assert both states)
- [x] 1.11 Run `yarn test src/pages/Todo/__tests__/Todo.completed-styling.test.tsx --run` and confirm the new/updated tests fail against current implementation (TDD red) — 22 tests total, 11 pass (prior contract held), 11 fail aligned with new contract (rounded-xl on completed, font-bold/font-semibold weights, bg-surface on active, list parent `divide-y` → `space-y-3`, active XCircle, completed star hidden ×2, completed delete always-visible, completed delete `hover:bg-white/20`, starred+completed preservation)

## 2. Implementation

- [x] 2.1 In `src/pages/Todo/index.tsx`, update the `lucide-react` import to add `XCircle` alongside the existing icons; keep `Trash2` (it moves to completed rows)
- [x] 2.2 Remove the outer list card wrapper (`<div className="bg-white dark:bg-gray-800 border ... rounded-lg shadow-sm">`) and its inner `<div className="divide-y ...">`. Replace with a list container `<div className="space-y-3">` that wraps the `paginatedTodos.map(...)` output
- [x] 2.3 Move the empty-state JSX out of the removed card into a bare `<div className="py-12 text-center">` rendered as a sibling when `filteredTodos.length === 0`
- [x] 2.4 Move the `<Pagination>` element out of the removed card into a `<div className="pt-4">` sibling that renders only when `showPagination`
- [x] 2.5 Rebuild the per-row card container `<div>` using `cn()` so that:
  - Active branch (`!todo.completed`): `bg-surface border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group`
  - Completed branch (`todo.completed`): `bg-primary hover-bg-primary-dark rounded-xl p-4 transition-colors group`
- [x] 2.6 Keep the checkbox button markup from the previous change unchanged (it already handles both branches correctly)
- [x] 2.7 Update the todo text `<span>` classes so the active branch includes `font-semibold text-gray-900 dark:text-gray-100` and the completed branch includes `font-bold !text-on-primary line-through`; keep the existing `flex-1` positioning
- [x] 2.8 Guard the entire `opacity-0 group-hover:opacity-100` actions wrapper so it renders ONLY when `!todo.completed`. Inside this wrapper, render the star button (unchanged active-row styling) and the delete button using the new Lucide `XCircle` icon (keep existing button classes: `text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ...`)
- [x] 2.9 Add a new completed-row delete button that renders ONLY when `todo.completed`, outside the hover-gated wrapper (always visible). Classes: `bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors`. Icon: `<Trash2 className="w-5 h-5 text-on-primary" />`. `aria-label={t('actions.delete')}`. `onClick={() => deleteTodo(todo.id)}`
- [x] 2.10 Ensure the star button is NOT rendered at all when `todo.completed` (conditional JSX, not CSS `hidden`)
- [x] 2.11 Remove any references to `divide-y`, `divide-gray-200`, or `divide-gray-700` in `src/pages/Todo/index.tsx`
- [x] 2.12 Verify no hardcoded hex colors were introduced (grep the diff for `#` inside className strings)

## 3. Verification

- [x] 3.1 Run `yarn test` and confirm all tests pass (including the new/updated ones from section 1)
- [x] 3.2 Run `yarn lint` and fix any new warnings/errors introduced by the change
- [x] 3.3 Run `yarn dev` and manually verify on the Todo page:
  - Active rows render as separate bordered white cards with SemiBold text; hover reveals a star + X-circle delete button
  - Completed rows render as full-bleed blue cards with Bold white strikethrough text, outlined-white checkbox with white checkmark, no star button, and an always-visible trash-in-square delete button
  - Rows are spaced vertically with a small gap; there is no shared divider
  - Pagination renders below the list with no surrounding card
  - Empty state renders centered without a bordered card
  - All three themes (light / dark / forest) look correct; forest completed cards are green (accepted)
  - No regressions in add-todo input, filter tabs, page header, or error banner
- [x] 3.4 Launch `code-reviewer` subagent on the diff before marking the change ready for archive
