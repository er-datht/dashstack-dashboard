## Why

The star icon on Inbox message rows currently shows a "Coming soon" toast, and the "Starred" folder tab uses a static count. Users expect stars to be a functional "save for later" affordance: click to toggle, click the Starred folder to see only starred messages. Implementing it is a small, self-contained follow-up to the inbox-page change and noticeably improves the page.

## What Changes

- Add `isStarred` state per email record, stored in `Inbox/index.tsx` as an `id → boolean` map initialized from mock data.
- Replace the star button's "Coming soon" toast in [MessageList.tsx](src/pages/Inbox/MessageList.tsx) with a real toggle that flips the record's starred state.
- Star visuals: outlined (default) vs filled yellow (`text-warning fill-warning`) when starred.
- When the `Starred` folder tab is active, filter the record list to starred records only; other folders show all records (unchanged behavior).
- The Starred folder count SHALL reflect the live number of starred records (not the static `245` from mock data).
- No new translation keys needed — existing `list.star` aria-label covers both states.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `inbox-view`: adds functional star-toggle and Starred-folder filtering on top of the static star icon + folder tabs defined in the inbox-page change.

## Impact

- `src/pages/Inbox/index.tsx` — lift star state here; pass starred map + toggle handler + active folder down to `MessageList`.
- `src/pages/Inbox/MessageList.tsx` — accept `starredIds` + `onToggleStar` + `activeFolder` props; swap the star button's onClick; filter records when `activeFolder === "starred"`; render filled variant when starred.
- `src/pages/Inbox/mockData.ts` — add an `isStarred` field to `EmailRecord` and seed a few records as starred so the Starred tab isn't empty on first load.
- `src/pages/Inbox/InboxSidebar.tsx` / `FolderItem.tsx` — the Inbox/Starred counts should come from the live starred map, not from `inboxFolders[].count`; pass the dynamic starred count in from the page.
- No i18n changes. No new dependencies.
