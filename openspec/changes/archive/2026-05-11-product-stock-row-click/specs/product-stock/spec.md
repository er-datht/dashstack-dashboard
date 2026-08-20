## ADDED Requirements

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
