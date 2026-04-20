## 1. Extract shared component

- [x] 1.1 Create `src/components/AddPersonForm/index.tsx` — move all form logic from AddNewContact, parameterize with `namespace`, `titleKey`, `successKey`, `backRoute` props

## 2. Convert pages to wrappers

- [x] 2.1 Rewrite `src/pages/Contact/AddNewContact/index.tsx` to render `AddPersonForm` with contact-specific props
- [x] 2.2 Rewrite `src/pages/Team/AddNewMember/index.tsx` to render `AddPersonForm` with team-specific props

## 3. Verify

- [x] 3.1 Run `yarn build` and `yarn test` to confirm no regressions
