## 1. Data Model & Type Fixes

- [x] 1.1 Add `DraftMessage` type to `src/types/inbox.ts` with fields: `id`, `recipientEmail`, `subject`, `body`, `savedAt`
- [x] 1.2 Fix `MessageFolder` type: change `"drafts"` to `"draft"` in the union type
- [x] 1.3 Remove unused `attachments` field from `MessageDraft` type (or remove `MessageDraft` entirely if unused after this change)

## 2. i18n Translations

- [x] 2.1 Add draft-related keys to `public/locales/en/inbox.json`: `compose.saveAsDraft`, `compose.draftSaved`, `compose.editDraft`, `compose.noSubject`, `compose.saving`
- [x] 2.2 Add draft-related keys to `public/locales/jp/inbox.json` with Japanese translations

## 3. Draft State Management in Inbox

- [x] 3.1 Add `useLocalStorage<DraftMessage[]>("inbox-draft-messages", [])` state to Inbox `index.tsx`
- [x] 3.2 Add `editingDraftId` state (`string | null`) to track which draft is being edited
- [x] 3.3 Add `folderCountOverrides` entry for `draft` folder (dynamic count from `draftMessages.length`)
- [x] 3.4 Convert `DraftMessage[]` to `EmailRecord[]` for draft folder display (sender: "Me", no label, subject with "No subject" fallback, formatted savedAt time)
- [x] 3.5 Update `displayRecords` logic to branch on `activeFolder === "draft"` showing draft records

## 4. ComposeView Enhancements

- [x] 4.1 Add optional `initialData` prop to ComposeView (`{ recipientEmail, subject, body }`) and initialize form fields from it
- [x] 4.2 Add optional `editingDraftId` prop and `onSaveDraft` callback prop
- [x] 4.3 Add "Save as Draft" button in footer between Cancel and Send
- [x] 4.4 Implement explicit save: call `onSaveDraft` with form data and current `editingDraftId`, show "Draft saved" toast
- [x] 4.5 Implement auto-save: 3-second debounce via `useRef`/`setTimeout`, triggers when any field has content, shows "Saving..." → "Draft saved" indicator in header
- [x] 4.6 Update header to show "Edit Draft" when `editingDraftId` is set, "New Message" otherwise
- [x] 4.7 Add auto-save status indicator text next to header title (subtle "Saving..." / "Draft saved" text)

## 5. Draft Handlers in Inbox

- [x] 5.1 Implement `handleSaveDraft` in Inbox: creates new draft (with `crypto.randomUUID()`) or updates existing by `editingDraftId`
- [x] 5.2 Implement `handleDraftClick`: sets `showCompose = true`, passes draft data as `initialData`, sets `editingDraftId`
- [x] 5.3 Update `handleComposeSend` to remove draft from localStorage when sending an edited draft (by `editingDraftId`), then clear `editingDraftId`
- [x] 5.4 Update `handleComposeClose` to clear `editingDraftId`
- [x] 5.5 Update `handleCompose` (new compose) to clear `editingDraftId` and pass no `initialData`

## 6. Draft Deletion in MessageList

- [x] 6.1 Add optional `onDelete` prop to `MessageList` component
- [x] 6.2 Render trash icon button on each row when `activeFolder === "draft"` (positioned before timestamp)
- [x] 6.3 Implement `handleDeleteDraft` in Inbox: removes draft from localStorage by id
- [x] 6.4 Pass `onDelete` to MessageList when `activeFolder === "draft"`

## 7. Draft Row Click Routing

- [x] 7.1 Update Inbox `renderRightPanel` to pass `initialData`, `editingDraftId`, and `onSaveDraft` to ComposeView
- [x] 7.2 Update `handleSelectRecord` to detect draft folder and route to `handleDraftClick` instead of opening ChatView
- [x] 7.3 Ensure clicking a draft row in MessageList calls `onSelect` which triggers the draft edit flow

## 8. Verification

- [x] 8.1 Verify TypeScript compiles without errors (`yarn build`)
- [x] 8.2 Verify all three themes (light, dark, forest) render draft UI correctly
- [x] 8.3 Verify i18n works for both en and jp languages
- [x] 8.4 Test full flow: compose → auto-save → close → open draft → edit → send (draft removed, sent added)
- [x] 8.5 Test draft deletion flow
- [x] 8.6 Test draft folder count updates dynamically
