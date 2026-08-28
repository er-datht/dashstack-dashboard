# Pipeline discipline

Shared by `/bug-fix-factory` and `/feature-build-factory`. These govern how the
pipeline runs, regardless of whether the work is a bug or a feature. Constraints
specific to one pipeline stay in that command.

`.claude/rules/hard-gates.md` sits above this file and overrides it.

- **OpenSpec owns the artifacts; the command owns the order and the gates.** The
  ticket, design, delta specs, task list and archive **are** OpenSpec. Never
  create a parallel ticket or spec format mid-pipeline.
- **`requirements-analyst` and `code-reviewer` are never skipped** — not even for
  a one-line fix. For a trivial change `requirements-analyst` may be a
  zero-question pass, but it runs.
- **The ⏸ WAIT step is a hard stop.** Present the proposal, the security verdict
  and the tests, then stop. Never auto-chain `/opsx:apply`.
- **Find violations and fix them are separate steps.** List every violation while
  changing nothing, then fix exactly what was listed. Never merge the two — a
  single prompt carrying "fix it and don't break these six rules" reliably drops
  one.
- **Review agents are read-only.** Every edit happens in the main session, after
  the user has seen the findings.
- **The evaluator–optimizer loop is capped at 2 iterations.** After the second
  pass, stop, report what remains, and hand the decision to the user. Never loop
  unattended past the cap.
- **Never delete an archived change** — the archive is the audit trail.
- **A pre-existing bug found mid-run gets its own change.** Do not bundle it into
  the current one.
