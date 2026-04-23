## Why

The ComposeView footer has a Cancel button alongside Save as Draft and Send. The Cancel button is redundant — the X close button in the header already serves the same purpose. Removing it declutters the footer and reduces user confusion about which button to use for dismissing the compose view.

## What Changes

- Remove the Cancel button from the ComposeView footer
- Footer retains only Save as Draft and Send buttons

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `inbox-compose`: Remove Cancel button from ComposeView footer

## Impact

- **Code**: `src/pages/Inbox/ComposeView.tsx` — remove Cancel button element from footer
