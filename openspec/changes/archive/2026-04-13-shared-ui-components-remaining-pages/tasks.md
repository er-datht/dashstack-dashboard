## 1. Verify Shared Components

- [ ] 1.1 Confirm TableCommon<T> accepts typed columns, data, renderCell, and optional pagination
- [ ] 1.2 Confirm StatusBadge renders Delivered (teal), Pending (yellow), Rejected (red) with i18n support
- [ ] 1.3 Confirm Button variants (ButtonDefault, ButtonDanger, ButtonGroup, IconButton) exist and are styled
- [ ] 1.4 Confirm Pagination uses react-paginate with configurable page size
- [ ] 1.5 Confirm LoadingWrapper conditionally renders loading state or children

## 2. Verify Application Shell

- [ ] 2.1 Confirm TopNav renders search, notification bell, LanguageSwitcher, and user profile
- [ ] 2.2 Confirm TopNav position adjusts with sidebar collapse state
- [ ] 2.3 Confirm Sidebar uses react-pro-sidebar with section headers and collapse animation
- [ ] 2.4 Confirm Sidebar shows tooltips in collapsed mode via react-tooltip

## 3. Verify Remaining Pages

- [ ] 3.1 Confirm Todo page supports CRUD operations via useTodos hook
- [ ] 3.2 Confirm Login page renders outside DashboardLayout
- [ ] 3.3 Confirm all remaining pages (Orders, Calendar, Contact, Inbox, Invoice, Pricing, Team, Table, UiElement, Settings) are routable and lazy-loaded

## 4. Verify Component Conventions

- [ ] 4.1 Confirm components use `type` for props (not `interface`)
- [ ] 4.2 Confirm components use `cn()` helper for class composition
- [ ] 4.3 Confirm lucide-react icons use standard sizes (w-4 h-4, w-5 h-5, w-6 h-6)
