## ADDED Requirements

### Requirement: Date picker label adapts to active theme
The CalendarHeader's date-picker label button (the clickable text that displays the current month/year, week range, or full date and opens the date picker on click) SHALL render its text using `var(--color-text-primary)` so its color adapts to the active theme. The label SHALL remain readable against the surface in all three themes (light, dark, forest). Other header controls (chevron arrows, Today button, view-toggle buttons) SHALL continue to use their existing theme-aware colors and SHALL NOT be affected by changes to this requirement.

#### Scenario: Header label is readable in light theme
- **WHEN** the active theme is `light`
- **THEN** the date-picker label SHALL render with `var(--color-text-primary)` (a dark text color in the light palette)
- **AND** the label SHALL be visually distinct against the calendar's light surface

#### Scenario: Header label is readable in dark theme
- **WHEN** the active theme is `dark`
- **THEN** the date-picker label SHALL render with `var(--color-text-primary)` (a light text color in the dark palette)
- **AND** the label SHALL be visually distinct against the calendar's dark surface

#### Scenario: Header label is readable in forest theme
- **WHEN** the active theme is `forest`
- **THEN** the date-picker label SHALL render with `var(--color-text-primary)` (a light text color in the forest palette)
- **AND** the label SHALL be visually distinct against the calendar's forest surface

#### Scenario: Theme switch updates label color without remount
- **WHEN** the user switches the theme while the calendar is open
- **THEN** the date-picker label color SHALL update to match the new theme's `var(--color-text-primary)` value via the existing CSS custom-property cascade
- **AND** the label SHALL NOT require a component remount or a page reload to reflect the new color
