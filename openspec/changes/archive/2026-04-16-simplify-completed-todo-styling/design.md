## Context

After three iterative visual changes, the Todo page has accumulated complex branching on the row render:

```tsx
const cardState = todo.completed ? "completed" : todo.starred ? "starred" : "active";
```

- **completed** → blue card, white text (`!text-on-primary`), `font-bold`, outlined-white checkbox, hidden star, always-visible `Trash2` in `bg-white/10` square.
- **starred** → yellow card (`bg-warning-light`), otherwise same as active.
- **active** → white card (`bg-surface`), dark text, `font-semibold`, neutral checkbox, hover-gated star + `XCircle` delete.

The user now wants completed rows to look almost identical to active rows — just with a checked checkbox and strikethrough text. The yellow starred treatment stays. Text needs to be readable across all themes (light/dark/forest).

The project exposes semantic theme-aware text utilities in `src/index.css`:
- `.text-primary` → `--color-text-primary`:
  - Light: `#111827` (near-black)
  - Dark: `#f9fafb` (near-white)
  - Forest: `#f0fdf4` (very light green-white)

This is the correct foreground for theme-adaptive text that sits on variable surfaces (white card, yellow card, dark card). It resolves via `[data-theme]` selectors, which work on all three themes — unlike Tailwind's `dark:` variant which only triggers under `dark` mode or `.dark` class (not `data-theme="forest"`).

## Goals / Non-Goals

**Goals:**
- Completed rows visually match active rows except for: (a) filled checkbox with white `<Check>`, and (b) `line-through` on the text. Nothing else differs.
- Active rows continue to use `bg-surface` + neutral border + hover shift.
- Starred rows (completed or not) continue to use `bg-warning-light` + no border + no hover shift.
- All rows show hover-gated star + `XCircle` delete buttons.
- Text uses the theme-semantic `.text-primary` utility on every row, guaranteeing contrast on white, yellow, and dark surfaces across light/dark/forest.
- Simplify the JSX: collapse the `cardState` three-way into a simpler expression (background depends only on `todo.starred`).

**Non-Goals:**
- No change to the per-card layout (`rounded-xl`, `p-4`, `space-y-3` list spacing, bordered active cards, no-border starred/completed cards).
- No change to behavior (handlers, filter, pagination, add-todo, loading, error).
- No change to the add-todo input, filter tabs, page header, or empty-state / pagination layouts.
- No change to the checkbox and action-button ARIA labels (`actions.complete`/`actions.incomplete`/`actions.star`/`actions.unstar`/`actions.delete`).
- No new tokens, no new utilities, no SCSS modules, no extracted components.
- No new focus ring, no contrast-audit task in the spec (the `.text-primary` choice IS the contrast solution).

## Decisions

### Decision 1: Card background depends ONLY on `todo.starred`, not on completion

**Rationale:** The user explicitly wants completed to no longer have its own background. A yellow card for a starred completed todo is acceptable (the user did not ask to preserve the "completed wins" priority from `starred-todo-yellow-background`). This simplifies the `cn()` from a three-way `cardState` to a boolean.

**Implementation:**
```tsx
cn(
  "rounded-xl p-4 transition-colors group",
  todo.starred
    ? "bg-warning-light"
    : "bg-surface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50",
)
```

The derived `cardState` variable is removed.

**Alternatives considered:**
- Keep "completed wins" (blue background when completed, yellow when starred+active, white otherwise) → rejected, the user explicitly wants no background change on completed rows.
- Yellow on starred+completed rows → **accepted** by this change; it's the natural fallout of "background keyed on `starred` only."

### Decision 2: Completed-row checkbox uses `bg-primary-600 border-primary-600` with white `<Check>`

**Rationale:** The checkbox needs to read as "checked" against any card surface (white, yellow, or any future color). A filled primary-color box with a white checkmark is a standard, high-contrast pattern and matches the project's original pre-`style-completed-todo-rows` implementation.

**Implementation:**
```tsx
cn(
  "shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
  todo.completed
    ? "bg-primary-600 border-primary-600"
    : "border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400",
)
```
The `<Check>` icon inside uses `text-white` (NOT `!text-on-primary` — the checkbox fill is blue, white is the correct, universally-legible icon color).

**Alternatives considered:**
- Keep outlined-white → rejected, invisible on a white card.
- Use `.text-primary` on the icon → rejected, `.text-primary` on a blue-filled checkbox gives dark icon on blue fill (poor contrast in light mode).

### Decision 3: Text uses theme-semantic `.text-primary` + `line-through` conditionally

**Rationale:** `.text-primary` is the project's theme-adaptive foreground utility and resolves correctly in all three themes on all card backgrounds (light on dark themes, dark on light themes). Dropping `text-gray-900 dark:text-gray-100` fixes the forest-theme gap (where `dark:` variant doesn't fire under `data-theme="forest"`).

**Implementation:**
```tsx
<span
  className={cn(
    "flex-1 font-semibold text-primary",
    todo.completed && "line-through",
  )}
>
  {todo.text}
</span>
```

The `font-bold` weight used previously for completed rows is dropped — strikethrough is a sufficient "done" signal.

**Alternatives considered:**
- Keep `font-bold` on completed → rejected, user asked for readability (not additional weight); strikethrough alone is the signal.
- Use `text-gray-900 dark:text-gray-100` → rejected, doesn't cover the forest theme correctly under the project's `data-theme` approach.
- Use `.text-secondary` for completed (muted "done" feel) → rejected, harms contrast on yellow cards; strikethrough already mutes perception.

### Decision 4: Restore hover-gated star + `XCircle` delete on ALL rows (active AND completed)

**Rationale:** The user explicitly said "no need to change star icon and delete icon to 1 delete icon." Completed rows should show the same action affordances as active rows. Star state (`todo.starred`) is already preserved in data, so completed+starred rows correctly show a filled star icon.

**Implementation:** Remove the `!todo.completed &&` guard around the hover-gated actions wrapper. Remove the separate completed-only "always-visible `<Trash2>` in `bg-white/10` square" block. Both actions (star and `XCircle` delete) now render on every row inside the same `opacity-0 group-hover:opacity-100` wrapper.

**Alternatives considered:**
- Keep the always-visible trash variant as a secondary option → rejected, user explicitly said one delete icon (matching active).
- Gate star on completed rows behind a "show on hover only if starred" condition → rejected, over-engineered.

### Decision 5: Remove `Trash2` import if unused elsewhere in the file

**Rationale:** After removing the always-visible `<Trash2>` block, the `Trash2` named import may become dead. The active-row delete is `XCircle`; the completed-row delete is now also `XCircle` (per Decision 4).

**Implementation:** Grep the file for `Trash2` after the edits; if the only usage is gone, drop it from the `lucide-react` import line.

**Alternatives considered:**
- Leave the dead import → rejected, lints as an unused import and adds no value.

### Decision 6: `Check` icon color is `text-white` (not `!text-on-primary` or `.text-primary`)

**Rationale:** Decision 2 makes the checkbox fill `bg-primary-600` (blue). A white checkmark is the universally correct choice for a white-on-primary tick glyph. `!text-on-primary` is also white on primary backgrounds, but using the plain `text-white` keeps the symbol legibly white without needing the `!` override. Either would work; picking `text-white` for simplicity.

**Alternatives considered:**
- `!text-on-primary` → works, but adds complexity with no benefit since the fill is always primary.

### Decision 7: Keep per-card layout, list spacing, empty state, and pagination unchanged

**Rationale:** The user did not ask to change the overall layout. `rounded-xl`, `p-4`, `space-y-3`, per-card borders (active only), empty-state `<div className="py-12 text-center">`, and `<Pagination>` inside `<div className="pt-4">` all stay as shipped in `redesign-todo-row-cards`.

### Decision 8: Add a forest-theme `.bg-warning-light` override in `src/index.css`

**Rationale:** `.bg-warning-light` has an explicit dark-theme override at `src/index.css:687` using `color-mix(in srgb, var(--color-warning-500) 15%, transparent)` but has no equivalent in the `[data-theme="forest"]` block. Without the override, the default (light-theme) `.bg-warning-light` applies in forest — a solid, opaque yellow that clashes with the dark forest surface (`--color-surface: #0f2817`) and compromises contrast with `.text-primary` (`#f0fdf4`). Adding a forest-specific `color-mix` override tints the surface instead of painting it opaque, preserving both the "yellow starred" visual cue and AA legibility with near-white `.text-primary` text.

**Implementation:** Inside the `[data-theme="forest"]` section of `src/index.css` (after the existing forest variable declarations, around line 727+, mirroring the dark-theme pattern at line 687):

```css
.bg-warning-light {
  background-color: color-mix(
    in srgb,
    var(--color-warning-500) 15%,
    transparent
  );
}
```

**Fallback percentage note:** 15% matches the dark-theme precedent exactly. If visual check reveals the tint is too faint on the near-black forest surface (`#0a1f0f` page / `#0f2817` surface), bump to 20% or 25%. Stay at or below 25% to keep `.text-primary` at `#f0fdf4` comfortably above 4.5:1 contrast (AA) when the yellow tint sits on the forest surface. Do NOT exceed 30% — above that, the yellow saturates enough that near-white text contrast starts to degrade.

**Alternatives considered:**
- Skip the override and live with the opaque light-theme yellow in forest → rejected, it breaks theme coherence and the text-contrast guarantee that motivates the `.text-primary` choice.
- Use a different tint source (e.g., `--color-warning-400` or `--color-warning-600`) → rejected, consistency with the dark-theme pattern (same variable, same percentage) keeps the override trivially auditable.
- Override `--color-warning-500` itself in the forest block → rejected, would affect every surface that uses warning-500 (text, icons, borders), not just the card tint.

## Risks / Trade-offs

- **[Risk] A starred completed row shows a yellow card** — some users may expect completion to override starred visually. Mitigation: the user's instruction was explicit about removing the completed background; yellow-on-starred-completed is a predictable fallout. If the user later changes their mind, we add a "completed wins" branch back in a small follow-up.
- **[Risk] Text contrast on the yellow card in dark theme** — `.bg-warning-light` in dark is `color-mix(var(--color-warning-500) 15%, transparent)` over a dark page background. `.text-primary` in dark resolves to `#f9fafb` (near-white). A translucent-yellow-over-dark surface with near-white text gives adequate contrast; verified semantically by matching the existing pattern used elsewhere for warning cards in this project.
- **[Resolved — Forest contrast]** The earlier risk of forest-theme text illegibility on the starred card is addressed by Decision 8: a forest-specific `.bg-warning-light` override (`color-mix 15%`) replaces the default opaque yellow with a tint that preserves AA contrast with `.text-primary` (`#f0fdf4`). Verification task 3.3 checks this in-browser.
- **[Risk] Existing 31-test suite assumes the old contract** — most tests in `Todo.completed-styling.test.tsx` need updates or removals (blue card, outlined-white checkbox, `!text-on-primary`, star-hidden-on-completed, always-visible trash, three-way mutex). Mitigation: `unit-test-writer` will rewrite the suite before implementation. The post-change test count will shrink.
- **[Risk] Dropping the "completed wins" three-way mutex** — the spec scenario "Three-way card state mutual exclusivity" from `starred-todo-yellow-background` becomes incorrect. Mitigation: the superseded scenario is called out in the Migration Notes section of the spec delta.
- **[Trade-off]** Yellow-on-starred-completed visually equates starred with completed-starred. Accepted trade-off per user request.
- **[Trade-off]** Using `.text-primary` everywhere means active and completed rows have the same text color (only `line-through` differs). This matches the user's "easier to read" goal at the cost of a slightly subtler "done" signal.

## Migration Plan

No user-facing migration. Standard build + deploy; rollback = revert the PR. The spec delta REMOVES and MODIFIES multiple scenarios added in the preceding three changes; when archived, `CLAUDE.md`'s "Existing specs" list gets one new numbered entry for this change. The three prior changes (`style-completed-todo-rows`, `redesign-todo-row-cards`, `starred-todo-yellow-background`) stay archived and documented; this change is a partial revert recorded in its own archive.
