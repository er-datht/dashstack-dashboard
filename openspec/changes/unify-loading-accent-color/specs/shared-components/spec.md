## MODIFIED Requirements

### Requirement: LoadingWrapper component
The LoadingWrapper SHALL conditionally render either a loading indicator or its children based on loading state. Its spinner SHALL take its colour from `var(--color-loading-accent)`, its accompanying text SHALL use `var(--color-text-secondary)`, and its overlay scrim SHALL be derived from the active theme's page background via `var(--color-scrim)`. None of these three SHALL be expressed with a Tailwind `dark:` variant or a numbered-palette class.

#### Scenario: Loading state
- **WHEN** loading is true
- **THEN** a loading indicator is displayed instead of children

#### Scenario: Loaded state
- **WHEN** loading is false
- **THEN** children are rendered

#### Scenario: Spinner colour per theme
- **WHEN** the loading indicator renders under light, dark, or forest
- **THEN** the spinner is that theme's loading accent rather than a neutral gray

#### Scenario: Scrim matches the surface it covers
- **WHEN** the overlay renders under the dark or forest theme
- **THEN** the scrim is a translucent form of that theme's page background, not the light theme's white, so the content behind it stays legibly dimmed rather than washed lighter

## ADDED Requirements

### Requirement: TableCommon loading overlay colour
The `TableCommon` loading overlay's spinner SHALL take its colour from `var(--color-loading-accent)`. The component's stylesheet SHALL NOT carry a `:global(.dark)` override for the spinner: `ThemeContext` sets only the `data-theme` attribute and never applies a `.dark` class, so such a rule can never match.

#### Scenario: Overlay spinner per theme
- **WHEN** `TableCommon` renders with `loading` true under any theme
- **THEN** the overlay spinner is that theme's loading accent

#### Scenario: No unreachable theme selector
- **WHEN** `TableCommon.module.scss` is inspected
- **THEN** it contains no `:global(.dark)` spinner rule, because the class it targets is never applied to the document
