## 1. Tests (TDD)

- [x] 1.1 Locate existing Todo component tests under `src/pages/Todo/__tests__/` (if any) and review current assertions on completed-row rendering; note any that conflict with the new contract so they can be updated
- [x] 1.2 Add/update unit tests asserting that a completed todo row:
  - applies `bg-primary` on the row container (the outermost row `<div>` that today wraps checkbox + text + actions)
  - renders the checkbox `<button>` with `bg-transparent` + `border-2 border-white` classes and a visible `<Check>` icon whose class list includes `!text-on-primary`
  - renders the todo text element with `!text-on-primary` and `line-through` classes
- [x] 1.3 Add/update unit tests asserting that an active (not-completed) todo row:
  - does NOT apply `bg-primary` on the row container
  - renders the checkbox `<button>` with `border-2 border-gray-300 dark:border-gray-600` (or the existing pre-change classes) and no `<Check>` icon
  - renders the todo text element without `!text-on-primary` and without `line-through`
- [x] 1.4 Add unit test asserting hover-class composition on a completed row: the row container's class list includes `hover-bg-primary-dark` (or the equivalent hover utility) and does NOT include `hover:bg-gray-50` / `dark:hover:bg-gray-700/50`
- [x] 1.5 Add unit test asserting action-icon treatment on a completed row: the star and delete `<button>` elements (or the icons they render) include `text-on-primary` on the icon, `hover:bg-white/10` on the button, and — when the star is starred — retain `fill-current` on the star icon
- [x] 1.6 Add unit test asserting action-icon classes on an active row remain unchanged (no `text-on-primary`, no `hover:bg-white/10` on those buttons)
- [x] 1.7 Run `yarn test` and confirm the new/updated tests fail against current implementation (TDD red)

## 2. Implementation

- [x] 2.1 In `src/pages/Todo/index.tsx`, ensure `cn` is imported from `../../utils/cn`
- [x] 2.2 Update the todo row container `<div>` (the element that wraps the checkbox, text, and action buttons for a single todo) so its class composition uses `cn()` to apply `bg-primary hover-bg-primary-dark` when `todo.completed` is `true`, and keep the existing `hover:bg-gray-50 dark:hover:bg-gray-700/50` classes for the active branch; preserve the existing `transition-colors` in both branches
- [x] 2.3 Update the checkbox `<button>` so the completed branch uses `bg-transparent border-white` (keeping the existing `border-2` thickness) instead of `bg-primary-600 border-primary-600`; leave the active branch (`border-2 border-gray-300 dark:border-gray-600`) unchanged
- [x] 2.4 Update the `<Check>` icon inside the checkbox so its color class is `!text-on-primary` (replacing the prior `text-white`); keep Lucide's default stroke width and render only when `todo.completed` is `true`
- [x] 2.5 Update the todo text element so the completed branch applies `!text-on-primary line-through` (replacing any prior `text-white`); leave the active branch's default text color and absence of `line-through` unchanged
- [x] 2.6 Update the star action `<button>` and delete action `<button>` so that when `todo.completed` is `true` their icons apply `text-on-primary` and the button itself applies `hover:bg-white/10`; when the star is starred, keep `fill-current` on the star icon so it renders as a filled icon in the `text-on-primary` color. Active-row branches for these buttons remain unchanged
- [x] 2.7 Leave the list container's `divide-y divide-gray-200 dark:divide-gray-700` classes untouched; do NOT add a new border radius or inner pill wrapper on the completed row (the blue background is full-bleed)
- [x] 2.8 Verify no hardcoded hex colors were introduced and only theme-aware utilities are used (search the diff for `#` in class strings)

## 3. Verification

- [x] 3.1 Run `yarn test` and confirm all tests (including those from 1.2–1.6) pass
- [x] 3.2 Run `yarn lint` and fix any new warnings/errors introduced by the change
- [x] 3.3 Run `yarn dev` and manually verify on the Todo page that:
  - Completed rows render with a full-bleed primary background, an outlined white checkbox with a visible white checkmark, and white strikethrough text
  - Star and delete icons on completed rows render in white and their button-hover shows a subtle translucent-white tint (no yellow/red)
  - Active rows render unchanged (white surface, gray hover, unchanged icon colors)
  - Hover on completed rows transitions to a darker blue (not gray)
  - All three themes render correctly: light = blue, dark = blue, forest = green (green is the accepted forest outcome)
  - The row dividers between todos remain visible
- [x] 3.4 Launch `code-reviewer` subagent on the diff before marking the change ready for archive
