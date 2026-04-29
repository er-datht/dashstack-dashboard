## Context

The Sidebar component (`src/components/Sidebar/index.tsx`) derives the active nav item via an exact match between `location.pathname` and each nav item's `route` property. Routes like `/team` and `/contact` are defined in `navigationData.ts`, but sub-routes (`/team/:id`, `/team/add`, `/contact/:id`, `/contact/add`) have no corresponding nav item. The exact match fails and the fallback `"dashboard"` is returned, causing Dashboard to appear selected on sub-route pages.

## Goals / Non-Goals

**Goals:**
- Sub-route pages keep their parent nav item highlighted (e.g. `/team/add` → Team, `/contact/123` → Contact)
- No changes to routing, navigation data, or any other component

**Non-Goals:**
- Adding sub-route items as nested menu entries in the sidebar
- Refactoring the sidebar to use a different navigation library

## Decisions

### Prefix matching with longest-match priority

**Decision:** After trying an exact match, fall back to prefix matching — check if `currentPath.startsWith(item.route + "/")`. Pick the longest matching route to avoid ambiguity.

**Rationale:** This is the simplest approach that handles all current sub-route patterns (`/team/:id`, `/team/add`, `/contact/:id`, `/contact/add`) and will automatically work for any future sub-routes added to other sections.

**Alternatives considered:**
- **Explicit `parentId` mapping in route config:** More explicit but requires manual maintenance every time a new sub-route is added. Over-engineering for this use case.
- **Regex matching per nav item:** More powerful but unnecessary complexity — no nav items require regex-level matching.

### Exclude root and dashboard from prefix matching

**Decision:** Skip `/` and `/dashboard` during prefix matching to avoid false positives (every path starts with `/`).

**Rationale:** The root route would match everything, and `/dashboard` is never a prefix for other routes but is excluded defensively.

## Risks / Trade-offs

- **Route collision risk** — If two nav items share a prefix (e.g. `/product` and `/product-stock`), the `+ "/"` suffix in `startsWith(item.route + "/")` prevents false matches (`/product-stock` does not start with `/product/`). Current routes have no collisions. → Low risk.
- **Performance** — The prefix match filters and sorts on every pathname change. With ~15 nav items this is negligible. → No mitigation needed.
