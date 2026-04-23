# inbox-compose Specification

## Purpose

Defines the behavioral requirements for the Inbox compose view: composing new messages, form validation, sending messages to localStorage, and returning to the message list.

## Requirements

### Requirement: Compose view replaces right panel
Clicking the "+ Compose" button in the sidebar SHALL replace the right content panel with the ComposeView component. The sidebar SHALL remain visible and interactive. The compose view SHALL be contained in a card matching the styling of the MessageList and ChatView panels.

#### Scenario: Open compose view
- **WHEN** user clicks the "+ Compose" button
- **THEN** the right panel displays the compose view with To, Subject, and Body fields, and the sidebar remains visible

#### Scenario: Compose clears selected conversation
- **WHEN** user is viewing a chat conversation and clicks "+ Compose"
- **THEN** the chat view is replaced by the compose view

### Requirement: Compose form fields
The compose view SHALL contain three fields: a "To" email input (required), a "Subject" text input (required), and a "Body" textarea (required). All field labels SHALL use i18n translation keys from the `inbox` namespace.

#### Scenario: Form renders with all fields
- **WHEN** the compose view is displayed
- **THEN** three labeled form fields are visible: To, Subject, and Body, all initially empty

#### Scenario: Body field is a multi-line textarea
- **WHEN** user types in the Body field
- **THEN** the input is a textarea that allows multiple lines of text

### Requirement: Compose header
The compose view SHALL display a header bar with a title (e.g., "New Message") and a close button (X icon). Clicking the close button SHALL return to the message list view.

#### Scenario: Header renders with title and close button
- **WHEN** the compose view is displayed
- **THEN** a header bar shows "New Message" (translated) and an X close button

#### Scenario: Close button returns to message list
- **WHEN** user clicks the close (X) button in the compose header
- **THEN** the compose view closes and the message list is displayed

### Requirement: Send button with validation
The compose view SHALL display a "Send" button. Clicking Send SHALL validate that all three fields (To, Subject, Body) are non-empty. If validation fails, empty fields SHALL be highlighted with an error style.

#### Scenario: Send with all fields filled
- **WHEN** user fills in To, Subject, and Body and clicks "Send"
- **THEN** the message is sent successfully

#### Scenario: Send with empty To field
- **WHEN** user leaves the To field empty and clicks "Send"
- **THEN** the To field is highlighted with an error style and the message is not sent

#### Scenario: Send with empty Subject field
- **WHEN** user leaves the Subject field empty and clicks "Send"
- **THEN** the Subject field is highlighted with an error style and the message is not sent

#### Scenario: Send with empty Body field
- **WHEN** user leaves the Body field empty and clicks "Send"
- **THEN** the Body field is highlighted with an error style and the message is not sent

### Requirement: Send persists to localStorage
On successful send, the compose view SHALL create a `SentMessage` record with a unique id, recipientEmail, subject, body, and sentAt (ISO timestamp), append it to the `"inbox-sent-messages"` localStorage array, show a success toast ("Message sent"), and return to the message list.

#### Scenario: Successful send persists message
- **WHEN** user fills all fields and clicks Send
- **THEN** a new entry is appended to the `"inbox-sent-messages"` localStorage key, a "Message sent" toast is displayed, and the compose view closes to the message list

#### Scenario: Sent data structure
- **WHEN** a message is sent
- **THEN** the localStorage entry contains id (unique string), recipientEmail, subject, body, and sentAt (ISO timestamp string)

### Requirement: Cancel button
The compose view SHALL display a "Cancel" button. Clicking Cancel SHALL close the compose view and return to the message list without saving any data.

#### Scenario: Cancel discards compose
- **WHEN** user clicks "Cancel" in the compose view
- **THEN** the compose view closes, the message list is displayed, and no data is saved

### Requirement: Theme support
The compose view SHALL support all three themes (light, dark, forest) using CSS custom properties and Tailwind utility classes. No hardcoded colors.

#### Scenario: Theme switching
- **WHEN** user switches between light, dark, and forest themes while the compose view is open
- **THEN** all compose view elements (card, inputs, buttons, text) adapt colors appropriately

### Requirement: Internationalization
All user-visible text in the compose view SHALL use i18n translation keys from the `inbox` namespace. Translation keys SHALL exist in both `en/inbox.json` and `jp/inbox.json`.

#### Scenario: Language switching
- **WHEN** user switches from English to Japanese while the compose view is open
- **THEN** all compose view labels, buttons, and placeholders display in Japanese

### Requirement: Accessibility
The close button SHALL have an `aria-label` attribute sourced from an i18n key. All form fields SHALL have associated `<label>` elements. The Send and Cancel buttons SHALL be accessible with clear text labels.

#### Scenario: Screen reader announces close button
- **WHEN** a screen reader user navigates to the close button
- **THEN** the screen reader announces its purpose via the aria-label
