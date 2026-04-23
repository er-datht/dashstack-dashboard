## 1. Types and Data Layer

- [x] 1.1 Add `SentMessage` type to `src/types/inbox.ts` with fields: id, recipientEmail, subject, body, sentAt
- [x] 1.2 Add localStorage helpers in Inbox index: read/write `"inbox-sent-messages"` array using the existing `useLocalStorage` hook

## 2. ComposeView Component

- [x] 2.1 Create `src/pages/Inbox/ComposeView.tsx` with header (title + X close button), three form fields (To, Subject, Body textarea), and footer (Cancel + Send buttons)
- [x] 2.2 Add inline validation: highlight empty required fields with error border on send attempt; clear errors on field change
- [x] 2.3 Implement Send handler: validate → create SentMessage record → persist to localStorage → show toast → close compose
- [x] 2.4 Ensure full theme support (light/dark/forest) using Tailwind utility classes and CSS custom properties
- [x] 2.5 Add aria-label on close button, associate labels with form fields for accessibility

## 3. Inbox Integration

- [x] 3.1 Add `showCompose` state to Inbox index; wire "+ Compose" sidebar button to set `showCompose = true` and clear `selectedRecord`
- [x] 3.2 Update right-panel conditional render: showCompose → ComposeView, selectedRecord → ChatView, else → MessageList
- [x] 3.3 Pass `onClose` and `onSend` callbacks from Inbox to ComposeView; onSend appends to localStorage and shows toast

## 4. Sent Folder Integration

- [x] 4.1 When `activeFolder === "sent"`, convert localStorage sent messages to EmailRecord format and pass to MessageList instead of mock records
- [x] 4.2 Make Sent folder count dynamic in sidebar: pass `folderCountOverrides` with sent count from localStorage length
- [x] 4.3 Ensure Sent folder works with search and pagination (existing MessageList features)

## 5. Internationalization

- [x] 5.1 Add compose-related keys to `public/locales/en/inbox.json`: compose section (newMessage, to, toPlaceholder, subject, subjectPlaceholder, body, bodyPlaceholder, send, cancel, close, messageSent, fieldRequired)
- [x] 5.2 Add matching Japanese translations to `public/locales/jp/inbox.json`

## 6. Update InboxSidebar

- [x] 6.1 Update `InboxSidebar` props to accept an `onCompose` callback instead of showing "Coming soon" toast on Compose button click
