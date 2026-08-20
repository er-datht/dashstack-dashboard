## Why

The ProductStock listing page exposes per-row Edit and Delete actions but no way to view a product's full detail page from the listing. Users have to navigate to `/products/:id` directly or via the read-only Products listing card grid. Making the table row itself navigate to the product detail page is a small, conventional shortcut that matches the cardgrid's "tap card to view detail" affordance.

## What Changes

- ProductStock table rows navigate to `/products/:id` when clicked.
- ProductStock table rows are keyboard-activatable: when focused via Tab, pressing **Enter** OR **Space** triggers the same navigation. **Space** uses `preventDefault()` so the page does not scroll.
- The Edit and Delete action buttons inside each row remain functional and do NOT trigger row navigation (they already call `e.stopPropagation()` — no change needed).
- The shared `TableCommon` component is extended to attach `tabIndex={0}` and an `onKeyDown` handler **only when `onRowClick` is provided**. Tables without `onRowClick` (Orders, DealDetailsTable, Table gallery variants) get zero behavior change and zero DOM change.
- Rows remain semantic `<tr>` elements — NO `role="button"`, NO `role="grid"` / `role="row"` / `role="gridcell"` ARIA grid semantics.
- No visible focus ring is added (user-confirmed: the existing browser-default focus outline is sufficient; no extra styling).
- No change to the existing `.clickable` hover styling.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `product-stock`: add a new requirement that the ProductStock table row click and keyboard activation both navigate to `/products/:id`, and that clicks on the Edit/Delete action buttons inside a row do NOT trigger row navigation.
- `shared-components`: extend the `TableCommon` requirements with keyboard-activation behavior — when `onRowClick` is provided, each row receives `tabIndex={0}` and an `onKeyDown` handler that fires the same callback on **Enter** and **Space** (with `preventDefault()` on Space); when `onRowClick` is absent, no `tabIndex` and no `onKeyDown` are attached and the rendered DOM is byte-identical to today.

## Impact

- **Code touched**:
  - `src/components/TableCommon/index.tsx` — add conditional `tabIndex` and `onKeyDown` to the row `<tr>` when `onRowClick` is provided.
  - `src/pages/ProductStock/index.tsx` — pass `onRowClick={(p) => navigate(`/products/${p.id}`)}` to `TableCommon`.
  - `src/components/TableCommon/__tests__/TableCommon.modifiers.test.tsx` (or a new sibling test) — add tests for the keyboard-activation behavior and the no-op-when-absent guarantee.
  - `src/pages/ProductStock/__tests__/ProductStock.test.tsx` — add tests for row click → navigate, Enter → navigate, Space → navigate + `preventDefault`, and that clicking Edit/Delete does NOT navigate to `/products/:id`.
- **No dependencies added.** No new packages, no external code.
- **No i18n keys added.** Behavior change only — no new user-facing strings.
- **No route changes.** `/products/:id` is already registered.
- **No CSS / SCSS changes.** The existing `.clickable` class remains untouched.
- **Other `TableCommon` consumers** (`Orders`, `DealDetailsTable`, the four `Table` gallery section variants) are unaffected — they do not pass `onRowClick`, so neither `tabIndex` nor `onKeyDown` attaches.
