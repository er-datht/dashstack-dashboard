## Context

The calendar page uses `window.confirm()` in two places to confirm event deletion: once in the `EventDetailPopover` (grid click) and once in `AddEventModal` (edit mode). The native browser dialog cannot be styled, does not respect the app's theme system, and feels jarring compared to the rest of the UI.

The app already has a modal pattern established in `AddEventModal` — an overlay (`modalOverlay`) with a centered card (`modalCard`), focus trapping, Escape to close, and body scroll lock. The confirmation modal should reuse these patterns.

## Goals / Non-Goals

**Goals:**
- Replace all `window.confirm()` calls in the calendar feature with a custom themed modal
- Create a self-contained `ConfirmModal` component co-located with calendar components
- Support all three themes (light/dark/forest) using existing CSS custom properties
- Maintain accessibility: focus trap, keyboard navigation, proper ARIA attributes

**Non-Goals:**
- Creating a global/shared confirmation modal — scope is calendar-only for now
- Adding animation/transitions to the modal
- Changing any delete logic — only the confirmation UI changes

## Decisions

### 1. Self-contained component with local state management

Each consumer (`EventDetailPopover` and `AddEventModal`) will manage its own `showConfirm` boolean state. When the delete button is clicked, it sets `showConfirm = true` instead of calling `window.confirm()`. The `ConfirmModal` receives `onConfirm` and `onCancel` callbacks.

**Why over a shared context/hook approach**: The two consumers are independent and simple. Local state keeps the component self-contained with no new abstractions.

### 2. Reuse existing SCSS module classes with z-index 60

The modal will add a `confirmOverlay` class based on `modalOverlay` but with `z-index: 60` (above both the modal overlay at 50 and the popover at 40). Additional minimal styles in `Calendar.module.scss` for the confirm-specific card (smaller max-width, centered text, danger button).

**Why over new SCSS module**: Keeps styles co-located with the feature and avoids file proliferation for a small component.

### 4. Popover flow: close popover, then show confirm

When delete is triggered from EventDetailPopover, the popover closes first and the confirm modal state is lifted to the parent Calendar component. This avoids z-index conflicts and outside-click handler interference between the popover and the confirm overlay.

**Why over keeping popover open**: The popover's outside-click handler would detect the confirm overlay click as "outside" and close the popover prematurely. Closing first is simpler and avoids edge cases.

### 5. Initial focus on Cancel button

The Cancel button receives initial focus when the confirm modal opens. This prevents accidental deletion from keyboard users pressing Enter reflexively.

**Why**: Standard accessibility best practice for destructive confirmation dialogs.

### 3. Component co-located in Calendar directory

The `ConfirmModal.tsx` file will live in `src/pages/Calendar/` alongside the other calendar components.

**Why over `src/components/`**: The component is only used within the calendar feature currently. If reuse is needed later, it can be promoted.

## Risks / Trade-offs

- [Duplication if other features need confirm dialogs] → Acceptable for now; component can be lifted to `src/components/` later without breaking changes.
- [EventDetailPopover must keep its own confirm state] → The popover already manages its own lifecycle; adding one boolean is minimal complexity.
