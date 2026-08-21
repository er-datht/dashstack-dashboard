## Why

Loading indicators are currently drawn in three unrelated colours — primary blue, neutral gray, and error red — and two of the four colour sources are broken in ways that only show up in the built CSS. The lazy-route Suspense fallback that every user sees on first page load references `border-primary-600`, a Tailwind utility this project never generates, so it renders in inherited gray. The Products and ProductDetail spinners read their colour through SCSS `color()` map lookups, which are compile-time literals and therefore stay light-theme blue in dark and forest. Favorites is red. The result is that "loading" has no consistent visual identity and does not follow the active theme.

## What Changes

- Add a semantic CSS custom property `--color-loading-accent` to `src/index.css`, defined once per theme block: `primary-600` (light), `primary-400` (dark), `primary-light` (forest). This mirrors the per-theme choices `.icon-brand` already encodes, rather than pinning every theme to `primary-600` — which reads muddy on the dark surface.
- Rewrite the existing `.icon-brand` utility to consume the new token, making it the single source of truth. The two chart spinners already use `.icon-brand` and inherit the change with no JSX edits.
- Point every page-, panel-, and overlay-level loading indicator at the token: the lazy-route Suspense fallback, `LoadingWrapper`, the `TableCommon` loading overlay, and the ring spinners in Products, ProductDetail, and Favorites.
- Give every ring spinner a track derived from the same token — `color-mix(in srgb, var(--color-loading-accent) 20%, transparent)` — replacing the static light-gray `#e5e7eb` track that currently looks wrong on the dark and forest surfaces.
- Repair the two dead utility references that sit directly under the recoloured spinners, because a recolour alone would leave them broken: `border-primary-600` on the Suspense fallback ring, and `bg-surface-dark` on the `LoadingWrapper` scrim.
- Move the two loading indicators whose text and backdrop use Tailwind's `dark:` variant onto app-theme tokens. `dark:` resolves against `prefers-color-scheme`, not the app's `data-theme`, so those elements currently track the OS rather than the chosen theme.
- Delete the dead `:global(.dark)` spinner override in `TableCommon.module.scss`. `ThemeContext` only ever sets `data-theme`, never a `.dark` class, so the rule has never applied.
- Loading **text** stays neutral (`--color-text-secondary`). Primary-coloured text sitting next to a primary spinner reads as a link.
- Add a Playwright e2e spec asserting the computed spinner colour in all three themes. Vitest substitutes a non-scoped proxy for CSS Modules, so no unit test can read a computed style.

No breaking changes. No new dependencies.

## Capabilities

### New Capabilities
- `loading-indicator-color`: The colour contract for loading indicators — which token drives them, how it resolves per theme, which indicators are in scope, and the contrast floor it must clear.

### Modified Capabilities
- `design-tokens`: Adds `--color-loading-accent` as a theme-adaptive semantic token and redefines `.icon-brand` in terms of it.
- `shared-components`: `LoadingWrapper` and the `TableCommon` loading overlay gain a colour requirement; neither spec named one before.
- `route-config`: The `LoadingFallback` rendered by the Suspense boundary gains a colour requirement and must follow the app theme rather than the OS colour scheme.

## Impact

**Styles**
- `src/index.css` — new token in the `:root`, `[data-theme="dark"]`, and `[data-theme="forest"]` blocks; `.icon-brand` rewritten to consume it.
- `src/assets/styles/_variables.scss` — pointer comment only. The design-tokens spec requires the SCSS and CSS token sets stay in sync, but a theme-adaptive value has no meaningful static SCSS twin, so duplicating a literal here would create exactly the drift the rule exists to prevent.
- `src/components/TableCommon/TableCommon.module.scss`, `src/pages/Products/Products.module.scss`, `src/pages/ProductDetail/ProductDetail.module.scss`, `src/pages/Favorites/Favorites.module.scss`.

**Components**
- `src/routes/AppRoutes.tsx` (Suspense fallback), `src/components/LoadingWrapper/index.tsx`.

**Inherited, no edit**
- `src/components/RevenueChart/index.tsx`, `src/components/SalesDetailsChart/index.tsx` — already on `.icon-brand`.

**Screens visibly affected**
- Every route during lazy load; `/table` (permanently-loading demo table), `/orders`, `/product-stock`, the dashboard's DealDetailsTable, `/todo`, `/products`, product detail, `/favorites`.

**Tests**
- New spec in `e2e/`. `e2e/**` is excluded from vitest, so it does not affect `yarn test`.

**Dependencies**: none added. Playwright is already configured and drives the system Chrome via `channel: "chrome"`.

**Out of scope** (documented in `design.md`, deliberately absent from the diff): the six button-internal spinners on filled primary backgrounds, the dead `DealDetailsTable` loading CSS block, the unused `loading-shimmer` mixin, `EditProduct`'s indicator-less loading branch, extracting a shared `Spinner` component, and spinner geometry or animation timing.
