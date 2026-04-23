## MODIFIED Requirements

### Requirement: Email folder tabs
The left panel SHALL display a "My Email" section with folder tabs: Inbox (dynamic), Starred (dynamic), Sent (dynamic), Draft (dynamic), Spam (14), Important (18), Bin (dynamic). Each folder shows an icon, name, and count. The Draft folder count SHALL reflect the actual number of saved drafts in localStorage. The Bin folder count SHALL reflect the actual number of binned messages in localStorage (overriding the static mock count of 9).

#### Scenario: Default active folder
- **WHEN** the Inbox page loads
- **THEN** the "Inbox" folder tab is highlighted with blue text and a light blue background

#### Scenario: Folder tab click
- **WHEN** user clicks a different folder tab
- **THEN** that folder becomes the active tab with the highlighted style and the previously active tab reverts to default style

#### Scenario: Bin count is dynamic
- **WHEN** the Inbox page loads with no binned messages
- **THEN** the Bin folder tab displays count 0

### Requirement: Message list header
The message list view SHALL display a top bar with a search input (rounded, placeholder "Search") on the left and grouped action buttons (download, info, trash) with segmented borders on the right. The toolbar trash button SHALL perform bulk delete-to-bin when the active folder is one of: `inbox`, `starred`, `sent`, `important` and at least one message checkbox is selected. For other folders or when no messages are selected in an eligible folder, it SHALL show a toast.

#### Scenario: Message list header renders
- **WHEN** the message list view is displayed
- **THEN** the top bar shows a search input and three action buttons (download, info, trash) in a segmented button group

#### Scenario: Toolbar trash bulk deletes selected messages
- **WHEN** user checks message checkboxes and clicks the toolbar trash button in an eligible folder
- **THEN** all selected messages are moved to the bin and the selection is cleared

#### Scenario: Toolbar trash with no selection in eligible folder
- **WHEN** user clicks the toolbar trash button with no checkboxes selected in an eligible folder
- **THEN** a "No messages selected" toast is displayed

#### Scenario: Toolbar trash on non-eligible folder
- **WHEN** user clicks the toolbar trash button in a non-eligible folder (draft, spam, bin)
- **THEN** a "Coming soon" toast is displayed

### Requirement: Message list rows
The message list SHALL display email records as table-like rows separated by bottom borders. Each row SHALL contain, left to right: a checkbox (unchecked, bordered square), a star icon (outlined), the sender name (medium weight, truncated to ~168px), a color-coded label badge (Primary/Social/Work/Friends -- omitted when labelId is empty), the message subject/preview (truncated, regular weight), and a timestamp on the far right. When the active folder is `"draft"`, each row SHALL additionally display a trash icon button for deleting the draft. When the active folder is one of `"inbox"`, `"starred"`, `"sent"`, `"important"`, each row SHALL additionally display a Trash2 icon button for deleting to bin. When the active folder is `"bin"`, each row SHALL display a RotateCcw restore icon button instead.

#### Scenario: Message list renders on page load
- **WHEN** user navigates to `/inbox`
- **THEN** the right panel shows a scrollable list of email record rows, each with checkbox, star, sender name, label badge, message preview, delete button, and time

#### Scenario: Select a conversation
- **WHEN** user clicks an email record row in a non-draft folder
- **THEN** the right panel switches to the chat view showing messages for that conversation

#### Scenario: Select a draft row
- **WHEN** user clicks an email record row in the Draft folder
- **THEN** the right panel switches to ComposeView pre-filled with the draft's data

#### Scenario: Draft row displays trash icon
- **WHEN** the Draft folder is active
- **THEN** each row shows a trash icon button on the right side (before the timestamp)

#### Scenario: Inbox row displays delete-to-bin icon
- **WHEN** the Inbox folder is active
- **THEN** each row shows a Trash2 delete button on the right side

#### Scenario: Bin row displays restore icon
- **WHEN** the Bin folder is active
- **THEN** each row shows a RotateCcw restore button on the right side

### Requirement: Starred folder filtering
When the `Starred` folder tab is active, the message list SHALL display only records whose current starred state is true AND which are NOT in the bin, drawn from ALL record sources (inbox, sent, and draft). All other folder tabs SHALL display their folder-specific records (unchanged behavior). Switching folders SHALL reset pagination to page 1.

#### Scenario: Starred folder shows only starred records
- **WHEN** user clicks the `Starred` folder tab
- **THEN** only records currently marked as starred and not in the bin are visible in the message list, including starred records from inbox, sent, and draft sources

#### Scenario: Starred sent message appears in Starred folder
- **WHEN** user stars a sent message and navigates to the `Starred` folder tab
- **THEN** that sent message appears in the starred message list

#### Scenario: Starred draft message appears in Starred folder
- **WHEN** user stars a draft message and navigates to the `Starred` folder tab
- **THEN** that draft message appears in the starred message list

#### Scenario: Unstarring from within the Starred folder
- **WHEN** user is on the `Starred` folder tab and clicks the filled star on a visible row
- **THEN** that row is removed from the visible list and the remaining starred records stay visible

#### Scenario: Switching away from Starred restores folder-specific list
- **WHEN** user is on the `Starred` folder tab and clicks the `Inbox` folder tab
- **THEN** only inbox records are visible (not sent or draft records)

#### Scenario: Folder switch resets pagination
- **WHEN** user is on page 2 of the `Inbox` folder and clicks the `Starred` folder tab
- **THEN** pagination shows page 1 of the filtered starred results

#### Scenario: Binned starred message excluded from Starred folder
- **WHEN** user deletes a starred message to bin
- **THEN** that message does not appear in the Starred folder view
