# route-config Specification

## Purpose
Defines the React Router v7 configuration: centralized `ROUTES` constants, lazy-loaded pages, public vs. protected route separation, nested routes, catch-all redirect, and the `withAuth` HOC.

## Requirements

### Requirement: Centralized route constants
All route paths SHALL be defined as constants in the `ROUTES` object exported from `src/routes/routes.ts`. Components MUST reference `ROUTES.*` instead of hardcoding path strings. The `ROUTES` object SHALL include `REGISTER: "/register"` in addition to all existing route constants.

#### Scenario: Route path usage
- **WHEN** a component needs to navigate or link to a route
- **THEN** it uses `ROUTES.DASHBOARD`, `ROUTES.PRODUCTS`, `ROUTES.REGISTER`, etc. from the routes constant file

### Requirement: Lazy-loaded page components
All page components SHALL be lazy-loaded using React's `lazy()` function in `AppRoutes.tsx` to enable code splitting. This includes the Register page.

#### Scenario: Page component loading
- **WHEN** a user navigates to a route for the first time
- **THEN** the page component bundle is loaded on demand via lazy loading

#### Scenario: Loading state during lazy load
- **WHEN** a lazy-loaded page component is being fetched
- **THEN** a Suspense boundary renders a LoadingFallback component

#### Scenario: Register page lazy loading
- **WHEN** a user navigates to `/register` for the first time
- **THEN** the Register component bundle is loaded on demand via lazy loading

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
The routing system SHALL redirect any unmatched route to the Dashboard page.

#### Scenario: Unknown route access
- **WHEN** a user navigates to a path that doesn't match any defined route
- **THEN** they are redirected to the Dashboard page

