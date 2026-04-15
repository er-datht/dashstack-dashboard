## ADDED Requirements

### Requirement: CalendarDay type includes isToday flag
The `CalendarDay` type SHALL include an `isToday: boolean` field that indicates whether the day represents today's date.

#### Scenario: Today's date is in the current viewed month
- **WHEN** the calendar displays a month containing today's date
- **THEN** exactly one `CalendarDay` object in the generated array SHALL have `isToday: true`
- **AND** all other `CalendarDay` objects SHALL have `isToday: false`

#### Scenario: Today's date is in an adjacent month row
- **WHEN** the calendar displays a month where today appears in the leading or trailing days from adjacent months
- **THEN** the `CalendarDay` object for today SHALL have `isToday: true` even though `isCurrentMonth` is `false`

#### Scenario: Viewed month does not contain today
- **WHEN** the calendar displays a month where today's date does not appear in any of the 42 cells
- **THEN** all `CalendarDay` objects SHALL have `isToday: false`

### Requirement: Today's date cell has a distinctive visual indicator
The calendar grid SHALL render a colored circle badge behind the day number for the cell representing today's date.

#### Scenario: Today is highlighted with a circle
- **WHEN** a day cell has `isToday: true`
- **THEN** the day number SHALL be displayed inside a circular badge with a primary-colored background and white text

#### Scenario: Today highlight works across all themes
- **WHEN** the theme is set to light, dark, or forest
- **THEN** the today circle badge SHALL use theme-appropriate primary color and remain clearly visible

#### Scenario: Today highlight combined with out-of-month styling
- **WHEN** today falls in an adjacent month row (isToday: true, isCurrentMonth: false)
- **THEN** both the out-of-month striped background AND the today circle badge SHALL be displayed simultaneously
