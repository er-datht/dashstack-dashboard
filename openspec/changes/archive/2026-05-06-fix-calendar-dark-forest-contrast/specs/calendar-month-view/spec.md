## ADDED Requirements

### Requirement: Out-of-month cells use a theme-aware diagonal stripe pattern
Cells in the month grid that fall outside the current month (the leading days from the previous month and the trailing days from the next month) SHALL render a diagonal repeating-stripe background that visually distinguishes them from in-month cells without obscuring the day number rendered inside. The stripe color SHALL adapt to the active theme so that in dark and forest themes the stripes do not overwhelm the cell or reduce day-number legibility. Light-mode behavior SHALL be preserved unchanged.

#### Scenario: Light theme renders subtle blue-tinted stripes
- **WHEN** the active theme is `light`
- **THEN** out-of-month cells SHALL render the existing diagonal stripe pattern using a subtle blue-tinted overlay (the brand-50 token) over the cell's surface
- **AND** the day number inside the cell SHALL remain legible

#### Scenario: Dark theme uses a low-opacity light overlay for stripes
- **WHEN** the active theme is `dark`
- **THEN** out-of-month cells SHALL render the diagonal stripe pattern using a low-opacity white overlay so the stripe is faintly visible against the dark surface
- **AND** the day number inside the cell SHALL remain the highest-contrast element of the cell
- **AND** the stripe SHALL NOT exceed the day-number's perceived brightness

#### Scenario: Forest theme uses a low-opacity light overlay for stripes
- **WHEN** the active theme is `forest`
- **THEN** out-of-month cells SHALL render the diagonal stripe pattern using a low-opacity white overlay (matching the dark theme's overlay alpha) so the stripe is faintly visible against the forest surface
- **AND** the day number inside the cell SHALL remain the highest-contrast element of the cell

#### Scenario: Today highlight remains visible inside an out-of-month cell
- **WHEN** the date represented by an out-of-month cell happens to be today (e.g., when navigating to the previous month while today still falls inside the visible 6-week grid)
- **THEN** the today badge SHALL remain visible over the diagonal stripe pattern in any of the three themes
- **AND** the today badge's color treatment SHALL NOT be affected by this change
