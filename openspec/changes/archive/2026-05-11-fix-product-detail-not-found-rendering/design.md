## Context

`useProduct(id)` in `src/hooks/useProduct.ts` wraps `useQuery({ queryKey: ["product", id], queryFn: () => getProductById(id) })`. The service `getProductById(id)` (`src/services/products.ts:180–186`) returns `Promise<Product | undefined>` — it resolves to `undefined` for ids not in the mock data, never throws.

`@tanstack/react-query` is pinned at `5.90.5` (`package.json:16`). In React Query v5 the `queryFn` contract forbids returning `undefined`; doing so triggers an internal error with the message `"Query data cannot be undefined. Please make sure to return a value other than undefined from your query function."` and the error flows through to the query's `error` field. `useProduct` passes this through verbatim: `error: error ? (error as Error).message : null`.

`ProductDetail` (`src/pages/ProductDetail/index.tsx:105–149`) renders branches in order: `isLoading → error → !product → loaded`. Once `error` is non-null, the `!product` not-found branch is unreachable. The "Product not found" empty state defined in the existing `product-detail` spec is therefore unreachable for any id not in mock data, and the user sees the raw React Query error message instead.

The just-archived `product-stock-row-click` change made this discoverable by introducing a click path from the ProductStock listing (ids 7–12+) to `/products/:id` (Products mock ids 1–6). The fix scope is `useProduct` only.

## Goals / Non-Goals

**Goals:**

- A user navigating to `/products/:id` with an id not in mock data sees the spec-defined "Product not found" empty state, not the React Query error.
- The contract between `useProduct` and the page stays explicit: `product: undefined, error: null` means not-found; non-null `error` means a real failure.
- No public API change to `getProductById` (the existing `product-detail` spec literally says "WHEN `getProductById` resolves to `undefined`" — preserve that wording).
- One new hook-level test pins the new behavior at the unit-test boundary.

**Non-Goals:**

- Re-architecting `getProductById`'s return type into a tagged union or Result wrapper. Out of scope.
- Introducing a typed error class for not-found. The sentinel-null approach (Decision 1) makes this unnecessary.
- Migrating other hooks (`useTodos`, `useProducts`, `useDeals`, `useBanners`) to the same pattern. None of them return `undefined` semantically — they return arrays — so the React Query v5 trap doesn't apply.
- Adding a global ErrorBoundary or rewriting `ProductDetail`'s branch ordering. The page is correct; the upstream hook is the bug.
- Backfilling Products mock data to include ids 7+. Wrong layer to fix the symptom.

## Decisions

### Decision 1: Sentinel `null` inside `queryFn`, not message-string matching on the error

**Choice:** Inside `useProduct`, change `queryFn` to:

```ts
queryFn: async () => (await getProductById(id as string)) ?? null
```

Type the query data as `Product | null`. In the hook's return mapping, treat `data === null` as not-found (`product: undefined, error: null`) and any non-null `data` as a loaded product. The query's `error` channel is reserved for real failures (network errors, real exceptions inside the await).

**Why:** React Query v5 forbids `undefined` but allows `null` — `null` is a legal `queryFn` return. By collapsing the absent case to `null` at the queryFn boundary, we never trigger React Query's "undefined data" error path, so the hook's `error` field is never polluted by the not-found case. Detection is structural (`data === null`), not string-matching against React Query's internal error message.

**Alternative considered:** Detect the React Query "undefined data" error by string-matching `(error as Error).message`. Rejected — couples the codebase to React Query v5's exact error wording (a private implementation detail), would break silently on a future React Query version that re-words the message, and conflates "couldn't fetch" with "fetched and got nothing."

**Alternative considered:** Change `getProductById` to throw a `NotFoundError` and catch it in `useProduct`. Rejected — changes the service's public contract, violates the existing spec's literal wording ("resolves to `undefined`"), and introduces a typed-error pattern that no other service in the codebase uses.

**Alternative considered:** Change `getProductById`'s return type to `Product | null`. Rejected — also changes the public contract and forces every other consumer (none exist today, but the door stays open) to handle the `null` case explicitly.

### Decision 2: Map at the hook's return statement, not via React Query's `select` option

**Choice:** Keep the `useQuery` call's `data` typed as `Product | null`, then in the hook's return statement compute `const product = data ?? undefined;`. Do NOT use React Query's `select` option to transform `null → undefined` upstream of the hook.

**Why:** `select` runs on every render and adds another memoization concern. A direct `data ?? undefined` in the hook's return is one expression, free of memoization edge cases, and reads as obvious mapping. Same number of lines, less indirection.

**Alternative considered:** Use `select: (data) => data ?? undefined` on the `useQuery` call. Rejected — `useQuery`'s `data` type would then be `Product | undefined`, which is exactly the shape React Query forbids inside `queryFn` and produces a confusing type-inference chain. Marginal gain at best.

### Decision 3: Preserve `getProductById`'s `Promise<Product | undefined>` signature

**Choice:** Do NOT change `src/services/products.ts`'s exported signature. The `?? null` happens inside the `queryFn` arrow function in `useProduct.ts`, NOT inside the service.

**Why:** The existing `product-detail` spec literally says "WHEN `getProductById` resolves to `undefined`" — preserving that signature keeps the spec's wording accurate. It also leaves the service's contract reusable for any future caller that does not go through React Query (e.g., a server-side use, a unit test, a console debug). Wrapping happens at the hook layer because the hook is the one that has the React Query v5 constraint to satisfy.

**Alternative considered:** Move the `?? null` into `getProductById` itself, returning `Promise<Product | null>`. Rejected — leaks a React Query implementation detail into the service layer.

### Decision 4: One hook-level test, no new ProductDetail integration test

**Choice:** Add `src/hooks/__tests__/useProduct.test.ts` with one test exercising the real hook (via `QueryClientProvider` wrapper) with `getProductById` mocked to resolve `undefined`. Assert the hook returns `{ product: undefined, isLoading: false, error: null }`. Also add one happy-path test (mock resolves a real product) and one error-path test (mock throws) to lock the three branches at the hook boundary. The existing `ProductDetail.test.tsx` setNotFound test stays as-is — it tests the page's rendering contract given `product: undefined, error: null`, which is correct synthetic behavior.

**Why:** The bug is in the hook, so the test belongs at the hook. Adding a ProductDetail-level integration test would duplicate coverage and re-mock the same surface, with the only difference being one less mock seam. Three small hook-level tests are sufficient to pin all three branches (not-found / loaded / error).

**Alternative considered:** Skip the new hook tests and rely on the existing ProductDetail test. Rejected — the existing test mocks `useProduct` entirely, so it never exercises the real hook's `?? null` mapping. Without a hook-level test the new behavior has no unit test.

### Decision 5: Genuine `queryFn` exceptions still surface as `error`

**Choice:** The `?? null` operator only applies to a resolved value. If `getProductById` rejects (network error, real exception), the rejection still flows into React Query's `error` channel and `useProduct` returns `{ product: undefined, error: <message>, isLoading: false }`. The page's existing `error` branch handles this correctly.

**Why:** Preserves the existing error-state UX (an error card with the message). Only the not-found-by-data path is rerouted; the not-found-by-network path stays as-is. The new hook test for the error branch (Decision 4) pins this behavior.

## Risks / Trade-offs

- **[Risk] A future React Query version drops the "queryFn must not return undefined" rule, making the `?? null` redundant.**
  → Mitigation: redundant code is not broken code. The `?? null` continues to work and the type assertion stays correct. A future cleanup change can remove it once we upgrade.

- **[Risk] Consumers of `useProduct` start to depend on `error` being non-null as a "not found" signal.**
  → Mitigation: spec delta makes the contract explicit (`product: undefined + error: null = not found`; `error: <message> = real failure`). The new hook-level test pins both paths. There is only one consumer today (`ProductDetail`) and it already reads the contract correctly.

- **[Trade-off] The `Product | null` query data type is slightly less obvious than `Product | undefined` at the `useQuery` call site.**
  → Accepted. The `null` is internal to `useProduct`; the hook's external surface still hands consumers `product: Product | undefined`. The mild internal awkwardness is the cost of working around React Query v5's design choice.

## Migration Plan

This is a behavior-only bugfix. No data migration, no breaking API change, no rollback complexity.

- **Deploy:** Merge to `master`.
- **Rollback:** Revert the commit. No state to clean up. The bug returns but does not corrupt anything.
