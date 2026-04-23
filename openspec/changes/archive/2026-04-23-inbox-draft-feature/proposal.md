## Why

The Inbox page has a Draft folder visible in the sidebar but it is non-functional — clicking it shows inbox messages instead of saved drafts. Users cannot save in-progress compositions, losing all work if they close the compose view. Adding draft support completes the email workflow (compose → save → edit → send) and enables auto-save to prevent accidental data loss.

## What Changes

- **Add "Save as Draft" button** to ComposeView footer (between Cancel and Send)
- **Auto-save drafts** with debounced periodic saving when compose form has content
- **Persist drafts in localStorage** (`inbox-draft-messages` key) using the `useLocalStorage` pattern
- **Draft folder shows saved drafts** with dynamic count replacing the static "9"
- **Click a draft row to re-open ComposeView** pre-filled with draft data for continued editing
- **Sending a draft removes it** from the draft list and adds it to sent
- **Draft deletion** via trash icon on draft message rows
- **Fix `MessageFolder` type** — change `"drafts"` to `"draft"` for consistency with folder id
- **Add i18n keys** for draft-related UI text (en/jp)
- **Auto-save indicator** — subtle visual feedback during auto-save (e.g., "Saving..." text)

## Capabilities

### New Capabilities
- `inbox-draft`: Draft message persistence (save, auto-save, load, edit, delete), draft folder display, compose-to-draft flow, auto-save with debounce

### Modified Capabilities
- `inbox-view`: Draft folder becomes functional — `displayRecords` branching, `folderCountOverrides` for draft count, draft row click opens ComposeView instead of ChatView

## Impact

- **Files modified**: `src/pages/Inbox/index.tsx`, `src/pages/Inbox/ComposeView.tsx`, `src/pages/Inbox/MessageList.tsx`, `src/types/inbox.ts`, `src/pages/Inbox/mockData.ts`, `public/locales/en/inbox.json`, `public/locales/jp/inbox.json`
- **New files**: None expected — all changes fit within existing file structure
- **Dependencies**: No new packages — uses existing `useLocalStorage`, `crypto.randomUUID()`, `useEffect`/`useRef` for debounce
- **Storage**: New localStorage key `inbox-draft-messages`
- **Breaking**: `MessageFolder` type changes `"drafts"` → `"draft"` (**BREAKING** for any code referencing `"drafts"`)
