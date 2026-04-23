## Context

The ComposeView component has two draft-saving mechanisms: (1) auto-save on unmount via a `useEffect` cleanup that captures the latest field values through refs, and (2) an explicit "Save as Draft" button. The auto-save handles all cases where the user leaves compose (close, folder switch, page navigation), making the button redundant.

## Goals / Non-Goals

**Goals:**
- Remove the Save as Draft button from the ComposeView footer
- Clean up orphaned i18n keys

**Non-Goals:**
- Changing auto-save behavior
- Modifying the `onSaveDraft` prop or its `navigateToDraft` parameter (remains available for programmatic use)

## Decisions

**1. Remove button element only**
Delete the Save as Draft button from the footer JSX. The `onSaveDraft` prop and auto-save-on-unmount logic remain unchanged.

## Risks / Trade-offs

- **[Low risk]** Users lose the ability to explicitly save without closing. Mitigated by auto-save on unmount covering all exit paths.
