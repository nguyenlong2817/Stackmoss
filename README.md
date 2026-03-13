<div align="center">

# StackMoss

**Runtime-agnostic agent team governance**

Scaffold, calibrate, and operate AI agent teams for **Claude Code**, **Cursor**, **VS Code / Copilot**, **Codex**, and **Antigravity** with deterministic logic only.

[![npm version](https://img.shields.io/npm/v/stackmoss?style=flat-square&color=brightgreen)](https://www.npmjs.com/package/stackmoss)
[![license](https://img.shields.io/npm/l/stackmoss?style=flat-square&color=blue)](LICENSE)
[![tests](https://img.shields.io/badge/tests-315%20passed-brightgreen?style=flat-square)]()
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
stackmoss init
```

Answer the intake questions and StackMoss will generate:

```text
my-project/
|-- team.md
|-- FEATURES.md
|-- NORTH_STAR.md
|-- NON_GOALS.md
|-- README_AGENT_TEAM.md
|-- AGENTS.md
|-- stackmoss.config.json
|-- CLAUDE.md
|-- .claude/
|-- .cursor/
|-- .agent/
|-- .github/
`-- evals/
```

Then use the team in this order:

1. Answer the intake around BRD status, idea, domain, and repo context.
2. Open the IDE or CLI runtime you actually use and chat with **Tech Lead** first.
3. Let Tech Lead scan the repo, ask follow-up questions, and recalibrate the team to the real stack and delivery lanes.
4. Review the proposed config patch before any apply.
5. Only after calibration, let the team start shipping features.

> Full walkthrough: [QUICK_START.md](QUICK_START.md)

New workspace:

```bash
stackmoss new my-project
cd my-project
```

Existing repo:

```bash
cd /path/to/existing-repo
stackmoss init
```

`init` bootstraps StackMoss in the current repo. If the repo already contains real project files, it auto-runs `inject`.

---

## Operating Model

### Bootstrap -> Calibrate -> Operate

- `stackmoss new` and `stackmoss init` generate bootstrap outputs for Claude Code, Cursor, VS Code / Copilot, Codex, and Antigravity in one pass.
- After the BRD is locked and the repo is available, **Tech Lead must recalibrate** the team.
- DEV, QA, OPS, and other roles can emit verified signals, but **Tech Lead is the single writer** for shared team config.
- Shared config is updated by replacing stale facts with correct facts, never by appending history logs.
- Every config patch requires user confirmation before apply.
- Each runtime should only read and update its own generated structure.

### Existing repo flow

```bash
cd /path/to/existing-repo
stackmoss init
stackmoss resolve
stackmoss promote --confirm
stackmoss check
```

`init` bootstraps StackMoss and auto-runs `inject` for existing repos. `resolve`, `promote`, and `check` are advanced commands for migration/debugging when needed.

---

## Compile Targets

| Target | Output | Use with |
|:---|:---|:---|
| `ClaudeCodeV2` | `CLAUDE.md` + `.claude/skills/<skill>/SKILL.md` | Claude Code |
| `Cursor` | `.cursor/skills/<skill>/SKILL.md` | Cursor |
| `VSCode` | `.github/copilot-instructions.md` | VS Code / Copilot |
| `Codex` | `AGENTS.md` | OpenAI Codex |
| `Antigravity` | `.agent/{skills,rules,workflows}` | Antigravity |
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
| `stackmoss init [name]` | Initialize StackMoss in the current repo and generate all bootstrap targets |
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

- `315` passing tests
- `39` test files
- TypeScript build passes

---

## License

MIT © StackMoss
