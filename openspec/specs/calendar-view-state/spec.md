## ADDED Requirements

### Requirement: View mode state with three modes
The Calendar page SHALL maintain a `viewMode` state with values `day`, `week`, or `month`. The default view mode SHALL be `month`. The active view component (DayView, WeekView, or CalendarGrid) SHALL render based on the current view mode.

#### Scenario: Default view is month
- **WHEN** the Calendar page loads
- **THEN** the Month view (CalendarGrid) is displayed and the "Month" toggle button is active

#### Scenario: Switch to Day view
- **WHEN** the user clicks the "Day" toggle button
- **THEN** the Day view renders and the "Day" button shows as active

#### Scenario: Switch to Week view
- **WHEN** the user clicks the "Week" toggle button
- **THEN** the Week view renders and the "Week" button shows as active

#### Scenario: Switch back to Month view
- **WHEN** the user clicks the "Month" toggle button from Day or Week view
- **THEN** the Month view renders and the "Month" button shows as active

### Requirement: Unified date state replaces month/year
The Calendar page SHALL use a single `currentDate: Date` state instead of separate `currentMonth` and `currentYear`. All views derive their display context from this single date.

#### Scenario: Month view derives month/year from currentDate
- **WHEN** `currentDate` is April 15, 2026
- **THEN** the Month view displays April 2026

#### Scenario: Day view derives day from currentDate
- **WHEN** `currentDate` is April 15, 2026
- **THEN** the Day view displays April 15, 2026

#### Scenario: Week view derives week from currentDate
- **WHEN** `currentDate` is April 15, 2026 (Wednesday)
- **THEN** the Week view displays the week of April 12-18, 2026 (Sunday-Saturday containing that date)

### Requirement: Navigation adapts per view mode
The previous/next navigation arrows SHALL navigate by different increments depending on the current view mode: day +-1 day, week +-7 days, month +-1 month.

#### Scenario: Day view prev/next navigates by day
- **WHEN** in Day view on April 15 and the user clicks next
- **THEN** the view shows April 16

#### Scenario: Week view prev/next navigates by week
- **WHEN** in Week view showing Apr 12-18 and the user clicks next
- **THEN** the view shows Apr 19-25

#### Scenario: Month view prev/next navigates by month
- **WHEN** in Month view showing April 2026 and the user clicks next
- **THEN** the view shows May 2026

### Requirement: Today button adapts per view mode
The "Today" button SHALL navigate `currentDate` to today's date in all view modes. The current view mode SHALL be preserved when clicking "Today".

#### Scenario: Today in Day view
- **WHEN** in Day view showing a past date and the user clicks "Today"
- **THEN** the Day view shows today's date

#### Scenario: Today in Week view
- **WHEN** in Week view showing a past week and the user clicks "Today"
- **THEN** the Week view shows the week containing today

#### Scenario: Today in Month view
- **WHEN** in Month view showing a past month and the user clicks "Today"
- **THEN** the Month view shows the month containing today

### Requirement: View toggle buttons are functional
The three view toggle buttons (Day, Week, Month) SHALL have `onClick` handlers that set the `viewMode` state. The active button SHALL display with the active style (`viewToggleButtonActive`). Inactive buttons SHALL display with the default style.

#### Scenario: Active button styling
- **WHEN** the current view mode is "week"
- **THEN** the "Week" button has the active style and "Day"/"Month" buttons have the default style

#### Scenario: Clicking toggle changes view
- **WHEN** the user clicks a toggle button
- **THEN** the `viewMode` updates and the corresponding view component renders

### Requirement: CalendarEvent type supports allDay flag
The `CalendarEvent` type SHALL include an optional `allDay?: boolean` field. Events with `allDay: true` or events where `startDate` has no meaningful time component SHALL be treated as all-day events.

#### Scenario: Existing events remain all-day by default
- **WHEN** an event has no `allDay` field set
- **THEN** it is treated as an all-day event (backward compatible)

#### Scenario: Timed event with allDay false
- **WHEN** an event has `allDay: false` and `startDate` with hours/minutes set
- **THEN** it renders as a timed block in day/week views and as a bar in month view

### Requirement: Mock data includes timed events
The mock event data SHALL include events with time-of-day information (hours and minutes set on `startDate` and `endDate`) in addition to the existing all-day events. At least 4 timed events SHALL be added spanning different days and times.

#### Scenario: Mix of all-day and timed events
- **WHEN** the calendar loads with mock data
- **THEN** both all-day events (in the all-day row) and timed events (in the time grid) are visible in Day and Week views

### Requirement: CalendarHeader receives date and selection callback
CalendarHeader SHALL accept `currentDate: Date` and `onDateSelect: (date: Date) => void` props in addition to existing props. The parent Calendar page SHALL pass `currentDate` and a handler that calls `setCurrentDate` to CalendarHeader.

#### Scenario: Parent passes date props to header
- **WHEN** the Calendar page renders CalendarHeader
- **THEN** it passes the current `currentDate` state and an `onDateSelect` callback that updates `currentDate`

### Requirement: i18n translations for new UI elements
Translation files (en/jp) SHALL include new keys for: navigation ARIA labels per view (previousDay, nextDay, previousWeek, nextWeek), all-day row label, and time format patterns.

#### Scenario: English translations present
- **WHEN** the locale is "en"
- **THEN** all new calendar translation keys return English text

#### Scenario: Japanese translations present
- **WHEN** the locale is "jp"
- **THEN** all new calendar translation keys return Japanese text
