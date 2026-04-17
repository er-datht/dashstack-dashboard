## ADDED Requirements

### Requirement: Order table with six columns
The Orders page SHALL display orders in a TableCommon table with columns: ID, Name, Address, Date, Type, and Status. Column headers SHALL use i18n keys from the `orders` namespace (`columns.id`, `columns.name`, `columns.address`, `columns.date`, `columns.type`, `columns.status`).

#### Scenario: Table renders with correct columns
- **WHEN** the Orders page loads and data is available
- **THEN** a table displays with six columns (ID, NAME, ADDRESS, DATE, TYPE, STATUS) using translated headers

#### Scenario: ID column displays formatted order ID
- **WHEN** an order row renders
- **THEN** the ID cell displays the order ID prefixed with `#` (e.g., `#00001`)

### Requirement: Custom cell rendering
The Orders page SHALL use a custom `renderCell` function to format each column: ID with `#` prefix, Name in medium-weight primary text, Address and Date in secondary text, Type with i18n-translated label (`orderTypes.{type}`), and Status with an OrderStatusBadge component.

#### Scenario: Date column formatting
- **WHEN** an order with date "2024-10-15" renders
- **THEN** the date cell displays "Oct 15, 2024" using `Intl.DateTimeFormat("en-US")`

#### Scenario: Type column i18n translation
- **WHEN** an order with type "health_medicine" renders
- **THEN** the type cell displays the translated label (e.g., "Health & Medicine" in English)

#### Scenario: Status column badge display
- **WHEN** an order with any status renders
- **THEN** the status cell displays an OrderStatusBadge component with the order's status

### Requirement: Order status badge with color coding
The OrderStatusBadge component SHALL display a color-coded badge for each status: completed (green: `#00b69b`), processing (purple: `#6226ef`), on_hold (orange: `#ffa756`), rejected (red: `#ef3826`). Each badge SHALL show the translated status text.

#### Scenario: Completed status badge
- **WHEN** an order has status "completed"
- **THEN** a badge displays with green text (`#00b69b`) on a green-tinted background with translated text "Completed"

#### Scenario: Rejected status badge
- **WHEN** an order has status "rejected"
- **THEN** a badge displays with red text (`#ef3826`) on a red-tinted background with translated text "Rejected"

### Requirement: Pagination with 9 items per page
The Orders page SHALL paginate the filtered order list at 9 items per page using react-paginate via TableCommon's built-in pagination. Pagination SHALL display 5 page numbers with 2 margin pages.

#### Scenario: Orders exceed page size
- **WHEN** there are 27 filtered orders
- **THEN** pagination displays 3 pages (ceil(27/9)) with 9 orders on the first two pages and 9 on the last

#### Scenario: Page navigation
- **WHEN** a user clicks page 2
- **THEN** orders 10-18 are displayed

### Requirement: Pagination resets on filter change
The current page SHALL reset to page 0 whenever any filter criteria changes or the reset button is clicked.

#### Scenario: Filter applied resets pagination
- **WHEN** a user is on page 3 and applies a date filter
- **THEN** the page resets to page 1 (index 0) showing the first 9 filtered results

### Requirement: Page header with icon
The Orders page SHALL display a page header with a ClipboardList icon (lucide-react) in a warning-colored rounded container and the translated title "Order Lists" (`orderList` key).

#### Scenario: Page header renders
- **WHEN** the Orders page loads
- **THEN** a header displays with a ClipboardList icon and the translated "Order Lists" title
