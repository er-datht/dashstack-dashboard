## ADDED Requirements

### Requirement: Responsive product grid
The Products page SHALL display ProductCard components in a responsive grid that adapts from 1 column on mobile to 4 columns on large screens.

#### Scenario: Desktop grid layout
- **WHEN** the viewport is large (desktop)
- **THEN** products display in a 4-column grid

#### Scenario: Mobile grid layout
- **WHEN** the viewport is small (mobile)
- **THEN** products display in a single column

### Requirement: Promotional banner carousel
The Products page SHALL display a PromotionalBanner carousel above the product grid with auto-play (5000ms), manual navigation arrows, and dot indicators.

#### Scenario: Banner auto-play
- **WHEN** the Products page loads
- **THEN** the promotional banner carousel auto-advances every 5 seconds

### Requirement: ProductCard component
Each ProductCard SHALL display a product image carousel (react-slick), star rating (1-5 stars), review count, wishlist heart toggle, and an edit button that navigates to `/products/{id}/edit`.

#### Scenario: Product image carousel
- **WHEN** a ProductCard renders
- **THEN** it shows a carousel of the product's images with slide controls

#### Scenario: Edit button navigation
- **WHEN** a user clicks the edit button on a ProductCard
- **THEN** they navigate to `/products/{id}/edit`

### Requirement: Wishlist toggle on ProductCard
Each ProductCard SHALL display a heart icon that toggles the product's wishlist status via `useWishlist().toggleWishlist(productId)`.

#### Scenario: Add to wishlist
- **WHEN** a user clicks the heart icon on a non-wishlisted product
- **THEN** the product is added to the wishlist and the heart icon fills

#### Scenario: Remove from wishlist
- **WHEN** a user clicks the heart icon on a wishlisted product
- **THEN** the product is removed from the wishlist and the heart icon unfills

### Requirement: Loading and error states
The Products page SHALL display loading indicators while data is fetching and error messages if data fails to load.

#### Scenario: Products loading
- **WHEN** product data is being fetched
- **THEN** a loading indicator is displayed
