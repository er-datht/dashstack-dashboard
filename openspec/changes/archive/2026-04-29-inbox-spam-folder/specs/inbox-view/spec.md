## MODIFIED Requirements

### Requirement: Starred folder filtering
When the `Starred` folder tab is active, the message list SHALL display only records whose current starred state is true AND which are NOT in the bin AND which are NOT in the archive AND which are NOT in the spam folder (i.e., their ID is not in `mockSpamRecords` unless they have been restored via "Not Spam"), drawn from ALL record sources (inbox, sent, and draft). All other folder tabs SHALL display their folder-specific records (unchanged behavior). Switching folders SHALL reset pagination to page 1.

#### Scenario: Starred folder shows only starred records
- **WHEN** user clicks the `Starred` folder tab
- **THEN** only records currently marked as starred and not in the bin, archive, or spam are visible in the message list, including starred records from inbox, sent, and draft sources

#### Scenario: Archived starred message excluded from Starred folder
- **WHEN** user archives a starred message
- **THEN** the message does not appear in the Starred folder view

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

#### Scenario: Spam record excluded from Starred folder
- **WHEN** a mock spam record has a starred state
- **THEN** that record does not appear in the Starred folder view (spam records are excluded)

#### Scenario: Restored spam record eligible for Starred folder
- **WHEN** user marks a spam message as "Not Spam" and stars it in the Inbox folder
- **THEN** the restored message appears in the Starred folder view

### Requirement: Message list rows
The message list SHALL display email records as table-like rows separated by bottom borders. Each row SHALL contain, left to right: a checkbox (unchecked, bordered square), a star icon (outlined), the sender name (medium weight, truncated to ~168px), a color-coded label badge (Primary/Social/Work/Friends) OR an add-label `Tag` icon button when `labelId` is empty, the message subject/preview (truncated, regular weight), and a timestamp on the far right. When the active folder is `"draft"`, each row SHALL additionally display an Archive icon button followed by a trash icon button for deleting the draft. When the active folder is one of `"inbox"`, `"starred"`, `"sent"`, `"important"`, each row SHALL additionally display an Archive icon button followed by a Trash2 icon button. When the active folder is `"bin"` or `"archive"`, each row SHALL display a RotateCcw restore icon button instead. When the active folder is `"spam"`, each row SHALL display a ShieldCheck "Not Spam" icon button instead.

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

#### Scenario: Spam row displays Not Spam icon
- **WHEN** the Spam folder is active
- **THEN** each row shows a ShieldCheck "Not Spam" button on the right side
