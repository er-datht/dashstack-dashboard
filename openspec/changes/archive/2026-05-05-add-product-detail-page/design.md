## Context

The Products listing page (`/products`) shows a grid of `ProductCard` components. Each card has an image carousel, name, price, rating, a wishlist heart, and an "Edit Product" button that navigates to the placeholder `/products/:id/edit` page. There is currently no way to view a product's details without entering an edit flow.

This change introduces a dedicated read-only Product Detail page at `/products/:id`. The detail page is reached by clicking the body of a product card. The existing `/products/:id/edit` route is preserved untouched (it remains a placeholder for a future edit-form change).

The current data model has a known issue: two `Product` types exist in parallel — a minimal one in `src/types/product.ts` (used by the storefront-style Products listing) and a richer one in `src/types/products.ts` (used by ProductStock and admin flows). This change extends the **minimal** type with optional fields rather than consolidating; the duplication is flagged below as a follow-up.

## Goals / Non-Goals

**Goals:**
- Provide a dedicated read-only detail page route at `/products/:id` distinct from the edit route.
- Surface richer fields (description, long description, category, SKU, stock count, stock status) on the detail page that the listing card does not show.
- Reuse existing infrastructure: `react-slick` carousel, `useWishlist` context, React Query, the i18n `dashboard` namespace, design tokens, and the `card` utility classes.
- Keep the listing card change minimal: card body becomes a navigation Link; heart and Edit remain interactive controls outside the Link.
- Maintain accessibility: card click uses native `<Link>` semantics so keyboard, screen-reader, and "open in new tab" all work without custom handlers.

**Non-Goals:**
- Implementing the edit form behind `/products/:id/edit` (placeholder remains).
- Reviews list, related-products carousel, variants (color/size), or any add-to-cart flow.
- Delete / Share / Print actions on the detail page.
- Consolidating the two `Product` type files (separate follow-up change).
- Updating the sidebar — the detail page is a sub-page reached via the listing.
- Changing the existing rich `Product` type in `src/types/products.ts` or any code consuming it (ProductStock).

## Decisions

### Decision: Extend the minimal `Product` type with optional fields (not consolidate)

Add `description?, longDescription?, category?, sku?, stock?, status?` to `src/types/product.ts`. Reuse the existing `ProductStatus` enum from `src/types/products.ts` (`active | inactive | out_of_stock | discontinued`).

**Why**: Listing UI ignores the new fields naturally because they're optional. Detail UI reads them when present. Reusing the existing enum avoids enum divergence.

**Alternatives considered**:
- *Separate `ProductDetail` type extending `Product`*: rejected — creates two types to keep in sync.
- *Consolidate `product.ts` and `products.ts` into one rich `Product` type*: rejected as out-of-scope — would touch ProductStock, the admin services, and the rich-`Product` usage sites. Tracked as a follow-up.

### Decision: Card body wrapped in `<Link>`, not card-as-button

Wrap the inner `image + info` region of `ProductCard` in `<Link to={`/products/${id}`}>`. The wishlist heart and Edit button stay outside the Link as `<button>` elements, both calling `e.stopPropagation()` (the heart already does; Edit gains it).

**Why**: Native anchor semantics give keyboard support, screen-reader landmarks, and right-click "Open in new tab" for free — no `role="button"` + `tabIndex` + Enter/Space wiring needed.

**Alternatives considered**:
- *`onClick` + `role="button"` on card root*: rejected — duplicates anchor behavior with custom code; harder a11y.
- *Separate "View Details" button next to Edit*: rejected — clutters the card and weakens "click the product to view it".

### Decision: Reuse `react-slick` carousel for the detail page gallery

The detail page renders the same `react-slick` carousel as the card, just larger.

**Why**: Same images array, same dots/arrows behavior, same dependency. Building a thumbnails-below-main pattern would add code without product mocks that justify it.

**Alternatives considered**:
- *Thumbnails below main image*: rejected for now — typical e-commerce pattern but the mock data has only 1–3 images per product, and the pattern would need separate components.

### Decision: i18n keys live under `dashboard.products.detail.*`

Extend the existing `dashboard` namespace (used by Products and EditProduct).

**Why**: Listing keys already live under `dashboard.products.*`. Putting detail keys under `dashboard.products.detail.*` keeps the storefront flow grouped. The separate top-level `products` namespace is for the admin ProductStock flow, not this storefront.

### Decision: Single-product hook `useProduct(id)`

New hook at `src/hooks/useProduct.ts` mirroring the `useProducts` pattern, with React Query key `["product", id]` and `enabled: !!id`.

**Why**: Cache key is independent of the list query so future single-product mutations don't invalidate the list. Mirrors the existing `useDeals`/`useTodos`/`useBanners` pattern.

### Decision: 404 / not-found state is an explicit empty state, not a redirect

When `getProductById` resolves to `undefined`, the page renders an empty-state card with a "Product not found" message and a "Back to Products" button.

**Why**: Silent redirects are confusing for stale links or typos. Matches the Favorites empty-state pattern from the `wishlist-system` spec.

### Decision: Breadcrumb at the top, not a Back button in the action bar

The Product Detail page renders a breadcrumb `Products / <product name>` above the hero. "Products" is a `<Link>` to `ROUTES.PRODUCTS`; the product name is plain non-interactive text. The action bar only contains Wishlist and Edit.

**Why**: A breadcrumb communicates location *and* enables back navigation in a single affordance. Native `<Link>` semantics give keyboard, screen-reader, and "open in new tab" support for free. A separate Back button next to Wishlist/Edit was redundant once the breadcrumb existed.

**Predictability**: The breadcrumb always points to `ROUTES.PRODUCTS`, never `navigate(-1)` — same rationale as the previous Back-button decision (deep-linked entries with no history would strand the user). The not-found empty state keeps its own "Back to Products" `<button>` since the breadcrumb is omitted on non-loaded states.

**Alternatives considered**:
- *Back button only*: rejected — provides navigation but no location context.
- *Both breadcrumb and Back button*: rejected — duplicates the same navigation target.
- *Full trail "Dashboard / Products / <name>"*: rejected for now — only one extra link with no current value (the sidebar already exposes Dashboard).

### Decision: Wishlist button on the detail page shows icon + label

Heart icon plus "Add to Wishlist" / "Remove from Wishlist" text label.

**Why**: The action bar has horizontal space the card lacks. A labeled action is more discoverable on a destination page than on a card thumbnail.

## Risks / Trade-offs

- **Risk**: Wrapping card content in `<Link>` while keeping heart/Edit as `<button>` could double-fire navigation if `stopPropagation` is missed → **Mitigation**: Add `stopPropagation` to Edit button (heart already has it) and assert non-propagation in the updated `ProductCard` test.
- **Risk**: Two `Product` type files remain, deepening the duplication → **Mitigation**: Explicitly flagged as a follow-up; new fields land on the minimal type only.
- **Risk**: Mock data drift — the 6 mock products gain new fields the type system marks optional, so the detail page must handle missing fields gracefully → **Mitigation**: Specs require the page to render with optional fields absent (specifications row hidden if its value is undefined).
- **Trade-off**: Reusing the carousel instead of building thumbnails-below means the gallery is identical to the card. Acceptable for a v1; revisit when mocks add more images per product.

## Migration Plan

No data migration required (all new fields are optional, mock-only). Deploy in one step. No rollback complexity.

## Open Questions

None. All UX/data decisions resolved during requirements analysis.

## Follow-ups

- **Consolidate `src/types/product.ts` and `src/types/products.ts`**: Two `Product` types coexist. The minimal one feeds the storefront listing/detail; the richer one feeds ProductStock. Worth a separate small change to merge them, with care to update all consumers in lockstep.
- **Implement `/products/:id/edit`**: The route exists as a placeholder. A follow-up change should turn it into a real edit form, likely reusing the AddPersonForm patterns.
