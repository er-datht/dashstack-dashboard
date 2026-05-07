## RENAMED Requirements

- FROM: `### Requirement: Action stubs`
- TO: `### Requirement: Action buttons are functional`

## MODIFIED Requirements

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

## ADDED Requirements

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
