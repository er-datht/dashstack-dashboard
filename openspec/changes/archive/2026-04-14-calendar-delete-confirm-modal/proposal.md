## Why

The calendar delete action currently uses `window.confirm()`, which renders a browser-native dialog that looks out of place, cannot be themed, and breaks the visual consistency of the application. Replacing it with a custom confirmation modal ensures the delete flow matches the existing theme system (light/dark/forest) and provides a polished user experience.

## What Changes

- Create a reusable `ConfirmModal` component that renders an in-app confirmation dialog with customizable title, message, and button labels
- Replace `window.confirm()` in `EventDetailPopover.tsx` with the new `ConfirmModal`
- Replace `window.confirm()` in `AddEventModal.tsx` with the new `ConfirmModal`
- The modal must support all three themes and use existing design tokens

## Capabilities

### New Capabilities
- `confirm-modal`: A reusable themed confirmation modal component that replaces browser-native `window.confirm()` dialogs

### Modified Capabilities

## Impact

- `src/pages/Calendar/EventDetailPopover.tsx` — remove `window.confirm`, add confirm modal state
- `src/pages/Calendar/AddEventModal.tsx` — remove `window.confirm`, add confirm modal state
- New file: `src/pages/Calendar/ConfirmModal.tsx` — the confirmation modal component
- `src/pages/Calendar/Calendar.module.scss` — add styles for the confirm modal
- No new dependencies required; uses existing styling patterns (modalOverlay, modalCard)
