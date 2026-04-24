## MODIFIED Requirements

### Requirement: Auth guard HOC
The `withAuth` HOC in `src/hoc/withAuth.tsx` SHALL check for a token in localStorage (via `appConfig.auth.tokenKey`), falling back to sessionStorage. If no token is found, it SHALL redirect to `/login` using `<Navigate>` with `{ from: location.pathname }` in route state. If a token is found, it SHALL render the wrapped component.

#### Scenario: Unauthenticated access
- **WHEN** a user without a token accesses a component wrapped with `withAuth`
- **THEN** they are redirected to `/login` with the current path in route state as `from`

#### Scenario: Authenticated access
- **WHEN** a user with a valid token accesses a component wrapped with `withAuth`
- **THEN** the wrapped component renders normally

#### Scenario: Return URL preserved
- **WHEN** an unauthenticated user tries to access `/inbox`
- **THEN** they are redirected to `/login` with `state.from` set to `/inbox`
