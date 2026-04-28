## 1. Rename AddPersonForm → PersonForm

- [x] 1.1 Rename directory `src/components/AddPersonForm/` to `src/components/PersonForm/`
- [x] 1.2 Rename the component function from `AddPersonForm` to `PersonForm` and the props type from `AddPersonFormProps` to `PersonFormProps` inside the component file
- [x] 1.3 Update import in `src/pages/Team/AddNewMember/index.tsx` to use `PersonForm` from `../../components/PersonForm`
- [x] 1.4 Update import in `src/pages/Contact/AddNewContact/index.tsx` to use `PersonForm` from `../../components/PersonForm`

## 2. Extend PersonForm with initialValues and submitKey

- [x] 2.1 Add `initialValues?: Partial<PersonFormData>` and `submitKey?: string` to `PersonFormProps`
- [x] 2.2 Update each `useState` initializer to use `initialValues?.fieldName ?? defaultValue` (firstName, lastName, email, phone, dateOfBirth, gender, photoPreview)
- [x] 2.3 Change the submit button text from hardcoded `t("addNow")` to `t(submitKey ?? "addNow")`

## 3. Extend TeamMember type and mock data

- [x] 3.1 Add optional fields to `TeamMember` type in `src/types/team.ts`: `firstName`, `lastName`, `phone`, `dateOfBirth`, `gender`
- [x] 3.2 Enrich all 12 mock members in `src/pages/Team/teamData.ts` with `firstName`, `lastName`, `phone`, `dateOfBirth`, `gender` values (split existing `name` into firstName/lastName)
- [x] 3.3 Update `handleAddMember` in `AddNewMember` to persist the extra fields (firstName, lastName, phone, dateOfBirth, gender) from `PersonFormData`

## 4. TeamCard click navigation

- [x] 4.1 Make TeamCard clickable — clicking the card navigates to `/team/${member.id}`. Add `stopPropagation` on the Message button to prevent double-navigation.

## 5. MemberDetail page and routing

- [x] 5.1 Add `TEAM_DETAIL: "/team/:id"` to `src/routes/routes.ts`
- [x] 5.2 Create `src/pages/Team/MemberDetail/index.tsx` — reads member by ID from localStorage, resolves firstName/lastName, renders PersonForm with initialValues, submitKey="save", handles save by updating the member in localStorage
- [x] 5.3 Add lazy import and `<Route path="team/:id">` in `src/routes/AppRoutes.tsx`

## 6. i18n

- [x] 6.1 Add `save` and `memberUpdated` keys to `public/locales/en/team.json`
- [x] 6.2 Add `save` and `memberUpdated` keys to `public/locales/jp/team.json`

## 7. Verify

- [x] 7.1 Run `yarn build` to confirm no TypeScript errors
- [x] 7.2 Manual test: click a team card → detail page loads with pre-filled form → edit and save → return to team list with updated data
