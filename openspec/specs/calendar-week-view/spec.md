# calendar-week-view Specification

## Purpose

Defines the behavioral requirements for the Week view of the calendar: 7-column time grid, day-column headers with today highlight, header date-range label and week navigation, proportional timed event blocks per day column, pinned all-day row with multi-day spanning, current-time indicator scoped to today's column, auto-scroll on the current week, click-to-create-event interactions, and overlapping-events layout.
## Requirements
### Requirement: Week view renders a 7-column time grid
The WeekView component SHALL render a grid with a left hour-gutter column and 7 day columns (SUN through SAT). Each day column SHALL contain a 24-hour time grid identical in structure to the Day view. The grid SHALL be vertically scrollable.

#### Scenario: Week grid displays 7 day columns
- **WHEN** the calendar is in Week view mode
- **THEN** the grid renders 7 day columns with the hour gutter on the left

#### Scenario: Hour labels in gutter
- **WHEN** the Week view is displayed
- **THEN** the left gutter shows hour labels from 12 AM through 11 PM, shared across all day columns

### Requirement: Week view column headers show day name and date
Each day column SHALL have a header displaying the abbreviated day name and date number. Today's column header SHALL display the date number with the same blue circle badge used in the month view.

#### Scenario: Column headers display day and date
- **WHEN** the current week is April 12-18, 2026
- **THEN** column headers show "SUN 12", "MON 13", "TUE 14", "WED 15", "THU 16", "FRI 17", "SAT 18"

#### Scenario: Today column highlighted
- **WHEN** today is April 15 (Wednesday) and the current week contains April 15
- **THEN** the WED column header shows "15" with the blue circle badge

### Requirement: Week view header shows date range with navigation
The Week view header SHALL display the date range for the current week (e.g., "Apr 12 - 18, 2026"). When the week spans two months, both month names SHALL appear (e.g., "Mar 30 - Apr 5, 2026"). Previous/next arrows SHALL navigate by one week.

#### Scenario: Header displays same-month week range
- **WHEN** the current week is April 12-18, 2026
- **THEN** the header displays "Apr 12 - 18, 2026"

#### Scenario: Header displays cross-month week range
- **WHEN** the current week spans March 30 to April 5, 2026
- **THEN** the header displays "Mar 30 - Apr 5, 2026"

#### Scenario: Previous week navigation
- **WHEN** the user clicks the previous arrow in Week view
- **THEN** the view navigates to the previous 7-day week

#### Scenario: Next week navigation
- **WHEN** the user clicks the next arrow in Week view
- **THEN** the view navigates to the next 7-day week

#### Scenario: Today button in Week view
- **WHEN** the user clicks "Today" while in Week view
- **THEN** the view navigates to the week containing today

### Requirement: Week view renders timed events in day columns
Timed events SHALL render as blocks within their respective day columns, with top position and height proportional to their time within the day. Events use the same `EventColor` styling as the Day view.

#### Scenario: Event in correct day column
- **WHEN** a timed event is on Wednesday, April 15, from 2 PM to 3 PM
- **THEN** the event block appears in the Wednesday column at the 2 PM position

#### Scenario: Overlapping events in same column
- **WHEN** two timed events overlap on the same day
- **THEN** both events render side-by-side within that day's column, each taking equal width

### Requirement: Week view renders all-day events in a pinned row
All-day events SHALL render in a dedicated row above the scrollable time grid. Multi-day all-day events SHALL span across the columns for each day they cover. When two or more all-day events share at least one visible day-column, they SHALL stack into distinct vertical rows within the pinned all-day strip such that no two bars overlap visually. Stacking SHALL use a greedy row-packing strategy with no row cap (unbounded). The pinned all-day strip's height SHALL grow with the number of stack rows so every bar is visible and the time grid below the strip shifts down accordingly. When only a single all-day event (or none) is present, the strip's rendered height and the bar's vertical position SHALL be visually identical to the prior single-row layout.

#### Scenario: Single-day all-day event
- **WHEN** an all-day event exists on Wednesday only
- **THEN** it renders as a bar in the all-day row under the Wednesday column

#### Scenario: Multi-day all-day event spanning columns
- **WHEN** an all-day event spans Tuesday through Thursday
- **THEN** the event bar stretches across the Tuesday, Wednesday, and Thursday columns in the all-day row

#### Scenario: Multi-day event clipped to week boundaries
- **WHEN** an all-day event starts on Friday of the previous week and ends on Tuesday of the current week
- **THEN** the event bar shows from Sunday through Tuesday in the current week's all-day row

#### Scenario: Two all-day events sharing a date stack into separate rows
- **WHEN** two all-day events both fall on Friday in the visible week
- **THEN** the two bars render at distinct vertical positions within the all-day strip
- **AND** neither bar overlaps the other visually
- **AND** the all-day strip's height accommodates both rows

#### Scenario: Non-overlapping all-day events share a single row
- **WHEN** one all-day event is on Monday and another all-day event is on Thursday in the same visible week, with no date overlap
- **THEN** both bars render at the same vertical position (the same row) within the all-day strip
- **AND** the all-day strip's height is the single-row height

#### Scenario: Three or more overlapping all-day events stack into multiple rows
- **WHEN** three all-day events all fall on the same day in the visible week
- **THEN** the three bars render at three distinct vertical positions
- **AND** the all-day strip's height accommodates all three rows
- **AND** the time grid below the strip shifts down by the additional rows' height

#### Scenario: Multi-day bar and single-day bar overlapping share the strip
- **WHEN** a Monday-through-Thursday all-day event and a Wednesday-only all-day event are both in the visible week
- **THEN** the multi-day bar and the single-day bar render at distinct vertical positions
- **AND** neither bar overlaps the other visually

#### Scenario: Empty all-day strip retains its label and minimum height
- **WHEN** the visible week contains no all-day events
- **THEN** the "ALL DAY" label remains visible at its prior vertical position
- **AND** the strip's height equals the single-row height

### Requirement: Week view shows current time indicator
A horizontal line SHALL indicate the current time, spanning only today's column. The indicator SHALL only appear when the current week is being viewed and SHALL update every 60 seconds.

#### Scenario: Current time indicator in today's column
- **WHEN** the Week view displays the current week
- **THEN** a horizontal line appears in today's column at the current time position

#### Scenario: No indicator when viewing other weeks
- **WHEN** the Week view displays a week that does not contain today
- **THEN** no current time indicator is shown

### Requirement: Week view auto-scrolls to current time
When the Week view opens on the current week (or when "Today" is clicked), the time grid SHALL automatically scroll to show the current time area, offset by approximately 2 hours above.

#### Scenario: Auto-scroll on today's week
- **WHEN** the Week view renders for the week containing today
- **THEN** the time grid scrolls so the current hour minus 2 hours is near the top

### Requirement: Growing the all-day strip preserves time-grid auto-scroll behavior
When the pinned all-day strip grows in height because additional stack rows are required to display overlapping all-day events, the Week view's auto-scroll-to-current-time behavior SHALL remain unchanged. The time grid SHALL continue to auto-scroll on the current week so that the current hour minus approximately two hours is near the top of the time-grid scroll container, regardless of how many rows the all-day strip occupies.

#### Scenario: Auto-scroll on today's week with a single-row all-day strip
- **WHEN** the Week view renders for the week containing today and the all-day strip occupies a single row
- **THEN** the time grid scrolls so the current hour minus two hours is near the top of the time-grid scroll container

#### Scenario: Auto-scroll on today's week with a multi-row all-day strip
- **WHEN** the Week view renders for the week containing today and the all-day strip occupies multiple rows because overlapping all-day events are stacked
- **THEN** the time grid scrolls so the current hour minus two hours is near the top of the time-grid scroll container, identical to the single-row case
- **AND** the additional all-day rows do not alter the time-grid scroll target

### Requirement: Week view click interactions
Clicking an empty time slot in a day column SHALL open the AddEventModal pre-filled with that day and hour. Clicking an event block SHALL open the EventDetailPopover.

#### Scenario: Click empty slot in day column
- **WHEN** the user clicks an empty area in the Thursday column at 3 PM
- **THEN** the AddEventModal opens with start date set to Thursday at 3:00 PM

#### Scenario: Click event block to show popover
- **WHEN** the user clicks a timed event block in any day column
- **THEN** the EventDetailPopover opens showing that event's details

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

### Requirement: Timed event block titles wrap with line-clamp ellipsis derived from block height
Inside a Week view timed event block (in any of the seven day columns), the event title SHALL wrap across multiple lines using normal text flow. The number of visible lines SHALL be derived from the block's rendered height (which itself is derived from the event's duration via `calculateEventPosition`), so that taller blocks display more lines and shorter blocks display fewer. When the wrapped title exceeds the visible line budget, the last visible line SHALL end with an ellipsis ("…") indicating that additional content is hidden. Single unbroken words longer than the block's content width SHALL break across lines rather than overflow horizontally. Block dimensions, per-column position math, overlapping-event splitting, color, and click behavior SHALL remain unchanged. The full title SHALL remain accessible via the EventDetailPopover when the block is clicked.

#### Scenario: Short title fits on one line in a day column
- **WHEN** an event's title fits within the day column's content width on a single line
- **THEN** the title SHALL render on one line
- **AND** no ellipsis indicator SHALL be shown

#### Scenario: Multi-word title wraps across multiple lines in a tall block
- **WHEN** an event with a multi-word title spans two or more hours in a day column, producing a block tall enough for several lines of 11px text
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

#### Scenario: Overlapping events still wrap inside their narrowed column
- **WHEN** two or more events overlap in time and are rendered side-by-side at fractional widths (per `groupOverlappingEvents`)
- **THEN** each block's title SHALL wrap to fit the narrower column rather than overflow horizontally
- **AND** the same height-derived line-clamp + ellipsis behavior SHALL apply within each narrowed block

#### Scenario: Single unbroken long word wraps rather than overflows
- **WHEN** an event title contains a single word longer than the block's content width (e.g., a URL or no-space string)
- **THEN** the word SHALL break across lines so it does not overflow horizontally

### Requirement: Week view all-day event bars truncate long titles with an ellipsis indicator
Each all-day event bar rendered in the Week view's pinned all-day row SHALL display its title on a single line. When the title exceeds the bar's content width — including bars that span multiple days, where the content width equals the spanned columns minus the bar's horizontal margin — the visible portion SHALL end with a trailing ellipsis ("…") to indicate that text has been truncated. The bar SHALL retain its existing fixed height, padding, left-edge color border, background color, text color, click behavior, and multi-day spanning behavior. The full event title SHALL remain accessible via the EventDetailPopover when the bar is clicked.

#### Scenario: Short all-day title fits without truncation
- **WHEN** an all-day event's title fits within the bar's content width on a single line
- **THEN** the title SHALL render in full without an ellipsis indicator

#### Scenario: Long all-day title is truncated with a trailing ellipsis
- **WHEN** an all-day event's title is longer than the bar's content width can display on one line
- **THEN** the rendered text SHALL end with "…" at the right edge
- **AND** the bar's height SHALL remain unchanged
- **AND** the full title SHALL remain accessible via the EventDetailPopover when the bar is clicked

#### Scenario: Multi-day all-day bar truncates against its spanned width
- **WHEN** an all-day event spans multiple days (e.g., Tuesday through Thursday) and its title would not fit within the spanned columns' combined content width
- **THEN** the rendered text SHALL end with "…" at the right edge of the spanned bar
- **AND** the bar's spanning behavior across columns SHALL remain unchanged

#### Scenario: All-day title is vertically centered inside the bar
- **WHEN** an all-day event bar is rendered in the Week view's pinned all-day row
- **THEN** the title's text baseline SHALL be visually centered within the bar's height

