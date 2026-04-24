## Why

The Info button in the Inbox page currently shows a "Coming soon" toast in both the MessageList top action bar and the ChatHeader. Users expect it to be functional — clicking it should display message metadata in a modal dialog, completing the action bar's feature set alongside Archive and Delete.

## What Changes

- Replace the "Coming soon" toast on the Info button (MessageList top bar) with a modal showing metadata for the selected message(s): sender, subject, label, time, starred status, and folder
- Replace the "Coming soon" toast on the Info button (ChatHeader) with a modal showing metadata for the currently open conversation: contact name, subject, label, time, starred status, and folder
- Create a reusable `InfoModal` component following the existing `ConfirmModal` pattern (overlay, focus trap, escape/click-outside dismiss, ARIA attributes, all 3 themes)
- Add i18n keys for modal title, field labels, and close button in both `en` and `jp` locales
- MessageList Info button follows the same selection-required pattern as Archive/Delete (shows "No messages selected" toast when nothing is selected)

## Capabilities

### New Capabilities
- `inbox-info-modal`: Info modal dialog displaying message metadata, triggered from MessageList bulk bar and ChatHeader action bar

### Modified Capabilities
- `inbox-view`: Info button behavior changes from "Coming soon" toast to opening the info modal

## Impact

- **Code**: `MessageList.tsx`, `ChatHeader.tsx`, `index.tsx` (Inbox page), new `InfoModal.tsx` component
- **i18n**: `public/locales/en/inbox.json`, `public/locales/jp/inbox.json` — new keys for modal content
- **Dependencies**: None — uses existing libraries (lucide-react, react-tooltip, classnames)
- **Themes**: Modal must support light, dark, and forest themes via CSS custom properties
