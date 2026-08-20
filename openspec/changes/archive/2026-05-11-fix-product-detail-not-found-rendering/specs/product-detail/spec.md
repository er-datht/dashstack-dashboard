## MODIFIED Requirements

### Requirement: Loading, error, and not-found states

The Product Detail page SHALL render a loading spinner while data is fetching, an error card if `getProductById` throws, and a not-found empty state with a "Back to Products" button when `getProductById` resolves to `undefined`. The page SHALL NOT silently redirect on a missing product. The `useProduct(id)` hook SHALL guarantee the following contract so the page's rendering branches resolve correctly:

- **Not-found path:** When `getProductById` resolves to `undefined` for the route's `id`, the hook SHALL return `{ product: undefined, error: null, isLoading: false }`. The hook SHALL NOT propagate React Query's internal "query data cannot be undefined" error to the page on this path. (Implementation note: the hook collapses `undefined` to a sentinel `null` value at the `queryFn` boundary so React Query v5's "queryFn must not return undefined" rule is never tripped; the sentinel is mapped back to `product: undefined` in the hook's return statement.)
- **Loaded path:** When `getProductById` resolves to a real `Product`, the hook SHALL return `{ product: <Product>, error: null, isLoading: false }`.
- **Error path:** When `getProductById` rejects (network error, thrown exception, or any rejection inside `queryFn`), the hook SHALL return `{ product: undefined, error: <message>, isLoading: false }`. The message SHALL be the `Error.message` string from the rejection.

The page's rendering ordering remains: `isLoading → error → !product → loaded`. Because the hook guarantees that the not-found path carries `error: null`, the page's `!product` branch is reachable for any id that has no matching product.

#### Scenario: Loading state
- **WHEN** product data is being fetched
- **THEN** the page renders the spinner loading pattern

#### Scenario: Error state
- **WHEN** the product fetch fails (e.g., `getProductById` rejects with a network error)
- **THEN** the hook returns `{ product: undefined, error: "<message>", isLoading: false }` AND the page renders an error card displaying that message

#### Scenario: Not-found empty state
- **WHEN** `getProductById` resolves to `undefined` for the route's `id`
- **THEN** the hook returns `{ product: undefined, error: null, isLoading: false }` AND the page renders an empty state card with a "Product not found" message and a "Back to Products" button that navigates to `ROUTES.PRODUCTS`

#### Scenario: Loaded state
- **WHEN** `getProductById` resolves to a real `Product` for the route's `id`
- **THEN** the hook returns `{ product: <Product>, error: null, isLoading: false }` AND the page renders the loaded product (hero, specifications, about section)

#### Scenario: Not-found path does NOT surface as a React Query error
- **WHEN** `getProductById` resolves to `undefined`
- **THEN** the hook's `error` field is `null` (it is NOT the React Query v5 string `"Query data cannot be undefined…"` or any other non-null value); the page renders the not-found empty state, NOT the error card

#### Scenario: Error path is unaffected by the not-found mapping
- **WHEN** `getProductById` throws or rejects with a real error (i.e., the rejection comes from inside the `queryFn`'s `await`, not from React Query's internal "data is undefined" check)
- **THEN** the hook's `error` field is the rejection's `.message` and `product` is `undefined`; the page renders the error card with that message
