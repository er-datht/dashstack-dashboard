# api-clients Specification

## Purpose
Defines the two HTTP clients (fetch-based `apiService` and Axios-based `apiClient`) and the centralized `appConfig` that governs API, auth, and pagination settings.

## Requirements

### Requirement: Fetch-based API service
The application SHALL provide a lightweight fetch-based `apiService` object in `src/services/api.ts` with `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, and `delete<T>()` methods using the base URL from `VITE_API_BASE_URL` environment variable.

#### Scenario: GET request via apiService
- **WHEN** a service calls `apiService.get<User[]>('/users')`
- **THEN** a fetch GET request is made to `{VITE_API_BASE_URL}/users` and the response is typed as `User[]`

#### Scenario: Default base URL
- **WHEN** `VITE_API_BASE_URL` is not set
- **THEN** the base URL defaults to `http://localhost:3000/api`

### Requirement: Axios API client with interceptors
The application SHALL provide an Axios-based `apiClient` in `src/configs/api.ts` with request and response interceptors for authentication and error handling.

#### Scenario: Automatic Bearer token injection
- **WHEN** a request is made via `apiClient`
- **THEN** the request interceptor reads the auth token from localStorage (key from `appConfig.auth.tokenKey`) and adds it as a Bearer token in the Authorization header

#### Scenario: 401 response handling
- **WHEN** the server responds with a 401 status code
- **THEN** the response interceptor redirects the user to the login page

#### Scenario: Development request logging
- **WHEN** the application is in development mode and a request is made via `apiClient`
- **THEN** request and response details are logged to the console

### Requirement: Centralized app configuration
The `appConfig` object in `src/configs/app-config.ts` SHALL centralize API settings (baseURL, timeout: 30000), auth settings (tokenKey, refreshTokenKey, tokenExpiry), pagination defaults (pageSize: 10, options: [10, 20, 50, 100]), and feature flags.

#### Scenario: API timeout configuration
- **WHEN** a request is made via the Axios client
- **THEN** it uses the timeout value from `appConfig.api.timeout` (30000ms)

#### Scenario: Pagination defaults
- **WHEN** a paginated component initializes without explicit page size
- **THEN** it uses `appConfig.pagination.defaultPageSize` (10)
