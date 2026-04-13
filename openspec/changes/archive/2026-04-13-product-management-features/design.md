## Context

DashStack's product management spans four pages (Products, Favorites, ProductStock, EditProduct) and uses shared components (ProductCard, PromotionalBanner) with a context-based wishlist system. Products use mock data with simulated delays, while the wishlist persists to localStorage using a Set for performance.

## Goals / Non-Goals

**Goals:**
- Document the product data flow from services through hooks to pages
- Capture the WishlistContext architecture and its Set/Array duality
- Explain the responsive grid pattern and component reuse between Products and Favorites
- Document the ProductStock table with search and pagination

**Non-Goals:**
- Connecting to a real product API
- Implementing the Edit/Delete action stubs in ProductStock
- Adding product CRUD beyond what exists

## Decisions

### Decision 1: Set-Based Wishlist with Array Persistence
**Choice**: WishlistContext uses a JavaScript Set internally for O(1) lookups but serializes to a JSON Array for localStorage.
**Rationale**: Set provides fast `has()` checks needed for rendering many ProductCards. JSON doesn't support Set serialization, so Array is used for persistence. Conversion happens on load/save.
**Alternatives considered**: Array-only (O(n) lookups per card render), IndexedDB (overkill for a list of IDs).

### Decision 2: Context for Wishlist State
**Choice**: Use React Context (WishlistContext) rather than React Query or local state for wishlist management.
**Rationale**: Wishlist is client-side state (no server sync needed) that spans multiple pages (Products, Favorites). Context provides cross-page access without prop drilling.

### Decision 3: Shared ProductCard Component
**Choice**: Reuse the same ProductCard component on both Products and Favorites pages.
**Rationale**: Ensures consistent product display. Both pages show the same card with the same interactions (wishlist toggle, edit navigation). Only the data source differs.

### Decision 4: react-slick for Product Image Carousels
**Choice**: Use react-slick for both the PromotionalBanner and ProductCard image carousels.
**Rationale**: Consistent carousel behavior across the app with a single library dependency. react-slick provides auto-play, arrows, dots, and responsive settings.

## Risks / Trade-offs

- **[Mock data only]** → All product data is mock/hardcoded. Mitigation: service layer is structured for real API integration.
- **[ProductStock action stubs]** → Edit and Delete buttons are non-functional TODOs. Mitigation: documented as known gap.
- **[Two product type definitions]** → `src/types/product.ts` and `src/types/products.ts` exist with overlapping Product types. Mitigation: documented for future consolidation.
