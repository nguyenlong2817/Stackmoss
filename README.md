<div align="center">

# StackMoss

**Runtime-agnostic agent team governance**

Scaffold, calibrate, and operate AI agent teams for **Claude Code**, **Cursor**, **Roo**, and **Antigravity** with deterministic logic only.

[![npm version](https://img.shields.io/npm/v/stackmoss?style=flat-square&color=brightgreen)](https://www.npmjs.com/package/stackmoss)
[![license](https://img.shields.io/npm/l/stackmoss?style=flat-square&color=blue)](LICENSE)
[![tests](https://img.shields.io/badge/tests-308%20passed-brightgreen?style=flat-square)]()
[![node](https://img.shields.io/node/v/stackmoss?style=flat-square)](package.json)

</div>

---

## What is StackMoss?

StackMoss generates **agent team configurations**: structured roles, capabilities, governance rules, compile targets, and eval harnesses that AI coding assistants can read directly.

It is designed around a strict contract:

- Deterministic logic only. No LLM calls inside the CLI pipeline.
- `team.md` is the source of truth.
- Config changes are replace-only, budget-bounded, and proposal-driven.
- The generated team is a **bootstrap team**, not a permanent assumption.

---

## Install

```bash
npm install -g stackmoss
```

---

## Quick Start

```bash
stackmoss new my-project
cd my-project
```

Answer the intake questions and StackMoss will generate:

```text
my-project/
|-- team.md
|-- FEATURES.md
|-- NORTH_STAR.md
|-- NON_GOALS.md
|-- README_AGENT_TEAM.md
|-- stackmoss.config.json
|-- CLAUDE.md
|-- .claude/
|-- .cursor/
|-- .roo/
`-- evals/
```

Then use the team in this order:

1. Lock the BRD or `NORTH_STAR.md` before real feature delivery.
2. Ask **Tech Lead** to scan the repo and recalibrate the team to the real stack, topology, and delivery lanes.
3. Review the proposed config patch.
4. Only after confirmation, let the team start shipping features.

> Full walkthrough: [QUICK_START.md](QUICK_START.md)

---

## Operating Model

### Bootstrap -> Calibrate -> Operate

- `stackmoss new` creates a valid bootstrap team from intake answers.
- After the BRD is locked and the repo is available, **Tech Lead must recalibrate** the team.
- DEV, QA, OPS, and other roles can emit verified signals, but **Tech Lead is the single writer** for shared team config.
- Shared config is updated by replacing stale facts with correct facts, never by appending history logs.
- Every config patch requires user confirmation before apply.

### Existing repo flow

```bash
stackmoss inject
stackmoss resolve
stackmoss promote --confirm
stackmoss check
```

`inject` syncs repo facts into `PROJECT_FACTS`, `resolve` clears open questions, and `promote` moves the project into `OPERATIONAL` state.

---

## Compile Targets

| Target | Output | Use with |
|:---|:---|:---|
| `ClaudeCodeV2` | `CLAUDE.md` + `.claude/rules/*.md` | Claude Code |
| `Cursor` | `.cursor/rules/*.mdc` | Cursor |
| `Roo` | `.roo/skills/*.md` | Roo |
| `Antigravity` | `.agents/skills/<cap>/SKILL.md` | Antigravity |
| `ClaudeCode` | `.claude/skills/*.skill.md` | Claude Code legacy |

---

## Full Command Pipeline

```text
GLOBAL ----------> MIGRATING ----------> OPERATIONAL
  new                inject                run
                     resolve               check
                     promote               patch
                                           upgrade
```

| Command | Description |
|:---|:---|
| `stackmoss new <name>` | Create a new StackMoss project |
| `stackmoss inject` | Scan an existing repo and sync migration facts |
| `stackmoss resolve` | Answer unresolved migration questions |
| `stackmoss promote --confirm` | Transition from `MIGRATING` to `OPERATIONAL` |
| `stackmoss run <alias>` | Run a command alias with patch proposal on failure |
| `stackmoss check` | Validate config, budgets, and calibration readiness |
| `stackmoss patch list/apply/reject` | Manage patch proposals |
| `stackmoss upgrade` | Merge `CONSTITUTION` only |

---

## Architecture

- Deterministic pack and role selection
- Atomic writes for generated files
- State-machine enforcement for every command
- Replace-only patch flow with budget gate
- TL-led calibration contract for real projects

---

## Development

```bash
git clone https://github.com/max-rogue/Stackmoss.git
cd Stackmoss
npm install
npm test
npm run build
```

Current verification status:

- `308` passing tests
- `36` test files
- TypeScript build passes

---

## License

MIT © StackMoss
