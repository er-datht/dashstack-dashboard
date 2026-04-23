## 1. State Management

- [x] 1.1 Add `labelOverrides` state (`Record<string, string>`) and `handleLabelAssign(recordId, labelId)` callback in `index.tsx`
- [x] 1.2 Apply `labelOverrides` when building `sentEmailRecords` and `draftEmailRecords` — use `labelId: labelOverrides[msg.id] || ""` instead of hardcoded `""`

## 2. Message List UI

- [x] 2.1 Add `onAssignLabel` prop to `MessageList` component (`(recordId: string, labelId: string) => void`)
- [x] 2.2 Add `openLabelDropdownId` local state to `MessageList` to track which row's dropdown is open
- [x] 2.3 Render `Tag` icon button in the label badge slot when `label` is undefined (empty `labelId`), with `aria-label={t("list.addLabel")}` and click handler to toggle dropdown
- [x] 2.4 Render label dropdown below the `Tag` button when `openLabelDropdownId` matches the record id — list all labels with color-coded square icons, matching ChatHeader dropdown styling (`bg-usermenu-bg`, `border-usermenu-border`, etc.)
- [x] 2.5 Handle label selection: call `onAssignLabel(recordId, labelId)`, close dropdown
- [x] 2.6 Handle click-outside and Escape key to close dropdown (same pattern as ChatHeader)
- [x] 2.7 Ensure clicking the `Tag` button does not trigger the row's `onClick` (conversation selection) — use `e.stopPropagation()`

## 3. Internationalization

- [x] 3.1 Add `list.addLabel` translation key to `public/locales/en/inbox.json` (e.g., "Add label")
- [x] 3.2 Add `list.addLabel` translation key to `public/locales/jp/inbox.json`

## 4. Verification

- [x] 4.1 Verify add-label button appears on sent messages (Sent folder) and draft messages (Draft folder)
- [x] 4.2 Verify selecting a label from the dropdown replaces the Tag icon with the colored badge
- [x] 4.3 Verify label persists when switching folders and returning
- [x] 4.4 Verify starred sent/draft messages show assigned label in Starred folder
- [x] 4.5 Verify dropdown closes on click-outside, Escape, and label selection
- [x] 4.6 Verify only one dropdown is open at a time
- [x] 4.7 Verify all 3 themes (light, dark, forest) render correctly
