## 1. Route Setup

- [x] 1.1 Add `CONTACT_DETAIL: "/contact/:id"` to the ROUTES object in `src/routes/routes.ts`
- [x] 1.2 Add lazy-loaded `ContactDetail` route (`contact/:id`) in `src/routes/AppRoutes.tsx` inside DashboardLayout

## 2. ContactDetail Page

- [x] 2.1 Create `src/pages/Contact/ContactDetail/index.tsx` — thin PersonForm wrapper that reads contact from localStorage `'contacts'`, resolves firstName/lastName, pre-populates form, handles save with localStorage update, and redirects to `/contact` on success

## 3. ContactCard Navigation

- [x] 3.1 Update `src/pages/Contact/ContactCard.tsx` — add card-level `onClick` navigation to `/contact/${contact.id}`, `cursor-pointer`, `role="link"`, `tabIndex={0}`, keyboard handlers (Enter/Space), and `e.stopPropagation()` on the Message button

## 4. Translations

- [x] 4.1 Add `save` and `contactUpdated` keys to `public/locales/en/contact.json`
- [x] 4.2 Add `save` and `contactUpdated` keys to `public/locales/jp/contact.json`
