## Context

The Spam folder is functional with pre-seeded mock data, "Not Spam" restore, and dynamic count. The missing piece is the ability to move messages INTO the spam folder from other folders. The Bin and Archive features both have per-row action buttons and bulk toolbar buttons on eligible folders — spam needs the same pattern.

Current row button order on eligible folders: Archive, Trash2.
Current toolbar button order: [Archive/Download/Unarchive], [Info], [Trash2].

The spam-eligible folders are `["inbox", "starred", "sent"]` — a subset of bin-eligible (`["inbox", "starred", "sent", "important"]`) and archive-eligible (`["inbox", "starred", "sent", "important", "draft"]`).

## Goals / Non-Goals

**Goals:**
- Per-row "Move to Spam" button (`AlertTriangle` icon) on Inbox, Starred, Sent folders
- Bulk "Move to Spam" toolbar button on the same folders
- `SpammedMessage` type with `sourceFolder` for proper restore
- Updated "Not Spam" to restore user-spammed messages to their original source folder
- Spammed messages excluded from source folder views
- Updated spam count formula

**Non-Goals:**
- ChatHeader spam button (scoped to row + toolbar only)
- Spam button on Important or Draft folders
- Spam button on Bin, Archive, or Spam folder rows

## Decisions

### 1. SpammedMessage type mirrors BinnedMessage

**Decision**: Define `SpammedMessage` in `src/types/inbox.ts` with fields: `id`, `senderName`, `labelId`, `subject`, `time`, `sourceFolder` (`"inbox" | "sent" | "starred"`), plus optional `recipientEmail`, `body`, `sentAt` for sent messages.

**Rationale**: Exact same pattern as `BinnedMessage`. The `sourceFolder` field enables proper restore to the original folder. Sent message fields are needed to re-create the `SentMessage` on "Not Spam" restore.

### 2. buildSpammedMessage helper follows buildBinnedMessage pattern

**Decision**: Add a `buildSpammedMessage(id)` helper that resolves `sourceFolder` (handling "starred" → real folder), finds the record, and returns the `SpammedMessage` plus metadata. Guard against already-spammed IDs via `spammedIdSet`.

**Rationale**: Direct copy of the bin helper pattern. Resolves "starred" to the real source folder by checking which record source contains the ID.

### 3. Row button position: Archive, Spam, Trash2

**Decision**: The `AlertTriangle` spam button goes between Archive and Trash2, rendering when `activeFolder` is in `SPAM_ELIGIBLE_FOLDERS` and `onMoveToSpam` is provided.

**Rationale**: Groups the "move" actions (archive, spam) before the destructive action (delete). Same conditional pattern as existing buttons.

### 4. Toolbar: New 4th button between Info and Trash2

**Decision**: Add an `AlertTriangle` toolbar button as the 3rd item (between Info and Trash2) in the toolbar array, visible only on spam-eligible folders. On non-eligible folders where it's not shown, the toolbar remains 3 buttons.

**Rationale**: The toolbar array is constructed inline. Adding a conditional 4th entry follows the existing pattern. Positioning between Info and Trash2 groups the spam action near the delete action.

### 5. Updated "Not Spam" handler: Dual-path restore

**Decision**: The `handleNotSpam` handler checks if the message is in `spammedMessages` (user-spammed) first. If found, it restores to the original source folder (removing from `spammedMessages`, re-adding to `sentMessages` if source was "sent"). If not found in `spammedMessages`, it falls back to the existing mock spam restore logic (add to `restoredSpamIds` and `restoredFromSpam`).

**Rationale**: Clean separation between mock spam restore (ID tracking) and user-spammed restore (full message round-trip). The sent message restore mirrors `handleUnarchiveMessage`.

### 6. Exclusion via spammedIdSet

**Decision**: Add `const spammedIdSet = new Set(spammedMessages.map((m) => m.id))` alongside existing `binnedIdSet` and `archivedIdSet`. Filter by `!spammedIdSet.has(r.id)` in all source folder branches (inbox default, sent, starred) of `getDisplayRecords()`.

**Rationale**: Exact same pattern as bin/archive exclusion. Ensures spammed messages disappear from their source folder immediately.

## Risks / Trade-offs

- **[Risk] Interaction with bin/archive** — A message could theoretically be binned AND spammed if rapid state changes occur. → Guard: `buildSpammedMessage` rejects IDs already in `binnedIdSet` or `archivedIdSet`.
- **[Trade-off] Starred filter includes restoredFromSpam** — restored mock spam in Starred view could be confusing if starred. → Acceptable: follows existing pattern where restored bin/archive records are eligible for Starred.
