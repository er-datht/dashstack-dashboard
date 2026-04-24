## ADDED Requirements

### Requirement: ArchivedMessage type and localStorage persistence
The system SHALL define an `ArchivedMessage` type with fields: `id` (string), `senderName` (string), `labelId` (string), `subject` (string), `time` (string), and `sourceFolder` (string — the folder the message was in when archived: `"inbox"`, `"sent"`, `"starred"`, `"important"`, or `"draft"`). For messages archived from the sent folder, the type SHALL additionally include `recipientEmail` (string), `body` (string), and `sentAt` (string). For messages archived from the draft folder, the type SHALL additionally include `recipientEmail` (string), `body` (string), and `savedAt` (string). Archived messages SHALL be persisted in localStorage under the key `"inbox-archived-messages"` using the `useLocalStorage` hook, and SHALL survive page refresh.

#### Scenario: Archive state persists across refresh
- **WHEN** user archives a message and refreshes the page
- **THEN** the archived message is still present in the Archive folder view

### Requirement: Per-row archive button on eligible folders
Each message row SHALL display an `Archive` (lucide-react) icon button to the left of the existing Trash2 or draft-delete button when the active folder is one of: `inbox`, `starred`, `sent`, `important`, `draft`. Clicking the archive button SHALL move the message to archive (add it to `archivedMessages` localStorage) and remove it from the current folder view. For draft messages, archiving SHALL also remove the draft from `draftMessages` localStorage. A toast notification SHALL confirm "Message archived". The archive button SHALL NOT appear on `spam`, `bin`, or `archive` folder rows.

#### Scenario: Archive button visible on inbox row
- **WHEN** user is viewing the Inbox folder
- **THEN** each message row displays an Archive icon button to the left of the Trash2 button

#### Scenario: Archive button visible on draft row
- **WHEN** user is viewing the Draft folder
- **THEN** each message row displays an Archive icon button to the left of the trash button

#### Scenario: Archive button not visible on bin row
- **WHEN** user is viewing the Bin folder
- **THEN** rows do not show an archive button

#### Scenario: Archive button not visible on archive row
- **WHEN** user is viewing the Archive folder
- **THEN** rows do not show an archive button

#### Scenario: Single archive moves message to archive
- **WHEN** user clicks the Archive icon button on a message row in the Inbox folder
- **THEN** the message disappears from the Inbox list, appears in the Archive folder, archive count increments by 1, and a "Message archived" toast is displayed

### Requirement: Bulk archive via toolbar
The toolbar's first action button SHALL be context-sensitive based on the active folder:
- On archive-eligible folders (`inbox`, `starred`, `sent`, `important`, `draft`): the button SHALL display an `Archive` (lucide-react) icon and archive all checkbox-selected messages. After bulk archive, the selection state SHALL be cleared and a toast SHALL confirm the action. When no messages are selected, the button SHALL show a "No messages selected" toast.
- On the `archive` folder: the button SHALL display a `RotateCcw` (Unarchive) icon, wired to bulk unarchive (see "Bulk unarchive via toolbar" requirement below).
- On non-eligible folders (`spam`, `bin`): the button SHALL display a `Download` icon (neutral placeholder) and show a "Coming soon" toast when clicked.

#### Scenario: Bulk archive with multiple selected messages
- **WHEN** user checks 3 message checkboxes and clicks the toolbar Archive button in the Inbox folder
- **THEN** all 3 messages are moved to the archive, the selection is cleared, and archive count increments by 3

#### Scenario: Bulk archive with no selection
- **WHEN** user clicks the toolbar Archive button with no checkboxes selected in an eligible folder
- **THEN** a "No messages selected" toast is displayed

#### Scenario: Toolbar shows Download icon on non-eligible folder
- **WHEN** user is viewing the Spam folder
- **THEN** the toolbar's first button displays a Download icon instead of Archive

#### Scenario: Toolbar Download icon on non-eligible folder shows Coming soon
- **WHEN** user clicks the toolbar Download button while viewing the Spam folder
- **THEN** a "Coming soon" toast is displayed

### Requirement: Archive folder display
When the `Archive` folder tab is active, the message list SHALL display only messages from the `archivedMessages` localStorage array, converted to `EmailRecord` format. The archive folder SHALL start empty (count 0).

#### Scenario: Archive folder shows archived messages
- **WHEN** user archives 2 messages and clicks the Archive folder tab
- **THEN** the message list shows exactly those 2 archived messages

#### Scenario: Archive folder starts empty
- **WHEN** user navigates to the Archive folder on first load (no prior archives)
- **THEN** the message list is empty and the archive count shows 0

### Requirement: Restore from archive (unarchive)
Each message row in the Archive folder SHALL display a Restore button (`RotateCcw` icon) instead of the archive/delete buttons. Clicking Restore SHALL remove the message from `archivedMessages` and return it to its original source folder view. For inbox/important/starred source records, restoring means removing from the archived set (the record already exists in mockEmailRecords). For sent source records, restoring SHALL re-add the record to `sentMessages` localStorage. For draft source records, restoring SHALL re-add the record to `draftMessages` localStorage. A toast notification SHALL confirm "Message unarchived".

#### Scenario: Restore button visible in archive folder
- **WHEN** user is viewing the Archive folder
- **THEN** each row displays a RotateCcw restore button

#### Scenario: Restore inbox message from archive
- **WHEN** user restores a message that was archived from the Inbox folder
- **THEN** the message disappears from the Archive folder, reappears in the Inbox folder list, and the archive count decrements by 1

#### Scenario: Restore sent message from archive
- **WHEN** user restores a message that was archived from the Sent folder
- **THEN** the message disappears from the Archive folder, reappears in the Sent folder list, sent count increments by 1, and archive count decrements by 1

#### Scenario: Restore toast notification
- **WHEN** user restores a message from the archive
- **THEN** a "Message unarchived" toast notification is displayed

### Requirement: Bulk unarchive via toolbar
When the active folder is `archive`, the toolbar's first button SHALL display a `RotateCcw` icon with an "Unarchive" label instead of the `Archive` icon. Clicking this button SHALL unarchive all checkbox-selected messages, returning each to its original source folder. After bulk unarchive, the selection state SHALL be cleared and a "Message unarchived" toast SHALL be displayed. When no messages are selected, the button SHALL show a "No messages selected" toast.

#### Scenario: Bulk unarchive with multiple selected messages
- **WHEN** user checks 3 message checkboxes and clicks the toolbar Unarchive button in the Archive folder
- **THEN** all 3 messages are removed from the archive and returned to their source folders, the selection is cleared, and archive count decrements by 3

#### Scenario: Bulk unarchive with no selection
- **WHEN** user clicks the toolbar Unarchive button with no checkboxes selected in the Archive folder
- **THEN** a "No messages selected" toast is displayed

### Requirement: Exclude archived messages from source folders
Messages that have been archived SHALL NOT appear in their source folder views (Inbox, Starred, Sent, Important). The exclusion SHALL be based on matching message IDs against the `archivedMessages` array.

#### Scenario: Archived inbox message hidden from inbox
- **WHEN** user archives a message from the Inbox folder
- **THEN** that message no longer appears in the Inbox folder list

#### Scenario: Archived sent message hidden from sent
- **WHEN** user archives a sent message
- **THEN** that message no longer appears in the Sent folder list

#### Scenario: Archived starred message hidden from starred
- **WHEN** user archives a starred message from the Inbox folder
- **THEN** that message no longer appears in the Starred folder view

### Requirement: Starred state preservation through archive/unarchive
When a starred message is archived, its `starredIds` entry SHALL be preserved. When an archived message is restored, its starred state SHALL be intact.

#### Scenario: Starred message retains star after unarchive
- **WHEN** user stars a message, archives it, then unarchives it
- **THEN** the restored message still appears as starred in the message list and in the Starred folder

#### Scenario: Archived starred message excluded from Starred folder
- **WHEN** user archives a starred message
- **THEN** the message does not appear in the Starred folder view (it is excluded by the archived filter)

### Requirement: Archive button in ChatHeader
The ChatHeader detail view SHALL display an `Archive` icon button in the action button group (replacing the download icon). Clicking the archive button SHALL archive the currently viewed message and navigate back to the message list. A toast notification SHALL confirm "Message archived".

#### Scenario: Archive button in chat header
- **WHEN** user is viewing a conversation in ChatView from an archive-eligible folder
- **THEN** the ChatHeader displays an Archive icon button in the action group

#### Scenario: Archive from chat header
- **WHEN** user clicks the Archive button in the ChatHeader
- **THEN** the message is archived, the view returns to the message list, and a "Message archived" toast is displayed

### Requirement: Clicking an archived item opens ChatView
When user clicks a message row in the Archive folder, the right panel SHALL switch to the ChatView displaying the conversation for that message.

#### Scenario: Archive message opens chat
- **WHEN** user clicks a message row in the Archive folder
- **THEN** the ChatView opens showing the conversation for that message

### Requirement: Live archive folder count
The `Archive` folder tab in the left sidebar SHALL display a count equal to the current number of messages in `archivedMessages`. The count SHALL update immediately when a message is archived or unarchived.

#### Scenario: Archive count increments on archive
- **WHEN** user archives a message
- **THEN** the Archive folder tab count increases by 1

#### Scenario: Archive count decrements on unarchive
- **WHEN** user unarchives a message from the Archive folder
- **THEN** the Archive folder tab count decreases by 1

### Requirement: Archive translations
Translation keys SHALL exist in both `en/inbox.json` and `jp/inbox.json` for: folder name (`folders.archive`), archive action aria-label (`list.archive`), archive toast (`list.archived`), unarchive toast (`list.unarchived`), and unarchive button aria-label (`list.unarchive`).

#### Scenario: Translations exist in English
- **WHEN** the app is in English locale
- **THEN** the archive folder name, archive button, archive toast, unarchive button, and unarchive toast display English text

#### Scenario: Translations exist in Japanese
- **WHEN** the app is in Japanese locale
- **THEN** the archive folder name, archive button, archive toast, unarchive button, and unarchive toast display Japanese text
