# wishlist-system Specification

## Purpose
Defines the WishlistContext (Set-based in memory, Array-serialized in localStorage), its toggle/clear API, restore-on-load behavior, and the Favorites page filtering.

## Requirements

### Requirement: WishlistContext with Set-based lookups
The WishlistContext SHALL maintain a Set of product IDs for O(1) lookup performance, while persisting as an Array to localStorage under the key `"dashstack-wishlist"`.

#### Scenario: O(1) wishlist check
- **WHEN** `isWishlisted(productId)` is called
- **THEN** it returns a boolean in O(1) time using Set.has()

#### Scenario: localStorage persistence
- **WHEN** the wishlist changes
- **THEN** the wishlist is serialized as a JSON array and saved to localStorage under `"dashstack-wishlist"`

### Requirement: Wishlist toggle and clear
The useWishlist hook SHALL expose `toggleWishlist(productId)` to add/remove products and `clearWishlist()` to remove all items.

#### Scenario: Toggle adds new product
- **WHEN** `toggleWishlist(id)` is called for a non-wishlisted product
- **THEN** the product ID is added to the Set and persisted

#### Scenario: Toggle removes existing product
- **WHEN** `toggleWishlist(id)` is called for an already-wishlisted product
- **THEN** the product ID is removed from the Set and persisted

#### Scenario: Clear all wishlist items
- **WHEN** `clearWishlist()` is called
- **THEN** all product IDs are removed and localStorage is updated

### Requirement: Wishlist restoration on load
The WishlistContext SHALL restore wishlist IDs from localStorage on application load, converting the stored Array back to a Set.

#### Scenario: Restored on mount
- **WHEN** the WishlistProvider mounts
- **THEN** it reads `"dashstack-wishlist"` from localStorage and initializes the Set

### Requirement: Favorites page filtering
The Favorites page SHALL filter the full product list to show only products whose IDs are in the wishlist Set.

#### Scenario: Display wishlisted products only
- **WHEN** the Favorites page renders
- **THEN** only products with IDs in the wishlist are displayed

#### Scenario: Empty wishlist state
- **WHEN** the wishlist is empty
- **THEN** the Favorites page displays an empty state with a "Browse Products" button linking to the Products page
