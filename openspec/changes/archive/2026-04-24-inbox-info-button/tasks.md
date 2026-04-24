## 1. i18n Keys

- [x] 1.1 Add info modal translation keys to `public/locales/en/inbox.json` (title, field labels, close button, selected count)
- [x] 1.2 Add info modal translation keys to `public/locales/jp/inbox.json`

## 2. InfoModal Component

- [x] 2.1 Create `src/pages/Inbox/InfoModal.tsx` with props: `isOpen`, `onClose`, `data` (sender, subject, label, time, starred, folder, selectedCount). Render overlay + card with metadata fields, close button, label badge, star indicator. Include focus trap, escape key, overlay click dismiss, body scroll lock, ARIA attributes (`role="dialog"`, `aria-modal`, `aria-labelledby`). Support all 3 themes via CSS custom properties.

## 3. Wire Up MessageList Info Button

- [x] 3.1 Update `src/pages/Inbox/MessageList.tsx`: replace "Coming soon" toast for info button with an `onShowInfo` callback prop. Guard with `selectedIds.size === 0` check (show "No messages selected" toast). Call `onShowInfo` with selected record data when messages are selected.

## 4. Wire Up ChatHeader Info Button

- [x] 4.1 Update `src/pages/Inbox/ChatHeader.tsx`: replace "Coming soon" toast for info button with an `onShowInfo` callback prop. Call `onShowInfo` with current conversation metadata.

## 5. Inbox Page State Integration

- [x] 5.1 Update `src/pages/Inbox/index.tsx`: add `infoModalData` state, create handler functions for MessageList and ChatHeader `onShowInfo` callbacks, render InfoModal with state-driven props.
