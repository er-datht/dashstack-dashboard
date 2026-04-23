## ADDED Requirements

### Requirement: Draft data model
The system SHALL define a `DraftMessage` type with fields: `id` (string), `recipientEmail` (string), `subject` (string), `body` (string), and `savedAt` (string, ISO timestamp). The `MessageFolder` type SHALL include `"draft"` (singular) instead of `"drafts"`.

#### Scenario: DraftMessage type structure
- **WHEN** a draft is saved
- **THEN** it is stored as a `DraftMessage` object with `id`, `recipientEmail`, `subject`, `body`, and `savedAt` fields

#### Scenario: MessageFolder type consistency
- **WHEN** the `MessageFolder` type is referenced
- **THEN** it includes `"draft"` (singular) matching the folder id in `mockData.ts`

### Requirement: Explicit save as draft
The ComposeView footer SHALL display a "Save as Draft" button between the Cancel and Send buttons. Clicking "Save as Draft" SHALL persist the current form content (recipientEmail, subject, body) to localStorage under key `"inbox-draft-messages"`. A "Draft saved" toast notification SHALL be displayed after saving. The ComposeView SHALL remain open after saving.

#### Scenario: Save new draft
- **WHEN** user fills in compose fields and clicks "Save as Draft"
- **THEN** a new `DraftMessage` is added to localStorage, a "Draft saved" toast appears, and ComposeView remains open

#### Scenario: Save updates existing draft
- **WHEN** user is editing an existing draft and clicks "Save as Draft"
- **THEN** the existing draft record is updated in localStorage (not duplicated) and a "Draft saved" toast appears

#### Scenario: Save draft with empty fields
- **WHEN** user clicks "Save as Draft" with all fields empty
- **THEN** a draft is still saved (no validation required for drafts, unlike Send)

### Requirement: Auto-save drafts
The ComposeView SHALL auto-save the draft after 3 seconds of inactivity when at least one field (recipientEmail, subject, or body) has content. Auto-save SHALL NOT occur when all fields are empty. Auto-save SHALL update the existing draft if one is being edited, or create a new draft if composing fresh. A subtle "Saving..." indicator SHALL appear during auto-save, transitioning to "Draft saved" briefly after completion.

#### Scenario: Auto-save triggers after inactivity
- **WHEN** user types in any compose field and stops for 3 seconds, and at least one field has content
- **THEN** the draft is automatically saved to localStorage and a "Saving..." → "Draft saved" indicator appears

#### Scenario: Auto-save resets on continued typing
- **WHEN** user types continuously without a 3-second pause
- **THEN** auto-save does not trigger until typing stops for 3 seconds

#### Scenario: Auto-save does not create empty drafts
- **WHEN** user opens ComposeView and does not type anything
- **THEN** no draft is auto-saved

#### Scenario: Auto-save updates existing draft
- **WHEN** user opens an existing draft, edits content, and pauses for 3 seconds
- **THEN** the existing draft is updated in localStorage (not duplicated)

### Requirement: Draft persistence in localStorage
All drafts SHALL be stored in localStorage under key `"inbox-draft-messages"` as a JSON array of `DraftMessage` objects, using the `useLocalStorage` hook. Drafts SHALL persist across page refreshes and browser restarts.

#### Scenario: Drafts persist across refresh
- **WHEN** user saves a draft and refreshes the page
- **THEN** the draft appears in the Draft folder list

#### Scenario: Multiple drafts stored
- **WHEN** user saves three separate drafts
- **THEN** all three drafts are stored in localStorage and visible in the Draft folder

### Requirement: Draft folder displays saved drafts
When the Draft folder is active, the message list SHALL display all saved drafts as rows. Each draft row SHALL show: checkbox, star toggle, "Me" as sender name, no label badge, the draft subject (or a "No subject" fallback if empty), and the saved timestamp formatted as time (e.g., "3:45 PM").

#### Scenario: Draft folder shows draft records
- **WHEN** user clicks the Draft folder tab
- **THEN** the message list displays all saved drafts with "Me" as sender, no label badge, subject text, and saved time

#### Scenario: Empty draft folder
- **WHEN** user clicks the Draft folder tab and no drafts exist
- **THEN** the message list displays an empty state (no rows, pagination shows "Showing 0-0 of 0")

#### Scenario: Draft with empty subject
- **WHEN** a draft has an empty subject field
- **THEN** the draft row displays a "No subject" fallback text

### Requirement: Dynamic draft folder count
The Draft folder tab in the sidebar SHALL display a count equal to the current number of drafts in localStorage. The count SHALL update immediately when a draft is saved, deleted, or sent. The static count of 9 SHALL be replaced by the dynamic count.

#### Scenario: Count starts at zero
- **WHEN** user loads the Inbox page with no saved drafts
- **THEN** the Draft folder count displays 0

#### Scenario: Count increments on save
- **WHEN** user saves a new draft
- **THEN** the Draft folder count increases by 1

#### Scenario: Count decrements on delete
- **WHEN** user deletes a draft
- **THEN** the Draft folder count decreases by 1

#### Scenario: Count decrements on send
- **WHEN** user sends a draft
- **THEN** the Draft folder count decreases by 1

### Requirement: Click draft to edit in ComposeView
When user clicks a draft row in the Draft folder, the right panel SHALL switch to ComposeView pre-filled with the draft's recipientEmail, subject, and body. The ComposeView header SHALL display "Edit Draft" instead of "New Message". Subsequent saves (auto or explicit) SHALL update the existing draft.

#### Scenario: Open draft for editing
- **WHEN** user clicks a draft row in the Draft folder
- **THEN** ComposeView opens with fields pre-filled from the draft data and header shows "Edit Draft"

#### Scenario: Edit and auto-save draft
- **WHEN** user modifies a pre-filled draft field and pauses for 3 seconds
- **THEN** the existing draft is updated in localStorage

### Requirement: Sending a draft removes it
When user sends a message from a draft that is being edited, the draft SHALL be removed from localStorage and the message SHALL be added to the sent messages list. The Draft folder count SHALL decrease by 1 and the Sent folder count SHALL increase by 1.

#### Scenario: Send a draft
- **WHEN** user clicks Send while editing a draft
- **THEN** the draft is removed from localStorage, the message is added to sent messages, and folder counts update accordingly

### Requirement: Draft deletion
Each draft row in the Draft folder SHALL display a trash icon button. Clicking the trash icon SHALL remove the draft from localStorage. The deletion SHALL NOT require a confirmation dialog. The Draft folder count SHALL update immediately.

#### Scenario: Delete a draft
- **WHEN** user clicks the trash icon on a draft row
- **THEN** the draft is removed from localStorage and disappears from the list

#### Scenario: Delete does not open ComposeView
- **WHEN** user clicks the trash icon on a draft row
- **THEN** the ComposeView is not opened and the message list remains displayed

### Requirement: Draft i18n support
All draft-related UI text SHALL use i18n translation keys from the `inbox` namespace. Keys SHALL exist in both `en/inbox.json` and `jp/inbox.json`.

#### Scenario: Draft UI text in English
- **WHEN** language is set to English
- **THEN** draft-related text displays: "Save as Draft", "Draft saved", "Edit Draft", "No subject", "Saving..."

#### Scenario: Draft UI text in Japanese
- **WHEN** language is set to Japanese
- **THEN** draft-related text displays in Japanese equivalents
