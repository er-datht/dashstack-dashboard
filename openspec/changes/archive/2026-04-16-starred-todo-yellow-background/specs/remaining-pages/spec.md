## MODIFIED Requirements

### Requirement: Todo page with CRUD
The Todo page SHALL provide task management functionality using the `useTodos()` hook, supporting creating, reading, updating, and deleting todos with optimistic updates. Each todo row SHALL render as its own independent card with `rounded-xl` corners, using one of three mutually exclusive card states: (1) **completed** — `bg-primary hover-bg-primary-dark` (no `border` utility), Bold text with `!text-on-primary line-through`, outlined-white checkbox with `!text-on-primary` checkmark, star button hidden, always-visible `Trash2`-in-translucent-white-square delete button; (2) **starred-active** — `bg-warning-light` (no `border` utility, no hover color shift), active-row text/checkbox/star/delete treatment as in the non-starred active case; (3) **active** — `bg-surface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50`, SemiBold text in default foreground without `line-through`, neutral outlined checkbox, hover-gated star + `XCircle` delete buttons. States are mutually exclusive — a todo with `completed: true` SHALL render as "completed" regardless of `starred`; only when `completed: false` does `starred` determine whether the card is starred-active (yellow) or active (white). Rows SHALL be stacked using `space-y-3` with NO `divide-y`. Forest theme completed cards SHALL render green because `bg-primary` resolves to green there — accepted behavior. Forest theme starred cards inherit the light-mode yellow (`#fffbeb`) — accepted behavior.

#### Scenario: Add new todo
- **WHEN** a user creates a new todo
- **THEN** it appears immediately in the list (optimistic) and is persisted via API

#### Scenario: Toggle todo completion
- **WHEN** a user toggles a todo's completion status
- **THEN** the UI updates immediately and the change is persisted

#### Scenario: Per-card row layout (no shared divider)
- **WHEN** the todo list renders two or more todos
- **THEN** each row SHALL be rendered as its own card element with `rounded-xl`, the parent list container SHALL NOT use `divide-y`, and rows SHALL be separated by `space-y-3` vertical spacing

#### Scenario: Active (non-starred, non-completed) todo card visual treatment
- **WHEN** a todo is rendered with `completed: false` AND `starred: false`
- **THEN** its card SHALL apply `bg-surface border border-gray-200 dark:border-gray-700 rounded-xl` with hover `hover:bg-gray-50 dark:hover:bg-gray-700/50`; its checkbox SHALL render with `bg-transparent border-2 border-gray-300 dark:border-gray-600` and no `<Check>` icon; its text SHALL render `font-semibold` in the default foreground color without `line-through`

#### Scenario: Starred-active todo card visual treatment
- **WHEN** a todo is rendered with `completed: false` AND `starred: true`
- **THEN** its card SHALL apply `bg-warning-light rounded-xl` with NO standalone `border` utility on the card container AND NO `hover:bg-*` color-shift utility; its checkbox, star button, text, and delete button SHALL remain identical to the non-starred active-card treatment (SemiBold text, hover-gated star + `XCircle` delete, neutral checkbox)

#### Scenario: Completed todo card visual treatment (starred priority rule)
- **WHEN** a todo is rendered with `completed: true` (regardless of whether `starred` is `true` or `false`)
- **THEN** its card SHALL apply `bg-primary hover-bg-primary-dark rounded-xl` with NO `border` utility AND SHALL NOT apply `bg-warning-light`; its text SHALL render with `font-bold !text-on-primary line-through`; the star button SHALL NOT be rendered; an always-visible `Trash2` delete button SHALL be rendered with `bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors`

#### Scenario: Three-way card state mutual exclusivity
- **WHEN** inspecting any todo row's card container className
- **THEN** exactly one of `{bg-primary, bg-warning-light, bg-surface}` SHALL be present in the className, never two or more; `bg-primary` SHALL appear only when `completed: true`; `bg-warning-light` SHALL appear only when `completed: false AND starred: true`; `bg-surface` SHALL appear only when `completed: false AND starred: false`

#### Scenario: Starred-then-completed transition (completed wins)
- **WHEN** a todo with `starred: true, completed: false` is re-rendered with `starred: true, completed: true`
- **THEN** its card className SHALL switch from `bg-warning-light` to `bg-primary` (blue); the `bg-warning-light` class SHALL NO LONGER be present on the card container

#### Scenario: Completed-then-unstarred transition
- **WHEN** a todo with `completed: true, starred: true` is re-rendered with `completed: false, starred: true`
- **THEN** its card className SHALL switch from `bg-primary` to `bg-warning-light`; the star button SHALL become visible again (hover-gated)

#### Scenario: Active row action icons (hover-gated, XCircle delete)
- **WHEN** a todo is rendered with `completed: false` (regardless of `starred`) and the user hovers the card
- **THEN** the card SHALL reveal a star `<button>` and a delete `<button>`; the delete button SHALL render a Lucide `<XCircle>` icon; both buttons SHALL remain hover-gated (`opacity-0 group-hover:opacity-100`)

#### Scenario: Completed row actions (star hidden, trash always visible)
- **WHEN** a todo is rendered with `completed: true`
- **THEN** the star `<button>` SHALL NOT be rendered; a delete `<button>` SHALL be rendered always-visible (not inside a hover-gated wrapper) with `bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors` and a Lucide `<Trash2>` icon using `text-on-primary`

#### Scenario: Pagination rendered outside list card
- **WHEN** there are more todos than the page size
- **THEN** the `<Pagination>` element SHALL render below the list with no surrounding card wrapper

#### Scenario: Empty state rendered outside list card
- **WHEN** the filtered todo list is empty
- **THEN** the empty state SHALL render in a simple container with no bordered card wrapper
