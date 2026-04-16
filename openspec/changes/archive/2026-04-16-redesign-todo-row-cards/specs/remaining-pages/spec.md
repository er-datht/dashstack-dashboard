## MODIFIED Requirements

### Requirement: Todo page with CRUD
The Todo page SHALL provide task management functionality using the `useTodos()` hook, supporting creating, reading, updating, and deleting todos with optimistic updates. Each todo row SHALL render as its own independent card with its own background, border (when applicable), and `rounded-xl` corners; rows SHALL be stacked with a vertical gap (`space-y-3`) and SHALL NOT share a `divide-y` container. Active todo cards SHALL use `bg-surface` with a neutral border (`border-gray-200 dark:border-gray-700`) and SemiBold text (`font-semibold`). Completed todo cards SHALL use `bg-primary` with `hover-bg-primary-dark`, no visible border, Bold text (`font-bold`) combined with the `!text-on-primary` utility and `line-through`, and SHALL render an outlined-white checkbox containing a `!text-on-primary` checkmark. Active rows SHALL show a star button and an `XCircle` delete button on hover only; completed rows SHALL hide the star button entirely and SHALL render a `Trash2` delete button inside a translucent-white rounded square that is visible at all times (not hover-gated). Forest theme completed cards SHALL render green because `bg-primary` resolves to green there — accepted behavior.

#### Scenario: Add new todo
- **WHEN** a user creates a new todo
- **THEN** it appears immediately in the list (optimistic) and is persisted via API

#### Scenario: Toggle todo completion
- **WHEN** a user toggles a todo's completion status
- **THEN** the UI updates immediately and the change is persisted

#### Scenario: Per-card row layout (no shared divider)
- **WHEN** the todo list renders two or more todos
- **THEN** each row SHALL be rendered as its own card element (its own `<div>` with its own `bg-*`, `rounded-xl`, and — for active rows — `border`), and the parent list container SHALL NOT use `divide-y` or any shared-divider utility; rows SHALL be separated by vertical spacing using `space-y-3` (or an equivalent utility providing the same 12px gap)

#### Scenario: Active todo card visual treatment
- **WHEN** a todo is rendered with `completed: false`
- **THEN** its card SHALL apply `bg-surface border border-gray-200 dark:border-gray-700 rounded-xl` with hover `hover:bg-gray-50 dark:hover:bg-gray-700/50`; its checkbox SHALL render with `bg-transparent border-2 border-gray-300 dark:border-gray-600` and no `<Check>` icon; its text SHALL render with `font-semibold` in the default foreground color (`text-gray-900 dark:text-gray-100`) without `line-through`

#### Scenario: Completed todo card visual treatment
- **WHEN** a todo is rendered with `completed: true`
- **THEN** its card SHALL apply `bg-primary hover-bg-primary-dark rounded-xl` with NO `border` utility; its checkbox SHALL render with `bg-transparent border-2 border-white` and a `<Check>` icon using `!text-on-primary` at Lucide's default stroke width; its text SHALL render with `font-bold !text-on-primary line-through`

#### Scenario: Active row action icons (hover-gated, XCircle delete)
- **WHEN** a todo is rendered with `completed: false` and the user hovers the card
- **THEN** the card SHALL reveal a star `<button>` and a delete `<button>`; the delete button SHALL render a Lucide `<XCircle>` icon (NOT `<Trash2>`); both buttons SHALL remain hover-gated (`opacity-0 group-hover:opacity-100`) with their existing pre-change color and hover styles (gray icon, yellow-tinted star hover, red-tinted delete hover)

#### Scenario: Completed row actions (star hidden, trash always visible)
- **WHEN** a todo is rendered with `completed: true`
- **THEN** the star `<button>` SHALL NOT be rendered in the DOM at all (conditional JSX, not a CSS-hidden element); a delete `<button>` SHALL be rendered and SHALL be always visible (NOT inside a `opacity-0 group-hover:opacity-100` wrapper); the delete button SHALL use `bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors`; its icon SHALL be a Lucide `<Trash2>` with `text-on-primary` color class

#### Scenario: Starred-then-completed state preservation
- **WHEN** a todo with `starred: true` is toggled to `completed: true`
- **THEN** the star button SHALL be removed from the DOM, the underlying `starred` state SHALL be preserved in the data model, and toggling the todo back to `completed: false` SHALL re-render the star button in its starred (filled) state

#### Scenario: Pagination rendered outside list card
- **WHEN** there are more todos than the page size
- **THEN** the `<Pagination>` element SHALL render below the list in its own container (e.g., `<div class="pt-4">`) and SHALL NOT be wrapped in the removed shared list card

#### Scenario: Empty state rendered outside list card
- **WHEN** the filtered todo list is empty
- **THEN** the empty state (icon + message) SHALL render in a simple container (e.g., `<div class="py-12 text-center">`) with no bordered card wrapper

## Migration Notes

The "Row divider preserved" scenario (added by `style-completed-todo-rows`) is superseded by the new "Per-card row layout (no shared divider)" scenario in the MODIFIED Requirement above. The shared `divide-y` container has been replaced by per-card rows with `space-y-3` spacing. No data migration. No API or state change. Tests that asserted `divide-y` presence on the list container MUST be updated to assert `space-y-3` presence instead.
