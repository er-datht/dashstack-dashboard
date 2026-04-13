## ADDED Requirements

### Requirement: RevenueChart with dual data series
The RevenueChart SHALL display a recharts Area chart with two data series: Sales (orange) and Profit (purple), including a legend, tooltips, and smooth curves.

#### Scenario: Revenue chart rendering
- **WHEN** RevenueChart mounts
- **THEN** it displays an area chart with Sales and Profit series using appropriate colors

### Requirement: Theme-aware chart colors
Chart components SHALL define color palettes for all three themes (light, dark, forest) and apply the correct palette based on the active theme.

#### Scenario: Dark theme chart colors
- **WHEN** the active theme is "dark"
- **THEN** chart colors, backgrounds, and text adapt to the dark theme palette

#### Scenario: Forest theme chart colors
- **WHEN** the active theme is "forest"
- **THEN** chart colors use the forest theme's green-tinted palette

### Requirement: Month dropdown filter
Both RevenueChart and SalesDetailsChart SHALL include a month dropdown for filtering the displayed data period.

#### Scenario: Month selection
- **WHEN** a user selects a different month from the chart's dropdown
- **THEN** the chart updates to display data for the selected month

### Requirement: Chart loading state
Chart components SHALL display a loading spinner while data is being fetched.

#### Scenario: Loading indicator
- **WHEN** chart data is being loaded
- **THEN** a loading spinner is displayed in place of the chart

### Requirement: SalesDetailsChart
The SalesDetailsChart SHALL display a recharts Area chart showing sales volume and sales percentage data with sample data for August through October.

#### Scenario: Sales details rendering
- **WHEN** SalesDetailsChart mounts
- **THEN** it displays sales volume and percentage metrics as area chart series
