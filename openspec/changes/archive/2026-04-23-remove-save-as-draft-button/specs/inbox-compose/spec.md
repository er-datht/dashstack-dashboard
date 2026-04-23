## REMOVED Requirements

### Requirement: Save as Draft button in ComposeView footer
**Reason**: Redundant — auto-save on unmount already persists drafts when the user leaves the compose view via any exit path (X close, folder switch, page navigation).
**Migration**: Drafts are saved automatically on unmount. No user action required.

## MODIFIED Requirements

### Requirement: ComposeView footer actions
The ComposeView footer SHALL display only the Send button. The footer SHALL NOT include a Save as Draft button or a Cancel button.

#### Scenario: Footer renders with Send button only
- **WHEN** the ComposeView is displayed
- **THEN** the footer contains only the "Send" button
- **THEN** no "Save as Draft" button is present in the footer

### Requirement: Draft persistence via auto-save on unmount
When the ComposeView unmounts, the component SHALL automatically save the current field values as a draft if any field has content.

#### Scenario: Draft auto-saved on close
- **WHEN** the user closes the compose view (via X button) with content in any field
- **THEN** the draft is automatically saved to localStorage without explicit user action
