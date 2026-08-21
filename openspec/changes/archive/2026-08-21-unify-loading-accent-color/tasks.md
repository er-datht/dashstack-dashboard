## 1. Token foundation

- [x] 1.1 Add `--color-loading-accent: var(--color-primary-600);` to the `:root` block in `src/index.css`, near the primary brand colours
- [x] 1.2 Add `--color-loading-accent: var(--color-primary-400);` to the `[data-theme="dark"]` block
- [x] 1.3 Add `--color-loading-accent: var(--color-primary-light);` to the `[data-theme="forest"]` block
- [x] 1.4 Grep `src/index.css` and the global SCSS for unlayered rules that set `color` on elements carrying `.icon-brand`; record the result before touching the utility (design D2 cascade caveat)
- [x] 1.5 Rewrite `.icon-brand` in `@layer utilities` (`src/index.css:265`) to `color: var(--color-loading-accent);`
- [x] 1.6 Delete the nested `.icon-brand` override in `[data-theme="dark"]` (`src/index.css:651-653`) and in `[data-theme="forest"]` (`src/index.css:799-801`) — only if 1.4 found no competing unlayered rule; otherwise stop and apply the D2 fallback
- [x] 1.7 Add a pointer comment in `src/assets/styles/_variables.scss` noting that `--color-loading-accent` is theme-adaptive and lives only in `src/index.css` — do NOT add a SCSS variable
- [x] 1.8 Run `yarn dev` and confirm the RevenueChart and SalesDetailsChart loading spinners are visually unchanged in light, dark, and forest — these are the regression canary for 1.5/1.6

## 2. Suspense fallback (`src/routes/AppRoutes.tsx`)

- [x] 2.1 Replace `border-primary-600` on the ring (line 43) with a working reference to the token — the class generates no utility today
- [x] 2.2 Give the ring a track of `color-mix(in srgb, var(--color-loading-accent) 20%, transparent)` so the arc still reads as rotating.
      **REVISED during apply:** the task originally said to keep `border-r-transparent`. That is incompatible with having a track at all, and it would leave this spinner shaped differently from the three ring spinners in group 5 — the opposite of what this change is for. Implemented instead as `borderTopColor: accent` with the other three sides on the track, matching `Products` / `ProductDetail` / `Favorites` exactly. The stated reason for the original wording is preserved.
- [x] 2.3 Replace the backdrop `bg-white dark:bg-gray-900` (line 41) with the app-theme background token
- [x] 2.4 Replace the text `text-gray-600 dark:text-gray-400` (line 44) with `text-secondary`
- [x] 2.5 Confirm no `dark:` variant remains anywhere in `LoadingFallback`
- [x] 2.6 Verify with a hard reload (cache disabled or network throttled) on an uncached route in each theme — a class name that looks right is exactly how the current bug survived

## 3. LoadingWrapper (`src/components/LoadingWrapper/index.tsx`)

- [x] 3.1 Change the default `loadingClassName` (line 17) from `text-gray-600 dark:text-gray-400` to `text-secondary`
- [x] 3.2 Colour the `Loader2` (line 30) from `var(--color-loading-accent)` so the spinner is the accent while the sibling text stays secondary
- [x] 3.3 Replace the scrim `bg-white/80 dark:bg-surface-dark/80` (line 28) with the `.bg-scrim` utility — `bg-surface-dark` generates no utility today. **CORRECTION:** this was first written as `color-mix(in srgb, var(--color-surface) 80%, transparent)`; both halves of that were wrong and were revised during review. `color-mix` degrades to a fully opaque scrim on the declared browser target (see design.md D-track), so the token is a literal `rgba`; and it derives from `--color-background`, not `--color-surface`, because surface is *lighter* than background in dark/forest, so a surface-based scrim would lighten the page instead of dimming it.
- [x] 3.4 Verify on `/todo` (its only consumer) in all three themes that the scrim dims rather than washes out the content behind it

## 4. TableCommon overlay (`src/components/TableCommon/TableCommon.module.scss`)

- [x] 4.1 Change `.spinner` colour (line 141) from `var(--color-primary-600)` to `var(--color-loading-accent)`
- [x] 4.2 Delete the dead `:global(.dark) &` spinner override (lines 147-149) — `ThemeContext` sets only `data-theme`, never a `.dark` class
- [x] 4.3 Verify on `/table`, which renders a permanently-loading TableCommon, in all three themes

## 5. Ring spinners in SCSS modules

- [x] 5.1 `src/pages/Products/Products.module.scss:58-64` — replace `border: 4px solid color(gray-200)` with the `color-mix` track and `border-top-color: color(primary-600)` with `var(--color-loading-accent)`
- [x] 5.2 `src/pages/ProductDetail/ProductDetail.module.scss:20-27` — same two replacements
- [x] 5.3 `src/pages/Favorites/Favorites.module.scss:13-19` — replace the red `var(--color-error-500)` arc and `var(--color-gray-200)` track with the token and the `color-mix` track
- [x] 5.4 Delete the now-redundant `[data-theme]` `.spinner` override blocks.
      **EXPANDED during apply:** the task named only `Favorites.module.scss`. The audit had missed that `Products.module.scss` (dark 103-106, forest 119-122) and `ProductDetail.module.scss` (dark 430-433, forest 479-482) carry the same overrides. `[data-theme="x"] .spinner` outranks the base `.spinner`, so leaving them would have kept dark and forest on the old frozen colours and silently defeated 5.1/5.2. All six blocks removed; the sibling `.errorText` and `.headerIcon` rules in those blocks were left untouched.
      **CORRECTION (code-reviewer, verified by compiling Sass):** an earlier version of this note claimed "Forest still resolves to the same `#4ade80` it did before." That is FALSE for Products and ProductDetail. `$colors` in `_variables.scss` has no `primary-light` key, so `color(primary-light)` returns `null` and Sass **omits the whole declaration**:

      ```scss
      .spinner { border-color: color(primary-900); border-top-color: color(primary-light); }
      /* compiles to: .spinner { border-color: #1d3590; } — border-top-color is gone */
      ```

      So forest on those two pages previously rendered a navy `#1d3590` track with the arc falling through to the base rule's `color(primary-600)` — **blue `#2b5ff7`, not green**. It is now correctly `#4ade80`. The statement holds only for `Favorites.module.scss`, whose override used `var(--color-primary-light)` (a CSS custom property, which does resolve) and did produce `#4ade80`.
- [x] 5.5 Confirm no `color(` SCSS map lookup remains in any spinner rule across these three files — verified, each spinner now has exactly one rule and no map lookups

## 6. E2E verification

- [x] 6.1 Add a Playwright spec under `e2e/` that navigates to `/table`, sets `data-theme` on `<html>` to each of light, dark, and forest, and asserts the loading spinner's computed colour matches that theme's accent
- [x] 6.2 Assert the ring track is a translucent form of the accent and visually distinct from the arc
- [x] 6.3 Confirm the new spec is not collected by `yarn test` (`e2e/**` is excluded from Vitest)
- [x] 6.4 Run `yarn test:e2e` and paste the actual output — never run `playwright install`

## 7. Full verification

- [x] 7.1 `yarn lint` — **exits 1**, and did so before this change. All 18 problems (9 errors, 9 warnings) are pre-existing in `ThemeContext.tsx`, `WishlistContext.tsx`, `CalendarGrid.tsx`, `EventDetailPopover.tsx`, and `useProductStock.test.ts`; `git diff --quiet HEAD` confirms none is touched here. Zero findings in this change's files. Ticked as "no new findings", not as "command passes" — flagged by `code-reviewer` for being ambiguous.
- [x] 7.2 `yarn tsc -b`
- [x] 7.3 `yarn test`
- [x] 7.4 `yarn build`
- [x] 7.5 `yarn test:e2e`
- [x] 7.6 Manual pass in `yarn dev` across light, dark, and forest on: route fallback (hard reload), `/table`, `/todo`, `/products`, a product detail page, `/favorites`, `/orders`, `/product-stock`, and the dashboard's DealDetailsTable
- [x] 7.7 Confirm the six button-internal spinners (Login, Register, Settings, ManageAccount, PersonForm, Todo add-button) are untouched and still white on their primary backgrounds
- [x] 7.8 Confirm everything listed as a Non-Goal in `design.md` is absent from the diff — dead DealDetailsTable CSS, `loading-shimmer`, `EditProduct`, no shared `Spinner` extraction, no `@keyframes` deduplication
