## ADDED Requirements

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
All-day events SHALL render in a dedicated row above the scrollable time grid. Multi-day all-day events SHALL span across the columns for each day they cover.

#### Scenario: Single-day all-day event
- **WHEN** an all-day event exists on Wednesday only
- **THEN** it renders as a bar in the all-day row under the Wednesday column

#### Scenario: Multi-day all-day event spanning columns
- **WHEN** an all-day event spans Tuesday through Thursday
- **THEN** the event bar stretches across the Tuesday, Wednesday, and Thursday columns in the all-day row

#### Scenario: Multi-day event clipped to week boundaries
- **WHEN** an all-day event starts on Friday of the previous week and ends on Tuesday of the current week
- **THEN** the event bar shows from Sunday through Tuesday in the current week's all-day row

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

### Requirement: Week view click interactions
Clicking an empty time slot in a day column SHALL open the AddEventModal pre-filled with that day and hour. Clicking an event block SHALL open the EventDetailPopover.

#### Scenario: Click empty slot in day column
- **WHEN** the user clicks an empty area in the Thursday column at 3 PM
- **THEN** the AddEventModal opens with start date set to Thursday at 3:00 PM

#### Scenario: Click event block to show popover
- **WHEN** the user clicks a timed event block in any day column
- **THEN** the EventDetailPopover opens showing that event's details
