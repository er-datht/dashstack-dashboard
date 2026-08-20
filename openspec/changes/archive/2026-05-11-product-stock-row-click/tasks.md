## 1. Extend TableCommon with keyboard activation

- [x] 1.1 In `src/components/TableCommon/index.tsx`, compute `const clickable = !!onRowClick;` once per render inside the data-row branch.
- [x] 1.2 On the row `<tr>`, conditionally spread `tabIndex={0}` only when `clickable` is true (use `{...(clickable ? { tabIndex: 0 } : {})}` or equivalent so absent-prop case emits zero attribute).
- [x] 1.3 On the row `<tr>`, attach `onKeyDown` only when `clickable` is true. The handler matches `event.key === "Enter" || event.key === " "`; on Space, call `event.preventDefault()` BEFORE invoking `onRowClick(item)`; on Enter, do NOT call `preventDefault()`.
- [x] 1.4 Keep the existing `onClick={() => onRowClick?.(item)}` exactly as-is. Do NOT change the `.clickable` SCSS class wiring.
- [x] 1.5 Do NOT add any `role` attribute to the `<tr>`.

## 2. Wire onRowClick on the ProductStock page

- [x] 2.1 In `src/pages/ProductStock/index.tsx`, add a `handleRowClick = (product: ProductStock) => navigate(`/products/${product.id}`);` callback near the existing `handleEdit` / `handleDelete` handlers.
- [x] 2.2 Pass `onRowClick={handleRowClick}` to the `<TableCommon>` JSX block.
- [x] 2.3 Verify (no code change needed) that both action buttons in the actions column already call `e.stopPropagation()` — they do at lines ~170–172 (Edit) and ~181–183 (Delete). If a future Lint/Prettier pass has reordered the file, re-confirm the calls are present.

## 3. Write unit tests for TableCommon keyboard behavior

- [x] 3.1 In a new test file `src/components/TableCommon/__tests__/TableCommon.keyboard.test.tsx`, render `TableCommon` with a simple two-column setup and an `onRowClick` mock.
- [x] 3.2 Assert that each row has `tabIndex="0"` when `onRowClick` is provided.
- [x] 3.3 Assert that pressing Enter on a focused row invokes `onRowClick` exactly once with the correct item and does NOT call `preventDefault()` (verify by listening for the default behavior — or by spying on the event object via `fireEvent.keyDown(row, { key: "Enter" })` and checking the mock was called once).
- [x] 3.4 Assert that pressing Space on a focused row invokes `onRowClick` exactly once with the correct item AND `event.preventDefault()` was called (use `fireEvent.keyDown` returning a fired-event object, or stub `preventDefault` on a `createEvent` event).
- [x] 3.5 Assert that pressing Tab, Escape, ArrowDown, and the letter `a` on a focused row does NOT invoke `onRowClick`.
- [x] 3.6 Render `TableCommon` WITHOUT `onRowClick`; assert each row has NO `tabIndex` attribute and that pressing Enter and Space on the row triggers no callback.
- [x] 3.7 Assert the row element is a `<tr>` with no `role` attribute.

## 4. Write unit tests for ProductStock row-click navigation

- [x] 4.1 In `src/pages/ProductStock/__tests__/ProductStock.test.tsx`, add a new `describe` block titled "row click navigation".
- [x] 4.2 Test: clicking a row body (e.g., on the product-name cell) calls `mockNavigate` with `/products/{id}` exactly once.
- [x] 4.3 Test: pressing Enter on a focused row calls `mockNavigate` with `/products/{id}`.
- [x] 4.4 Test: pressing Space on a focused row calls `mockNavigate` with `/products/{id}`.
- [x] 4.5 Test: clicking the Edit button on a row calls `mockNavigate` with `/products/{id}/edit` and is NOT also called with `/products/{id}` (use `mockNavigate.mock.calls` to assert exactly one call with the edit path).
- [x] 4.6 Test: clicking the Delete button on a row opens the confirmation modal AND `mockNavigate` is NOT called.

## 5. Run the full verification

- [x] 5.1 Run `yarn lint` and resolve any new warnings introduced by the change.
- [x] 5.2 Run `yarn test` and confirm all new tests pass alongside the existing suite.
- [x] 5.3 Run `yarn build` and confirm the TypeScript compile and Vite build succeed.
- [x] 5.4 Manual check in `yarn dev`: navigate to `/product-stock`, click a row body → land on `/products/:id`; Tab into a row, press Enter → land on `/products/:id`; press Space → land on `/products/:id` and page does not scroll; click Edit → land on `/products/:id/edit`; click Delete → confirmation modal opens. **Note:** Navigation works correctly. The manual check ALSO exposed a pre-existing bug in `ProductDetail`'s not-found rendering: `/products/7` (an ID in ProductStock but not in Products mock data) renders the React Query error branch instead of the spec-defined "Product not found" empty state. This bug is unrelated to row-click navigation (it predates this change) and is being fixed in a separate change `fix-product-detail-not-found-rendering` per the project's "Update vs. New Change" guidance.

## 6. Pre-archive checklist

- [x] 6.1 Run `npx openspec validate product-stock-row-click --strict` and resolve any validation errors.
- [x] 6.2 Confirm no other `TableCommon` consumer (`Orders`, `DealDetailsTable`, `Table` gallery section variants) renders any new `tabIndex` attribute by checking the existing tests still pass without modification. Note: `Table/components/StatesAndInteractionSection.tsx` was already passing `onRowClick` pre-change, so its rows gain `tabIndex={0}` + keyboard activation as an intended additive effect — `yarn test` confirms all 632 existing tests still pass.
