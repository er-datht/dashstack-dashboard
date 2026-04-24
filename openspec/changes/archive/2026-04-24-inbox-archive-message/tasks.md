## 1. Types and Data

- [x] 1.1 Add `ArchivedMessage` type to `src/types/inbox.ts` (mirrors `BinnedMessage` with `sourceFolder` and optional sent fields)
- [x] 1.2 Add archive folder entry to `inboxFolders` array in `src/pages/Inbox/mockData.ts` (id: "archive", icon: Archive, after bin)

## 2. Translations

- [x] 2.1 Add archive translation keys to `public/locales/en/inbox.json` (folders.archive, list.archive, list.archived, list.unarchive, list.unarchived)
- [x] 2.2 Add archive translation keys to `public/locales/jp/inbox.json` (same keys, Japanese text)

## 3. State and Handlers (Orchestrator)

- [x] 3.1 Add `archivedMessages` state with `useLocalStorage("inbox-archived-messages", [])` in `src/pages/Inbox/index.tsx`
- [x] 3.2 Add `ARCHIVE_ELIGIBLE_FOLDERS` constant (inbox, starred, sent, important) in `src/pages/Inbox/index.tsx`
- [x] 3.3 Implement `buildArchivedMessage` helper (mirrors `buildBinnedMessage`) in `src/pages/Inbox/index.tsx`
- [x] 3.4 Implement `handleArchiveMessage(id)` handler with idempotency guard and toast
- [x] 3.5 Implement `handleBulkArchive(ids)` handler with idempotency guard and toast
- [x] 3.6 Implement `handleUnarchiveMessage(id)` restore handler (re-adds sent messages to sentMessages, removes from archivedMessages, shows toast)
- [x] 3.7 Wire archive folder into `getDisplayRecords()` — return archivedMessages converted to EmailRecord format
- [x] 3.8 Add archive count to `folderCountOverrides` passed to InboxSidebar
- [x] 3.9 Exclude archived message IDs from inbox, sent, starred, and important folder views (filter by archivedMessages IDs)
- [x] 3.10 Pass archive/unarchive handlers to MessageList and ChatHeader based on activeFolder

## 4. MessageList UI

- [x] 4.1 Replace toolbar Download icon with Archive icon and wire to `onBulkArchive` prop; show RotateCcw Unarchive icon on archive folder wired to `onBulkUnarchive` in `src/pages/Inbox/MessageList.tsx`
- [x] 4.2 Add per-row Archive icon button (to left of Trash2) on archive-eligible folders
- [x] 4.3 Show RotateCcw restore button on archive folder rows (same as bin pattern)
- [x] 4.4 Add aria-labels using translation keys for archive and unarchive buttons

## 5. ChatHeader UI

- [x] 5.1 Replace Download icon with Archive icon in ChatHeader action buttons in `src/pages/Inbox/ChatHeader.tsx`
- [x] 5.2 Wire archive button to `onArchive` prop — archives current message and calls `onBack` to return to list

## 6. Verification

- [x] 6.1 Verify archive from inbox, starred, sent, important folders works (per-row and bulk)
- [x] 6.2 Verify archived messages appear in Archive folder and restore works
- [x] 6.3 Verify archived messages are excluded from source folders and Starred view
- [x] 6.4 Verify archive persists across page refresh (localStorage)
- [x] 6.5 Verify all 3 themes render correctly (light, dark, forest)
- [x] 6.6 Verify en/jp translations display correctly
