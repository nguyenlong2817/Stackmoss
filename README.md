<div align="center">

# StackMoss

**Turn vague AI coding requests into a calibrated agent team that can actually ship.**

StackMoss bootstraps runtime-native agent teams for **Claude Code**, **Cursor**, **VS Code / Copilot**, **Codex**, and **Antigravity** from one deterministic source of truth.

[![npm version](https://img.shields.io/npm/v/stackmoss?style=flat-square&color=2ea043)](https://www.npmjs.com/package/stackmoss)
[![license](https://img.shields.io/npm/l/stackmoss?style=flat-square&color=0969da)](LICENSE)
[![tests](https://img.shields.io/badge/tests-304%20passed-brightgreen?style=flat-square)]()
[![node](https://img.shields.io/node/v/stackmoss?style=flat-square)](package.json)

</div>

Most AI coding setups stop at "here are some rules."

StackMoss goes further: it generates a **working team model** with roles, governance, methodology, calibration flow, and eval scaffolding so your agents can plan, implement, review, and verify work with much less drift.

## What StackMoss Gives You

After bootstrap, your repo is no longer just "prompted". It gets a team that can:

- turn rough product intent into a Tech Lead-first delivery flow
- break work into role-based lanes like TL, DEV, QA, OPS, and DOCS
- enforce working discipline such as planning, TDD, debugging, and evidence-before-claims
- recalibrate to the real repo instead of blindly following a template
- run sanity checks and portable evals before you trust the team on real feature work

## What Your Agents Actually Do

Without StackMoss, vibe coding usually looks like this:

- ask for a feature
- agent guesses scope
- implementation drifts
- testing is inconsistent
- docs and prompts become stale

With StackMoss, the repo gets a structured operating loop:

```mermaid
flowchart LR
    A[Idea or repo request] --> B[Bootstrap agent team]
    B --> C[Tech Lead calibrates to real repo]
    C --> D[Feature breakdown and role assignment]
    D --> E[Implementation with shared methodology]
    E --> F[Check and eval]
    F --> G[Safer autonomous feature delivery]
```

That means your agents can move through a more realistic sequence:

1. Understand the product direction and repo context.
2. Lock or confirm scope before writing code.
3. Plan the work in bounded, verifiable steps.
4. Execute with role-specific behavior instead of one giant generic prompt.
5. Verify through checks and eval instead of claiming success too early.

## Built for Vibe Coding, But With Guardrails

StackMoss is useful when you want fast AI-assisted building without the usual chaos.

It keeps the speed of vibe coding, but adds:

- a clear Tech Lead-first workflow
- replace-only config updates
- explicit user confirmation before shared config patches
- runtime-native outputs instead of one-size-fits-all prompt blobs
- an eval loop so you can test team behavior, not just hope for it

## Core Capabilities

| Capability | What it enables |
|:---|:---|
| Bootstrap generation | Create `team.md`, feature docs, runtime-specific agent outputs, and eval artifacts |
| Auto-shaped agent team | Build TL, BA, DEV, QA, OPS, DOCS, and optional roles from intake answers |
| Runtime-native compile targets | Emit the right structure for each supported coding assistant |
| Shared methodology layer | Add planning, TDD, debugging, review, and verification discipline across roles |
| Calibration workflow | Push the team to inspect the real repo before feature delivery |
| Eval and health checks | Run `stackmoss check` and `stackmoss eval` to verify readiness |

## Runtime Targets

| Target | Output |
|:---|:---|
| Claude Code | `CLAUDE.md` + `.claude/skills/<skill>/SKILL.md` |
| Cursor | `.cursor/skills/<skill>/SKILL.md` |
| VS Code / Copilot | `.github/copilot-instructions.md` |
| Codex | `AGENTS.md` + `.agents/skills/<skill>/SKILL.md` |
| Antigravity | `.agent/{skills,rules,workflows}` |

## Quick Start

Install:

```bash
npm install -g stackmoss
```

Use in an existing repo:

```bash
cd /path/to/repo
stackmoss init
```

Or create a fresh workspace:

```bash
stackmoss new my-project
cd my-project
```

Then:

1. answer the intake
2. open your runtime and start with Tech Lead
3. run `stackmoss check`
4. run `stackmoss eval smoke`

Full walkthrough: [QUICK_START.md](QUICK_START.md)

## What Gets Generated

```text
my-project/
|-- team.md
|-- FEATURES.md
|-- NORTH_STAR.md
|-- NON_GOALS.md
|-- README_AGENT_TEAM.md
|-- AGENTS.md
|-- CLAUDE.md
|-- .agents/
|-- .claude/
|-- .cursor/
|-- .agent/
|-- .github/
|-- stackmoss.config.json
`-- evals/
```

## Command Reference

| Command | Description |
|:---|:---|
| `stackmoss new <name>` | Create a new StackMoss workspace |
| `stackmoss init [name]` | Bootstrap StackMoss in the current repo |
| `stackmoss inject` | Scan an existing repo and sync migration facts |
| `stackmoss resolve` | Resolve migration questions |
| `stackmoss promote --confirm` | Move from `MIGRATING` to `OPERATIONAL` |
| `stackmoss run <alias>` | Run a command alias with patch proposal on failure |
| `stackmoss check` | Validate config, budgets, and calibration readiness |
| `stackmoss eval [profile] [--grade]` | Prepare or grade a live team evaluation |
| `stackmoss patch list/apply/reject` | Manage patch proposals |
| `stackmoss upgrade` | Merge `CONSTITUTION` only |

## Development

```bash
git clone https://github.com/max-rogue/Stackmoss.git
cd Stackmoss
npm install
npm test
npm run build
```

Current local verification:

- `304` passing tests
- `41` test files
- TypeScript build passes

## License

MIT Copyright StackMoss
