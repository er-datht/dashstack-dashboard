## RENAMED Requirements

(none — no requirement names change; the change updates a value within existing requirements.)

## MODIFIED Requirements

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

### Requirement: Catch-all redirect
The routing system SHALL redirect any unmatched route to the Dashboard page. This includes the legacy singular `/ui-element` path, which is no longer registered.

#### Scenario: Unknown route access
- **WHEN** a user navigates to a path that doesn't match any defined route
- **THEN** they are redirected to the Dashboard page

#### Scenario: Legacy /ui-element redirects via catch-all
- **WHEN** a user navigates to `/ui-element` (the previous singular path)
- **THEN** the catch-all rule redirects them to `/dashboard`
