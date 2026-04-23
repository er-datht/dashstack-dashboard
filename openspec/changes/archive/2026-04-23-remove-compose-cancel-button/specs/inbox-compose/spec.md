## REMOVED Requirements

### Requirement: Cancel button in ComposeView footer
**Reason**: Redundant — the X close button in the ComposeView header already provides the same dismiss functionality.
**Migration**: Users use the X button in the header to close the compose view.

## MODIFIED Requirements

### Requirement: ComposeView footer actions
The ComposeView footer SHALL display only the Save as Draft button and the Send button. The footer SHALL NOT include a Cancel button.

#### Scenario: Footer renders without Cancel button
- **WHEN** the ComposeView is displayed
- **THEN** the footer contains only the "Save as Draft" button and the "Send" button
- **THEN** no Cancel button is present in the footer

#### Scenario: User dismisses compose view
- **WHEN** the user wants to close the compose view without saving or sending
- **THEN** the user clicks the X button in the ComposeView header
