## ADDED Requirements

### Requirement: Active filter button text visibility
The active filter button text SHALL be visible as white text on the primary background color across all 3 themes (light, dark, forest). The system SHALL use `!text-on-primary` to override the CSS cascade layer conflict.

#### Scenario: User clicks a filter button
- **WHEN** user clicks any filter button ("All", "Active", "Completed", "Starred")
- **THEN** the active button SHALL display white text on a primary-colored background, and the text SHALL remain visible

#### Scenario: Filter buttons across themes
- **WHEN** the user switches between light, dark, and forest themes
- **THEN** the active filter button text SHALL remain visible (white on primary) in all themes

### Requirement: Inactive filter button theme awareness
Inactive filter buttons SHALL use theme-aware utility classes (`bg-surface-muted`, `text-secondary`, `hover-bg-muted`) instead of hardcoded dark-mode variants.

#### Scenario: Inactive buttons adapt to theme
- **WHEN** the user views the Todo page in any theme
- **THEN** inactive filter buttons SHALL display with theme-appropriate background and text colors without requiring manual `dark:` class prefixes

### Requirement: Add Task button text visibility
The "Add Task" button text SHALL be visible using `!text-on-primary` and theme-aware background classes (`bg-primary`, `hover-bg-primary-dark`).

#### Scenario: Add Task button renders with visible text
- **WHEN** the Todo page loads
- **THEN** the "Add Task" button SHALL display white text on a primary-colored background, visible across all themes

### Requirement: Filter functionality preserved
Changing button styling SHALL NOT affect filter logic. All filters (all, active, completed, starred) SHALL continue to work correctly.

#### Scenario: Filter still works after styling fix
- **WHEN** user clicks each filter button
- **THEN** the todo list SHALL filter correctly to show all/active/completed/starred items respectively
