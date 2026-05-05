## Why

Today, clicking a product on the Products listing only takes the user to a placeholder edit page (`/products/:id/edit`). Users have no way to view a product's full details — description, specifications, stock — without entering an edit flow. A dedicated read-only product detail page provides the natural "view first, edit second" path users expect from a dashboard.

## What Changes

- Add a new read-only **Product Detail** page at `/products/:id` showing image gallery, name, price, rating, short description, action bar, a Specifications section (SKU, category, stock, rating, reviews), and an About-this-product section (long-form description).
- Make the `ProductCard` body navigate to the detail page on click by wrapping the inner content in `<Link to="/products/:id">`. The existing wishlist heart and "Edit Product" button remain interactive elements outside the Link.
- Extend the minimal `Product` type (`src/types/product.ts`) with optional fields: `description`, `longDescription`, `category`, `sku`, `stock`, `status` (reusing the existing `ProductStatus` enum from `src/types/products.ts`).
- Populate all 6 mock products in `src/services/products.ts` with values for the new optional fields.
- Add a `useProduct(id)` React Query hook (`src/hooks/useProduct.ts`) wrapping the existing `getProductById` service, query key `["product", id]`.
- Add `PRODUCT_DETAIL: "/products/:id"` route constant and a lazy-loaded `<Route>` registration under `DashboardLayout`.
- Extend the `dashboard.products.detail.*` keys in the existing `dashboard` i18n namespace (en + jp).
- Add 404 / not-found empty state (when `getProductById` returns undefined) with a "Back to Products" button. No silent redirect.
- The existing `/products/:id/edit` placeholder is **out of scope** — left untouched for a future change.

## Capabilities

### New Capabilities
- `product-detail`: Read-only Product Detail page at `/products/:id` — hero (gallery + info + actions), Specifications section, About section, loading/error/not-found states, and reuse of the wishlist toggle.

### Modified Capabilities
- `product-listing`: Card body becomes a navigation Link to the Product Detail page. The existing wishlist heart and Edit button remain non-propagating interactive controls.

## Impact

**Affected code**
- `src/types/product.ts` — extended with optional detail fields.
- `src/services/products.ts` — mock products populated with new fields.
- `src/hooks/useProduct.ts` (new) — single-product React Query hook.
- `src/pages/ProductDetail/index.tsx` + `ProductDetail.module.scss` (new) — page implementation.
- `src/components/ProductCard/index.tsx` — inner content wrapped in `<Link>`; Edit button gains `stopPropagation`.
- `src/routes/routes.ts` — adds `PRODUCT_DETAIL`.
- `src/routes/AppRoutes.tsx` — adds lazy import + `<Route path="products/:id">`.
- `public/locales/en/dashboard.json` and `public/locales/jp/dashboard.json` — adds `products.detail.*` keys.

**Tests**
- New `ProductDetail` page tests: loading, error, not-found, loaded states; Breadcrumb / Wishlist / Edit handler behavior.
- Updated `ProductCard` tests: card-click navigates to detail; heart and Edit do not propagate.

**Dependencies**: none added.

**Out of scope (follow-ups)**
- Consolidating the duplicated `src/types/product.ts` and `src/types/products.ts` (two `Product` types coexist today). Flagged in `design.md` as a follow-up.
- Implementing the `/products/:id/edit` form (placeholder remains).
- Reviews list, related products, variants — explicitly excluded.
