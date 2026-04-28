## 1. Types and mock data

- [x] 1.1 Add `DeliveredMessage` type to `src/types/inbox.ts` (id, senderEmail, senderName, recipientEmail, subject, body, sentAt)
- [x] 1.2 Add optional `senderEmail?: string` field to `EmailRecord` in `src/pages/Inbox/mockData.ts`
- [x] 1.3 Populate `senderEmail` on all `mockEmailRecords` with plausible mock emails (e.g., `ethan.rodriguez@example.com`)

## 2. ChatInput — controlled input with onSend

- [x] 2.1 Add `useState` for input value and an `onSend: (text: string) => void` prop to `ChatInput`
- [x] 2.2 Wire Send button click to trim input, guard against empty/whitespace, call `onSend`, and clear input
- [x] 2.3 Wire Enter key to the same send logic (replace current "Coming soon" toast on Enter)
- [x] 2.4 Keep mic/paperclip/image icons calling `onShowToast` with "Coming soon" (verify intact)

## 3. ChatView — pass onSend through and add auto-scroll

- [x] 3.1 Add `onSendMessage: (text: string) => void` prop to `ChatView` and pass it to `ChatInput` as `onSend`
- [x] 3.2 Add a `useRef` sentinel div at the bottom of the messages area and `useEffect` that scrolls it into view when `messages.length` changes

## 4. index.tsx — chat message state and cross-user delivery

- [x] 4.1 Add `useLocalStorage<DeliveredMessage[]>` for `inbox-delivered-messages`
- [x] 4.2 Add `useState<Message[]>` for conversation messages, initialized from `mockMessages` or sent-message array
- [x] 4.3 Create `deliverMessage` helper that reads `getStoredUser()`, constructs a `DeliveredMessage`, and appends to the delivered messages localStorage array
- [x] 4.4 Create `handleChatSend(text: string)` that: (a) constructs a `Message` for local display, (b) appends to conversation state, (c) calls `deliverMessage` with the selected record's `senderEmail` as recipient
- [x] 4.5 Extend `handleComposeSend` to also call `deliverMessage` with the composed message's `recipientEmail`
- [x] 4.6 Pass `onSendMessage={handleChatSend}` to `ChatView` in the render block

## 5. index.tsx — load received messages into inbox

- [x] 5.1 When inbox folder is active, filter `inbox-delivered-messages` for `recipientEmail === getStoredUser().email`
- [x] 5.2 Convert filtered `DeliveredMessage` entries to `EmailRecord` format (senderName, senderEmail, subject, time)
- [x] 5.3 Prepend received message records to the mock records in the message list

## 6. Verify

- [x] 6.1 Test chat send via button click — message appears as right-aligned blue bubble
- [x] 6.2 Test chat send via Enter key — same behavior
- [x] 6.3 Test empty and whitespace-only input — silently ignored
- [x] 6.4 Test auto-scroll — chat scrolls to bottom on send
- [x] 6.5 Test mic/paperclip/image icons still show "Coming soon" toast
- [x] 6.6 Test cross-user delivery: user A sends to user B's email via chat → log out → log in as user B → message appears in inbox
- [x] 6.7 Test cross-user delivery via ComposeView: compose to user B → log in as user B → message in inbox
- [x] 6.8 Test that delivered messages survive logout (localStorage key not cleared)
- [x] 6.9 Test all three themes (light, dark, forest) — sent bubble and inbox row styling correct
