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
The left panel SHALL display a full-width blue "+ Compose" button at the top.

#### Scenario: Compose button click
- **WHEN** user clicks the "+ Compose" button
- **THEN** a "Coming soon" toast notification is displayed

### Requirement: Email folder tabs
The left panel SHALL display a "My Email" section with folder tabs: Inbox (1253), Starred (245), Sent (24,532), Draft (09), Spam (14), Important (18), Bin (09). Each folder shows an icon, name, and count.

#### Scenario: Default active folder
- **WHEN** the Inbox page loads
- **THEN** the "Inbox" folder tab is highlighted with blue text and a light blue background

#### Scenario: Folder tab click
- **WHEN** user clicks a different folder tab
- **THEN** that folder becomes the active tab with the highlighted style and the previously active tab reverts to default style

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
The message list view SHALL display a top bar with a search input (rounded, placeholder "Search") on the left and grouped action buttons (download, info, trash) with segmented borders on the right.

#### Scenario: Message list header renders
- **WHEN** the message list view is displayed
- **THEN** the top bar shows a search input and three action buttons (download, info, trash) in a segmented button group

#### Scenario: Message list action button click
- **WHEN** user clicks any action button in the message list header
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
The message list SHALL display email records as table-like rows separated by bottom borders. Each row SHALL contain, left to right: a checkbox (unchecked, bordered square), a star icon (outlined), the sender name (medium weight, truncated to ~168px), a color-coded label badge (Primary/Social/Work/Friends), the message subject/preview (truncated, regular weight), and a timestamp on the far right.

#### Scenario: Message list renders on page load
- **WHEN** user navigates to `/inbox`
- **THEN** the right panel shows a scrollable list of email record rows, each with checkbox, star, sender name, label badge, message preview, and time

#### Scenario: Select a conversation
- **WHEN** user clicks an email record row
- **THEN** the right panel switches to the chat view showing messages for that conversation, and the chat header label badge reflects the row's label

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
When the `Starred` folder tab is active, the message list SHALL display only records whose current starred state is true. All other folder tabs SHALL display the full record list (unchanged behavior). Switching folders SHALL reset pagination to page 1.

#### Scenario: Starred folder shows only starred records
- **WHEN** user clicks the `Starred` folder tab
- **THEN** only records currently marked as starred are visible in the message list

#### Scenario: Unstarring from within the Starred folder
- **WHEN** user is on the `Starred` folder tab and clicks the filled star on a visible row
- **THEN** that row is removed from the visible list and the remaining starred records stay visible

#### Scenario: Switching away from Starred restores full list
- **WHEN** user is on the `Starred` folder tab and clicks the `Inbox` folder tab
- **THEN** all records are visible again regardless of starred state

#### Scenario: Folder switch resets pagination
- **WHEN** user is on page 2 of the `Inbox` folder and clicks the `Starred` folder tab
- **THEN** pagination shows page 1 of the filtered starred results

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
