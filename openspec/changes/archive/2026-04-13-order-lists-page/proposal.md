## Why

Document the Order Lists page feature of DashStack, including the order table display, multi-criteria filtering system (date calendar, order type chips, status checkboxes), pagination, mock data service with React Query integration, and full i18n/theming support. This is the only major feature page without an OpenSpec specification, creating a gap in traceability across the project.

## What Changes

- Document the Orders page with TableCommon-based table display and client-side filtering
- Document the FilterBar segmented control with 3 filter popup types + reset
- Document the DateFilterPopup calendar with multi-date selection, month navigation, and today highlighting
- Document the OrderTypeFilterPopup with 8 toggleable chip categories
- Document the OrderStatusBadge color-coded status display for 4 statuses
- Document the mock data service (27 orders, 500ms simulated delay) and useOrders React Query hook
- Document the Orders type system (OrderListItem, OrderFilters, OrderType, OrderListStatus)
- Document i18n coverage across en/jp/ko with 68 translation keys in the orders namespace

## Capabilities

### New Capabilities
- `order-table`: Orders page composition with TableCommon integration, column definitions, custom cell rendering, and client-side pagination (9 items/page via react-paginate)
- `order-filter-system`: FilterBar segmented control with DateFilterPopup (calendar with multi-date selection), OrderTypeFilterPopup (8-category chip selector), status dropdown (checkbox-based multi-select), and reset functionality
- `order-data-layer`: Mock data service with simulated async delay, useOrders React Query hook (query key: ["orders"]), and TypeScript type definitions for OrderListItem, OrderFilters, OrderType, and OrderListStatus

### Modified Capabilities

## Impact

- **Files**: `src/pages/Orders/` (index.tsx, FilterBar.tsx, DateFilterPopup.tsx, OrderTypeFilterPopup.tsx, OrderStatusBadge.tsx, Orders.module.scss)
- **Types**: `src/types/orders.ts` (OrderListItem, OrderFilters, OrderType, OrderListStatus)
- **Services**: `src/services/orders.ts` (mock data with 27 orders)
- **Hooks**: `src/hooks/useOrders.ts` (React Query wrapper)
- **i18n**: `public/locales/{en,jp,ko}/orders.json` (68 translation keys)
- **Dependencies**: Uses TableCommon, react-paginate, lucide-react, classnames, react-i18next
