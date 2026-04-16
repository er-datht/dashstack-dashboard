## Why

On the redesigned Todo page, a starred-but-not-completed todo is only distinguished from a non-starred active todo by its yellow star icon — the card background is identical. The user wants the starred state to be visually louder so starred items stand out at a glance in a long list. The project already exposes a theme-aware warning-color token (`--color-warning-50` → `#fffbeb` in light, and a color-mixed translucent variant in dark) via the `.bg-warning-light` utility — perfect for a subtle yellow card background.

## What Changes

- Add a third card-background state to the Todo row:
  - Completed (`todo.completed === true`): **blue** (`bg-primary` with `hover-bg-primary-dark`) — unchanged.
  - Starred active (`todo.starred === true && todo.completed === false`): **yellow** — card uses `bg-warning-light` with no standalone `border` utility (the yellow fill is the visual delimiter). No hover color shift on starred cards.
  - Non-starred active (`!todo.starred && !todo.completed`): **white** (`bg-surface` with `border border-gray-200 dark:border-gray-700` and `hover:bg-gray-50 dark:hover:bg-gray-700/50`) — unchanged.
- Starred-completed priority: when both `starred` AND `completed` are true, the **completed blue wins** (completed state is stronger than starred).
- Text, checkbox, star/delete action buttons, and the always-visible trash on completed rows are all unchanged — only the card's background/border composition changes for the starred-active branch.
- No behavior changes: toggle, star, delete, filter, pagination, add-todo, loading, and error banner are untouched.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `remaining-pages`: the "Todo page with CRUD" requirement adds/updates scenarios covering the three-way card-background matrix (completed vs. starred-active vs. active), including the starred+completed priority rule.

## Impact

- **Code**: `src/pages/Todo/index.tsx` only — the conditional `cn()` on the row `<div>` now branches three ways instead of two.
- **Styles**: Tailwind utility classes only via `cn()`. Reuses the existing theme-aware `.bg-warning-light` utility from `src/index.css`. No new SCSS modules, no new design tokens.
- **Themes**: `.bg-warning-light` is already defined for light (`#fffbeb`) at `src/index.css:279` and for dark (a translucent yellow via `color-mix`) at `src/index.css:687`. Forest theme inherits from the light definition by default; the forest theme will render starred cards in the light-yellow, which is visually acceptable on the green-accented forest surface.
- **Tests**: add unit tests for the three-way matrix (completed blue wins; starred-active yellow; default white). Extend the existing `Todo.completed-styling.test.tsx` or add a new sibling file.
- **Relationship to prior changes**: `style-completed-todo-rows` introduced blue completed rows. `redesign-todo-row-cards` introduced per-card row layout, `XCircle` vs `Trash2` icons, hidden star on completed, font-weight differentiation. This change adds ONE more branch to the existing `cn()` on the card background; no other decisions are affected.
- **No API, routing, or state changes.**
