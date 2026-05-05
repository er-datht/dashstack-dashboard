## Context

The Product Detail page currently renders the wishlist toggle as an icon-only `<button>` inside `.actionBar` (`src/pages/ProductDetail/index.tsx:272-292`), sized as a square via `.actionButtonIconOnly`, with `aria-label` + `title` both driven by `wishlistLabel` (computed at lines 152–155). The action bar's other child is the Edit `<Link>` (Pencil + "Edit" text).

This change relocates the wishlist `<button>` out of the action bar and into the gallery container as an absolute-positioned overlay, mirroring the e-commerce convention of a corner-anchored favorite heart. The action bar then contains only the Edit control.

Existing gallery infrastructure already provides the foundation:

- `.galleryContainer` (`ProductDetail.module.scss:130`) has `position: relative; overflow: hidden`, supports absolute children, and renders rounded corners.
- `.galleryArrow` (lines 180–208) defines the canonical overlay shell: 40×40 circle, `rgba(255, 255, 255, 0.95)` background, drop shadow, transition, hover scale, and per-theme overrides at `[data-theme="dark"]` (lines 409–416) and `[data-theme="forest"]` (lines 454–461) that re-tint the bg + icon color.
- The gallery currently has prev/next arrows at `top: 50%; left/right: 12px` and dots at `bottom: 12px`, leaving the top corners free.

The existing `.actionButtonIconOnly` modifier (added earlier in this change at lines 323–325 of the SCSS module) becomes dead code once the wishlist button leaves the action bar.

Existing wishlist tests at `src/pages/ProductDetail/__tests__/ProductDetail.test.tsx:429-485` query the wishlist button via `getByRole('button', { name: <i18n key> })` keyed off `aria-label`, NOT via parent traversal — they survive the relocation unchanged. No existing assertion ties the button to the action bar parent.

## Goals / Non-Goals

**Goals:**

- Render the wishlist toggle as a corner overlay anchored to the top-right of the gallery image, with `top: 12px; right: 12px` to mirror the 12px inset of the existing gallery arrows.
- Visually integrate the overlay with the gallery layer by reusing the gallery-arrow shell pattern (circular shape, translucent bg, drop shadow, transition, per-theme overrides).
- Size the overlay 32×32 (smaller than the 40×40 navigation arrows) — it's a state toggle, not navigation, so a less-prominent footprint is appropriate.
- Render the overlay in BOTH single-image and multi-image gallery branches (it's a per-product affordance independent of carousel navigation).
- Preserve the existing `aria-label`, `title`, heart fill behavior, and click-to-toggle behavior verbatim — only the DOM position and surrounding CSS shell change.
- Keep the focus ring visible despite `.galleryContainer { overflow: hidden }`.

**Non-Goals:**

- Modifying the Edit button (out of scope — stays as Pencil + "Edit" `<Link>` in the action bar).
- Modifying the gallery prev/next arrows or dot indicators.
- Adding a tooltip library — the existing `title` attribute remains the hover affordance.
- Changing i18n keys, copy, or the heart's color tokens.
- Animating the overlay's appearance (it's just a static absolute element). The hover scale is the only motion.

## Decisions

### Decision 1 — Place the overlay as a sibling of `<Slider>` / single-image wrapper / `.galleryDots`, NOT inside slick slides

The overlay is rendered as the **last child of `.galleryContainer`**, after both the gallery branches (`<Slider>` for multi-image, raw `<div>` for single-image) and the `.galleryDots` container.

**Why not inside slick slides**: slick clones, transforms, and reorders slide DOM internally — placing the wishlist button inside a slide would (a) visually duplicate it once per slide, (b) risk slick's transform clipping, and (c) couple our overlay to slick's rendering lifecycle. Hosting at the `.galleryContainer` level keeps it independent of the carousel.

**Why last child**: ensures DOM-order stacking puts the overlay above the dots in the natural cascade. Combined with explicit `z-index: 6` (Decision 4), the overlay reliably reads above all gallery layers.

### Decision 2 — Reuse the `.galleryArrow` shell pattern via a new `.galleryWishlistOverlay` class

Create a sibling SCSS class `.galleryWishlistOverlay` defined directly below `.galleryArrowPrev` in the SCSS module. The class mirrors `.galleryArrow`'s shell — circular shape (`border-radius: 50%`), `rgba(255, 255, 255, 0.95)` background, drop shadow, transition timing, and centered flex content — but differs in:

- **Position**: `top: 12px; right: 12px` (corner anchored), no `transform: translateY(-50%)` (not vertically centered).
- **Size**: `width: 32px; height: 32px` (Decision 3).
- **Hover transform**: `scale(1.05)` only — no translateY component (Decision 5).
- **Z-index**: `z-index: 6` (Decision 4).
- **Focus**: `outline-offset: -2px` to keep the focus ring inside the rounded gallery's `overflow: hidden` clip (Decision 6).

Add per-theme overrides under the existing `[data-theme="dark"]` and `[data-theme="forest"]` blocks, matching the theme-specific bg + color values used for `.galleryArrow`. This guarantees visual parity with the navigation arrows in all three themes.

**Alternatives considered:**

- *Reuse `.galleryArrow` directly via a new modifier (e.g., `.galleryArrow.galleryArrowWishlist`)*: rejected — couples wishlist styling to the navigation-arrow class, and the wishlist button is semantically NOT a navigation arrow. A sibling class with shared shell properties is clearer.
- *Apply Tailwind utilities inline*: rejected — gallery-layer styling is consistently SCSS-module in this file; fragmenting it would harm readability and theme consistency.

### Decision 3 — 32×32 overlay (vs 40×40 gallery arrows)

The overlay is sized 32×32 — smaller than the 40×40 prev/next arrows. Rationale: navigation arrows demand attention because they're the primary mechanism for browsing images; a state-toggle heart needs to be present and tappable but should not visually compete with content or with the navigation controls. 32×32 with a 16×16 heart icon (`w-4 h-4`) provides a 44×44 effective tap target after the surrounding inset, which still satisfies the WCAG 2.5.5 minimum target size guidance for primary controls.

### Decision 4 — Explicit `z-index: 6` on the overlay

`.galleryArrow` and `.galleryDots` both use `z-index: 5`. Setting the wishlist overlay to `z-index: 6` makes its layering intent explicit and survives any future DOM reordering that might place dots after the overlay. Defensive over implicit reliance on DOM order.

### Decision 5 — Hover transform: `scale(1.05)` (vs the arrows' `scale(1.1)`)

The gallery arrows use `transform: translateY(-50%) scale(1.1)` to remain vertically centered while emphasizing the hover state. The wishlist overlay isn't vertically centered, so `translateY` is dropped. Scale is reduced to `1.05` — a state toggle's hover should be subtle, not theatrical. Mirrors the lighter hover affordance typical of favorite-heart controls in production e-commerce sites.

### Decision 6 — `outline-offset: -2px` to preserve focus visibility inside `overflow: hidden`

`.galleryContainer` uses `overflow: hidden` to keep slick rails inside the rounded-corner clip. A standard outward `:focus-visible` outline on the wishlist overlay would be clipped at the gallery edge, especially at `top: 12px; right: 12px` where the outline crosses the corner radius. Solution: an inset ring via `outline-offset: -2px` on the overlay's `:focus-visible` state. Trade-off: slightly less prominent than an outward ring, but reliably visible across all themes and fully accessible.

**Alternative considered**: change `.galleryContainer` to `overflow: visible`. Rejected because it would also un-clip the slick rails (visible scroll edges during slide transitions) and the existing rounded-corner image clipping. Inset ring is the targeted fix.

### Decision 7 — Delete the now-unused `.actionButtonIconOnly` SCSS class

The `.actionButtonIconOnly` modifier (added earlier in this same change at `ProductDetail.module.scss:323-325`) was specifically to make the wishlist button a square hit-target while it lived in the action bar. Once the wishlist button leaves the action bar, the class has no consumers in the codebase. Deleting it keeps the SCSS module honest. This is a delete within the same change, not a separate cleanup task — it was always provisional.

### Decision 8 — Test pinning: add a single descendant assertion

Existing wishlist tests at lines 429–485 query by `aria-label` via `getByRole`, not by parent. They're unaffected by the relocation. The relocation adds ONE new contract: the wishlist button must be a descendant of the gallery container, NOT of the action bar. Add an assertion using `closest('[class*="galleryContainer"]')` (CSS-modules-friendly partial-match selector) to lock this in. Existing `title`, `not.toHaveTextContent`, and click-to-toggle assertions all stay verbatim.

## Risks / Trade-offs

- **[Risk]** On forest theme, the unwishlisted gray-outline heart on a dark gallery could be hard to distinguish at a glance. → **Mitigation**: the white-translucent overlay shell sits between the heart and the dark gallery bg, so the heart always renders on a light background. The dark/forest theme overrides re-tint that shell for theme parity.
- **[Risk]** Users habituated to seeing the wishlist text label may not immediately recognize the corner heart as a toggle. → **Mitigation**: hover `title` surfaces the same i18n label; heart fill state visually distinguishes wishlisted vs not. This corner-overlay heart is the dominant convention in e-commerce product pages, so user-recognition cost is low.
- **[Risk]** The overlay's `z-index: 6` could conflict with future gallery additions (e.g., zoom controls). → **Mitigation**: explicit z-index in code makes future ordering decisions easy. If conflicts arise, the gallery z-index stack is documented at one location.
- **[Trade-off]** Inset focus ring (`outline-offset: -2px`) is slightly less visually prominent than a standard outward ring. → Accepted — `aria-label` + `title` provide the primary accessibility hooks; the inset ring still meets WCAG focus-visibility requirements at all three themes.
- **[Trade-off]** Wishlist now sits visually distant from the Edit control. → Accepted — they're not paired actions (one is a state toggle, the other is a navigation/edit primary), so visual decoupling is appropriate.

## Migration Plan

Not applicable — UI refinement on an internal admin app, no API surface, no persisted state changes, no feature flag needed. The relocation ships in a single commit alongside the icon-only conversion (same change).
