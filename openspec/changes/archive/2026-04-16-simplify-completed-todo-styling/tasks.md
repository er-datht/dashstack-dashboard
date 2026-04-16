## 1. Tests (TDD)

- [x] 1.1 Open `src/pages/Todo/__tests__/Todo.completed-styling.test.tsx` and inventory which existing tests will no longer hold under the new contract (anything asserting `bg-primary` on the card, `!text-on-primary` on text or check icon, `border-white` / `bg-transparent` on the completed-row checkbox, `font-bold` on completed text, `hover-bg-primary-dark`, hidden star on completed rows, always-visible `Trash2` button, three-way mutex between `bg-primary`/`bg-warning-light`/`bg-surface`, starred-then-completed transitions)
- [x] 1.2 Remove or rewrite the now-incorrect tests/describe-blocks; keep tests that remain valid (list parent has `space-y-3` and no `divide-y`, card uses `rounded-xl`, active-row card includes `bg-surface border border-gray-200 dark:border-gray-700`, starred card uses `bg-warning-light` with no border, hover-gated action wrapper, `XCircle` vs `Trash2` detection via Lucide class names)
- [x] 1.3 Add test: completed-non-starred card — for `{ completed: true, starred: false }`, assert card className includes `bg-surface` + `border` + `border-gray-200 dark:border-gray-700` and does NOT include `bg-primary` or `bg-warning-light`
- [x] 1.4 Add test: completed-starred card — for `{ completed: true, starred: true }`, assert card className includes `bg-warning-light` and does NOT include `bg-primary`; card does NOT include `border` as a standalone utility
- [x] 1.5 Add test: checkbox filled-primary on completed rows — for `{ completed: true }`, assert the checkbox `<button>` className includes `bg-primary-600` and `border-primary-600`, and the rendered `<Check>` icon's className includes `text-white` (not `!text-on-primary`)
- [x] 1.6 Add test: checkbox transparent-bordered on active rows — for `{ completed: false }`, assert the checkbox `<button>` className includes `bg-transparent`, `border-2`, `border-gray-300`, and `dark:border-gray-600`; assert NO `<Check>` icon rendered (no `.lucide-check` descendant of the checkbox)
- [x] 1.7 Add test: text uses `.text-primary` + `font-semibold` on all rows — for each of `{completed: false, starred: false}`, `{completed: true, starred: false}`, `{completed: false, starred: true}`, `{completed: true, starred: true}`, assert the text span className includes `text-primary` and `font-semibold`; assert className does NOT include `text-gray-900`, `dark:text-gray-100`, `!text-on-primary`, or `font-bold`
- [x] 1.8 Add test: `line-through` only on completed rows — assert text span className includes `line-through` for `{completed: true}` cases; does NOT include `line-through` for `{completed: false}` cases
- [x] 1.9 Add test: hover-gated action wrapper present on every row — for all four `{completed, starred}` combinations, assert the action wrapper with `opacity-0` + `group-hover:opacity-100` exists as an ancestor of the star and delete buttons
- [x] 1.10 Add test: every row has BOTH star button and delete button, and the delete icon is `XCircle` on every row — for all four `{completed, starred}` combinations, assert `queryByRole('button', { name: /actions\.(star|unstar)/ })` is non-null AND the delete button's descendant includes `.lucide-circle-x` (NOT `.lucide-trash-2`)
- [x] 1.11 Add test: no "always-visible trash" button exists anywhere in the DOM for any row — assert `container.querySelector('.lucide-trash-2')` is null for all four combinations
- [x] 1.12 Run `yarn test src/pages/Todo/__tests__/Todo.completed-styling.test.tsx --run` and confirm the new/updated tests fail against current implementation (TDD red). Mark `[x]` only if failures align with the new contract (not unrelated setup errors)

## 2. Implementation

- [x] 2.1 In `src/pages/Todo/index.tsx`, remove the derived `cardState` variable and collapse the three-way `cn()` on the card `<div>` into a two-way composition driven by `todo.starred` only: `bg-warning-light` when starred, otherwise `bg-surface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50`. Preserve base classes `rounded-xl p-4 transition-colors group`
- [x] 2.2 Update the checkbox `<button>` `cn()` so the completed branch becomes `bg-primary-600 border-primary-600` (reverting from `bg-transparent border-white`); keep the active branch (`border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400`) unchanged; keep `border-2` in the base classes
- [x] 2.3 Update the `<Check>` icon's className from `!text-on-primary` (or `text-white` — whichever the current file has) to `text-white` (plain, no `!` modifier). It still renders only when `todo.completed` is `true`
- [x] 2.4 Update the todo text `<span>`: replace `font-semibold text-gray-900 dark:text-gray-100` (active branch) and `font-bold !text-on-primary line-through` (completed branch) with a single `cn()` composition: base `flex-1 font-semibold text-primary`, conditional `todo.completed && "line-through"`
- [x] 2.5 Remove the `!todo.completed &&` guard around the hover-gated action-buttons wrapper so it renders on every row
- [x] 2.6 Remove the dedicated completed-only "always-visible `<Trash2>` in `bg-white/10` rounded square" button block entirely
- [x] 2.7 Inside the active-row delete button (now shared by all rows), ensure the icon remains `<XCircle className="w-5 h-5" />`
- [x] 2.8 Remove unused color-adjustment classes inside the star and delete buttons that were added for the blue card (e.g., `text-on-primary` and `hover:bg-white/10` variants). The star button keeps its original active-row styling (`text-gray-400 dark:text-gray-500 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700`); the delete button keeps its original active-row styling (`text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`)
- [x] 2.9 Remove `Trash2` from the `lucide-react` import if it is no longer referenced in the file
- [x] 2.10 Verify no hardcoded hex colors were introduced (grep the diff for `#` inside className strings)
- [x] 2.11 Open `src/index.css`, locate the `[data-theme="forest"]` block (starts around line 727), and add a `.bg-warning-light` override inside that block using `color-mix(in srgb, var(--color-warning-500) 15%, transparent)` — mirroring the existing dark-theme override at line 687. Place the new rule alongside other forest-specific utility overrides (after the variable declarations). Do NOT modify the light-theme default or the dark-theme override. If a visual spot-check in task 3.3 shows the 15% tint is too faint against the forest surface, raise to 20% or 25% (stay ≤ 25% to preserve AA contrast with `.text-primary` at `#f0fdf4`).
- [x] 2.12 Verify the forest override doesn't leak into other themes — the rule MUST be nested inside the `[data-theme="forest"]` selector (not at `:root` or in the `[data-theme="dark"]` block).

## 3. Verification

- [x] 3.1 Run `yarn test` and confirm all tests pass
- [x] 3.2 Run `yarn lint` and fix any new warnings/errors (specifically any unused-import warning from 2.9)
- [x] 3.3 Run `yarn dev` and manually verify on the Todo page:
  - Active non-starred rows: white card with gray border
  - Starred (active or completed) rows: yellow card, no border
  - Completed rows: same card background as the equivalent active row (white if not starred, yellow if starred), PLUS filled primary checkbox with white checkmark, PLUS strikethrough text
  - Star and XCircle delete buttons appear on hover for EVERY row
  - No standalone `Trash2` icon visible anywhere in the list
  - Text is legible on white card and yellow card in all three themes (light/dark/forest)
  - Active-row hover still shifts to gray; starred-row hover stays yellow (no color shift)
  - **Forest theme starred rows specifically**: toggle `data-theme="forest"` (via theme switcher), confirm starred rows show a tinted-yellow card (NOT an opaque yellow swatch that clashes with the dark surface) and the row's text (`.text-primary` → `#f0fdf4`) remains fully legible against the tinted card. If the yellow tint looks too faint/washed-out, revisit task 2.11 and raise the percentage to 20% or 25%.
- [x] 3.4 Launch `code-reviewer` subagent on the diff before marking the change ready for archive
