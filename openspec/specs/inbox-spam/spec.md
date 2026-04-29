# inbox-spam Specification

## Purpose
Provide a Spam folder in the Inbox page with pre-seeded mock spam records, user-initiated move-to-spam, bulk actions, per-row and ChatView "Not Spam" restoration, and live folder counts.

## Requirements

### Requirement: Mock spam records
The system SHALL define a `mockSpamRecords` array of 14 `EmailRecord` entries in `mockData.ts` with spammy sender names, subjects, and label assignments. Record IDs SHALL use a `"spam-"` prefix (e.g., `"spam-1"` through `"spam-14"`) to avoid collision with existing `"rec-"` IDs. Records SHALL include a mix of label types (primary, social, work, friends) and realistic spam-like content (lottery wins, phishing, fake offers, unsolicited promotions).

#### Scenario: Mock spam records exist
- **WHEN** the application loads
- **THEN** `mockSpamRecords` contains exactly 14 `EmailRecord` entries with `"spam-"` prefixed IDs

#### Scenario: Mock spam records have spammy content
- **WHEN** inspecting the mock spam records
- **THEN** sender names and subjects resemble typical spam (e.g., "Nigerian Prince Foundation", "You've Won $1,000,000!", "Verify your account immediately")

### Requirement: Spam folder filtering
When the `Spam` folder tab is active, the message list SHALL display records from two sources: (1) `mockSpamRecords` that have NOT been restored via "Not Spam", and (2) `spammedMessages` from localStorage (messages moved to spam by the user from other folders). The combined list SHALL be displayed in the spam folder view.

#### Scenario: Spam folder shows mock spam records
- **WHEN** user clicks the Spam folder tab on first load (no prior actions)
- **THEN** the message list shows exactly 14 pre-seeded spam records

#### Scenario: Spam folder shows user-spammed messages
- **WHEN** user moves a message to spam from the Inbox folder and views the Spam folder
- **THEN** the moved message appears in the spam folder alongside pre-seeded spam records

#### Scenario: Spam folder excludes restored mock records
- **WHEN** user marks a pre-seeded spam message as "Not Spam" and views the Spam folder
- **THEN** the restored message is no longer visible in the spam folder list

### Requirement: Restored spam IDs localStorage persistence
The system SHALL persist restored spam record IDs in localStorage under the key `"inbox-restored-spam-ids"` using the `useLocalStorage` hook. Restored IDs SHALL survive page refresh.

#### Scenario: Restored spam persists across refresh
- **WHEN** user marks a spam message as "Not Spam" and refreshes the page
- **THEN** the restored message is still absent from the Spam folder view

### Requirement: Per-row "Not Spam" button on spam folder
Each message row in the Spam folder SHALL display a "Not Spam" button (`ShieldCheck` icon from lucide-react) instead of archive/delete/spam buttons. Clicking the button on a **user-spammed message** (one present in `spammedMessages`) SHALL remove it from `spammedMessages` and restore it to its original source folder. Clicking the button on a **pre-seeded mock spam message** SHALL add the record's ID to the restored spam IDs set and add the record to the restored-from-spam list (making it visible in the Inbox folder). For user-spammed messages with `sourceFolder === "sent"`, restoring SHALL re-add the record to `sentMessages` localStorage. A toast notification SHALL confirm the restoration.

#### Scenario: Not Spam restores user-spammed message to inbox
- **WHEN** user moved a message from Inbox to spam, then clicks "Not Spam" on it
- **THEN** the message disappears from the Spam folder and reappears in the Inbox folder

#### Scenario: Not Spam restores user-spammed sent message to sent
- **WHEN** user moved a sent message to spam, then clicks "Not Spam" on it
- **THEN** the message disappears from the Spam folder and reappears in the Sent folder

#### Scenario: Not Spam restores pre-seeded mock spam to inbox
- **WHEN** user clicks "Not Spam" on a pre-seeded mock spam message
- **THEN** the message disappears from the Spam folder and appears in the Inbox folder (existing behavior)

#### Scenario: Not Spam toast notification
- **WHEN** user clicks the "Not Spam" button on any spam message
- **THEN** a toast notification confirms the message was marked as not spam

### Requirement: Restored spam messages appear in Inbox
Messages restored from spam via the "Not Spam" action SHALL appear in the Inbox folder's message list, included alongside mock email records and received messages. They SHALL use the same `EmailRecord` format and display normally (sender, label badge, subject, time). The Inbox folder sidebar count SHALL increment to reflect the restored message.

#### Scenario: Restored spam visible in inbox
- **WHEN** user marks a spam message as "Not Spam" and navigates to the Inbox folder
- **THEN** the restored message appears in the Inbox message list with its sender name, label, subject, and time

#### Scenario: Inbox sidebar count increments on Not Spam
- **WHEN** user marks a spam message as "Not Spam"
- **THEN** the Inbox folder sidebar count increases by 1

#### Scenario: Inbox count reflects all inbox sources
- **WHEN** the Inbox page loads
- **THEN** the Inbox folder sidebar count equals the total of received messages, restored-from-spam messages, and mock inbox records (excluding binned, archived, and spammed messages)

### Requirement: Clicking a spam item opens ChatView
When user clicks a message row in the Spam folder, the right panel SHALL switch to the ChatView displaying a conversation for that message. The ChatView header SHALL include a "Not Spam" (ShieldCheck) button alongside Archive, Info, and Trash buttons. Clicking "Not Spam" SHALL restore the message from spam and navigate back to the message list. The Archive button SHALL archive the message from spam.

#### Scenario: Spam message ChatView shows Not Spam button
- **WHEN** user clicks a message row in the Spam folder to open ChatView
- **THEN** the ChatView header displays a ShieldCheck "Not Spam" button

#### Scenario: ChatView Not Spam restores message
- **WHEN** user clicks the "Not Spam" button in the ChatView header on a spam message
- **THEN** the message is restored from spam and the view navigates back to the message list

#### Scenario: ChatView Archive on spam message
- **WHEN** user clicks the Archive button in the ChatView header on a spam message
- **THEN** the message is archived

### Requirement: Live spam folder count
The `Spam` folder tab in the left sidebar SHALL display a count equal to `(mockSpamRecords.length - restoredSpamIds.length) + spammedMessages.length`. The count SHALL update immediately when a message is moved to spam, marked as "Not Spam", or restored.

#### Scenario: Spam count starts at 14
- **WHEN** the Inbox page loads with no prior spam actions
- **THEN** the Spam folder tab displays count 14

#### Scenario: Spam count increments when message moved to spam
- **WHEN** user moves a message to spam from the Inbox folder
- **THEN** the Spam folder tab count increases by 1 (e.g., 14 -> 15)

#### Scenario: Spam count decrements on Not Spam
- **WHEN** user marks a spam message as "Not Spam"
- **THEN** the Spam folder tab count decreases by 1

### Requirement: Spam toolbar buttons unchanged
The Spam folder toolbar SHALL display 4 buttons: ShieldCheck "Not Spam" (bulk restore), Archive (bulk archive), Info, and Trash. The Not Spam button SHALL restore selected spam messages. The Archive button SHALL archive selected spam messages. The Info button SHALL show message info. The Trash button SHALL show "Coming soon" toast.

#### Scenario: Toolbar shows 4 buttons on spam folder
- **WHEN** user is viewing the Spam folder
- **THEN** the toolbar displays 4 buttons: Not Spam (ShieldCheck), Archive, Info, Trash

#### Scenario: Toolbar Archive on spam folder archives selected messages
- **WHEN** user selects messages in the Spam folder and clicks the toolbar Archive button
- **THEN** the selected messages are archived and the selection is cleared

#### Scenario: Toolbar Archive on spam folder with no selection
- **WHEN** user clicks the toolbar Archive button with no messages selected in the Spam folder
- **THEN** a "No messages selected" toast is displayed

### Requirement: Spam translations
Translation keys SHALL exist in both `en/inbox.json` and `jp/inbox.json` for: "Not Spam" button aria-label (`list.notSpam`), "Not Spam" confirmation toast (`list.markedNotSpam`). The existing `folders.spam` key already exists in both locales.

#### Scenario: Translations exist in English
- **WHEN** the app is in English locale
- **THEN** the "Not Spam" button and confirmation toast display English text

#### Scenario: Translations exist in Japanese
- **WHEN** the app is in Japanese locale
- **THEN** the "Not Spam" button and confirmation toast display Japanese text
