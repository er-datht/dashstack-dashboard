## Why

Messages without a label (sent, draft, and any future unlabelled messages) have no way to get one assigned from the message list. The label badge area is simply empty, offering no affordance. Users need a way to tag these messages with a label directly from the message row.

## What Changes

- Add a clickable "add label" button in the message row's label badge area when `labelId` is empty — renders a small icon (e.g., `Tag` from lucide-react) that opens a label dropdown.
- The dropdown lists all available labels (Primary, Social, Work, Friends) with their color-coded icons, matching the existing ChatHeader label dropdown pattern.
- Selecting a label assigns it to the message and immediately shows the colored badge in place of the button.
- Messages with an existing label continue to display the badge as-is (no change to existing behavior).
- Label assignments for sent/draft messages are persisted in component state (same session); mock inbox records update in local state.

## Capabilities

### New Capabilities

_(none — this is an enhancement to an existing capability)_

### Modified Capabilities

- `inbox-view`: Message list rows gain an "add label" button when no label is assigned, with a dropdown to pick a label. The current spec says labels are "omitted when labelId is empty" — this changes to showing an add-label affordance instead. Sent folder requirement changes from "no label badge" to "add-label button when no label assigned."

## Impact

- **Code**: `MessageList.tsx` (add label button + dropdown in row), `index.tsx` (state management for label assignments), possibly `mockData.ts` (if a label map state helper is needed)
- **i18n**: New translation keys for the add-label button aria-label and any tooltip text (`en/inbox.json`, `jp/inbox.json`)
- **Dependencies**: None — uses existing lucide-react icons and existing label data
