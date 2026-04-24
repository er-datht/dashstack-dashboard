# inbox-info-modal Specification

## Purpose

Defines the behavioral requirements for the Info modal dialog on the Inbox page: displaying message metadata, bulk selection support, dismiss behavior, accessibility, theme support, and internationalization.

## Requirements

### Requirement: Info modal displays message metadata
The InfoModal component SHALL render as a centered overlay modal dialog displaying read-only metadata about a message. The modal SHALL display: sender/contact name, subject line, label (with colored badge matching the label color), date and time, starred status (star icon filled/unfilled), and folder name. The modal SHALL have a title "Message Info" and an X icon close button in the top-right corner of the header (no bottom close button). Truncated text fields (e.g., long subject lines) SHALL show the full content via a react-tooltip on hover.

#### Scenario: Info modal renders with message data
- **WHEN** the info modal is opened with message data
- **THEN** the modal displays the sender name, subject, label badge, time, starred indicator, and folder in a structured layout

#### Scenario: Info modal renders with conversation data from chat
- **WHEN** the info modal is opened from the chat header
- **THEN** the modal displays the contact name, subject, label badge, time, and starred indicator for the current conversation

### Requirement: Info modal with bulk selection
When the info modal is triggered from the MessageList toolbar with multiple messages selected, the modal SHALL display info for the currently viewed message with a dynamic counter showing the position (e.g., "2 of 4 selected"). Previous and Next navigation buttons SHALL allow browsing through all selected messages. The Previous button SHALL be disabled on the first message. The Next button SHALL be disabled on the last message. When only one message is selected, no navigation buttons or counter SHALL be shown.

#### Scenario: Multiple messages selected
- **WHEN** user selects 3 messages and clicks the toolbar info button
- **THEN** the modal shows metadata for the first selected message with "1 of 3 selected" counter text and Previous/Next navigation buttons

#### Scenario: Single message selected
- **WHEN** user selects 1 message and clicks the toolbar info button
- **THEN** the modal shows metadata for the selected message without navigation buttons or counter

#### Scenario: Navigate to next message
- **WHEN** user clicks the Next button while viewing message 1 of 3
- **THEN** the modal updates to show metadata for the second message with "2 of 3 selected" counter

#### Scenario: Navigate to previous message
- **WHEN** user clicks the Previous button while viewing message 2 of 3
- **THEN** the modal updates to show metadata for the first message with "1 of 3 selected" counter

#### Scenario: Previous button disabled on first message
- **WHEN** the modal is showing the first selected message (1 of N)
- **THEN** the Previous button is disabled

#### Scenario: Next button disabled on last message
- **WHEN** the modal is showing the last selected message (N of N)
- **THEN** the Next button is disabled

#### Scenario: Navigation resets when modal reopens
- **WHEN** user closes the info modal and reopens it with a new selection
- **THEN** the modal starts at the first message (1 of N)

### Requirement: Info modal dismiss
The info modal SHALL be dismissible by clicking the close button, pressing Escape, or clicking the overlay backdrop.

#### Scenario: Close via X icon button
- **WHEN** user clicks the X icon button in the modal header
- **THEN** the modal closes

#### Scenario: Close via Escape key
- **WHEN** user presses Escape while the modal is open
- **THEN** the modal closes

#### Scenario: Close via overlay click
- **WHEN** user clicks the backdrop overlay outside the modal card
- **THEN** the modal closes

### Requirement: Info modal accessibility
The info modal SHALL use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the modal title. The modal SHALL trap focus within itself while open. The modal SHALL lock body scroll while open. Initial focus SHALL be placed on the X icon close button.

#### Scenario: Screen reader announces modal
- **WHEN** the info modal opens
- **THEN** the modal is announced as a dialog with the title "Message Info"

#### Scenario: Focus is trapped
- **WHEN** user presses Tab while the modal is open
- **THEN** focus cycles within the modal and does not escape to background content

### Requirement: Info modal theme support
The info modal SHALL support all three themes (light, dark, forest) using CSS custom properties for colors, backgrounds, and borders. No hardcoded color values.

#### Scenario: Modal renders in dark theme
- **WHEN** the app theme is set to dark
- **THEN** the modal overlay, card, and text use dark theme CSS custom property values

### Requirement: Info modal internationalization
All text in the info modal (title, field labels, close button) SHALL use i18n translation keys from the `inbox` namespace. Keys SHALL exist in both `en/inbox.json` and `jp/inbox.json`.

#### Scenario: Modal text in Japanese
- **WHEN** user switches language to Japanese and opens the info modal
- **THEN** all modal text (title, labels, close) is displayed in Japanese
