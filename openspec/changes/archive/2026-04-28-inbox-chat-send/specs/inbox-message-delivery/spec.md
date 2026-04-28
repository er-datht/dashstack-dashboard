## ADDED Requirements

### Requirement: DeliveredMessage type
The system SHALL define a `DeliveredMessage` type in `src/types/inbox.ts` with fields: `id` (string), `senderEmail` (string), `senderName` (string), `recipientEmail` (string), `subject` (string), `body` (string), `sentAt` (string, ISO timestamp).

#### Scenario: DeliveredMessage type structure
- **WHEN** a message is delivered cross-user
- **THEN** it is stored as a `DeliveredMessage` object with all required fields

### Requirement: Cross-user message storage
All delivered messages SHALL be stored in localStorage under the key `"inbox-delivered-messages"` as a JSON array of `DeliveredMessage` objects. Both ComposeView send and ChatInput send SHALL append to this array.

#### Scenario: ComposeView delivers message
- **WHEN** user sends a message via ComposeView with recipientEmail "bob@example.com"
- **THEN** a `DeliveredMessage` with `recipientEmail: "bob@example.com"` and sender info from `getStoredUser()` is appended to `"inbox-delivered-messages"`

#### Scenario: ChatInput delivers message
- **WHEN** user sends a chat message in a conversation with a contact whose email is "ethan@example.com"
- **THEN** a `DeliveredMessage` with `recipientEmail: "ethan@example.com"` and sender info from `getStoredUser()` is appended to `"inbox-delivered-messages"`

### Requirement: Sender identity from auth
The sender's name and email in `DeliveredMessage` SHALL be sourced from `getStoredUser()`. If no user is logged in (null), the message SHALL NOT be delivered (silent no-op).

#### Scenario: Sender info captured from session
- **WHEN** a logged-in user with name "Alice" and email "alice@example.com" sends a message
- **THEN** the `DeliveredMessage` has `senderName: "Alice"` and `senderEmail: "alice@example.com"`

#### Scenario: No delivery when not logged in
- **WHEN** a message send is attempted with no logged-in user
- **THEN** no `DeliveredMessage` is created

### Requirement: Delivered messages survive logout
The `"inbox-delivered-messages"` localStorage key SHALL NOT be cleared when a user logs out (`clearTokens()`). Delivered messages are cross-user data and must persist across login sessions.

#### Scenario: Messages persist after logout
- **WHEN** user A sends a message to user B, then user A logs out
- **THEN** the delivered message is still present in `"inbox-delivered-messages"` localStorage
