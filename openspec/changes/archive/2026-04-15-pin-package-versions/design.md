## Context

`package.json` currently uses `^` (caret) on all dependencies and `~` (tilde) on TypeScript. The `yarn.lock` file already locks resolved versions, but the `package.json` ranges allow drift when the lockfile is regenerated or dependencies are added.

## Goals / Non-Goals

**Goals:**
- Pin every dependency and devDependency to an exact version (no `^` or `~` prefix)
- Ensure no functional change to resolved versions

**Non-Goals:**
- Upgrading or downgrading any package
- Modifying `yarn.lock` (it should remain unchanged)
- Adding an `--exact` default to Yarn config (can be done separately)

## Decisions

- **Edit `package.json` directly** rather than running `yarn add --exact` for each package. Rationale: a text-level find-and-replace is faster, safer, and avoids touching the lockfile. Running `yarn add` would re-resolve versions and potentially change `yarn.lock`.

## Risks / Trade-offs

- [Future installs won't auto-bump] → Acceptable; explicit upgrades are the goal.
- [Merge conflicts on version lines] → Low risk; version strings rarely conflict.
