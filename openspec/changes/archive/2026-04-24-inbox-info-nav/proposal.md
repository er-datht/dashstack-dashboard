## Why

When multiple messages are selected and the Info modal opens, it only shows the first message's metadata with no way to view the others. Users need Previous/Next navigation to browse through all selected messages without closing the modal and re-selecting.

## What Changes

- Add Previous and Next navigation buttons to the InfoModal when multiple messages are selected
- Update the counter from static "1 of N selected" to dynamic "X of N selected" reflecting the current position
- Change `InfoModalData` from single-message data to an array of messages, with internal navigation state
- Previous button disabled on first message, Next button disabled on last message
- Single message selection preserves current behavior (no nav buttons)
- Add i18n keys for Previous/Next buttons in both en and jp locales

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `inbox-info-modal`: Bulk selection requirement changes — modal now supports Previous/Next navigation across selected messages instead of showing only the first one

## Impact

- **Code**: `InfoModal.tsx` (nav buttons, index state), `index.tsx` (pass array of InfoModalData instead of single item)
- **Types**: `InfoModalProps` changes — `data` becomes `items: InfoModalData[]` or similar
- **i18n**: `public/locales/en/inbox.json`, `public/locales/jp/inbox.json` — new keys for previous/next
- **Tests**: `InfoModal.test.tsx` — update bulk selection tests, add nav tests
- **Dependencies**: None
