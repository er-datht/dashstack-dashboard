# Hard gates

Shared by `/bug-fix-factory` and `/feature-build-factory`. These are not
suggestions. They come from `CLAUDE.md` and override anything in the command
that references them.

- **`security-reviewer` BLOCKS.** New features are where dependencies get added.
  If the change runs `yarn add`, fetches an external URL, or uses a web-sourced
  snippet, pause **all** other work until the verdict is ✅ allow. No `yarn add`,
  no `unit-test-writer`, no `opsx:apply` before then.
- **Never auto-chain `opsx:apply`.** The `⏸ WAIT for the user` step is a full
  stop — present findings and wait for the user to trigger implementation. The
  stop is the step *before* `/opsx:apply`, never the apply step itself.
- **Never commit on `master`.** Ask before any git operation.
- **Yarn only** — never `npm`.
