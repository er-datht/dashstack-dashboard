## 1. Translation Keys

- [x] 1.1 Add `modal.confirmDeleteTitle` key to `public/locales/en/calendar.json` ("Delete Event")
- [x] 1.2 Add `modal.confirmDeleteTitle` key to `public/locales/jp/calendar.json` ("イベントの削除")
- [x] 1.3 Add `modal.confirmDeleteTitle` key to `public/locales/ko/calendar.json` ("이벤트 삭제")

## 2. ConfirmModal Component

- [x] 2.1 Create `src/pages/Calendar/ConfirmModal.tsx` with props: `isOpen`, `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`
- [x] 2.2 Implement overlay (z-index: 60), centered card, title heading, message text, cancel and confirm buttons using existing theme-aware classes and CSS custom properties; confirm button styled as danger action
- [x] 2.3 Add confirm-modal-specific styles to `Calendar.module.scss` (overlay z-index 60, smaller card max-width, danger-styled confirm button)
- [x] 2.4 Implement accessibility: `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` on title, `aria-describedby` on message, focus trap (Tab/Shift+Tab), Escape to cancel, body scroll lock, initial focus on Cancel button

## 3. Integrate into EventDetailPopover

- [x] 3.1 Lift delete confirmation to parent Calendar component: add `deleteConfirmEvent` state to track which event needs delete confirmation
- [x] 3.2 When popover delete is clicked, close the popover and set `deleteConfirmEvent` to the event
- [x] 3.3 Render `ConfirmModal` in Calendar index.tsx; on confirm call delete handler, on cancel clear `deleteConfirmEvent`

## 4. Integrate into AddEventModal

- [x] 4.1 Add `showConfirm` state to `AddEventModal`
- [x] 4.2 Replace `window.confirm()` call with `setShowConfirm(true)` on delete button click
- [x] 4.3 Render `ConfirmModal` inside `AddEventModal`; on confirm call `onDelete(editEvent.id)`, on cancel set `showConfirm(false)`

## 5. Verify

- [x] 5.1 Test delete confirmation flow from EventDetailPopover in all three themes
- [x] 5.2 Test delete confirmation flow from AddEventModal in all three themes
- [x] 5.3 Test keyboard interaction: Escape to cancel, Tab focus trap, initial focus on Cancel button
