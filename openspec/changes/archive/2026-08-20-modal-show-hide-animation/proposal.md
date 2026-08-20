## Why

The Calendar "Add New Event" modal and the shared `ConfirmModal` both appear and disappear instantly — they early-return `null` the moment `isOpen` flips, so there is no visual transition in either direction. The abrupt pop-in/pop-out makes the dialogs feel unpolished next to the rest of the app, which already animates its dropdowns (`usermenu-enter` in `src/index.css:851`) and ships a full set of unused enter keyframes in `src/assets/styles/_globals.scss`. Adding a fade + scale transition on show and hide brings the modals in line with that existing motion vocabulary.

## What Changes

- **Enter animation** — when a modal opens, the overlay fades `opacity: 0 → 1` and the card animates `opacity: 0 → 1` with `transform: scale(0.95) translateY(8px) → scale(1) translateY(0)` over 200ms `ease-out`.
- **Exit animation** — when a modal closes, both reverse over 150ms `ease-in`. This is the substantive part of the change: today the component unmounts synchronously, so the DOM node must now be retained for the duration of the exit before being removed.
- **Deferred unmount** — `AddEventModal` and `ConfirmModal` each gain internal render-state so a `true → false` transition on `isOpen` plays the exit animation before the node leaves the DOM. The public props of both components are unchanged, and no caller is modified.
- **Uniform close paths** — Escape, overlay/backdrop click, the Cancel button, and (for `AddEventModal`) a successful Save all route through the same exit animation. No close path skips it.
- **Body scroll-lock timing fix** — the `document.body.style.overflow` release moves from "when `isOpen` becomes false" to "when the node actually unmounts", so the scrollbar does not reappear mid-exit and shove the animating card sideways.
- **`prefers-reduced-motion: reduce` support** — establishes the project's first reduced-motion handling (there is currently none anywhere in `src/`). Under reduced motion the modals appear and disappear effectively instantly, and critically still unmount.
- **Accepted side effect (explicitly chosen)** — `ConfirmModal` is shared, so the ProductStock row-delete confirmation (`src/pages/ProductStock/index.tsx:260`) and the Calendar page-level delete confirmation (`src/pages/Calendar/index.tsx:342`) also become animated. This was preferred over the visual mismatch of an animated modal spawning an instant-appearing one.

Not breaking: both components keep their existing `ConfirmModalProps` / `AddEventModalProps` shapes, and a first render with `isOpen={false}` still renders nothing at all.

## Capabilities

### New Capabilities

- `modal-animation`: The shared show/hide animation contract for the app's modal dialogs — enter/exit timing and transforms, the deferred-unmount guarantee, uniform treatment of every close path, re-entrancy when a modal is reopened mid-exit, `prefers-reduced-motion` behavior, and theme independence across light/dark/forest.

### Modified Capabilities

- `confirm-modal`: The "Body scroll is locked" requirement changes — the lock is now released on unmount rather than when `isOpen` goes false, and the existing `[aria-modal="true"]` handoff guard must account for an *exiting* sibling modal still being present in the DOM. The cancel/confirm "the modal closes" scenarios now mean "begins its exit animation, then unmounts". Focus restoration to the previously-focused element is re-timed accordingly.
- `calendar-add-event`: The AddEventModal viewport-bound-height requirement gains a constraint — the new `scale()` transform on the card must not disturb the `max-height: 90vh` flex column, its sticky header/footer, or the scrollable body's `overflow-y: auto`. Adds the guarantee that in-progress form values remain visible through the exit rather than flashing empty.

## Impact

**Modified code**

- `src/pages/Calendar/AddEventModal.tsx` — deferred unmount; scroll-lock and focus-trap effects re-keyed off internal render state instead of the `isOpen` prop.
- `src/pages/Calendar/Calendar.module.scss` — enter/exit keyframes and animation classes for `.modalOverlay` / `.modalCard`; reduced-motion block.
- `src/components/ConfirmModal/index.tsx` — same deferred-unmount treatment; preserve the `[aria-modal="true"]` scroll-lock handoff.
- `src/components/ConfirmModal/ConfirmModal.module.scss` — parallel keyframes and classes for `.confirmOverlay` / `.confirmCard`.

**Callers — unchanged, but behavior shifts**

- `src/pages/Calendar/index.tsx:320` (AddEventModal), `:342` (ConfirmModal) — both already pass `isOpen` and keep the component mounted, so no edits needed.
- `src/pages/ProductStock/index.tsx:260` (ConfirmModal) — same; inherits the animation.

**Tests**

- `src/components/ConfirmModal/__tests__/ConfirmModal.test.tsx:53` asserts `expect(container).toBeEmptyDOMElement()` for an initial `isOpen={false}` render. Deriving initial render-state from `isOpen` keeps this green; it must not regress.
- No test file exists for `AddEventModal` today; one is needed for the deferred-unmount behavior.
- `src/pages/ProductStock/__tests__/ProductStock.test.tsx` opens the ConfirmModal (`:100`) — opening is unaffected, but any close assertions need review.

**Dependencies**: none added. Pure CSS animation plus local component state; no animation library, no new packages, no external code.

**Out of scope**: `EventDetailPopover` and every other overlay, dropdown, or toast in the app.
