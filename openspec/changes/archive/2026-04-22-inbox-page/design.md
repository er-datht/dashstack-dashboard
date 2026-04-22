## Context

The Inbox page (`/inbox`) exists as a placeholder stub. Route, sidebar nav, and TypeScript types (`src/types/inbox.ts`) are already wired. The Figma design shows a two-panel email client layout with folder navigation, label management, and a chat-style message view.

## Goals / Non-Goals

**Goals:**
- Implement the full Inbox UI matching the Figma design
- Static mock data — functional UI without backend
- Theme support (light/dark/forest) using existing design tokens
- i18n support (en/jp)

**Non-Goals:**
- Real API integration or data persistence
- Compose modal / new message flow (toast placeholder only)
- Real-time messaging, WebSocket, or polling
- Search or filtering within messages
- Label CRUD (create/edit/delete — toast placeholder only, but selecting an existing label on a conversation is in scope)

## Decisions

### Component decomposition

Split the page into focused sub-components under `src/pages/Inbox/`:

| Component | Responsibility |
|-----------|---------------|
| `index.tsx` | Page shell — title + two-panel flex layout |
| `InboxSidebar.tsx` | Left panel: Compose button, folder tabs, label list |
| `FolderItem.tsx` | Single folder row (icon, name, count, active state) |
| `LabelItem.tsx` | Single label row (color-coded square, name) |
| `ChatView.tsx` | Right panel: header, messages, input area |
| `ChatHeader.tsx` | Top bar: back button, contact name, badge, action icons |
| `ChatBubble.tsx` | Single message bubble (sent vs received variants) |
| `ChatInput.tsx` | Bottom area: text input, action icons, Send button |

**Why**: Each component maps to a visual section in the Figma. Keeps files small and testable. Follows existing patterns (e.g., Calendar sub-components).

### Mock data approach

Static arrays in `src/pages/Inbox/mockData.ts` for folders (with counts), labels (with colors), messages (with sender/body/time), and current conversation contact info.

**Why**: Matches how Calendar and Contact pages handle mock data. No service/hook needed since there's no API.

### Styling approach

Tailwind utility classes with theme-aware tokens from `src/index.css` (`.bg-surface`, `.text-primary`, `.card`, etc.). No SCSS module needed — the layout is straightforward flexbox.

- Chat bubbles: sent uses `bg-primary text-on-primary`, received uses `bg-surface-secondary text-primary`
- Active folder tab: `bg-brand-light text-brand`
- Label colors: inline `style={{ borderColor }}` since they're dynamic per-label

### Folder state management

`useState` for `activeFolder` (default: `"inbox"`). Clicking a folder updates the active state visually. No message filtering — all panels show the same mock conversation regardless of folder.

**Why**: Keeps scope minimal. Filtering can be added later with real data.

### Label badge dropdown in chat header

The "Primary" badge in `ChatHeader` is clickable. Clicking it opens a dropdown listing all labels (Primary, Social, Work, Friends) with their color-coded square icons. Selecting a label updates the badge text and color via `useState` for `activeLabel` (default: `"primary"`). The dropdown closes on selection or outside click (reuse the click-outside pattern from existing dropdowns like UserMenu/NotificationDropdown).

**Why**: The Figma design shows the badge as interactive. This is a local UI state change — no persistence needed.

## Risks / Trade-offs

- **Static data means no real interaction** → Acceptable for this phase. Compose/label buttons show toast.
- **Chat view shows same conversation for all folders** → Obvious to users but scope-appropriate. Can be enhanced when API is integrated.
- **Fixed layout may need responsive adjustments** → Left panel collapses or hides on mobile. Start with desktop layout matching Figma, add responsive behavior with standard breakpoints.
