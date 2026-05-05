## Context

The "Edit Product" button on every `ProductCard` has unreadable text. In the default state the label is dark on a blue background; on hover the label recolors to the exact same blue as the background, becoming invisible. The button is rendered as a `react-router` `<Link>` (i.e., `<a>` element) at `src/components/ProductCard/index.tsx:212`.

Two unlayered rules in `src/assets/styles/_globals.scss:36-44` are the root cause:

```scss
a {
  color: inherit;
  &:hover { color: var(--color-primary-600); }
}
```

Because these rules are unlayered, they win against Tailwind's `text-on-primary` utility, which is registered inside `@layer utilities` in `src/index.css:320`. CSS cascade-layer ordering places unlayered styles above any layered styles regardless of selector specificity, so the layered utility loses every time.

This same root cause has been encountered before — see `openspec/changes/archive/2026-04-13-fix-todo-filter-buttons/design.md` — and the codebase has already adopted a surgical fix pattern.

## Goals / Non-Goals

**Goals:**
- The "Edit Product" label is readable in both default and hover states across all three themes.
- The fix matches the established codebase pattern (Pagination, Todo filter buttons) so future readers recognize the idiom.
- Single-line change to keep blast radius minimal.

**Non-Goals:**
- Fixing the cascade-layer ordering globally (e.g., wrapping `_globals.scss` rules in a layer or removing the `a:hover` recolor). The 2026-04-13 archived design explicitly rejected the global approach as too risky for the cross-cutting blast radius. We continue to defer that.
- Reconciling the spec's "`<button>` element" prose with the actual `<Link>` implementation. That drift exists but is orthogonal to the contrast bug and would expand scope.
- Adding a unit test. Tailwind class assertions are brittle and don't actually verify rendered contrast. Visual confirmation in the dev server is the test of record.

## Decisions

### Decision 1: ProductCard — use `!text-on-primary` (the `!important` Tailwind variant)

**Choice:** Change the Edit button className from `text-on-primary` to `!text-on-primary` on `src/components/ProductCard/index.tsx:212`.

**Rationale:** `!text-on-primary` is defined at `src/index.css:324` as `color: var(--color-white) !important`. ProductCard styles its action button with Tailwind utility classes (in `@layer utilities`), which lose to unlayered selectors regardless of specificity. The `!important` flag wins against any unlayered selector, so it defeats both `a { color: inherit }` and `a:hover { color: var(--color-primary-600) }` simultaneously. This is the same pattern used by:
- `src/components/Pagination/index.tsx:86`
- `src/pages/Todo/index.tsx:174,196`

**Alternatives considered:**

1. **Wrap `_globals.scss` link rules in `@layer base`.** Would be a "proper" fix but cross-cutting — the global `a:hover` recolor is desirable on plain text links across the app, and placing all globals in a layer would change cascade behavior for every selector in that file. Already explicitly rejected in the 2026-04-13 archived design.
2. **Add an inline `style={{ color: 'var(--color-white)' }}` plus a custom hover handler.** Inline styles win the cascade but don't handle `:hover` without JS state. We'd need to introduce hover state in JS to maintain whiteness — far more code than a single-character className addition.
3. **Move ProductCard styling to a SCSS module.** Would let us use the unlayered specificity-based fix described in Decision 2, but it's a much larger rewrite of working code for no extra benefit.
4. **Use a `<button>` instead of `<Link>`.** Avoids the `<a>` cascade entirely, but loses native middle-click / "open in new tab" behavior that the existing code comment explicitly preserves. Out of scope.

### Decision 2: ProductDetail — restate `color` inside the SCSS `:hover` block (no `!important`)

**Choice:** Add `color: var(--color-white);` inside the `&:hover` block of `.actionButtonPrimary` in `src/pages/ProductDetail/ProductDetail.module.scss:359-367`.

**Rationale:** ProductDetail uses a SCSS module class. CSS modules are unlayered, so they share the same cascade tier as the global `a` rules — specificity decides the winner. The current `.actionButtonPrimary { color: white }` (specificity 0,0,1,0) beats `a { color: inherit }` (0,0,0,1) in the default state, but the hover block sets only `background-color`, so `a:hover { color: var(--color-primary-600) }` (0,0,1,1) wins on hover by being more specific than the class. Adding `color: var(--color-white)` to the `&:hover` block makes the selector `.actionButtonPrimary:hover` (0,0,2,0), which beats both `a:hover` (0,0,1,1) and any unlayered global. No `!important` needed.

**Why not also use `!important` here?** Two reasons:
- `!important` is a sledgehammer; raw selector specificity is sufficient at this callsite, so reaching for `!important` would set a worse precedent than necessary.
- The fix idiom should match the styling layer in use. SCSS-module callsites elsewhere in the codebase (e.g. `Calendar`, `Inbox`) consistently solve cascade conflicts with selector specificity, and Tailwind callsites with `!`-utilities. Keeping the layers stylistically separate keeps each idiom recognizable.

**Alternatives considered:**

1. **Use a Tailwind `!text-on-primary` utility on ProductDetail too.** Would enforce a consistent pattern across both pages, but ProductDetail's button is otherwise pure SCSS-module styling — sprinkling a Tailwind utility into a module-styled affordance fights the existing idiom for no functional gain.
2. **Restructure `_globals.scss` link rules.** Same global-fix rejection as Decision 1.

### Decision 3: Spec delta as ADDED, not MODIFIED, on both specs

**Choice:** Add a new requirement "Edit button text contrast survives cascade layers" to each of `product-listing` and `product-detail`, rather than modifying the existing component requirements.

**Rationale:** The contrast concern is a distinct, testable property orthogonal to the existing scenarios (carousel, navigation, gallery, breadcrumb, etc.). Adding a separate requirement on each spec keeps the existing requirements' history intact and makes the contrast contract independently citeable in future related changes. MODIFIED would force copying the entire existing blocks and editing them — extra surface area for unrelated concerns.

## Risks / Trade-offs

- **Risk:** A future contributor adds another `<Link>`-based action button to `ProductCard` and uses `text-on-primary` (without `!`), reproducing the bug on the listing. **Mitigation:** The new spec scenario calls out the cascade-layer constraint explicitly, and the existing precedent in Pagination + Todo establishes the idiom.
- **Risk:** A future contributor adds another `<Link>`-styled action button to a SCSS-module file and forgets to restate `color` in `:hover`, reproducing the bug elsewhere. **Mitigation:** The new product-detail spec scenario documents the constraint, and reviewers can grep `_globals.scss` to find the offending global rule when triaging.
- **Trade-off:** Two different fix idioms (Tailwind `!`-utility vs SCSS specificity) for the same bug class. The split is intentional — each callsite uses the lightest tool for its styling layer — but it means contributors need to recognize which layer they're in.

## Migration Plan

No migration. Pure visual fix. Manual visual confirmation in dev server across all three themes (light / dark / forest) and both default + hover states on both pages (Products listing + ProductDetail) is the verification step.
