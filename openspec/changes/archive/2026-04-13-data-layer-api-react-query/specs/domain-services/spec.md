## ADDED Requirements

### Requirement: DTO to internal type transformation
Domain services SHALL transform API Data Transfer Objects (DTOs) into internal application types, decoupling the UI from API response shapes.

#### Scenario: Todo API response transformation
- **WHEN** the todos service fetches data from the `/todos` API endpoint
- **THEN** it transforms `ApiTodo` objects (with `title` field) into `TodoItem` objects (with `text` field, plus added `starred` and `createdAt` fields)

### Requirement: Mock data for development
Product-related services (`products.ts`, `productStock.ts`) SHALL provide mock data with simulated API delays (500-800ms) for development without a backend.

#### Scenario: Mock product loading
- **WHEN** `getProducts()` is called
- **THEN** it returns mock product data after a simulated delay of 500-800ms

### Requirement: Service file organization
Each domain SHALL have its own service file at `src/services/{domain}.ts` that exports typed functions for API operations.

#### Scenario: Service file structure
- **WHEN** a new domain is added (e.g., "orders")
- **THEN** a service file `src/services/orders.ts` is created with typed fetch/CRUD functions

### Requirement: Deals service placeholder mapping
The deals service SHALL use the `/albums` API endpoint as a placeholder, transforming album data into deal objects with mock-generated location, datetime, amount, price, and status fields.

#### Scenario: Deal data generation
- **WHEN** `fetchDeals()` is called
- **THEN** album responses from the API are transformed into Deal objects with randomly generated supplementary fields
