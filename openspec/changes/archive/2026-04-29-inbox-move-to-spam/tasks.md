## 1. Types & Translations

- [x] 1.1 Add `SpammedMessage` type to `src/types/inbox.ts` with fields: `id`, `senderName`, `labelId`, `subject`, `time`, `sourceFolder` (`"inbox" | "sent" | "starred"`), optional `recipientEmail`, `body`, `sentAt`
- [x] 1.2 Add `list.moveToSpam` and `list.movedToSpam` keys to `public/locales/en/inbox.json`
- [x] 1.3 Add `list.moveToSpam` and `list.movedToSpam` keys to `public/locales/jp/inbox.json`

## 2. State & Handlers (index.tsx)

- [x] 2.1 Import `SpammedMessage` type; add `useLocalStorage<SpammedMessage[]>("inbox-spammed-messages", [])` state; add `spammedIdSet` derived set
- [x] 2.2 Add `SPAM_ELIGIBLE_FOLDERS = ["inbox", "starred", "sent"]` constant
- [x] 2.3 Add `buildSpammedMessage(id)` helper (mirrors `buildBinnedMessage`): resolves sourceFolder for starred, finds record in mockEmailRecords/sentEmailRecords/restoredFromSpam, guards against already-spammed/binned/archived IDs, returns `SpammedMessage` + `isSent` flag
- [x] 2.4 Add `handleMoveToSpam(id: string)` handler: calls builder, adds to spammedMessages with duplicate guard, removes from sentMessages if source is sent, shows toast
- [x] 2.5 Add `handleBulkMoveToSpam(ids: string[])` handler: maps over IDs, bulk-adds to spammedMessages, bulk-removes sent, clears selection, shows toast
- [x] 2.6 Update `handleNotSpam` to dual-path: check `spammedMessages` first (user-spammed → remove from spammedMessages, restore sentMessage if source was "sent"), else fall back to existing mock spam restore logic
- [x] 2.7 Update `getDisplayRecords()` — spam branch: return `[...userSpam, ...mockSpam]` (user-spammed first so recently spammed messages appear at top)
- [x] 2.8 Update `getDisplayRecords()` — inbox default, sent, and starred branches: add `!spammedIdSet.has(r.id)` filter alongside existing binned/archived filters
- [x] 2.9 Update `folderCountOverrides` spam entry: `(mockSpamRecords.length - restoredSpamIds.length) + spammedMessages.length`
- [x] 2.10 Pass `onMoveToSpam` and `onBulkMoveToSpam` to `MessageList` when `activeFolder` is in `SPAM_ELIGIBLE_FOLDERS`

## 3. MessageList UI (MessageList.tsx)

- [x] 3.1 Add `onMoveToSpam?: (id: string) => void` and `onBulkMoveToSpam?: (ids: string[]) => void` props to `MessageListProps`
- [x] 3.2 Import `AlertTriangle` from lucide-react (already imported in mockData but not in MessageList)
- [x] 3.3 Add per-row spam button between Archive and Trash2: render `AlertTriangle` icon button when `onMoveToSpam` is provided and activeFolder is not bin/archive/spam, with aria-label `t("list.moveToSpam")`, tooltip, `hover:text-[var(--color-warning)]` styling
- [x] 3.4 Add toolbar spam button: insert `AlertTriangle` entry in the toolbar array between Info and Trash2, conditionally included when `onBulkMoveToSpam` is provided. On click: if no selection show "No messages selected" toast, else call `onBulkMoveToSpam` with selected IDs

## 4. Verification

- [x] 4.1 Verify spam button appears on Inbox/Starred/Sent rows but not on Important/Draft/Bin/Archive/Spam
- [x] 4.2 Verify clicking per-row spam button moves message to spam folder and increments count
- [x] 4.3 Verify bulk toolbar spam button moves selected messages and clears selection
- [x] 4.4 Verify spammed messages excluded from source folder views
- [x] 4.5 Verify "Not Spam" on user-spammed message restores to original source folder
- [x] 4.6 Verify "Not Spam" on user-spammed sent message restores to Sent folder
- [x] 4.7 Verify starred state preserved through spam/restore cycle
- [x] 4.8 Verify spam count formula: starts at 14, increments on move-to-spam, decrements on not-spam
- [x] 4.9 Verify all 3 themes render correctly
- [x] 4.10 Build passes and all tests pass
