## ADDED Requirements

### Requirement: Important flag on email records
The `EmailRecord` type SHALL include an optional `isImportant?: boolean` field. The flag is per-message and independent of folder membership: a record may have `isImportant: true` while also being in Inbox, Sent, Draft, Starred, or restored-from-Spam. The flag is preserved when the record is moved to Bin, Archive, or Spam, and restored on the way back.

#### Scenario: EmailRecord type accepts isImportant
- **WHEN** inspecting the `EmailRecord` type definition
- **THEN** an optional `isImportant?: boolean` field is present

### Requirement: Important state shape and persistence
The system SHALL maintain an `importantIds: Record<string, boolean>` state in the Inbox page, keyed by record id. The state SHALL be persisted via the `useLocalStorage` hook under the storage key `"inbox-important-ids"`. The seed value on first mount SHALL be derived from `mockEmailRecords` entries whose `isImportant === true`.

#### Scenario: Important state seeded from mock data on first load
- **WHEN** the Inbox page mounts with no prior `inbox-important-ids` in localStorage
- **THEN** `importantIds` contains an entry for each `mockEmailRecord` with `isImportant: true`

#### Scenario: Important state persists across reload
- **WHEN** user marks a message as Important and reloads the page
- **THEN** the message remains marked as Important after reload

### Requirement: Toggle Important handler
The system SHALL provide a `toggleImportant(id: string)` handler that flips the flag for the given record id. Calling it on a flagged id SHALL remove that id from `importantIds`; calling it on an unflagged id SHALL add the id to `importantIds`.

#### Scenario: Toggle adds flag to unflagged record
- **WHEN** `toggleImportant("rec-1")` is called and "rec-1" is not currently flagged
- **THEN** `importantIds["rec-1"]` becomes `true`

#### Scenario: Toggle removes flag from flagged record
- **WHEN** `toggleImportant("rec-1")` is called and "rec-1" is currently flagged
- **THEN** `importantIds["rec-1"]` is removed (key absent)

### Requirement: Mock seed with Important records
`mockEmailRecords` SHALL include exactly 5 entries with `isImportant: true`, chosen for variety across labels and sender types.

#### Scenario: Mock seed count is 5
- **WHEN** inspecting `mockEmailRecords` on first load
- **THEN** exactly 5 records have `isImportant: true`

### Requirement: Important folder filtered view
When the Important folder is active, the message list SHALL display the union of `mockEmailRecords + sentEmailRecords + draftEmailRecords + restoredFromSpam + receivedEmailRecords`, filtered to records that are flagged as important AND are not in `binnedMessages`, `archivedMessages`, or `spammedMessages`. The display source MUST cover every record type that appears in any other inbox-side folder, so the visible row count matches the live Important sidebar count for any flagged record.

#### Scenario: Important folder shows only flagged records
- **WHEN** user navigates to the Important folder on first load
- **THEN** the message list displays exactly the 5 pre-seeded records flagged as important

#### Scenario: Important folder includes flagged received messages
- **WHEN** user flags a message received from another user (a `receivedEmailRecords` entry) as Important
- **THEN** the message appears in the Important folder view and is counted by the sidebar

#### Scenario: Important folder includes flagged restored-from-spam messages
- **WHEN** user restores a spam record via "Not Spam" and then flags it as Important
- **THEN** the message appears in the Important folder view and is counted by the sidebar

#### Scenario: Important folder excludes binned messages
- **WHEN** user marks a message as Important, deletes it to Bin, then views the Important folder
- **THEN** the deleted message is not visible in the Important folder

#### Scenario: Important folder excludes archived messages
- **WHEN** user marks a message as Important, archives it, then views the Important folder
- **THEN** the archived message is not visible in the Important folder

#### Scenario: Important folder excludes spammed messages
- **WHEN** user marks a message as Important, moves it to Spam, then views the Important folder
- **THEN** the spammed message is not visible in the Important folder

### Requirement: Per-row archive and delete from Important folder
The per-row Archive and Trash actions on the Important folder SHALL succeed for every record type that the folder displays — `mockEmailRecords`, `sentEmailRecords`, `draftEmailRecords`, `restoredFromSpam`, and `receivedEmailRecords`. The shared `buildBinnedMessage` and `buildArchivedMessage` helpers SHALL find the source record across all of these arrays and SHALL resolve `sourceFolder` to the original location (`"inbox"` for mock / restored / received, `"sent"` for sent, `"draft"` for draft) when invoked from the Important (or Starred) folder.

#### Scenario: Archive from Important succeeds for a restored-from-spam record
- **WHEN** user clicks the per-row Archive on a flagged restored-from-spam record in the Important folder
- **THEN** the record is added to `archivedMessages` with `sourceFolder: "inbox"`, removed from the Important view, and an "archived" toast appears

#### Scenario: Delete from Important succeeds for a received message
- **WHEN** user clicks the per-row Trash on a flagged received message in the Important folder
- **THEN** the record is added to `binnedMessages` with `sourceFolder: "inbox"`, removed from the Important view, and a "moved to Bin" toast appears

#### Scenario: Archive/Delete from Important succeeds for a mock or sent record
- **WHEN** user archives or deletes a flagged mock or sent record from the Important folder
- **THEN** the action resolves `sourceFolder` to `"inbox"` or `"sent"` respectively and the record is removed from view

### Requirement: Per-row Important toggle button
Each message row in the Inbox, Starred, Sent, and Important folders SHALL display a `Bookmark` icon button (from `lucide-react`) positioned between the Star button and the Archive button. The icon SHALL render filled (`fill="currentColor"`) and accent-colored when the record is flagged, and outlined with `text-secondary` when not. Clicking the button SHALL stop event propagation and call `toggleImportant(record.id)`. The aria-label SHALL use `t("list.markImportant")` when unflagged and `t("list.unmarkImportant")` when flagged.

#### Scenario: Per-row Bookmark visible on inbox folder
- **WHEN** user views the Inbox folder
- **THEN** every message row displays a Bookmark button between the Star and Archive buttons

#### Scenario: Per-row Bookmark visible on starred folder
- **WHEN** user views the Starred folder
- **THEN** every message row displays a Bookmark button

#### Scenario: Per-row Bookmark visible on sent folder
- **WHEN** user views the Sent folder
- **THEN** every message row displays a Bookmark button

#### Scenario: Per-row Bookmark visible on important folder
- **WHEN** user views the Important folder
- **THEN** every message row displays a filled Bookmark button (since every visible record is flagged)

#### Scenario: Per-row Bookmark not visible on draft folder
- **WHEN** user views the Draft folder
- **THEN** message rows do not display a Bookmark button

#### Scenario: Per-row Bookmark not visible on spam folder
- **WHEN** user views the Spam folder
- **THEN** message rows do not display a Bookmark button

#### Scenario: Per-row Bookmark not visible on bin folder
- **WHEN** user views the Bin folder
- **THEN** message rows do not display a Bookmark button

#### Scenario: Per-row Bookmark not visible on archive folder
- **WHEN** user views the Archive folder
- **THEN** message rows do not display a Bookmark button

#### Scenario: Click Bookmark on unflagged row marks as Important
- **WHEN** user clicks the outlined Bookmark on a row in the Inbox folder
- **THEN** the icon changes to filled, `importantIds[record.id]` becomes `true`, and a "Marked as Important" toast appears

#### Scenario: Click Bookmark on flagged row unmarks
- **WHEN** user clicks the filled Bookmark on a row in the Important folder
- **THEN** the row disappears from the Important folder, `importantIds[record.id]` is removed, and an "Unmarked Important" toast appears

### Requirement: ChatHeader Important toggle button
On the Inbox, Starred, Sent, and Important folders, the ChatView header SHALL display a `Bookmark` button. The button SHALL render filled and accent-colored when the selected record is flagged, outlined otherwise. Clicking the button SHALL call the `onToggleImportant` handler passed from `index.tsx`.

#### Scenario: ChatHeader Bookmark visible on eligible folders
- **WHEN** user opens ChatView on a message in the Inbox, Starred, Sent, or Important folder
- **THEN** the ChatView header displays a Bookmark button

#### Scenario: ChatHeader Bookmark not visible on draft/spam/bin/archive
- **WHEN** user opens ChatView on a message in the Draft, Spam, Bin, or Archive folder
- **THEN** the ChatView header does not display a Bookmark button

#### Scenario: ChatHeader Bookmark toggles Important
- **WHEN** user clicks the Bookmark in the ChatView header
- **THEN** the flag toggles for the selected record and a confirmation toast appears

### Requirement: Bulk Important toolbar button
The message list toolbar SHALL include a Bookmark bulk-action button on the Inbox, Starred, Sent, and Important folders. On Inbox / Starred / Sent the button SHALL mark all selected rows as Important; on the Important folder the button SHALL unmark all selected rows. The button SHALL show a "No messages selected" toast when clicked with no selection. A confirmation toast SHALL display the count of affected messages on success. Selections SHALL be cleared after the action.

#### Scenario: Bulk button visible on inbox/starred/sent
- **WHEN** user views the Inbox, Starred, or Sent folder
- **THEN** the toolbar displays a Bookmark bulk-action button

#### Scenario: Bulk button visible on important
- **WHEN** user views the Important folder
- **THEN** the toolbar displays a (filled) Bookmark bulk-action button for unmarking

#### Scenario: Bulk mark from inbox marks all selected
- **WHEN** user selects 3 rows in the Inbox folder and clicks the bulk Bookmark button
- **THEN** all 3 selected records are flagged as Important and the selection is cleared

#### Scenario: Bulk unmark from important removes flag from all selected
- **WHEN** user selects 2 rows in the Important folder and clicks the bulk Bookmark button
- **THEN** both records lose their Important flag, disappear from the Important folder view, and the selection is cleared

#### Scenario: Bulk action with no selection shows toast
- **WHEN** user clicks the bulk Bookmark button with no rows selected
- **THEN** a "No messages selected" toast is displayed

### Requirement: Important folder per-row action buttons
Each row in the Important folder SHALL display three action buttons: a filled Bookmark (click to unmark), an Archive button, and a Trash2 delete button. The row SHALL NOT display a Spam (ShieldAlert) button.

#### Scenario: Important row buttons
- **WHEN** user views a row in the Important folder
- **THEN** the row shows a filled Bookmark, an Archive button, and a Trash2 button (no Spam button)

### Requirement: Important folder toolbar buttons
The Important folder toolbar SHALL display 4 buttons in this order: bulk Unmark Important (Bookmark filled), Archive, Info, Trash2.

#### Scenario: Important toolbar shows 4 buttons
- **WHEN** user views the Important folder
- **THEN** the toolbar displays Bookmark (unmark), Archive, Info, Trash2

### Requirement: Live Important folder count
The Important folder tab in the left sidebar SHALL display a count equal to the number of ids in `importantIds` whose value is truthy AND that are NOT present in `binnedMessages`, `archivedMessages`, or `spammedMessages`. The count SHALL update immediately when a message is marked, unmarked, deleted to bin, archived, or moved to spam, and when restored from any of those.

#### Scenario: Count starts at 5 on first load
- **WHEN** the Inbox page loads with no prior actions
- **THEN** the Important folder tab displays count 5

#### Scenario: Count increments when a message is marked
- **WHEN** user marks an unflagged message as Important
- **THEN** the Important folder tab count increases by 1

#### Scenario: Count decrements when a message is unmarked
- **WHEN** user unmarks a flagged message
- **THEN** the Important folder tab count decreases by 1

#### Scenario: Count decrements when a flagged message is binned
- **WHEN** user deletes a flagged message to Bin
- **THEN** the Important folder tab count decreases by 1

#### Scenario: Count restores when a binned flagged message is restored
- **WHEN** user restores a flagged message from Bin
- **THEN** the Important folder tab count increases by 1 and the message reappears in the Important folder view

#### Scenario: Count decrements when a flagged message is moved to Spam
- **WHEN** user moves a flagged message to Spam
- **THEN** the Important folder tab count decreases by 1

#### Scenario: Count restores when "Not Spam" is applied
- **WHEN** user clicks "Not Spam" on a previously-flagged message in Spam
- **THEN** the Important folder tab count increases by 1 and the message reappears in the Important folder view

### Requirement: Important translations
Translation keys SHALL exist in both `en/inbox.json` and `jp/inbox.json`:

- `list.markImportant` (per-row aria-label / tooltip when unflagged)
- `list.unmarkImportant` (per-row aria-label / tooltip when flagged)
- `list.markedImportant` (toast confirmation after marking)
- `list.unmarkedImportant` (toast confirmation after unmarking)
- `list.bulkMarkImportant` (toolbar aria-label / tooltip on inbox/starred/sent)
- `list.bulkUnmarkImportant` (toolbar aria-label / tooltip on important folder)
- `chat.markImportant` (ChatHeader button aria-label / tooltip when unflagged)
- `chat.unmarkImportant` (ChatHeader button aria-label / tooltip when flagged)

The existing `folders.important` key remains unchanged.

#### Scenario: English translations exist
- **WHEN** the app is in English locale
- **THEN** all listed keys resolve to English strings

#### Scenario: Japanese translations exist
- **WHEN** the app is in Japanese locale
- **THEN** all listed keys resolve to Japanese strings
