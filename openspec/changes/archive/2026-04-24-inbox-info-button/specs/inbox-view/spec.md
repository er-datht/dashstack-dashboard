## MODIFIED Requirements

### Requirement: Message list header
The message list view SHALL display a top bar with a select-all checkbox on the far left, a search input (rounded, placeholder "Search") to its right, and grouped action buttons with segmented borders on the right. The first toolbar button is context-sensitive: on archive-eligible folders (`inbox`, `starred`, `sent`, `important`, `draft`) it displays an `Archive` icon for bulk archive; on the `archive` folder it displays a `RotateCcw` (Unarchive) icon for bulk unarchive; on non-eligible folders (`spam`, `bin`) it displays a `Download` icon as a neutral placeholder with "Coming soon" behavior. The toolbar info button SHALL open the info modal showing metadata for the selected message(s); if no messages are selected, it SHALL show a "No messages selected" toast. The toolbar trash button SHALL perform bulk delete-to-bin on eligible folders. For other folders or when no messages are selected in an eligible folder, buttons SHALL show appropriate toasts.

#### Scenario: Top bar renders with select-all checkbox
- **WHEN** the message list view is displayed
- **THEN** the top bar shows a select-all checkbox, then the search input, then the action buttons (context-sensitive first button, info, trash)

#### Scenario: Toolbar info opens modal with selected messages
- **WHEN** user checks one or more message checkboxes and clicks the toolbar info button
- **THEN** the info modal opens displaying metadata for the selected message(s)

#### Scenario: Toolbar info with no selection
- **WHEN** user clicks the toolbar info button with no checkboxes selected
- **THEN** a "No messages selected" toast is displayed

#### Scenario: Toolbar trash bulk deletes selected messages
- **WHEN** user checks message checkboxes and clicks the toolbar trash button in an eligible folder
- **THEN** all selected messages are moved to the bin and the selection is cleared

#### Scenario: Toolbar trash with no selection in eligible folder
- **WHEN** user clicks the toolbar trash button with no checkboxes selected in an eligible folder
- **THEN** a "No messages selected" toast is displayed

#### Scenario: Toolbar trash on non-eligible folder
- **WHEN** user clicks the toolbar trash button in a non-eligible folder (draft, spam, bin, archive)
- **THEN** a "Coming soon" toast is displayed

### Requirement: Chat header
The chat view top bar SHALL display a back arrow button, the selected contact name, a clickable label badge, and grouped action buttons (archive, info, trash). Clicking the info button SHALL open the info modal displaying metadata for the current conversation.

#### Scenario: Back button navigates to message list
- **WHEN** user clicks the back arrow in the chat header
- **THEN** the right panel returns to the message list view

#### Scenario: Info button opens modal
- **WHEN** user clicks the info action button in the chat header
- **THEN** the info modal opens displaying metadata for the current conversation (contact name, subject, label, time, starred status)

#### Scenario: Action button click for trash
- **WHEN** user clicks the trash action button
- **THEN** a "Coming soon" toast is displayed
