# product-stock-edit Specification

## Purpose
Defines the EditProduct page at `/products/:id/edit` that allows users to edit a ProductStock entry: form rendering, drag-drop image upload, the availableColors editor, save/cancel flows, validation, the not-found state, and accessibility requirements.

## Requirements

### Requirement: EditProduct page renders ProductStock edit form

The EditProduct page at route `/products/:id/edit` SHALL render an editable form for the ProductStock entry whose `id` matches the URL parameter. The form SHALL initialize from the matching entry's current values for image, name, category, price, amount, and availableColors.

#### Scenario: Page renders form pre-populated from ProductStock data
- **WHEN** the user navigates to `/products/1/edit` and the ProductStock entry with id `"1"` exists
- **THEN** the page renders a form whose image, name, category, price, amount, and color fields show the values of that ProductStock entry

#### Scenario: Page heading uses the editProductStock i18n key
- **WHEN** the EditProduct page renders
- **THEN** the page heading displays the text from `t("editProductStock", { ns: "products" })`

### Requirement: EditProduct supports drag-drop image upload

The EditProduct page SHALL provide a drop zone for the image field that accepts an image file via drag-and-drop OR via a click-to-select fallback. On a successful drop or selection, the file SHALL be read via `FileReader.readAsDataURL` and the resulting data URL SHALL replace the form's current image value, with the preview updating immediately.

#### Scenario: User drops an image file
- **WHEN** the user drags an image file over the drop zone and releases it
- **THEN** the form's image preview updates to show the dropped image and the form state holds the corresponding data URL

#### Scenario: User clicks to select an image
- **WHEN** the user clicks the drop zone and selects an image file from the file picker
- **THEN** the form's image preview updates and the form state holds the data URL

#### Scenario: Drop zone shows localized hint text
- **WHEN** the drop zone renders without a current image
- **THEN** it displays the text from `t("dropImageHere")` and `t("dragOrClick")`

### Requirement: EditProduct supports an availableColors editor

The EditProduct page SHALL render a list of color rows where each row has a name input (`t("colorName")`) and a hex color picker (`t("colorHex")`). The user SHALL be able to add a new empty color row via an "Add color" button and remove any existing row via a per-row remove button. The form SHALL require at least one color before submission.

#### Scenario: User adds a color row
- **WHEN** the user clicks the button labeled `t("addColor")`
- **THEN** a new color row appears at the end of the list with empty name and a default hex value

#### Scenario: User removes a color row
- **WHEN** the user clicks the remove button on a color row
- **THEN** that row is removed from the form state

#### Scenario: User submits with zero colors
- **WHEN** the user removes every color row and clicks Save
- **THEN** submission is blocked and the colors editor surfaces a validation message

### Requirement: EditProduct save submits an optimistic update

When the user clicks the Save button, the page SHALL invoke the `updateProduct(id, patch)` mutation from `useProductStock` with the current form state. On a successful mutation the page SHALL display a success toast using `t("updateSuccess")` and navigate the user back to `/product-stock`. On a failed mutation the page SHALL display an error toast and remain on the edit page; the underlying cache rollback is the hook's responsibility.

#### Scenario: Save with valid form
- **WHEN** the user clicks Save and form validation passes
- **THEN** `updateProduct` is invoked with the form state, a success toast appears with the text from `t("updateSuccess")`, and the user is navigated to `/product-stock`

#### Scenario: Save while mutation pending
- **WHEN** the user clicks Save and the previous Save has not resolved
- **THEN** the Save button is disabled or the click is ignored so no duplicate mutation fires

### Requirement: EditProduct cancel discards changes

The EditProduct page SHALL provide a Cancel control that navigates back to `/product-stock` without invoking any mutation. Form state changes SHALL NOT be persisted when Cancel is used.

#### Scenario: Cancel navigates back without saving
- **WHEN** the user changes the name field and clicks Cancel
- **THEN** the user is navigated to `/product-stock` and the underlying ProductStock entry's name is unchanged

### Requirement: EditProduct enforces minimum form validation

Before invoking `updateProduct`, the EditProduct page SHALL block submission when any of the following are true: name is empty, price is negative, amount is negative or non-integer, the colors list is empty, or the image data URL is empty. Each invalid field SHALL surface an inline message near the field.

#### Scenario: Name is empty
- **WHEN** the user clears the name field and clicks Save
- **THEN** submission is blocked and an inline message appears next to the name field

#### Scenario: Price is negative
- **WHEN** the user sets price to `-5` and clicks Save
- **THEN** submission is blocked and an inline message appears next to the price field

#### Scenario: Amount is non-integer
- **WHEN** the user sets amount to `2.5` and clicks Save
- **THEN** submission is blocked and an inline message appears next to the amount field

### Requirement: EditProduct renders a not-found state for unknown ids

When the URL parameter `:id` does not match any ProductStock entry (after the data has loaded), the EditProduct page SHALL render a not-found state instead of the form. The state SHALL display the text from `t("notFound")` and provide a control to navigate back to `/product-stock`.

#### Scenario: ID not in stock data
- **WHEN** the user navigates to `/products/9999/edit` and no ProductStock entry has id `"9999"`
- **THEN** the page renders the not-found state and shows the text from `t("notFound")`

### Requirement: EditProduct form is fully accessible

Every input SHALL have an associated label, the drop zone SHALL have a programmatic name describing its purpose, color rows SHALL have aria-labels that distinguish them ("Color 1", "Color 2", …), and validation messages SHALL be associated with their fields via `aria-describedby`. The Save and Cancel buttons SHALL be reachable by keyboard.

#### Scenario: All inputs have labels
- **WHEN** the EditProduct page renders
- **THEN** every form input is associated with a `<label>` element either by `htmlFor` or by being a child of the label
