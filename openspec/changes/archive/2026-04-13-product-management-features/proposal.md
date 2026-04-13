## Why

Document the product management feature set of DashStack, including product listing, favorites/wishlist, product stock management, and product editing. These features span multiple pages and shared components with a Set-based wishlist persisted to localStorage. This spec captures the product data flow, wishlist architecture, and component patterns.

## What Changes

- Document the Products page with responsive grid layout and promotional banners
- Document the Favorites page with wishlist filtering and empty state
- Document the ProductStock page with search, pagination, and color display
- Document the EditProduct page and its nested route pattern
- Document WishlistContext with Set-based O(1) lookups and localStorage persistence
- Document ProductCard and PromotionalBanner shared components

## Capabilities

### New Capabilities
- `product-listing`: Products page composition with ProductCard grid, PromotionalBanner carousel, responsive layout, and loading/error states
- `wishlist-system`: WishlistContext provider, useWishlist hook, Set-based storage with localStorage persistence, and Favorites page integration
- `product-stock`: ProductStock page with search filtering, paginated table, color dots display, and action stubs

### Modified Capabilities

## Impact

- **Files**: `src/pages/Products/`, `src/pages/Favorites/`, `src/pages/ProductStock/`, `src/pages/EditProduct/`, `src/contexts/WishlistContext.tsx`, `src/components/ProductCard/`, `src/components/PromotionalBanner/`
- **Types**: `src/types/product.ts`, `src/types/productStock.ts`
- **localStorage key**: `"dashstack-wishlist"` for wishlist persistence
