## MODIFIED Requirements

### Requirement: Todo page with CRUD
The Todo page SHALL provide task management functionality using the `useTodos()` hook, supporting creating, reading, updating, and deleting todos with optimistic updates. Each todo row SHALL render as its own independent card with `rounded-xl` corners and `p-4 transition-colors group` base classes. Card background SHALL be determined by `todo.starred` only: when `todo.starred` is `true` the card SHALL apply `bg-warning-light` with NO `border` utility and NO `hover:bg-*` color-shift; when `todo.starred` is `false` the card SHALL apply `bg-surface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50`. `todo.completed` SHALL NOT affect the card background. Text SHALL render with `font-semibold text-primary` on every row (using the theme-semantic `.text-primary` utility from `src/index.css`) and SHALL add `line-through` when `todo.completed` is `true`. The checkbox `<button>` SHALL render as a filled primary square (`bg-primary-600 border-primary-600`) containing a white `<Check>` icon (`text-white`) when `todo.completed` is `true`, and as a transparent bordered square (`bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400`) with no icon when `todo.completed` is `false`. The hover-gated action wrapper (`opacity-0 group-hover:opacity-100 transition-opacity`) SHALL render on EVERY row (active and completed alike), containing a star `<button>` and a delete `<button>`; the delete button SHALL render a Lucide `<XCircle>` icon on every row. Rows SHALL be stacked with `space-y-3` and SHALL NOT use `divide-y`. Forest theme cards SHALL render with theme-appropriate text (`.text-primary` resolves to `#f0fdf4` in forest, which is legible on both white and yellow card surfaces); in forest theme, `.bg-warning-light` SHALL be overridden in `src/index.css` using `color-mix(in srgb, var(--color-warning-500) 15%, transparent)` (matching the dark-theme override pattern) so the yellow tint reads correctly on the dark forest surface while preserving AA contrast (≥ 4.5:1) with the row's `text-primary` text.

**Rationale for the rewrite:** This requirement supersedes the "completed row blue card / white text / font-bold / outlined checkbox / hidden star / always-visible Trash2" visual model introduced by `style-completed-todo-rows` and `redesign-todo-row-cards`, and it supersedes the "completed wins" three-way card-state mutual-exclusivity rule from `starred-todo-yellow-background`. The simplified model keys card background on `starred` alone, restores hover-gated star + `XCircle` delete on every row, unifies text to `.text-primary` + `font-semibold`, and signals completion solely via checkbox fill + `line-through`. Yellow-on-starred-completed is intentional (no completion priority). See Migration Notes below for a per-scenario mapping.

#### Scenario: Add new todo
- **WHEN** a user creates a new todo
- **THEN** it appears immediately in the list (optimistic) and is persisted via API

#### Scenario: Toggle todo completion
- **WHEN** a user toggles a todo's completion status
- **THEN** the UI updates immediately and the change is persisted; the checkbox switches between filled-primary-with-checkmark and transparent-bordered; the text toggles the `line-through` class; the card background does NOT change

#### Scenario: Per-card row layout (no shared divider)
- **WHEN** the todo list renders two or more todos
- **THEN** each row SHALL be rendered as its own card element with `rounded-xl`, the parent list container SHALL NOT use `divide-y`, and rows SHALL be separated by `space-y-3` vertical spacing

#### Scenario: Card background keyed on `starred` only
- **WHEN** any todo is rendered
- **THEN** its card className SHALL include `bg-warning-light` IF `todo.starred` is `true`, OR `bg-surface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50` IF `todo.starred` is `false`; the className SHALL NOT include `bg-primary` regardless of `todo.completed`

#### Scenario: Completed+starred todo card (no completion override)
- **WHEN** a todo is rendered with `completed: true` AND `starred: true`
- **THEN** its card className SHALL include `bg-warning-light` (yellow — starred wins), SHALL NOT include `bg-primary`, AND its text element SHALL include both `text-primary` and `line-through`

#### Scenario: Completed+non-starred todo card (white with strikethrough)
- **WHEN** a todo is rendered with `completed: true` AND `starred: false`
- **THEN** its card className SHALL include `bg-surface border border-gray-200 dark:border-gray-700`, SHALL NOT include `bg-primary` or `bg-warning-light`, AND its text element SHALL include both `text-primary` and `line-through`

#### Scenario: Checkbox filled primary on completed rows
- **WHEN** a todo is rendered with `completed: true`
- **THEN** the checkbox button className SHALL include `bg-primary-600` and `border-primary-600`, the `<Check>` icon SHALL be rendered inside, AND the icon SHALL have `text-white` in its className

#### Scenario: Checkbox bordered transparent on active rows
- **WHEN** a todo is rendered with `completed: false`
- **THEN** the checkbox button className SHALL include `bg-transparent`, `border-2`, and `border-gray-300 dark:border-gray-600`; NO `<Check>` icon SHALL be rendered

#### Scenario: Theme-semantic text color on all rows
- **WHEN** any todo row renders
- **THEN** its text element SHALL use the `text-primary` utility (NOT `text-gray-900 dark:text-gray-100` or `!text-on-primary`) AND SHALL use `font-semibold`

#### Scenario: Action buttons on all rows (hover-gated)
- **WHEN** any todo row renders (regardless of `completed` or `starred`)
- **THEN** an action wrapper with `opacity-0 group-hover:opacity-100 transition-opacity` classes SHALL be present; inside it SHALL render a star `<button>` (with `fill-current` on its icon when `todo.starred` is `true`, regardless of `todo.completed`) AND a delete `<button>` that renders a Lucide `<XCircle>` icon

#### Scenario: Forest theme starred card legibility
- **WHEN** a row is rendered in forest theme (`data-theme="forest"`) with `todo.starred: true`
- **THEN** its card SHALL use the forest-specific `.bg-warning-light` override defined in `src/index.css` (`color-mix(in srgb, var(--color-warning-500) 15%, transparent)`) that tints the card against the dark forest surface rather than painting an opaque yellow, AND the row's `text-primary` text (`#f0fdf4`) SHALL remain legible against that tinted surface with a contrast ratio of ≥ 4.5:1 (AA)

## Migration Notes

The following scenarios from prior archived changes are superseded by the Requirement rewrite above. Each entry states the origin change and which new scenario(s) replace it.

- **Completed todo row visual treatment (blue card, `!text-on-primary`, `font-bold`)** — from `style-completed-todo-rows`. Superseded by "Checkbox filled primary on completed rows" + "Completed+non-starred todo card (white with strikethrough)" + "Theme-semantic text color on all rows".
- **Completed row hover state (`hover-bg-primary-dark`)** — from `style-completed-todo-rows`. No blue card → no blue hover; the "Card background keyed on `starred` only" scenario and the Requirement statement cover hover implicitly.
- **Completed row action icon buttons (`text-on-primary` + `hover:bg-white/10`, hidden star, always-visible `Trash2`)** — from `style-completed-todo-rows` + `redesign-todo-row-cards`. Superseded by "Action buttons on all rows (hover-gated)".
- **Active row action icon buttons (separate from completed)** — from `style-completed-todo-rows`. The active-vs-completed distinction on action icons is gone; "Action buttons on all rows (hover-gated)" covers every row.
- **Completed row actions (star hidden, trash always visible)** — from `redesign-todo-row-cards`. Superseded by "Action buttons on all rows (hover-gated)".
- **Three-way card state mutual exclusivity** — from `starred-todo-yellow-background`. Mutual exclusivity collapses from three bg classes (`bg-primary` / `bg-warning-light` / `bg-surface`) to two (`bg-warning-light` / `bg-surface`); `bg-primary` SHALL never appear on a card. Superseded by "Card background keyed on `starred` only".
- **Starred-then-completed transition (completed wins)** — from `starred-todo-yellow-background`. Completed no longer overrides starred yellow; "Completed+starred todo card (no completion override)" codifies the new behavior. No dedicated transition scenario needed.
- **Completed-then-unstarred transition** — from `starred-todo-yellow-background`. Only star toggles change the card background; covered by "Card background keyed on `starred` only".
- **Completed row visual treatment (starred priority rule)** — from `starred-todo-yellow-background`. No "starred priority rule" exists anymore — starred always determines the card background regardless of completion. Covered by "Completed+starred todo card" and "Completed+non-starred todo card" scenarios.
