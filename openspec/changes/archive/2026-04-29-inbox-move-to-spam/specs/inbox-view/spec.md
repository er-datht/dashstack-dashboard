## MODIFIED Requirements

### Requirement: Message list rows
The message list SHALL display email records as table-like rows separated by bottom borders. Each row SHALL contain, left to right: a checkbox (unchecked, bordered square), a star icon (outlined), the sender name (medium weight, truncated to ~168px), a color-coded label badge (Primary/Social/Work/Friends) OR an add-label `Tag` icon button when `labelId` is empty, the message subject/preview (truncated, regular weight), and a timestamp on the far right. When the active folder is `"draft"`, each row SHALL additionally display an Archive icon button followed by a trash icon button for deleting the draft. When the active folder is one of `"inbox"`, `"starred"`, `"sent"`, each row SHALL additionally display an Archive icon button, followed by an AlertTriangle spam icon button, followed by a Trash2 icon button. When the active folder is `"important"`, each row SHALL display an Archive icon button followed by a Trash2 icon button (no spam button). When the active folder is `"bin"` or `"archive"`, each row SHALL display a RotateCcw restore icon button instead. When the active folder is `"spam"`, each row SHALL display a ShieldCheck "Not Spam" icon button instead.

#### Scenario: Inbox row displays archive, spam, and delete-to-bin icons
- **WHEN** the Inbox folder is active
- **THEN** each row shows an Archive button, then an AlertTriangle spam button, then a Trash2 delete button

#### Scenario: Sent row displays archive, spam, and delete-to-bin icons
- **WHEN** the Sent folder is active
- **THEN** each row shows an Archive button, then an AlertTriangle spam button, then a Trash2 delete button

#### Scenario: Starred row displays archive, spam, and delete-to-bin icons
- **WHEN** the Starred folder is active
- **THEN** each row shows an Archive button, then an AlertTriangle spam button, then a Trash2 delete button

#### Scenario: Important row does not display spam icon
- **WHEN** the Important folder is active
- **THEN** each row shows an Archive button and a Trash2 delete button (no spam button)

#### Scenario: Bin row displays restore icon
- **WHEN** the Bin folder is active
- **THEN** each row shows a RotateCcw restore button on the right side

#### Scenario: Archive row displays restore icon
- **WHEN** the Archive folder is active
- **THEN** each row shows a RotateCcw restore button on the right side

#### Scenario: Spam row displays Not Spam icon
- **WHEN** the Spam folder is active
- **THEN** each row shows a ShieldCheck "Not Spam" button on the right side

### Requirement: Message list header
The message list view SHALL display a top bar with a select-all checkbox on the far left, a search input (rounded, placeholder "Search") to its right, and grouped action buttons with segmented borders on the right. The first toolbar button is context-sensitive: on archive-eligible folders (`inbox`, `starred`, `sent`, `important`, `draft`) it displays an `Archive` icon for bulk archive; on the `archive` folder it displays a `RotateCcw` (Unarchive) icon for bulk unarchive; on non-eligible folders (`spam`, `bin`) it displays a `Download` icon as a neutral placeholder with "Coming soon" behavior. The toolbar info button SHALL open the info modal. On spam-eligible folders (`inbox`, `starred`, `sent`), the toolbar SHALL include an `AlertTriangle` spam button between the info button and the trash button for bulk move-to-spam. The toolbar trash button SHALL perform bulk delete-to-bin on eligible folders.

#### Scenario: Toolbar shows spam button on inbox folder
- **WHEN** user is viewing the Inbox folder
- **THEN** the toolbar displays 4 buttons: Archive, Info, Spam (AlertTriangle), Trash2

#### Scenario: Toolbar shows spam button on sent folder
- **WHEN** user is viewing the Sent folder
- **THEN** the toolbar displays 4 buttons: Archive, Info, Spam (AlertTriangle), Trash2

#### Scenario: Toolbar does not show spam button on important folder
- **WHEN** user is viewing the Important folder
- **THEN** the toolbar displays 3 buttons: Archive, Info, Trash2 (no spam button)

#### Scenario: Toolbar does not show spam button on draft folder
- **WHEN** user is viewing the Draft folder
- **THEN** the toolbar displays 3 buttons: Archive, Info, Trash2 (no spam button)

#### Scenario: Toolbar does not show spam button on spam folder
- **WHEN** user is viewing the Spam folder
- **THEN** the toolbar displays 3 buttons: Download, Info, Trash2 (no spam button)

### Requirement: Starred folder filtering
When the `Starred` folder tab is active, the message list SHALL display only records whose current starred state is true AND which are NOT in the bin AND which are NOT in the archive AND which are NOT in `spammedMessages`, drawn from ALL record sources (inbox, sent, draft, and restored-from-spam). All other folder tabs SHALL display their folder-specific records (unchanged behavior). Switching folders SHALL reset pagination to page 1.

#### Scenario: Spammed starred message excluded from Starred folder
- **WHEN** user moves a starred message to spam
- **THEN** the message does not appear in the Starred folder view

#### Scenario: Restored starred message reappears in Starred folder
- **WHEN** user moves a starred message to spam, then marks it "Not Spam"
- **THEN** the message reappears in the Starred folder view with its star intact
