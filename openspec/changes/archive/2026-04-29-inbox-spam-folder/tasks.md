## 1. Mock Data & Types

- [x] 1.1 Add `mockSpamRecords` array (14 `EmailRecord` entries) to `src/pages/Inbox/mockData.ts` with `"spam-"` prefixed IDs, spammy sender names/subjects, mixed label types, and realistic times

## 2. Translation Keys

- [x] 2.1 Add `list.notSpam` and `list.markedNotSpam` keys to `public/locales/en/inbox.json`
- [x] 2.2 Add `list.notSpam` and `list.markedNotSpam` keys to `public/locales/jp/inbox.json`

## 3. State & Data Layer (index.tsx)

- [x] 3.1 Import `mockSpamRecords` in `src/pages/Inbox/index.tsx`
- [x] 3.2 Add `useLocalStorage<string[]>("inbox-restored-spam-ids", [])` state for tracking restored spam IDs
- [x] 3.3 Add `useLocalStorage<EmailRecord[]>("inbox-restored-from-spam", [])` state for restored spam records visible in Inbox
- [x] 3.4 Add `restoredSpamIdSet` (Set) derived from the restored IDs array
- [x] 3.5 Add `handleNotSpam(id: string)` handler: adds ID to restored set, copies the record to restored-from-spam list, shows toast
- [x] 3.6 Add `spam` branch in `getDisplayRecords()`: return `mockSpamRecords` filtered by `!restoredSpamIdSet.has(r.id)`
- [x] 3.7 Include restored-from-spam records in the default (inbox) branch of `getDisplayRecords()` alongside `receivedEmailRecords` and `mockEmailRecords`
- [x] 3.8 Add `spam` to `folderCountOverrides`: `mockSpamRecords.length - restoredSpamIds.length`
- [x] 3.9 Update Starred folder filter in `getDisplayRecords()` to exclude spam records (IDs in `mockSpamRecords` that are NOT in `restoredSpamIdSet`)
- [x] 3.10 Pass `onNotSpam` handler to `MessageList` when `activeFolder === "spam"`

## 4. MessageList UI (MessageList.tsx)

- [x] 4.1 Add `onNotSpam?: (id: string) => void` prop to `MessageListProps`
- [x] 4.2 Import `ShieldCheck` from lucide-react
- [x] 4.3 Add "Not Spam" button block for spam folder rows (after existing bin/archive restore blocks): render `ShieldCheck` icon button when `activeFolder === "spam" && onNotSpam`, with aria-label from `t("list.notSpam")`, tooltip, and same styling pattern as bin restore button

## 5. Verification

- [x] 5.1 Verify spam folder shows 14 records on first load, "Not Spam" removes a record and decrements count
- [x] 5.2 Verify restored spam record appears in Inbox folder
- [x] 5.3 Verify spam count persists across page refresh
- [x] 5.4 Verify clicking a spam row opens ChatView
- [x] 5.5 Verify toolbar buttons show "Coming soon" on spam folder
- [x] 5.6 Verify all 3 themes render correctly on spam folder
