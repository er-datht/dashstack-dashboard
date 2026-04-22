# Workflow Guide

How to use the OpenSpec workflow in this project with Claude Code.

---

## Quick Reference

| You say                                                | What happens                                            |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `"add a search bar to the contacts page"`              | Claude sizes the change, proposes if needed, implements |
| `/opsx:propose "add search bar"`                       | Explicitly start planning (skip auto-sizing)            |
| `/opsx:apply`                                          | Start implementing from a proposal                      |
| `/opsx:verify`                                         | Check implementation matches specs before archiving     |
| `/opsx:archive`                                        | Archive a completed change                              |
| `/opsx:explore "should we use server-side filtering?"` | Think through an idea without changing code             |

---

## Starting a Feature

### 1. Describe what you want

Just say it naturally. Claude will read the relevant code and existing specs, then decide how much process the change needs.

```
"add a search bar to the contacts page that filters by name and email"
```

### 2. Claude runs the pipeline (always the same)

Every change goes through the same pipeline. Change size controls **how deep** each stage goes, never **whether** the stage runs.

```
requirements-analyst              (clarify requirements with the user FIRST)
  ⏸ WAIT — present findings to user, wait for confirmation
  → opsx:propose               (generate artifacts from confirmed requirements)
  → security-reviewer          (if yarn add / external code — ⛔ BLOCKS until safe)
  → unit-test-writer           (if testable units — skip for pure config/styling/docs)
  ⏸ WAIT — present findings, wait for user to trigger apply
  → opsx:apply via react-frontend-specialist   (user-triggered only)
  → code-reviewer              (address findings before continuing)
  → opsx:verify
  → opsx:archive
```

Depth per size:

- **Small** (typo, one-line fix, styling tweak) — `requirements-analyst` and `code-reviewer` are never skipped — quick pass (may need zero questions but still presents findings and waits for your confirmation), brief proposal. Skip `unit-test-writer` if no testable unit exists; skip `security-reviewer` if no deps/external code.
- **Medium** (new component, multi-file fix, refactor) — full pipeline, normal depth. `requirements-analyst` and `code-reviewer` are never skipped. Always waits for your confirmation after requirements-analyst before running `opsx:propose`.
- **Large** (new page, cross-cutting feature) — full pipeline, deep depth. `requirements-analyst` does thorough requirements gathering — **waits for your answers** before running `opsx:propose`. After pre-implementation stages complete, **always waits for you to trigger `opsx:apply`**.

### 3. Answer clarifying questions

Before generating any artifacts, `requirements-analyst` checks your description, explores the codebase for context, and asks clarifying questions to resolve ambiguities. You can:

- **Answer the questions** — Claude uses your answers to generate accurate artifacts
- **Adjust scope** — "actually, let's also include filtering by phone number"
- **Reject** — "let's take a different approach" and describe what you want instead

Once requirements are clear, Claude generates artifacts (scaled to the change — brief for small, thorough for large):

- **Proposal** — What's being built and why
- **Design** — How it fits into the existing architecture
- **Specs** — Behavioral contracts for the new/changed code
- **Tasks** — Ordered implementation steps

### 4. Implementation

Claude dispatches work to specialized agents mapped to workflow stages:

| Agent                       | OpenSpec Stage                   | Role                                                                                                                    | Skip when                  |
| --------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `requirements-analyst`         | **Before** `opsx:propose`        | Checks requirements, asks clarifying questions, resolves ambiguities                                                    | Never                      |
| `security-reviewer`         | Before `yarn add` / external URL | **⛔ BLOCKING** — reviews packages and external code for supply-chain risks. All work pauses until verdict is ✅ allow. | No deps or external code   |
| `unit-test-writer`          | Before `opsx:apply`              | Writes tests from specs first (TDD)                                                                                     | No testable units produced |
| `react-frontend-specialist` | During `opsx:apply`              | Implements the code                                                                                                     | No UI surface              |
| `code-reviewer`             | After `opsx:apply`               | Reviews the diff for quality, security, and correctness                                                                 | Never                      |

### 5. Verify and archive

After implementation and `code-reviewer` findings are addressed, Claude runs `/opsx:verify` to check implementation matches specs (completeness, correctness, coherence), then `/opsx:archive` to preserve the specs for future reference. Verify won't block archive but surfaces issues worth addressing first.

### Archive maintenance

When archive exceeds ~50 changes, sync all to main specs, keep the 20 most recent archives, delete the rest. Git preserves the full history — use `git log -- openspec/changes/archive/` to recover old proposals if needed.

---

## Fixing a Bug

Same flow, just describe the bug:

```
"the calendar popover overflows the viewport on small screens"
```

Claude will:

1. Read the relevant code to understand the current behavior
2. Check if existing specs cover this area (prior decisions, edge cases)
3. Create a proposal (brief for small fixes, more thorough for complex bugs)
4. Fix it, run tests, verify

For hard-to-reproduce or subtle bugs, use `/opsx:explore` first to think through causes without changing code:

```
/opsx:explore "why does the popover overflow on small screens?"
```

---

## When Requirements Change Mid-Implementation

This is normal. The workflow is designed for it. Here's how to handle each scenario:

### Scenario A: You realize the requirement was wrong before implementation starts

**The proposal exists but `/opsx:apply` hasn't been run yet.**

Just tell Claude what changed:

```
"actually, the search should also filter by phone number, not just name and email"
```

Claude updates the proposal artifacts (specs, tasks, design) in place. No need to start over.

### Scenario B: Requirements change during implementation

**Some tasks are already done, others haven't started.**

Tell Claude what changed:

```
"the client now wants the search results to show a highlight on matching text"
```

Claude will:

1. Pause implementation
2. Assess impact — which completed tasks are still valid? Which need revision?
3. Update the specs and remaining tasks to reflect the new requirement
4. Continue implementation from where it makes sense

Completed work that's still valid stays. Only the affected parts get revised.

### Scenario C: You see the result and want something different

**Implementation is done but the result isn't what you wanted.**

Describe what's wrong:

```
"this works but I want the filter to be a dropdown, not a text input"
```

Claude treats this as a new iteration:

- If the change is small, it just makes the edit directly
- If it's a bigger rework, it revises the specs first, then re-implements the affected parts

### Scenario D: A completely different direction mid-way

**You want to scrap the current approach.**

```
"let's stop — instead of client-side filtering, let's do server-side search with the API"
```

Claude will:

1. Assess what to keep vs. discard from the current work
2. Create a fresh proposal for the new direction, informed by what was learned
3. Wait for your approval before proceeding

### How Claude decides: update the change vs. start fresh

For scenarios A-C, Claude updates the existing change. For scenario D, it starts a new one. The decision criteria:

**Update the existing change when:**

- Same intent, refined execution (e.g., "search should also filter by phone")
- Scope narrows to an MVP (ship what's done, rest later)
- Design tweaks based on implementation discoveries

**Start a new change when:**

- Intent fundamentally changed (e.g., client-side → server-side)
- Scope exploded into different work entirely
- Original change can be marked "done" standalone

### Key principle: You never lose context

Every pivot builds on what was learned. The specs from the abandoned approach become context for the new one — prior decisions, edge cases discovered, code already read. The workflow doesn't restart from zero.

---

## Tips

- **Start simple.** Describe what you want in plain language. Claude will run the pipeline; you don't need to name the agents.
- **Every change runs the same pipeline — size scales depth, not stages.** A typo still gets a quick `requirements-analyst` pass and a quick `code-reviewer` pass; a new page gets deep passes at every stage.
- **Use `/opsx:explore` to think.** It's read-only — no code changes, no artifacts. Good for weighing options before committing to a direction.
- **You control when implementation starts.** Claude never auto-triggers `opsx:apply`. After pre-implementation stages (requirements-analyst, unit-test-writer), Claude presents findings and waits for you to explicitly start implementation.
- **Specs are living documents.** They capture decisions, not just requirements. When you change direction, the spec gets updated — it's a record of the current truth, not the original plan.
- **Check existing specs.** Before asking for a feature, it helps to know what's already been built. Ask Claude "what specs exist for the calendar?" to see prior work.
