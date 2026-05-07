## 1. Promote ConfirmModal to shared component

- [x] 1.1 Create directory `src/components/ConfirmModal/`
- [x] 1.2 Move the implementation from `src/pages/Calendar/ConfirmModal.tsx` to `src/components/ConfirmModal/index.tsx` (verbatim, only change the import path for `cn`)
- [x] 1.3 Extract `.confirmOverlay` and `.confirmCard` rules from `src/pages/Calendar/Calendar.module.scss` into a new `src/components/ConfirmModal/ConfirmModal.module.scss`; update `index.tsx` to import from the new SCSS module
- [x] 1.4 Update `src/pages/Calendar/index.tsx` import of `ConfirmModal` to point at `../../components/ConfirmModal`
- [x] 1.5 Update `src/pages/Calendar/AddEventModal.tsx` import of `ConfirmModal` to point at `../../components/ConfirmModal`
- [x] 1.6 Delete `src/pages/Calendar/ConfirmModal.tsx`
- [x] 1.7 Remove the `.confirmOverlay` and `.confirmCard` rules from `src/pages/Calendar/Calendar.module.scss`
- [x] 1.8 Run `yarn test src/pages/Calendar` and confirm all calendar tests still pass

## 2. Extend productStockService with update + localStorage write-through

- [x] 2.1 Add a `STORAGE_KEY = "dashstack-product-stock"` and `SCHEMA_VERSION = 1` constants at the top of `src/services/productStock.ts`
- [x] 2.2 Add a private helper `loadFromStorage()` that returns the stored array or `null` (handles missing key, JSON parse errors, version mismatch — falls through to `null` in any failure)
- [x] 2.3 Add a private helper `writeToStorage(data: ProductStock[])` that serializes `{ version: SCHEMA_VERSION, data }` and writes to localStorage
- [x] 2.4 Modify `getProductStock()` to: hydrate from `loadFromStorage()` on first call (lazy init module state), fall back to seed and persist seed via `writeToStorage(seed)` on miss
- [x] 2.5 Modify `deleteProduct(id)` to call `writeToStorage(currentArray)` after the splice
- [x] 2.6 Add `updateProduct(id: string, patch: Partial<ProductStock>): Promise<ProductStock>` — find by id (reject if not found), merge patch shallowly (note: `availableColors` is replaced, not merged), call `writeToStorage`, return the merged entry
- [x] 2.7 Update `productStockService` exported object to include `updateProduct`

## 3. Author `useProductStock` hook

- [x] 3.1 Create `src/hooks/useProductStock.ts`
- [x] 3.2 Define query key constant `PRODUCT_STOCK_QUERY_KEY = ["productStock"] as const`
- [x] 3.3 Implement `useProductStock()` returning `{ products, isLoading, error, deleteProduct, updateProduct, refetch, isDeletingProduct, isUpdatingProduct }`
- [x] 3.4 Wire `useQuery` against `productStockService.getProductStock`
- [x] 3.5 Wire `useMutation` for delete with `onMutate` (cancel queries → snapshot → optimistic filter), `mutationFn` calling `productStockService.deleteProduct`, `onError` rollback from snapshot
- [x] 3.6 Wire `useMutation` for update with `onMutate` (cancel → snapshot → optimistic merge), `mutationFn` calling `productStockService.updateProduct`, `onSuccess` (replace optimistic entry with returned merged record), `onError` rollback

## 4. Wire Delete on ProductStock listing

- [x] 4.1 Replace direct `useQuery` call in `src/pages/ProductStock/index.tsx` with `useProductStock()`
- [x] 4.2 Add local state: `confirmDeleteId: string | null` and `toast: string | null`
- [x] 4.3 Replace `handleDelete` stub: setting `confirmDeleteId` opens the modal
- [x] 4.4 Render `<ConfirmModal>` (imported from `src/components/ConfirmModal`) with `isOpen={confirmDeleteId !== null}`, title `t("confirmDeleteTitle")`, message `t("deleteConfirm")`, confirm/cancel labels from `products` namespace
- [x] 4.5 In the confirm handler: call `deleteProduct(confirmDeleteId)`, on success show toast `t("deleteSuccess")` and clear `confirmDeleteId`, on error show error toast
- [x] 4.6 Add a `useEffect` that watches `paginatedProducts.length` and `pageCount` to clamp `currentPage` to the last non-empty page index when needed
- [x] 4.7 Render the local toast: `fixed bottom-6 right-6` div with `aria-live="polite"`; auto-dismiss via `setTimeout` 3000ms

## 5. Wire Edit on ProductStock listing

- [x] 5.1 Replace `handleEdit` stub: import `useNavigate` from `react-router-dom` (note: tasks.md originally said `react-router` but the codebase and the test mock use `react-router-dom`), call `navigate(\`/products/${productId}/edit\`)`
- [x] 5.2 Verify ARIA labels on the pencil button still read sensibly (no copy change)

## 6. Build out EditProduct page

- [x] 6.1 Replace `src/pages/EditProduct/index.tsx` placeholder with a real form
- [x] 6.2 Read `:id` via `useParams`, read products via `useProductStock`, look up the entry by id; render not-found state when missing (uses `t("notFound", { ns: "products" })` and a button back to `/product-stock`)
- [x] 6.3 Initialize form state from the looked-up entry (image, name, category, price, amount, availableColors)
- [x] 6.4 Build the drag-drop image drop zone (Settings pattern — `onDragOver` preventDefault, `onDrop` reads first file via `FileReader.readAsDataURL`, plus a hidden `<input type="file" accept="image/*">` triggered by clicking the zone)
- [x] 6.5 Render labelled inputs for name (text), category (text), price (number, min 0), amount (number, min 0, step 1)
- [x] 6.6 Build the colors editor: list of rows, each row has a text input (color name), an `<input type="color">` for hex, and a remove button; "+ Add color" button appends an empty row
- [x] 6.7 Implement local validation (name required, price ≥ 0, amount ≥ 0 integer, ≥ 1 color, image present); render inline messages tied to fields via `aria-describedby`
- [x] 6.8 Save button calls `updateProduct(id, formState)`; on success show toast (`t("updateSuccess")`) then `navigate("/product-stock")`; on error show error toast and stay
- [x] 6.9 Cancel button calls `navigate(-1)` or `navigate("/product-stock")` (no save)
- [x] 6.10 Render the toast (same pattern as ProductStock listing)
- [x] 6.11 Page heading uses `t("editProductStock", { ns: "products" })`

## 7. i18n keys (EN + JP)

- [x] 7.1 Add the 13 new keys to `public/locales/en/products.json`: `confirmDeleteTitle`, `deleteSuccess`, `updateSuccess`, `saveChanges`, `discardChanges`, `dropImageHere`, `dragOrClick`, `colorName`, `colorHex`, `addColor`, `removeColor`, `editProductStock`, `notFound`
- [x] 7.2 Add the 13 corresponding keys to `public/locales/jp/products.json` with translated values (use the values listed in `design.md` D8)
- [x] 7.3 Verify no namespace collisions; ensure keys reused (`editProduct`, `delete`, `productName`, etc.) are still present

## 8. Tests (these were authored by the unit-test-writer in step 5 of the workflow; this group exists to wire them up)

- [x] 8.1 `src/components/ConfirmModal/__tests__/ConfirmModal.test.tsx` — cover open/close, Escape, Cancel, Confirm callback fires, Tab focus trap (mirror the calendar's prior coverage) — all 9 tests pass
- [x] 8.2 `src/hooks/__tests__/useProductStock.test.ts` — optimistic delete + rollback on error, optimistic update + rollback on error, persisted via localStorage write-through (mock `localStorage`) — all 6 tests pass
- [x] 8.3 `src/pages/ProductStock/__tests__/ProductStock.test.tsx` — all 6 tests pass after the page-clamp test query was relaxed from `getByRole("link", { name: "2" })` to `getByRole("button", { name: "Page 2" })` to match how `react-paginate` actually renders page links (as `<a role="button" aria-label="Page N">`).
- [x] 8.4 `src/pages/EditProduct/__tests__/EditProduct.test.tsx` — loads form by id, drag-drop sets preview, color row add/remove updates state, Save triggers `updateProduct` + toast + navigate, Cancel navigates without saving, unknown id renders not-found, validation blocks empty-name save — all 10 tests pass

## 9. Verification

- [x] 9.1 Run `yarn lint` — no NEW errors or warnings introduced (6 pre-existing problems remain in unrelated files: ThemeContext, WishlistContext, CalendarGrid, EventDetailPopover; one pre-existing warning in `src/hooks/__tests__/useProductStock.test.ts` from the test author's stale `eslint-disable` directive that I cannot modify per the no-touch-tests directive)
- [x] 9.2 Run `yarn build` — clean (TypeScript + Vite)
- [x] 9.3 Run `yarn test` — 545/545 tests pass (538 from initial implementation + 7 from the productStock service tests added during verification).
- [x] 9.4 Manual smoke test in browser — NOT performed by automation. Please verify in browser for each of light/dark/forest themes: list page renders, delete opens modal, cancel keeps row, confirm removes row + toasts, reload preserves the deletion; Edit opens edit page, drag-drop image works, colors editor adds/removes, Save persists across reload, Cancel discards.
- [x] 9.5 Run `npx openspec validate implement-product-stock-edit-delete` — change passes validation (`Change 'implement-product-stock-edit-delete' is valid`)
