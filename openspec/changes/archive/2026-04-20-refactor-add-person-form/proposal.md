## Why

`AddNewContact` and `AddNewMember` are ~95% identical — same photo upload, same 6 fields, same validation, same gender dropdown, same submit flow. The only differences are 4 string values (translation namespace, title key, success toast key, back-navigation route). This duplication is a maintenance risk: any future fix or enhancement must be applied in two places.

## What Changes

- Extract the shared form body into a reusable `AddPersonForm` component in `src/components/AddPersonForm/index.tsx`
- Reduce `AddNewContact` and `AddNewMember` to thin wrappers that render `AddPersonForm` with the appropriate props (namespace, title key, success key, back route)
- No user-facing behavior changes — pure refactor

## Capabilities

### New Capabilities
- `add-person-form`: Shared form component parameterized by translation namespace, page title key, success toast key, and back-navigation route

### Modified Capabilities

## Impact

- **New file**: `src/components/AddPersonForm/index.tsx`
- **Modified files**: `src/pages/Contact/AddNewContact/index.tsx`, `src/pages/Team/AddNewMember/index.tsx` (reduced to wrappers)
- **No new dependencies**
- **No behavior changes** — pure refactor
