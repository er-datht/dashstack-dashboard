## Why

The ComposeView has auto-save on unmount, which persists drafts automatically when the user leaves the compose view. The explicit "Save as Draft" button is therefore redundant — it duplicates functionality already handled by the auto-save mechanism.

## What Changes

- Remove the "Save as Draft" button from the ComposeView footer
- Remove orphaned `saveAsDraft` i18n keys from en/jp locale files
- Footer retains only the Send button

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `inbox-compose`: Remove Save as Draft button from ComposeView footer; auto-save on unmount is the sole draft persistence mechanism

## Impact

- **Code**: `src/pages/Inbox/ComposeView.tsx` — remove Save as Draft button element
- **i18n**: `public/locales/en/inbox.json`, `public/locales/jp/inbox.json` — remove `saveAsDraft` key
