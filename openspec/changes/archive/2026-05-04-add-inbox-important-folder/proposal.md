## Why

The Important folder is currently a UI-only placeholder: the sidebar entry exists with a static count of `18` and `MessageSquare` icon, the folder ID is in `VALID_FOLDERS`, and `BinnedMessage`/`ArchivedMessage` types already accept `"important"` as a `sourceFolder` — but clicking the folder falls through to the inbox view, no messages can be marked Important, and no UI surfaces the action. Specs (`inbox-bin`, `inbox-archive`, `inbox-view`, `inbox-move-to-spam`) already assume Important is a real, addressable folder. This change wires the rest of the feature.

Important uses a **flag model** (parallel to Starred): a per-message boolean `isImportant`. The Important folder is a filtered view across inbox/sent/draft/restored-from-spam sources — not separate storage. A message can be in Inbox AND Important simultaneously.

## What Changes

- Add `isImportant?: boolean` to the `EmailRecord` / message type (`src/types/inbox.ts`).
- Add `importantIds: Record<string, boolean>` state in `index.tsx`, persisted via `useLocalStorage` under key `"inbox-important-ids"`. (Starred is currently ephemeral; not migrated here — out of scope.)
- Add `toggleImportant(id)` handler mirroring `toggleStar(id)`.
- Add per-row `Bookmark` icon button (filled when flagged, outlined when not) in the message list on inbox / starred / sent / important folders, positioned between Star and Archive.
- Add ChatHeader `Bookmark` toggle button on eligible folders (inbox / starred / sent / important).
- Add bulk toolbar action: "Mark as Important" on inbox/starred/sent toolbars, "Unmark Important" on the Important folder toolbar.
- Implement `getDisplayRecords()` branch for the Important folder: union of inbox-source records flagged important, minus binned/archived/spammed.
- Implement dynamic sidebar count via `folderCountOverrides.important` (formula parallel to `starredCount`).
- Drop the static `count: 18` placeholder on the Important folder entry in `mockData.ts`.
- Pre-seed 5 of the 13 `mockEmailRecords` with `isImportant: true` so the folder shows real content on first load.
- Important folder rows show: filled `Bookmark` (click to unmark), Archive, Trash2. No spam button.
- Important folder toolbar: bulk Unmark Important, Archive, Info, Trash2.
- Cross-folder rules: Important flag is preserved through Bin delete/restore, Archive/unarchive, and Spam/Not-Spam round-trips. Important folder view excludes binned/archived/spammed records.
- Add i18n keys to `public/locales/{en,jp}/inbox.json`: `list.markImportant`, `list.unmarkImportant`, `list.markedImportant`, `list.unmarkedImportant`, `list.bulkMarkImportant`, `list.bulkUnmarkImportant`, `chat.markImportant`, `chat.unmarkImportant`.
- Add a new test file `Inbox.important.test.tsx` covering toggle (per-row, ChatHeader, bulk), persistence, dynamic count, cross-folder rules.

## Capabilities

### New Capabilities

- `inbox-important`: per-message `isImportant` flag, Important folder filtered view, per-row + ChatHeader + bulk toggle entry points, dynamic sidebar count, persistence, mock seed, cross-folder preservation.

### Modified Capabilities

- `inbox-view`: Important folder count switches from static `18` to dynamic — formula: count of flagged records minus binned/archived/spammed. Sidebar entry's `count` field is dropped; count is supplied via `folderCountOverrides.important`. (No change to existing scenarios about row buttons or toolbar buttons on the Important folder — those scenarios already exist and continue to hold.)

## Impact

- `src/pages/Inbox/mockData.ts` — extend the `EmailRecord` type with `isImportant?: boolean`. (The proposal originally targeted `src/types/inbox.ts`; the actual type lives in `mockData.ts`. No new type module is created.)
- `src/pages/Inbox/index.tsx` — `importantIds` state, `toggleImportant`/`toggleImportantBulk` handlers, `getDisplayRecords()` important branch (covering `mockEmailRecords + sentEmailRecords + draftEmailRecords + restoredFromSpam + receivedEmailRecords`), `folderCountOverrides.important`, ChatHeader/Toolbar wiring on eligible folders. Also extends `buildBinnedMessage` / `buildArchivedMessage` to look up records across the same union and resolve `sourceFolder` for `activeFolder === "important"`, so per-row Archive/Trash work for every record type the folder displays.
- `src/pages/Inbox/MessageList.tsx` — per-row Bookmark button, bulk Bookmark toolbar button.
- `src/pages/Inbox/ChatHeader.tsx` — `onToggleImportant` prop, Bookmark button.
- `src/pages/Inbox/ChatView.tsx` — pass through `isImportant` and `onToggleImportant`.
- `src/pages/Inbox/mockData.ts` — drop `count: 18`; pre-flag 5 records with `isImportant: true`.
- `public/locales/en/inbox.json`, `public/locales/jp/inbox.json` — new keys.
- `src/pages/Inbox/__tests__/Inbox.important.test.tsx` — new test file.
- `openspec/specs/inbox-important/spec.md` — new capability spec (created on archive).
- `openspec/specs/inbox-view/spec.md` — count requirement update (applied on archive).
