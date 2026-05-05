## Why

The wishlist toggle on the Product Detail page started as a long icon+text button ("Add to Wishlist" / "Remove from Wishlist") sharing the action bar with the Edit control. The text label is redundant with the heart-fill state and visually competes with the primary Edit action. Beyond shrinking the control to icon-only, e-commerce convention places the wishlist heart as a corner overlay on the product image — that's where users look for it, and it frees the action bar to be a single primary CTA. This change reshapes the wishlist toggle in two coordinated steps, both targeting the same end state: a compact, image-overlay favorite-heart that mirrors typical product-page conventions.

## What Changes

- **Wishlist button is now icon-only** — the visible "Add to Wishlist" / "Remove from Wishlist" text is removed. Only the `Heart` icon renders inside the button.
- **Wishlist button moves out of the action bar and onto the gallery image** — it is rendered as an absolute-positioned overlay anchored to the **top-right corner** of the gallery (`top: 12px; right: 12px`, mirroring the 12px inset of the existing prev/next gallery arrows).
- **Overlay shell mirrors the gallery-arrow pattern** — circular shape, white-translucent background, drop shadow, hover-scale, with per-theme overrides for dark and forest matching the existing `.galleryArrow` overrides. Sized 32×32 (smaller than the 40×40 navigation arrows because it's a state toggle, not navigation).
- **Action bar holds a single Edit control** — with the wishlist removed, the action bar is now an Edit-only row. The `<div className={styles.actionBar}>` flexbox still works for a single child, no markup change needed.
- **Wishlist overlay renders in both single-image and multi-image gallery branches** — it's a per-product affordance independent of carousel navigation.
- **Accessibility: `aria-label` + `title` driven by existing i18n keys** — no new keys; the existing `products.detail.actions.addToWishlist` / `removeFromWishlist` keys continue to drive both attributes.
- **Heart fill behavior unchanged** — red `var(--color-error-500)` filled when wishlisted, gray `var(--color-gray-400)` outline otherwise. With no visible text, fill state is the sole sighted-user signal of wishlisted state, and the white-translucent shell ensures the gray outline stays legible on dark/forest theme galleries.
- **Focus ring stays visible** — the overlay uses `outline-offset: -2px` (inset ring) so the gallery's `overflow: hidden` rounded-corner clipping doesn't crop the focus indicator.
- **Edit button is unchanged** — Pencil + "Edit" text, `<Link>`-based for native open-in-new-tab.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `product-detail`: Two requirements change.
  - **"Action bar"** — the wishlist control leaves the action bar entirely. Header reworded to describe a single Edit control. All wishlist scenarios move out.
  - **"Hero section with gallery and info"** — the gallery now hosts the wishlist toggle as a top-right corner overlay. New sentence in the requirement header plus new scenarios for the overlay (rendered in both single- and multi-image cases, fill-state toggle, `aria-label`/`title` updates).

## Impact

- **Code**: `src/pages/ProductDetail/index.tsx` (move wishlist `<button>` JSX from action bar into `.galleryContainer` as a sibling of the slider / single-image wrapper / gallery dots), `src/pages/ProductDetail/ProductDetail.module.scss` (add `.galleryWishlistOverlay` with shell + position + per-theme overrides; **remove** the now-unused `.actionButtonIconOnly` modifier added earlier in this same change).
- **Tests**: Existing wishlist tests in `src/pages/ProductDetail/__tests__/ProductDetail.test.tsx` already query by `aria-label`/role (not by parent), so they continue to pass. Add a new assertion that the wishlist button is a descendant of the gallery container (locks in the relocation contract).
- **Specs**: Two delta blocks in `openspec/specs/product-detail/spec.md` — MODIFIED "Action bar" (drop wishlist, single-control phrasing) and MODIFIED "Hero section with gallery and info" (add overlay).
- **Dependencies**: None — no new packages.
- **i18n**: No new keys; no copy changes.
- **Themes**: `.galleryWishlistOverlay` ships dark + forest overrides matching the existing `.galleryArrow` per-theme blocks. Heart fill colors come from existing CSS variables.
