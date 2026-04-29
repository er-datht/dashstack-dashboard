## Why

The Spam folder toolbar's first button is a `Download` icon placeholder with "Coming soon" behavior. Now that the Spam folder is fully functional, this slot should be a bulk "Not Spam" action (`ShieldCheck` icon) — consistent with the per-row "Not Spam" button already available on each spam message row.

## What Changes

- Replace the `Download` placeholder with a `ShieldCheck` "Not Spam" bulk action button in the Spam folder toolbar
- Add `onBulkNotSpam` prop to `MessageList` and bulk handler in `index.tsx`
- When clicked with selected messages, restore all selected spam messages (both pre-seeded mock and user-spammed) via existing `handleNotSpam` logic
- When clicked with no selection, show "No messages selected" toast (consistent with other bulk actions)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `inbox-spam`: Toolbar first button changes from Download placeholder to ShieldCheck bulk "Not Spam" action
- `inbox-view`: MessageList gains `onBulkNotSpam` prop for bulk restore from spam

## Impact

- `src/pages/Inbox/index.tsx` — add `handleBulkNotSpam` handler, pass to MessageList
- `src/pages/Inbox/MessageList.tsx` — add `onBulkNotSpam` prop, wire toolbar first button on spam folder
