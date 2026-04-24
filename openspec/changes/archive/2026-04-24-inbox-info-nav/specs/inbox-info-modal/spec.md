## MODIFIED Requirements

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
