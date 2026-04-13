## Context

DashStack has a library of reusable components that form the foundation of the UI. The generic TableCommon<T> component is used across multiple pages, the TopNav and Sidebar form the application shell, and consistent conventions (functional components, type props, cn(), lucide-react) ensure uniformity. Beyond the dashboard and product features, 12 additional pages complete the application.

## Goals / Non-Goals

**Goals:**
- Document shared component APIs and usage patterns
- Capture the application shell (TopNav + Sidebar) architecture
- Inventory all remaining pages and their route assignments
- Record component conventions for consistent development

**Non-Goals:**
- Refactoring existing components
- Adding new shared components
- Implementing functionality in placeholder pages

## Decisions

### Decision 1: Generic TableCommon<T> with Render Callback
**Choice**: Use TypeScript generics and a `renderCell` callback pattern for the table component.
**Rationale**: Generics provide type safety for column definitions and data. The render callback allows each consumer to define custom cell rendering without the table component knowing about specific data types.
**Alternatives considered**: Render props (more complex API), slots (not idiomatic React), fixed column types (not reusable).

### Decision 2: react-pro-sidebar for Navigation
**Choice**: Use react-pro-sidebar rather than a custom sidebar implementation.
**Rationale**: Provides collapse animation, menu structure, sub-menus, and responsive behavior out of the box. Reduces custom CSS and JavaScript for sidebar interactions.

### Decision 3: Type Keyword for Props
**Choice**: Use `type` instead of `interface` for component props definitions.
**Rationale**: Consistent convention across the codebase. Types and interfaces are functionally similar for props; choosing one reduces style debates.

### Decision 4: Lucide React with Standard Sizes
**Choice**: Use lucide-react for all icons with standardized sizes (w-4 h-4, w-5 h-5, w-6 h-6).
**Rationale**: Lucide provides a comprehensive, tree-shakeable icon set. Standard sizes ensure visual consistency without per-icon sizing decisions.

## Risks / Trade-offs

- **[Placeholder pages]** → Some remaining pages may have minimal functionality. Mitigation: documented as inventory; each page is a separate concern.
- **[react-pro-sidebar coupling]** → The sidebar component is tightly coupled to the library. Mitigation: Navigation data model is library-agnostic.
- **[Single table component for all use cases]** → TableCommon may not fit all future table needs. Mitigation: The generic + callback pattern is flexible enough for current use cases.
