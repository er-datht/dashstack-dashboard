---
mode: agent
---
Scope: [This folder / These files / This code]

Review Focus:
🐛 Bug Prevention: Identify critical issues that may cause bugs
📋 Instruction Adherence: Ensure compliance with requirements/guidelines/instructions
♻️ Code Reusability: Find opportunities to extract and reuse logic

Priority Classification:
🔴 HIGH: Critical – needs immediate fix
🟡 MEDIUM: Important – should be addressed soon
🟢 LOW: Nice-to-have improvements

Output Requirements:
Each issue must include:
🆔 Unique ID: #1, #2, #3...
📁 File path + line numbers
📝 Clear issue description
🎯 Priority level
💡 Suggested fix approach (no code implementation)

⚠️ TWO-PHASE WORKFLOW — APPROVAL REQUIRED:

PHASE 1: REVIEW ONLY
✓ Scan all code
✓ List all issues with IDs
✓ Categorize by priority
✓ Provide summary table
✗ No code changes
⏸️ Stop & wait for user approval

PHASE 2: FIX (After User Approval)
User commands:
"Fix #1, #3, #5"
"Fix all High priority"
"Fix all in [filename]"
"Fix all except #2, #7"
"Skip Low priority"