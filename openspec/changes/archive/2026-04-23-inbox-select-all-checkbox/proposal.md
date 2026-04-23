## Why

The Inbox MessageList already supports individual message selection via per-row checkboxes and bulk actions (delete), but there is no way to select or deselect all visible messages at once. Users must click each checkbox individually, which is tedious when operating on multiple messages. A select-all checkbox is a standard email-client convention that improves bulk-action efficiency.

## What Changes

- Add a select-all checkbox to the MessageList top bar, placed to the left of the search input
- Checkbox toggles all visible (current-page) messages into/out of `selectedIds`
- Checkbox shows an indeterminate state when some (but not all) visible messages are selected
- Selection clears on page change (consistent with existing folder-change behavior)
- Two new i18n keys for the aria-label (`list.selectAll`) in en and jp

## Capabilities

### New Capabilities

- `inbox-select-all`: Select-all/unselect-all checkbox in MessageList header with indeterminate state support

### Modified Capabilities

- `inbox-view`: Add select-all checkbox integration to the existing MessageList top bar layout

## Impact

- **Code**: `src/pages/Inbox/MessageList.tsx` — add checkbox element, `useRef` + `useEffect` for indeterminate DOM property, clear selection on page change
- **i18n**: `public/locales/en/inbox.json`, `public/locales/jp/inbox.json` — one new key each
- **Dependencies**: None — uses native HTML checkbox indeterminate property
