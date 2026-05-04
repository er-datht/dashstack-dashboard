## Context

The Important folder is a partial placeholder. Existing wiring:

- `inboxFolders` entry: `{ id: "important", nameKey: "folders.important", icon: MessageSquare, count: 18 }` (`mockData.ts`).
- `VALID_FOLDERS` includes `"important"` (`index.tsx:25`).
- `BIN_ELIGIBLE_FOLDERS` and `ARCHIVE_ELIGIBLE_FOLDERS` include `"important"` (`index.tsx:21–22`).
- `BinnedMessage.sourceFolder` and `ArchivedMessage.sourceFolder` types accept `"important"`.
- i18n: `folders.important` exists in both locales.
- Tests in `Inbox.moveToSpam.test.tsx` already assert "no spam button on Important rows/toolbar".

What's missing: state for the flag, toggle handlers, entry-point UI (per-row button, ChatHeader button, bulk toolbar button), the `getDisplayRecords()` branch, dynamic count override, mock seed, and persistence.

The closest pattern in the codebase is **Starred**: `starredIds: Record<string, boolean>`, `toggleStar(id)`, `starredCount` formula filtering out bin/archive/spam, MessageList filtering with `records.filter((r) => starredIds[r.id])`. Important mirrors this shape — the only intentional divergence is **persistence via `useLocalStorage`**.

## Goals / Non-Goals

**Goals:**

- Per-message `isImportant` flag with `useLocalStorage` persistence under `"inbox-important-ids"`.
- Three entry points: per-row Bookmark icon, ChatHeader Bookmark, bulk toolbar action.
- Important folder shows a filtered view across inbox/sent/draft/restored-from-spam sources, excluding binned/archived/spammed.
- Dynamic sidebar count via `folderCountOverrides.important` (formula parallel to `starredCount`).
- Cross-folder preservation: flag survives bin/archive/spam round-trips.
- Pre-seed 5 of the 13 `mockEmailRecords` so the folder shows real content on first load.

**Non-Goals:**

- Migrating Starred to persistent state. Starred remains ephemeral `useState`. (A separate change can address this; out of scope here.)
- Move model (Important is a flag, not a relocate-to-folder action).
- InfoModal display of Important state.
- Keyboard shortcut for toggling Important.
- API integration. Mock-only, like the rest of the inbox.
- Compose flow change (no "mark draft as Important while composing").

## Decisions

**State shape — mirror Starred, persisted.**

```ts
const [importantIds, setImportantIds] = useLocalStorage<Record<string, boolean>>(
  "inbox-important-ids",
  // seed is read from `mockEmailRecords[i].isImportant === true`
  Object.fromEntries(mockEmailRecords.filter((r) => r.isImportant).map((r) => [r.id, true]))
);
```

`useLocalStorage` with a function-shaped initializer is already used elsewhere in this file. The seed runs once on first mount; subsequent loads read from localStorage.

**Toggle handler — mirror `toggleStar`.**

```ts
const toggleImportant = (id: string) => {
  setImportantIds((prev) => {
    const next = { ...prev };
    if (next[id]) delete next[id];
    else next[id] = true;
    return next;
  });
};
```

**Bulk toggle.** A single `toggleImportantBulk(ids: string[], flag: boolean)` is enough — the toolbar action knows whether the active folder is "important" (then unmark all selected) or one of inbox/starred/sent (then mark all selected). Toast confirms count.

**`getDisplayRecords()` branch for `"important"`.**

```ts
if (activeFolder === "important") {
  return [
    ...mockEmailRecords,
    ...sentEmailRecords,
    ...draftEmailRecords,
    ...restoredFromSpam,
    ...receivedEmailRecords,
  ].filter(
    (r) => !binnedIdSet.has(r.id) && !archivedIdSet.has(r.id) && !spammedIdSet.has(r.id)
  );
}
```

The display source MUST cover every inbox-side record type — including `receivedEmailRecords` (delivered messages where the current user is the recipient). `importantIds` is keyed only by id and accepts flags on any visible record, so omitting `receivedEmailRecords` would let the sidebar count diverge from what's actually rendered (count includes the flagged received record, but the row never appears). MessageList then filters by `importantIds` when `activeFolder === "important"` — same pattern as the existing `records.filter((r) => starredIds[r.id])` on line 108–109 of MessageList.

> Note: the original draft of this design listed the union as `mockEmailRecords + sentEmailRecords + draftEmailRecords + restoredFromSpam`, mirroring the Starred branch verbatim. Verification surfaced that this omission produced a count/display mismatch when a received message was flagged — the union now explicitly includes `receivedEmailRecords`. The Starred branch has the same latent gap and is left for a separate change since Starred has no entry point that flags received messages by default.

**Cross-folder archive/delete from Important must find the record.**

`buildBinnedMessage` and `buildArchivedMessage` originally only looked up records in `mockEmailRecords + sentEmailRecords [+ draftEmailRecords]` and only branched their `sourceFolder` resolution on `activeFolder === "starred"`. From the Important folder, a click on a `restoredFromSpam` or `receivedEmailRecords` row produced a silent no-op because `record` was `null`.

Both helpers now:

- Treat `activeFolder === "important"` the same as `"starred"` for `sourceFolder` resolution.
- Look up the record across `mockEmailRecords`, `sentEmailRecords`, `draftEmailRecords` (archive only), `restoredFromSpam`, and `receivedEmailRecords`.
- Resolve `sourceFolder` to `"inbox"` for `restoredFromSpam` and `receivedEmailRecords` (their natural home is the inbox; restoring from Bin or Archive simply removes them from the bin/archive list and the live computed views recreate them).

**Sidebar count — dynamic.**

```ts
const importantCount = Object.keys(importantIds).filter(
  (id) =>
    importantIds[id] && !binnedIdSet.has(id) && !archivedIdSet.has(id) && !spammedIdSet.has(id)
).length;

// passed via:
folderCountOverrides={{ inbox: ..., starred: starredCount, important: importantCount, ... }}
```

The static `count: 18` on the `inboxFolders` Important entry is removed (set to `0` or omitted; sidebar uses `folderCountOverrides.important` when present, falling back otherwise — confirm fallback behavior in `InboxSidebar.tsx` during apply). If the sidebar requires a numeric `count`, leave a sentinel `count: 0` and rely on the override.

**Per-row Bookmark icon — visible on inbox / starred / sent / important.**

- `Bookmark` from `lucide-react`. Filled (`fill="currentColor"`) when `importantIds[r.id]` is truthy, outlined otherwise.
- Color: `text-[var(--color-primary)]` (or `text-[var(--color-warning)]` if primary clashes with the existing yellow Star — pick during apply based on visual coherence; accent-colored either way).
- Position: between Star and Archive. Click stops propagation and calls `toggleImportant(r.id)`.
- aria-label uses `t("list.markImportant")` / `t("list.unmarkImportant")` based on flag state.

**ChatHeader Bookmark button.**

- New optional `onToggleImportant?: () => void` and `isImportant?: boolean` props on `ChatHeaderProps` and `ChatViewProps`.
- Positioned in the existing action button row (e.g., between Archive and Trash).
- Filled/outlined visual matches the row icon.
- Wired in `index.tsx` only on eligible folders (inbox / starred / sent / important).

**Bulk toolbar action.**

- On inbox / starred / sent: 4th button "Bulk Mark Important" (Bookmark, outlined).
- On important: 4th button "Bulk Unmark Important" (Bookmark, filled).
- Position: the toolbar already has a context-aware first button on spam (Not Spam) and an Archive button. Bookmark inserts between Archive and Info, or wherever maintains visual balance — finalize during apply.
- No-selection guard: if no rows selected, show "No messages selected" toast (matching existing patterns).

**Cross-folder preservation.**

- Bin: `binnedMessages` carries the original `EmailRecord` shape including `isImportant`. Restoring re-uses that record. The flag is preserved automatically via `importantIds` persistence — restore does not touch `importantIds`, so flagged-then-binned-then-restored remains flagged. ✓
- Archive: same as bin. ✓
- Spam: `spammedMessages` carries the original record. Same reasoning — `importantIds` is independent of move-to-spam. ✓
- Important folder excludes binned/archived/spammed via the same set-membership filter used by Starred. ✓

**Mock seed.**

- Add `isImportant: true` to 5 representative records in `mockEmailRecords` — pick a mix of senders and labels (e.g., one Primary, one Work, one Social, one Friends, one with no label).
- The Important folder count starts at exactly 5 on first load.
- Drop the static `count: 18` placeholder. The screenshot's 18 was a Figma artifact that predates the dynamic count.

**i18n keys.**

`public/locales/en/inbox.json` — add under `list` and `chat` namespaces:

- `list.markImportant`: "Mark as Important"
- `list.unmarkImportant`: "Unmark Important"
- `list.markedImportant`: "Marked as Important"
- `list.unmarkedImportant`: "Unmarked Important"
- `list.bulkMarkImportant`: "Mark selected as Important"
- `list.bulkUnmarkImportant`: "Unmark selected from Important"
- `chat.markImportant`: "Mark as Important"
- `chat.unmarkImportant`: "Unmark Important"

`public/locales/jp/inbox.json` — Japanese translations of the same keys.

## Risks / Trade-offs

- **Persistence asymmetry with Starred.** Important is persisted; Starred is not. This is the cheapest path forward and is justified because Important is a more deliberate signal. A follow-up change should align Starred. Acceptable.
- **Toolbar grows to 4 buttons on inbox/starred/sent/important.** Already at parity with the spam toolbar (which is 4: Not Spam, Archive, Info, Trash). Acceptable.
- **Mock seed count drops from 18 → 5.** The 18 was never a real number — it was a Figma annotation. Switching to 5 makes the count truthful. Acceptable.
- **Bookmark icon vs. MessageSquare in sidebar.** The sidebar uses `MessageSquare`; the toggle uses `Bookmark`. Two different icons for the same concept could read as inconsistent. Justified: `MessageSquare` is well-suited to a folder pill; `Bookmark` is the de-facto "this is important" action icon. Documented; revisit if usability testing complains.
- **No InfoModal change.** Important state is invisible in the ⓘ modal. If users expect it there, follow up later. Acceptable for MVP scope.
