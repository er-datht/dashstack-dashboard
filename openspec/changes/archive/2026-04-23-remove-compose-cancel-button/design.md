## Context

The ComposeView component (`src/pages/Inbox/ComposeView.tsx`) renders a footer with three buttons: Cancel, Save as Draft, and Send. The Cancel button calls `onClose`, which is the same handler triggered by the X button in the header. This makes Cancel redundant.

## Goals / Non-Goals

**Goals:**
- Remove the Cancel button from the ComposeView footer
- Preserve the X close button in the header as the sole dismiss control

**Non-Goals:**
- Changing the behavior of the X button or any other footer buttons
- Adding a confirmation dialog before closing

## Decisions

**1. Remove Cancel button element only**
Delete the Cancel `<button>` element from the footer JSX. No other changes needed — the `onClose` prop and X button remain unchanged.

*Alternative: Hide with CSS.* Rejected — dead code should be removed, not hidden.

## Risks / Trade-offs

- **[No risk]** The X button already handles dismissal identically. No functionality is lost.
