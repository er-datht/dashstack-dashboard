## Context

The Inbox page has a two-panel layout: left sidebar + right content panel. The right panel conditionally renders `MessageList` (default) or `ChatView` (when a conversation is selected). The "+ Compose" button in the sidebar currently shows a "Coming soon" toast. A `MessageDraft` type already exists in `src/types/inbox.ts` but is unused. All inbox data is local mock data with no API.

## Goals / Non-Goals

**Goals:**
- Compose view as a third right-panel state (alongside MessageList and ChatView)
- Form with To, Subject, Body fields + validation + Send/Cancel actions
- Persist sent messages to localStorage; Sent folder displays them
- Dynamic Sent folder count reflecting localStorage entries
- i18n for en/jp

**Non-Goals:**
- Rich text editor or attachments
- CC/BCC/From fields
- Save as Draft functionality
- Discard confirmation on close
- Reply/forward from ChatView
- Real API integration

## Decisions

### 1. Compose as a third panel state

Add a `showCompose` boolean to the Inbox component. The right panel renders: `showCompose` → ComposeView, `selectedRecord` → ChatView, else → MessageList. Clicking "+ Compose" sets `showCompose = true` and clears `selectedRecord`. Cancel/Send resets `showCompose = false`.

**Why over a modal**: User confirmed right-panel replacement. Consistent with how ChatView already replaces MessageList. Sidebar stays interactive.

### 2. localStorage for sent messages

Use a `useLocalStorage` hook (already exists in the project at `src/hooks/useLocalStorage.ts`) with key `"inbox-sent-messages"`. Each sent message is stored as a `SentMessage` record (id, recipientEmail, subject, body, sentAt timestamp). On Send, push to the array and persist.

**Why localStorage**: User requirement. No backend exists. Matches the project's existing `useLocalStorage` pattern.

### 3. Sent folder integration

When `activeFolder === "sent"`, MessageList receives the localStorage sent messages converted to `EmailRecord` format instead of the mock records. The Sent folder count in the sidebar becomes dynamic (number of localStorage entries).

**Why inline conversion**: Keeps MessageList's existing interface unchanged. The conversion from `SentMessage` to `EmailRecord` happens in the parent Inbox component.

### 4. ComposeView component structure

A single `ComposeView` component in `src/pages/Inbox/ComposeView.tsx` with:
- Header bar matching the MessageList/ChatView pattern (title + close button)
- Three form fields: To (email input), Subject (text input), Body (textarea)
- Footer with Cancel and Send buttons
- Inline validation: highlight empty required fields on submit attempt
- Uses the card styling consistent with MessageList/ChatView panels

### 5. SentMessage type

Add a `SentMessage` type to `src/types/inbox.ts`:
```
type SentMessage = {
  id: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string; // ISO timestamp
}
```

This is distinct from `MessageDraft` (which has `File[]` attachments). We keep `MessageDraft` unused for now.

## Risks / Trade-offs

- **localStorage size limit** — Sent messages accumulate indefinitely. Mitigation: acceptable for a mock/demo app; localStorage has ~5MB limit which is far more than needed for text-only messages.
- **No email validation on To field** — Only checking non-empty, not valid email format. Mitigation: keeps scope small; the app has no real email backend. Basic format check (contains @) is cheap to add.
- **Sent folder replaces mock data** — When viewing the Sent folder, users see only their composed messages, not the mock "Sent 24,532" count. Mitigation: the Sent count becomes dynamic and reflects real data, which is more honest than a fake number.
