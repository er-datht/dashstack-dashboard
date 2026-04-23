## ADDED Requirements

### Requirement: Add-label button on unlabelled message rows
When a message row has no label assigned (empty `labelId`), the label badge area SHALL render a clickable `Tag` icon button instead of being empty. The button SHALL use `text-secondary` color with `hover:text-primary` transition, sized `w-4 h-4`, and have an `aria-label` sourced from the i18n key `inbox:list.addLabel`.

#### Scenario: Unlabelled message shows add-label button
- **WHEN** a message row has an empty `labelId`
- **THEN** a `Tag` icon button is displayed in the label badge area instead of empty space

#### Scenario: Labelled message shows badge as before
- **WHEN** a message row has a non-empty `labelId` matching a known label
- **THEN** the color-coded label badge is displayed (unchanged existing behavior)

#### Scenario: Add-label button is accessible
- **WHEN** a screen reader user navigates to the add-label button
- **THEN** the screen reader announces its purpose via the aria-label (e.g., "Add label")

### Requirement: Label assignment dropdown from message row
Clicking the add-label button SHALL open a dropdown listing all available labels (Primary, Social, Work, Friends) with their color-coded square icons. Only one dropdown SHALL be open at a time across all message rows. The dropdown SHALL close when clicking outside, pressing Escape, or selecting a label.

#### Scenario: Open label dropdown
- **WHEN** user clicks the add-label `Tag` icon on an unlabelled message row
- **THEN** a dropdown appears below the icon listing all 4 labels with color-coded square icons

#### Scenario: Select a label from dropdown
- **WHEN** user selects "Work" from the label dropdown
- **THEN** the dropdown closes, the `Tag` icon is replaced by a "Work" colored badge on that row, and the label is assigned to the message

#### Scenario: Close dropdown by clicking outside
- **WHEN** user clicks outside the label dropdown
- **THEN** the dropdown closes without assigning a label

#### Scenario: Close dropdown with Escape key
- **WHEN** user presses Escape while the label dropdown is open
- **THEN** the dropdown closes without assigning a label

#### Scenario: Only one dropdown open at a time
- **WHEN** user clicks the add-label button on a second row while another row's dropdown is open
- **THEN** the first dropdown closes and the second one opens

### Requirement: Label assignment persists across folder switches
Label assignments made via the add-label button SHALL persist in component state for the duration of the session. Switching folders and returning SHALL show the assigned label on the message.

#### Scenario: Label persists after folder switch
- **WHEN** user assigns a label to a sent message in the Sent folder, switches to Inbox, then returns to Sent
- **THEN** the sent message still displays the assigned label badge

#### Scenario: Assigned label visible in Starred folder
- **WHEN** user assigns a label to a starred sent message and navigates to the Starred folder
- **THEN** the message displays the assigned label badge in the Starred folder view

## MODIFIED Requirements

### Requirement: Message list rows
The message list SHALL display email records as table-like rows separated by bottom borders. Each row SHALL contain, left to right: a checkbox (unchecked, bordered square), a star icon (outlined), the sender name (medium weight, truncated to ~168px), a color-coded label badge (Primary/Social/Work/Friends) OR an add-label `Tag` icon button when `labelId` is empty, the message subject/preview (truncated, regular weight), and a timestamp on the far right. When the active folder is `"draft"`, each row SHALL additionally display a trash icon button for deleting the draft. When the active folder is one of `"inbox"`, `"starred"`, `"sent"`, `"important"`, each row SHALL additionally display a Trash2 icon button for deleting to bin. When the active folder is `"bin"`, each row SHALL display a RotateCcw restore icon button instead.

#### Scenario: Message list renders on page load
- **WHEN** user navigates to `/inbox`
- **THEN** the right panel shows a scrollable list of email record rows, each with checkbox, star, sender name, label badge or add-label button, message preview, delete button, and time

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

### Requirement: Sent folder displays composed messages
When the `Sent` folder tab is active, the message list SHALL display messages that were composed and sent by the user (loaded from the `"inbox-sent-messages"` localStorage key), converted to the email record format. Each sent record SHALL show "Me" as the sender name, an add-label `Tag` icon button (since no label is assigned by default), the subject, and a formatted time. If no sent messages exist in localStorage, the message list SHALL be empty.

#### Scenario: Sent folder shows localStorage messages
- **WHEN** user clicks the "Sent" folder tab and there are sent messages in localStorage
- **THEN** the message list displays only the sent messages with "Me" as sender, an add-label button, subject, and time

#### Scenario: Sent folder with no messages
- **WHEN** user clicks the "Sent" folder tab and there are no sent messages in localStorage
- **THEN** the message list is empty (no records displayed)

#### Scenario: Newly sent message appears in Sent folder
- **WHEN** user composes and sends a message, then navigates to the Sent folder
- **THEN** the newly sent message appears in the Sent folder list
