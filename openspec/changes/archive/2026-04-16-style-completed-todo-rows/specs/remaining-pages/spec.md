## MODIFIED Requirements

### Requirement: Todo page with CRUD
The Todo page SHALL provide task management functionality using the `useTodos()` hook, supporting creating, reading, updating, and deleting todos with optimistic updates. Completed todos SHALL be visually differentiated from active todos via a full-bleed primary-blue row background, an outlined white checkbox containing a `!text-on-primary` checkmark, `!text-on-primary` strikethrough text, and action icon buttons (star, delete) that use `text-on-primary` icons with a `hover:bg-white/10` button-hover background, using theme-aware utilities so the treatment adapts to light, dark, and forest themes. In the forest theme, `bg-primary` resolves to green, so completed rows SHALL render with a green background in forest — this is accepted behavior.

#### Scenario: Add new todo
- **WHEN** a user creates a new todo
- **THEN** it appears immediately in the list (optimistic) and is persisted via API

#### Scenario: Toggle todo completion
- **WHEN** a user toggles a todo's completion status
- **THEN** the UI updates immediately and the change is persisted

#### Scenario: Completed todo row visual treatment
- **WHEN** a todo is rendered with `completed: true`
- **THEN** its row container SHALL apply the theme-aware `bg-primary` utility full-bleed (no inner pill or added border radius), its completion checkbox SHALL be rendered with `bg-transparent` fill, `border-2 border-white`, and a `<Check>` icon using the `!text-on-primary` utility at Lucide's default stroke width, and its text SHALL be rendered with the `!text-on-primary` utility combined with `line-through`

#### Scenario: Active todo row visual treatment
- **WHEN** a todo is rendered with `completed: false`
- **THEN** its row SHALL retain the default surface background and the existing `hover:bg-gray-50 dark:hover:bg-gray-700/50` hover classes, its checkbox SHALL remain unfilled with the existing `border-2 border-gray-300 dark:border-gray-600` classes and no `<Check>` icon rendered, and its text SHALL use the default foreground color without `line-through`

#### Scenario: Completed row hover state
- **WHEN** the user hovers a completed todo row
- **THEN** the row background SHALL transition to a darker shade of primary using the `hover-bg-primary-dark` utility rather than the `hover:bg-gray-50 dark:hover:bg-gray-700/50` used for active rows, and the existing `transition-colors` animation SHALL be preserved

#### Scenario: Completed row action icon buttons
- **WHEN** a todo is rendered with `completed: true` and the user hovers the row to reveal the star and delete icon buttons
- **THEN** each action icon button SHALL apply the `text-on-primary` utility to its icon and `hover:bg-white/10` to its own button-hover background, so the icons remain legible against the blue row; if the star is in the starred state, its icon SHALL retain `fill-current` so it renders as a filled icon in the `text-on-primary` color

#### Scenario: Active row action icon buttons (unchanged)
- **WHEN** a todo is rendered with `completed: false`
- **THEN** the star and delete icon buttons SHALL retain their existing (pre-change) color and hover styles unchanged

#### Scenario: Row divider preserved
- **WHEN** the list renders multiple todos regardless of completion state
- **THEN** the existing `divide-y divide-gray-200 dark:divide-gray-700` row dividers SHALL be preserved on the list container
