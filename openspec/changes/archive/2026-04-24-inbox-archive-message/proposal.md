## Why

The Inbox page has a delete-to-bin flow but no archive capability. Users need a softer way to remove messages from their inbox without deleting them — archiving moves messages out of sight while keeping them accessible. The toolbar already has an unused download icon placeholder that maps naturally to an archive action.

## What Changes

- Add `ArchivedMessage` type mirroring `BinnedMessage` with `sourceFolder` for restore
- Add "Archive" folder to sidebar (after Bin, last position) with `Archive` lucide-react icon
- Add per-row archive icon button in MessageList (next to existing trash icon)
- Repurpose toolbar download icon as bulk archive button for selected messages
- Add archive button in ChatHeader detail view
- Implement `handleArchiveMessage` / `handleBulkArchive` handlers following bin pattern
- Implement `handleUnarchiveMessage` restore handler in Archive folder view
- Persist archived messages to localStorage (`inbox-archived-messages`)
- Wire Archive folder into `getDisplayRecords()` and folder count overrides
- Add translation keys for en and jp locales

## Capabilities

### New Capabilities
- `inbox-archive`: Archive and unarchive messages in the Inbox page — covers the ArchivedMessage type, archive/unarchive handlers, Archive folder display, per-row and bulk archive actions, and restore flow

### Modified Capabilities
- `inbox-view`: Add archive folder to sidebar folder list, wire archive into folder display routing and count overrides
- `inbox-bin`: Exclude already-archived messages from bin eligibility (archived messages cannot be directly binned; they must be unarchived first)

## Impact

- **Types**: `src/types/inbox.ts` — new `ArchivedMessage` type
- **Mock data**: `src/pages/Inbox/mockData.ts` — new archive folder entry
- **Orchestrator**: `src/pages/Inbox/index.tsx` — new state, handlers, folder routing
- **Message list**: `src/pages/Inbox/MessageList.tsx` — per-row archive icon, toolbar archive button
- **Chat header**: `src/pages/Inbox/ChatHeader.tsx` — archive button in detail view
- **Translations**: `public/locales/en/inbox.json`, `public/locales/jp/inbox.json`
- **No new dependencies** — uses existing lucide-react `Archive` icon
