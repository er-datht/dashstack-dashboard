## Purpose

Date picker popup on the Calendar page header label, powered by `react-calendar`, allowing quick day/month/year drill-down navigation.

## Requirements

### Requirement: Clickable date label opens date picker popup
The date label in the CalendarHeader SHALL be clickable. Clicking it SHALL open a `react-calendar` date picker popup positioned below the label.

#### Scenario: User clicks the date label
- **WHEN** user clicks the date label text (e.g., "Monday, April 20, 2026")
- **THEN** a `react-calendar` popup appears below the label showing the month view for the current date

#### Scenario: User clicks the date label while picker is open
- **WHEN** the date picker popup is already open and the user clicks the date label again
- **THEN** the popup closes (toggle behavior)

### Requirement: Date selection updates current date
Selecting a date in the picker SHALL update the calendar's `currentDate` and close the popup.

#### Scenario: User selects a date
- **WHEN** user clicks a day in the picker popup
- **THEN** the calendar navigates to that date and the popup closes

### Requirement: Drill-down navigation within picker
The picker SHALL support drill-down views to navigate by month and year.

#### Scenario: User navigates by month
- **WHEN** user clicks the month/year label at the top of the picker
- **THEN** the picker switches to a month-selection view

#### Scenario: User navigates by year
- **WHEN** user clicks the year label in the month-selection view
- **THEN** the picker switches to a year-selection view

### Requirement: Dismiss on click-outside or Escape
The popup SHALL close when the user clicks outside it or presses the Escape key.

#### Scenario: User clicks outside the popup
- **WHEN** the popup is open and the user clicks anywhere outside the popup and the date label
- **THEN** the popup closes

#### Scenario: User presses Escape
- **WHEN** the popup is open and the user presses the Escape key
- **THEN** the popup closes

### Requirement: Theme-aware styling
The date picker popup SHALL match the active theme (light, dark, or forest) using the project's CSS custom properties.

#### Scenario: Dark theme active
- **WHEN** the app theme is set to "dark"
- **THEN** the picker uses dark background and light text colors from CSS custom properties

#### Scenario: Forest theme active
- **WHEN** the app theme is set to "forest"
- **THEN** the picker uses forest theme colors from CSS custom properties
