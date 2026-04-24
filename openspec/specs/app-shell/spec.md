# app-shell Specification

## Purpose
Defines the TopNav and Sidebar composition — the shell that wraps every dashboard route.

## Requirements

### Requirement: TopNav composition
The TopNav component SHALL render a fixed header containing a search input, notification bell (with red indicator dot), LanguageSwitcher dropdown, and user profile section (avatar, name, role). Its left position SHALL adjust dynamically based on sidebar collapse state.

#### Scenario: TopNav elements
- **WHEN** TopNav renders
- **THEN** search input, notification bell, LanguageSwitcher, and user profile are all visible

#### Scenario: Sidebar-aware positioning
- **WHEN** the sidebar is collapsed
- **THEN** TopNav adjusts its left offset to 80px (collapsed sidebar width)

### Requirement: Sidebar with react-pro-sidebar
The Sidebar component SHALL use react-pro-sidebar to render a collapsible navigation menu with section headers, menu items, collapse animation, and bottom action items.

#### Scenario: Sidebar sections
- **WHEN** the Sidebar renders in expanded state
- **THEN** it displays section headers ("DASHBOARD", "PAGES") with their respective menu items

#### Scenario: Collapse animation
- **WHEN** the sidebar collapse is toggled
- **THEN** the sidebar animates between expanded (256px) and collapsed (80px) states

#### Scenario: Collapsed tooltips
- **WHEN** the sidebar is collapsed and a user hovers over a menu icon
- **THEN** a tooltip (via react-tooltip) shows the item label

### Requirement: Auth guard HOC
The `withAuth` HOC in `src/hoc/withAuth.tsx` SHALL check for a token in localStorage (via `appConfig.auth.tokenKey`), falling back to sessionStorage. If no token is found, it SHALL redirect to `/login` using `<Navigate>` with `{ from: location.pathname }` in route state. If a token is found, it SHALL render the wrapped component.

#### Scenario: Unauthenticated access
- **WHEN** a user without a token accesses a component wrapped with `withAuth`
- **THEN** they are redirected to `/login` with the current path in route state as `from`

#### Scenario: Authenticated access
- **WHEN** a user with a valid token accesses a component wrapped with `withAuth`
- **THEN** the wrapped component renders normally

#### Scenario: Return URL preserved
- **WHEN** an unauthenticated user tries to access `/inbox`
- **THEN** they are redirected to `/login` with `state.from` set to `/inbox`
