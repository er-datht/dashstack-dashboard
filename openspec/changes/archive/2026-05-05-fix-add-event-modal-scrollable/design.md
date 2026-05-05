## Context

`AddEventModal.tsx` renders a full-page overlay (`.modalOverlay`) with a centered card (`.modalCard`) that holds an `<h2>` title and a `<form>` containing all event fields plus an inline action row at the bottom. Today `.modalCard` declares `max-width: 480px; padding: 24px; flex-direction: column; gap: 20px` and **no height constraint**. When the form's natural height exceeds the viewport, the card overflows the bottom of the screen with no scroll affordance — the action buttons become unreachable. The overlay itself uses `display: flex; align-items: center` so an overflowing card pushes its content past the viewport edge in both directions.

The component already locks `document.body.style.overflow = "hidden"` while open and runs a focus trap over `modalRef.current.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])')`. The selectors are flat-DOM, so wrapping fields in a scroll container does not affect tab order.

## Goals / Non-Goals

**Goals:**
- Bound the modal card to the viewport so action buttons are always reachable.
- Keep header and footer always visible; scroll only the form fields between them.
- Preserve every existing behavior (focus trap, Escape, body-scroll lock, native form submit, image upload, participant input, theme awareness).

**Non-Goals:**
- Visual refresh of the modal (typography, spacing, colors).
- Mobile-specific padding or breakpoint tweaks.
- Scroll-position-aware shadow effects on the dividers.
- Touching `ConfirmModal` or any other modal in the app.
- Rewriting the focus trap or any other modal a11y plumbing.

## Decisions

### Decision 1: Cap card at `90vh`, not a fixed pixel value
- **Choice**: `max-height: 90vh` on `.modalCard`.
- **Why**: Scales with the user's viewport; leaves a 5vh margin top/bottom so the card visually breathes. A fixed pixel value (e.g., `640px`) would either over-clip on tall screens or still overflow on short ones.
- **Alternative considered**: `max-height: calc(100vh - 48px)` — equivalent at common breakpoints but less readable; `90vh` is the conventional pattern in this codebase's existing modals.

### Decision 2: Three-region flex layout, footer stays inside `<form>`
- **Choice**: `.modalCard` is the height-bounded flex column. The card's direct children are: `<h2>` (header), a new `<div>` wrapping the form, where the form itself splits into a scrollable middle region (`.modalBody`) plus a sticky footer (`.modalFooter`) — both kept inside the `<form>` so the Save button submits natively.
- **Why**: Keeping the footer inside the `<form>` avoids `form="…"` plumbing on the submit button and is a smaller diff. The form becomes the flex container for body+footer; the body gets `overflow-y: auto; flex: 1 1 auto; min-height: 0`.
- **Alternative considered**: Lift the action row out of the `<form>` and reference it via the HTML `form` attribute. Cleaner separation but more change for no behavioral benefit.

### Decision 3: Always-on 1px dividers, not scroll-aware
- **Choice**: `.modalHeader` gets `border-bottom: 1px solid var(--color-border)`; `.modalFooter` gets `border-top: 1px solid var(--color-border)`.
- **Why**: Provides clear visual separation regardless of scroll position. Scroll-aware shadows would require a `scroll` listener and `useState`, adding complexity for marginal polish.
- **Alternative considered**: No dividers — fine when content doesn't scroll, but ambiguous when it does. Always-on dividers communicate the structure consistently.

### Decision 4: Use `var(--color-border)` for theme adaptation
- **Choice**: Reference the existing CSS custom property rather than hardcoding a color or branching per theme.
- **Why**: The token is already defined for all three themes (light/dark/forest) and matches every other divider in the app.

### Decision 5: Reset card `gap`, restore field gap inside `.modalBody`
- **Choice**: Drop `gap: 20px` from `.modalCard`. Move equivalent vertical rhythm onto `.modalBody` (which still wraps form fields). Header and footer get explicit padding instead of relying on the card's gap.
- **Why**: With the three-region structure, the card's gap would push the header away from the top edge and create a visible seam at the divider. Per-region padding keeps the dividers flush with the card edges.

## Risks / Trade-offs

- **Risk**: `min-height: 0` is required on flex children to allow `overflow-y: auto` to actually scroll. Forgetting it produces a card that grows past `90vh`. → **Mitigation**: include `min-height: 0` on both `.modalCard` (as a flex child of `.modalOverlay`) and `.modalBody` (as a flex child of the form), and explicitly reference this in `tasks.md`.
- **Risk**: Changing the card from a single flex column with gap to three regions could shift the visual rhythm by a few pixels. → **Mitigation**: keep header/footer at 24px padding (matches the card's existing padding) and the body at 24px horizontal + 20px vertical gap between fields, preserving the original 20px field-to-field rhythm.
- **Risk**: Focus trap selectors run against `modalRef.current` (the card). Sticky positioning does not change DOM order, so the trap still sees fields and buttons in document order. → **Mitigation**: no code change to the trap; manual smoke test through Tab/Shift-Tab during verification.
- **Risk**: On very short viewports (e.g., 400px), `90vh` may still be tight for some `<input>` interactions (e.g., a native date picker popping up). → **Mitigation**: out of scope for this fix — current behavior on short viewports is "buttons unreachable", and the new behavior is "buttons reachable, fields scrollable", which is strictly better.
