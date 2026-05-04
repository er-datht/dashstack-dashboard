## MODIFIED Requirements

### Requirement: Email folder tabs
The left panel SHALL display a "My Email" section with folder tabs: Inbox (dynamic), Starred (dynamic), Sent (dynamic), Draft (dynamic), Spam (14), Important (dynamic), Bin (dynamic), Archive (dynamic). Each folder shows an icon, name, and count. The Draft folder count SHALL reflect the actual number of saved drafts in localStorage. The Bin folder count SHALL reflect the actual number of binned messages in localStorage. The Archive folder count SHALL reflect the actual number of archived messages in localStorage. The Important folder count SHALL reflect the number of records flagged as important in `importantIds` (excluding binned, archived, and spammed).

#### Scenario: Default active folder
- **WHEN** the Inbox page loads
- **THEN** the "Inbox" folder tab is highlighted with blue text and a light blue background

#### Scenario: Folder tab click
- **WHEN** user clicks a different folder tab
- **THEN** that folder becomes the active tab with the highlighted style and the previously active tab reverts to default style

#### Scenario: Bin count is dynamic
- **WHEN** the Inbox page loads with no binned messages
- **THEN** the Bin folder tab displays count 0

#### Scenario: Archive count is dynamic
- **WHEN** the Inbox page loads with no archived messages
- **THEN** the Archive folder tab displays count 0

#### Scenario: Important count is dynamic
- **WHEN** the Inbox page loads on first run with 5 mock-seeded important records
- **THEN** the Important folder tab displays count 5
