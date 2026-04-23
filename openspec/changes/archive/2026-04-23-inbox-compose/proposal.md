## Why

The Inbox page's "+ Compose" button currently shows a "Coming soon" toast. Users need the ability to compose and send new email messages from the Inbox. Sent messages should persist in localStorage so the Sent folder becomes functional.

## What Changes

- Replace the "+ Compose" button's "Coming soon" toast with a compose view that replaces the right content panel (same pattern as ChatView replacing MessageList)
- Add a ComposeView component with To (email), Subject, and Body (textarea) fields, plus Send and Cancel/close actions
- On Send: validate non-empty fields → save sent message to localStorage → show success toast → return to message list
- Make the Sent folder functional: display messages composed and sent by the user (loaded from localStorage)
- Update Sent folder count in sidebar to reflect actual sent message count
- Add i18n keys for compose UI in both en and jp locales

## Capabilities

### New Capabilities
- `inbox-compose`: Compose view panel with form fields, validation, send action, and localStorage persistence for sent messages

### Modified Capabilities
- `inbox-view`: Sent folder becomes functional (filters to sent messages from localStorage); Compose button navigates to compose view instead of showing toast; Sent folder count reflects actual sent messages

## Impact

- `src/pages/Inbox/` — new ComposeView component, updated Inbox index to handle compose state, updated InboxSidebar to trigger compose
- `src/pages/Inbox/mockData.ts` — Sent folder count may become dynamic
- `src/pages/Inbox/MessageList.tsx` — needs to display sent messages when Sent folder is active
- `src/types/inbox.ts` — `MessageDraft` type already exists, may need a `SentMessage` type for localStorage records
- `public/locales/en/inbox.json` and `public/locales/jp/inbox.json` — new compose-related translation keys
- No new dependencies required
