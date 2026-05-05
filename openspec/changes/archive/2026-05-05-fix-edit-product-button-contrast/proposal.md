## Why

The "Edit Product" button has unreadable text in two places:

1. Every `ProductCard` in the products listing
2. The action bar on the `ProductDetail` page

In both, the default state passes contrast but on hover the text recolors to the exact same blue as the background, making it effectively invisible. The buttons are rendered as `<Link>` (i.e. `<a>` tags), which are hit by two unlayered global rules in `src/assets/styles/_globals.scss` (`a { color: inherit }` and `a:hover { color: var(--color-primary-600) }`). The fix idiom differs by styling layer:

- `ProductCard` uses Tailwind utilities — the layered `text-on-primary` loses to unlayered `a:hover` regardless of specificity.
- `ProductDetail` uses a SCSS module class — `.actionButtonPrimary` sets `color: white` but its `&:hover` block doesn't restate color, so the more-specific `a:hover` (0,0,1,1) beats the class selector (0,0,1,0) on hover.

## What Changes

- **ProductCard**: Change the Edit button className on `src/components/ProductCard/index.tsx` from `text-on-primary` to `!text-on-primary`, so `color: var(--color-white) !important` overrides both the inherited dark color and the hover recolor from the unlayered global `a` rules.
- **ProductDetail**: Add `color: var(--color-white);` inside the `&:hover` block of `.actionButtonPrimary` in `src/pages/ProductDetail/ProductDetail.module.scss`, so the selector becomes `.actionButtonPrimary:hover` (specificity 0,0,2,0) and beats the unlayered `a:hover` (0,0,1,1). No `!important` needed for SCSS-module callsites.
- Document the cascade-layer constraint in both `product-listing` and `product-detail` specs so future link-styled action buttons remember to handle hover color explicitly.

## Capabilities

### New Capabilities

<!-- None — this is a styling fix scoped to existing capabilities. -->

### Modified Capabilities

- `product-listing`: Adds a requirement that link-styled action buttons on `ProductCard` survive the unlayered global `a` rules — the existing "ProductCard component" requirement gains a contrast/visibility scenario for the Edit button.
- `product-detail`: Adds a requirement that the action-bar Edit button survives the unlayered global `a:hover` recolor — the SCSS module's hover block must restate `color`.

## Impact

- **Code**:
  - One-line className change in `src/components/ProductCard/index.tsx` (line 212).
  - One-line CSS addition in `src/pages/ProductDetail/ProductDetail.module.scss` (`.actionButtonPrimary:hover` color rule).
- **Specs**: Deltas to `product-listing` and `product-detail` each adding a button-visibility scenario.
- **APIs / dependencies**: None.
- **Tests**: No new tests — pure styling. Existing `ProductCard.test.tsx` and `ProductDetail.test.tsx` continue to pass (no contract change).
- **Themes**: All three themes (light / dark / forest) benefit equally — `--color-white` is theme-constant and `bg-primary` / `--color-primary-600` already adapt per theme.
