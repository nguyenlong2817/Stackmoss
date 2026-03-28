# Owner Questions Template

Ask only what is required to unblock validation or high-risk generation decisions.

## Quick Intake (3 questions)

1. What role or capability should this skill own?
2. Which runtime is target (`.claude/skills/*` only here)?
3. What one command or artifact proves this iteration is acceptable?

## Interview Intake (8-10 questions)

1. What business/engineering outcome must this role drive?
2. What are top 3 trigger scenarios for this skill?
3. What must be explicitly out of scope?
4. Which decisions can the role make autonomously?
5. Which decisions require owner approval?
6. What artifacts should this role always produce (roadmap, brief, risk register, etc.)?
7. What is the validation command or acceptance test?
8. If validation fails, what is acceptable fallback for this phase?
9. What sensitive data must never be logged?
10. What quality bar defines "ready" vs "blocked"?

## Safety and Scope Clarifiers

1. What files/directories are in scope for generated changes?
2. Are destructive operations forbidden by default?
3. Do you require strict fail-fast or warning-only behavior for this iteration?
