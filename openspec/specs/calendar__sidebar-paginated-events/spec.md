## ADDED Requirements

### Requirement: Event list shows max 4 events initially
The EventsSidebar SHALL display at most 4 events on initial render.

#### Scenario: 3 events total
- **WHEN** there are 3 events
- **THEN** all 3 events are visible and "See More" button is hidden

#### Scenario: 10 events total
- **WHEN** there are 10 events
- **THEN** only the first 4 events are visible and "See More" button is shown

### Requirement: See More button loads 4 more events
Clicking the "See More" button SHALL reveal 4 additional events each time.

#### Scenario: First click shows 8
- **WHEN** there are 10 events and the user clicks "See More" once
- **THEN** 8 events are visible

#### Scenario: Second click shows all remaining
- **WHEN** there are 10 events and the user clicks "See More" twice
- **THEN** all 10 events are visible and "See More" button is hidden

### Requirement: See More button hidden when all events visible
The "See More" button SHALL be hidden when the visible count is greater than or equal to the total event count.

#### Scenario: All events shown
- **WHEN** visible count >= total events
- **THEN** "See More" button is not rendered

### Requirement: Calendar grid height is independent of sidebar
The calendar grid section SHALL maintain its own height regardless of sidebar content height. The sidebar SHALL NOT stretch the calendar card.

#### Scenario: Sidebar shorter than calendar
- **WHEN** the sidebar shows 4 events and the calendar grid is taller
- **THEN** the calendar card keeps its full height and the sidebar does not stretch to match

#### Scenario: Sidebar taller than calendar after expanding
- **WHEN** the user clicks "See More" multiple times making sidebar taller than the calendar
- **THEN** the calendar card height remains unchanged
