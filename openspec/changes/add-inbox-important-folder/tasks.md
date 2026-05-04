## 1. Type & Mock Data

- [x] 1.1 In `src/types/inbox.ts`, add optional `isImportant?: boolean` to the `EmailRecord` type
- [x] 1.2 In `src/pages/Inbox/mockData.ts`, drop the `count: 18` placeholder on the Important folder entry (use `count: 0` if the type requires it; the override will replace it)
- [x] 1.3 In `src/pages/Inbox/mockData.ts`, mark exactly 5 of the 13 `mockEmailRecords` with `isImportant: true` — pick a mix of senders/labels (e.g., one Primary, one Work, one Social, one Friends, one no-label)

## 2. State, Persistence, and Toggle Handlers (`index.tsx`)

- [x] 2.1 Add `importantIds` state via `useLocalStorage<Record<string, boolean>>("inbox-important-ids", seed)` where `seed` is built from `mockEmailRecords` entries with `isImportant === true`
- [x] 2.2 Add `toggleImportant(id: string)` mirroring `toggleStar` (delete key if present, set to `true` otherwise)
- [x] 2.3 Add `toggleImportantBulk(ids: string[], flag: boolean)` that sets/unsets all ids and shows a toast with the count
- [x] 2.4 Compute `importantCount = Object.keys(importantIds).filter(id => importantIds[id] && !binnedIdSet.has(id) && !archivedIdSet.has(id) && !spammedIdSet.has(id)).length` (parallel to `starredCount`)

## 3. Display Logic (`index.tsx`)

- [x] 3.1 In `getDisplayRecords()`, add an `if (activeFolder === "important")` branch that returns `[...mockEmailRecords, ...sentEmailRecords, ...draftEmailRecords, ...restoredFromSpam]` filtered to exclude binned/archived/spammed (parallel to the starred branch)
- [x] 3.2 Pass `importantIds` and `onToggleImportant={toggleImportant}` props to `MessageList`
- [x] 3.3 Add `important: importantCount` to `folderCountOverrides`
- [x] 3.4 When rendering ChatView on eligible folders (inbox/starred/sent/important), pass `isImportant={!!importantIds[selectedRecord.id]}` and `onToggleImportant={() => toggleImportant(selectedRecord.id)}`

## 4. Per-Row Bookmark Button (`MessageList.tsx`)

- [x] 4.1 Import `Bookmark` from `lucide-react` and add `importantIds: Record<string, boolean>` and `onToggleImportant?: (id: string) => void` props (and corresponding bulk handlers if needed)
- [x] 4.2 In MessageList, when `activeFolder === "important"`, filter `records` by `records.filter((r) => importantIds[r.id])` (parallel to the starred filter)
- [x] 4.3 In each row, render the Bookmark button between Star and Archive when `activeFolder` is in `["inbox", "starred", "sent", "important"]`. Filled (`fill="currentColor"`, accent color) when `importantIds[r.id]`; outlined `text-secondary` otherwise. `onClick` stops propagation and calls `onToggleImportant(r.id)`. aria-label uses `t("list.markImportant")` / `t("list.unmarkImportant")` based on flag state

## 5. Bulk Toolbar Button (`MessageList.tsx`)

- [x] 5.1 In the toolbar `buttons` array, add a Bookmark entry when `activeFolder` is in `["inbox", "starred", "sent", "important"]` and `onBulkMarkImportant` / `onBulkUnmarkImportant` is provided. On `important`, the icon is filled and the action unmarks; on the others, outlined and marks
- [x] 5.2 Add a "No messages selected" guard matching the existing pattern. Show a confirmation toast with the count
- [x] 5.3 Wire `onBulkMarkImportant` and `onBulkUnmarkImportant` props in `index.tsx`, calling `toggleImportantBulk(selectedIds, true|false)` and clearing the selection

## 6. ChatView / ChatHeader Bookmark Button

- [x] 6.1 Add `isImportant?: boolean` and `onToggleImportant?: () => void` props to `ChatHeaderProps`
- [x] 6.2 In `ChatHeader.tsx`, render a Bookmark button (filled when `isImportant`, outlined otherwise) when `onToggleImportant` is provided. Position in the existing action button row (between Archive and Trash). aria-label uses `t("chat.markImportant")` / `t("chat.unmarkImportant")`
- [x] 6.3 Add `isImportant?: boolean` and `onToggleImportant?: () => void` props to `ChatViewProps` and pass them through to `ChatHeader`

## 7. i18n

- [x] 7.1 Add to `public/locales/en/inbox.json` under `list`: `markImportant`, `unmarkImportant`, `markedImportant`, `unmarkedImportant`, `bulkMarkImportant`, `bulkUnmarkImportant`
- [x] 7.2 Add to `public/locales/en/inbox.json` under `chat`: `markImportant`, `unmarkImportant`
- [x] 7.3 Add Japanese translations of all new keys to `public/locales/jp/inbox.json`

## 8. Tests

- [x] 8.1 Create `src/pages/Inbox/__tests__/Inbox.important.test.tsx` mirroring `Inbox.moveToSpam.test.tsx` structure (setup with `MemoryRouter`, mock localStorage cleared between tests)
- [x] 8.2 Test: Important folder shows exactly 5 pre-seeded records on first load
- [x] 8.3 Test: Sidebar count starts at 5 on first load
- [x] 8.4 Test: Per-row Bookmark click toggles flag and updates count (mark and unmark cases)
- [x] 8.5 Test: ChatHeader Bookmark click toggles flag
- [x] 8.6 Test: Bulk mark from Inbox flags all selected and clears selection
- [x] 8.7 Test: Bulk unmark from Important removes flag, removes rows from view
- [x] 8.8 Test: Bulk action with no selection shows "No messages selected" toast
- [x] 8.9 Test: Important flag survives bin → restore round-trip
- [x] 8.10 Test: Important flag survives archive → unarchive round-trip
- [x] 8.11 Test: Important flag survives spam → not-spam round-trip
- [x] 8.12 Test: Important folder excludes binned/archived/spammed records from view
- [x] 8.13 Test: Persistence — write `importantIds` to localStorage, reload, verify state restored
- [x] 8.14 Test: Bookmark button NOT visible on Draft, Spam, Bin, Archive folders

## 9. Verification

- [x] 9.1 `yarn lint`
- [x] 9.2 `yarn test` — all new tests pass; existing tests (especially `Inbox.moveToSpam.test.tsx` "no spam button on Important rows") continue to pass
- [x] 9.3 `yarn build` — TypeScript compiles cleanly
- [x] 9.4 Manual check in dev: navigate to Important folder, mark/unmark via row + chat + bulk, verify count, refresh page (state persists), bin/archive/spam/restore flagged messages
- [x] 9.5 Verify all 3 themes (light, dark, forest) render the Bookmark icon with correct active/inactive states
