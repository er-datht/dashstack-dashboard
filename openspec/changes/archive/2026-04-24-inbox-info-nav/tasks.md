## 1. i18n Keys

- [x] 1.1 Update `public/locales/en/inbox.json`: change `info.selectedCount` to support `current` and `count` params (e.g., "{{current}} of {{count}} selected"), add `info.previous` ("Previous") and `info.next` ("Next")
- [x] 1.2 Update `public/locales/jp/inbox.json`: same changes in Japanese

## 2. InfoModal Component Changes

- [x] 2.1 Update `InfoModal.tsx`: change props from `data: InfoModalData | null` to `items: InfoModalData[]`. Remove `selectedCount` from `InfoModalData` type. Add `currentIndex` state (default 0), reset to 0 when `items` changes. Derive displayed data from `items[currentIndex]`. Return null when `!isOpen` or `items.length === 0`.
- [x] 2.2 Add Previous/Next buttons in InfoModal: render ChevronLeft/ChevronRight icon buttons between counter text and metadata fields when `items.length > 1`. Previous disabled at index 0, Next disabled at last index. Buttons use i18n keys and have aria-labels.
- [x] 2.3 Update counter text to use dynamic `t("info.selectedCount", { current: currentIndex + 1, count: items.length })`. Only render when `items.length > 1`.

## 3. Parent Wiring

- [x] 3.1 Update `src/pages/Inbox/index.tsx`: change `infoModalData` state from `InfoModalData | null` to `InfoModalData[]`. Update `handleMessageListShowInfo` to build an array of InfoModalData for all selected records. Update `handleChatShowInfo` to pass a single-element array. Update InfoModal render to pass `items={infoModalData}` and `isOpen={infoModalData.length > 0}`, `onClose={() => setInfoModalData([])}`.

## 4. Tests

- [x] 4.1 Update `InfoModal.test.tsx`: change test setup from `data` prop to `items` prop. Update selected count tests for new interpolation format. Add tests for Previous/Next navigation (click next updates content, click prev updates content, prev disabled at index 0, next disabled at last index, no nav buttons for single item).
