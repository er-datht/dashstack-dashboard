## MODIFIED Requirements

### Requirement: ProductCard component
Each ProductCard SHALL display a product image carousel (react-slick), star rating (1-5 stars), review count, wishlist heart toggle, and an edit button that navigates to `/products/{id}/edit`. The image and product info regions of the card SHALL be wrapped in a navigation `<Link>` to `/products/{id}` so that clicking the card body opens the read-only Product Detail page. The wishlist heart and the edit button SHALL be rendered as `<button>` elements that call `e.stopPropagation()` on click so they do not trigger the card-body Link.

#### Scenario: Product image carousel
- **WHEN** a ProductCard renders
- **THEN** it shows a carousel of the product's images with slide controls

#### Scenario: Card body navigates to detail page
- **WHEN** a user clicks the image or product info region of a ProductCard
- **THEN** they navigate to `/products/{id}` (the read-only Product Detail page)

#### Scenario: Edit button navigation
- **WHEN** a user clicks the edit button on a ProductCard
- **THEN** they navigate to `/products/{id}/edit` and the card-body Link is NOT triggered

#### Scenario: Wishlist heart does not trigger card navigation
- **WHEN** a user clicks the wishlist heart on a ProductCard
- **THEN** the wishlist toggles and the card-body Link is NOT triggered

#### Scenario: Keyboard activation of card body
- **WHEN** a keyboard user focuses the card-body Link and presses Enter
- **THEN** they navigate to `/products/{id}`

#### Scenario: Open in new tab
- **WHEN** a user right-clicks the card body and chooses "Open link in new tab" (or middle-clicks)
- **THEN** the Product Detail page opens in a new tab at `/products/{id}`
