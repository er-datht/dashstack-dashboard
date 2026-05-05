## 1. Types and mock data

- [x] 1.1 Extend `src/types/product.ts` with optional fields `description?, longDescription?, category?, sku?, stock?, status?` and import `ProductStatus` from `src/types/products.ts`
- [x] 1.2 Populate all 6 mock products in `src/services/products.ts` with values for the new fields (categories per product name, plausible stock numbers, status, short + long descriptions, SKUs)
- [x] 1.3 Add `getProductById` is already present; verify it returns `Promise<Product | undefined>` and that the new fields flow through

## 2. Data hook

- [x] 2.1 Create `src/hooks/useProduct.ts` exporting `useProduct(id?: string)` that wraps `useQuery({ queryKey: ["product", id], queryFn: () => getProductById(id), enabled: !!id })`
- [x] 2.2 Return `{ product, isLoading, error, refetch }` matching the shape of the existing `useProducts` hook

## 3. Routing

- [x] 3.1 Add `PRODUCT_DETAIL: "/products/:id"` to `ROUTES` in `src/routes/routes.ts`
- [x] 3.2 Lazy-import `ProductDetail` in `src/routes/AppRoutes.tsx` and register `<Route path="products/:id" element={<ProductDetail />} />` inside `DashboardLayout`, declared after `products/:id/edit` so router declaration order stays intuitive

## 4. i18n

- [x] 4.1 Add `dashboard.products.detail.*` keys to `public/locales/en/dashboard.json`: section headings (specifications, about), action labels (back, addToWishlist, removeFromWishlist, edit), spec row labels (sku, category, stock, status, rating, reviews), stock status values, not-found copy ("Product not found", "Back to Products")
- [x] 4.2 Add the matching Japanese keys to `public/locales/jp/dashboard.json`

## 5. Product Detail page

- [x] 5.1 Create `src/pages/ProductDetail/index.tsx` and `src/pages/ProductDetail/ProductDetail.module.scss`
- [x] 5.2 Wire route param via `useParams<{ id: string }>()` and call `useProduct(id)`
- [x] 5.3 Render the loading state using the same spinner pattern as the Products listing
- [x] 5.4 Render the error state as a `card`-classed error block matching the listing's pattern
- [x] 5.5 Render the not-found state when `useProduct` resolves to `undefined`: empty-state card with heading "Product not found", body copy, and a "Back to Products" button that navigates to `ROUTES.PRODUCTS`
- [x] 5.6 Build the hero: 2-column at `lg:` (image carousel left, info right), stacked below; reuse the `react-slick` settings from `ProductCard` (arrows + dot indicators when `images.length > 1`, single image otherwise)
- [x] 5.7 Render product name, price (`$xx.xx`), star rating (1–5 with the same `Star` icon pattern as `ProductCard`), review count, and short `description` when present
- [x] 5.8 Build the action bar with two controls: Wishlist toggle button showing heart icon + label ("Add to Wishlist" / "Remove from Wishlist") wired to `useWishlist().toggleWishlist(id)` and reflecting `isWishlisted(id)`, and Edit button (→ `/products/${id}/edit`) (superseded by §9 — breadcrumb replaces Back)
- [x] 5.9 Build the Specifications section: a 2-column grid of label/value rows for SKU, Category, Stock (status + count, e.g., "In Stock · 24 units"), Rating ("4.0 / 5"), and Reviews count. Omit any row whose underlying field is undefined. Use the `card` utility class for the section container.
- [x] 5.10 Build the About-this-product section: split `longDescription` on `\n\n` and render each chunk as a `<p>`. Omit the section if `longDescription` is undefined.
- [x] 5.11 Use only theme-aware utility classes and CSS custom properties — no hardcoded colors. Verify all three themes (light, dark, forest) render correctly.

## 6. Update ProductCard for card-click navigation

- [x] 6.1 In `src/components/ProductCard/index.tsx`, wrap the inner image + info region in `<Link to={`/products/${product.id}`}>` from `react-router-dom`
- [x] 6.2 Add `e.stopPropagation()` to the Edit button's onClick handler so the Link is not triggered when Edit is clicked
- [x] 6.3 Verify the wishlist heart's existing `e.stopPropagation()` continues to prevent navigation
- [x] 6.4 Adjust styles in `ProductCard.module.scss` if needed so the Link does not interfere with hover/focus states or the carousel arrow buttons

## 7. Tests

- [x] 7.1 Add `src/pages/ProductDetail/__tests__/ProductDetail.test.tsx` covering: loading state renders spinner; error state renders error card; not-found state renders empty-state with Back button; loaded state renders hero (gallery, name, price, rating, reviews), Specifications rows, About paragraphs; Back button navigates to products; Edit button navigates to `/products/:id/edit`; Wishlist toggle calls `toggleWishlist`
- [x] 7.2 Update `src/components/ProductCard/__tests__/ProductCard.test.tsx` (or create if missing) covering: card-body click navigates to `/products/:id`; clicking the heart toggles wishlist and does NOT navigate; clicking Edit navigates to `/products/:id/edit` and does NOT trigger the card Link
- [x] 7.3 Run `yarn test` and ensure all tests pass

## 8. Verification

- [x] 8.1 Run `yarn lint` and resolve any new violations
- [x] 8.2 Run `yarn build` and confirm the production build succeeds
- [x] 8.3 Manually verify in `yarn dev`: click each of the 6 product cards, confirm hero/specs/about render with mock data; visit `/products/999` and confirm the not-found empty state; toggle wishlist from the detail page; click Back and Edit; switch language to Japanese; switch through light/dark/forest themes

## 9. Breadcrumb refinement (replaces Back button)

- [x] 9.1 Update `specs/product-detail/spec.md`: drop the Back button from the Action bar requirement; add a Breadcrumb requirement (`Products / <product name>` with "Products" linking to `ROUTES.PRODUCTS`); update i18n requirement to replace `products.detail.actions.back` with `products.detail.breadcrumb.products`
- [x] 9.2 Update `public/locales/en/dashboard.json` and `public/locales/jp/dashboard.json`: remove `products.detail.actions.back`; add `products.detail.breadcrumb.products`
- [x] 9.3 In `src/pages/ProductDetail/index.tsx`: render a `<nav>` breadcrumb at the top of the loaded page (above the hero), with `<Link to={ROUTES.PRODUCTS}>` for "Products" and a plain `<span>` for the current product name; remove the Back button from the action bar
- [x] 9.4 In `src/pages/ProductDetail/ProductDetail.module.scss`: add breadcrumb styles using existing tokens, theme-aware
- [x] 9.5 Update `src/pages/ProductDetail/__tests__/ProductDetail.test.tsx`: remove the action-bar Back button test; add tests asserting the breadcrumb renders the Products link with `href="/products"` and the current product name as plain text
- [x] 9.6 Run `yarn test --run` and `yarn lint` — all tests pass, no new lint violations
