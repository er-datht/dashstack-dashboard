## 1. Implementation — ProductCard (listing)

- [x] 1.1 In `src/components/ProductCard/index.tsx`, change the className on the Edit `<Link>` (line 212) from `text-on-primary` to `!text-on-primary`. No other tokens in the className change.

## 2. Implementation — ProductDetail (action bar)

- [x] 2.1 In `src/pages/ProductDetail/ProductDetail.module.scss`, inside `.actionButtonPrimary { &:hover { ... } }` (around line 364), add `color: var(--color-white);` so the hover block restates the white color and the `.actionButtonPrimary:hover` selector wins over the global `a:hover` recolor.

## 3. Verification

- [x] 3.1 Run `yarn dev`, open the Products page, and visually confirm the "Edit Product" label on each `ProductCard` is white against the button background in default + hover states across all three themes (light / dark / forest).
- [x] 3.2 Open a Product Detail page (`/products/:id`) and visually confirm the Edit action button's label is white in default + hover states across all three themes.
- [x] 3.3 Run `yarn lint` and `yarn test` to ensure no regressions in `ProductCard` or `ProductDetail` tests.
