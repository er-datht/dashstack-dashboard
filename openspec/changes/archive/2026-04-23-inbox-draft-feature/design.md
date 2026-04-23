## Context

The Inbox page has a functional compose → send flow and a sent folder backed by localStorage. The Draft folder is visible in the sidebar (static count: 9) but non-functional — clicking it shows inbox messages. The `MessageDraft` type exists but is unused. The `MessageFolder` type includes `"drafts"` (plural) which is inconsistent with the folder id `"draft"` (singular).

The sent folder pattern (`useLocalStorage` + `folderCountOverrides` + `EmailRecord` conversion) is the established approach for user-created messages.

## Goals / Non-Goals

**Goals:**
- Users can explicitly save a draft via a "Save as Draft" button in ComposeView
- Drafts auto-save periodically (debounced) when compose form has content
- Drafts persist in localStorage across page refreshes
- Draft folder displays saved drafts with dynamic count
- Clicking a draft re-opens ComposeView pre-filled for continued editing
- Sending a draft removes it from drafts, adds to sent
- Users can delete drafts from the draft folder list
- Fix `MessageFolder` type naming inconsistency

**Non-Goals:**
- Rich text editing in compose body
- Attachment support for drafts
- Draft sharing or server sync
- Discard confirmation dialog on compose close
- Label assignment within ComposeView (can be added later)

## Decisions

### 1. Data model: Extend `MessageDraft` type → `DraftMessage`

Create a new `DraftMessage` type (paralleling `SentMessage`) rather than modifying the existing `MessageDraft` type, since `MessageDraft` represents form state while `DraftMessage` represents a persisted record.

```typescript
type DraftMessage = {
  id: string;
  recipientEmail: string;
  subject: string;
  body: string;
  savedAt: string; // ISO timestamp
};
```

**Why not reuse `MessageDraft`?** `MessageDraft` has `attachments?: File[]` which is not serializable to localStorage. A separate type keeps persistence concerns clean. The original `MessageDraft` can remain for internal compose form typing if needed.

### 2. Storage: localStorage via `useLocalStorage` hook

Key: `"inbox-draft-messages"`, value: `DraftMessage[]`. Same pattern as sent messages.

**Alternative considered**: sessionStorage. Rejected because drafts should survive page refreshes and tab closes.

### 3. Auto-save: `useRef` + `setTimeout` debounce (3-second delay)

When any compose field changes and the form has content (at least one field non-empty), reset a 3-second debounce timer. On expiry, save/update the draft in localStorage. No save occurs if all fields are empty.

**Why 3 seconds?** Balances responsiveness (user doesn't lose much on crash) with performance (not thrashing localStorage on every keystroke). No external dependency needed — `useRef` + `setTimeout` is sufficient.

**Why not `setInterval`?** Debounce-on-change is simpler and only saves when the user is actively typing, avoiding unnecessary writes.

### 4. Draft editing flow

When user clicks a draft row in the Draft folder:
1. Set `showCompose = true` with the draft's data pre-filled
2. Track `editingDraftId` in Inbox state
3. Subsequent saves (auto or explicit) update the existing draft rather than creating a new one
4. Sending clears `editingDraftId` and removes the draft from localStorage

ComposeView receives optional `initialData` prop + `onSaveDraft` callback. It manages its own form state, initialized from `initialData` when provided.

### 5. Draft row display in MessageList

Draft rows use the same `EmailRecord` format as sent records:
- `senderName`: `t("compose.me")` → "Me"
- `labelId`: `""` (empty — no badge displayed, same as sent messages)
- `subject`: draft subject (or `t("compose.noSubject")` if empty)
- `time`: formatted `savedAt` timestamp

No new component needed — `MessageList` already handles empty `labelId` gracefully (no badge rendered).

### 6. Draft deletion

Add an `onDelete` optional callback to `MessageList`. When `activeFolder === "draft"`, each row renders a trash icon button (similar to star button positioning). Clicking it removes the draft from localStorage. No confirmation dialog (matches existing UX patterns).

### 7. Auto-save indicator

Display a small "Saving..." / "Draft saved" text in the ComposeView header area (next to "New Message" / "Edit Draft" title). Use a transient state that shows "Saving..." during save and briefly shows "Draft saved" after, then fades.

## Risks / Trade-offs

- **[localStorage size limit]** → Drafts are small text records; would need thousands to approach the ~5MB limit. Not a practical concern for this use case.
- **[Auto-save race condition with explicit save]** → The debounce timer is cleared on explicit save, preventing double-writes. If user clicks "Save as Draft" while debounce is pending, the explicit save takes priority.
- **[Stale draft in ComposeView]** → If user has compose open and another tab modifies localStorage, the in-memory draft could be stale. Accepted: single-tab usage is the expected pattern for this app.
- **[Empty draft creation on "+ Compose" click]** → Auto-save only triggers when at least one field has content, so clicking Compose and immediately closing won't create an empty draft.
