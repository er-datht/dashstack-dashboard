## MODIFIED Requirements

### Requirement: Date filter popup calendar grid
The DateFilterPopup SHALL use `react-calendar` instead of a custom 42-cell grid for displaying the month view. The component SHALL preserve its existing external API: `isOpen`, `onClose`, `selectedDates`, and `onApply` props. Multi-date toggle selection, "Apply Now" button, and click-outside dismiss SHALL continue to work as before.

#### Scenario: Multi-date selection with react-calendar
- **WHEN** user clicks a day tile in the DateFilterPopup
- **THEN** the date toggles in the local selection (selected ↔ deselected), matching previous behavior

#### Scenario: Month navigation
- **WHEN** user clicks react-calendar's built-in prev/next navigation arrows
- **THEN** the calendar navigates to the adjacent month, replacing the custom prev/next buttons

#### Scenario: Apply selected dates
- **WHEN** user clicks "Apply Now"
- **THEN** the selected dates are passed to `onApply` and the popup closes, same as before

#### Scenario: Today highlight
- **WHEN** today's date is visible in the grid
- **THEN** it is visually highlighted by react-calendar's built-in today styling
