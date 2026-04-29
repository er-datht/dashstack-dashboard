## Why

When a message is marked "Not Spam" and restored to the Inbox, the Inbox sidebar folder count stays at its static mock value (1253) instead of incrementing. The spam count decrements correctly, and the restored message does appear in the Inbox message list — but the sidebar badge is stale because `folderCountOverrides` has no `inbox` entry.

## What Changes

- Add an `inbox` key to `folderCountOverrides` in `src/pages/Inbox/index.tsx` that dynamically calculates the Inbox folder count from `receivedEmailRecords`, `restoredFromSpam`, and `mockEmailRecords` (after filtering out binned/archived/spammed messages)
- Add a test verifying the Inbox count increments when "Not Spam" is clicked

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `inbox-spam`: The "Not Spam" action SHALL also increment the Inbox folder sidebar count (currently only the spam count updates)

## Impact

- `src/pages/Inbox/index.tsx` — add `inbox` entry to `folderCountOverrides` prop
- Test file for the "Not Spam" count behavior
