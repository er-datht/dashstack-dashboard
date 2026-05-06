## ADDED Requirements

### Requirement: Per-day event overlay does not block slot clicks
Each per-day event overlay in the Week view time grid (the absolutely-positioned wrapper, one per day column, that contains rendered timed event blocks and the current-time indicator for that column) SHALL NOT intercept pointer events targeted at the underlying empty time slots in that column. Individual rendered event blocks within an overlay SHALL remain interactive (clickable), and the current-time indicator SHALL remain visually rendered without capturing clicks. The "Week view click interactions" requirement depends on this invariant; without it, slot clicks in any day column never reach their handlers.

#### Scenario: Click reaches an empty slot in any day column
- **WHEN** the user clicks an empty area in any of the seven day columns at a vertical position where no timed event block is rendered
- **THEN** the click SHALL be received by the time-slot element corresponding to that day and hour
- **AND** the AddEventModal SHALL open pre-filled with that day at the clicked hour (per "Click empty slot in day column")

#### Scenario: Click on an event block in a day column stays interactive
- **WHEN** the user clicks on a timed event block rendered inside any day column's overlay
- **THEN** the EventDetailPopover SHALL open showing that event's details (per "Click event block to show popover")
- **AND** the underlying slot's click handler SHALL NOT fire for the same click

#### Scenario: Current-time indicator in today's column does not capture clicks
- **WHEN** the Week view contains today and the user clicks the today column at the exact vertical position of the current-time indicator, with no event block rendered there
- **THEN** the click SHALL pass through the indicator and reach the underlying time slot
- **AND** the AddEventModal SHALL open for today at that slot's hour
