## Context

The Invoice page exists as a placeholder with minimal content. The screenshot shows a static invoice view with sender/recipient info, a line-item table, total calculation, and Print/Send actions — all within a single card on a white background. This is a read-only display page (no editing/form logic), matching the pattern of other static dashboard pages.

## Goals / Non-Goals

**Goals:**
- Replace placeholder with a fully designed invoice card matching the screenshot
- Support all 3 themes (light, dark, forest)
- Add i18n support with new `invoice` namespace (en/jp)
- Use existing Tailwind utility classes and theme tokens — no new dependencies

**Non-Goals:**
- No CRUD operations or API integration (static mock data only)
- No PDF generation or actual print functionality (Print button shows "Coming soon" toast)
- No Send functionality (Send button shows "Coming soon" toast)
- No invoice editing or form fields

## Decisions

### Decision 1: Single-component page
**Choice**: Build the entire invoice as one component in `src/pages/Invoice/index.tsx` with inline mock data
**Rationale**: The page is a static display with no interactivity beyond two button clicks. Extracting sub-components would be over-engineering for this scope.
**Alternatives considered**: Separate InvoiceHeader, InvoiceTable, InvoiceActions components — unnecessary given the simplicity.

### Decision 2: Mock data inline
**Choice**: Define invoice data (sender, recipient, dates, items) as constants within the component file
**Rationale**: No API exists yet. Inline constants are easy to replace later when an API is added. Matches the pattern used in other static pages.

### Decision 3: Toast for Print/Send buttons
**Choice**: Use the existing toast pattern (local `useState` + `useEffect` auto-dismiss) for "Coming soon" feedback
**Rationale**: Consistent with Contact page and other pages that use the same toast approach. No new toast infrastructure needed.

### Decision 4: HTML table for items
**Choice**: Use a native HTML `<table>` styled with Tailwind utilities
**Rationale**: The items table is simple (5 columns, 4 rows, no sorting/pagination). Using `TableCommon` would be overkill. A styled HTML table matches the screenshot's clean look and keeps the component self-contained.

## Risks / Trade-offs

- [Static data] → Acceptable for now; mock data is clearly defined and easy to swap for API data later
- [No real print/send] → Toast feedback sets user expectations; can be wired up in a future change
