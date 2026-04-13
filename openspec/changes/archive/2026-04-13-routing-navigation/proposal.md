## Why

Document the routing architecture and navigation system of DashStack. The application uses React Router v7 with lazy-loaded routes, a centralized route constants pattern, a dashboard layout wrapper, and a sidebar navigation data model. This spec captures how routes are defined, protected, and navigated so that new pages can be added consistently and the auth guard can be properly implemented in the future.

## What Changes

- Document React Router v7 route configuration with lazy loading and code splitting
- Document the ROUTES constant object and the pattern for adding new routes
- Document DashboardLayout structure (sidebar + topnav + content area)
- Document sidebar navigation data model and its i18n integration
- Document the withAuth HOC pattern and its current placeholder status
- Document the nested route pattern for products/:id/edit

## Capabilities

### New Capabilities
- `route-config`: React Router v7 route definitions, lazy loading, route constants, nested routes, and the catch-all redirect pattern
- `dashboard-layout`: DashboardLayout component structure with sidebar collapse management, fixed positioning, and responsive margins
- `sidebar-navigation`: Navigation data model with sections, items, icons, i18n integration, and bottom action items

### Modified Capabilities

## Impact

- **Files**: `src/routes/routes.ts`, `src/routes/AppRoutes.tsx`, `src/layouts/DashboardLayout.tsx`, `src/components/Sidebar/navigationData.ts`, `src/hoc/withAuth.tsx`
- **Pattern**: Adding a new page requires updates to routes.ts, AppRoutes.tsx, and navigationData.ts
- **Known gap**: withAuth HOC is a placeholder (always returns isAuthenticated = true)
