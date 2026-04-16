## Why

The Todo page currently renders every row inside a shared white card with `divide-y` separators between rows. The Figma reference (`figma.com/design/gbf5rpvxRabUueoXQCkQk8` node `5:7779`) calls for a different visual rhythm: each todo row is its own discrete bordered card with rounded corners and a small vertical gap between rows. The reference also changes icons (active-row delete becomes an "X-in-circle", completed-row delete becomes a trash icon) and hides the star button entirely on completed rows. Aligning the page with the Figma design gets us visual parity with the product intent.

## What Changes

- **Row container**: each todo row renders as its own card with its own border, rounded corners, and background — NOT inside a shared `divide-y` container. Rows are stacked with a small vertical gap (not a shared divider line).
- **Active row card**: background `bg-surface` (theme-aware white), border (`border border-gray-200 dark:border-gray-700`), rounded (`rounded-xl` ≈ 12px), text remains SemiBold (600).
- **Completed row card**: full-bleed `bg-primary` with matching `rounded-xl`, no visible border, text is Bold (700) and `!text-on-primary`. (Carries forward the blue-row decisions from the previous `style-completed-todo-rows` change, now applied as a per-card background instead of a full-width row.)
- **Active-row delete icon**: change from Lucide `Trash2` to Lucide `XCircle` (the "X-inside-circle" affordance shown in the Figma). Keep the existing action-icon layout (star + delete on the right, visible only on hover).
- **Completed-row actions**: **star button is hidden**. Only the delete button renders on completed rows, using a Lucide `Trash2` icon inside a translucent white rounded square (per Figma's filled-icon-in-square affordance). Icon color `text-on-primary`; button hover `hover:bg-white/10`.
- **Completed-row actions visibility**: the delete button on completed rows is **always visible** (not hover-gated) — matches the Figma reference where the trash button is rendered inside the blue card regardless of hover.
- **List container**: the outer `bg-white ... border ... divide-y ...` wrapper is removed (or its `divide-y` and inner background are removed). Rows space themselves with `space-y-*` or a flex `gap-*`. Empty state, pagination, and error banner layouts stay on the page but outside the old shared card.
- **Behavior unchanged**: toggle, star, delete, filter, pagination, add-todo, loading, and error handling are untouched. All 3 themes remain supported.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `remaining-pages`: the "Todo page with CRUD" requirement gains/updates scenarios covering per-card row layout, active-row `XCircle` delete icon, completed-row star hidden, completed-row trash action always visible, and SemiBold/Bold text-weight differentiation.

## Impact

- **Code**: `src/pages/Todo/index.tsx` only — row markup, container, icon imports, action buttons. No other files.
- **Icons**: add `XCircle` to the existing `lucide-react` imports. `Trash2` is kept for the completed-row delete button. No new npm dependencies.
- **Styles**: Tailwind utility classes only via `cn()`. No new SCSS, no new design tokens. Theme-aware utilities (`bg-primary`, `hover-bg-primary-dark`, `!text-on-primary`, `text-on-primary`, `bg-surface`, neutral borders).
- **Tests**: update and add unit tests for per-card container classes, the `XCircle` vs `Trash2` icon swap (active vs completed), the removal of the star button on completed rows, and always-visible trash on completed rows. The existing `Todo.completed-styling.test.tsx` contract from the previous change will be updated to reflect: (a) removed assertions for the star on completed rows, (b) new `XCircle` active-row delete assertion, (c) `Trash2` completed-row delete assertion, (d) no per-row `divide-y` parent.
- **Relationship to prior change**: `style-completed-todo-rows` introduced the blue-row + outlined-white-checkbox + `!text-on-primary` text for completed rows. This change keeps those decisions but reshapes the row into an independent card and updates the action-icon set. No previous decisions are reverted; several are refined (e.g., completed-row star button → removed rather than restyled).
- **No API, routing, or state changes.**
