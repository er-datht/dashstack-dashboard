## Context

DashStack uses React Router v7 with a centralized route configuration pattern. All 18 pages are lazy-loaded for code splitting. The application separates public routes (Login) from protected dashboard routes, which render within a shared DashboardLayout component containing a collapsible sidebar and fixed top navigation.

## Goals / Non-Goals

**Goals:**
- Document the route configuration pattern and how to add new pages
- Capture the DashboardLayout structure and sidebar collapse mechanics
- Explain the navigation data model and its i18n integration
- Record the auth guard pattern and its current limitations

**Non-Goals:**
- Implementing real authentication in the withAuth HOC
- Adding new routes or pages
- Changing the navigation library (react-pro-sidebar)

## Decisions

### Decision 1: Centralized Route Constants
**Choice**: Define all route paths in a single `ROUTES` object in `src/routes/routes.ts`.
**Rationale**: Prevents path string duplication across the codebase. Makes route changes a single-point update. Enables TypeScript autocompletion for route paths.
**Alternatives considered**: File-based routing (more magic, less explicit), inline path strings (duplication risk).

### Decision 2: Lazy Loading All Pages
**Choice**: Every page component is lazy-loaded via `React.lazy()` in AppRoutes.tsx.
**Rationale**: Enables automatic code splitting per page, reducing initial bundle size. Users only download the code for pages they visit.
**Alternatives considered**: Eager loading (simpler but larger bundles), route-level splitting via Vite (more complex configuration).

### Decision 3: react-pro-sidebar for Navigation
**Choice**: Use `react-pro-sidebar` library for the sidebar component.
**Rationale**: Provides built-in collapse animation, menu structure, and sub-menu support out of the box. Reduces custom sidebar implementation effort.

### Decision 4: Data-Driven Navigation
**Choice**: Define navigation items as data (`navigationData.ts`) rather than JSX in the sidebar component.
**Rationale**: Separates navigation structure from rendering. Makes it easy to add/remove/reorder items. Enables i18n by passing the `t` function.

### Decision 5: HOC Pattern for Auth Guard
**Choice**: Use a Higher-Order Component (`withAuth`) pattern for route protection.
**Rationale**: HOCs wrap components declaratively and can be composed. Currently a placeholder to be implemented when auth is added.
**Alternatives considered**: Route-level guards (React Router loaders), context-based guards, middleware.

## Risks / Trade-offs

- **[withAuth is a placeholder]** → All routes are effectively unprotected. Mitigation: documented as a known gap; the HOC pattern is in place for future implementation.
- **[Lazy loading waterfall]** → Nested lazy components can cause loading waterfalls. Mitigation: Only top-level pages are lazy-loaded; child components within pages are eager.
- **[react-pro-sidebar dependency]** → Third-party library for core navigation. Mitigation: The navigation data model is library-agnostic; only the rendering layer depends on react-pro-sidebar.
