## Context

`AddNewContact` (494 lines) and `AddNewMember` (495 lines) differ by exactly 4 values: the i18n namespace, page title translation key, success toast translation key, and the route to navigate back to after submission. Every other line — photo upload, form fields, validation, gender dropdown, styling — is identical.

## Goals / Non-Goals

**Goals:**
- Single source of truth for the add-person form logic
- Page components become trivial wrappers (~10 lines each)

**Non-Goals:**
- Changing any UI behavior, styling, or validation rules
- Making the form configurable beyond the 4 identified parameters

## Decisions

### 1. Props-based parameterization (not context/config)
**Decision**: `AddPersonForm` accepts 4 props: `namespace`, `titleKey`, `successKey`, `backRoute`.

**Rationale**: Simple, explicit, no indirection. The 4 differences are known and stable. Over-engineering with a config object or context would add complexity for no benefit.

### 2. Place in `src/components/AddPersonForm/`
**Decision**: Shared component goes in `src/components/` (not `src/pages/`).

**Rationale**: It's used by two different page directories. Following the project convention, shared components live in `src/components/`.

### 3. Translation function receives namespace from prop
**Decision**: `useTranslation(namespace)` where `namespace` is the prop value.

**Rationale**: Both `contact` and `team` namespaces have identical key names for all form-related strings. The shared component simply needs to know which namespace to read from.

## Risks / Trade-offs

- **Tight coupling on key names**: Both namespaces must keep the same key names (firstName, lastName, etc.). This is acceptable — the keys are stable and semantically identical.
