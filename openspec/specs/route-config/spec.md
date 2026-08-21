# route-config Specification

## Purpose
Defines the React Router v7 configuration: centralized `ROUTES` constants, lazy-loaded pages, public vs. protected route separation, nested routes, catch-all redirect, and the `withAuth` HOC.
## Requirements
### Requirement: Centralized route constants
All route paths SHALL be defined as constants in the `ROUTES` object exported from `src/routes/routes.ts`. Components MUST reference `ROUTES.*` instead of hardcoding path strings. The `ROUTES` object SHALL include `REGISTER: "/register"` in addition to all existing route constants. The constant for the UI Elements page SHALL be `UI_ELEMENTS: "/ui-elements"` (plural). The previous singular `UI_ELEMENT` constant SHALL be removed.

#### Scenario: Route path usage
- **WHEN** a component needs to navigate or link to a route
- **THEN** it uses `ROUTES.DASHBOARD`, `ROUTES.PRODUCTS`, `ROUTES.REGISTER`, `ROUTES.UI_ELEMENTS`, etc. from the routes constant file

#### Scenario: UI Elements route key is plural
- **WHEN** a developer references the UI Elements page route
- **THEN** they use `ROUTES.UI_ELEMENTS` and the resolved value is `/ui-elements`

### Requirement: Lazy-loaded page components
All page components SHALL be lazy-loaded using React's `lazy()` function in `AppRoutes.tsx` to enable code splitting. This includes the Register page and the UI Elements page (lazy import target `../pages/UiElements`).

#### Scenario: Page component loading
- **WHEN** a user navigates to a route for the first time
- **THEN** the page component bundle is loaded on demand via lazy loading

#### Scenario: Loading state during lazy load
- **WHEN** a lazy-loaded page component is being fetched
- **THEN** a Suspense boundary renders a LoadingFallback component

#### Scenario: Register page lazy loading
- **WHEN** a user navigates to `/register` for the first time
- **THEN** the Register component bundle is loaded on demand via lazy loading

#### Scenario: UI Elements page lazy loading
- **WHEN** a user navigates to `/ui-elements` for the first time
- **THEN** the UiElements component bundle is loaded on demand via lazy loading

### Requirement: Public and protected route separation
The routing system SHALL separate public routes (Login, Register) from protected routes (all dashboard pages). Protected routes SHALL be wrapped in DashboardLayout. The DashboardLayout route element SHALL be wrapped with `withAuth` to guard all dashboard routes at once.

#### Scenario: Login as public route
- **WHEN** a user accesses the login path
- **THEN** the Login page renders without the DashboardLayout wrapper

#### Scenario: Register as public route
- **WHEN** a user accesses the `/register` path
- **THEN** the Register page renders without the DashboardLayout wrapper

#### Scenario: Dashboard routes with auth guard
- **WHEN** an unauthenticated user accesses any dashboard route
- **THEN** they are redirected to `/login` with the attempted path stored in route state

### Requirement: Nested route support
The routing system SHALL support nested routes, specifically `products/:id/edit` mapping to the EditProduct page component.

#### Scenario: Product edit navigation
- **WHEN** a user navigates to `/products/123/edit`
- **THEN** the EditProduct page renders with access to the `id` parameter "123"

### Requirement: Catch-all redirect
The routing system SHALL redirect any unmatched route to the Dashboard page. This includes the legacy singular `/ui-element` path, which is no longer registered.

#### Scenario: Unknown route access
- **WHEN** a user navigates to a path that doesn't match any defined route
- **THEN** they are redirected to the Dashboard page

#### Scenario: Legacy /ui-element redirects via catch-all
- **WHEN** a user navigates to `/ui-element` (the previous singular path)
- **THEN** the catch-all rule redirects them to `/dashboard`

### Requirement: LoadingFallback appearance
The `LoadingFallback` rendered by the Suspense boundary in `AppRoutes.tsx` SHALL draw its spinner arc from `var(--color-loading-accent)`, its spinner track from `var(--color-loading-track)`, its backdrop from the active theme's background token, and its text from `var(--color-text-secondary)`. It SHALL NOT reference `border-primary-600`, `bg-white`, `bg-gray-900`, `text-gray-600`, `text-gray-400`, or any Tailwind `dark:` variant.

This fallback is the first thing rendered on a cold load of any route, so it is the most visible loading indicator in the application.

#### Scenario: Fallback spinner is actually coloured
- **WHEN** a lazy-loaded page is being fetched
- **THEN** the fallback spinner renders in the active theme's loading accent, not in the inherited body text colour it previously fell back to because `border-primary-600` resolves to no generated utility

#### Scenario: Fallback follows the app theme on a cold load
- **WHEN** the user has selected the dark or forest theme and reloads the application
- **THEN** the fallback's backdrop, spinner, and text render in that theme's values, and do not switch based on the operating system's colour-scheme preference

