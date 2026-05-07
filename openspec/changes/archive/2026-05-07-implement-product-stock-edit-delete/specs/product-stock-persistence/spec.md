## ADDED Requirements

### Requirement: ProductStock data persists to localStorage

The `productStockService` SHALL hydrate its in-memory data from `localStorage` on first read, and SHALL write the current data to `localStorage` after every successful mutation. The storage key SHALL be `"dashstack-product-stock"`. The stored value SHALL be a JSON object of shape `{ version: number, data: ProductStock[] }`.

#### Scenario: First read with no stored data
- **WHEN** `productStockService.getProductStock()` is called and `localStorage["dashstack-product-stock"]` does not exist
- **THEN** the service returns the seed data and writes that seed data to `localStorage` under the key `"dashstack-product-stock"` with the current schema version

#### Scenario: First read with valid stored data
- **WHEN** `productStockService.getProductStock()` is called and `localStorage["dashstack-product-stock"]` contains a valid JSON object with the current schema version
- **THEN** the service returns the stored data instead of the seed data

#### Scenario: Delete writes through to localStorage
- **WHEN** `productStockService.deleteProduct(id)` succeeds
- **THEN** `localStorage["dashstack-product-stock"]` is updated to a JSON object whose `data` array no longer contains the entry with the given `id`

#### Scenario: Update writes through to localStorage
- **WHEN** `productStockService.updateProduct(id, patch)` succeeds
- **THEN** `localStorage["dashstack-product-stock"]` is updated to a JSON object whose `data` entry with the given `id` reflects the merged patch

### Requirement: Stale or invalid stored data falls back to seed

If the stored value is missing, malformed, fails JSON parsing, or has a schema `version` that does not match the current version, the service SHALL discard the stored value, return the seed data, and write the seed data back to `localStorage` so subsequent reads succeed.

#### Scenario: Malformed JSON in storage
- **WHEN** `localStorage["dashstack-product-stock"]` contains a non-JSON string and `getProductStock()` is called
- **THEN** the service returns the seed data and overwrites the storage entry with a valid serialized seed value

#### Scenario: Schema version mismatch
- **WHEN** `localStorage["dashstack-product-stock"]` contains a valid JSON object whose `version` field does not match the current schema version and `getProductStock()` is called
- **THEN** the service returns the seed data and overwrites the storage entry with the current schema version

### Requirement: Persistence survives full page reload

After a hard reload of the page, the ProductStock listing SHALL reflect the most recent set of mutations from the previous session.

#### Scenario: Delete persists across reload
- **WHEN** the user deletes a ProductStock row, the deletion succeeds, the user reloads the page, and the ProductStock listing renders
- **THEN** the deleted row is not present in the rendered table

#### Scenario: Update persists across reload
- **WHEN** the user edits a ProductStock entry's name, the update succeeds, the user reloads the page, and the ProductStock listing renders
- **THEN** the entry's row displays the updated name

### Requirement: `updateProduct` service method merges a partial patch

The `productStockService` SHALL expose `updateProduct(id, patch)` that applies a partial patch to the entry with the given `id`, returning the merged entry. Fields not present in the patch SHALL retain their previous values. The service SHALL update the in-memory array AND write through to localStorage in the same call.

#### Scenario: Partial patch merges with existing entry
- **WHEN** `updateProduct("1", { amount: 99 })` is called and the entry with id `"1"` previously had `amount: 10` and `name: "Galaxy Watch Active 2"`
- **THEN** the returned entry has `amount: 99` AND `name: "Galaxy Watch Active 2"`, and the same merged values are written to localStorage

#### Scenario: Update for unknown id throws
- **WHEN** `updateProduct("does-not-exist", { amount: 1 })` is called and no entry has that id
- **THEN** the call rejects with an error and localStorage is not modified
