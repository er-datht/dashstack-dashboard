## MODIFIED Requirements

### Requirement: CalendarHeader receives date and selection callback
CalendarHeader SHALL accept `currentDate: Date` and `onDateSelect: (date: Date) => void` props in addition to existing props. The parent Calendar page SHALL pass `currentDate` and a handler that calls `setCurrentDate` to CalendarHeader.

#### Scenario: Parent passes date props to header
- **WHEN** the Calendar page renders CalendarHeader
- **THEN** it passes the current `currentDate` state and an `onDateSelect` callback that updates `currentDate`
