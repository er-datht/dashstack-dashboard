## Context

DashStack has a dual API client architecture that evolved from different integration needs. The fetch-based client (`apiService`) serves as the lightweight default for most services, while the Axios client (`apiClient`) adds interceptors for authentication, 401 handling, and development logging. TanStack React Query manages all server state with conservative defaults. Domain services transform API responses into application types, and domain hooks provide clean React interfaces.

## Goals / Non-Goals

**Goals:**
- Document the two API clients and clarify when to use each
- Capture React Query configuration rationale
- Explain the service → hook → component data flow pattern
- Document the optimistic update pattern in mutation hooks

**Non-Goals:**
- Consolidating to a single API client
- Replacing mock data with real API endpoints
- Adding new domain services or hooks

## Decisions

### Decision 1: Dual API Client Architecture
**Choice**: Maintain both a fetch-based `apiService` and an Axios `apiClient`.
**Rationale**: The fetch-based client is lightweight and sufficient for most service calls. The Axios client adds value for authenticated calls needing automatic token injection, 401 handling, and request logging. Consolidating would either bloat simple calls or lose interceptor functionality.
**Alternatives considered**: Single Axios client for everything (overhead for simple calls), single fetch client with manual interceptors (reinventing Axios).

### Decision 2: Conservative React Query Defaults
**Choice**: staleTime 5min, gcTime 10min, retry 1, no refetchOnWindowFocus.
**Rationale**: Dashboard data doesn't change frequently enough to justify aggressive refetching. Disabling window focus refetch prevents unexpected request spikes. Single retry balances resilience with failure visibility.

### Decision 3: Service Layer DTO Transformation
**Choice**: Transform API DTOs in the service layer rather than in components or hooks.
**Rationale**: Keeps components and hooks decoupled from API response shapes. API changes only require service file updates, not component changes.

### Decision 4: Optimistic Updates with Rollback
**Choice**: Implement optimistic updates in mutation hooks (e.g., `useTodos`) with manual cache manipulation and rollback on error.
**Rationale**: Provides instant UI feedback for user actions (adding, editing, deleting todos). Rollback ensures data consistency if the API call fails.

### Decision 5: Mock Data in Services
**Choice**: Use mock data with simulated delays in product services instead of requiring a live backend.
**Rationale**: Enables frontend development and demonstration without backend infrastructure. Simulated delays make loading states testable.

## Risks / Trade-offs

- **[Two API clients confusion]** → Developers may use the wrong client. Mitigation: documented convention — apiService for most, apiClient for authenticated calls.
- **[Mock data divergence]** → Mock data may not match real API responses. Mitigation: services define TypeScript types that serve as contracts.
- **[Optimistic update complexity]** → Manual cache manipulation is error-prone. Mitigation: pattern is encapsulated in domain hooks, not spread across components.
- **[Placeholder APIs]** → Deals service uses /albums endpoint. Mitigation: service layer transformation abstracts this from components.
