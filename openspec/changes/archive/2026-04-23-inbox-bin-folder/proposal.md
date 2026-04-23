## Why

The Inbox sidebar displays a Bin folder (Trash2 icon, static count 9) but clicking it shows the default inbox records — there is no delete-to-bin mechanism or bin-specific filtering. Users need a way to delete messages from folders (Inbox, Starred, Sent, Important) into a persistent bin, view binned messages, and restore them.

## What Changes

- Add `useLocalStorage`-backed bin state (`BinnedMessage` records tracking original source folder) so binned messages persist across refresh
- Add per-row Trash2 delete button on message rows in Inbox, Starred, Sent, and Important folders (Draft keeps its existing permanent-delete behavior)
- Wire the toolbar Trash2 button for bulk-delete of checkbox-selected messages
- Add `activeFolder === "bin"` filtering branch in `displayRecords` to show only binned messages
- Add per-row Restore button on bin folder rows to move messages back to their original folder
- Override the static bin count (9) with a live count via `folderCountOverrides`
- Exclude binned message IDs from Inbox, Starred, Sent, and Important folder views
- Preserve `starredIds` state when deleting/restoring so starred status survives the round-trip
- Add `restore` and `deletedToast`/`restoredToast` translation keys to en/jp inbox.json

## Capabilities

### New Capabilities
- `inbox-bin`: Bin folder state management, delete-to-bin from multiple folders, bin filtering, restore-from-bin, bulk delete, localStorage persistence, live sidebar count

### Modified Capabilities
- `inbox-view`: Adds bin folder filtering branch, per-row delete buttons on non-draft folders, toolbar bulk-delete wiring, excludes binned IDs from source folder views, adds bin count override to sidebar

## Impact

- **Files modified**: `src/pages/Inbox/index.tsx` (bin state, handlers, filtering), `src/pages/Inbox/MessageList.tsx` (delete button on rows, checkbox selection state, bulk delete toolbar), `src/pages/Inbox/InboxSidebar.tsx` (no changes — already renders bin via `folderCountOverrides`), `src/types/inbox.ts` (BinnedMessage type), `public/locales/en/inbox.json`, `public/locales/jp/inbox.json`
- **Dependencies**: None added — uses existing `useLocalStorage`, `lucide-react` (Trash2, RotateCcw), `classnames`
- **No breaking changes**
