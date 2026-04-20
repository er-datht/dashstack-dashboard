## ADDED Requirements

### Requirement: Segmented filter bar
The FilterBar SHALL display as a horizontal segmented control with sections: filter icon, "Filter By" label, Date filter, Order Type filter, Order Status filter, and Reset Filter button. Each segment SHALL use SCSS module styling with theme-aware colors and hover states.

#### Scenario: Filter bar renders all segments
- **WHEN** the Orders page loads
- **THEN** a segmented filter bar displays with icon, label, 3 filter buttons with chevron-down icons, and a reset button

#### Scenario: Filter bar theme support
- **WHEN** the theme changes between light, dark, and forest
- **THEN** the filter bar segments update their background, border, and text colors via CSS custom properties

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

#### Scenario: Popup dismissal on outside click
- **WHEN** a user clicks outside the calendar popup
- **THEN** the popup closes without applying changes

### Requirement: Order type filter with chip selection
The OrderTypeFilterPopup SHALL display 8 order type categories as toggleable chip buttons: Health & Medicine, Book & Stationary, Services & Industry, Fashion & Beauty, Home & Living, Electronics, Mobile Phone, and Accessories. Selected chips SHALL have a distinct border and background color. The popup SHALL include an "Apply Now" button.

#### Scenario: Chip toggle selection
- **WHEN** a user clicks an unselected order type chip
- **THEN** the chip becomes selected with primary-colored border and background

#### Scenario: Multiple type selection
- **WHEN** a user selects "Electronics" and "Fashion & Beauty" chips and clicks "Apply Now"
- **THEN** only orders matching those two types are shown in the table

#### Scenario: Deselect chip
- **WHEN** a user clicks an already-selected chip
- **THEN** the chip returns to its unselected state

### Requirement: Status filter with checkbox dropdown
The status filter SHALL display a dropdown with 4 status options (Completed, Processing, On Hold, Rejected), each with a checkbox. Status toggles SHALL apply immediately without an "Apply" button. The dropdown SHALL close on outside click.

#### Scenario: Toggle status checkbox
- **WHEN** a user clicks the "Processing" checkbox in the status dropdown
- **THEN** "Processing" is added to the active status filters and the table updates immediately

#### Scenario: Multiple status selection
- **WHEN** a user checks "Completed" and "On Hold"
- **THEN** only orders with status "completed" or "on_hold" are displayed

#### Scenario: Outside click dismissal
- **WHEN** a user clicks outside the status dropdown
- **THEN** the dropdown closes

### Requirement: Only one popup open at a time
The FilterBar SHALL ensure only one filter popup (date, type, or status) is open at any time. Opening a new popup SHALL close the currently open one.

#### Scenario: Switch between popups
- **WHEN** the date popup is open and a user clicks the Order Type segment
- **THEN** the date popup closes and the order type popup opens

### Requirement: Reset all filters
The FilterBar SHALL include a "Reset Filter" button that clears all active filters (dates, types, statuses) and resets pagination to page 0. The button SHALL display in an error/red color.

#### Scenario: Reset clears all filters
- **WHEN** a user has active date, type, and status filters and clicks "Reset Filter"
- **THEN** all filter arrays are emptied, the full unfiltered order list displays, and pagination returns to page 1

### Requirement: Client-side filter combination
Filters SHALL combine with AND logic: orders MUST match all active filter criteria (selected dates AND selected types AND selected statuses) to appear in the table. Empty filter arrays mean "no restriction" for that criterion.

#### Scenario: Combined date and type filter
- **WHEN** a user selects date "2024-10-15" and type "electronics"
- **THEN** only orders matching both criteria are displayed

#### Scenario: No filters active
- **WHEN** all filter arrays are empty
- **THEN** all 27 orders are displayed (unfiltered)
