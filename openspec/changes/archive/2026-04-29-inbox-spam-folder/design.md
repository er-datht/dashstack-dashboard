## Context

The Inbox page has a working folder system with Bin (soft-delete/restore) and Archive (archive/unarchive) as the two special folders that use localStorage persistence, dynamic counts via `folderCountOverrides`, and per-row action buttons. The Spam folder entry already exists in the sidebar (`mockData.ts` — `AlertTriangle` icon, static count 14, `"spam"` in `VALID_FOLDERS`), but `getDisplayRecords()` has no `spam` branch, so it falls through to showing inbox records.

The Spam folder differs from Bin/Archive in one key way: it starts with **pre-seeded mock data** (14 spam records) rather than starting empty and populating via user actions. "Not Spam" restores remove records from the spam view; there is no "Move to Spam" action from other folders in this change.

## Goals / Non-Goals

**Goals:**
- Functional Spam folder with 14 pre-seeded mock spam records
- "Not Spam" per-row restore button (moves message back to inbox)
- Dynamic spam count that decrements on restore and persists via localStorage
- Consistent UX with Bin/Archive patterns (click opens ChatView, toolbar stays as-is)
- Spammed messages (those that remain in spam) excluded from Starred folder view

**Non-Goals:**
- "Report Spam" / "Move to Spam" action from other folders (follow-up change)
- Bulk "Not Spam" via toolbar (toolbar stays as-is with Coming soon)
- Permanent delete from spam folder
- Spam filtering/ML classification

## Decisions

### 1. Data model: Track restored IDs rather than full SpammedMessage objects

**Decision**: Use `mockSpamRecords` (seeded in `mockData.ts`) as the source data, and track restored spam IDs in localStorage (`inbox-restored-spam-ids: string[]`) rather than storing full `SpammedMessage` objects.

**Rationale**: Unlike Bin/Archive where messages are *moved into* the folder (requiring full message data), spam records are pre-seeded mock data. We only need to track which ones the user has restored (removed from spam). A simple `string[]` of restored IDs is simpler than maintaining a parallel `SpammedMessage[]` array.

**Alternative considered**: Full `SpammedMessage` type mirroring `BinnedMessage`. Rejected because there's no "Move to Spam" action that would require capturing source folder and message data from other folders. If "Move to Spam" is added later, we can introduce the full type then.

### 2. Mock spam data: 14 `EmailRecord` entries in `mockData.ts`

**Decision**: Add a `mockSpamRecords: EmailRecord[]` export to `mockData.ts` with 14 records using spammy sender names and subjects (lottery scams, phishing, fake offers). Use `"spam-"` ID prefix to avoid collisions with existing `"rec-"` IDs.

**Rationale**: Matches the static count of 14 in the existing folder definition. Separate array (not mixed into `mockEmailRecords`) keeps inbox data clean.

### 3. Per-row action: ShieldCheck icon for "Not Spam"

**Decision**: Use `ShieldCheck` from lucide-react for the "Not Spam" button. This is distinct from the `RotateCcw` icon used for Bin/Archive restore.

**Rationale**: "Not Spam" is semantically different from "Restore" — it's a trust/safety action, not an undo. `ShieldCheck` (shield with checkmark) communicates "this is safe" which matches the intent. The button follows the same styling pattern as the Bin restore button.

### 4. Restore destination: Always inbox

**Decision**: "Not Spam" always moves the message to the inbox view (it becomes a regular `mockEmailRecords`-style record visible in the Inbox folder). It does NOT track `sourceFolder`.

**Rationale**: Mock spam records don't have a source folder — they were never in any other folder. When "Move to Spam" is added later, we'll need `sourceFolder` tracking, but for now the simplest correct behavior is to surface restored spam in the Inbox folder.

**Implementation**: Add restored spam records to a `useLocalStorage<EmailRecord[]>("inbox-restored-from-spam", [])` array. The inbox `getDisplayRecords` default branch includes these alongside `mockEmailRecords` and `receivedEmailRecords`.

### 5. Starred exclusion: Spam records excluded from Starred view

**Decision**: The Starred folder filter will exclude records whose IDs are in `mockSpamRecords` and NOT in the restored set. This is consistent with how binned/archived messages are excluded.

**Rationale**: A message can only be starred from a folder where it's visible. Since spam records are only visible in the Spam folder (and we won't add star-toggle there), this exclusion is primarily defensive consistency.

### 6. No new type in `inbox.ts`

**Decision**: No `SpammedMessage` type is needed for this change. The mock data uses the existing `EmailRecord` type. The restored set uses `EmailRecord[]`. A type will be added when "Move to Spam" introduces the need for `sourceFolder` tracking.

## Risks / Trade-offs

- **[Risk] Mock spam data is static** — Unlike Bin/Archive which grows dynamically, spam only shrinks (via "Not Spam"). This means the spam folder can empty out but never refill. → Acceptable for mock data; "Move to Spam" in a follow-up change will add the refill path.
- **[Risk] Restored spam records appear in Inbox** — Users may be surprised that "Not Spam" makes messages appear in their Inbox. → This is the expected email behavior (Gmail, Outlook all do this). Confirmed by user.
- **[Trade-off] Simple string[] vs full SpammedMessage type** — Simpler now but will need migration when "Move to Spam" is added. → The migration is trivial (add the type, keep the ID tracking for mock records, add full objects for user-moved records).
