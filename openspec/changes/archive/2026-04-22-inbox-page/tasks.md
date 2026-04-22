## 1. Mock Data & Types

- [x] 1.1 Create `src/pages/Inbox/mockData.ts` with folder definitions (icon, name, count), label definitions (name, color), mock messages (sender, body, time, isSent), and current contact info

## 2. i18n Translations

- [x] 2.1 Create `public/locales/en/inbox.json` with all translation keys (page title, folder names, label names, button text, section headers)
- [x] 2.2 Create `public/locales/jp/inbox.json` with Japanese translations

## 3. Left Panel Components

- [x] 3.1 Create `FolderItem.tsx` — single folder row with icon, name, count, and active/default state styling
- [x] 3.2 Create `LabelItem.tsx` — single label row with color-coded border square icon and name
- [x] 3.3 Create `InboxSidebar.tsx` — left panel composing Compose button, My Email folder list, Label list, and Create New Label button

## 4. Right Panel Components

- [x] 4.1 Create `ChatBubble.tsx` — message bubble with sent/received variants, avatar, timestamp, more icon
- [x] 4.2 Create `ChatHeader.tsx` — top bar with back button, contact name, clickable label badge with dropdown (cycles through Primary/Social/Work/Friends with color-coded icons), action button group (download, info, trash)
- [x] 4.3 Create `ChatInput.tsx` — bottom area with text input, mic/attachment/image icons, Send button
- [x] 4.4 Create `ChatView.tsx` — right panel composing ChatHeader, scrollable message list, and ChatInput

## 5. Page Assembly

- [x] 5.1 Rewrite `src/pages/Inbox/index.tsx` — page title + two-panel flex layout with InboxSidebar and ChatView, active folder state management, toast notifications

## 6. Theme & Verification

- [x] 6.1 Verify all three themes (light/dark/forest) render correctly — no hardcoded colors
- [x] 6.2 Run `yarn build` and `yarn test` to confirm no errors
