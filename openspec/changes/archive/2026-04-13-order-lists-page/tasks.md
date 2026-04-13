## 1. Verify Order Data Layer

- [ ] 1.1 Confirm `src/types/orders.ts` exports OrderListItem, OrderFilters, OrderType (8 values), and OrderListStatus (4 values)
- [ ] 1.2 Confirm `src/services/orders.ts` returns 27 mock OrderListItem objects after 500ms delay covering all 8 types and 4 statuses
- [ ] 1.3 Confirm `src/hooks/useOrders.ts` uses React Query with key `["orders"]` and returns `{ orders, isLoading, error, refetch }`

## 2. Verify Order Table Display

- [ ] 2.1 Confirm Orders page (`src/pages/Orders/index.tsx`) renders TableCommon with 6 columns: ID, Name, Address, Date, Type, Status
- [ ] 2.2 Confirm custom renderCell formats ID with `#` prefix, Date with Intl.DateTimeFormat, Type with i18n translation, and Status with OrderStatusBadge
- [ ] 2.3 Confirm `src/pages/Orders/OrderStatusBadge.tsx` renders color-coded badges for all 4 statuses (completed=green, processing=purple, on_hold=orange, rejected=red)
- [ ] 2.4 Confirm page header shows ClipboardList icon with translated "Order Lists" title

## 3. Verify Pagination

- [ ] 3.1 Confirm pagination displays with ITEMS_PER_PAGE=9, pageRangeDisplayed=5, marginPagesDisplayed=2
- [ ] 3.2 Confirm page resets to 0 when any filter changes or reset is clicked

## 4. Verify Filter System

- [ ] 4.1 Confirm `src/pages/Orders/FilterBar.tsx` renders segmented control with filter icon, label, 3 filter popups, and reset button
- [ ] 4.2 Confirm only one popup (date, type, status) can be open at a time
- [ ] 4.3 Confirm `src/pages/Orders/DateFilterPopup.tsx` renders calendar with month navigation, 7-column grid, multi-date toggle, today highlighting, and "Apply Now" button
- [ ] 4.4 Confirm `src/pages/Orders/OrderTypeFilterPopup.tsx` renders 8 order type chips with toggle selection and "Apply Now" button
- [ ] 4.5 Confirm status filter dropdown renders 4 checkboxes with immediate toggle (no apply button)
- [ ] 4.6 Confirm filters combine with AND logic: matching dates AND types AND statuses
- [ ] 4.7 Confirm reset button clears all filter arrays and resets pagination

## 5. Verify Styling and Theming

- [ ] 5.1 Confirm `src/pages/Orders/Orders.module.scss` provides styles for filterBar, calendarPopup, orderTypePopup, status dropdown, and chip components using CSS custom properties
- [ ] 5.2 Confirm all components render correctly across light, dark, and forest themes

## 6. Verify i18n

- [ ] 6.1 Confirm `public/locales/en/orders.json` contains all translation keys (columns, status, orderTypes, filter labels, actions)
- [ ] 6.2 Confirm `public/locales/jp/orders.json` contains matching Japanese translations
- [ ] 6.3 Confirm `public/locales/ko/orders.json` contains matching Korean translations
- [ ] 6.4 Confirm all UI text in Order components uses `t()` from the `orders` namespace
