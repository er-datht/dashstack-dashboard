## 1. Handler (index.tsx)

- [x] 1.1 Add `handleBulkNotSpam(ids: string[])` that calls `handleNotSpam` for each ID, then shows a single toast
- [x] 1.2 Pass `onBulkNotSpam={activeFolder === "spam" ? handleBulkNotSpam : undefined}` to `MessageList`

## 2. MessageList UI (MessageList.tsx)

- [x] 2.1 Add `onBulkNotSpam?: (ids: string[]) => void` prop to `MessageListProps`
- [x] 2.2 Add a spam-folder branch to the toolbar's first button: when `onBulkNotSpam` is provided, show `ShieldCheck` with label `t("list.notSpam")` and key `"bulkNotSpam"`
- [x] 2.3 Add click handler for `"bulkNotSpam"` key: if no selection show toast, else call `onBulkNotSpam` with selected IDs and clear selection

## 3. Verification

- [x] 3.1 Run tests and build
