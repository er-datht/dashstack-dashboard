## 1. Message List Toolbar — Archive on Spam

- [x] 1.1 In `index.tsx`, pass `onBulkArchive={handleBulkArchive}` to MessageList when spam folder is active (extend the existing ARCHIVE_ELIGIBLE_FOLDERS condition to also include spam, or add a separate `|| activeFolder === "spam"` check)
- [x] 1.2 In `MessageList.tsx`, add a conditional Archive button entry in the `buttons` array when both `onBulkNotSpam` and `onBulkArchive` are provided (separate from the first-button-slot, inserted between the first button and Info)

## 2. ChatView — Not Spam + Archive on Spam

- [x] 2.1 Add `onNotSpam?: () => void` prop to `ChatHeaderProps` and destructure it in `ChatHeader`
- [x] 2.2 In `ChatHeader.tsx`, import `ShieldCheck` from lucide-react and add a "Not Spam" button entry in the action buttons array when `onNotSpam` is provided (before Archive)
- [x] 2.3 Add `onNotSpam?: () => void` prop to `ChatViewProps` and pass it through to `ChatHeader`
- [x] 2.4 In `index.tsx`, pass `onNotSpam` to ChatView when spam folder is active (call `handleNotSpam` with `selectedRecord.id` and clear selection)
- [x] 2.5 In `index.tsx`, pass `onArchive` to ChatView when spam folder is active (extend condition to include spam)

## 3. Verification

- [x] 3.1 Run tests and build
