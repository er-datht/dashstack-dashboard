## Why

The Starred folder only shows starred inbox (mock) messages. Starred sent and draft messages are excluded because the `displayRecords` ternary in `src/pages/Inbox/index.tsx` falls through to `mockEmailRecords` for the "starred" case, never including `sentEmailRecords` or `draftEmailRecords` in the pool that `MessageList` filters.

## What Changes

- Fix the `displayRecords` logic to combine all three record sources (inbox + sent + draft) when `activeFolder === "starred"`, so the starred filter in `MessageList` can find starred items from any folder.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `inbox-view`: The "Starred folder filtering" requirement must apply across all record sources (inbox, sent, draft), not only inbox records.

## Impact

- `src/pages/Inbox/index.tsx` — one ternary condition change in `displayRecords`
- No new dependencies, no API changes, no breaking changes
