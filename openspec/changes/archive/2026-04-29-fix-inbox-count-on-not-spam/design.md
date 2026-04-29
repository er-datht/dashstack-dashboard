## Context

The Inbox page tracks folder counts via `folderCountOverrides` passed to `InboxSidebar`. Dynamic overrides exist for starred, sent, draft, spam, bin, and archive — but not for inbox. The inbox folder falls back to the static `1253` from mock data. When "Not Spam" restores a message, the spam count correctly decrements but the inbox count stays stale.

## Goals / Non-Goals

**Goals:**
- Inbox sidebar count reflects the actual number of messages visible in the Inbox folder (including restored-from-spam messages)

**Non-Goals:**
- Changing inbox count for other actions (bin, archive, compose) — those are separate concerns and the static fallback already covers them acceptably for the current mock-data setup

## Decisions

**Compute inbox count from the same sources as `getDisplayRecords` for the inbox folder.**

The inbox folder displays: `receivedEmailRecords` + `activeRestoredFromSpam` + `inboxMockRecords`. The count override should mirror this. Rather than duplicating the filtering logic, compute the three filtered arrays before `getDisplayRecords` and reuse them for both the display and the count.

Alternative considered: computing only `restoredFromSpam.length` as a delta on top of the static `1253`. Rejected because the static count drifts from reality as messages are binned/archived/spammed from inbox — the full calculation is more correct and not meaningfully more expensive.

## Risks / Trade-offs

- The inbox count will now be fully dynamic, which means it won't match the original `1253` from mock data on first load (it'll show the actual filtered count). This is more accurate but is a visible change. Acceptable since correct counts are better than matching arbitrary mock numbers.
