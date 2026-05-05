## MODIFIED Requirements

### Requirement: Hero section with gallery and info
The Product Detail page SHALL display a two-column hero on `lg:` (1024px+) viewports — image carousel on the left, product info on the right — and stack vertically on smaller viewports. The image carousel SHALL reuse `react-slick` with the same dots/arrows behavior as the listing card. The info column SHALL show product name, price, star rating with review count, and the short `description` field when present. The gallery container SHALL render an icon-only Wishlist toggle button as an absolute-positioned overlay anchored to the top-right corner of the gallery image area (`top: 12px; right: 12px`), styled with the gallery-arrow shell pattern (circular, white-translucent background, drop shadow, per-theme overrides) and sized 32×32. The Wishlist overlay SHALL render in both single-image and multi-image gallery branches and SHALL call `useWishlist().toggleWishlist(productId)` when activated. The Wishlist overlay button SHALL render only the `Heart` icon (no visible text), with both `aria-label` and `title` attributes set to the i18n key `products.detail.actions.addToWishlist` when not wishlisted, or `products.detail.actions.removeFromWishlist` when wishlisted.

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

#### Scenario: Wishlist overlay rendered on multi-image gallery
- **WHEN** the product has more than one image AND the gallery renders as a `react-slick` carousel
- **THEN** the Wishlist toggle button is rendered as a descendant of the gallery container (NOT of the action bar) at the top-right corner

#### Scenario: Wishlist overlay rendered on single-image gallery
- **WHEN** the product has exactly one image AND the gallery renders without carousel controls
- **THEN** the Wishlist toggle button is still rendered as a descendant of the gallery container at the top-right corner

#### Scenario: Wishlist overlay add toggle
- **WHEN** the user clicks the gallery Wishlist overlay button on a non-wishlisted product
- **THEN** the product is added to the wishlist, the heart icon fills with the wishlisted color, and the button's `aria-label` and `title` both change to the value of `products.detail.actions.removeFromWishlist`

#### Scenario: Wishlist overlay remove toggle
- **WHEN** the user clicks the gallery Wishlist overlay button on a wishlisted product
- **THEN** the product is removed from the wishlist, the heart icon empties to the not-wishlisted color, and the button's `aria-label` and `title` both change to the value of `products.detail.actions.addToWishlist`

#### Scenario: Wishlist overlay button has no visible text
- **WHEN** the gallery Wishlist overlay button is rendered in any state (wishlisted or not)
- **THEN** it renders only the `Heart` icon as visible content, with the wishlist label exposed via `aria-label` and `title` attributes only

### Requirement: Action bar
The Product Detail page hero info column SHALL include an action bar containing a single Edit control: a `<Link>` to `/products/:id/edit` styled as a button. The Edit control SHALL render as a `<Link>` (anchor) so right-click "open in new tab" and middle-click work natively, and SHALL retain its visible "Edit" text label alongside its `Pencil` icon. The action bar SHALL NOT include a Wishlist toggle (it lives as a gallery overlay — see "Hero section with gallery and info") and SHALL NOT include a Back button (back navigation is provided by the breadcrumb).

#### Scenario: Edit link navigation
- **WHEN** the user activates the Edit link (click, Enter, or middle-click)
- **THEN** they navigate to `/products/{id}/edit` (or open it in a new tab via the browser-native anchor behavior)

#### Scenario: Edit link href
- **WHEN** the Edit control is rendered
- **THEN** it is an anchor element whose `href` resolves to `/products/{id}/edit`

#### Scenario: Action bar contains no Wishlist control
- **WHEN** the Product Detail page is rendered
- **THEN** the action bar element contains the Edit link as its only interactive control, and the Wishlist toggle button is NOT a descendant of the action bar
