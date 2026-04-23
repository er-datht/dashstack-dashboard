## MODIFIED Requirements

### Requirement: Compose button
The left panel SHALL display a full-width blue "+ Compose" button at the top. Clicking the button SHALL open ComposeView in the right panel with empty fields for composing a new message.

#### Scenario: Compose button click
- **WHEN** user clicks the "+ Compose" button
- **THEN** ComposeView opens in the right panel with empty form fields

### Requirement: Email folder tabs
The left panel SHALL display a "My Email" section with folder tabs: Inbox (dynamic), Starred (dynamic), Sent (dynamic), Draft (dynamic), Spam (14), Important (18), Bin (09). Each folder shows an icon, name, and count. The Draft folder count SHALL reflect the actual number of saved drafts in localStorage.

#### Scenario: Default active folder
- **WHEN** the Inbox page loads
- **THEN** the "Inbox" folder tab is highlighted with blue text and a light blue background

#### Scenario: Folder tab click
- **WHEN** user clicks a different folder tab
- **THEN** that folder becomes the active tab with the highlighted style and the previously active tab reverts to default style

### Requirement: Message list rows
The message list SHALL display email records as table-like rows separated by bottom borders. Each row SHALL contain, left to right: a checkbox (unchecked, bordered square), a star icon (outlined), the sender name (medium weight, truncated to ~168px), a color-coded label badge (Primary/Social/Work/Friends — omitted when labelId is empty), the message subject/preview (truncated, regular weight), and a timestamp on the far right. When the active folder is `"draft"`, each row SHALL additionally display a trash icon button for deleting the draft.

#### Scenario: Message list renders on page load
- **WHEN** user navigates to `/inbox`
- **THEN** the right panel shows a scrollable list of email record rows, each with checkbox, star, sender name, label badge, message preview, and time

#### Scenario: Select a conversation
- **WHEN** user clicks an email record row in a non-draft folder
- **THEN** the right panel switches to the chat view showing messages for that conversation

#### Scenario: Select a draft row
- **WHEN** user clicks an email record row in the Draft folder
- **THEN** the right panel switches to ComposeView pre-filled with the draft's data

#### Scenario: Draft row displays trash icon
- **WHEN** the Draft folder is active
- **THEN** each row shows a trash icon button on the right side (before the timestamp)
