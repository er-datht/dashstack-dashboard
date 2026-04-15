## ADDED Requirements

### Requirement: Exact version pinning in package.json
All dependency and devDependency version strings in `package.json` SHALL use exact versions with no range prefix (`^` or `~`).

#### Scenario: Caret prefix removed from dependencies
- **WHEN** inspecting the `dependencies` object in `package.json`
- **THEN** no version string SHALL start with `^`

#### Scenario: Caret prefix removed from devDependencies
- **WHEN** inspecting the `devDependencies` object in `package.json`
- **THEN** no version string SHALL start with `^`

#### Scenario: Tilde prefix removed from devDependencies
- **WHEN** inspecting the `devDependencies` object in `package.json`
- **THEN** no version string SHALL start with `~`

#### Scenario: Version numbers unchanged
- **WHEN** comparing version numbers (without prefix) before and after the change
- **THEN** all version numbers SHALL be identical
