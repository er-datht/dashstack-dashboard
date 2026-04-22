## 1. Mock Data

- [x] 1.1 Add optional `isStarred?: boolean` field to the `EmailRecord` type in [mockData.ts](src/pages/Inbox/mockData.ts)
- [x] 1.2 Seed 3–4 records in `mockEmailRecords` with `isStarred: true` so the Starred tab is non-empty on first load

## 2. Page-Level State

- [x] 2.1 In [Inbox/index.tsx](src/pages/Inbox/index.tsx) add `starredIds` state of type `Record<string, boolean>`, initialized from `mockEmailRecords` via `Object.fromEntries(records.filter(r => r.isStarred).map(r => [r.id, true]))`
- [x] 2.2 Add `toggleStar(id: string)` handler that flips `starredIds[id]` (delete when becoming false to keep the map minimal)
- [x] 2.3 Derive `starredCount = Object.values(starredIds).filter(Boolean).length`

## 3. Sidebar Count Wiring

- [x] 3.1 Accept an optional `folderCountOverrides?: Partial<Record<string, number>>` prop on [InboxSidebar.tsx](src/pages/Inbox/InboxSidebar.tsx); when rendering a folder, use the override count if present, otherwise fall back to `folder.count`
- [x] 3.2 Pass `{ starred: starredCount }` from `Inbox/index.tsx` into `InboxSidebar`

## 4. MessageList Wiring

- [x] 4.1 Add `starredIds: Record<string, boolean>`, `onToggleStar: (id: string) => void`, and `activeFolder: string` props to [MessageList.tsx](src/pages/Inbox/MessageList.tsx)
- [x] 4.2 Replace the star button's `onClick` → `onShowToast(t("chat.comingSoon"))` with `onToggleStar(record.id)` (keep `e.stopPropagation()`)
- [x] 4.3 Render the star icon filled (`fill="currentColor"` + `text-warning`) when `starredIds[record.id]` is true; otherwise keep existing outlined style
- [x] 4.4 Insert a folder-filter stage before the search filter: if `activeFolder === "starred"`, drop records where `starredIds[r.id]` is falsy
- [x] 4.5 Reset `page` to 0 when `activeFolder` changes (use `useEffect` on `activeFolder`)
- [x] 4.6 Pass `starredIds`, `toggleStar`, and `activeFolder` down from `Inbox/index.tsx` to `MessageList`

## 5. Verification

- [x] 5.1 `yarn build` — no TypeScript errors
- [x] 5.2 `yarn lint` — clean (pre-existing warnings in ThemeContext/WishlistContext/CalendarGrid/EventDetailPopover only)
- [x] 5.3 `yarn dev` and manually verify: star toggle visual, Starred folder filters to only starred rows, sidebar `Starred` count tracks toggles, pagination resets on folder switch
- [x] 5.4 Verify all three themes (light / dark / forest) render the filled star correctly with `text-warning`
