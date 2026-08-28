## Context

Loading indicators grew organically across seven screens with no shared colour source. The audit found four distinct colour mechanisms in use, two of which are silently broken:

| Indicator                   | File                                            | Current colour source                                           | State                                                                                                        |
| --------------------------- | ----------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Suspense fallback ring      | `src/routes/AppRoutes.tsx:43`                   | `border-primary-600`                                            | **Broken** — utility never generated, renders inherited gray                                                 |
| Fallback backdrop / text    | `src/routes/AppRoutes.tsx:41,44`                | `bg-white dark:bg-gray-900`, `text-gray-600 dark:text-gray-400` | **OS-driven** — `dark:` is `prefers-color-scheme`, not `data-theme`                                          |
| LoadingWrapper spinner      | `src/components/LoadingWrapper/index.tsx:30,17` | `currentColor` from `text-gray-600 dark:text-gray-400`          | Gray, OS-driven                                                                                              |
| LoadingWrapper scrim        | `src/components/LoadingWrapper/index.tsx:28`    | `bg-white/80 dark:bg-surface-dark/80`                           | **Broken** — `bg-surface-dark` never generated; white scrim in dark and forest                               |
| TableCommon overlay spinner | `TableCommon.module.scss:141-150`               | `var(--color-primary-600)` + `:global(.dark)` override          | Primary, but frozen at light blue — the `.dark` override is **dead** (`ThemeContext` sets only `data-theme`) |
| Products ring               | `Products.module.scss:58-64`                    | `color(gray-200)` / `color(primary-600)`                        | **Frozen** — SCSS map lookups are compile-time literals                                                      |
| ProductDetail ring          | `ProductDetail.module.scss:20-27`               | same                                                            | **Frozen**                                                                                                   |
| Favorites ring              | `Favorites.module.scss:13-40`                   | `var(--color-error-500)` + dark and forest overrides            | **Red** in light and dark; forest override already lands on `primary-light`                                  |
| Chart spinners              | `RevenueChart`, `SalesDetailsChart`             | `.icon-brand`                                                   | ✅ Correct — the pattern to generalise                                                                       |

Two of these are load-bearing discoveries that shape the design rather than just the diff:

1. **The numbered palette is not a Tailwind theme.** `--color-primary-600` and friends live in `:root`, not in `@theme`, so Tailwind generates no `border-primary-600` / `text-primary-600` / `bg-surface-dark` utilities. Verified against the built CSS, not just the source. Any class of that shape in this codebase is a silent no-op.
2. **`dark:` is not the app's dark theme.** There is no `@custom-variant dark` declaration in `index.css`, so Tailwind's `dark:` compiles to a `prefers-color-scheme` media query. Every `dark:` colour class in a loading indicator tracks the OS and is unreachable via the theme switcher, and forest has no representation at all in a two-state variant.

The charts already solved this correctly with `.icon-brand`, which is declared three times — once in `@layer utilities` and once nested inside each of the `[data-theme]` blocks. That works but scatters the per-theme decision across three places.

## Goals / Non-Goals

**Goals:**

- One token, `--color-loading-accent`, that every in-scope loading indicator reads from, so a future palette change is a three-line edit.
- Every loading indicator responds to `data-theme`, including forest.
- Repair the two dead utility references that sit directly under recoloured spinners — a recolour that leaves the fallback ring invisible would not meet "all screens".
- Ring spinner tracks derive from the same token instead of a fixed gray.
- Browser-level proof of the colour in all three themes, since no unit test can reach a computed style through CSS Modules.

**Non-Goals:**

- The six button-internal spinners (`Login:310`, `Register:241`, `Settings:373`, `ManageAccount:429`, `PersonForm:538`, `Todo:177`). They sit on filled primary backgrounds and keep `text-on-primary`.
- Deleting the dead `.loadingState` / `.loadingSpinner` / `.loadingText` block in `DealDetailsTable.module.scss:136-163`.
- The unused `loading-shimmer` mixin (`_mixins.scss:251-270`) and `.loading` (`_globals.scss:104-106`).
- `EditProduct`'s indicator-less loading branch (`EditProduct/index.tsx:131-152`) — a UX gap, not a colour bug.
- Extracting a shared `Spinner` component or deduplicating the eight copies of `@keyframes spin`.
- Spinner geometry, size, animation timing, loading logic, and data fetching.

## Decisions

### D1: A semantic `--color-loading-accent`, not raw `--color-primary-600`

Loading indicators reference a purpose-named token rather than a palette slot.

Per-theme values, chosen to match what `.icon-brand` already encodes:

Contrast is quoted against `--color-surface`, not `--color-background`. The
surface is the tighter of the two and is what the TableCommon overlay and the
LoadingWrapper scrim actually paint, so it is the number that governs.

| Theme           | Value                        | Hex       | vs surface              | vs page bg |
| --------------- | ---------------------------- | --------- | ----------------------- | ---------- |
| light (`:root`) | `var(--color-primary-600)`   | `#2b5ff7` | 5.14:1 on `#ffffff`     | 4.72:1     |
| dark            | `var(--color-primary-400)`   | `#6691ff` | **3.49:1** on `#344152` | 4.16:1     |
| forest          | `var(--color-primary-light)` | `#4ade80` | 9.02:1 on `#0f2817`     | 9.91:1     |

All three clear the 3:1 non-text floor, but dark clears it by only 0.49. An
earlier draft of this document cited 4.2:1 for dark, which is the _background_
measurement and overstates the margin. Darkening `--color-surface` or lightening
the dark accent could cross the floor, so treat that row as nearly spent budget
rather than comfortable headroom.

_Alternative considered — point everything at `--color-primary-600` directly._ Simpler, but `#2b5ff7` on the dark surface `#344152` is muddy, and the codebase had already rejected it once by giving `.icon-brand` a lighter dark value. Reusing the palette slot directly would also mean a future decision to lighten loading spinners couldn't be made without moving every other `primary-600` consumer.

_Alternative considered — reuse `.icon-brand` as-is with no new token._ The utility works, but it is a class, not a value: SCSS modules can't apply it to a pseudo-element border, and a ring spinner's track needs the value in a `color-mix()`. A token serves both the class and the SCSS module; a class serves only JSX.

### D2: `.icon-brand` collapses to a single declaration

`.icon-brand` becomes `color: var(--color-loading-accent)` in `@layer utilities`, and the two nested overrides inside `[data-theme="dark"]` (`index.css:651-653`) and `[data-theme="forest"]` (`index.css:799-801`) are deleted. The per-theme decision then lives in exactly one place — the token — and the utility and the raw token cannot drift.

The chart spinners inherit this with no JSX edit and no visual change, because the token carries the same three values the overrides did.

**Cascade caveat.** The deleted overrides were _unlayered_ and therefore outranked the layered `.icon-brand` regardless of source order. After deletion, `.icon-brand` exists only inside `@layer utilities`, which loses to any unlayered rule of any specificity that sets `color` on the same element. Before deleting, grep for unlayered rules that could now win — this repo has been bitten twice by exactly this cascade mechanic (`.text-primary` beating `.bg-sidebar-menu-active`, and the unlayered `a:hover` overriding link colour). If a conflict exists, keep the token but leave `.icon-brand`'s per-theme structure alone rather than forcing the collapse.

### D3: Ring tracks are a tint of the accent, not a per-theme gray

Track becomes the accent at 20% alpha, arc stays at full opacity. Consumers reference a single token (`--color-loading-track`), which is what lets Favorites, Products, and ProductDetail shed their `[data-theme]` blocks entirely.

_Alternative considered — a neutral track per theme (`gray-200` / `gray-700` / `primary-900`)._ That is what those three components did, and it costs a theme block each. The tinted track reads as the same component in every theme.

**REVISED during review.** The track was first written as `color-mix(in srgb, var(--color-loading-accent) 20%, transparent)`, on the reasoning that `color-mix` already had precedent at `index.css:674`. The `code-reviewer` and correctness passes showed that reasoning was wrong _for this specific use_:

Lightning CSS cannot statically resolve a mix whose input is a custom property, so it emits an `@supports`-guarded progressive-enhancement fallback of the bare **opaque** colour. Verified in the emitted CSS. On any engine without `color-mix` — Safari <16.4, Chrome <111, Firefox <113, all inside this project's Vite default target, and the project pins no `browserslist` — that fallback made the track _identical to the arc_: a uniform ring with no visible rotation. Strictly worse than the hardcoded gray it replaced, because the indicator stops indicating.

Both translucent values are therefore authored as literal per-theme `rgba()`:

| Token                   | light                  | dark                   | forest                |
| ----------------------- | ---------------------- | ---------------------- | --------------------- |
| `--color-loading-track` | `rgba(43,95,247,.2)`   | `rgba(102,145,255,.2)` | `rgba(74,222,128,.2)` |
| `--color-scrim`         | `rgba(245,245,247,.8)` | `rgba(43,53,68,.8)`    | `rgba(10,31,15,.8)`   |

This trades a little duplication for correctness across the declared browser target, and it is a genuine cost: the value is now coupled to the palette rather than to the loading token, so editing `--color-primary-600` desyncs the light track without anyone touching the loading block. Three things contain that: a comment at the declaration explaining why it must not be "simplified" back into a `color-mix`; unit assertions in `src/assets/styles/__tests__/tokenSync.test.ts` that recompute each translucent token's channels from its source hex, so drift fails `yarn test` without a browser; and e2e channel assertions across 3 themes × 4 routes. The delta spec records the exception explicitly rather than leaving the code silently contradicting the "no hardcoded colour" rule.

### D3b: The scrim derives from the page background, not the surface

`--color-scrim` mixes over `--color-background`. The first implementation used `--color-surface`, which is wrong for the only consumer: `LoadingWrapper`'s single caller (Todo) renders on the layout background, and in dark and forest the surface is _lighter_ than the background (`#344152` vs `#2b3544`; `#0f2817` vs `#0a1f0f`). A surface-derived scrim there **lightens** the page instead of dimming it — the opposite of the `shared-components` scenario's "stays legibly dimmed rather than washed out", and something the manual pass in task 3.4 did not catch because the children are already at `opacity-20`.

### D4: SCSS modules read the CSS custom property, never `color()`

`color(primary-600)` and `color(gray-200)` resolve against a Sass map at build time and emit a literal hex. That is precisely why Products and ProductDetail are stuck on light-theme blue. Every spinner colour in a `.module.scss` becomes `var(--color-loading-accent)`.

This creates a wrinkle with the design-tokens spec's rule that `_variables.scss` and `index.css` stay in sync. The rule exists to stop the two token sets drifting — but a theme-adaptive value has no honest static twin, so mirroring it into `_variables.scss` would freeze one theme's value and _cause_ the drift the rule guards against. Resolution: add a pointer comment in `_variables.scss` instead of a variable, and record the general principle as a spec requirement so the next theme-adaptive token doesn't re-litigate this.

### D5: Repair the two dead utilities, defer the rest of the dead code

`border-primary-600` and `bg-surface-dark` are fixed because they are the surfaces the recoloured spinners sit on — a primary spinner over a white scrim on a dark page is worse than the gray it replaces. The dead `:global(.dark)` spinner rule in `TableCommon.module.scss` is deleted because the token supersedes it and leaving it invites someone to "fix" a rule that can never match.

Everything else the audit turned up — dead `DealDetailsTable` CSS, the inert `loading-shimmer` mixin, `EditProduct`'s missing indicator — is genuinely separate and gets its own change. Bundling them would make this diff about dead-code removal rather than about colour.

### D6: Loading text stays `--color-text-secondary`

Primary text beside a primary spinner reads as a hyperlink. The two indicators using OS-driven gray classes move onto `text-secondary`; the ones already on `--color-text-secondary` (charts, Products, ProductDetail) are correct and untouched.

### D7: Verification is a Playwright spec, not a unit test

Vitest swaps CSS Modules for a non-scoped proxy, so a jsdom test can assert a class name but never a resolved colour — which is the entire content of this change. The e2e spec sets `data-theme` on `<html>`, reads `getComputedStyle` on a rendered spinner, and asserts the expected `rgb()` per theme.

`/table` renders a `TableCommon` in a permanent loading state (`StatesAndInteractionSection.tsx:52` passes `data={[]}` with loading on), which gives a spinner that is on screen without needing to intercept a network request.

The spec goes in `e2e/`, which is excluded from Vitest — Playwright specs otherwise match Vitest's default `**/*.spec.ts` discovery and break `yarn test`. It runs via `yarn test:e2e` against the system Chrome (`channel: "chrome"`); `playwright install` must never be run.

## Risks / Trade-offs

- **Collapsing `.icon-brand` into `@layer utilities` demotes it below unlayered rules** → Grep for competing unlayered `color` declarations before deleting the two nested overrides. If any exists, keep the token and leave the utility's structure intact (D2 fallback). Confirm the two chart spinners are visually unchanged in all three themes afterwards — they are the regression canary.
- **`color-mix` track may render too faint on the forest surface** → forest's accent is the brightest of the three (`#4ade80`, ≈9:1), so a 20% mix stays visible; confirm on `/favorites` and `/products` during the three-theme pass and raise the percentage if the ring reads as a gap rather than a track.
- **Favorites loses its per-theme blocks** → its forest override is currently _correct_ (`primary-light`), so the token must produce the same forest result or that screen regresses. It does, by construction, but forest-Favorites is the specific case to eyeball.
- **The Suspense fallback is hard to observe** → it appears only during a cold lazy-chunk fetch. Verify with network throttling or a hard reload on a route whose chunk isn't cached; don't assume it works because the class name looks right — that assumption is what let `border-primary-600` survive.
- **A `dark:` class removed from the fallback changes behavior for OS-dark users who chose the light theme** → this is the intended correction: the app theme becomes authoritative. Worth calling out in the PR description, since someone running OS-dark with app-light will see the fallback go light where it used to be dark.

## Migration Plan

No data, API, or persisted-state migration. Purely presentational, single deploy, revert by reverting the commit.

Order matters: land the token and the `.icon-brand` rewrite first and confirm the charts are unchanged, then move the consumers one at a time. That way any cascade surprise from D2 surfaces against a known-good baseline instead of being tangled with six other edits.

## Open Questions

None blocking. Resolved with the user before proposing: button spinners stay white; latent bugs are fixed only where they block the recolour; tracks are recoloured and loading text is normalised but not made primary; verification is a Playwright spec rather than a manual-only pass.
