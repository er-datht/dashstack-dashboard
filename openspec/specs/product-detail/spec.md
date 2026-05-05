# product-detail Specification

## Purpose
Defines the read-only Product Detail page at `/products/:id`: route registration, single-product data hook, hero (gallery + info), breadcrumb, action bar (Edit + Wishlist), Specifications and About-this-product sections, loading/error/not-found states, theme support, internationalization, the extended `Product` type, and the mock-data backfill that supports it.

## Requirements

### Requirement: Read-only Product Detail page route
The application SHALL register a route `/products/:id` that lazy-loads a `ProductDetail` page rendered inside `DashboardLayout`. The route SHALL coexist with the existing `/products/:id/edit` route.

#### Scenario: Direct navigation to detail page
- **WHEN** an authenticated user navigates to `/products/123`
- **THEN** the `ProductDetail` page renders inside `DashboardLayout` with access to the route param `id="123"`

#### Scenario: Lazy load
- **WHEN** the `ProductDetail` route is first visited
- **THEN** its component bundle is loaded on demand and a `LoadingFallback` Suspense boundary renders during the fetch

#### Scenario: Route constant exposure
- **WHEN** a developer needs to navigate or link to the detail page
- **THEN** they reference `ROUTES.PRODUCT_DETAIL` (value `/products/:id`) from `src/routes/routes.ts`

### Requirement: Single-product data hook
The application SHALL expose a `useProduct(id)` React Query hook in `src/hooks/useProduct.ts` that wraps `getProductById` with query key `["product", id]` and is disabled when `id` is falsy.

#### Scenario: Fetch by id
- **WHEN** `useProduct("3")` is called
- **THEN** the hook returns `{ product, isLoading, error, refetch }` where `product` is the result of `getProductById("3")`

#### Scenario: Disabled when id missing
- **WHEN** `useProduct(undefined)` is called
- **THEN** the React Query is disabled and no fetch is initiated

### Requirement: Hero section with gallery and info
The Product Detail page SHALL display a two-column hero on `lg:` (1024px+) viewports — image carousel on the left, product info on the right — and stack vertically on smaller viewports. The image carousel SHALL reuse `react-slick` with the same dots/arrows behavior as the listing card. The info column SHALL show product name, price, star rating with review count, and the short `description` field when present.

#### Scenario: Desktop two-column hero
- **WHEN** the viewport is at least 1024px wide
- **THEN** the hero renders the gallery and info side by side

#### Scenario: Mobile stacked hero
- **WHEN** the viewport is below 1024px
- **THEN** the hero renders the gallery above the info column

#### Scenario: Multiple images render carousel
- **WHEN** the product has more than one image in `images`
- **THEN** the gallery renders a `react-slick` carousel with previous/next arrows and dot indicators

#### Scenario: Single image renders without carousel controls
- **WHEN** the product has one image
- **THEN** the gallery renders the image without arrows or dots

### Requirement: Breadcrumb navigation
The Product Detail page SHALL render a breadcrumb at the top of the page (above the hero) of the form `Products / <product name>`. The "Products" segment SHALL be a navigation `<Link>` to `ROUTES.PRODUCTS`. The current product name segment SHALL be plain non-interactive text. The breadcrumb SHALL only render in the loaded state (it is omitted on loading, error, and not-found states).

#### Scenario: Breadcrumb structure on the loaded page
- **WHEN** the Product Detail page renders a loaded product
- **THEN** a breadcrumb `Products / <product name>` is shown above the hero, where "Products" is a `<Link>` whose `href` resolves to `/products` and the product name is plain text

#### Scenario: Breadcrumb Products link navigation
- **WHEN** the user activates the "Products" breadcrumb link (click, Enter, or middle-click)
- **THEN** they navigate to `ROUTES.PRODUCTS` (or open it in a new tab via the browser-native anchor behavior)

#### Scenario: Breadcrumb omitted on non-loaded states
- **WHEN** the page is in the loading, error, or not-found state
- **THEN** the breadcrumb is not rendered

### Requirement: Action bar
The Product Detail page hero info column SHALL include an action bar with two controls: a Wishlist toggle button (icon + text label) that calls `useWishlist().toggleWishlist(productId)`, and an Edit link to `/products/:id/edit` styled as a button. The Edit control SHALL render as a `<Link>` (anchor) so right-click "open in new tab" and middle-click work natively. The action bar SHALL NOT include a Back button — back navigation is provided by the breadcrumb.

#### Scenario: Wishlist toggle add
- **WHEN** the user clicks the Wishlist button on a non-wishlisted product
- **THEN** the product is added to the wishlist, the heart icon fills, and the label changes to "Remove from Wishlist"

#### Scenario: Wishlist toggle remove
- **WHEN** the user clicks the Wishlist button on a wishlisted product
- **THEN** the product is removed from the wishlist, the heart icon empties, and the label changes to "Add to Wishlist"

#### Scenario: Edit link navigation
- **WHEN** the user activates the Edit link (click, Enter, or middle-click)
- **THEN** they navigate to `/products/{id}/edit` (or open it in a new tab via the browser-native anchor behavior)

#### Scenario: Edit link href
- **WHEN** the Edit control is rendered
- **THEN** it is an anchor element whose `href` resolves to `/products/{id}/edit`

### Requirement: Specifications section
The Product Detail page SHALL render a Specifications section below the hero displaying SKU, Category, Stock (status + numeric count when present), Rating, and Reviews count. The Rating row value SHALL be formatted as `"<rating>.0 / 5"` with exactly one decimal place (e.g., `"4.0 / 5"`). Rows whose underlying field is undefined SHALL be omitted.

#### Scenario: All specifications present
- **WHEN** the product has values for sku, category, stock, status, rating, and reviewCount
- **THEN** the Specifications section renders one row each for SKU, Category, Stock, Rating, and Reviews

#### Scenario: Rating format
- **WHEN** the product has a numeric `rating` value of `4`
- **THEN** the Rating row displays the value `"4.0 / 5"`

#### Scenario: Missing optional field hidden
- **WHEN** the product has no `sku` value
- **THEN** the SKU row is omitted from the Specifications section

### Requirement: About-this-product section
The Product Detail page SHALL render an "About this product" section below the Specifications section. The section SHALL render the `longDescription` field as plain-text paragraphs split on `\n\n`. The section SHALL be omitted when `longDescription` is undefined.

#### Scenario: Long description renders as paragraphs
- **WHEN** the product has a `longDescription` containing two paragraphs separated by `\n\n`
- **THEN** the About section renders two `<p>` elements

#### Scenario: Missing long description omits the section
- **WHEN** the product has no `longDescription`
- **THEN** the About-this-product section is not rendered

### Requirement: Loading, error, and not-found states
The Product Detail page SHALL render a loading spinner while data is fetching, an error card if `getProductById` throws, and a not-found empty state with a "Back to Products" button when `getProductById` resolves to `undefined`. The page SHALL NOT silently redirect on a missing product.

#### Scenario: Loading state
- **WHEN** product data is being fetched
- **THEN** the page renders the spinner loading pattern

#### Scenario: Error state
- **WHEN** the product fetch fails
- **THEN** the page renders an error card with the error message

#### Scenario: Not-found empty state
- **WHEN** `getProductById` resolves to `undefined` for the route's `id`
- **THEN** the page renders an empty state card with a "Product not found" message and a "Back to Products" button that navigates to `ROUTES.PRODUCTS`

### Requirement: Theme support
The Product Detail page SHALL support all three themes (light, dark, forest) using existing theme-aware utility classes and CSS custom properties. No hardcoded colors SHALL be introduced.

#### Scenario: Theme switch
- **WHEN** the user toggles between light, dark, and forest themes
- **THEN** the Product Detail page surfaces, text, and accents adapt without hardcoded colors

### Requirement: Internationalization
All user-facing text on the Product Detail page SHALL be sourced from translation keys under `dashboard.products.detail.*` in the existing `dashboard` i18n namespace. Both English and Japanese translations SHALL be provided. The following exact key names SHALL be used:

- Section headings: `products.detail.specifications`, `products.detail.about`
- Loading state: `products.detail.loading`
- Breadcrumb: `products.detail.breadcrumb.label`, `products.detail.breadcrumb.products`
- Gallery a11y (shared with `ProductCard`): `products.detail.gallery.nextImage`, `products.detail.gallery.previousImage`, `products.detail.gallery.imageAlt` (interpolates `{{name}}` and `{{index}}`), `products.detail.gallery.goToImage` (interpolates `{{index}}`)
- Action labels: `products.detail.actions.edit`, `products.detail.actions.addToWishlist`, `products.detail.actions.removeFromWishlist`
- Specification row labels: `products.detail.specs.sku`, `products.detail.specs.category`, `products.detail.specs.stock`, `products.detail.specs.stockUnits`, `products.detail.specs.rating`, `products.detail.specs.reviews`
- Stock status values: `products.detail.specs.stockStatus.active`, `products.detail.specs.stockStatus.inactive`, `products.detail.specs.stockStatus.out_of_stock`, `products.detail.specs.stockStatus.discontinued`
- Not-found empty state: `products.detail.notFound.title`, `products.detail.notFound.description`, `products.detail.notFound.back`

#### Scenario: Translation key namespace
- **WHEN** any user-facing label on the Product Detail page is rendered
- **THEN** it is obtained via `t("products.detail.*")` from the `dashboard` i18n namespace

#### Scenario: Japanese locale
- **WHEN** the user switches the language to Japanese
- **THEN** all Product Detail page labels (section headings, button labels, empty-state copy) render in Japanese

### Requirement: Extended Product type
The minimal `Product` type in `src/types/product.ts` SHALL be extended with the following optional fields: `description?: string`, `longDescription?: string`, `category?: string`, `sku?: string`, `stock?: number`, `status?: ProductStatus` (where `ProductStatus` is the enum exported from `src/types/products.ts`). Existing consumers of the minimal type that do not reference these fields SHALL be unaffected.

#### Scenario: Type extension
- **WHEN** a consumer reads a `Product` object
- **THEN** the new fields are accessible as optional values without breaking existing code

#### Scenario: ProductStatus reuse
- **WHEN** the detail page reads `product.status`
- **THEN** the value is one of `active | inactive | out_of_stock | discontinued` from the existing `ProductStatus` enum

### Requirement: Mock data populated for all products
All mock products in `src/services/products.ts` SHALL include values for the new optional fields (`description`, `longDescription`, `category`, `sku`, `stock`, `status`) so the detail page renders fully for every existing product id.

#### Scenario: Detail renders for any mock id
- **WHEN** the user navigates to `/products/:id` for any id from 1 through 6
- **THEN** the page renders the hero, Specifications, and About sections with values for all new fields
