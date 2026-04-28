## 1. Fix activeItemId logic

- [ ] 1.1 Update the `activeItemId` useMemo in `src/components/Sidebar/index.tsx` to try exact match first, then fall back to longest-prefix matching using `startsWith(item.route + "/")`, excluding `/` and `/dashboard` from prefix matching

## 2. Verification

- [ ] 2.1 Verify Team detail page (`/team/:id`) keeps Team nav item highlighted
- [ ] 2.2 Verify Add Team page (`/team/add`) keeps Team nav item highlighted
- [ ] 2.3 Verify Contact detail page (`/contact/:id`) keeps Contact nav item highlighted
- [ ] 2.4 Verify Add Contact page (`/contact/add`) keeps Contact nav item highlighted
- [ ] 2.5 Verify exact matches still work (e.g. `/team`, `/contact`, `/dashboard`)
- [ ] 2.6 Verify no prefix collision between `/products` and `/product-stock`
