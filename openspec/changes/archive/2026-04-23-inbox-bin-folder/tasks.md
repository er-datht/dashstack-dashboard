## 1. Types and Translations

- [x] 1.1 Add `BinnedMessage` type to `src/types/inbox.ts` with fields: `id`, `senderName`, `labelId`, `subject`, `time`, `sourceFolder`
- [x] 1.2 Add translation keys (`list.restore`, `list.restored`, `list.deletedToBin`, `list.noSelection`) to `public/locales/en/inbox.json` and `public/locales/jp/inbox.json`

## 2. Bin State and Handlers in index.tsx

- [x] 2.1 Add `useLocalStorage<BinnedMessage[]>("inbox-binned-messages", [])` state for bin persistence
- [x] 2.2 Create `binnedIdSet` derived value (Set of binned message IDs) for efficient exclusion filtering
- [x] 2.3 Implement `handleDeleteToBin(id: string)` — finds the record from the appropriate source (mockEmailRecords, sentEmailRecords, draftEmailRecords), creates a `BinnedMessage` with `sourceFolder`, adds to `binnedMessages`, and for sent messages removes from `sentMessages`
- [x] 2.4 Implement `handleBulkDeleteToBin(ids: string[])` — iterates `handleDeleteToBin` for each ID, shows toast
- [x] 2.5 Implement `handleRestoreFromBin(id: string)` — removes from `binnedMessages`, for sent-sourced messages re-adds to `sentMessages`, shows toast
- [x] 2.6 Add bin count to `folderCountOverrides` (`bin: binnedMessages.length`)

## 3. Display Records Filtering

- [x] 3.1 Add `activeFolder === "bin"` branch to `displayRecords` — convert `binnedMessages` to `EmailRecord[]` format
- [x] 3.2 Filter out `binnedIdSet` from inbox, starred, sent, and important folder views in `displayRecords`
- [x] 3.3 Wire `handleSelectRecord` to work for bin records (open ChatView)

## 4. MessageList Enhancements

- [x] 4.1 Add `selectedIds` state (Set<string>) for checkbox tracking, reset on folder change
- [x] 4.2 Wire checkboxes to toggle `selectedIds` on each row
- [x] 4.3 Add per-row Trash2 delete button when `activeFolder` is `inbox`, `starred`, `sent`, or `important` — calls `onDelete(id)`
- [x] 4.4 Add per-row RotateCcw restore button when `activeFolder === "bin"` — calls `onRestore(id)`
- [x] 4.5 Wire toolbar Trash2 button: call `onBulkDelete(selectedIds)` for eligible folders; show no-selection toast when empty; keep "Coming soon" for non-eligible folders
- [x] 4.6 Add `onRestore` and `onBulkDelete` props to `MessageListProps` type

## 5. Integration and Prop Wiring

- [x] 5.1 Pass `onDelete={handleDeleteToBin}` to MessageList for eligible folders (inbox, starred, sent, important)
- [x] 5.2 Pass `onRestore={handleRestoreFromBin}` to MessageList when `activeFolder === "bin"`
- [x] 5.3 Pass `onBulkDelete={handleBulkDeleteToBin}` to MessageList for eligible folders
- [x] 5.4 Verify starred state preservation: star a message → delete to bin → restore → confirm star is intact
- [x] 5.5 Verify bin count updates live in sidebar on delete and restore
