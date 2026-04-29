## Why

The Inbox page has a Spam folder entry in the sidebar but it currently falls through to showing inbox records — there is no spam-specific data, filtering, or actions. Users need a functional Spam folder with pre-seeded spam messages, the ability to mark messages as "Not Spam" (restore to source folder), and dynamic count tracking, following the same patterns established by Bin and Archive.

## What Changes

- Add ~14 mock spam `EmailRecord` entries with spammy subjects/senders to `mockData.ts`
- Define a `SpammedMessage` type in `src/types/inbox.ts` with `sourceFolder` field (mirrors `BinnedMessage`)
- Add `useLocalStorage` state for spam messages (`inbox-spammed-messages`) to track "Not Spam" removals
- Add `spam` branch in `getDisplayRecords()` that shows mock spam records minus any restored messages
- Add per-row "Not Spam" restore button (`ShieldCheck` icon) on spam folder rows
- Exclude spammed messages from Starred folder view (consistent with bin/archive pattern)
- Dynamic spam count via `folderCountOverrides` (starts at 14, decrements on "Not Spam")
- Click spam row opens ChatView (same as Bin/Archive)
- Add translation keys for spam-specific actions in en/jp
- Toolbar buttons remain as-is (Download placeholder + Coming soon for trash)

## Capabilities

### New Capabilities
- `inbox-spam`: Spam folder display, mock spam data seeding, "Not Spam" restore action, dynamic count, spammed message exclusion from Starred view

### Modified Capabilities
- `inbox-view`: Starred folder filtering must also exclude spammed messages; message list rows in spam folder display a "Not Spam" restore button

## Impact

- `src/pages/Inbox/mockData.ts` — new `mockSpamRecords` array
- `src/types/inbox.ts` — new `SpammedMessage` type (actually used to track restored spam IDs, but type mirrors `BinnedMessage` pattern)
- `src/pages/Inbox/index.tsx` — new `useLocalStorage` state, `getDisplayRecords` spam branch, spam restore handler, `folderCountOverrides` for spam, exclude spammed from Starred
- `src/pages/Inbox/MessageList.tsx` — "Not Spam" button on spam folder rows
- `public/locales/en/inbox.json` — spam translation keys
- `public/locales/jp/inbox.json` — spam translation keys
- No new dependencies
