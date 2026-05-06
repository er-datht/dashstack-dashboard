## ADDED Requirements

### Requirement: Time-grid event overlay does not block slot clicks
The Day view time-grid event overlay (the absolutely-positioned wrapper that contains rendered timed event blocks and the current-time indicator) SHALL NOT intercept pointer events targeted at the underlying empty time slots. Individual rendered event blocks within the overlay SHALL remain interactive (clickable), and the current-time indicator SHALL remain visually rendered without capturing clicks. The "Day view click interactions" requirement depends on this invariant; without it, slot clicks never reach their handlers.

#### Scenario: Click reaches the empty slot beneath the event overlay
- **WHEN** the user clicks an empty area inside the time grid where no timed event block is rendered at that vertical position
- **THEN** the click SHALL be received by the time-slot element corresponding to that hour
- **AND** the AddEventModal SHALL open pre-filled with the current day at the clicked hour (per "Click empty slot to create event")

#### Scenario: Click on a rendered event block stays interactive
- **WHEN** the user clicks on a timed event block rendered inside the overlay
- **THEN** the EventDetailPopover SHALL open showing that event's details (per "Click event block to show popover")
- **AND** the underlying slot's click handler SHALL NOT fire for the same click

#### Scenario: Current-time indicator does not capture clicks
- **WHEN** the user clicks the row at the exact vertical position of the current-time indicator and no event block is rendered there
- **THEN** the click SHALL pass through the indicator and reach the underlying time slot
- **AND** the AddEventModal SHALL open for that slot's hour
