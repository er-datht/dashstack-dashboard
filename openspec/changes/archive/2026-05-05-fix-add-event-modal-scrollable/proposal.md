## Why

The "Add New Event" / "Edit Event" modal has no height bound. On viewports shorter than the form content, the bottom of the modal — including the Cancel/Save action buttons — is clipped off-screen with no way to reach it. Users cannot save or cancel without resizing the window.

## What Changes

- Cap `.modalCard` at `max-height: 90vh` so the card never touches viewport edges.
- Restructure the card into three flex regions: header band (existing `<h2>` title), scrollable body (form fields), sticky footer (existing action buttons inside the `<form>`).
- Add 1px theme-aware (`var(--color-border)`) bottom-divider on the header and top-divider on the footer.
- Footer remains inside the `<form>` element to preserve native submit behavior.
- All three themes (light/dark/forest) inherit the divider color from the existing token; no per-theme overrides.
- No changes to focus trap, Escape handler, body-scroll lock, validation, or any field-level behavior.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `calendar-add-event`: add a requirement for viewport-bound modal height with a scrollable body and sticky header/footer.

## Impact

- `src/pages/Calendar/AddEventModal.tsx` — wrap form fields in a new scroll container; markup-only change.
- `src/pages/Calendar/Calendar.module.scss` — adjust `.modalCard`; add `.modalHeader`, `.modalBody`, `.modalFooter` rules.
- `openspec/specs/calendar-add-event/spec.md` — gain one new requirement (delta-add).
- No new dependencies, no API/route changes, no behavioral changes to event creation/editing logic.
