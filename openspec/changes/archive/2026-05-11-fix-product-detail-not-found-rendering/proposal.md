## Why

The ProductDetail page at `/products/:id` is supposed to render a friendly "Product not found" empty state with a "Back to Products" button when `getProductById` resolves to `undefined` (existing `product-detail` spec: "Loading, error, and not-found states" requirement, Scenario "Not-found empty state"). In practice, navigating to a route with an id that has no matching mock product (e.g., `/products/7`) renders a raw error message like `["product","7"] data is undefined` inside the page's error branch.

Root cause: React Query v5 forbids `queryFn` from returning `undefined` — when it does, React Query throws an error that flows through `useProduct`'s `error` field. `src/services/products.ts` `getProductById` returns `Promise<Product | undefined>` for missing ids, and `src/hooks/useProduct.ts` passes the return value through to `queryFn` unmapped. The `error` branch in `ProductDetail` intercepts before the `!product` not-found branch is ever reached, so the spec-defined not-found empty state never renders.

This bug was always present but only became user-visible when the just-archived `product-stock-row-click` change added a click path from ProductStock (which has ids 7–12) to `/products/:id` (which only has Products mock ids 1–6).

## What Changes

- `src/hooks/useProduct.ts` — wrap `queryFn` to return `null` when `getProductById` resolves to `undefined`, type the query as `Product | null`, and in the hook's return statement map `data === null` to `{ product: undefined, error: null }`. The hook's public return shape (`UseProductReturn`) stays the same.
- `src/services/products.ts` `getProductById` — **NO CHANGE**. Its public signature stays `Promise<Product | undefined>` so the existing spec scenario wording ("WHEN `getProductById` resolves to `undefined`") remains literally accurate.
- `src/pages/ProductDetail/index.tsx` — **NO CHANGE**. The existing rendering branches (`isLoading → error → !product → loaded`) are already correct; they were just unreachable on the not-found path because `error` got set first.
- Genuine fetch failures (network errors, real exceptions thrown inside `queryFn`) MUST continue to surface as `error: <message>` — only the "service resolved to undefined" path maps to not-found.
- One new hook-level unit test in `src/hooks/__tests__/useProduct.test.ts` exercising the real hook with a `getProductById` mock that resolves `undefined`, asserting `{ product: undefined, error: null, isLoading: false }`. The existing synthetic ProductDetail not-found test stays as-is (it remains a valid contract test for the page's branch ordering, even though the contract is now actually honored upstream).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `product-detail`: tighten the "Loading, error, and not-found states" requirement to make explicit the contract between `useProduct` and `ProductDetail` on the not-found path — `useProduct` returns `{ product: undefined, error: null }` (NOT a React Query error) when `getProductById` resolves to `undefined`, and only genuine fetch failures surface via `error`.

## Impact

- **Code touched**: `src/hooks/useProduct.ts` (one file) and `src/hooks/__tests__/useProduct.test.ts` (new test file).
- **No dependencies added.**
- **No i18n keys added.**
- **No route changes, no SCSS changes, no service-layer signature changes.**
- **No regression risk for other consumers** — `useProduct` is currently only consumed by `src/pages/ProductDetail/index.tsx`. The return shape (`{ product, isLoading, error, refetch }`) is unchanged.
- **Fixes a pre-existing latent bug** surfaced by `product-stock-row-click`. No need to add a defensive check on the ProductStock side; the structural fix is correct on its own.
