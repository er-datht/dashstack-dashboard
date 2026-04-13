## ADDED Requirements

### Requirement: Theme flash prevention
The application SHALL include an inline script in `index.html` that detects and applies the user's theme preference before the page renders, preventing a flash of unstyled content (FOUC).

#### Scenario: Theme applied before render
- **WHEN** the HTML document loads
- **THEN** the inline script reads the theme from localStorage (key `"theme"`) or system preference and sets the `data-theme` attribute on `<html>` before React hydrates

### Requirement: Provider hierarchy ordering
The application SHALL nest providers in the following order: `ThemeProvider` → `QueryClientProvider` → `WishlistProvider` → `AppRoutes`, ensuring that theme context is available to all components including the query layer and wishlist.

#### Scenario: Provider nesting in App.tsx
- **WHEN** the React application mounts
- **THEN** `ThemeProvider` wraps `QueryClientProvider`, which wraps `WishlistProvider`, which wraps `AppRoutes`

### Requirement: i18n initialization before render
The application entry point (`src/index.tsx`) SHALL import the i18n configuration from the project root (`i18n.ts`) before rendering the React tree, ensuring translations are loaded.

#### Scenario: Translation readiness at render
- **WHEN** `src/index.tsx` executes
- **THEN** i18n is initialized (importing `../i18n.ts`) before `ReactDOM.createRoot` renders the app

### Requirement: Yarn-only package management
The project SHALL use Yarn exclusively as the package manager. npm MUST NOT be used.

#### Scenario: Dependency installation
- **WHEN** a developer needs to install dependencies
- **THEN** they run `yarn` or `yarn add`, never `npm install`
