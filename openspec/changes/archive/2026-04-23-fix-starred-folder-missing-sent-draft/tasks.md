## 1. Fix displayRecords logic

- [x] 1.1 Add a "starred" branch to the `displayRecords` ternary in `src/pages/Inbox/index.tsx` that concatenates `mockEmailRecords`, `sentEmailRecords`, and `draftEmailRecords`

## 2. Verify

- [x] 2.1 Confirm starred sent/draft messages appear in Starred folder message list
- [x] 2.2 Confirm clicking a starred sent message opens the chat view with sent message content
- [x] 2.3 Confirm clicking a starred draft message opens the compose view with draft data
- [x] 2.4 Confirm other folders (inbox, sent, draft) still show only their own records
