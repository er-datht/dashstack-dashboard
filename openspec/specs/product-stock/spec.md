# product-stock Specification

## Purpose
Defines the ProductStock page: search filter, table columns, ColorDots rendering, pagination, functional Edit/Delete action buttons (with confirmation modal, optimistic delete, success toast, page-clamp on last-row deletion, and localStorage persistence), and consumption of the shared `useProductStock` hook.

## Requirements

### Requirement: Product stock table with search
The ProductStock page SHALL display a data table of product stock items with a search input that filters products by name.

#### Scenario: Search filtering
- **WHEN** a user types "shirt" in the search input
- **THEN** only products with "shirt" in their name are displayed

### Requirement: Product stock columns
The ProductStock table SHALL display columns for: product Image, Name, Category, Price, Amount (stock count), and Available Colors.

#### Scenario: Column rendering
- **WHEN** the ProductStock page renders
- **THEN** all 6 columns are visible with appropriate data

### Requirement: ColorDots component
The Available Colors column SHALL use a ColorDots component that displays up to 4 color circles, with a "+N" count indicator if there are more.

#### Scenario: More than 4 colors
- **WHEN** a product has 6 available colors
- **THEN** 4 color dots are displayed plus a "+2" indicator

### Requirement: Product stock pagination
The ProductStock page SHALL paginate results with 10 items per page.

#### Scenario: Pagination controls
- **WHEN** there are more than 10 product stock items
- **THEN** pagination controls appear allowing navigation between pages

### Requirement: Action buttons are functional
The ProductStock page SHALL display Edit and Delete action buttons for each row. The Edit button SHALL navigate the user to `/products/:id/edit` for the row's product id. The Delete button SHALL open a confirmation modal; on confirm, the row SHALL be removed via an optimistic delete using the `useProductStock` hook, a success toast using `t("deleteSuccess")` SHALL appear, and the change SHALL be persisted via the service's localStorage write-through.

#### Scenario: Edit button navigates to edit route
- **WHEN** the user clicks the Edit button on the row whose product id is `"3"`
- **THEN** the user is navigated to `/products/3/edit`

#### Scenario: Delete button opens confirmation modal
- **WHEN** the user clicks the Delete button on a row
- **THEN** a confirmation modal appears with the title from `t("confirmDeleteTitle")` and the message from `t("deleteConfirm")`

#### Scenario: Confirm deletion removes the row optimistically
- **WHEN** the confirmation modal is open and the user clicks the confirm button
- **THEN** the row is removed from the table immediately, a success toast with the text from `t("deleteSuccess")` appears, and the change is written through to localStorage

#### Scenario: Cancel deletion keeps the row
- **WHEN** the confirmation modal is open and the user clicks the cancel button or presses Escape
- **THEN** the modal closes and the row remains in the table

#### Scenario: Failed deletion rolls back
- **WHEN** the user confirms deletion and the underlying mutation rejects
- **THEN** the row reappears in the table and an error toast is displayed

### Requirement: Page index clamps after deleting the last row on a page
When a delete leaves the current page with no rows AND another page with rows still exists, the ProductStock page SHALL drop the current page index to the last non-empty page so the user is not left looking at an empty page.

#### Scenario: Last row on last page deleted
- **WHEN** the user is on page 2 of 2, that page contains exactly one row, and the user confirms its deletion
- **THEN** the page index drops to page 1 and the table renders that page's rows

#### Scenario: Delete on a non-empty page does not change the page index
- **WHEN** the user is on a page with multiple rows and deletes one of them
- **THEN** the page index does not change and the remaining rows on that page stay visible

### Requirement: ProductStock page consumes the `useProductStock` hook
The ProductStock page SHALL read its data and trigger mutations exclusively through the `useProductStock` hook (`src/hooks/useProductStock.ts`). The hook SHALL own the React Query key and the optimistic mutation logic so the listing page and the edit page share one source of truth.

#### Scenario: Page reads via the hook
- **WHEN** the ProductStock page renders
- **THEN** it obtains its product data from the `useProductStock()` hook and not from a direct `useQuery({ queryKey: ["productStock"] })` call

#### Scenario: Page deletes via the hook
- **WHEN** the user confirms a delete
- **THEN** the page invokes `deleteProduct(id)` from the hook (not a service call directly) so the hook's optimistic update and rollback apply

### Requirement: Row click navigates to product detail

Each row in the ProductStock table SHALL navigate the user to the ProductDetail page at `/products/:id` (where `:id` is the row product's id) when the user activates the row. Activation SHALL be supported via mouse click on the row body AND via keyboard (Enter or Space) when the row is focused. Activation triggered by clicking the per-row Edit or Delete action buttons SHALL NOT navigate to the detail page; those buttons retain their existing behavior (Edit navigates to `/products/:id/edit`, Delete opens the confirmation modal) because both buttons call `e.stopPropagation()` on click. Navigation SHALL be performed via `useNavigate()` from `react-router-dom` (the row is NOT wrapped in an anchor element). No visible focus ring SHALL be added by this change.

#### Scenario: Mouse click on a row navigates to product detail

- **WHEN** the user clicks anywhere on a row body that is not the Edit or Delete button
- **THEN** the user is navigated to `/products/{row.id}` (e.g., the row whose product id is `"3"` navigates to `/products/3`)

#### Scenario: Enter key on a focused row navigates to product detail

- **WHEN** a row is focused (via Tab) and the user presses Enter
- **THEN** the user is navigated to `/products/{row.id}`

#### Scenario: Space key on a focused row navigates to product detail without scrolling

- **WHEN** a row is focused (via Tab) and the user presses Space
- **THEN** the user is navigated to `/products/{row.id}` AND the default browser scroll behavior is prevented (the page does not scroll down by one viewport)

#### Scenario: Edit button click does NOT navigate to product detail

- **WHEN** the user clicks the Edit button on a row whose product id is `"3"`
- **THEN** the user is navigated to `/products/3/edit` and is NOT navigated to `/products/3`

#### Scenario: Delete button click does NOT navigate to product detail

- **WHEN** the user clicks the Delete button on a row
- **THEN** the delete confirmation modal opens and the user is NOT navigated to `/products/{row.id}`

#### Scenario: Other keys on a focused row do nothing

- **WHEN** a row is focused and the user presses any key other than Enter or Space (e.g., Tab, Escape, ArrowDown, the letter `a`)
- **THEN** no navigation occurs and the default browser behavior for that key (e.g., Tab moves focus) is preserved
