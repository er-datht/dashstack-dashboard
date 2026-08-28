# Hard gates

Referenced by `/bug-fix-factory`, `/feature-build-factory`, and the `pr`,
`bug-ticket` and `task-ticket` skills. These are not suggestions. They come from
`CLAUDE.md` and override anything in the file that references them.

- **`security-reviewer` BLOCKS.** New features are where dependencies get added.
  If the change runs `yarn add`, fetches an external URL, or uses a web-sourced
  snippet, pause **all** other work until the verdict is ✅ allow. No `yarn add`,
  no `unit-test-writer`, no `opsx:apply` before then.
- **Never auto-chain `opsx:apply`.** The `⏸ WAIT for the user` step is a full
  stop — present findings and wait for the user to trigger implementation. The
  stop is the step *before* `/opsx:apply`, never the apply step itself.
- **Yarn only** — never `npm`.

## Git safety

- **Never commit on `master`** — this repo's base branch. Cut
  `bugfix/<kebab-name>` or `feature/<kebab-name>` first.
- **Never commit, push, or check out a branch on the user's behalf without asking
  first.** Ask before any git operation.
- **Never open a pull request.** Where a workflow produces a PR description, the
  generated `.md` file is the deliverable — the user opens the PR themselves.
