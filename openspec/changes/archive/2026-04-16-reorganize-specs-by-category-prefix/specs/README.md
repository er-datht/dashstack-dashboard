# No delta specs (intentional)

This change is a pure rename of existing spec directory names in `openspec/specs/`. No requirements are added, modified, removed, or renamed — the *content* of every `spec.md` is unchanged; only its containing directory name is changed.

Because OpenSpec "deltas" describe requirement-level diffs (ADDED/MODIFIED/REMOVED/RENAMED Requirement blocks), a rename of a spec's container produces no deltas. This file exists to document that intentional absence.

## Consequence for the CLI

The `@fission-ai/openspec` CLI `validate` and `archive` commands require delta files. Both will **fail** on this change, with errors like:

```
✗ [ERROR] Change must have at least one delta. No deltas found.
```

This is expected. `tasks.md` task 3.8 explicitly skips `openspec validate`, and task 7.1 replaces `openspec archive` with a manual `git mv openspec/changes/reorganize-specs-by-category-prefix openspec/changes/archive/...`.

## Where the actual work lives

- `../proposal.md` — why we're renaming and what the impact is
- `../design.md` — the full 43-entry rename mapping (Decision 2) and the migration plan
- `../tasks.md` — the exact `git mv` commands and verification steps
