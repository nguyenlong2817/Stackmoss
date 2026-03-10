---
description: Run QA verification checklist for the current feature — tests, acceptance criteria, and Definition of Done.
---

# /qa-check — QA Verification

## Steps

1. **Identify target**: Read `FEATURES.md` to find the feature currently in progress (status = `IN_PROGRESS` or `REVIEW`).

2. **Run automated tests**:
   ```bash
   npm test
   ```
   - Capture output, note any failures.

3. **Verify acceptance criteria**:
   - Read the feature's acceptance criteria from `FEATURES.md`.
   - For each criterion, verify pass/fail:
     - `Pass:` → mark ✅
     - `Fail if:` → verify condition is NOT met

4. **Definition of Done checklist**:
   | Check | Status |
   |:---|:---|
   | Acceptance criteria pass | ⬜ |
   | Tests pass (no regressions) | ⬜ |
   | No new `OPEN_QUESTIONS.md` entries | ⬜ |
   | Commit hygiene (A/B/C layers) | ⬜ |
   | CHANGELOG updated | ⬜ |

5. **Report**: Output a summary table with pass/fail for each item.

6. **If all pass** → recommend marking feature as DONE in `FEATURES.md`.
   **If any fail** → list failures with suggested fixes.

## Stop Conditions
- STOP if test environment is not set up → ask owner for setup instructions.
- STOP if acceptance criteria are ambiguous → ask owner for clarification.
