## MODIFIED Requirements

### Requirement: Per-row delete button on eligible folders
Each message row SHALL display a Trash2 icon button when the active folder is one of: `inbox`, `starred`, `sent`, `important`. Clicking the delete button SHALL move the message to bin (add it to `binnedMessages` localStorage) and remove it from the current folder view. The button SHALL NOT appear on `draft` folder rows (which retain their existing permanent-delete behavior) or on `spam`, `bin`, or `archive` folder rows. Messages that are currently archived SHALL NOT be eligible for direct deletion to bin — they must be unarchived first.

#### Scenario: Delete button visible on inbox row
- **WHEN** user is viewing the Inbox folder
- **THEN** each message row displays a Trash2 delete button

#### Scenario: Delete button not visible on draft row
- **WHEN** user is viewing the Draft folder
- **THEN** rows show the existing draft delete button, not the bin delete button

#### Scenario: Delete button not visible on bin row
- **WHEN** user is viewing the Bin folder
- **THEN** rows do not show a Trash2 delete button

#### Scenario: Delete button not visible on archive row
- **WHEN** user is viewing the Archive folder
- **THEN** rows do not show a Trash2 delete button

#### Scenario: Single delete moves message to bin
- **WHEN** user clicks the Trash2 delete button on a message row in the Inbox folder
- **THEN** the message disappears from the Inbox list, appears in the Bin folder, and the bin count increments by 1
