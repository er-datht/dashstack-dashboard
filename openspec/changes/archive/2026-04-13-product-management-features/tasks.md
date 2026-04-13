## 1. Verify Products Page

- [ ] 1.1 Confirm Products page renders PromotionalBanner carousel with auto-play
- [ ] 1.2 Confirm ProductCard grid is responsive (1/2/3/4 columns)
- [ ] 1.3 Confirm ProductCard shows image carousel, star rating, review count
- [ ] 1.4 Confirm wishlist heart toggle works on ProductCards
- [ ] 1.5 Confirm edit button navigates to /products/{id}/edit

## 2. Verify Wishlist System

- [ ] 2.1 Confirm WishlistContext uses Set internally for O(1) lookups
- [ ] 2.2 Confirm wishlist persists to localStorage under "dashstack-wishlist"
- [ ] 2.3 Confirm toggleWishlist adds/removes product IDs
- [ ] 2.4 Confirm Favorites page shows only wishlisted products
- [ ] 2.5 Confirm Favorites empty state shows "Browse Products" button

## 3. Verify ProductStock Page

- [ ] 3.1 Confirm search input filters products by name
- [ ] 3.2 Confirm table shows Image, Name, Category, Price, Amount, Available Colors columns
- [ ] 3.3 Confirm ColorDots shows up to 4 colors with "+N" for extras
- [ ] 3.4 Confirm pagination with 10 items per page
- [ ] 3.5 Note Edit/Delete action buttons are stubs (TODO)

## 4. Verify EditProduct

- [ ] 4.1 Confirm EditProduct page is accessible via nested route /products/:id/edit
