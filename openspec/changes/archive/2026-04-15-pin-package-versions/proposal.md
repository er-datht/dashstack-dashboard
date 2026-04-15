## Why

Dependency versions in `package.json` use range prefixes (`^` and `~`), which allow automatic minor/patch upgrades on install. This can lead to inconsistent builds across environments and unexpected breakage from transitive updates. Pinning to exact versions ensures reproducible installs and explicit upgrade control.

## What Changes

- Remove all `^` prefixes from dependency and devDependency version strings in `package.json`
- Remove the `~` prefix from the `typescript` version string in `package.json`
- All versions become exact (e.g., `"react": "19.1.1"` instead of `"react": "^19.1.1"`)

## Capabilities

### New Capabilities

_(none — this is a maintenance change with no new behavioral capabilities)_

### Modified Capabilities

_(none — no spec-level behavior changes; only version pinning in package.json)_

## Impact

- **File**: `package.json` — all dependency and devDependency version strings
- **Build**: No functional change; same versions currently resolved in `yarn.lock` remain
- **Process**: Future `yarn add` or `yarn upgrade` will require explicit version bumps
