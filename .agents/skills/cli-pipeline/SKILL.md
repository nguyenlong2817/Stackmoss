---
name: cli-pipeline
description: StackMoss CLI architecture — command scaffolding, state machine transitions, and pipeline orchestration. Use when working on CLI commands, state logic, or the core pipeline.
---

# CLI Pipeline Skill

## When to Use
- Implementing or modifying a CLI command (`new`, `inject`, `resolve`, `promote`, `run`, `check`, `patch apply`, `upgrade`)
- Working on the 3-state machine (GLOBAL → MIGRATING → OPERATIONAL)
- Designing command argument parsing or validation
- Building the Patch Proposal pipeline

## Architecture Rules

### State Machine (3 states)
```
GLOBAL ──[inject]──▶ MIGRATING ──[resolve + promote]──▶ OPERATIONAL
                                                              │
                                                    [upgrade] merge CONSTITUTION only
                                                    [patch apply] replace-only + budget gate
```

Each state has strict **permission boundaries**:
- **GLOBAL**: Template-only, no project knowledge
- **MIGRATING**: Read-only on repo, write only to `.agents/`, no code execution
- **OPERATIONAL**: Research locked, learn only from operational experience

### Command Pattern
Every CLI command MUST follow this structure:
```
src/commands/<name>.ts
├── parseArgs()     → validate CLI arguments
├── checkState()    → verify current state allows this command
├── execute()       → main logic
└── report()        → user-facing output
```

### Promote Criteria (hard gates)
`promote --confirm` only succeeds when ALL true:
1. `MIGRATION_REPORT.md` has zero open questions
2. At least 1 command in `[DEV-ENV]` verified
3. No critical hypothesis with confidence < 80%
4. User typed `--confirm` flag explicitly

## Authority Sources (read before implementing)
- **BRD §6**: State Machine definitions → [BRD](file:///e:/Stackmoss/stackmoss-agent-config-BRD-v1.0.md)
- **BRD §7**: CLI Commands (full list)
- **BRD §12**: Patch Proposal Flow + Trigger Rules
- **BRD §13**: Phase B Migration
- **BRD §14**: Upgrade isolation

## Do NOT
- Skip state validation before executing a command
- Allow `promote` without hard criteria being met
- Use LLM for any logic/routing decisions (deterministic only)
- Auto-execute destructive operations
