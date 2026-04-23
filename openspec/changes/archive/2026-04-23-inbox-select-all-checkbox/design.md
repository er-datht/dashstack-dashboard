## Context

The Inbox MessageList (`src/pages/Inbox/MessageList.tsx`) already has per-row checkboxes that toggle individual message IDs in a `selectedIds: Set<string>` state. Bulk actions (delete) operate on this set. Selection is cleared on folder change via a `useEffect`. The top bar layout has a search input on the left and an action-button group on the right.

## Goals / Non-Goals

**Goals:**
- Add a single select-all checkbox to the MessageList top bar
- Support three visual states: unchecked, checked, indeterminate
- Scope selection to the current page's visible records only
- Clear selection on page navigation (consistent with folder-change behavior)

**Non-Goals:**
- Cross-page selection or "select all N messages" banner (like Gmail's)
- Bulk action expansion beyond existing download/info/delete buttons
- Keyboard shortcuts for selection

## Decisions

**1. Placement: left of search input**
The checkbox sits to the left of the search input in the top bar, visually aligned with per-row checkboxes below. This follows the standard email-client pattern (Gmail, Outlook) where the select-all control is vertically aligned with row-level checkboxes.

*Alternative: inside the action-button group on the right.* Rejected — breaks visual alignment with per-row checkboxes.

**2. Indeterminate state via `useRef` + `useEffect`**
The HTML `indeterminate` property is a DOM-only property (not an HTML attribute), so it must be set via a ref. A `useEffect` watches `selectedIds.size` and `visibleRecords.length` to set `checkboxRef.current.indeterminate` when `0 < selected < total`.

*Alternative: custom SVG checkbox component.* Rejected — over-engineered for one checkbox; native indeterminate is well-supported and accessible.

**3. Selection cleared on page change**
Add `page` to the existing `useEffect` dependency array that already clears `selectedIds` on `activeFolder` change. This ensures users don't accumulate invisible selections across pages.

## Risks / Trade-offs

- **[Minimal risk]** Native indeterminate checkbox styling varies slightly across browsers → Acceptable; the behavior is consistent and accessible. Mitigation: accent-color already normalizes appearance via `accent-primary`.
