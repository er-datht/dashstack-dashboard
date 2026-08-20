## 1. Patch the useProduct hook

- [x] 1.1 In `src/hooks/useProduct.ts`, change the `queryFn` to an async arrow that awaits `getProductById(id as string)` and coalesces `undefined` to `null` before returning. Example: `queryFn: async () => (await getProductById(id as string)) ?? null`.
- [x] 1.2 Update the `useQuery` generic so the query's data type is `Product | null` (not `Product | undefined`). Adjust the destructured `data: product` name — rename it to `data` so the hook can post-process it before returning, OR keep `data: product` and unwrap at return. Either is fine; pick the form that reads cleanest.
- [x] 1.3 In the hook's `return` statement, map `data === null` to `product: undefined`. Keep `error` derived from React Query's `error` field exactly as today (`error: error ? (error as Error).message : null`) — do NOT add any "is this the undefined-data error?" string-matching logic; the sentinel-null at the `queryFn` boundary already prevents that error from ever firing on the not-found path.
- [x] 1.4 Confirm the hook's public return type `UseProductReturn` is unchanged: `{ product: Product | undefined; isLoading: boolean; error: string | null; refetch: () => Promise<unknown> }`.
- [x] 1.5 Do NOT touch `src/services/products.ts`. `getProductById`'s signature stays `Promise<Product | undefined>`.
- [x] 1.6 Do NOT touch `src/pages/ProductDetail/index.tsx`. The page's branches are already correct.

## 2. Write hook-level unit tests

- [x] 2.1 Create `src/hooks/__tests__/useProduct.test.ts`.
- [x] 2.2 Set up the test harness: a `QueryClientProvider` wrapper with a fresh `QueryClient` per test (disable retry; `staleTime: 0`), `renderHook` from `@testing-library/react`, `vi.mock` `../../services/products` so `getProductById` is a controllable spy.
- [x] 2.3 Test "not-found path": mock `getProductById` to resolve `undefined`; render `useProduct("missing-id")`; `waitFor` `isLoading` to be `false`; assert `result.current === { product: undefined, isLoading: false, error: null, refetch: <fn> }` (use individual property assertions to avoid the function-reference comparison).
- [x] 2.4 Test "loaded path": mock `getProductById` to resolve a fake `Product` fixture; assert `result.current.product` equals that fixture and `error` is `null`.
- [x] 2.5 Test "error path (genuine rejection)": mock `getProductById` to throw `new Error("network failure")`; assert `result.current.product === undefined` AND `result.current.error === "network failure"`.
- [x] 2.6 Test "disabled when id missing": call `useProduct(undefined)` (the existing `enabled: !!id` guard); assert `getProductById` was never invoked AND `result.current.isLoading === false` AND `result.current.product === undefined` AND `result.current.error === null`.
- [x] 2.7 Do NOT modify `src/pages/ProductDetail/__tests__/ProductDetail.test.tsx`. Its synthetic `setNotFound()` test remains valid as a page-level contract test.

## 3. Verification

- [x] 3.1 Run `yarn test src/hooks/__tests__/useProduct.test.ts` and confirm all 4 new tests pass.
- [x] 3.2 Run `yarn test src/pages/ProductDetail/__tests__/ProductDetail.test.tsx` and confirm all existing tests still pass without modification.
- [x] 3.3 Run `yarn test` and confirm full suite is green (632 + 4 new = 636 expected).
- [x] 3.4 Run `yarn build` and confirm TypeScript compile + Vite build succeed.
- [x] 3.5 Run `yarn lint` and confirm zero new warnings/errors on the two changed files (`useProduct.ts`, `useProduct.test.ts`).
- [x] 3.6 Manual check in `yarn dev`: navigate to `/products/7` (a ProductStock id with no matching Products entry) → confirm the "Product not found" empty state card renders with the "Back to Products" button (NOT the raw error message). Click the button → confirm it navigates to `/products`. Also navigate to a valid id (e.g., `/products/3`) and confirm the page loads normally.

## 4. Pre-archive checklist

- [x] 4.1 Run `npx openspec validate fix-product-detail-not-found-rendering --strict` and resolve any validation errors.
- [x] 4.2 Confirm no other consumer of `useProduct` exists by running `grep -rn "useProduct" src/ | grep -v "useProductStock\|useProducts\|__tests__"` — should show only `useProduct.ts` itself and `ProductDetail/index.tsx`.
