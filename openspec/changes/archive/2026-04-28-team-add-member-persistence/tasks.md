## 1. AddPersonForm — optional onSubmit callback

- [x] 1.1 Export `PersonFormData` type from `src/components/AddPersonForm/index.tsx` with fields: `firstName`, `lastName`, `email`, `phone`, `dateOfBirth`, `gender`, `photoPreview`
- [x] 1.2 Add optional `onSubmit?: (data: PersonFormData) => void` to `AddPersonFormProps`
- [x] 1.3 In `handleSubmit`, call `onSubmit` with form data after validation passes (before the save simulation timeout)

## 2. AddNewMember — persist new member to localStorage

- [x] 2.1 In `src/pages/Team/AddNewMember/index.tsx`, import `useLocalStorage`, `mockTeamMembers`, `TeamMember` type, and `PersonFormData`
- [x] 2.2 Create `handleAddMember` callback that constructs a `TeamMember` from `PersonFormData` (name = `firstName + " " + lastName`, id = `Date.now().toString()`, timestamps = current ISO) and prepends it to the localStorage array
- [x] 2.3 Pass `handleAddMember` as `onSubmit` prop to `AddPersonForm`

## 3. Team listing — read from localStorage

- [x] 3.1 In `src/pages/Team/index.tsx`, replace static `mockTeamMembers` import with `useLocalStorage<TeamMember[]>('team-members', mockTeamMembers)` to read the persisted list
- [x] 3.2 Update `visibleMembers` and `hasMore` to use the localStorage-backed array instead of the static import

## 4. Verify

- [x] 4.1 Run `yarn build` to confirm no TypeScript errors
- [x] 4.2 Manual test: add a new member, verify they appear at the top of the team list after navigation
