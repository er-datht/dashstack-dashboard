## MODIFIED Requirements

### Requirement: Chat input area
The right panel bottom SHALL display a text input area with placeholder text, action icons (mic, attachment, image), and a blue "Send" button. The input SHALL be a controlled text field. Clicking the Send button or pressing Enter SHALL send the current input text as a new message in the conversation and deliver it to the recipient's inbox via localStorage. Empty or whitespace-only input SHALL be silently ignored (no action, no error). After a successful send, the input field SHALL be cleared. The mic, attachment, and image action icons SHALL display a "Coming soon" toast when clicked.

#### Scenario: Send message via Send button
- **WHEN** user types "Hello there" in the chat input and clicks the Send button
- **THEN** a new sent message bubble with body "Hello there" appears at the bottom of the conversation, right-aligned with blue background, the input field is cleared, and the message is delivered to the recipient's inbox in localStorage

#### Scenario: Send message via Enter key
- **WHEN** user types "Quick update" in the chat input and presses Enter
- **THEN** a new sent message bubble with body "Quick update" appears at the bottom of the conversation, the input field is cleared, and the message is delivered to the recipient's inbox

#### Scenario: Empty input ignored on Send click
- **WHEN** user clicks the Send button with an empty input field
- **THEN** no message is sent and no toast or error is displayed

#### Scenario: Whitespace-only input ignored
- **WHEN** user types only spaces in the chat input and clicks Send
- **THEN** no message is sent and the input is not cleared

#### Scenario: Attachment icons remain Coming soon
- **WHEN** user clicks the mic, paperclip, or image icon
- **THEN** a "Coming soon" toast is displayed

## ADDED Requirements

### Requirement: Chat auto-scroll on send
The chat messages area SHALL automatically scroll to the bottom when a new message is sent, ensuring the newly sent message is visible.

#### Scenario: Auto-scroll after sending
- **WHEN** user sends a message in a conversation with enough messages to require scrolling
- **THEN** the chat area scrolls to the bottom so the new message is visible

### Requirement: Sent chat message rendering
New messages sent via the chat input SHALL be rendered as sent message bubbles (right-aligned, blue background, white text) with a timestamp reflecting the time they were sent. They SHALL use the same visual treatment as existing sent messages.

#### Scenario: Sent message appears as blue bubble
- **WHEN** a chat message is sent
- **THEN** the message appears as a right-aligned bubble with blue background and white text, matching the existing sent message style

#### Scenario: Sent message shows current time
- **WHEN** a chat message is sent
- **THEN** the message bubble displays the current time formatted according to the active locale

### Requirement: Received messages in inbox folder
When the inbox folder is active and a user is logged in, the message list SHALL include messages delivered to the current user (from `inbox-delivered-messages` in localStorage, filtered by `recipientEmail === currentUser.email`). Received messages SHALL be prepended to the mock records so they appear at the top. Each received message row SHALL display the sender's name, the subject, and the sent time.

#### Scenario: Received message appears in inbox
- **WHEN** user A sends a message to user B via chat or compose, and user B logs in and views the Inbox folder
- **THEN** the message from user A appears as a row in user B's inbox message list with sender name, subject, and time

#### Scenario: No received messages for different user
- **WHEN** user C logs in and no messages have been sent to user C's email
- **THEN** the inbox shows only the default mock records with no additional rows

### Requirement: EmailRecord includes sender email
The `EmailRecord` type SHALL include an optional `senderEmail` field. Mock email records SHALL be populated with plausible mock email addresses. The sender email SHALL be used as the recipient email when sending messages from the chat view.

#### Scenario: Mock records have sender emails
- **WHEN** the inbox page loads
- **THEN** each mock email record includes a `senderEmail` field with a plausible email address
