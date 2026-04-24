## MODIFIED Requirements

### Requirement: Email folder tabs
The left panel SHALL display a "My Email" section with folder tabs: Inbox (dynamic), Starred (dynamic), Sent (dynamic), Draft (dynamic), Spam (14), Important (18), Bin (dynamic), Archive (dynamic). Each folder shows an icon, name, and count. The Draft folder count SHALL reflect the actual number of saved drafts in localStorage. The Bin folder count SHALL reflect the actual number of binned messages in localStorage. The Archive folder count SHALL reflect the actual number of archived messages in localStorage.

#### Scenario: Default active folder
- **WHEN** the Inbox page loads
- **THEN** the "Inbox" folder tab is highlighted with blue text and a light blue background

#### Scenario: Folder tab click
- **WHEN** user clicks a different folder tab
- **THEN** that folder becomes the active tab with the highlighted style and the previously active tab reverts to default style

#### Scenario: Bin count is dynamic
- **WHEN** the Inbox page loads with no binned messages
- **THEN** the Bin folder tab displays count 0

#### Scenario: Archive count is dynamic
- **WHEN** the Inbox page loads with no archived messages
- **THEN** the Archive folder tab displays count 0

### Requirement: Message list header
The message list view SHALL display a top bar with a select-all checkbox on the far left, a search input (rounded, placeholder "Search") to its right, and grouped action buttons with segmented borders on the right. The first toolbar button is context-sensitive: on archive-eligible folders (`inbox`, `starred`, `sent`, `important`, `draft`) it displays an `Archive` icon for bulk archive; on the `archive` folder it displays a `RotateCcw` (Unarchive) icon for bulk unarchive; on non-eligible folders (`spam`, `bin`) it displays a `Download` icon as a neutral placeholder with "Coming soon" behavior. The toolbar trash button SHALL perform bulk delete-to-bin on eligible folders. For other folders or when no messages are selected in an eligible folder, buttons SHALL show appropriate toasts.

#### Scenario: Top bar renders with select-all checkbox
- **WHEN** the message list view is displayed
- **THEN** the top bar shows a select-all checkbox, then the search input, then the action buttons (context-sensitive first button, info, trash)

#### Scenario: Toolbar trash bulk deletes selected messages
- **WHEN** user checks message checkboxes and clicks the toolbar trash button in an eligible folder
- **THEN** all selected messages are moved to the bin and the selection is cleared

#### Scenario: Toolbar trash with no selection in eligible folder
- **WHEN** user clicks the toolbar trash button with no checkboxes selected in an eligible folder
- **THEN** a "No messages selected" toast is displayed

#### Scenario: Toolbar trash on non-eligible folder
- **WHEN** user clicks the toolbar trash button in a non-eligible folder (draft, spam, bin, archive)
- **THEN** a "Coming soon" toast is displayed

### Requirement: Message list rows
The message list SHALL display email records as table-like rows separated by bottom borders. Each row SHALL contain, left to right: a checkbox (unchecked, bordered square), a star icon (outlined), the sender name (medium weight, truncated to ~168px), a color-coded label badge (Primary/Social/Work/Friends) OR an add-label `Tag` icon button when `labelId` is empty, the message subject/preview (truncated, regular weight), and a timestamp on the far right. When the active folder is `"draft"`, each row SHALL additionally display an Archive icon button followed by a trash icon button for deleting the draft. When the active folder is one of `"inbox"`, `"starred"`, `"sent"`, `"important"`, each row SHALL additionally display an Archive icon button followed by a Trash2 icon button. When the active folder is `"bin"` or `"archive"`, each row SHALL display a RotateCcw restore icon button instead.

#### Scenario: Message list renders on page load
- **WHEN** user navigates to `/inbox`
- **THEN** the right panel shows a scrollable list of email record rows, each with checkbox, star, sender name, label badge or add-label button, message preview, archive button, delete button, and time

#### Scenario: Select a conversation
- **WHEN** user clicks an email record row in a non-draft folder
- **THEN** the right panel switches to the chat view showing messages for that conversation

#### Scenario: Select a draft row
- **WHEN** user clicks an email record row in the Draft folder
- **THEN** the right panel switches to ComposeView pre-filled with the draft's data

#### Scenario: Draft row displays archive and trash icons
- **WHEN** the Draft folder is active
- **THEN** each row shows an Archive icon button followed by a trash icon button on the right side (before the timestamp)

#### Scenario: Inbox row displays archive and delete-to-bin icons
- **WHEN** the Inbox folder is active
- **THEN** each row shows an Archive button followed by a Trash2 delete button on the right side

#### Scenario: Bin row displays restore icon
- **WHEN** the Bin folder is active
- **THEN** each row shows a RotateCcw restore button on the right side

#### Scenario: Archive row displays restore icon
- **WHEN** the Archive folder is active
- **THEN** each row shows a RotateCcw restore button on the right side

### Requirement: Chat header
The chat view top bar SHALL display a back arrow button, the selected contact name, a clickable label badge, and grouped action buttons (archive, info, trash).

#### Scenario: Back button navigates to message list
- **WHEN** user clicks the back arrow in the chat header
- **THEN** the right panel returns to the message list view

#### Scenario: Action button click
- **WHEN** user clicks the info or trash action button
- **THEN** a "Coming soon" toast is displayed

### Requirement: Starred folder filtering
When the `Starred` folder tab is active, the message list SHALL display only records whose current starred state is true AND which are NOT in the bin AND which are NOT in the archive, drawn from ALL record sources (inbox, sent, and draft). All other folder tabs SHALL display their folder-specific records (unchanged behavior). Switching folders SHALL reset pagination to page 1.

#### Scenario: Starred folder shows only starred records
- **WHEN** user clicks the `Starred` folder tab
- **THEN** only records currently marked as starred and not in the bin or archive are visible in the message list, including starred records from inbox, sent, and draft sources

#### Scenario: Archived starred message excluded from Starred folder
- **WHEN** user archives a starred message
- **THEN** the message does not appear in the Starred folder view
