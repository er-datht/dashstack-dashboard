## 1. Types and Data

- [x] 1.1 Create `src/types/team.ts` with `TeamMember` type (id, name, email, avatar?, createdAt, updatedAt)
- [x] 1.2 Create `src/pages/Team/teamData.ts` with 12 mock team members using randomuser.me avatars

## 2. i18n Translations

- [x] 2.1 Create `public/locales/en/team.json` with all translation keys (title, addNewMember, message, loadMore, form labels, placeholders, validation, success)
- [x] 2.2 Create `public/locales/jp/team.json` with Japanese translations
- [x] 2.3 Register `team` namespace in root `i18n.ts`

## 3. Team Listing Page

- [x] 3.1 Create `src/pages/Team/TeamCard.tsx` — avatar with fallback, name, email, Message button
- [x] 3.2 Rewrite `src/pages/Team/index.tsx` — header with icon badge, Add New Member button, card grid, Load More pagination, toast

## 4. Add New Member Page

- [x] 4.1 Create `src/pages/Team/AddNewMember/index.tsx` — photo upload, 6-field form, validation, gender dropdown, submit with toast + navigate

## 5. Routing

- [x] 5.1 Add `ADD_TEAM: "/team/add"` to `src/routes/routes.ts`
- [x] 5.2 Add lazy import and route for `AddNewMember` in `src/routes/AppRoutes.tsx`
