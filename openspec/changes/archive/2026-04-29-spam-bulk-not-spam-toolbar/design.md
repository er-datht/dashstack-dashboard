## Context

The Spam folder toolbar currently shows Download (placeholder), Info, and Trash2. The Download button shows "Coming soon" on click. Per-row "Not Spam" (`ShieldCheck`) already works for single messages. The toolbar's first button slot is context-sensitive: Archive on archive-eligible folders, RotateCcw on archive folder, Download as fallback.

## Goals / Non-Goals

**Goals:**
- Replace Download with ShieldCheck bulk "Not Spam" on the Spam folder toolbar
- Reuse existing `handleNotSpam` logic for each selected message

**Non-Goals:**
- Changing the toolbar trash button behavior on Spam folder (remains "Coming soon")
- Adding bulk "Not Spam" to any other folder

## Decisions

**Add a new spam-folder branch to the toolbar's first button logic.**

The existing `archiveOrDownloadButton` ternary becomes: archive folder → RotateCcw, spam folder with `onBulkNotSpam` → ShieldCheck, archive-eligible → Archive, else → Download.

**`handleBulkNotSpam` loops over `handleNotSpam` per ID.** The existing `handleNotSpam` already handles both user-spammed and pre-seeded mock spam. Looping reuses that logic without duplication. Selection is cleared after the action.

## Risks / Trade-offs

- Calling `handleNotSpam` per ID in a loop triggers multiple state updates. Acceptable for the small number of selected messages (max 12 per page).
