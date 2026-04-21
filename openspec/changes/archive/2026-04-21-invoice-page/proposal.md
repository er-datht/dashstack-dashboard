## Why

The Invoice page currently exists as a placeholder with no functional content. The dashboard needs a fully designed invoice view matching the provided screenshot — displaying sender/recipient details, a line-item table, total calculation, and Print/Send actions. This completes a key business page in the dashboard.

## What Changes

- Replace the placeholder Invoice page with a fully designed invoice card layout
- Add invoice header section with "Invoice From" (sender name + address), "Invoice To" (recipient name + location), and dates (Invoice Date, Due Date)
- Add a 5-column items table (Serial No., Description, Quantity, Base Cost, Total Cost) with mock data (4 items)
- Add total row summing all item costs
- Add Print icon button and Send action button at the bottom right
- Add i18n translations for en/jp (new `invoice` namespace)
- Support all 3 themes (light, dark, forest)

## Capabilities

### New Capabilities
- `invoice-view`: Invoice page layout with sender/recipient header, items table, total calculation, and Print/Send action buttons

### Modified Capabilities
- `i18n-config`: Register new `invoice` namespace in i18n.ts

## Impact

- `src/pages/Invoice/index.tsx` — replace placeholder with full invoice UI
- `i18n.ts` — add `invoice` namespace
- `public/locales/en/invoice.json` and `public/locales/jp/invoice.json` — new translation files
- `src/index.css` — may need minor token additions if any new utility classes are needed
- No new dependencies required
