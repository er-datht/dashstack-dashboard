## Why

After three successive visual changes on the Todo page (`style-completed-todo-rows`, `redesign-todo-row-cards`, `starred-todo-yellow-background`), completed rows diverge visually from active rows in several ways: blue (`bg-primary`) card background, outlined-white checkbox, `!text-on-primary` white text with `font-bold`, hidden star button, and a single always-visible `Trash2` delete button in a translucent-white square. The user finds this too divergent — they want completed rows to look like normal active rows with only the strikethrough + filled checkbox as the "done" signal. The user also reports text-color readability issues across themes (notably yellow starred cards in dark/forest where the current `text-gray-900 dark:text-gray-100` may not switch correctly under the project's `data-theme` approach).

## What Changes

- **Completed row card background**: remove `bg-primary hover-bg-primary-dark`. Completed rows now inherit the same card background as active rows (white via `bg-surface` when not starred, or yellow via `bg-warning-light` when starred).
- **Completed row checkbox**: revert from outlined-white (`bg-transparent border-2 border-white`) back to the original filled-primary style (`bg-primary-600 border-primary-600` with a white `<Check>` icon inside). This reads as "checked" on any card background.
- **Completed row text**: revert from `font-bold !text-on-primary line-through` to `text-primary line-through` using the theme-semantic `.text-primary` utility. Use `font-semibold` for both active and completed rows (consistent weight; "done" is signaled by strikethrough alone).
- **Completed row action icons**: restore BOTH the star button AND the delete button on completed rows, matching the active-row treatment — hover-gated (`opacity-0 group-hover:opacity-100`), star with `fill-current` when starred, delete as Lucide `<XCircle>`. Remove the "always-visible `<Trash2>` in `bg-white/10` rounded square" variant added in `redesign-todo-row-cards`.
- **Active row text color**: change from `text-gray-900 dark:text-gray-100` to the semantic `.text-primary` utility. This fixes contrast in the forest theme (where `dark:` variants don't match `data-theme="forest"`) and guarantees correct foreground on yellow starred cards across all three themes.
- **Starred yellow card background**: preserved exactly as shipped in `starred-todo-yellow-background`. Only the text color on starred cards changes (moves to `text-primary`).
- **Card background states collapse to 2**: starred (yellow) vs. not-starred (white). Completion no longer affects the card background — it only affects the checkbox + text strikethrough.
- **Text weight collapses to 1**: `font-semibold` for both states. The previous `font-bold` on completed rows is dropped.
- **Forest-theme `.bg-warning-light` override**: add a forest-specific `.bg-warning-light` CSS utility override in `src/index.css` inside the `[data-theme="forest"]` block (around line 727+) so the yellow starred card tints correctly against the dark forest surface. Implementation uses `color-mix(in srgb, var(--color-warning-500) 15%, transparent)` — matching the existing dark-theme override pattern at line 687 — and preserves AA contrast with the forest `.text-primary` (`#f0fdf4`). If 15% is visually too weak against the near-black forest surface, 20–25% is acceptable.
- **Behavior unchanged**: all handlers, filter/pagination/add/error/loading behavior untouched.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `remaining-pages`: the "Todo page with CRUD" requirement is rewritten to reflect the simplified visual model (card background keyed on `starred` only; completion keyed on checkbox fill + strikethrough only; all rows show hover-gated star + `XCircle` delete). The previous REMOVED "Row divider preserved" scenario stays removed (no reversal). Multiple scenarios added by `style-completed-todo-rows`, `redesign-todo-row-cards`, and `starred-todo-yellow-background` are REMOVED or MODIFIED here with explicit migration notes.

## Impact

- **Code**: `src/pages/Todo/index.tsx` — `cn()` compositions simplified on the card, checkbox, text, and action-buttons; the "always-visible `<Trash2>`" block deleted; imports trimmed if `Trash2` becomes unused.
- **Styles**: Two file touches. (1) Tailwind utility classes only in `src/pages/Todo/index.tsx`, via `cn()`. Uses the existing theme-aware `.text-primary` utility (defined at `src/index.css:245` light, `:603` dark, `:751` forest — `--color-text-primary` resolves correctly per theme). (2) `src/index.css` — add a `.bg-warning-light` override inside the `[data-theme="forest"]` block using `color-mix(in srgb, var(--color-warning-500) 15%, transparent)` so starred cards tint correctly against the dark forest surface. No new tokens, no new SCSS modules.
- **Themes**: `.text-primary` resolves to near-black in light (`#111827`), near-white in dark (`#f9fafb`), and near-white-green in forest (`#f0fdf4`) — contrast is adequate on both white (`bg-surface`) and yellow (`bg-warning-light`) card surfaces across all three themes. With the new forest override, the yellow tint is recognizable and the row's `.text-primary` text meets AA contrast (≥ 4.5:1) on the tinted forest surface.
- **Tests**: the existing `Todo.completed-styling.test.tsx` suite (31 tests) is rewritten. Many assertions from the prior changes become incorrect under the simplified model — they are removed or updated. New assertions cover the simplified contract.
- **Imports**: `Trash2` is no longer needed on the row (it was only used in the deleted always-visible variant). Remove it from the `lucide-react` import if it is not used elsewhere in the file.
- **Relationship to prior changes**: this change is a partial revert of decisions from:
  - `style-completed-todo-rows`: reverts the blue card, outlined-white checkbox, `!text-on-primary` text, `text-on-primary` action-icon colors, `hover:bg-white/10` action-button hovers (those only existed because of the blue card — moot once the blue card is gone).
  - `redesign-todo-row-cards`: reverts the "hide star on completed rows" + "always-visible `Trash2`-in-square" + "`font-bold` completed text" decisions. Keeps the per-card layout (`rounded-xl`, `space-y-3`, per-card borders, `XCircle` active delete, empty-state and pagination outside the list).
  - `starred-todo-yellow-background`: keeps the yellow starred card. Only the text color on starred-active rows changes (moves to `.text-primary`).
- **No API, routing, or state changes.**
