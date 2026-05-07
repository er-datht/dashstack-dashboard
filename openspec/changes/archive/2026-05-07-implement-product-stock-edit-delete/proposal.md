## Why

The Product Stock page (`src/pages/ProductStock/index.tsx`) ships with pencil and trash action buttons that are currently TODO stubs (`console.log` only). This is the only listing page in the dashboard whose row actions are non-functional, so users can browse stock but cannot adjust quantities, correct typos, swap images, or remove entries. We're closing that gap.

We pick this work now because:
- Users have explicitly asked for the actions to be wired up
- All required primitives already exist in the codebase (a battle-tested confirmation modal in Calendar, the Settings drag-drop image-upload pattern, the `useTodos` optimistic-mutation pattern, and Wishlist's localStorage persistence pattern), so the change is largely composition rather than invention
- Promoting the Calendar's `ConfirmModal` to a shared component pays a small refactor cost now that gets cheaper than after a third caller appears

## What Changes

- Wire up Edit on each ProductStock row to navigate to the existing `/products/:id/edit` route
- Build out the placeholder `EditProduct` page (`src/pages/EditProduct/index.tsx`) into a real form that operates on **ProductStock** data (the placeholder previously implied the unrelated `products` domain)
  - Editable fields: image (drag-drop upload), name, category, price, amount, available colors (full add/remove row editor with name + hex inputs)
  - Save → optimistic update + success toast + navigate back; Cancel → navigate back without saving
  - Not-found state when `:id` does not resolve to a ProductStock entry
- Wire up Delete on each ProductStock row to open a confirmation modal; on confirm, optimistically remove the row, show a success toast, and clamp the current page index down to the last non-empty page if the just-deleted row was the only item on its page
- **Promote** the Calendar's `ConfirmModal` from `src/pages/Calendar/ConfirmModal.tsx` to a shared `src/components/ConfirmModal/`, and update Calendar to import from the shared location (no behavior change to calendar)
- Add a `useProductStock` domain hook (`src/hooks/useProductStock.ts`) modeled on `useTodos` — read + delete + update mutations with optimistic `onMutate` and `onError` rollback
- Extend `productStockService` with `updateProduct(id, patch)` (the matching `deleteProduct` already exists)
- Persist ProductStock mutations to `localStorage` (Wishlist precedent) so deletes/edits survive a hard reload — load from localStorage on first read, write through on every mutation
- Add new `products` namespace i18n keys in EN and JP (`confirmDeleteTitle`, `deleteSuccess`, `updateSuccess`, `saveChanges`, `discardChanges`, `dropImageHere`, `dragOrClick`, `colorName`, `colorHex`, `addColor`, `removeColor`, `editProductStock`, `notFound`)
- Toast UI uses the local `useState<string | null>(null)` + `setTimeout` auto-dismiss pattern already used by Settings/Inbox/Team — no new global provider

## Capabilities

### New Capabilities
- `product-stock-edit`: The EditProduct page operating on ProductStock data — drag-drop image upload, full field editing including a colors editor, save/cancel behavior, and the not-found state. Distinct from `product-stock` (the listing page) and from `product-listing` (the unrelated products domain).
- `product-stock-persistence`: localStorage write-through for ProductStock data so deletes and edits survive page reloads — load-on-first-read, write-on-every-mutation, matches the Wishlist pattern.

### Modified Capabilities
- `product-stock`: Action buttons stop being stubs. Edit navigates to `/products/:id/edit`. Delete opens a confirmation modal, performs optimistic delete via `useProductStock`, shows a success toast, and clamps the current page index when its last row is removed.
- `confirm-modal`: Component moves from `src/pages/Calendar/ConfirmModal.tsx` to a shared `src/components/ConfirmModal/`. Behavior, props, ARIA, and theming are unchanged. Calendar consumers import from the new path.

## Impact

**Code:**
- `src/pages/ProductStock/index.tsx` — wire Edit (navigation), wire Delete (modal + mutation), add toast UI, page-clamp logic
- `src/pages/EditProduct/index.tsx` — full rewrite: placeholder → real form with drag-drop image, color editor, save/cancel, 404
- `src/pages/Calendar/index.tsx` and `src/pages/Calendar/AddEventModal.tsx` — update imports of `ConfirmModal` to the shared path; delete `src/pages/Calendar/ConfirmModal.tsx` and `src/pages/Calendar/ConfirmModal.module.scss`
- `src/components/ConfirmModal/index.tsx` and `src/components/ConfirmModal/ConfirmModal.module.scss` — new (moved files)
- `src/hooks/useProductStock.ts` — new hook
- `src/services/productStock.ts` — add `updateProduct`, add localStorage hydration + write-through
- `public/locales/en/products.json` and `public/locales/jp/products.json` — new keys

**Tests:**
- `src/components/ConfirmModal/__tests__/ConfirmModal.test.tsx` — moved or recreated with the same coverage Calendar previously had
- `src/pages/ProductStock/__tests__/ProductStock.test.tsx` — delete flow, page-clamp behavior, toast appearance
- `src/pages/EditProduct/__tests__/EditProduct.test.tsx` — load by id, drag-drop image, color row add/remove, save mutation + toast + navigate, cancel navigates without saving, 404 state
- `src/hooks/__tests__/useProductStock.test.ts` — optimistic delete + rollback, optimistic update + rollback, localStorage write-through

**Dependencies:** none added. Drag-drop uses HTML5 File API (Settings precedent). Persistence uses `localStorage` (Wishlist precedent). All other libs (react-router, react-query, classnames, lucide-react, react-i18next) are already installed.

**Risk / blast radius:**
- ConfirmModal promotion changes import paths in Calendar files — covered by existing calendar tests
- localStorage hydration introduces a new persistence layer for ProductStock; if the stored shape ever drifts from the in-memory mock, the page must fall back to the seed data (handled by a try/catch + version key)
- No backend or shared state is touched; this is a UI + client-state-only change
