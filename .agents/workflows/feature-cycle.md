---
description: Execute a full feature cycle from TODO to DONE following StackMoss Feature Cycles methodology.
---

# /feature-cycle — Full Feature Cycle

## Steps

1. **Read current feature**: Open `FEATURES.md`, find the next feature with status `TODO`.

2. **Break down**: As Tech Lead, break the feature into subtasks with clear acceptance criteria.
   - Each subtask should be assignable to a role (DEV, QA, DOCS).
   - Write subtask list to `FEATURES.md` under the feature.

3. **Implement subtasks** (DEV role):
   - Follow commit hygiene (Layer A for code).
   - Use relevant skills (`cli-pipeline`, `template-engine`, `intake-engine`).
   - STOP at checkpoints for owner review.

4. **QA verification** (QA role):
   - Run tests: `npm test`
   - Verify each acceptance criterion from `FEATURES.md`.
   - Report pass/fail per criterion.

5. **Definition of Done check**:
   - [ ] Acceptance criteria in FEATURES.md pass
   - [ ] QA regression checklist pass
   - [ ] TL review approved
   - [ ] FEATURES.md status updated → DONE
   - [ ] CHANGELOG updated

6. **Update project state**:
   - `FEATURES.md`: Mark feature status → `DONE`
   - `CONTEXT.md`: Update current state
   - Commit (Layer C for docs update)

## Stop Conditions
- STOP if acceptance criteria are unclear → ask owner.
- STOP if scope expansion detected → add to `NON_GOALS.md`, ask owner.
- STOP if stuck > 3 times on same issue → escalate to owner.
