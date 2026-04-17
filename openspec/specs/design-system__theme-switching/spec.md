# theme-switching Specification

## Purpose
Defines the three-theme (light / dark / forest) context, persistence, system preference detection, and the `data-theme` attribute that drives all theme-aware CSS.

## Requirements

### Requirement: ThemeContext state management
The theme system SHALL provide a `ThemeContext` and `ThemeProvider` component that manages the current theme state and exposes it to all child components.

#### Scenario: Theme available throughout app
- **WHEN** any component within the ThemeProvider tree accesses the theme context
- **THEN** it receives the current theme value and theme-changing functions

### Requirement: Three theme support
The theme system SHALL support exactly three themes: `"light"`, `"dark"`, and `"forest"`, defined by the `Theme` type.

#### Scenario: Valid theme values
- **WHEN** the theme is set
- **THEN** it MUST be one of `"light"`, `"dark"`, or `"forest"`

### Requirement: Theme persistence to localStorage
The theme system SHALL persist the selected theme to localStorage under the key `"theme"` and restore it on application load.

#### Scenario: Theme restored on reload
- **WHEN** the application loads and localStorage contains a `"theme"` value
- **THEN** that theme is applied immediately

#### Scenario: Theme saved on change
- **WHEN** the user changes the theme
- **THEN** the new theme value is written to localStorage under the `"theme"` key

### Requirement: System preference detection
The theme system SHALL detect the user's system color scheme preference as a fallback when no theme is stored in localStorage.

#### Scenario: Dark mode system preference
- **WHEN** no theme is in localStorage AND the system prefers dark mode
- **THEN** the dark theme is applied

#### Scenario: Default to light
- **WHEN** no theme is in localStorage AND no system preference is detected
- **THEN** the light theme is applied as the default

### Requirement: HTML data-theme attribute
The theme system SHALL set the `data-theme` attribute on the `<html>` element to the current theme value, driving all CSS custom property theme values.

#### Scenario: Attribute updates on theme change
- **WHEN** the theme changes from "light" to "forest"
- **THEN** `<html data-theme="forest">` is set, causing all theme-aware CSS to update

### Requirement: cycleTheme functionality
The theme system SHALL provide a `cycleTheme()` function that cycles through themes in order: light → dark → forest → light.

#### Scenario: Cycling from dark to forest
- **WHEN** the current theme is "dark" and `cycleTheme()` is called
- **THEN** the theme changes to "forest"

### Requirement: useTheme hook with guard
The `useTheme()` hook SHALL throw an error if used outside of a `ThemeProvider`, ensuring consumers always have a valid theme context.

#### Scenario: Hook used outside provider
- **WHEN** `useTheme()` is called in a component not wrapped by ThemeProvider
- **THEN** an error is thrown indicating the hook must be used within ThemeProvider
