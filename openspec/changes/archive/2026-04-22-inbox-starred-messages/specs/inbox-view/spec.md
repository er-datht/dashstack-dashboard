## ADDED Requirements

### Requirement: Star toggle
Each message list row's star button SHALL toggle that record's starred state. Starred records SHALL render with a filled yellow star icon; unstarred records SHALL render with an outlined default-color star icon. Toggling a star SHALL NOT select the conversation or navigate away from the message list.

#### Scenario: Star an unstarred record
- **WHEN** user clicks the outlined star on an unstarred row
- **THEN** the star icon on that row becomes filled yellow and the message list view remains displayed

#### Scenario: Unstar a starred record
- **WHEN** user clicks the filled yellow star on a starred row
- **THEN** the star icon reverts to the outlined default-color state

#### Scenario: Star click does not open the conversation
- **WHEN** user clicks the star button on any row
- **THEN** the chat view is not opened and the row is not selected

### Requirement: Starred folder filtering
When the `Starred` folder tab is active, the message list SHALL display only records whose current starred state is true. All other folder tabs SHALL display the full record list (unchanged behavior from the base inbox-view spec). Switching folders SHALL reset pagination to page 1.

#### Scenario: Starred folder shows only starred records
- **WHEN** user clicks the `Starred` folder tab
- **THEN** only records currently marked as starred are visible in the message list

#### Scenario: Unstarring from within the Starred folder
- **WHEN** user is on the `Starred` folder tab and clicks the filled star on a visible row
- **THEN** that row is removed from the visible list and the remaining starred records stay visible

#### Scenario: Switching away from Starred restores full list
- **WHEN** user is on the `Starred` folder tab and clicks the `Inbox` folder tab
- **THEN** all records are visible again regardless of starred state

#### Scenario: Folder switch resets pagination
- **WHEN** user is on page 2 of the `Inbox` folder and clicks the `Starred` folder tab
- **THEN** pagination shows page 1 of the filtered starred results

### Requirement: Live starred folder count
The `Starred` folder tab in the left sidebar SHALL display a count equal to the current number of records whose starred state is true. The count SHALL update immediately when a record is starred or unstarred.

#### Scenario: Count reflects initial seeded state
- **WHEN** the Inbox page first loads
- **THEN** the `Starred` folder tab displays a count matching the number of mock records seeded as starred

#### Scenario: Count increments on star
- **WHEN** user stars a previously-unstarred record
- **THEN** the `Starred` folder tab count increases by 1

#### Scenario: Count decrements on unstar
- **WHEN** user unstars a previously-starred record
- **THEN** the `Starred` folder tab count decreases by 1
