# Context — StackMoss Agent Team Config

_Current project state. Updated after each feature cycle._

## Status
- **Phase:** Development (F17 complete — eval-ready + calibration skill)
- **State:** Full pipeline + 4 compile targets + eval harness + calibration
- **Last updated:** 2026-03-12
- **Tests:** 265 pass (29 test files)

## What Exists
- ✅ BRD v1.0 (`stackmoss-agent-config-BRD-v1.0.md`) — confirmed
- ✅ Agent team config (`.agents/`) — rules, skills, workflows
- ✅ Project management files — NORTH_STAR, FEATURES, NON_GOALS
- ✅ Source code — CLI scaffold with state machine
- ✅ `stackmoss new <name>` — creates project + runs intake + generates files + compiles skills
- ✅ `stackmoss inject` — scans repo + generates MIGRATION_REPORT.md + transitions to MIGRATING
- ✅ `stackmoss resolve` — interactive Q&A to resolve open questions
- ✅ `stackmoss promote --confirm` — 4 hard criteria gate → transitions to OPERATIONAL
- ✅ `stackmoss run <alias>` — execute commands, auto-create Patch Proposal on failure
- ✅ `stackmoss check` — config sanity, paths, word budgets
- ✅ `stackmoss patch apply/reject` — manage patch proposals with word budget enforcement
- ✅ `stackmoss upgrade` — CONSTITUTION-only merge, preserves PROJECT_FACTS
- ✅ State machine — 3-state (GLOBAL/MIGRATING/OPERATIONAL) with command validation
- ✅ Phase B/C command stubs — state-aware error messages
- ✅ Intake Engine — Fast (7Q) + Interview (13Q) modes
- ✅ Pack selector — 2D matrix (Persona × ProjectType → Roles)
- ✅ Auto-add — SEC-lite / OPS-lite auto-detection
- ✅ IntakeResult JSON — saved to project folder
- ✅ Template Engine — 7 template generators (config, team, features, north-star, non-goals, readme, open-questions)
- ✅ Compile Layer — Claude Code target (1 role = 1 skill file in .claude/skills/)
- ✅ Atomic Write — temp→rename pattern for all generated files
- ✅ Package.json — configured with bin, scripts
- ✅ TypeScript — strict mode, ES2022, Node16 modules
- ✅ Tests — 163 passing (state machine + new command + setup + intake + templates + compile)

## Tech Stack (confirmed)
- **Runtime:** Node.js ≥18
- **Language:** TypeScript (strict, ES2022)
- **Package manager:** npm
- **Test framework:** Vitest
- **CLI framework:** Commander.js
- **Prompts:** @inquirer/prompts
- **Build:** tsc (direct compilation)

## Project Structure
```
e:\Stackmoss\
├── src/
│   ├── bin/stackmoss.ts       # CLI entry (shebang)
│   ├── commands/
│   │   ├── new.ts             # `new` command (async, with intake + templates + compile)
│   │   └── stub.ts            # Stub factory for Phase B/C
│   ├── intake/
│   │   ├── types.ts           # IntakeResult + Question types
│   │   ├── questions.ts       # Fast (7Q) + Interview (13Q) definitions
│   │   ├── fast-mode.ts       # Fast mode flow + completeness gate
│   │   ├── interview-mode.ts  # Interview mode flow + completeness gate
│   │   ├── pack-selector.ts   # 2D matrix: Persona × ProjectType → Roles
│   │   ├── auto-add.ts        # SEC-lite / OPS-lite auto-detection
│   │   └── index.ts           # runIntake() entry point
│   ├── templates/
│   │   ├── types.ts           # GeneratedFile + TemplateInput types
│   │   ├── config.ts          # stackmoss.config.json generator (BRD §9.1)
│   │   ├── team.ts            # team.md generator (BRD §9.2)
│   │   ├── features.ts        # FEATURES.md generator (BRD §9.3)
│   │   ├── north-star.ts      # NORTH_STAR.md generator (BRD §9.4)
│   │   ├── non-goals.ts       # NON_GOALS.md generator
│   │   ├── readme.ts          # README_AGENT_TEAM.md generator (BRD §9.6)
│   │   ├── open-questions.ts  # OPEN_QUESTIONS.md generator (BRD §9.7)
│   │   └── index.ts           # generateAllFiles() orchestrator
│   ├── compile/
│   │   ├── claude-code.ts     # Claude Code compile (1 role = 1 skill file)
│   │   └── index.ts           # compileTarget() dispatcher
│   ├── config.ts              # Config schema + factory
│   ├── index.ts               # Commander program + command registration
│   └── state-machine.ts       # 3-state machine + validation
├── tests/
│   ├── commands/
│   │   └── new.test.ts        # new command tests
│   ├── intake/
│   │   ├── questions.test.ts      # Question definition tests
│   │   ├── pack-selector.test.ts  # 2D matrix all combinations
│   │   ├── auto-add.test.ts       # SEC-lite/OPS-lite detection
│   │   ├── fast-mode.test.ts      # Fast mode flow tests
│   │   ├── interview-mode.test.ts # Interview mode flow tests
│   │   └── integration.test.ts    # Full intake integration
│   ├── templates/
│   │   ├── helpers.ts             # Shared test fixtures
│   │   ├── config.test.ts         # Config template tests (7)
│   │   ├── team.test.ts           # Team template tests (10)
│   │   ├── features.test.ts       # Features template tests (8)
│   │   ├── north-star.test.ts     # North Star template tests (8)
│   │   ├── non-goals.test.ts      # Non-Goals template tests (6)
│   │   ├── readme.test.ts         # Readme template tests (6)
│   │   ├── open-questions.test.ts # Open Questions template tests (6)
│   │   └── integration.test.ts    # Template engine integration tests (7)
│   ├── compile/
│   │   └── claude-code.test.ts    # Claude Code compile tests (10)
│   ├── setup.test.ts          # Smoke tests (3 tests)
│   └── state-machine.test.ts  # State machine tests (20 tests)
├── dist/                      # Build output (gitignored)
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── .gitignore
```

## Next Step
- Run `/qa-check` cho F1, F2, F3 (Bước 5 trong README.md)
