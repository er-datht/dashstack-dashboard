## Context

The InfoModal currently accepts a single `InfoModalData` object and an optional `selectedCount` field for display purposes only. When multiple messages are selected, the modal shows the first message with "1 of N selected" text but no way to navigate. The navigation state needs to live inside the modal component since it's local UI state (which message index is being viewed).

## Goals / Non-Goals

**Goals:**
- Allow browsing all selected messages via Previous/Next buttons
- Keep navigation state internal to InfoModal (current index)
- Maintain single-message behavior unchanged

**Non-Goals:**
- Keyboard shortcuts for navigation (arrow keys) — can be added later
- Editing or acting on messages from within the modal

## Decisions

**1. Change props from single `data` to `items` array**
Instead of `data: InfoModalData | null`, change to `items: InfoModalData[]`. When `items` is empty or `isOpen` is false, render null. This eliminates the `selectedCount` field from `InfoModalData` since the array length provides the count. Rationale: cleanest API — the modal knows everything it needs from the array.

**2. Navigation state internal to InfoModal via `useState`**
A `currentIndex` state (default 0) tracks which message is displayed. Previous/Next buttons increment/decrement the index. Reset to 0 when `items` changes (via `useEffect`). Rationale: navigation is purely UI state, no reason to lift it to the parent.

**3. Nav buttons rendered between counter text and metadata fields**
Two icon buttons (ChevronLeft, ChevronRight) placed inline with the counter text row. Previous disabled when `currentIndex === 0`, Next disabled when `currentIndex === items.length - 1`. Hidden entirely when `items.length <= 1`. Rationale: compact, doesn't add visual weight for single-message case.

**4. Counter text becomes dynamic**
Change from "1 of N selected" to `"${currentIndex + 1} of ${items.length} selected"` using i18n interpolation with both `current` and `count` params. Rationale: reflects actual position.

## Risks / Trade-offs

- **Breaking type change**: `data: InfoModalData | null` → `items: InfoModalData[]` changes the component API. The parent (`index.tsx`) and tests must be updated simultaneously. → Mitigation: single change, both locations are in the same page directory.
