## Context

The Inbox message list rows render a color-coded label badge when `record.labelId` matches a known label. When `labelId` is empty (sent messages, draft messages, and potentially future unlabelled records), nothing renders in that space. The ChatHeader component already has a working label dropdown pattern (click-outside close, Escape key, color-coded items) that can be reused.

## Goals / Non-Goals

**Goals:**
- Show a clickable "add label" icon button in the label badge slot when a message has no label
- Open a dropdown with the 4 available labels on click, reusing the ChatHeader dropdown visual pattern
- Assign the selected label to the message, replacing the button with the colored badge
- Persist label assignments in component state for the session (sent/draft records are already ephemeral localStorage data)

**Non-Goals:**
- Changing or removing an already-assigned label from the message list (existing badges stay static in the list; label changes happen in ChatHeader)
- Persisting label assignments to localStorage (would require extending the `SentMessage` / draft data model — separate change)
- Adding a label picker to the ComposeView form

## Decisions

### 1. Label assignment state lives in the Inbox parent (`index.tsx`)

**Choice:** Add a `labelOverrides: Record<string, string>` state in `index.tsx` that maps `recordId → labelId`. Pass it (and a setter) to `MessageList`. When building `EmailRecord` objects, merge overrides so the existing `labels.find()` lookup just works.

**Why over alternative (state inside MessageList):** The parent already manages all record data (sent, draft, bin, starred). Keeping label state there keeps the data flow consistent and allows the label to persist across folder switches.

### 2. Apply override at record-building time

**Choice:** When creating `sentEmailRecords` and `draftEmailRecords`, use `labelId: labelOverrides[msg.id] || ""` instead of hardcoded `""`. This way `MessageList` doesn't need to know about overrides — it just sees records with or without labelIds.

**Why:** Minimizes changes to `MessageList` — the existing `labels.find()` + conditional render logic stays untouched for the badge display path. Only the "empty label" branch gets the new button.

### 3. Inline dropdown in MessageList row (not a shared component)

**Choice:** Add the dropdown directly in the `MessageList` row's label slot, similar to how `ChatHeader` does it inline. Use the same visual pattern (absolute-positioned, `bg-usermenu-bg`, color-coded squares, click-outside/Escape close).

**Why over extracting a shared `LabelDropdown` component:** Only two places use this (ChatHeader and MessageList). Extracting would require reconciling their slightly different trigger UI (badge button vs. icon button). Duplication is minimal (~30 lines) and keeps each component self-contained.

### 4. Trigger icon: `Tag` from lucide-react

**Choice:** Use the `Tag` icon (already available in lucide-react) as the add-label button. Style it with `text-secondary hover:text-primary` to match other icon buttons in the row. Size: `w-4 h-4` matching other row icons.

**Why:** Tag icon is universally understood as "label/tag." It's subtle enough not to dominate the row but clearly communicates the affordance.

## Risks / Trade-offs

- **Dropdown in a scrollable list** — The dropdown renders inside the message list's scrollable container. With `z-50` and `absolute` positioning, it may clip at the bottom of the scroll area for the last few rows. → Mitigation: Use `position: fixed` with calculated coordinates if clipping is observed during testing; otherwise keep it simple with `absolute`.
- **Session-only persistence** — Label assignments for sent/draft messages don't survive page reload. → Acceptable for now; extending localStorage persistence is a separate change if needed.
- **Single dropdown open at a time** — Need to track which row's dropdown is open (by record id) so only one is open at a time. → Store `openLabelDropdownId: string | null` in MessageList local state.
