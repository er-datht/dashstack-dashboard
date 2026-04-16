# remaining-pages Specification

## Purpose
Defines the remaining routable pages (Todo, Login, Settings, and the secondary content pages) and the lazy-loading contract for all pages.

## Requirements

### Requirement: Todo page with CRUD
The Todo page SHALL provide task management functionality using the `useTodos()` hook, supporting creating, reading, updating, and deleting todos with optimistic updates.

#### Scenario: Add new todo
- **WHEN** a user creates a new todo
- **THEN** it appears immediately in the list (optimistic) and is persisted via API

#### Scenario: Toggle todo completion
- **WHEN** a user toggles a todo's completion status
- **THEN** the UI updates immediately and the change is persisted

### Requirement: Login page as public route
The Login page SHALL render outside the DashboardLayout as the only public route, serving as the authentication entry point.

#### Scenario: Login page access
- **WHEN** an unauthenticated user accesses the app
- **THEN** the Login page renders without sidebar or topnav

### Requirement: Settings page
The Settings page SHALL provide application settings management.

#### Scenario: Settings access
- **WHEN** a user navigates to Settings
- **THEN** the settings page renders within the DashboardLayout

### Requirement: Remaining content pages
The following pages SHALL exist as routable pages within DashboardLayout: Orders, Calendar, Contact, Inbox, Invoice, Pricing, Team, Table, and UiElement.

#### Scenario: Page routing
- **WHEN** a user navigates to any of the remaining pages
- **THEN** the corresponding page component renders within DashboardLayout

### Requirement: All pages lazy-loaded
All page components (including remaining pages) SHALL be lazy-loaded in AppRoutes.tsx for code splitting.

#### Scenario: Lazy loading on navigation
- **WHEN** a user navigates to a page for the first time
- **THEN** the page's code bundle is loaded on demand
