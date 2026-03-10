---
description: Scaffold a new StackMoss CLI command end-to-end.
---

# /new-command — Scaffold a CLI Command

## Steps

1. **Ask** for command name, description, and which Phase it belongs to (A/B/C).

2. **Read authority**: Open BRD §7 (CLI Commands) to confirm the command spec.
   - Read: `stackmoss-agent-config-BRD-v1.0.md` → Section 7

3. **Check state**: Verify the command's state requirements (which states allow it).
   - Read: `cli-pipeline` skill → State Machine section

4. **Scaffold files**:
   ```
   src/commands/<name>.ts        ← command implementation
   tests/commands/<name>.test.ts ← unit test skeleton
   ```

5. **Wire into CLI entry point**: Update `src/cli.ts` (or equivalent) to register the new command.

6. **Implement** the 4-method pattern:
   - `parseArgs()` → validate CLI arguments
   - `checkState()` → verify current state allows this command
   - `execute()` → main logic
   - `report()` → user-facing output

7. **Update FEATURES.md**: Mark relevant subtask as in-progress.

8. **Run tests**: `npm test -- --grep "<name>"` to verify the skeleton passes.

## Stop Conditions
- STOP if the command is not defined in BRD §7 → ask owner for clarification.
- STOP if state machine implications are unclear → add to `OPEN_QUESTIONS.md`.
