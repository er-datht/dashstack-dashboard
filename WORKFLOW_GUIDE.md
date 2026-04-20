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

### 2. Claude sizes the change

Based on scope, Claude picks one of three paths:

**Small** (obvious, self-contained) — Reads the code, makes the change, verifies.
No proposal needed. You see the result directly.

**Medium** (multiple files, some design decisions) — Creates a proposal with `/opsx:propose`, reviews it, then implements.

**Large** (new page, new feature, cross-cutting) — Full cycle: proposal, reviewer Q&A with you, waits for your approval, then implements with tests and code review.

### 3. Review the proposal (medium/large changes)

For medium and large changes, Claude generates artifacts:

- **Proposal** — What's being built and why
- **Design** — How it fits into the existing architecture
- **Specs** — Behavioral contracts for the new/changed code
- **Tasks** — Ordered implementation steps

You can:

- **Approve** — `/opsx:apply` to start implementation
- **Adjust** — Ask Claude to change specific parts ("make the search debounced, not instant")
- **Reject** — Say "let's take a different approach" and describe what you want instead

### 4. Implementation

Claude dispatches work to specialized agents as needed:

- `unit-test-writer` writes tests first (when there are testable units)
- `react-frontend-specialist` implements the code
- `code-reviewer` reviews the final diff

### 5. Verify and archive (large changes)

After a large change is done, Claude runs `/opsx:verify` to check implementation matches specs (completeness, correctness, coherence), then suggests `/opsx:archive` to preserve the specs for future reference. Verify won't block archive but surfaces issues worth addressing first.

---

## Fixing a Bug

Same flow, just describe the bug:

```
"the calendar popover overflows the viewport on small screens"
```

Claude will:

1. Read the relevant code to understand the current behavior
2. Check if existing specs cover this area (prior decisions, edge cases)
3. Size the fix — most bug fixes are small/medium and skip the full proposal
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

- **Start simple.** Describe what you want in plain language. Add process only if Claude asks or if you want more control.
- **Use `/opsx:explore` to think.** It's read-only — no code changes, no artifacts. Good for weighing options before committing to a direction.
- **You control the pace.** Claude won't start implementing a large change until you say `/opsx:apply`. Review the proposal, ask questions, take your time.
- **Small changes are fast.** Don't worry about "following the process" for a typo or a one-line fix. The workflow scales down automatically.
- **Specs are living documents.** They capture decisions, not just requirements. When you change direction, the spec gets updated — it's a record of the current truth, not the original plan.
- **Check existing specs.** Before asking for a feature, it helps to know what's already been built. Ask Claude "what specs exist for the calendar?" to see prior work.
