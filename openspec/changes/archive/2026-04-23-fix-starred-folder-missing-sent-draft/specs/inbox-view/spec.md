## MODIFIED Requirements

### Requirement: Starred folder filtering
When the `Starred` folder tab is active, the message list SHALL display only records whose current starred state is true, drawn from ALL record sources (inbox, sent, and draft). All other folder tabs SHALL display their folder-specific records (unchanged behavior). Switching folders SHALL reset pagination to page 1.

#### Scenario: Starred folder shows only starred records
- **WHEN** user clicks the `Starred` folder tab
- **THEN** only records currently marked as starred are visible in the message list, including starred records from inbox, sent, and draft sources

#### Scenario: Starred sent message appears in Starred folder
- **WHEN** user stars a sent message and navigates to the `Starred` folder tab
- **THEN** that sent message appears in the starred message list

#### Scenario: Starred draft message appears in Starred folder
- **WHEN** user stars a draft message and navigates to the `Starred` folder tab
- **THEN** that draft message appears in the starred message list

#### Scenario: Unstarring from within the Starred folder
- **WHEN** user is on the `Starred` folder tab and clicks the filled star on a visible row
- **THEN** that row is removed from the visible list and the remaining starred records stay visible

#### Scenario: Switching away from Starred restores folder-specific list
- **WHEN** user is on the `Starred` folder tab and clicks the `Inbox` folder tab
- **THEN** only inbox records are visible (not sent or draft records)

#### Scenario: Folder switch resets pagination
- **WHEN** user is on page 2 of the `Inbox` folder and clicks the `Starred` folder tab
- **THEN** pagination shows page 1 of the filtered starred results
