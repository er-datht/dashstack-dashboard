## ADDED Requirements

### Requirement: Mock spam records
The system SHALL define a `mockSpamRecords` array of 14 `EmailRecord` entries in `mockData.ts` with spammy sender names, subjects, and label assignments. Record IDs SHALL use a `"spam-"` prefix (e.g., `"spam-1"` through `"spam-14"`) to avoid collision with existing `"rec-"` IDs. Records SHALL include a mix of label types (primary, social, work, friends) and realistic spam-like content (lottery wins, phishing, fake offers, unsolicited promotions).

#### Scenario: Mock spam records exist
- **WHEN** the application loads
- **THEN** `mockSpamRecords` contains exactly 14 `EmailRecord` entries with `"spam-"` prefixed IDs

#### Scenario: Mock spam records have spammy content
- **WHEN** inspecting the mock spam records
- **THEN** sender names and subjects resemble typical spam (e.g., "Nigerian Prince Foundation", "You've Won $1,000,000!", "Verify your account immediately")

### Requirement: Spam folder filtering
When the `Spam` folder tab is active, the message list SHALL display only records from `mockSpamRecords` that have NOT been restored via "Not Spam". The spam folder SHALL start with all 14 mock records visible. Records restored via "Not Spam" SHALL be excluded from the spam folder view.

#### Scenario: Spam folder shows mock spam records
- **WHEN** user clicks the Spam folder tab on first load (no prior "Not Spam" actions)
- **THEN** the message list shows exactly 14 spam records

#### Scenario: Spam folder excludes restored records
- **WHEN** user marks a spam message as "Not Spam" and views the Spam folder
- **THEN** the restored message is no longer visible in the spam folder list and 13 records remain

### Requirement: Restored spam IDs localStorage persistence
The system SHALL persist restored spam record IDs in localStorage under the key `"inbox-restored-spam-ids"` using the `useLocalStorage` hook. Restored IDs SHALL survive page refresh.

#### Scenario: Restored spam persists across refresh
- **WHEN** user marks a spam message as "Not Spam" and refreshes the page
- **THEN** the restored message is still absent from the Spam folder view

### Requirement: Per-row "Not Spam" button on spam folder
Each message row in the Spam folder SHALL display a "Not Spam" button (`ShieldCheck` icon from lucide-react) instead of archive/delete buttons. Clicking the button SHALL add the record's ID to the restored spam IDs set, remove the record from the Spam folder view, add the record to the restored-from-spam list (making it visible in the Inbox folder), and show a toast notification confirming the action. The button SHALL NOT appear on any other folder's rows.

#### Scenario: Not Spam button visible in spam folder
- **WHEN** user is viewing the Spam folder
- **THEN** each row displays a ShieldCheck "Not Spam" button

#### Scenario: Not Spam button not visible in inbox folder
- **WHEN** user is viewing the Inbox folder
- **THEN** rows do not display a "Not Spam" button

#### Scenario: Not Spam restores message to inbox
- **WHEN** user clicks the "Not Spam" button on a spam message row
- **THEN** the message disappears from the Spam folder, appears in the Inbox folder list, and the spam count decrements by 1

#### Scenario: Not Spam toast notification
- **WHEN** user clicks the "Not Spam" button on a spam message row
- **THEN** a toast notification confirms the message was marked as not spam

### Requirement: Restored spam messages appear in Inbox
Messages restored from spam via the "Not Spam" action SHALL appear in the Inbox folder's message list, included alongside mock email records and received messages. They SHALL use the same `EmailRecord` format and display normally (sender, label badge, subject, time).

#### Scenario: Restored spam visible in inbox
- **WHEN** user marks a spam message as "Not Spam" and navigates to the Inbox folder
- **THEN** the restored message appears in the Inbox message list with its sender name, label, subject, and time

### Requirement: Clicking a spam item opens ChatView
When user clicks a message row in the Spam folder, the right panel SHALL switch to the ChatView displaying a conversation for that message, identical to clicking a message in the Bin or Archive folder.

#### Scenario: Spam message opens chat
- **WHEN** user clicks a message row in the Spam folder
- **THEN** the ChatView opens showing a conversation for that message

### Requirement: Live spam folder count
The `Spam` folder tab in the left sidebar SHALL display a count equal to 14 minus the number of restored spam IDs. The count SHALL override the static count (14) in mock data via `folderCountOverrides`. The count SHALL update immediately when a message is marked as "Not Spam".

#### Scenario: Spam count starts at 14
- **WHEN** the Inbox page loads with no prior "Not Spam" actions
- **THEN** the Spam folder tab displays count 14

#### Scenario: Spam count decrements on Not Spam
- **WHEN** user marks a spam message as "Not Spam"
- **THEN** the Spam folder tab count decreases by 1

#### Scenario: Spam count persists across refresh
- **WHEN** user marks 3 spam messages as "Not Spam" and refreshes the page
- **THEN** the Spam folder tab displays count 11

### Requirement: Spam toolbar buttons unchanged
The toolbar's first action button SHALL continue to display a `Download` icon (neutral placeholder) with "Coming soon" toast when the Spam folder is active. The toolbar trash button SHALL continue to show "Coming soon" toast for the Spam folder. No changes to existing toolbar behavior.

#### Scenario: Toolbar download on spam folder
- **WHEN** user clicks the toolbar's first button while viewing the Spam folder
- **THEN** a "Coming soon" toast is displayed

#### Scenario: Toolbar trash on spam folder
- **WHEN** user clicks the toolbar trash button while viewing the Spam folder
- **THEN** a "Coming soon" toast is displayed

### Requirement: Spam translations
Translation keys SHALL exist in both `en/inbox.json` and `jp/inbox.json` for: "Not Spam" button aria-label (`list.notSpam`), "Not Spam" confirmation toast (`list.markedNotSpam`). The existing `folders.spam` key already exists in both locales.

#### Scenario: Translations exist in English
- **WHEN** the app is in English locale
- **THEN** the "Not Spam" button and confirmation toast display English text

#### Scenario: Translations exist in Japanese
- **WHEN** the app is in Japanese locale
- **THEN** the "Not Spam" button and confirmation toast display Japanese text
