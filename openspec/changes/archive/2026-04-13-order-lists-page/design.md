## Context

DashStack's Orders page (`/orders`) provides a table-based view of order data with client-side filtering and pagination. The page is fully implemented using mock data (27 orders with a 500ms simulated delay), consumed through a React Query hook. The filter system uses a segmented control bar with three popup-based filter types (date calendar, order type chips, status checkboxes). All components follow the project's 3-tier styling approach (Tailwind utilities + CSS custom properties + SCSS modules) and support all 3 themes.

## Goals / Non-Goals

**Goals:**
- Document the order table composition using TableCommon with custom cell rendering
- Capture the filter system architecture: FilterBar as orchestrator, three independent filter popups with local state + apply pattern
- Document the mock data service and React Query integration via useOrders hook
- Explain the client-side filtering and pagination interaction (page resets on filter change)
- Document the SCSS module structure for popups, calendar, and segmented control

**Non-Goals:**
- Connecting to a real orders API (mock data service is intentional)
- Server-side filtering or pagination
- Adding new order management features (edit, delete, status updates)
- Mobile-responsive filter bar layout

## Decisions

### Decision 1: Client-Side Filtering with Array-Based Filters
**Choice**: All filtering is performed client-side using array-based predicates on the full dataset. The `OrderFilters` type holds `dates: Date[]`, `types: OrderType[]`, and `statuses: OrderListStatus[]`.
**Rationale**: With only 27 mock orders, client-side filtering is sufficient and avoids API complexity. Empty arrays mean "no filter applied" (show all), which is intuitive and avoids null checks.
**Alternatives considered**: Server-side filtering (unnecessary for mock data), single-select filters (less powerful for multi-criteria search).

### Decision 2: Local State + Apply Pattern for Popups
**Choice**: DateFilterPopup and OrderTypeFilterPopup maintain local state copies that sync on open, with an explicit "Apply Now" button to commit changes. Status filter applies immediately on checkbox toggle.
**Rationale**: The apply pattern prevents excessive re-filtering during multi-date or multi-type selection. Status filter uses immediate toggle because it has only 4 options and users expect instant feedback from checkboxes.
**Alternatives considered**: Immediate apply for all (causes re-renders during multi-select), debounced filtering (adds complexity without benefit).

### Decision 3: SCSS Module for Complex Popup Styles
**Choice**: Use `Orders.module.scss` for the calendar popup, order type popup, segmented filter bar, and chip components. Tailwind utilities used for simpler inline styles.
**Rationale**: The calendar grid, chip layout, and segmented control have complex visual states (selected, hover, today, otherMonth) that are cleaner in SCSS than long Tailwind class strings. Follows the project's tier-3 styling guideline for complex components.

### Decision 4: Shared OrderStatusBadge with Inline Color Mapping
**Choice**: OrderStatusBadge uses a `STATUS_STYLES` record mapping each status to hardcoded RGBA background/text color pairs via inline styles.
**Rationale**: The 4 status colors are fixed design tokens that don't vary by theme. Inline styles avoid creating theme-specific CSS variables for one-off badge colors. The component is self-contained and reusable.
**Alternatives considered**: Tailwind utility classes (no built-in RGBA support for these specific colors), CSS custom properties per status (over-engineering for 4 static values).

### Decision 5: TableCommon Integration with Custom renderCell
**Choice**: The Orders page uses the shared TableCommon component with column definitions and a custom `renderCell` function for cell-level formatting (date formatting, i18n type labels, status badges).
**Rationale**: TableCommon provides consistent table layout, loading states, and pagination across the app. Custom renderCell keeps the Orders-specific display logic co-located with the page.

## Risks / Trade-offs

- **[Mock data only]** → All order data is hardcoded with a simulated delay. Mitigation: service layer (`getOrders`) is structured for real API integration — just replace the implementation.
- **[Hardcoded status colors]** → OrderStatusBadge uses fixed RGBA values rather than theme tokens. Mitigation: colors are intentionally static across themes; if theme-specific status colors are needed later, refactor to CSS custom properties.
- **[No click-outside for date/type popups on mobile]** → Popups rely on mousedown events for dismissal. Mitigation: acceptable for current desktop-focused dashboard use case.
- **[Calendar uses 42-cell fixed grid]** → Always renders 6 rows regardless of month length, showing adjacent month days. Mitigation: standard calendar pattern; adjacent days are visually de-emphasized with opacity.
