## Context

The Inbox page (landed in the pending `inbox-page` change) renders a two-panel layout with a folder sidebar and a message list. Each row shows a star button that currently fires `onShowToast("Coming soon")`. The `Starred` folder tab is present but inert. We want to wire both to real behavior while keeping the feature self-contained (no backend, still mock data).

## Goals / Non-Goals

**Goals:**
- Star is a toggle: first click marks the record starred (filled yellow icon), second click unstars it (outlined icon).
- Starred folder filters the visible records to `isStarred === true`.
- The `Starred` folder count in the sidebar is driven by live state, not the static `245`.
- Starred state persists across folder switches within a session (keyed on record id).

**Non-Goals:**
- Persistence across page reloads (no localStorage). Matches how the rest of the Inbox page treats mock state.
- Star toggling inside the `ChatView` header. Scope is the `MessageList` row star only.
- Multi-select bulk-star via the row checkbox.
- Keyboard shortcuts (e.g., `s` to star).

## Decisions

**1. State lives in `Inbox/index.tsx` as a `Record<string, boolean>` map.**
- Why not on the `EmailRecord` objects themselves? Mutating `mockEmailRecords` would break the "mockData is a constant" assumption and leak state across remounts. A sibling `starredIds` map keyed by `record.id` keeps mock data immutable and makes the toggle a pure `setState` call.
- Why not a `Set<string>`? A plain object works with React's structural equality, is easy to seed from `mockEmailRecords` via `Object.fromEntries`, and is trivial to pass to children.
- Alternative considered: context (`WishlistContext`-style). Overkill — only two components need the state (`Inbox`, `MessageList`), and the page already owns similar UI state (selected record, active folder).

**2. Seed starred state from a new `isStarred?: boolean` field on `EmailRecord`.**
- Keeps the initial starred set declarative in `mockData.ts`. A handful of records (3–4) will be seeded as starred so the Starred tab isn't empty on first visit.
- The field is optional to avoid touching every existing record.

**3. Filtering happens inside `MessageList` based on a new `activeFolder` prop.**
- `MessageList` already owns pagination and search filtering. Adding a third filter stage (`records → folder filter → search filter → paginate`) keeps that logic co-located.
- Filter rule: if `activeFolder === "starred"`, keep only `starredIds[record.id] === true`. All other folders render the full list (unchanged behavior — no per-folder data yet).
- Changing folders resets `page` to 0 to avoid showing an empty page after filtering.

**4. Starred folder count is computed, not stored.**
- In `Inbox/index.tsx`, derive `starredCount = Object.values(starredIds).filter(Boolean).length`.
- Pass a `folderCounts` override (or just a dedicated `starredCount`) into `InboxSidebar`; merge with `inboxFolders[].count` so only `starred` overrides the static value. Inbox/Sent/Draft/etc. keep their mock counts — those are out of scope.

**5. Visual state: filled yellow icon when starred.**
- Use `lucide-react`'s `Star` with `fill="currentColor"` + `text-warning` when starred; default stays `text-secondary hover:text-warning`.
- No new CSS — `text-warning` is already defined in the theme.

## Risks / Trade-offs

- **Re-renders**: toggling one row re-renders the whole `MessageList` because `starredIds` changes identity. Acceptable — the list is ≤13 items and React Compiler handles memoization. No need to pre-optimize.
- **Starred count drift if new records are added dynamically**: records are static mock data, so this isn't a live concern. If we later add "compose → new record," the count will still be correct because it's derived.
- **Empty Starred view**: if the user unstars everything while on the Starred tab, they see an empty list. Not a regression — the list component already handles empty arrays (it just renders no rows). We could add an empty-state message, but that's out of scope; the existing "Showing 0-0 of 0" pagination label is acceptable for mock data.
- **Folder counts for non-starred folders stay static**: intentional. Implementing real per-folder bucketing would require tagging each mock record with a folder, which is a bigger change than starring warrants.
