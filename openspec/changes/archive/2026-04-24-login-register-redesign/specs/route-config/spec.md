## MODIFIED Requirements

### Requirement: Centralized route constants
All route paths SHALL be defined as constants in the `ROUTES` object exported from `src/routes/routes.ts`. Components MUST reference `ROUTES.*` instead of hardcoding path strings. The `ROUTES` object SHALL include `REGISTER: "/register"` in addition to all existing route constants.

#### Scenario: Route path usage
- **WHEN** a component needs to navigate or link to a route
- **THEN** it uses `ROUTES.DASHBOARD`, `ROUTES.PRODUCTS`, `ROUTES.REGISTER`, etc. from the routes constant file

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

### Requirement: Lazy-loaded page components
All page components SHALL be lazy-loaded using React's `lazy()` function in `AppRoutes.tsx` to enable code splitting. This includes the new Register page.

#### Scenario: Register page lazy loading
- **WHEN** a user navigates to `/register` for the first time
- **THEN** the Register component bundle is loaded on demand via lazy loading
