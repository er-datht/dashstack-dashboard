# Parallel review — unify-loading-accent-color

Six single-angle reviewers over the same diff, plus the `code-reviewer` stage.
Both iterations of the evaluator–optimizer loop are complete (cap: 2).

## Summary

| Angle | Result |
|---|---|
| Accessibility | 4 MEDIUM, 2 LOW |
| Performance | clean — no findings |
| Correctness | 1 MEDIUM |
| Convention | 1 MEDIUM, 2 LOW (both pre-existing) |
| Test coverage | 4 HIGH, 3 MEDIUM |
| Client security | 1 LOW (pre-existing app weakness, not this diff) |
| `code-reviewer` | 4 WARNING, 3 NOTE — cascade collapse verified SAFE |

All 4 HIGH findings were defects in the **test work**, not the implementation.
All were fixed in iteration 1 and verified by mutation testing.

Iteration 2 addressed `code-reviewer`, which arrived last and found the deepest
issues: an internal inconsistency created by iteration 1's own fix, a factually
false claim in `tasks.md`, and a cascade-position violation of the very spec
this change amended.

### `code-reviewer` confirmed safe, with evidence

The D2 cascade collapse was verified against **byte offsets in the built
stylesheet**, not source reasoning: `.text-primary` (42058) precedes
`.icon-brand` (42297) at equal specificity in the same layer, so `.icon-brand`
still wins on `ProductStock/index.tsx:220`. Nothing unlayered after the layer
boundary matches any of the 13 `.icon-brand` elements, and the three that also
carry a CSS-module class declare no `color` in those modules. The regression
canary is genuinely clear.

## HIGH — fixed

### 1 & 2. Tautological unit assertions
`LoadingWrapper.test.tsx` asserted `toMatch(/--color-loading-accent|icon-brand/)`.
The implementation types `icon-brand` as a literal class, so the regex matched
the literal string and would have passed even if `.icon-brand` were deleted from
`src/index.css`. Worse, the test's comment claimed the resolved colour was
covered in e2e — it was not; the e2e never visited `/todo`.

**Fixed:** assertions narrowed to `toHaveClass(...)` with the scope stated
honestly (they catch the class being dropped from markup, nothing more), and a
new `LoadingWrapper overlay` describe block added to
`e2e/loading-accent-color.spec.ts` that loads `/todo` in all three themes and
reads the spinner's computed `color` and the scrim's computed
`background-color`. The two halves are now complementary rather than one
pretending to be both.

### 3. Suspense-fallback backdrop assertion proved nothing
The test read `getComputedStyle(document.body).backgroundColor`. `body` already
carries `background-color: var(--color-background)` from a global rule in
`src/index.css` that this change never touched, so the assertion returned the
same passing result with or without the fix — it never inspected the element
that changed.

**Fixed:** now walks from `.animate-spin` to the fallback wrapper and reads that
element's own `background-color`, plus the label's colour.
**Mutation-verified:** reverting the backdrop to `bg-white` fails all 3 tests.
The old body-based assertion passed under that same mutation.

### 4. Favorites and ProductDetail rings had zero coverage
The e2e only visited `/table` and `/products`. `design.md`'s own Risks section
names forest-Favorites as the specific case to watch — and no test exercised it.

**Fixed:** the ring describe block now covers `/favorites` and `/products/1`
across all three themes, plus an explicit assertion that the Favorites arc is no
longer `--color-error-500/400`.

## MEDIUM — fixed

### Ring track degenerated without `color-mix` support (correctness)
`--color-loading-track` was defined as
`color-mix(in srgb, var(--color-loading-accent) 20%, transparent)`. Lightning
CSS cannot statically resolve a mix whose input is a custom property, so it
emitted a progressive-enhancement fallback of plain
`var(--color-loading-accent)` — making the track **identical to the arc** on any
engine without `color-mix` (Safari <16.4, Chrome <111, Firefox <113). The result
is a uniform ring with no perceptible rotation, which is worse than the
hardcoded gray track it replaced: the indicator stops indicating.

**Fixed:** the track is now an explicit per-theme `rgba()` rather than a derived
mix. Built CSS emits three plain values (`#2b5ff733`, `#6691ff33`, `#4ade8033`)
with no `@supports` pair. The accent remains the single source of truth; the
track is its sibling, declared one line away, with the reason recorded inline so
the next reader does not "simplify" it back into a `color-mix`.

### `.ring-loading` collided with Tailwind's namespace (convention)
Named `.ring-loading` while setting `border-color`, not `box-shadow` — Tailwind's
`ring-*` family is a different mechanism entirely.
**Fixed:** renamed to `.border-loading`, matching the property-first naming of
its neighbours `.bg-scrim` / `.bg-page`.

### Contrast figures in the design doc overstated dark's margin (a11y)
`design.md` and the delta spec cited ≈4.2:1 for the dark accent — that is the
measurement against `--color-background`, but the overlay and scrim paint
`--color-surface`, where the real ratio is **3.49:1**. Still above the 3:1 floor,
but with 0.49 of headroom rather than 1.2.
**Fixed:** both documents now quote surface-measured values (5.14 / 3.49 / 9.02),
state which surface governs, and flag dark as nearly-spent budget. A computed
contrast assertion was added to the e2e so the floor is a tested invariant
rather than a prose claim — pinning RGB alone would let someone change an accent
and "fix" the test by editing the constant, floor breach and all.

### Token-sync convention had no test (test coverage)
The design-tokens delta spec requires theme-adaptive tokens have no static SCSS
twin — a plain file-contents check needing no browser, yet untested.
**Fixed:** `src/assets/styles/__tests__/tokenSync.test.ts` asserts no `$colors`
entry exists, exactly three per-theme declarations exist, the pointer comment is
present, no spinner rule uses a `color()` lookup, and no `[data-theme]` spinner
override survives to defeat the token.

## Iteration 2 — `code-reviewer` findings, all fixed

### W1 + W2. The iteration-1 fix was internally inconsistent
Iteration 1 hardcoded `--color-loading-track` to dodge Lightning CSS's opaque
fallback, but left `.bg-scrim` as a `color-mix` with the **same** fallback shape
— and its degradation is worse: a fully opaque panel that hides the content the
overlay is meant to dim. The change hardcoded to avoid a problem in one place
and left the identical problem in another.

It also contradicted four spec deltas that still mandated the `color-mix`
wording, including a blanket "no hardcoded colour" rule.

**Fixed:** one treatment for both. `--color-loading-track` and a new
`--color-scrim` are per-theme literal `rgba()`; `.bg-scrim` consumes the token.
Built CSS emits six plain values and a single `.bg-scrim` rule with no
`@supports` pair. All four spec deltas updated, and a new requirement
("Translucent loading values are authored as literal rgba") records the
exception with its reason rather than leaving the code silently at odds with
the rule.

### W3. The scrim lightened the page instead of dimming it
`.bg-scrim` mixed over `--color-surface`, but its only consumer sits on
`--color-background` — and in dark/forest the surface is *lighter* than the
background (`#344152` vs `#2b3544`; `#0f2817` vs `#0a1f0f`). The overlay
therefore lightened the page, the opposite of the spec's "legibly dimmed". The
manual pass in task 3.4 missed it because the children are already at
`opacity-20`.

**Fixed:** `--color-scrim` derives from `--color-background`. Re-verified
visually in dark and forest; content now fades toward the page. New spec
requirement "Overlay scrim derives from the page background".

### W4. `.border-loading` violated the spec this change amended
Declared before `.border-primary` and `.border-default` — equal specificity,
same layer — so both generic utilities silently beat it. That is precisely the
failure mode the `design-tokens` delta was amended to forbid.

**Fixed:** moved below `.border-default` (built CSS: 43364 vs 43315), with an
inline comment saying why it must stay there, plus a test asserting the order.

### N1. `border` shorthand made the ring vanish rather than degrade
`border: 4px solid var(--color-loading-track)` — if the token ever failed to
resolve, the shorthand unsets `border-style` too and the ring disappears.
**Fixed:** longhand `border-width` / `border-style` / `border-color` in all
three modules, which degrades to `currentColor` instead.

### §3. `tasks.md` recorded a factually false claim
The note on task 5.4 said "Forest still resolves to the same `#4ade80` it did
before" for Products and ProductDetail. **False.** `$colors` has no
`primary-light` key, so `color(primary-light)` returns `null` and Sass omits the
declaration entirely — verified by compiling it:

```scss
.spinner { border-color: color(primary-900); border-top-color: color(primary-light); }
/* compiles to: .spinner { border-color: #1d3590; } */
```

Forest on those two pages was previously a navy track with a **blue** arc
falling through to the base rule. The claim holds only for Favorites, whose
override used a CSS custom property. **Fixed:** corrected in `tasks.md` with the
compiled evidence, since that is the sentence a future reader would trust.

### Test gaps still open after iteration 1 — fixed
- Fallback tests never asserted `data-theme` on `<html>`; `applyTheme` runs in
  an effect, so the **light** case would have passed even if the theme were
  never applied. Guard added.
- `expect(track.a).toBeLessThan(1)` without a matching `toBeGreaterThan(0)` —
  a fully transparent track would have passed. Added.
- `/todo` used `.animate-spin` `.first()`, which could collide with Todo's
  out-of-scope add-button spinner. Scoped to `.bg-scrim .animate-spin` so the
  isolation is structural.
- Nothing linked a class **name** to its **definition** — the unit tests would
  pass with `.icon-brand` deleted from the stylesheet. `tokenSync.test.ts` now
  asserts each utility is declared and points at the right token, that
  `.border-loading` sits below the generic border utilities, that both
  translucent tokens are literal `rgba` in all three themes, and that no
  unreachable `:global(.dark)` survives in `TableCommon`.

### N2 / N3 — noted, not actioned
- `.icon-brand` drives 13 elements, most of them page-header icons rather than
  loading indicators, and one chart **tooltip value**
  (`SalesDetailsChart/index.tsx:133`). No visual change — the token carries
  exactly the shades the deleted overrides did — but a token named
  `--color-loading-accent` now decides a tooltip's colour, so a future "make
  spinners lighter" would move that text too. A `--color-brand-accent` with
  loading aliasing it would be cleaner. Deferred: NOTE severity, and it would
  mean a fourth revision of four spec files for no behavioural gain.
- `color(error-400)` is **also** a missing key, so the four
  `[data-theme] .errorText` overrides adjacent to the deleted spinner blocks are
  **empty rules** — dark and forest error text silently uses the base colour.
  Left untouched as out of scope, but they are inert rather than working, which
  someone should know before "fixing" them.

## OPEN — needs a decision

### Loading label contrast fails WCAG AA in the light theme
Re-measured after the W3 scrim fix, which changed these numbers. That fix
incidentally **resolved the dark failure** (4.22 → 4.88) and moved light from
passing to failing, because the scrim now composites to the page background
rather than to the lighter surface:

| Pairing (`text-secondary` label) | Iteration 1 | Now | AA (4.5:1) |
|---|---|---|---|
| light — on `#f5f5f7` | 4.75:1 ✅ | **4.44:1** | ❌ |
| dark — on `#2b3544` | 4.22:1 ❌ | 4.88:1 | ✅ |
| forest — on `#0a1f0f` | 11.45:1 ✅ | 12.30:1 | ✅ |

What remains is a single failing pairing: `--color-text-secondary` (`#6b7280`)
on `--color-background` (`#f5f5f7`) in the light theme, at 4.44:1 — 0.06 short.

Two facts shape the decision:

1. **It is one app-wide token pairing, not a loading-specific bug.** Products,
   ProductDetail, and the chart loading labels — all untouched here — already sit
   at exactly the same 4.44:1, as does any light-theme secondary text on the page
   background. Fixing it properly means moving a global token.
2. **This change did regress the route fallback specifically**, 7.56:1 → 4.44:1,
   by moving it off its outlier `text-gray-600`-on-white onto the app-wide
   pattern. That single screen is the part attributable here.

Options considered:
- **A.** Move the loading labels to `.text-primary` (16.29:1 light). Contained,
  but contradicts the delta spec's "loading text stays secondary" and leaves the
  three untouched screens inconsistent with the two fixed ones.
- **B.** Darken `--color-text-secondary` in `:root` (`#6b7280` → `#64748b`,
  5.32:1 on `#f5f5f7`). The real fix — one line, clears every occurrence at once
  — but it is a global token used far beyond loading indicators, so it needs its
  own change with its own visual regression pass.
- **C.** Defer to a dedicated a11y change covering the token and all its
  consumers together.

**Decision: C.** Ships with the shortfall measured and documented rather than
half-fixed. Option B is almost certainly the right eventual answer, and it is
squarely a global-token change, not a loading-colour change — bundling it here
would mean re-verifying every light-theme secondary-text surface in the app
under the banner of a spinner recolour.

## DEFERRED — pre-existing, belongs in its own change

Per the project convention that review-exposed pre-existing bugs get a new
change rather than being bundled:

- **No `role="status"` on either loading indicator** (a11y, MEDIUM ×2). lucide
  correctly marks the icons `aria-hidden`, which leaves the `<p>` as the only
  announceable content — and it sits in no live region, so a screen-reader user
  gets silence for the whole lazy-chunk fetch. Neither component had this before.
- **No `prefers-reduced-motion` policy** across the now-unified spinner set
  (a11y, LOW). The diff removes none — `AppRoutes` keeps its `motion-reduce:`
  variant — but this change is the natural point to give the set one policy.
- **`loadingText = "Loading..."`** hardcoded English default bypassing `t()`
  (convention, LOW).
- **Missing explicit `React.JSX.Element`** on `LoadingWrapper` and
  `LoadingFallback` (convention, LOW).
- **`withAuth` gates on a non-empty token only** — no expiry, signature, or
  shape check, so any localStorage string opens every dashboard route
  (security, LOW). Surfaced by the e2e seed helper, which is itself safe: mock
  auth, localhost-only config, and the same pattern already on `master`.

## Verification after the fix loop

```
yarn lint      18 problems — all pre-existing, none in changed files
yarn tsc -b    clean
yarn test      1930 passed / 152 files
yarn build     ✓ built in 5.53s
yarn test:e2e  32 passed
```

e2e coverage for this change went from 11 tests to 24 during this iteration.
