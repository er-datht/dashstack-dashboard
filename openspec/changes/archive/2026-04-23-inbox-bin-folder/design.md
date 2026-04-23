## Context

The Inbox page has a working folder system (Inbox, Starred, Sent, Draft, Spam, Important) with a Bin entry in the sidebar that is visually present but non-functional. Starred uses in-memory `starredIds` map; Sent and Draft use `useLocalStorage` for persistence. The Bin folder needs to follow the localStorage pattern, with the additional complexity of tracking which folder each message came from (for restore) and supporting both per-row and bulk delete operations.

## Goals / Non-Goals

**Goals:**
- Delete messages to bin from Inbox, Starred, Sent, and Important folders via per-row button and toolbar bulk action
- Persist binned messages across page refresh using `useLocalStorage`
- Display binned messages in the Bin folder view with a Restore button per row
- Live bin count in sidebar via `folderCountOverrides`
- Exclude binned IDs from source folder views
- Preserve starred state through delete/restore round-trips

**Non-Goals:**
- Permanent delete from bin (no "Empty Bin" or per-item permanent delete — future enhancement)
- Bin for Draft or Spam folders (Draft keeps existing permanent-delete; Spam is conceptually separate)
- Auto-expiry / TTL on binned messages
- Undo-delete toast with timer

## Decisions

### 1. Bin data model: `BinnedMessage` type with `sourceFolder`

Store binned messages as `BinnedMessage[]` in localStorage, where each entry captures the `EmailRecord` fields plus a `sourceFolder` string. This allows restore to return the message to its original folder view.

**Alternative considered**: Store only IDs in a `Set<string>` (like `starredIds`). Rejected because Sent messages are only in localStorage — if we bin a sent message and only store its ID, we'd need to keep the original in `sentMessages` with a "binned" flag, coupling bin logic into sent logic.

### 2. Checkbox selection state in MessageList

Add a `selectedIds: Set<string>` state inside `MessageList` to track checked rows. The toolbar Trash2 button triggers bulk delete by calling a new `onBulkDelete(ids: string[])` callback. Selection state resets on folder change.

**Alternative considered**: Lift selection state to `index.tsx`. Rejected — selection is a UI concern local to MessageList and doesn't need to be shared with ChatView or ComposeView.

### 3. Delete handlers in index.tsx

Two new handlers in `index.tsx`:
- `handleDeleteToBin(id: string)` — moves a single message to bin. Determines `sourceFolder` from `activeFolder` (with special handling: if `activeFolder === "starred"`, look up whether the record is from mockEmailRecords, sentEmailRecords, etc. to determine the true source).
- `handleBulkDeleteToBin(ids: string[])` — iterates `handleDeleteToBin` for each ID.
- `handleRestoreFromBin(id: string)` — removes from `binnedMessages`, returning the message to its source folder (for sent: re-adds to `sentMessages`; for inbox/starred/important: removes ID from the binned set).

### 4. Filtering: exclude binned IDs from all source folders

Create a `binnedIdSet` derived from `binnedMessages` and filter it out of `displayRecords` for inbox, starred, sent, and important views. The bin folder view returns `binnedMessages` converted to `EmailRecord[]` format.

### 5. Per-row delete button visibility

Show a Trash2 delete button on each message row when `activeFolder` is one of: `inbox`, `starred`, `sent`, `important`. Show a RotateCcw restore button when `activeFolder === "bin"`. Draft folder keeps its existing delete button unchanged.

## Risks / Trade-offs

- **localStorage size**: Each binned message stores the full EmailRecord. For mock data this is negligible. If real API integration happens later, bin should move to server state. → Acceptable for current mock-data scope.
- **Starred source ambiguity**: When deleting from the Starred folder view, the actual source is ambiguous (could be inbox, sent, or draft record). → Mitigate by checking record ID prefixes or looking up which source array contains the record.
- **No permanent delete**: Bin will grow indefinitely. → Acceptable trade-off for scope control; "Empty Bin" is a natural follow-up.
