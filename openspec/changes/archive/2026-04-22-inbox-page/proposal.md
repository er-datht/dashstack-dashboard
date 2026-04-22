## Why

The Inbox page is currently a placeholder stub. The Figma design specifies a full email-client-style inbox with a folder/label sidebar and a chat-style message view. Implementing this completes one of the core navigation pages in DashStack.

## What Changes

- Replace the placeholder Inbox page with a two-panel layout:
  - **Left panel**: Compose button, email folder tabs (Inbox, Starred, Sent, Draft, Spam, Important, Bin) with counts, label list (Primary, Social, Work, Friends) with color-coded icons, and a "Create New label" button
  - **Right panel**: Message header with contact name, label badge, and action buttons (download, info, trash); scrollable chat-style message area with sent/received bubbles, avatars, and timestamps; bottom input area with attachment icons and Send button
- All data is static/mock — no API integration
- Clicking the label badge in the chat header opens a dropdown to change the conversation's label (Primary/Social/Work/Friends)
- Compose, Create New Label, and action buttons show "Coming soon" toasts
- Add i18n translation keys for en and jp
- Support all three themes (light, dark, forest)

## Capabilities

### New Capabilities
- `inbox-view`: Two-panel inbox layout with folder sidebar, label list, chat-style message view, and compose/input areas

### Modified Capabilities
<!-- No existing spec requirements are changing -->

## Impact

- `src/pages/Inbox/index.tsx` — full rewrite (currently placeholder)
- New sub-components under `src/pages/Inbox/`
- New mock data file for messages and folders
- New i18n keys in `public/locales/{en,jp}/inbox.json`
- Existing types in `src/types/inbox.ts` will be used as-is
- `i18n.ts` — add `inbox` to the registered namespaces array
