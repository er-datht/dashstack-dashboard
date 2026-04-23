## ADDED Requirements

### Requirement: Select-all checkbox in MessageList header
The MessageList top bar SHALL display a checkbox to the left of the search input. This checkbox SHALL toggle selection of all visible (current-page) messages.

#### Scenario: No messages selected — click selects all
- **WHEN** no messages are selected and user clicks the select-all checkbox
- **THEN** all visible messages on the current page are added to `selectedIds`
- **THEN** the checkbox shows a checked state

#### Scenario: All messages selected — click deselects all
- **WHEN** all visible messages on the current page are selected and user clicks the select-all checkbox
- **THEN** all messages are removed from `selectedIds`
- **THEN** the checkbox shows an unchecked state

#### Scenario: Some messages selected — click selects all
- **WHEN** some (but not all) visible messages are selected and user clicks the select-all checkbox
- **THEN** all visible messages on the current page are added to `selectedIds`
- **THEN** the checkbox transitions from indeterminate to checked state

### Requirement: Indeterminate visual state
The select-all checkbox SHALL display an indeterminate (partial) state when some but not all visible messages are selected.

#### Scenario: Partial selection shows indeterminate
- **WHEN** at least one but fewer than all visible messages are selected
- **THEN** the select-all checkbox displays in the indeterminate state (dash icon)

#### Scenario: Zero or full selection shows determinate
- **WHEN** zero or all visible messages are selected
- **THEN** the select-all checkbox displays as unchecked or checked respectively (not indeterminate)

### Requirement: Selection clears on page navigation
Selection SHALL be cleared when the user navigates to a different page via pagination.

#### Scenario: Page change clears selection
- **WHEN** the user clicks next or previous page in the pagination controls
- **THEN** `selectedIds` is cleared to an empty set
- **THEN** the select-all checkbox resets to unchecked

### Requirement: Select-all checkbox accessibility
The select-all checkbox SHALL have an `aria-label` using the i18n key `list.selectAll`.

#### Scenario: Accessible label present
- **WHEN** the select-all checkbox is rendered
- **THEN** it has an `aria-label` attribute with the translated value of `list.selectAll`

### Requirement: Select-all checkbox disabled when no messages
The select-all checkbox SHALL be disabled when there are no visible messages (empty folder or no search results).

#### Scenario: Empty message list disables checkbox
- **WHEN** the visible message list is empty
- **THEN** the select-all checkbox is rendered but disabled
