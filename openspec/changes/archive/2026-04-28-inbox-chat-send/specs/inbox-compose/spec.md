## MODIFIED Requirements

### Requirement: Send persists to localStorage
On successful send, the compose view SHALL create a `SentMessage` record with a unique id, recipientEmail, subject, body, and sentAt (ISO timestamp), append it to the `"inbox-sent-messages"` localStorage array, show a success toast ("Message sent"), and return to the message list. Additionally, the compose view SHALL deliver the message to the recipient by appending a `DeliveredMessage` record (with sender name and email from `getStoredUser()`) to the `"inbox-delivered-messages"` localStorage array.

#### Scenario: Successful send persists message and delivers to recipient
- **WHEN** user fills all fields and clicks Send
- **THEN** a new entry is appended to `"inbox-sent-messages"`, a new `DeliveredMessage` entry is appended to `"inbox-delivered-messages"` with the sender's name and email from the current user session, a "Message sent" toast is displayed, and the compose view closes

#### Scenario: Sent data structure
- **WHEN** a message is sent
- **THEN** the `"inbox-sent-messages"` entry contains id, recipientEmail, subject, body, and sentAt; the `"inbox-delivered-messages"` entry contains id, senderEmail, senderName, recipientEmail, subject, body, and sentAt

#### Scenario: Delivered message visible to recipient
- **WHEN** user A sends a message to user B via compose, and user B logs in
- **THEN** user B sees the message from user A in their inbox folder
