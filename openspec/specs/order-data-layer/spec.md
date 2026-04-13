## ADDED Requirements

### Requirement: Order list type definitions
The system SHALL define TypeScript types for the order list feature: `OrderListItem` (id, name, address, date, type, status), `OrderFilters` (dates: Date[], types: OrderType[], statuses: OrderListStatus[]), `OrderType` (8 string literal union), and `OrderListStatus` (4 string literal union: completed, processing, on_hold, rejected). All types SHALL be exported from `src/types/orders.ts`.

#### Scenario: OrderListItem type structure
- **WHEN** an order list item is created
- **THEN** it MUST have string fields: id, name, address, date; an OrderType field: type; and an OrderListStatus field: status

#### Scenario: OrderType covers all 8 categories
- **WHEN** the OrderType type is used
- **THEN** it accepts exactly: health_medicine, book_stationary, services_industry, fashion_beauty, home_living, electronics, mobile_phone, accessories

#### Scenario: OrderListStatus covers all 4 statuses
- **WHEN** the OrderListStatus type is used
- **THEN** it accepts exactly: completed, processing, on_hold, rejected

### Requirement: Mock data service with simulated delay
The `getOrders` function in `src/services/orders.ts` SHALL return a Promise that resolves to an array of 27 `OrderListItem` objects after a 500ms simulated delay. The mock data SHALL cover all 8 order types and all 4 statuses with dates spanning October-November 2024.

#### Scenario: Service returns mock data
- **WHEN** `getOrders()` is called
- **THEN** it resolves after ~500ms with an array of 27 OrderListItem objects

#### Scenario: Mock data covers all types and statuses
- **WHEN** the mock data is inspected
- **THEN** all 8 OrderType values and all 4 OrderListStatus values are represented across the 27 orders

### Requirement: useOrders React Query hook
The `useOrders` hook in `src/hooks/useOrders.ts` SHALL use React Query's `useQuery` with query key `["orders"]` and `getOrders` as the query function. It SHALL return `{ orders: OrderListItem[], isLoading: boolean, error: string | null, refetch: () => Promise<unknown> }` with orders defaulting to an empty array.

#### Scenario: Hook provides loading state
- **WHEN** the orders query is in-flight
- **THEN** `useOrders()` returns `isLoading: true` and `orders: []`

#### Scenario: Hook provides order data
- **WHEN** the orders query succeeds
- **THEN** `useOrders()` returns `isLoading: false` and `orders` populated with the fetched data

#### Scenario: Hook provides error state
- **WHEN** the orders query fails
- **THEN** `useOrders()` returns `error` as the error message string and `orders: []`

### Requirement: i18n translation coverage
The orders namespace SHALL provide translation files at `public/locales/{en,jp,ko}/orders.json` covering: page titles, column headers (columns.*), filter labels, status labels (status.*), order type labels (orderTypes.*), and action buttons. All UI text in Order components SHALL use the `t()` function from the `orders` namespace.

#### Scenario: English translations
- **WHEN** the language is set to English
- **THEN** all order page text renders from `public/locales/en/orders.json`

#### Scenario: Japanese translations
- **WHEN** the language is set to Japanese
- **THEN** all order page text renders from `public/locales/jp/orders.json`

#### Scenario: Korean translations
- **WHEN** the language is set to Korean
- **THEN** all order page text renders from `public/locales/ko/orders.json`

### Requirement: Theme support across all components
All Orders page components SHALL support the 3 themes (light, dark, forest) via CSS custom properties. SCSS module styles SHALL use theme tokens (`--color-surface`, `--color-border`, `--color-text-primary`, `--color-primary-*`) rather than hardcoded colors for all theme-adaptive elements.

#### Scenario: Dark theme rendering
- **WHEN** the theme is set to "dark"
- **THEN** the filter bar, calendar popup, order type popup, and table render with dark theme colors via CSS custom property values

#### Scenario: Forest theme rendering
- **WHEN** the theme is set to "forest"
- **THEN** all Orders page components render with forest theme colors via CSS custom property values
