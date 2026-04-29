## MODIFIED Requirements

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
