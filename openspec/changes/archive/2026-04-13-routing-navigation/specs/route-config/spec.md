## ADDED Requirements

### Requirement: Centralized route constants
All route paths SHALL be defined as constants in the `ROUTES` object exported from `src/routes/routes.ts`. Components MUST reference `ROUTES.*` instead of hardcoding path strings.

#### Scenario: Route path usage
- **WHEN** a component needs to navigate or link to a route
- **THEN** it uses `ROUTES.DASHBOARD`, `ROUTES.PRODUCTS`, etc. from the routes constant file

### Requirement: Lazy-loaded page components
All page components SHALL be lazy-loaded using React's `lazy()` function in `AppRoutes.tsx` to enable code splitting.

#### Scenario: Page component loading
- **WHEN** a user navigates to a route for the first time
- **THEN** the page component bundle is loaded on demand via lazy loading

#### Scenario: Loading state during lazy load
- **WHEN** a lazy-loaded page component is being fetched
- **THEN** a Suspense boundary renders a LoadingFallback component

### Requirement: Public and protected route separation
The routing system SHALL separate public routes (Login) from protected routes (all dashboard pages). Protected routes SHALL be wrapped in DashboardLayout.

#### Scenario: Login as public route
- **WHEN** a user accesses the login path
- **THEN** the Login page renders without the DashboardLayout wrapper

#### Scenario: Dashboard routes with layout
- **WHEN** a user accesses any dashboard route
- **THEN** it renders within the DashboardLayout (sidebar + topnav + content)

### Requirement: Nested route support
The routing system SHALL support nested routes, specifically `products/:id/edit` mapping to the EditProduct page component.

#### Scenario: Product edit navigation
- **WHEN** a user navigates to `/products/123/edit`
- **THEN** the EditProduct page renders with access to the `id` parameter "123"

### Requirement: Catch-all redirect
The routing system SHALL redirect any unmatched route to the Dashboard page.

#### Scenario: Unknown route access
- **WHEN** a user navigates to a path that doesn't match any defined route
- **THEN** they are redirected to the Dashboard page

### Requirement: Auth guard HOC
The `withAuth` HOC in `src/hoc/withAuth.tsx` SHALL wrap components to check authentication status. Currently it is a placeholder that always returns `isAuthenticated = true`.

#### Scenario: Authenticated access (current placeholder)
- **WHEN** a user accesses a protected component wrapped with `withAuth`
- **THEN** the component renders (placeholder always returns authenticated)
