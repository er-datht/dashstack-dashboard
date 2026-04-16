## 1. Tests (TDD)

- [x] 1.1 Open `src/pages/Todo/__tests__/Todo.completed-styling.test.tsx` and review existing assertions. Note which describe blocks cover "active-row styling" — those will be expanded to cover the new three-way state matrix
- [x] 1.2 Update the existing "active-row styling" test so it explicitly uses a todo with `{ completed: false, starred: false }` to avoid ambiguity with the new starred-active state
- [x] 1.3 Add new test: starred-active todo (`{ completed: false, starred: true }`) — card className includes `bg-warning-light` and `rounded-xl`; does NOT include `bg-primary`, `bg-surface`, `border-gray-200`, `dark:border-gray-700`, `hover:bg-gray-50`, or `dark:hover:bg-gray-700/50`; does NOT include a standalone `border` utility (use the same `split(/\s+/)`-based assertion pattern already in the test file to avoid matching `border-white` on descendants)
- [x] 1.4 Add new test: completed todo with `starred: true` (`{ completed: true, starred: true }`) — card className includes `bg-primary` and does NOT include `bg-warning-light` (verifies Decision 4 — completed wins)
- [x] 1.5 Add new test: three-way mutual exclusivity — for each of the three states (`{completed: true}`, `{completed: false, starred: true}`, `{completed: false, starred: false}`), exactly one of `bg-primary`/`bg-warning-light`/`bg-surface` appears in the card className (and the other two do NOT)
- [x] 1.6 Add new test: starred-then-completed transition — render a todo with `{ completed: false, starred: true }`, confirm `bg-warning-light` is present; `rerender` with `{ completed: true, starred: true }`, confirm `bg-primary` is present AND `bg-warning-light` is absent
- [x] 1.7 Add new test: completed-then-unstarred-active transition — render `{ completed: true, starred: true }` (no star button in DOM), `rerender` with `{ completed: false, starred: true }`, confirm star button reappears AND card has `bg-warning-light`
- [x] 1.8 Run `yarn test src/pages/Todo/__tests__/Todo.completed-styling.test.tsx --run` and confirm the new tests fail against current implementation (TDD red)

## 2. Implementation

- [x] 2.1 In `src/pages/Todo/index.tsx`, inside the `paginatedTodos.map((todo) => ...)` callback, derive a `cardState` variable: `const cardState = todo.completed ? "completed" : todo.starred ? "starred" : "active";`
- [x] 2.2 Replace the two-way `cn()` on the card `<div>` with a three-way composition:
  - Base (unchanged): `"rounded-xl p-4 transition-colors group"`
  - `cardState === "completed"` → `"bg-primary hover-bg-primary-dark"`
  - `cardState === "starred"` → `"bg-warning-light"`
  - `cardState === "active"` → `"bg-surface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"`
- [x] 2.3 Confirm the checkbox, text, star button, and delete button branches remain driven by `todo.completed` alone (not `cardState`) — starred-active and active cards share the same inner treatments (checkbox, SemiBold text, hover-gated star + `XCircle` delete)
- [x] 2.4 Verify no hardcoded hex colors were introduced (grep the diff for `#` inside className strings)
- [x] 2.5 Verify no new imports or dependencies are needed — `bg-warning-light` is a pre-existing utility in `src/index.css`

## 3. Verification

- [x] 3.1 Run `yarn test` and confirm all tests pass (existing + new)
- [x] 3.2 Run `yarn lint` and fix any new warnings/errors
- [x] 3.3 Run `yarn dev` and manually verify on the Todo page:
  - Active non-starred rows: white card with gray border (unchanged)
  - Starred non-completed rows: pastel yellow card with no border
  - Completed rows: blue card (unchanged) regardless of `starred` state
  - Toggling the star on an active row switches the card between white and yellow
  - Toggling completion on a starred row switches the card from yellow to blue (and back when un-completed)
  - All three themes (light / dark / forest) render acceptably; forest starred cards use the light-mode yellow (accepted)
- [x] 3.4 Launch `code-reviewer` subagent on the diff before marking the change ready for archive
