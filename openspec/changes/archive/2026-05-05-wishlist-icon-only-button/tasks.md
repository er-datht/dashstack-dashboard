## 1. Styles

- [x] 1.1 Add `.actionButtonIconOnly` modifier to `src/pages/ProductDetail/ProductDetail.module.scss`. *(Superseded by 1.3 — the wishlist button leaves the action bar entirely; this class becomes dead code and is removed in 1.3.)*
- [x] 1.2 Add a new `.galleryWishlistOverlay` SCSS class to `src/pages/ProductDetail/ProductDetail.module.scss`, defined directly below `.galleryArrowPrev`. The class mirrors the `.galleryArrow` shell — same `rgba(255, 255, 255, 0.95)` background, drop shadow (`box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15)`), `border-radius: 50%`, transition timing, and centered inline-flex content — but differs in:
  - `position: absolute; top: 12px; right: 12px;` (no `transform: translateY(-50%)`)
  - `width: 32px; height: 32px;`
  - `cursor: pointer; border: none; padding: 0;`
  - `z-index: 6;`
  - `color: var(--color-gray-700);` (matches `.galleryArrow` base text color so the heart's `currentColor` outline state is consistent)
  - `&:hover { background: white; transform: scale(1.05); box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2); }` (no `translateY`)
  - `&:active { transform: scale(1); }`
  - `&:focus-visible { outline: 2px solid var(--color-primary-500); outline-offset: -2px; }` (inset ring to survive `.galleryContainer { overflow: hidden }`)
- [x] 1.3 Remove the now-unused `.actionButtonIconOnly` class from `src/pages/ProductDetail/ProductDetail.module.scss` (deletes the modifier added in 1.1, which has no remaining consumers after the wishlist relocation).
- [x] 1.4 Add per-theme overrides for `.galleryWishlistOverlay` under the existing `[data-theme="dark"]` block (line ~394) and `[data-theme="forest"]` block (line ~439) that mirror the existing `.galleryArrow` overrides:
  - Dark: `background: rgba(52, 65, 82, 0.95); color: var(--color-gray-300);` and `&:hover { background: rgba(52, 65, 82, 1); }`
  - Forest: `background: rgba(15, 40, 23, 0.95); color: var(--color-primary-300);` and `&:hover { background: rgba(15, 40, 23, 1); }`

## 2. Component

- [x] 2.1 In `src/pages/ProductDetail/index.tsx`, MOVE the wishlist `<button>` JSX out of the `.actionBar` `<div>` (currently at lines 273–292). Re-render it as a sibling of the slider / single-image wrapper / `.galleryDots` inside `<div className={styles.galleryContainer}>` — placed as the LAST CHILD of that container so DOM order resolves above the dots in the natural cascade.
- [x] 2.2 Update the wishlist button's `className` to `styles.galleryWishlistOverlay` (single class — the new overlay class replaces both `styles.actionButton` and `styles.actionButtonIconOnly`).
- [x] 2.3 Preserve verbatim on the relocated button: `type="button"`, `onClick={() => toggleWishlist(product.id)}`, `aria-label={wishlistLabel}`, `title={wishlistLabel}`. The `<Heart>` child element with its `w-4 h-4` size, color/fill style, and `fill={wishlisted ? "currentColor" : "none"}` is byte-identical to before.
- [x] 2.4 Confirm the action bar `<div className={styles.actionBar}>` now contains only the Edit `<Link>` as its single interactive child. Do NOT modify the Edit `<Link>` — its `to`, `className` (`classnames(styles.actionButton, styles.actionButtonPrimary)`), `aria-label`, Pencil icon, and visible "Edit" text remain unchanged.
- [x] 2.5 Verify the gallery renders the wishlist overlay in BOTH branches: the multi-image `<Slider>` branch (currently lines 211–228) and the single-image fallback branch (currently lines 229–238). The overlay attaches to `.galleryContainer`, so it should render once regardless of branch — confirm by reading the JSX flow.

## 3. Tests

- [x] 3.1 In `src/pages/ProductDetail/__tests__/ProductDetail.test.tsx`, add a `title` attribute assertion for both wishlisted and non-wishlisted cases. *(Already done in the icon-only step — keeps passing after relocation since `aria-label` and `title` are preserved verbatim.)*
- [x] 3.2 Add `not.toHaveTextContent` assertions locking in the no-visible-text contract. *(Already done — survives the relocation unchanged.)*
- [x] 3.3 Verify existing `getByRole('button', { name: ... })` assertions for both wishlist labels still pass unchanged. *(Already passing — they key on `aria-label` via accessible name, independent of DOM parent.)*
- [x] 3.4 Add a NEW assertion in the wishlist tests that the wishlist button is a descendant of the gallery container, NOT of the action bar. Use `wishlistButton.closest('[class*="galleryContainer"]')` to locate the gallery ancestor (CSS-modules-friendly partial-match) and assert it is truthy. Apply this assertion in the not-wishlisted test case (line ~429) — the wishlisted case at line ~460 inherits the same DOM structure and one assertion is sufficient to lock the contract.
- [x] 3.5 Add a NEW assertion that the wishlist button is NOT a descendant of any element matching `[class*="actionBar"]`. Use `wishlistButton.closest('[class*="actionBar"]')` and assert it is `null`. Apply alongside 3.4 in the not-wishlisted test case to lock the relocation contract from both directions.

## 4. Verification

- [x] 4.1 Run `yarn test src/pages/ProductDetail` and confirm tests pass green. *(Will need re-run after relocation — see 4.6.)*
- [x] 4.2 Run `yarn lint` and confirm no new warnings. *(Re-run after relocation — see 4.7.)*
- [x] 4.3 Run `yarn build` and confirm the TypeScript + Vite build succeeds. *(Re-run after relocation — see 4.8.)*
- [x] 4.4 Manual smoke check via `yarn dev`: navigate to `/products/1`, hover the wishlist overlay button at the gallery's top-right corner (tooltip surfaces "Add to Wishlist"), click it (heart fills red, tooltip text updates to "Remove from Wishlist"). Verify the overlay sits at top-right of the gallery image, does not overlap the next-arrow, and the action bar below the gallery shows only the Edit button. Repeat with the Japanese locale to confirm the `title` value matches the JP translation.
- [x] 4.5 Re-run the manual smoke check in dark and forest themes to confirm the overlay's per-theme background and color overrides apply correctly and the heart fill remains visible.
- [x] 4.6 Re-run `yarn test src/pages/ProductDetail --run` after relocation. Confirm all tests pass green, including the new descendant assertions from 3.4 and 3.5.
- [x] 4.7 Re-run `yarn lint` after relocation. Confirm no new warnings.
- [x] 4.8 Re-run `yarn build` after relocation. Confirm the TypeScript + Vite build still succeeds.
- [x] 4.9 Visually verify on a single-image product (e.g., navigate to a product whose `images` array has length ≤ 1, or one whose `images` is undefined and falls back to `[product.image]`) that the overlay still renders at top-right and the gallery has no prev/next arrows.
- [x] 4.10 Verify keyboard focus on the wishlist overlay shows a visible inset focus ring inside the gallery's rounded corners (no clipping).
