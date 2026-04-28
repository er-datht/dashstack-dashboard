## Why

The Inbox chat view has a fully rendered message input area with a Send button, but clicking Send only shows a "Coming soon" toast. Users expect to type a message and have it appear in the conversation. Beyond local display, sent messages should be deliverable — when user A sends to user B's email, user B should see the message in their inbox after logging in.

## What Changes

- Make the ChatInput Send button functional — typing a message and clicking Send (or pressing Enter) appends a new sent bubble to the conversation
- **Cross-user message delivery** — sent messages persist in localStorage and appear in the recipient's inbox when they log in
- Both ComposeView and ChatInput deliver messages to the recipient's inbox
- Sender identity comes from `getStoredUser()` (current logged-in user)
- Auto-scroll the chat area to the bottom when a new message is sent
- Ignore empty or whitespace-only input silently
- Mic, paperclip, and image icons remain "Coming soon" (out of scope)

## Capabilities

### New Capabilities

- `inbox-message-delivery`: Cross-user message delivery via localStorage — sent messages (from both ComposeView and ChatInput) are stored globally and appear in the recipient's inbox folder filtered by their email address.

### Modified Capabilities

- `inbox-view`: The chat input area requirement changes from "Coming soon" to functional send behavior (Enter key and Send button append a sent message bubble, auto-scroll, empty-input guard).
- `inbox-compose`: ComposeView send now also delivers the message to the recipient's inbox (in addition to saving to the sender's Sent folder).

## Impact

- `src/pages/Inbox/ChatInput.tsx` — add controlled input state, `onSend` callback, Enter key handler
- `src/pages/Inbox/ChatView.tsx` — accept `onSendMessage` prop, auto-scroll ref
- `src/pages/Inbox/index.tsx` — manage chat messages state, cross-user delivery logic, load received messages for current user, wire `onSendMessage` through to ChatView/ChatInput, extend `handleComposeSend` to also deliver to recipient
- `src/types/inbox.ts` — add `DeliveredMessage` type for cross-user storage
- `src/services/auth.ts` — import `getStoredUser` (already exists, no changes needed)
- `src/pages/Inbox/mockData.ts` — add `senderEmail` field to `EmailRecord` for chat recipient identification
- `openspec/specs/inbox-view/spec.md` — update chat input area requirement and scenarios
- `openspec/specs/inbox-compose/spec.md` — add cross-user delivery scenario
- `public/locales/en/inbox.json` and `jp/inbox.json` — no new keys needed (existing `chat.send` and `chat.placeholder` suffice)
