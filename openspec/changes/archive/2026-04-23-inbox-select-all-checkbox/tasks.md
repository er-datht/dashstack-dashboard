## 1. i18n

- [x] 1.1 Add `list.selectAll` key to `public/locales/en/inbox.json`
- [x] 1.2 Add `list.selectAll` key to `public/locales/jp/inbox.json`

## 2. Select-All Checkbox

- [x] 2.1 Add `useRef` for the select-all checkbox and import `useRef` in `MessageList.tsx`
- [x] 2.2 Add the select-all checkbox element to the top bar, left of the search input, with the same styling as per-row checkboxes (18x18px, `accent-primary`), `aria-label` from `t("list.selectAll")`, disabled when `visibleRecords.length === 0`
- [x] 2.3 Implement the `onChange` handler: if all visible are selected → clear `selectedIds`; otherwise → add all visible IDs to `selectedIds`
- [x] 2.4 Add `useEffect` to set `checkboxRef.current.indeterminate` when `0 < selectedIds ∩ visibleRecords < visibleRecords.length`, and set `checked` state derived from whether all visible are selected

## 3. Clear Selection on Page Change

- [x] 3.1 Add `page` to the existing `useEffect` dependency array that clears `selectedIds` on `activeFolder` change
