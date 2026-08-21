## ADDED Requirements

### Requirement: LoadingFallback appearance
The `LoadingFallback` rendered by the Suspense boundary in `AppRoutes.tsx` SHALL draw its spinner arc from `var(--color-loading-accent)`, its spinner track from `var(--color-loading-track)`, its backdrop from the active theme's background token, and its text from `var(--color-text-secondary)`. It SHALL NOT reference `border-primary-600`, `bg-white`, `bg-gray-900`, `text-gray-600`, `text-gray-400`, or any Tailwind `dark:` variant.

This fallback is the first thing rendered on a cold load of any route, so it is the most visible loading indicator in the application.

#### Scenario: Fallback spinner is actually coloured
- **WHEN** a lazy-loaded page is being fetched
- **THEN** the fallback spinner renders in the active theme's loading accent, not in the inherited body text colour it previously fell back to because `border-primary-600` resolves to no generated utility

#### Scenario: Fallback follows the app theme on a cold load
- **WHEN** the user has selected the dark or forest theme and reloads the application
- **THEN** the fallback's backdrop, spinner, and text render in that theme's values, and do not switch based on the operating system's colour-scheme preference
