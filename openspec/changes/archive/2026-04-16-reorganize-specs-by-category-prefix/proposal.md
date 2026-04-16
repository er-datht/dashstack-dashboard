## Why

`openspec/specs/` currently holds 43 spec directories flat at the top level, with no grouping. Scanning the list to find related specs (all calendar specs, all orders specs, etc.) is slow and error-prone, and new contributors have no way to see how specs relate. The `organize-specs.md` sketch proposed nested category folders (`specs/calendar/<spec-name>/spec.md`), but that approach breaks the OpenSpec CLI (`list --specs`, `show`, `validate`, `archive`) because the CLI only scans one directory level below `specs/`. This change groups specs by category while keeping the flat directory layout the CLI requires.

## What Changes

- **BREAKING (spec IDs)**: Rename every existing spec directory to a `<category>__<short-name>` flat name. All 43 specs are renamed. No spec content (`spec.md`) changes.
- Introduce a documented spec-naming convention: `<category>__<short-name>` with `__` (double underscore) as the category separator, keeping the full name in kebab-case elsewhere.
- Update `CLAUDE.md` "Existing specs" list to use the new IDs and to document the naming convention (17 categories total).
- Leave all archived change artifacts under `openspec/changes/archive/` **unchanged** (historical record of what was merged under the old names).
- Do **not** introduce nested directories. `openspec/specs/` stays one level deep.

## Capabilities

### New Capabilities
<!-- None. This is a pure rename of existing spec directories; no new behaviour is introduced. -->

### Modified Capabilities
<!-- Renames do not change requirements, so no delta specs are needed. The full rename mapping lives in design.md and is executed in tasks.md. -->

## Impact

- **`openspec/specs/`** — every subdirectory renamed (43 `git mv` operations). Preserves history via `git mv`.
- **`CLAUDE.md`** — new "OpenSpec spec-naming convention" subsection added under the Workflow section (pattern, rationale, category list). The existing numbered "Existing specs" list is keyed by change name and does not need per-entry edits.
- **`openspec/changes/archive/`** — left alone. Archived proposals reference the *old* spec IDs because that is what was merged at the time; rewriting them would rewrite history.
- **OpenSpec CLI** — `list`, `show`, `status`, `instructions` continue to work. `validate` and `archive` will fail on **this** change because it has no requirement deltas (confirmed in sandbox). `tasks.md` skips both and archives the change folder manually via `git mv`. Future changes that include real deltas remain unaffected.
- **Active changes** — none in flight, so no deltas need remapping. Future changes must use the new IDs.
- **Code** — no source code references `openspec/specs/` paths. No runtime impact.
- **`organize-specs.md`** — the original sketch file at the repo root is deleted by this change (user confirmed; superseded by these artifacts).
