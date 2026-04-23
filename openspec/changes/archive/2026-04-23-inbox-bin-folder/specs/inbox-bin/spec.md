## ADDED Requirements

### Requirement: BinnedMessage type and localStorage persistence
The system SHALL define a `BinnedMessage` type with fields: `id` (string), `senderName` (string), `labelId` (string), `subject` (string), `time` (string), and `sourceFolder` (string — the folder the message was in when deleted). Binned messages SHALL be persisted in localStorage under the key `"inbox-binned-messages"` using the `useLocalStorage` hook, and SHALL survive page refresh.

#### Scenario: Bin state persists across refresh
- **WHEN** user deletes a message to bin and refreshes the page
- **THEN** the binned message is still present in the Bin folder view

### Requirement: Per-row delete button on eligible folders
Each message row SHALL display a Trash2 icon button when the active folder is one of: `inbox`, `starred`, `sent`, `important`. Clicking the delete button SHALL move the message to bin (add it to `binnedMessages` localStorage) and remove it from the current folder view. The button SHALL NOT appear on `draft` folder rows (which retain their existing permanent-delete behavior) or on `spam`, or `bin` folder rows.

#### Scenario: Delete button visible on inbox row
- **WHEN** user is viewing the Inbox folder
- **THEN** each message row displays a Trash2 delete button

#### Scenario: Delete button not visible on draft row
- **WHEN** user is viewing the Draft folder
- **THEN** rows show the existing draft delete button, not the bin delete button

#### Scenario: Delete button not visible on bin row
- **WHEN** user is viewing the Bin folder
- **THEN** rows do not show a Trash2 delete button

#### Scenario: Single delete moves message to bin
- **WHEN** user clicks the Trash2 delete button on a message row in the Inbox folder
- **THEN** the message disappears from the Inbox list, appears in the Bin folder, and the bin count increments by 1

### Requirement: Bulk delete via toolbar
The toolbar Trash2 button SHALL delete all checkbox-selected messages to the bin when the active folder is one of: `inbox`, `starred`, `sent`, `important`. The system SHALL track which message checkboxes are checked via internal selection state in MessageList. After bulk delete, the selection state SHALL be cleared. The toolbar Trash2 button SHALL continue to show "Coming soon" toast for folders that do not support bin delete (spam, draft, bin).

#### Scenario: Bulk delete with multiple selected messages
- **WHEN** user checks 3 message checkboxes and clicks the toolbar Trash2 button in the Inbox folder
- **THEN** all 3 messages are moved to the bin, the selection is cleared, and the bin count increments by 3

#### Scenario: Bulk delete with no selection
- **WHEN** user clicks the toolbar Trash2 button with no checkboxes selected in an eligible folder
- **THEN** a toast message is displayed indicating no messages are selected

#### Scenario: Toolbar delete on non-eligible folder
- **WHEN** user clicks the toolbar Trash2 button while viewing the Draft folder
- **THEN** a "Coming soon" toast is displayed (existing behavior unchanged)

#### Scenario: Selection state clears on folder change
- **WHEN** user checks some message checkboxes and then switches to a different folder
- **THEN** the selection state is cleared

### Requirement: Bin folder filtering
When the `Bin` folder tab is active, the message list SHALL display only messages from the `binnedMessages` localStorage array, converted to `EmailRecord` format. The bin folder SHALL start empty (count 0) and grow as users delete messages. The static `count: 9` in mock data SHALL be overridden by the live bin count via `folderCountOverrides`.

#### Scenario: Bin folder shows binned messages
- **WHEN** user deletes 2 messages and clicks the Bin folder tab
- **THEN** the message list shows exactly those 2 binned messages

#### Scenario: Bin folder starts empty
- **WHEN** user navigates to the Bin folder on first load (no prior deletions)
- **THEN** the message list is empty and the bin count shows 0

#### Scenario: Bin count overrides static mock count
- **WHEN** user has deleted 5 messages to bin
- **THEN** the Bin folder tab in the sidebar shows count 5 (not the static 9)

### Requirement: Restore from bin
Each message row in the Bin folder SHALL display a Restore button (RotateCcw icon) instead of the delete button. Clicking Restore SHALL remove the message from `binnedMessages` and return it to its original source folder view. For inbox/important/starred source records, restoring means removing from the binned set (the record already exists in mockEmailRecords). For sent source records, restoring SHALL re-add the record to `sentMessages` localStorage. A toast notification SHALL confirm the restoration.

#### Scenario: Restore button visible in bin folder
- **WHEN** user is viewing the Bin folder
- **THEN** each row displays a RotateCcw restore button

#### Scenario: Restore inbox message from bin
- **WHEN** user restores a message that was deleted from the Inbox folder
- **THEN** the message disappears from the Bin folder, reappears in the Inbox folder list, and the bin count decrements by 1

#### Scenario: Restore sent message from bin
- **WHEN** user restores a message that was deleted from the Sent folder
- **THEN** the message disappears from the Bin folder, reappears in the Sent folder list, sent count increments by 1, and bin count decrements by 1

#### Scenario: Restore toast notification
- **WHEN** user restores a message from the bin
- **THEN** a toast notification confirms the message was restored

### Requirement: Exclude binned messages from source folders
Messages that have been deleted to bin SHALL NOT appear in their source folder views (Inbox, Starred, Sent, Important). The exclusion SHALL be based on matching message IDs against the `binnedMessages` array.

#### Scenario: Binned inbox message hidden from inbox
- **WHEN** user deletes a message from the Inbox folder
- **THEN** that message no longer appears in the Inbox folder list

#### Scenario: Binned sent message hidden from sent
- **WHEN** user deletes a sent message to bin
- **THEN** that message no longer appears in the Sent folder list

#### Scenario: Binned starred message hidden from starred
- **WHEN** user deletes a starred message to bin from the Inbox folder
- **THEN** that message no longer appears in the Starred folder view

### Requirement: Starred state preservation through delete/restore
When a starred message is deleted to bin, its `starredIds` entry SHALL be preserved. When a binned message is restored, its starred state SHALL be intact — if it was starred before deletion, it SHALL still appear in the Starred folder after restore.

#### Scenario: Starred message retains star after restore
- **WHEN** user stars a message, deletes it to bin, then restores it
- **THEN** the restored message still appears as starred in the message list and in the Starred folder

#### Scenario: Binned starred message excluded from Starred folder
- **WHEN** user deletes a starred message to bin
- **THEN** the message does not appear in the Starred folder view (it is excluded by the binned filter)

### Requirement: Clicking a bin item opens ChatView
When user clicks a message row in the Bin folder, the right panel SHALL switch to the ChatView displaying the conversation for that message, identical to clicking a message in other folders.

#### Scenario: Bin message opens chat
- **WHEN** user clicks a message row in the Bin folder
- **THEN** the ChatView opens showing the conversation for that message

### Requirement: Live bin folder count
The `Bin` folder tab in the left sidebar SHALL display a count equal to the current number of messages in `binnedMessages`. The count SHALL update immediately when a message is deleted to bin or restored from bin.

#### Scenario: Bin count increments on delete
- **WHEN** user deletes a message to bin
- **THEN** the Bin folder tab count increases by 1

#### Scenario: Bin count decrements on restore
- **WHEN** user restores a message from the bin
- **THEN** the Bin folder tab count decreases by 1

### Requirement: Bin translations
Translation keys `list.restore`, `list.restored`, `list.deletedToBin`, and `list.noSelection` SHALL exist in both `en/inbox.json` and `jp/inbox.json` for the restore button aria-label, restore toast, delete-to-bin toast, and no-selection toast respectively.

#### Scenario: Translations exist in English
- **WHEN** the app is in English locale
- **THEN** the restore button, restore toast, delete toast, and no-selection toast display English text

#### Scenario: Translations exist in Japanese
- **WHEN** the app is in Japanese locale
- **THEN** the restore button, restore toast, delete toast, and no-selection toast display Japanese text
