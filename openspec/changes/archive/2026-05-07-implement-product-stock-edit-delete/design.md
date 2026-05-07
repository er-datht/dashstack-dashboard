## Context

The Product Stock page (`src/pages/ProductStock/index.tsx`) renders a table of stock items with pencil + trash buttons in the Action column. Both `handleEdit` (line 72) and `handleDelete` (line 77) currently `console.log` and return — they are explicit TODOs and the existing spec (`openspec/specs/product-stock/spec.md`) documents them as "currently non-functional stubs."

The codebase already provides every primitive this change needs:

- **Confirmation modal** — `src/pages/Calendar/ConfirmModal.tsx` is a working themed `alertdialog` with focus trap, Escape, body-scroll lock, and danger-styled confirm button. It is currently page-local. Calendar is its only caller.
- **Drag-drop image upload** — `src/pages/Settings/index.tsx` has the established pattern: HTML5 File API → `FileReader.readAsDataURL` → store as data URL string. No library.
- **Optimistic React Query mutations** — `src/hooks/useTodos.ts` is the canonical pattern: `useMutation` + `onMutate` (cancel queries → snapshot → optimistic write) + `onError` (restore from snapshot).
- **localStorage persistence** — `src/contexts/WishlistContext.tsx` + `src/hooks/useLocalStorage.ts` show the project's write-through pattern.
- **Local toast** — Settings, Inbox, Team, Login, Invoice all use `useState<string | null>(null)` + `setTimeout` auto-dismiss + a `fixed`-positioned div. There is no global toast provider despite a `ToastNotification` type existing in `src/types/ui.ts`.
- **Edit route** — `/products/:id/edit` is already wired in `AppRoutes.tsx` to a placeholder `EditProduct` page that needs to be filled in.

The constraints are: no new dependencies; all 3 themes must work; new strings must be in EN + JP; tests follow co-located `__tests__/` convention.

## Goals / Non-Goals

**Goals:**
- Pencil button on a ProductStock row navigates to `/products/:id/edit`, which renders a real edit form for ProductStock data.
- Trash button on a ProductStock row opens a confirmation dialog, and on confirm the row is removed optimistically with a success toast.
- Edits and deletes survive a hard reload (localStorage write-through).
- The ConfirmModal becomes a shared, reusable component without changing its observable behavior in Calendar.
- All new mutation logic lives behind a single `useProductStock` hook so the page and the edit form share one mutation surface.

**Non-Goals:**
- Real backend persistence — `productStockService` stays mock-only; localStorage is the only durable store.
- Bulk select / bulk delete / bulk edit — single-row operations only.
- Image cropping, resizing, or upload to a real CDN — data URL only.
- Inline amount-only editor on the listing page — we picked the full edit page route.
- A global ToastProvider — out of scope; we keep the local-toast convention this codebase already uses.

## Decisions

### D1. Edit navigates to `/products/:id/edit` (not an inline modal)

The user picked option (a) in the requirements pass: navigate to the existing route. This keeps the ProductStock listing page focused on listing and gives Edit room for a drag-drop image, a colors editor, and validation without crowding the table.

**Trade-off:** the route name says "products" but the page operates on **ProductStock** data — a naming smell. We accept it because:
- Renaming the route to `/product-stock/:id/edit` is a bigger change that touches navigation expectations elsewhere.
- The "products" listing page is unrelated and read-only; it has no edit flow that would clash.
- A future change can rename the route once we decide whether `products` and `product-stock` should be unified.

**Alternatives considered:**
- *Inline modal on the listing page* — rejected: less room, and a colors editor inside a table modal becomes claustrophobic.
- *New route `/product-stock/:id/edit`* — rejected for now to avoid coupling this change to a routing-rename. Documented as a follow-up.

### D2. ConfirmModal is promoted to `src/components/ConfirmModal/`

Two callers (Calendar + ProductStock) is the threshold the team agreed on for promotion. Doing it now is a pure file move + import update; doing it later is the same move plus a third caller's worth of merge conflicts.

**Approach:**
1. Move `src/pages/Calendar/ConfirmModal.tsx` → `src/components/ConfirmModal/index.tsx`.
2. Migrate styles. The current component imports from `Calendar.module.scss` and uses `styles.confirmOverlay` / `styles.confirmCard` — those rules move to a new `src/components/ConfirmModal/ConfirmModal.module.scss`. Calendar's SCSS file drops them.
3. Update Calendar imports (`src/pages/Calendar/index.tsx`, `src/pages/Calendar/AddEventModal.tsx`) to point at the shared path.
4. Move calendar's existing ConfirmModal tests (if any) into the new location. If calendar's tests stay in `src/pages/Calendar/__tests__/` and exercise ConfirmModal indirectly, leave them there and add new direct tests under `src/components/ConfirmModal/__tests__/`.

**Public API:** unchanged — same `ConfirmModalProps`. The component is "dumb": it doesn't know about events, products, or any domain. Callers pass `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, `isOpen`.

**Alternative considered:** keep duplicating the component into ProductStock. Rejected — same cost, more drift risk.

### D3. New `useProductStock` hook owns all mutations

Modeled exactly on `useTodos`. The hook returns `{ products, isLoading, error, deleteProduct, updateProduct, refetch, isDeletingProduct, isUpdatingProduct }`. Both the listing page and the edit page consume this hook so the optimistic-update logic lives in one place.

**Why this over `useMutation` directly inside each page:**
- Matches `useTodos` / `useDeals` / `useProducts` convention — keeps the project consistent.
- Single source of truth for the React Query key (`["productStock"]`) — currently the page hard-codes that key, which is fragile.
- Testable in isolation (`renderHook` + `QueryClientProvider`).

**Mutation patterns:**

*Delete:*
- `onMutate`: cancel `["productStock"]` queries, snapshot current cache, optimistically filter out the deleted id.
- `mutationFn`: call `productStockService.deleteProduct(id)`, which (D4) also writes to localStorage.
- `onError`: restore from snapshot.
- `onSuccess`: no-op (cache is already correct).

*Update:*
- `onMutate`: cancel queries, snapshot, optimistically merge the patch.
- `mutationFn`: call `productStockService.updateProduct(id, patch)`, which (D4) writes through to localStorage.
- `onError`: restore from snapshot.
- `onSuccess`: replace the optimistic entry with the server response (the service returns the merged record).

### D4. Persistence: localStorage write-through inside `productStockService`

The service hydrates `mockProductStockData` from `localStorage["dashstack-product-stock"]` on first read; if the key is missing or parse fails, it falls back to the seed array and writes that seed through. Every mutation (`updateProduct`, `deleteProduct`) updates the in-memory array **and** writes the new array to localStorage in the same call.

**Why inside the service (not the hook):**
- Service is the single mutation surface that already exists; touching the hook for persistence would split responsibility.
- Tests of the service can stub `localStorage` directly without React Query in scope.
- Matches the spirit of how `WishlistContext` keeps persistence near the data, not in the consumer.

**Schema versioning:** Store as `{ version: 1, data: ProductStock[] }`. If a future change adds required fields, bump the version; on mismatch, reset to seed. This is cheap insurance against shape drift.

**Alternatives considered:**
- *Persist via a `useLocalStorage`-backed hook in the page* — rejected, splits state between hook and service.
- *No persistence (in-memory only)* — rejected, user explicitly asked for persistence ("reuse" the wishlist pattern).

### D5. EditProduct page reads stock data via `useProductStock`

The new page:
1. Reads `:id` from `useParams()`.
2. Calls `useProductStock()` to get `products`.
3. Looks up the matching product. If none, render the not-found state (`{t("notFound")}`-titled message + back button).
4. Initializes form state from the product (image, name, category, price, amount, availableColors).
5. Renders the form with:
   - **Drag-drop image upload** (Settings pattern) — drop zone with `onDragOver` / `onDrop`, fallback `<input type="file" accept="image/*">`, `FileReader.readAsDataURL` to set preview + form value.
   - **Text inputs** for name, category.
   - **Numeric inputs** for price (currency display) and amount (integer).
   - **Colors editor** — vertical list of color rows, each row = `<input type="text">` for color name + `<input type="color">` for hex (or `<input type="text">` validated as hex; we'll start with `type="color"` for simplicity) + a remove button. A "+ Add Color" button appends a new empty row.
6. Save button calls `updateProduct(id, formState)`. On success: show toast, navigate to `/product-stock`. On error: rollback already happened in the hook; show error toast and stay on page.
7. Cancel button navigates back without saving.

**Form validation (minimal):**
- Name required.
- Price ≥ 0.
- Amount ≥ 0 integer.
- At least one color.
- Image data URL non-empty (existing image counts).

If validation fails, prevent submission and surface inline messages near each invalid field. No new validation library — plain conditionals suffice for this scope.

### D6. Page-clamp on delete in the listing

If the user deletes the last item on the current page, the page index must drop. Current code in ProductStock has `currentPage` state and `pageCount` derived from `filteredProducts.length`. After delete:

```ts
const newPageCount = Math.ceil((filteredProducts.length - 1) / itemsPerPage);
if (currentPage >= newPageCount && newPageCount > 0) {
  setCurrentPage(newPageCount - 1);
}
```

Implemented as an effect that watches `paginatedProducts.length` rather than wired directly into the delete callback — more declarative and handles search-filter changes too.

### D7. Toast UI follows the local-component-state convention

`ProductStock` and `EditProduct` each get a local `useState<string | null>(null)` with a `setTimeout(() => setToast(null), 3000)` auto-dismiss. The toast itself is a `fixed bottom-6 right-6` div with `aria-live="polite"`. Two reasons:
- Consistent with Settings, Inbox, Team, Login, Invoice, UserMenu — every existing toast is local.
- Avoiding scope creep: introducing a global ToastProvider is its own change.

If the codebase ever centralizes toasts, a follow-up change can swap the local state for a `useToast()` hook without affecting these pages' callers.

### D8. i18n keys live in `products` namespace

New keys (EN + JP):
- `confirmDeleteTitle` — "Delete product?" / "商品を削除しますか？"
- `deleteSuccess` — "Product deleted." / "商品を削除しました。"
- `updateSuccess` — "Product updated." / "商品を更新しました。"
- `saveChanges` — "Save changes" / "変更を保存"
- `discardChanges` — "Cancel" (or reuse calendar's `cancel` if convenient — we'll add it under `products` to keep the namespace self-contained)
- `dropImageHere` — "Drop image here" / "画像をここにドロップ"
- `dragOrClick` — "or click to select" / "またはクリックして選択"
- `colorName` — "Color name" / "色の名前"
- `colorHex` — "Color" / "色"
- `addColor` — "Add color" / "色を追加"
- `removeColor` — "Remove color" / "色を削除"
- `editProductStock` — "Edit Product Stock" / "商品在庫の編集"
- `notFound` — "Product not found" / "商品が見つかりません"

Keys reused without change: `editProduct`, `deleteProduct`, `deleteConfirm`, `edit`, `delete`, `productName`, `category`, `price`, `amount`, `availableColor`, `image`, `searchByName`, `productStock`.

The Calendar's `modal.cancel` and `modal.delete` keys are domain-specific; we don't reuse them across namespaces. Each consumer of ConfirmModal passes its own labels.

## Risks / Trade-offs

[**ConfirmModal promotion breaks calendar imports**] → Mitigation: do the promotion as the first task; run calendar tests immediately after. Imports in `Calendar/index.tsx` and `Calendar/AddEventModal.tsx` are the only ones to update.

[**localStorage stale data masks bugs in development**] → Mitigation: schema versioning (D4). If we change the ProductStock shape later, bumping the version key resets stored data. Document in code comments.

[**Optimistic update flicker on slow mock service**] → Acceptable: mock has 300–500ms delay; optimistic + rollback gives instant feedback. The rollback path is unreachable with a mock that never fails, but the code path is still tested.

[**Edit page route says `/products/:id/edit` but renders ProductStock data**] → Mitigation: documented in D1. Add a comment in `AppRoutes.tsx` noting the page operates on ProductStock data and a follow-up issue to consider renaming.

[**Color editor with `type="color"` only allows full hex** — no named colors, no alpha, no eyedropper across browsers] → Acceptable: ProductColor type is `{ name: string; hex: string }`. The name field carries the human label; the hex picker covers the visual. If we later need richer colors, swap to a curated palette dropdown.

[**Drag-drop drop zone needs to keep working across all 3 themes**] → Mitigation: use existing token classes (`bg-surface-muted`, `border-default`, `text-secondary`). Test against light/dark/forest manually before completion.

[**Mutations write to both in-memory array and localStorage — races on rapid clicks**] → Acceptable: localStorage is synchronous; the in-memory array and storage stay in lockstep within a single tab. Cross-tab sync is out of scope.

[**EditProduct page might render before localStorage hydration completes**] → Mitigation: hydration is synchronous (localStorage is sync, JSON.parse is sync). The first `getProductStock` call hydrates before resolving its promise. No race.

## Migration Plan

This is a UI/client-state change with no backend, no data migrations, and no breaking interface changes for consumers outside the affected files.

**Rollout:**
1. Promote ConfirmModal first (mechanical move) — run calendar tests, ship if green.
2. Add `useProductStock` hook + extend `productStockService` with `updateProduct` and localStorage write-through — unit-tested in isolation.
3. Wire up Delete on ProductStock page (uses the new hook + ConfirmModal).
4. Build out EditProduct page (uses the new hook).
5. Wire up Edit on ProductStock page (navigation only — depends on EditProduct existing).
6. Add EN + JP i18n keys, exercise all 3 themes.

**Rollback:** revert the change; localStorage key `dashstack-product-stock` is harmless if left behind (next page load with old code ignores it). No data migration to undo.

## Open Questions

None. All open requirements were resolved in the requirements-analyst pass before this design was written. If new questions surface during implementation (e.g., a specific color-picker accessibility issue), capture them in `tasks.md` rather than retroactively editing this design.
