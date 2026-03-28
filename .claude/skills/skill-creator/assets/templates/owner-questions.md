# Owner Questions Template

Ask only what is required to unblock validation or high-risk generation decisions.

## Validation Blockers

1. Which command is the source-of-truth validation for this skill output?
2. Can I run this command in the current environment, or should I use a sandbox/staging target?
3. If command execution fails, what is the acceptable fallback criterion for this iteration?

## Scope and Safety

1. What files/directories are in scope for generated changes?
2. Are there destructive operations that must remain blocked?
3. What data types are sensitive and must never be logged?

## Acceptance

1. What are the minimum acceptance criteria for shipping this skill?
2. Do you want strict fail-fast behavior or warning-only for this phase?

