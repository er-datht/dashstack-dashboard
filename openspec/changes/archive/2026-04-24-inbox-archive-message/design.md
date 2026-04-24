## Context

The Inbox page uses a folder-based message management pattern. The bin (trash) feature established the core pattern: typed message objects with `sourceFolder` for restore, localStorage persistence via `useLocalStorage`, handlers for move/restore, folder-based display routing in `getDisplayRecords()`, and toast notifications. The archive feature is a parallel concept — same data flow, different destination.

The toolbar already has an unused download icon (shows "Coming soon") that will be repurposed as the archive trigger. The `MessageFolder` type already includes `"archive"` but nothing uses it.

## Goals / Non-Goals

**Goals:**
- Archive messages from any eligible folder (inbox, starred, sent, important, draft) with restore capability
- Support both individual (per-row icon) and bulk (toolbar button with checkbox selection) archive actions
- Persist archived messages across sessions via localStorage
- Follow the exact bin feature pattern for consistency and maintainability

**Non-Goals:**
- Auto-archive rules or scheduling
- Archive expiration or auto-delete
- Archive search/filter beyond the standard message list search
- Archiving from bin or spam folders

## Decisions

### 1. ArchivedMessage type mirrors BinnedMessage

**Decision**: Create `ArchivedMessage` with the same shape as `BinnedMessage` — captures `sourceFolder` plus all fields needed for display and restore.

**Why**: The bin pattern is proven and well-understood in this codebase. Using the same shape means the same `buildBinnedMessage`-style helper logic works, and `MessageList` can render archived messages identically to binned ones.

**Alternative considered**: Reusing `BinnedMessage` with a `destination` discriminator field. Rejected because it couples two independent features and makes type narrowing harder.

### 2. ARCHIVE_ELIGIBLE_FOLDERS mirrors BIN_ELIGIBLE_FOLDERS

**Decision**: `const ARCHIVE_ELIGIBLE_FOLDERS = ["inbox", "starred", "sent", "important", "draft"]` — bin's set plus draft.

**Why**: Archive and bin serve the same user intent (remove from view) with different severity. Draft is included because users may want to archive drafts for later without permanently deleting them. Spam and bin are excluded because they have their own lifecycle.

### 3. Per-row archive icon placement

**Decision**: Place the archive icon (lucide-react `Archive`) to the left of the existing trash icon on each message row.

**Why**: Archive is a less destructive action than delete, so it should appear first (left) in the action group. This follows the convention of placing safer actions before destructive ones.

### 4. Context-sensitive toolbar first button

**Decision**: The toolbar's first button adapts to the active folder: `Archive` icon on archive-eligible folders (wired to `handleBulkArchive`), `RotateCcw` icon on the archive folder (wired to `handleBulkUnarchive`), and the original `Download` icon on non-eligible folders (spam, bin) as a neutral placeholder with "Coming soon" behavior.

**Why**: Showing Archive on folders where archiving isn't available (spam, bin) is misleading. The Download placeholder preserves the toolbar layout while clearly signaling no archive action is available. The RotateCcw icon on the archive folder provides a natural bulk unarchive action matching the per-row restore pattern.

### 5. Archive folder sidebar position

**Decision**: Archive folder appears after Bin (last in the sidebar folder list).

**Why**: User explicitly requested this position. Archive is a secondary storage location, not a primary navigation target.

### 6. No cross-interaction between archive and bin

**Decision**: Archived messages cannot be directly deleted to bin. They must be unarchived first. The Archive folder view shows per-row restore (unarchive) buttons and the toolbar's first button becomes a bulk Unarchive button (`RotateCcw` icon). No delete action is available in the Archive folder.

**Why**: Keeps the state machine simple — a message is in exactly one location at a time. Avoids needing to track `previousSourceFolder` chains. The bulk unarchive toolbar button mirrors the bulk archive pattern on other folders, giving users a consistent way to act on multiple selected messages.

## Risks / Trade-offs

- **localStorage size** — Adding another persisted array increases storage usage. Mitigation: same risk exists with bin and hasn't been a problem; messages are small objects.
- **Starred + archived interaction** — A starred message that gets archived will disappear from the Starred folder view. The star status is preserved and will show when viewing Archive folder. Mitigation: this matches how bin handles starred messages — consistent behavior.
- **ChatHeader archive vs delete asymmetry** — The archive button in ChatHeader is fully functional, while the info and delete buttons still show "Coming soon". This is intentional — archive was prioritized; delete can be wired later following the same pattern.
