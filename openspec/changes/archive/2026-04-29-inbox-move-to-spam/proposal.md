## Why

The Spam folder is functional but users cannot move messages into it — there is no "Move to Spam" action from other folders. This is the follow-up change explicitly deferred from the initial spam folder implementation to complete the spam workflow.

## What Changes

- Add `SpammedMessage` type in `src/types/inbox.ts` (mirrors `BinnedMessage` with `sourceFolder`)
- Add `useLocalStorage<SpammedMessage[]>("inbox-spammed-messages", [])` state
- Add per-row `AlertTriangle` icon button on Inbox, Starred, and Sent folder rows (positioned between Archive and Trash2)
- Add bulk `AlertTriangle` toolbar button between Info and Trash2 for spam-eligible folders
- Spammed messages excluded from source folder views via `spammedIdSet`
- Update "Not Spam" handler to restore user-spammed messages to their original source folder (pre-seeded mock spam continues restoring to Inbox)
- Update spam count formula: `(mockSpamRecords.length - restoredSpamIds.length) + spammedMessages.length`
- User-spammed messages appear in the Spam folder alongside pre-seeded mock spam
- Starred state preserved through spam/restore cycle
- Translation keys for en/jp (`list.moveToSpam`, `list.movedToSpam`)

## Capabilities

### New Capabilities
- `inbox-move-to-spam`: Per-row and bulk "Move to Spam" action from eligible folders, SpammedMessage type, source folder exclusion, updated spam count, updated "Not Spam" restore logic

### Modified Capabilities
- `inbox-spam`: Spam folder display updated to include user-spammed messages; "Not Spam" handler updated to restore user-spammed messages to source folder; spam count formula updated
- `inbox-view`: Message list rows on Inbox/Starred/Sent gain a spam icon button; toolbar gains a spam bulk button on eligible folders; starred folder filter excludes spammed messages

## Impact

- `src/types/inbox.ts` — new `SpammedMessage` type
- `src/pages/Inbox/index.tsx` — new state, handlers, exclusion sets, count formula, "Not Spam" update
- `src/pages/Inbox/MessageList.tsx` — new per-row button, new toolbar button, new props
- `public/locales/en/inbox.json` — new translation keys
- `public/locales/jp/inbox.json` — new translation keys
- No new dependencies
