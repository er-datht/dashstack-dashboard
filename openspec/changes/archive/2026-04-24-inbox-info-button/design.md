## Context

The Inbox page has Info buttons in two locations (MessageList top bar and ChatHeader) that currently show "Coming soon" toasts. The app already has a `ConfirmModal` pattern in Calendar (`src/pages/Calendar/ConfirmModal.tsx`) with overlay, focus trap, escape key, body scroll lock, and ARIA attributes. The Inbox page manages selected records via `selectedRecord` state and bulk-selected IDs via `selectedIds` Set in MessageList.

## Goals / Non-Goals

**Goals:**
- Make the Info button functional in both MessageList and ChatHeader
- Display message metadata in an accessible modal dialog
- Follow existing modal patterns (ConfirmModal) for consistency
- Support all 3 themes

**Non-Goals:**
- Editing message metadata from the info modal
- Showing full message body content (that's what the chat view is for)
- Adding info buttons to individual message rows
- Creating a shared/reusable modal primitive (ConfirmModal is also page-local; follow that pattern)

## Decisions

**1. Single `InfoModal` component in `src/pages/Inbox/`**
Co-located with the Inbox page, not in shared components. Rationale: ConfirmModal follows this same pattern (lives in Calendar/), and this modal is inbox-specific. It accepts a data prop and renders metadata fields.

**2. State managed in Inbox `index.tsx`**
A single `infoModalData` state (`InfoModalData | null`) controls visibility and content. When non-null, the modal is open. Both MessageList and ChatHeader call an `onShowInfo` callback that sets this state. Rationale: index.tsx already manages all cross-component state (selectedRecord, folders, labels). Keeps modal state centralized.

**3. Modal displays a read-only metadata card**
Fields: sender/contact name, subject (with react-tooltip for truncated content), label (with colored badge), date and time (formatted as locale date + time), starred status, folder. X icon close button in the header (no bottom close button). For bulk selection in MessageList, show info for the first selected message with a count indicator. Rationale: keeps it simple and useful — shows data that isn't always visible at a glance.

**4. Follow ConfirmModal accessibility pattern**
Focus trap, escape key dismiss, overlay click dismiss, body scroll lock, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`. Rationale: proven pattern already in the codebase, meets accessibility requirements.

**5. MessageList Info follows same guard as Archive/Delete**
Check `selectedIds.size === 0` → show "No messages selected" toast. Rationale: consistent UX — all three top-bar actions behave identically when nothing is selected.

## Risks / Trade-offs

- **Limited data in EmailRecord type**: EmailRecord only has id, senderName, labelId, subject, time, isStarred. Richer data (read status, attachments, folder) is on the Message type but not directly available in the list view. → Mitigation: show what's available from EmailRecord for list context; show richer data from conversation context in ChatHeader's info modal.
- **Single-message info for bulk selection**: When multiple messages are selected, showing info for just the first one may feel incomplete. → Mitigation: show count of selected messages and info for the first one. Full multi-message info would add complexity without clear value for a dashboard demo.
