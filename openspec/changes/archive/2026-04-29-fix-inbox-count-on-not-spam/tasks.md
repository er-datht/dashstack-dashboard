## 1. Fix Inbox Folder Count

- [x] 1.1 In `src/pages/Inbox/index.tsx`, extract the inbox display-record filtering (receivedEmailRecords + activeRestoredFromSpam + inboxMockRecords) out of `getDisplayRecords` so the filtered arrays are available for both display and count calculation
- [x] 1.2 Add `inbox` key to `folderCountOverrides` computed as the sum of the three filtered array lengths

## 2. Test

- [x] 2.1 Add a test in `src/pages/Inbox/__tests__/` that verifies the Inbox sidebar count increments by 1 after clicking "Not Spam" on a spam message
