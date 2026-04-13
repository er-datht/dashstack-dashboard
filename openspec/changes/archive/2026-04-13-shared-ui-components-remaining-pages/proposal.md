## Why

Document the shared UI component library and remaining pages of DashStack. The application has a set of reusable components (TableCommon, StatusBadge, Button variants, Pagination, TopNav, Sidebar, LoadingWrapper) following consistent conventions, plus 12 additional pages beyond the dashboard and product features. This spec captures component APIs, conventions, and page inventory.

## What Changes

- Document the generic TableCommon<T> component with column definitions and render callbacks
- Document StatusBadge, Button variants, Pagination, and LoadingWrapper components
- Document TopNav composition (search, notifications, language, profile)
- Document Sidebar navigation component with react-pro-sidebar
- Document component conventions (functional, type props, cn(), lucide-react icons)
- Document remaining pages: Orders, Todo, Calendar, Contact, Inbox, Invoice, Pricing, Team, Table, UiElement, Settings, Login

## Capabilities

### New Capabilities
- `shared-components`: Reusable UI components including TableCommon<T>, StatusBadge, Button variants, Pagination, LoadingWrapper, and their APIs
- `app-shell`: TopNav and Sidebar components that form the application shell with search, notifications, language switching, user profile, and navigation
- `remaining-pages`: Inventory and architecture of pages beyond Dashboard and Product features (Orders, Todo, Calendar, Contact, Inbox, Invoice, Pricing, Team, Table, UiElement, Settings, Login)

### Modified Capabilities

## Impact

- **Files**: `src/components/TableCommon/`, `src/components/StatusBadge/`, `src/components/Button/`, `src/components/Pagination/`, `src/components/TopNav/`, `src/components/Sidebar/`, `src/components/LoadingWrapper/`, remaining `src/pages/*/`
- **Convention**: All components use functional style with `type` for props, `cn()` for classes, and lucide-react for icons
