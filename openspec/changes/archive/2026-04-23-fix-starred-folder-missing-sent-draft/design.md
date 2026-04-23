## Context

The Inbox page has three record sources: `mockEmailRecords` (inbox), `sentEmailRecords` (sent), and `draftEmailRecords` (drafts). The `displayRecords` ternary only branches on "sent" and "draft" — everything else (including "starred") falls through to `mockEmailRecords`. The starred filter in `MessageList` then operates on whatever `records` prop it receives, so it can only find starred inbox records.

## Goals / Non-Goals

**Goals:**
- Starred folder shows starred messages from all sources (inbox, sent, draft)

**Non-Goals:**
- Re-sorting starred results chronologically (display order follows concatenation: inbox → sent → draft)
- Changing any other folder's behavior

## Decisions

**Decision: Add a "starred" branch to the `displayRecords` ternary that concatenates all three arrays.**

Rationale: The starred filter in `MessageList` already correctly filters by `starredIds` — the only issue is the input pool. Concatenating the three arrays before passing them gives `MessageList` the full set to filter. No changes needed in `MessageList.tsx`.

Alternative considered: Moving the starred filter logic into `index.tsx` instead of relying on `MessageList`. Rejected because the filter already works correctly in `MessageList` — the bug is purely about which records are passed in.

## Risks / Trade-offs

- **Duplicate IDs**: Inbox uses `"rec-N"`, sent/draft use `crypto.randomUUID()` — no collision risk.
- **Click behavior**: `handleSelectRecord` already handles sent (looks up `sentMessages`) and draft (opens compose view) records by ID, so clicking a starred sent/draft record from the Starred folder will work correctly.
