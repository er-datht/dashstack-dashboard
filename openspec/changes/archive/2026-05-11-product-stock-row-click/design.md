## Context

`TableCommon` (`src/components/TableCommon/index.tsx`) is the shared data-table primitive used by ProductStock, Orders, DealDetailsTable, and the four Table-gallery section variants. It already exposes an optional `onRowClick?: (item: T) => void` prop and toggles a `.clickable` SCSS-module class when `onRowClick` is present. Today the row `<tr>` has only an `onClick` handler — there is no `tabIndex`, no `onKeyDown`, and no `role`, so keyboard users cannot activate rows.

ProductStock's Edit and Delete action buttons already call `e.stopPropagation()` on click (lines 170–172, 181–183 in `src/pages/ProductStock/index.tsx`), so they are pre-wired to not bubble into a future row-click handler. The route `/products/:id` is already registered as `ROUTES.PRODUCT_DETAIL` in `src/routes/routes.ts`.

The product-stock spec at `openspec/specs/product-stock/spec.md` has no row-click requirement today. The shared-components spec at `openspec/specs/shared-components/spec.md` covers `TableCommon` but does not yet document keyboard activation. Both specs need delta requirements.

User has explicitly confirmed the four design choices: keep existing `.clickable` hover styling, no visible focus ring, keep semantic `<tr>` (no `role="button"`, no ARIA grid semantics), Space + Enter both activate (Space uses `preventDefault()`).

## Goals / Non-Goals

**Goals:**

- Each ProductStock row is mouse-clickable and keyboard-activatable; activation navigates to `/products/:id`.
- The shared `TableCommon` keyboard upgrade is purely additive — tables without `onRowClick` render byte-identical DOM (no `tabIndex`, no `onKeyDown`, no behavior change).
- Edit and Delete buttons inside a clicked row do NOT trigger row navigation.
- No new dependencies, no new i18n keys, no SCSS changes, no route changes.

**Non-Goals:**

- Wiring `onRowClick` on other tables (Orders, DealDetailsTable, Table gallery). Out of scope.
- ARIA grid semantics (`role="grid"` / `role="row"` / `role="gridcell"`). Disproportionate for a single-page need and requires full arrow-key navigation to be conformant.
- Row selection model, focus-trap, or active-row highlight.
- Visible focus ring styling. (User-confirmed: no extra focus styling.)
- Cursor/hover audit and rework of the existing `.clickable` class.

## Decisions

### Decision 1: Attach keyboard handlers ONLY when `onRowClick` is provided

**Choice:** Inside the `data.map((item) => …)` branch in `TableCommon`, compute `const clickable = !!onRowClick;` once per render and spread `tabIndex` + `onKeyDown` conditionally. When `onRowClick` is absent, the `<tr>` is emitted without those attributes — exactly as today.

**Why:** This preserves a byte-identical DOM for the six other `TableCommon` consumers and avoids accidentally introducing focusable rows on every existing table in the app. It also keeps a single execution path for tests to verify the no-op-when-absent guarantee.

**Alternative considered:** Always attach `tabIndex={-1}` and an `onKeyDown` no-op. Rejected — adds DOM noise and is observable to a11y tooling and snapshot tests.

### Decision 2: Handle Enter and Space; `preventDefault()` on Space only

**Choice:** The `onKeyDown` handler matches `event.key === "Enter" || event.key === " "`. On Space, call `event.preventDefault()` BEFORE invoking `onRowClick(item)` so the browser does not scroll the page. On Enter, do NOT call `preventDefault()` — Enter has no default scroll behavior on `<tr>` and avoiding `preventDefault()` keeps the door open for nested form-default-submit semantics in future consumers.

**Why:** Space and Enter are the two conventional activators for button-like controls (WAI-ARIA Authoring Practices). Including Space matches user intent ("keyboard support") and the user explicitly confirmed it. Calling `preventDefault()` selectively (only on Space) keeps the handler minimal and predictable.

**Alternative considered:** Enter-only. Rejected — user explicitly asked for Space too.

**Alternative considered:** Always `preventDefault()`. Rejected — unnecessary on Enter and could mask other handlers in future composition.

### Decision 3: Keep semantic `<tr>`, do NOT add `role="button"`

**Choice:** The `<tr>` element stays a `<tr>`. No `role` attribute is added.

**Why:** Adding `role="button"` to a `<tr>` removes its implicit `row` role and breaks assistive-technology row navigation (screen reader users navigate tables row-by-row using table-specific commands). Keeping the native `<tr>` role plus `tabIndex={0}` is the minimum a11y-correct path for the requested behavior. Full ARIA grid semantics would require migrating every column header, cell, and adding arrow-key navigation — disproportionate scope.

**Alternative considered:** `role="button"` on the `<tr>`. Rejected — breaks table semantics for AT users.

### Decision 4: Stop propagation lives on the inner buttons, not on the row

**Choice:** No change to ProductStock's action buttons — they already call `e.stopPropagation()`. The row-level handler does NOT inspect `event.target` to decide whether to navigate.

**Why:** This is the existing project pattern (e.g., `ProductCard` uses the same idiom — heart and Edit are non-propagating siblings inside a `<Link>`-wrapped body). It keeps the row handler trivial and the responsibility for "I am an inner control, don't bubble" co-located with the inner control itself, which is also where new inner controls will be added.

**Alternative considered:** Have the row handler check `(event.target as Element).closest("button")` before navigating. Rejected — duplicates the stopPropagation contract and introduces a place to forget it.

### Decision 5: Use `useNavigate`, not a `<Link>` wrapping the row

**Choice:** Keep `useNavigate()` inside `ProductStock` and call `navigate(\`/products/\${product.id}\`)` from the `onRowClick` callback.

**Why:** `<tr>` cannot be wrapped in an `<a>` element (invalid HTML inside a `<tbody>`). Wrapping each cell in `<a>` would require restructuring the `<td>` content and complicate the existing `renderCell` API. `useNavigate` from the row handler is the simplest correct option. The trade-off — losing middle-click "open in new tab" on the row — is acceptable because the per-row Edit control is already a `<Link>` (and a future ProductDetail link could be added similarly without touching this design).

**Alternative considered:** Restructure `<td>` content to wrap each cell in `<a href="/products/:id">`. Rejected — invasive API change to `TableCommon` for marginal benefit.

### Decision 6: No visible focus ring (user-confirmed)

**Choice:** Do NOT add a custom focus-visible outline on `.clickable` rows. The browser's default focus outline (or absence thereof, depending on `outline: none` upstream) applies.

**Why:** User explicitly declined a focus ring. Note for future maintainers: if the global stylesheet sets `outline: none` on focusable elements, keyboard users will get no visual focus indicator on rows — that is the user's accepted trade-off for this change. Revisit if a11y feedback surfaces.

## Risks / Trade-offs

- **[Risk] No visible focus indicator → keyboard users may lose track of which row is focused.**
  → Mitigation: user-accepted per Decision 6. If feedback surfaces, add a theme-aware `:focus-visible` outline rule on `.clickable` rows in a follow-up change.

- **[Risk] Other `TableCommon` consumers accidentally inherit `tabIndex`/`onKeyDown`.**
  → Mitigation: Decision 1 attaches them only when `onRowClick` is provided. A dedicated test asserts the no-op-when-absent DOM contract.

- **[Risk] Future inner controls added to ProductStock rows forget to call `stopPropagation()` and trigger spurious navigation.**
  → Mitigation: Documented as a project pattern in the existing codebase (Edit/Delete already do it; ProductCard does it). This change does not introduce the pattern, it relies on it. A code-review checklist item is sufficient.

- **[Trade-off] Loses middle-click "open in new tab" on the row body.**
  → Accepted per Decision 5. Right-click "Inspect" and Edit's existing `<Link>` still work for open-in-new-tab on the action button.

## Migration Plan

This is an additive, behavior-only change. No data migration, no breaking API change, no rollback complexity.

- **Deploy:** Merge to `master`. No feature flag needed.
- **Rollback:** Revert the commit. No state to clean up.
