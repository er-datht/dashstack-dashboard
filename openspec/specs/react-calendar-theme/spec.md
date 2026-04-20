## Purpose

Shared CSS overrides for `react-calendar` across all usages, supporting light/dark/forest themes via CSS custom properties.

## Requirements

### Requirement: Shared react-calendar theme overrides
All `react-calendar` instances in the app SHALL be wrapped in a themed container that applies CSS overrides using the project's CSS custom properties, ensuring consistent appearance across light, dark, and forest themes.

#### Scenario: Light theme styling
- **WHEN** the app theme is "light"
- **THEN** react-calendar uses light surface background, primary text, and primary-600 accent for selected/active tiles

#### Scenario: Dark theme styling
- **WHEN** the app theme is "dark"
- **THEN** react-calendar uses dark surface background, light text, and theme-appropriate accent colors from CSS custom properties

#### Scenario: Forest theme styling
- **WHEN** the app theme is "forest"
- **THEN** react-calendar uses forest surface background, forest text, and forest accent colors from CSS custom properties

### Requirement: Navigation and tile hover states
The react-calendar navigation buttons and day/month/year tiles SHALL have hover and active states using theme-aware colors.

#### Scenario: Tile hover
- **WHEN** user hovers over a calendar tile
- **THEN** the tile background changes to a muted surface color from CSS custom properties
