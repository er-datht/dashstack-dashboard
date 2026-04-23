## MODIFIED Requirements

### Requirement: Compose button
The left panel SHALL display a full-width blue "+ Compose" button at the top. Clicking the button SHALL open the compose view in the right content panel, replacing the current message list or chat view.

#### Scenario: Compose button click
- **WHEN** user clicks the "+ Compose" button
- **THEN** the right content panel displays the compose view

## ADDED Requirements

### Requirement: Sent folder displays composed messages
When the `Sent` folder tab is active, the message list SHALL display messages that were composed and sent by the user (loaded from the `"inbox-sent-messages"` localStorage key), converted to the email record format. Each sent record SHALL show "Me" as the sender name, no label badge, the subject, and a formatted time. If no sent messages exist in localStorage, the message list SHALL be empty.

#### Scenario: Sent folder shows localStorage messages
- **WHEN** user clicks the "Sent" folder tab and there are sent messages in localStorage
- **THEN** the message list displays only the sent messages with "Me" as sender, subject, and time

#### Scenario: Sent folder with no messages
- **WHEN** user clicks the "Sent" folder tab and there are no sent messages in localStorage
- **THEN** the message list is empty (no records displayed)

#### Scenario: Newly sent message appears in Sent folder
- **WHEN** user composes and sends a message, then navigates to the Sent folder
- **THEN** the newly sent message appears in the Sent folder list

### Requirement: Dynamic Sent folder count
The `Sent` folder tab in the left sidebar SHALL display a count equal to the current number of sent messages stored in localStorage. The count SHALL update immediately when a new message is sent via compose.

#### Scenario: Sent count reflects localStorage state
- **WHEN** the Inbox page loads
- **THEN** the Sent folder tab count equals the number of entries in the `"inbox-sent-messages"` localStorage key

#### Scenario: Sent count increments after compose
- **WHEN** user sends a message via compose
- **THEN** the Sent folder tab count increases by 1
