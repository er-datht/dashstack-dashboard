## Context

The Settings page already has a toast pattern: `showToast` state + `toastMessage` display + auto-dismiss after 3s. Currently only triggered on save. Need to also trigger on successful logo upload.

## Goals / Non-Goals

**Goals:**
- Show success toast when logo is uploaded via click or drag & drop
- Reuse existing toast infrastructure (no new component)

**Non-Goals:**
- No error toast for invalid files (silently rejected as before)

## Decisions

### 1. Generalize toast to accept dynamic messages
**Choice**: Replace the hardcoded `t("settingsSaved")` with a `toastMessage` state that can hold different messages. Both save-success and upload-success set their own message.
**Rationale**: Avoids duplicating toast UI. Single toast element, multiple triggers.

## Risks / Trade-offs

- **[Overlapping toasts]** If user uploads logo then immediately saves, the second toast replaces the first. → Acceptable — same single-toast pattern used throughout the app.
