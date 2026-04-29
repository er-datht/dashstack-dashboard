## MODIFIED Requirements

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

### Requirement: Live spam folder count
The `Spam` folder tab in the left sidebar SHALL display a count equal to `(mockSpamRecords.length - restoredSpamIds.length) + spammedMessages.length`. The count SHALL update immediately when a message is moved to spam, marked as "Not Spam", or restored.

#### Scenario: Spam count starts at 14
- **WHEN** the Inbox page loads with no prior spam actions
- **THEN** the Spam folder tab displays count 14

#### Scenario: Spam count increments when message moved to spam
- **WHEN** user moves a message to spam from the Inbox folder
- **THEN** the Spam folder tab count increases by 1 (e.g., 14 → 15)

#### Scenario: Spam count decrements on Not Spam
- **WHEN** user marks a spam message as "Not Spam"
- **THEN** the Spam folder tab count decreases by 1

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
