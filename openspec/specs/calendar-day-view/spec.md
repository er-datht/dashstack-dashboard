# calendar-day-view Specification

## Purpose

Defines the behavioral requirements for the Day view of the calendar: 24-hour time grid, hour-gutter labels, header with full-date label and day-navigation controls, proportional timed event blocks, pinned all-day row, current-time indicator, auto-scroll on today, click-to-create-event interactions, and overlapping-events layout.
## Requirements
### Requirement: Day view renders a 24-hour time grid
The DayView component SHALL render a scrollable vertical time grid with 24 one-hour rows. A left gutter column SHALL display hour labels (12 AM, 1 AM, ... 11 PM) formatted per the active locale. The main column SHALL occupy the remaining width.

#### Scenario: Day view displays all 24 hours
- **WHEN** the calendar is in Day view mode
- **THEN** the time grid renders 24 rows labeled from 12 AM through 11 PM, each row representing one hour

#### Scenario: Hour labels respect locale
- **WHEN** the locale is "en"
- **THEN** hour labels display in 12-hour format (e.g., "12 AM", "1 PM")

#### Scenario: Hour labels for Japanese locale
- **WHEN** the locale is "jp"
- **THEN** hour labels display in locale-appropriate format

### Requirement: Day view header shows full date with navigation
The Day view header SHALL display the full date (e.g., "Wednesday, April 15, 2026") centered between previous/next day navigation arrows. The "Today" button and view toggle buttons SHALL remain in their existing positions.

#### Scenario: Header displays full date
- **WHEN** the current date is April 15, 2026 (Wednesday)
- **THEN** the header displays "Wednesday, April 15, 2026"

#### Scenario: Previous day navigation
- **WHEN** the user clicks the previous arrow in Day view
- **THEN** the view navigates to the previous calendar day

#### Scenario: Next day navigation
- **WHEN** the user clicks the next arrow in Day view
- **THEN** the view navigates to the next calendar day

#### Scenario: Today button in Day view
- **WHEN** the user clicks "Today" while in Day view
- **THEN** the view navigates to today's date

### Requirement: Day view renders timed events as proportional blocks
Timed events (where `allDay` is not true) SHALL render as blocks within the time grid. Block top position SHALL correspond to the event start time, and block height SHALL be proportional to the event duration. Blocks SHALL use the event's `EventColor` for styling (left border, background, text color).

#### Scenario: Event block positioned by start time
- **WHEN** an event starts at 9:00 AM and ends at 10:30 AM
- **THEN** the event block starts at the 9 AM row and spans 1.5 hour-rows in height

#### Scenario: Event block uses event color
- **WHEN** a timed event is rendered
- **THEN** the block displays with the event's border color as left border, bg as background, and text as text color

#### Scenario: Minimum event block height
- **WHEN** an event has a very short duration (e.g., 15 minutes)
- **THEN** the block SHALL have a minimum visible height equivalent to 30 minutes

### Requirement: Day view renders all-day events in a pinned row
Events with `allDay: true` (or no time component) SHALL render in a dedicated row above the scrollable time grid. This all-day row SHALL remain visible when the time grid scrolls.

#### Scenario: All-day event appears in top row
- **WHEN** an all-day event exists on the current day
- **THEN** it renders as a horizontal bar in the all-day section above the time grid

#### Scenario: All-day row not shown when no all-day events
- **WHEN** no all-day events exist on the current day
- **THEN** the all-day row is still rendered but appears empty (minimal height)

### Requirement: Day view shows current time indicator
A horizontal line with a dot marker on the left gutter SHALL indicate the current time. The indicator SHALL only be visible when viewing today's date. The indicator position SHALL update every 60 seconds.

#### Scenario: Current time indicator on today
- **WHEN** the Day view displays today's date
- **THEN** a horizontal line appears at the position corresponding to the current time

#### Scenario: No indicator on other dates
- **WHEN** the Day view displays a date that is not today
- **THEN** no current time indicator is shown

#### Scenario: Indicator updates periodically
- **WHEN** the Day view is open on today's date for more than 60 seconds
- **THEN** the indicator position updates to reflect the new current time

### Requirement: Day view auto-scrolls to current time
When the Day view opens on today's date (or when "Today" is clicked), the time grid SHALL automatically scroll so the current time area is visible, positioned approximately 2 hours above the viewport top for context.

#### Scenario: Auto-scroll on initial render of today
- **WHEN** the Day view renders for today's date
- **THEN** the time grid scrolls so the current hour minus 2 hours is near the top of the visible area

#### Scenario: No auto-scroll on other dates
- **WHEN** the Day view renders for a date that is not today
- **THEN** the time grid starts scrolled to the top (12 AM)

### Requirement: Day view click interactions
Clicking an empty time slot SHALL open the AddEventModal pre-filled with the clicked hour as the start time. Clicking an event block SHALL open the existing EventDetailPopover.

#### Scenario: Click empty slot to create event
- **WHEN** the user clicks an empty area at the 2 PM row
- **THEN** the AddEventModal opens with the start date set to the current day at 2:00 PM

#### Scenario: Click event block to show popover
- **WHEN** the user clicks a timed event block
- **THEN** the EventDetailPopover opens showing that event's details

### Requirement: Day view handles overlapping events
When multiple timed events overlap in time, they SHALL be rendered side-by-side within the day column, each taking an equal fraction of the column width.

#### Scenario: Two overlapping events
- **WHEN** two events overlap (e.g., 9-10 AM and 9:30-11 AM)
- **THEN** both events render side-by-side, each occupying 50% of the column width

#### Scenario: Three overlapping events
- **WHEN** three events overlap in time
- **THEN** all three render side-by-side, each occupying approximately 33% of the column width

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

### Requirement: Timed event block titles wrap with line-clamp ellipsis derived from block height
Inside a Day view timed event block, the event title SHALL wrap across multiple lines using normal text flow. The number of visible lines SHALL be derived from the block's rendered height (which itself is derived from the event's duration via `calculateEventPosition`), so that taller blocks display more lines and shorter blocks display fewer. When the wrapped title exceeds the visible line budget, the last visible line SHALL end with an ellipsis ("…") indicating that additional content is hidden. Single unbroken words longer than the block's content width SHALL break across lines rather than overflow horizontally. Block dimensions, position math, color, and click behavior SHALL remain unchanged. The full title SHALL remain accessible via the EventDetailPopover when the block is clicked.

#### Scenario: Short title fits on one line without ellipsis
- **WHEN** an event's title fits within a single line of the block's content width
- **THEN** the title SHALL render on one line
- **AND** no ellipsis indicator SHALL be shown

#### Scenario: Multi-word title wraps across multiple lines in a tall block
- **WHEN** an event with a multi-word title spans two or more hours, producing a block tall enough for several lines of 11px text (e.g., a 2-hour block fits roughly 8 lines)
- **THEN** the title SHALL wrap across multiple lines inside the block, up to the line budget for that block height
- **AND** if the title fully fits within the line budget, no ellipsis SHALL be shown

#### Scenario: Long title clamps with ellipsis on the last visible line
- **WHEN** an event's wrapped title would require more lines than the block's height allows
- **THEN** the title SHALL clamp at the maximum number of lines that fit
- **AND** the last visible line SHALL end with a trailing ellipsis ("…")
- **AND** the full title SHALL remain accessible via the EventDetailPopover when the block is clicked

#### Scenario: Smallest block (30-minute minimum) shows at least one line
- **WHEN** the event has the minimum height (a 30-minute block, or a sub-30-minute event raised to the 30-minute minimum)
- **THEN** at least one line of the title SHALL render
- **AND** if the title is longer than that one line, that line SHALL end with an ellipsis

#### Scenario: Single unbroken long word wraps rather than overflows
- **WHEN** an event title contains a single word longer than the block's content width (e.g., a URL or no-space string)
- **THEN** the word SHALL break across lines so it does not overflow horizontally

### Requirement: Day view all-day event bars truncate long titles with an ellipsis indicator
Each all-day event bar rendered in the Day view's pinned all-day row SHALL display its title on a single line. When the title exceeds the bar's content width, the visible portion SHALL end with a trailing ellipsis ("…") to indicate that text has been truncated. The bar SHALL retain its existing fixed height, padding, left-edge color border, background color, text color, and click behavior. The full event title SHALL remain accessible via the EventDetailPopover when the bar is clicked.

#### Scenario: Short all-day title fits without truncation
- **WHEN** an all-day event's title fits within the bar's content width on a single line
- **THEN** the title SHALL render in full without an ellipsis indicator

#### Scenario: Long all-day title is truncated with a trailing ellipsis
- **WHEN** an all-day event's title is longer than the bar's content width can display on one line
- **THEN** the rendered text SHALL end with "…" at the right edge
- **AND** the bar's height SHALL remain unchanged
- **AND** the full title SHALL remain accessible via the EventDetailPopover when the bar is clicked

#### Scenario: All-day title is vertically centered inside the bar
- **WHEN** an all-day event bar is rendered in the Day view's pinned all-day row
- **THEN** the title's text baseline SHALL be visually centered within the bar's height

