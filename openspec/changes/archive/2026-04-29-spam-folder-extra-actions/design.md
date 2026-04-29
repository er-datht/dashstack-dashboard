## Context

The Spam folder message list toolbar currently shows: ShieldCheck (Not Spam), Info, Trash. The first button slot is context-sensitive — on spam it shows Not Spam. Archive is only passed on ARCHIVE_ELIGIBLE_FOLDERS. The ChatView header shows: Archive, Info, Trash — but Archive is not passed on spam folder (not archive-eligible), so it falls through to "Coming soon".

## Goals / Non-Goals

**Goals:**
- Toolbar: Add Archive as a separate button on spam folder (4 buttons: Not Spam, Archive, Info, Trash) by passing `onBulkArchive` when spam is active
- ChatView: Add Not Spam button to header when viewing a spam message

**Non-Goals:**
- Changing the first-button-slot logic (Not Spam stays as the first button)
- Adding Archive to the ChatView header for spam (it already has the Archive button, just needs `onArchive` passed)

## Decisions

**Toolbar Archive on spam**: Pass `onBulkArchive` to MessageList when spam folder is active. The existing toolbar logic already handles Archive when `onBulkArchive` is provided — but currently the first-button ternary short-circuits to ShieldCheck when `onBulkNotSpam` is truthy. Fix: add a separate conditional Archive button entry in the `buttons` array (between Not Spam and Info) when both `onBulkNotSpam` and `onBulkArchive` are provided.

**ChatView Not Spam**: Add `onNotSpam` optional prop to ChatHeader and ChatView. Render ShieldCheck button in ChatHeader's action buttons array when `onNotSpam` is provided. Pass the handler from index.tsx when `activeFolder === "spam"`.

**ChatView Archive on spam**: Also pass `onArchive` to ChatView when spam is active so the existing Archive button works instead of showing "Coming soon".

## Risks / Trade-offs

- Toolbar grows to 4 buttons on spam folder. Acceptable — matches the 4-button toolbar on inbox/starred/sent folders.
