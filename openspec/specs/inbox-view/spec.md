# inbox-view Specification

## Purpose

Defines the behavioral requirements for the Inbox page: two-panel layout, folder sidebar, message list, chat view, star-toggle functionality, folder-based filtering, and live sidebar counts.

## Requirements

### Requirement: Two-panel inbox layout
The Inbox page SHALL render a two-panel layout: a left sidebar panel (~284px) and a right content panel (flex-1), both inside the page content area below the page title "Inbox". The right panel SHALL show either the message list view or the chat view depending on whether a conversation is selected.

#### Scenario: Page renders with two panels
- **WHEN** user navigates to `/inbox`
- **THEN** the page displays an "Inbox" title and two side-by-side panels in white cards, with the right panel showing the message list view by default

### Requirement: Compose button
The left panel SHALL display a full-width blue "+ Compose" button at the top. Clicking the button SHALL open ComposeView in the right panel with empty fields for composing a new message.

#### Scenario: Compose button click
- **WHEN** user clicks the "+ Compose" button
- **THEN** ComposeView opens in the right panel with empty form fields

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

### Requirement: Label list
The left panel SHALL display a "Label" section with four labels: Primary (green), Social (blue), Work (orange), Friends (purple). Each label has a color-coded square icon and name.

#### Scenario: Labels render with correct colors
- **WHEN** the Inbox page loads
- **THEN** each label displays with its designated border color square icon

### Requirement: Create new label button
The left panel SHALL display a "+ Create New label" button below the labels.

#### Scenario: Create new label click
- **WHEN** user clicks "+ Create New label"
- **THEN** a "Coming soon" toast notification is displayed

### Requirement: Message list header
The message list view SHALL display a top bar with a select-all checkbox on the far left, a search input (rounded, placeholder "Search") to its right, and grouped action buttons (download, info, trash) with segmented borders on the right. The toolbar trash button SHALL perform bulk delete-to-bin when the active folder is one of: `inbox`, `starred`, `sent`, `important` and at least one message checkbox is selected. For other folders or when no messages are selected in an eligible folder, it SHALL show a toast.

#### Scenario: Top bar renders with select-all checkbox
- **WHEN** the message list view is displayed
- **THEN** the top bar shows a select-all checkbox, then the search input, then the action buttons

#### Scenario: Toolbar trash bulk deletes selected messages
- **WHEN** user checks message checkboxes and clicks the toolbar trash button in an eligible folder
- **THEN** all selected messages are moved to the bin and the selection is cleared

#### Scenario: Toolbar trash with no selection in eligible folder
- **WHEN** user clicks the toolbar trash button with no checkboxes selected in an eligible folder
- **THEN** a "No messages selected" toast is displayed

#### Scenario: Toolbar trash on non-eligible folder
- **WHEN** user clicks the toolbar trash button in a non-eligible folder (draft, spam, bin)
- **THEN** a "Coming soon" toast is displayed

### Requirement: Message list search
The search input SHALL filter email records in real time by matching the query against sender name or message subject (case-insensitive). Filtering SHALL reset pagination to the first page. Clearing the search input SHALL restore the full list.

#### Scenario: Search by sender name
- **WHEN** user types "Ethan" in the search input
- **THEN** only records with "Ethan" in the sender name are displayed and pagination resets to page 1

#### Scenario: Search by subject
- **WHEN** user types "Design" in the search input
- **THEN** only records containing "Design" in the subject are displayed

#### Scenario: Clear search
- **WHEN** user clears the search input
- **THEN** all email records are displayed again

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

### Requirement: Message list pagination
The message list SHALL display pagination below the records with a "Showing X-Y of Z" text on the left and left/right arrow navigation buttons on the right.

#### Scenario: Pagination renders
- **WHEN** the message list view is displayed
- **THEN** pagination shows "Showing 1-12 of 36" text and left/right arrow buttons below the email records

### Requirement: Chat header
The chat view top bar SHALL display a back arrow button, the selected contact name, a clickable label badge, and grouped action buttons (download, info, trash).

#### Scenario: Back button navigates to message list
- **WHEN** user clicks the back arrow in the chat header
- **THEN** the right panel returns to the message list view

#### Scenario: Action button click
- **WHEN** user clicks any action button (download, info, trash)
- **THEN** a "Coming soon" toast is displayed

### Requirement: Clickable label badge
The label badge in the chat header SHALL be clickable and open a dropdown to change the conversation's label. The dropdown SHALL list all available labels (Primary, Social, Work, Friends) with their color-coded icons. Selecting a label updates the badge to show the selected label with its corresponding color.

#### Scenario: Open label dropdown
- **WHEN** user clicks the label badge in the chat header
- **THEN** a dropdown appears listing all labels (Primary, Social, Work, Friends) each with their color-coded square icon

#### Scenario: Select a different label
- **WHEN** user selects "Work" from the label dropdown
- **THEN** the badge updates to show "Work" with the orange color scheme and the dropdown closes

#### Scenario: Close dropdown without selecting
- **WHEN** user clicks outside the label dropdown
- **THEN** the dropdown closes without changing the label

#### Scenario: Close dropdown with Escape key
- **WHEN** user presses Escape while the label dropdown is open
- **THEN** the dropdown closes without changing the label

### Requirement: Chat message bubbles
The chat area SHALL display messages in a scrollable area with two visual variants: received messages (gray background, left-aligned with avatar) and sent messages (blue background, white text, right-aligned).

#### Scenario: Received message rendering
- **WHEN** a received message is displayed
- **THEN** it shows with a gray background, rounded top-left/top-right/bottom-right corners, a circular avatar to the left, message text, and a timestamp with a more options icon

#### Scenario: Sent message rendering
- **WHEN** a sent message is displayed
- **THEN** it shows with a blue background and white text, rounded top-left/top-right/bottom-left corners, right-aligned, with a timestamp and more options icon

### Requirement: Chat input area
The right panel bottom SHALL display a text input area with placeholder text, action icons (mic, attachment, image), and a blue "Send" button.

#### Scenario: Send button click
- **WHEN** user clicks the "Send" button
- **THEN** a "Coming soon" toast is displayed

### Requirement: Theme support
All Inbox components SHALL support light, dark, and forest themes using the project's CSS custom properties and Tailwind utility classes.

#### Scenario: Theme switching
- **WHEN** user switches between light, dark, and forest themes
- **THEN** all Inbox page elements adapt colors appropriately (backgrounds, text, borders, badges)

### Requirement: Accessibility
All interactive icon-only buttons SHALL have `aria-label` attributes sourced from i18n translation keys (not hardcoded strings). The message list checkbox SHALL be a real `<input type="checkbox">` with an accessible label. The star icon SHALL be a `<button>` element. The more-options icon in chat bubbles SHALL be a `<button>` element.

#### Scenario: Screen reader announces icon buttons
- **WHEN** a screen reader user navigates to an icon-only button (back, download, info, trash, star, mic, attach, image)
- **THEN** the screen reader announces the button's purpose via its aria-label

#### Scenario: Aria-labels translate across locales
- **WHEN** user switches from English to Japanese
- **THEN** all aria-label values (back, download, info, delete, more options, voice, attachment, image, select message, star) are read in Japanese by screen readers

### Requirement: Internationalization
All user-visible text on the Inbox page SHALL use i18n translation keys from the `inbox` namespace, including aria-label attributes on icon-only buttons. The namespace SHALL be registered in the project's i18n configuration (`i18n.ts`). Translation keys SHALL exist in both `en/inbox.json` and `jp/inbox.json` — inline defaults alone are not sufficient. Time formatting SHALL respect the active language locale.

#### Scenario: Language switching
- **WHEN** user switches from English to Japanese
- **THEN** all Inbox page labels, buttons, and section headers display in Japanese

#### Scenario: Time formatting respects locale
- **WHEN** user switches to Japanese
- **THEN** chat message timestamps format according to Japanese locale conventions

### Requirement: Star toggle
Each message list row's star button SHALL toggle that record's starred state. Starred records SHALL render with a filled yellow star icon; unstarred records SHALL render with an outlined default-color star icon. Toggling a star SHALL NOT select the conversation or navigate away from the message list.

#### Scenario: Star an unstarred record
- **WHEN** user clicks the outlined star on an unstarred row
- **THEN** the star icon on that row becomes filled yellow and the message list view remains displayed

#### Scenario: Unstar a starred record
- **WHEN** user clicks the filled yellow star on a starred row
- **THEN** the star icon reverts to the outlined default-color state

#### Scenario: Star click does not open the conversation
- **WHEN** user clicks the star button on any row
- **THEN** the chat view is not opened and the row is not selected

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

### Requirement: Live starred folder count
The `Starred` folder tab in the left sidebar SHALL display a count equal to the current number of records whose starred state is true. The count SHALL update immediately when a record is starred or unstarred.

#### Scenario: Count reflects initial seeded state
- **WHEN** the Inbox page first loads
- **THEN** the `Starred` folder tab displays a count matching the number of mock records seeded as starred

#### Scenario: Count increments on star
- **WHEN** user stars a previously-unstarred record
- **THEN** the `Starred` folder tab count increases by 1

#### Scenario: Count decrements on unstar
- **WHEN** user unstars a previously-starred record
- **THEN** the `Starred` folder tab count decreases by 1

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

### Requirement: Dynamic Sent folder count
The `Sent` folder tab in the left sidebar SHALL display a count equal to the current number of sent messages stored in localStorage. The count SHALL update immediately when a new message is sent via compose.

#### Scenario: Sent count reflects localStorage state
- **WHEN** the Inbox page loads
- **THEN** the Sent folder tab count equals the number of entries in the `"inbox-sent-messages"` localStorage key

#### Scenario: Sent count increments after compose
- **WHEN** user sends a message via compose
- **THEN** the Sent folder tab count increases by 1
