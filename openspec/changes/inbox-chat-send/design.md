## Context

The Inbox chat view (`ChatView`) displays a conversation as message bubbles and has a `ChatInput` component at the bottom. Currently `ChatInput` is fully rendered (text input, action icons, Send button) but all interactions show a "Coming soon" toast.

The app has a mock auth system — `getStoredUser()` returns `{ name, email, role }` for the current logged-in user. Users register/login via the Login/Register pages, and user data is stored in localStorage under `auth_user`.

The existing send flow in ComposeView saves to `inbox-sent-messages` (sender's Sent folder) but does not deliver to the recipient. The user wants cross-user messaging: when user A sends to user B, user B should see the message in their inbox.

Key current state:
- `ChatInput` is uncontrolled — no React state for the input value, no `onSend` callback
- `ChatView` receives `messages` as a read-only prop with no mechanism to append
- `index.tsx` computes `chatMessages` from either `mockMessages` or `sentMessages` on each render
- `EmailRecord` has `senderName` but no email field — chat recipient email is not available
- `handleComposeSend` saves to `inbox-sent-messages` only (sender-side)

## Goals / Non-Goals

**Goals:**
- Make the Send button and Enter key functional in `ChatInput`
- Deliver messages cross-user: both ComposeView and ChatInput create a `DeliveredMessage` in localStorage that the recipient sees in their inbox
- Sender identity from `getStoredUser()` — sender's name and email are captured at send time
- Auto-scroll the chat area to show the new message
- Received messages appear as new rows in the recipient's inbox message list

**Non-Goals:**
- No real-time sync (recipient must reload/re-login to see new messages)
- No multi-line input (keep single-line `<input>`)
- No attachment functionality (mic/paperclip/image stay "Coming soon")
- No per-contact conversation isolation (mock inbox records still share `mockMessages`)
- No read/unread status management for delivered messages
- No notification of new messages

## Decisions

### 1. Cross-user storage: single `inbox-delivered-messages` localStorage key

Store all delivered messages in a single `inbox-delivered-messages` localStorage key as a `DeliveredMessage[]` array. Each message has `senderEmail`, `senderName`, `recipientEmail`, `subject`, `body`, `sentAt`. When loading inbox, filter by `recipientEmail === currentUser.email`.

**Why:** A single key is simpler than per-user keys (`inbox-messages-{email}`). The filter is trivial and the data volume in a demo app is small. It also lets us easily query both sent and received messages from one place if needed later.

**Alternative considered:** Per-user localStorage keys — rejected as unnecessarily complex for a mock app, and harder to debug/inspect.

### 2. New `DeliveredMessage` type

```typescript
type DeliveredMessage = {
  id: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
};
```

**Why:** This is the minimal shape for cross-user delivery. It's intentionally separate from `SentMessage` (sender-side) and `Message` (chat display) — each serves a different purpose. Conversion to `EmailRecord` format for the message list is straightforward.

### 3. Both ComposeView and ChatInput deliver to recipient

**ComposeView:** `handleComposeSend` already has `recipientEmail`, `subject`, `body`. Extend it to also append a `DeliveredMessage` to `inbox-delivered-messages` using `getStoredUser()` for sender info.

**ChatInput:** The chat send handler in `index.tsx` creates a `DeliveredMessage` using the contact's email (from the selected record). This requires adding an email field to `EmailRecord` and mock data.

**Why:** Both paths create messages. It would be inconsistent if only one path delivered to the recipient. ComposeView already has the "To" email field; ChatInput gets the recipient from the conversation context.

### 4. Add `senderEmail` to `EmailRecord` and mock data

Add an optional `senderEmail?: string` field to `EmailRecord`. Populate it in `mockEmailRecords`. This gives the chat view access to the conversation partner's email for delivery.

**Why:** The chat input needs to know the recipient's email to deliver the message. The simplest source is the selected record's `senderEmail`. Making it optional avoids breaking existing code that creates `EmailRecord` objects without it.

### 5. Load received messages into inbox message list

When the inbox folder is active and a user is logged in, load `inbox-delivered-messages` from localStorage, filter for `recipientEmail === currentUser.email`, convert to `EmailRecord` format, and prepend to the existing mock records.

**Why:** The user's requirement is "login email B should see the inbox from email A." This means received messages appear in the inbox folder's message list as regular rows. Prepending puts new messages at the top.

### 6. ChatInput becomes controlled with `onSend` callback

Add `useState` for the input value, add an `onSend: (text: string) => void` prop. Wire both Send button click and Enter key to call `onSend` (after trim + empty-check). Clear input after send.

**Why:** Same rationale as before — controlled state needed to read and clear the input value.

### 7. Auto-scroll via `useRef` + `scrollIntoView`

Add a `useRef` on a sentinel `<div>` at the bottom of the messages area in `ChatView`. Scroll into view when `messages.length` changes.

**Why:** Standard React chat scroll pattern. Simple and effective.

## Risks / Trade-offs

- **[Risk] No real-time sync** → Accepted. Recipient must reload or re-login to see new messages. This is a demo app, not a real messaging platform.
- **[Risk] localStorage size** → Low risk for a demo app. Delivered messages are small JSON objects.
- **[Risk] Mock email records don't have real email addresses** → Mitigated by adding `senderEmail` to mock data with plausible mock emails (e.g., `ethan.rodriguez@example.com`).
- **[Risk] Clearing tokens also clears `registered_user`** → Existing behavior in `clearTokens()`. Delivered messages are stored under a separate key and survive logout, which is correct — they're cross-user data, not per-session data.
