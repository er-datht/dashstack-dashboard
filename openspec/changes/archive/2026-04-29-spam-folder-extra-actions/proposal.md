## Why

The Spam folder currently lacks two actions available in other folders: (1) the message list toolbar has no Archive button — users must leave spam to archive, and (2) the ChatView header has no "Not Spam" button — users must go back to the message list to restore a message they're reading.

## What Changes

- Add an Archive bulk button to the Spam folder message list toolbar (alongside Not Spam, Info, Trash)
- Pass `onBulkArchive` to MessageList when spam folder is active
- Add `onNotSpam` prop to ChatHeader/ChatView and render a ShieldCheck button in the ChatView header when viewing a spam message
- Pass `onNotSpam` handler from index.tsx to ChatView when spam folder is active

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `inbox-spam`: Spam folder gains Archive toolbar button and ChatView "Not Spam" header button
- `inbox-view`: ChatHeader gains optional `onNotSpam` prop; toolbar adds Archive alongside Not Spam on spam folder

## Impact

- `src/pages/Inbox/index.tsx` — pass `onBulkArchive` and `onNotSpam` for spam folder
- `src/pages/Inbox/MessageList.tsx` — pass `onBulkArchive` when spam folder is active
- `src/pages/Inbox/ChatHeader.tsx` — add `onNotSpam` prop and ShieldCheck button
- `src/pages/Inbox/ChatView.tsx` — pass `onNotSpam` through to ChatHeader
