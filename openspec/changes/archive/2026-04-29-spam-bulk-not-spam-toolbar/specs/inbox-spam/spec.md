## MODIFIED Requirements

### Requirement: Spam toolbar buttons unchanged
The toolbar's first action button SHALL display a `ShieldCheck` icon with label "Not Spam" when the Spam folder is active and `onBulkNotSpam` is provided. Clicking the button with selected messages SHALL restore all selected spam messages via the bulk not-spam handler and clear the selection. Clicking with no selection SHALL show a "No messages selected" toast. The toolbar trash button SHALL continue to show "Coming soon" toast for the Spam folder.

#### Scenario: Toolbar shows ShieldCheck on spam folder
- **WHEN** user is viewing the Spam folder
- **THEN** the toolbar's first button displays a ShieldCheck icon with "Not Spam" label

#### Scenario: Bulk Not Spam with selected messages
- **WHEN** user selects 2 spam messages and clicks the toolbar "Not Spam" button
- **THEN** both messages are restored from spam, the selection is cleared, and the spam count decrements by 2

#### Scenario: Bulk Not Spam with no selection
- **WHEN** user clicks the toolbar "Not Spam" button with no messages selected
- **THEN** a "No messages selected" toast is displayed

#### Scenario: Toolbar trash on spam folder
- **WHEN** user clicks the toolbar trash button while viewing the Spam folder
- **THEN** a "Coming soon" toast is displayed
