<div align="center">

# 🌿 StackMoss

**Runtime-agnostic agent team governance**

Scaffold, test, and ship AI agent teams for **Claude Code**, **Cursor**, and **Antigravity** — deterministic, eval-ready, no LLM required.

[![npm version](https://img.shields.io/npm/v/stackmoss?style=flat-square&color=brightgreen)](https://www.npmjs.com/package/stackmoss)
[![license](https://img.shields.io/npm/l/stackmoss?style=flat-square&color=blue)](LICENSE)
[![tests](https://img.shields.io/badge/tests-265%20passed-brightgreen?style=flat-square)]()
[![node](https://img.shields.io/node/v/stackmoss?style=flat-square)](package.json)

</div>

---

## ✨ What is StackMoss?

StackMoss generates **agent team configurations** — structured role definitions, capabilities, rules, and **eval harnesses** — that AI coding assistants auto-read to understand your project's team structure.

**No LLM calls. No cloud. Pure deterministic logic. Eval-ready out of the box.**

```
You answer 7 questions → StackMoss generates your entire agent team config
```

---

## 📦 Install

```bash
npm install -g stackmoss
```

## 🚀 Quick Start

```bash
stackmoss new my-project
```

Answer 7 questions → get a complete agent team:

```
my-project/
├── team.md                     # Roles & capabilities
├── FEATURES.md                 # Feature tracking
├── NORTH_STAR.md               # Project vision
├── stackmoss.config.json       # State machine config
│
├── CLAUDE.md                   # ← Claude Code reads this
├── .claude/rules/              # ← Per-role rules
│   ├── tl.md                   #    Tech Lead
│   ├── dev.md                  #    Developer
│   └── qa.md                   #    QA
│
└── evals/                      # ← Eval harness (plug into any runner)
    ├── rubric.md               #    Pass/fail criteria
    ├── cases/                  #    Test scenarios
    └── expected/               #    Golden output patterns
```

> 📖 **[Full Quick Start Guide →](QUICK_START.md)**

---

## 🎯 Compile Targets

StackMoss compiles the same `team.md` → different AI tool formats:

| Target | Output | Use with |
|:---|:---|:---|
| **ClaudeCodeV2** *(default)* | `CLAUDE.md` + `.claude/rules/*.md` | Claude Code |
| **Cursor** | `.cursor/rules/*.mdc` | Cursor IDE |
| **Antigravity** | `.agents/skills/<cap>/SKILL.md` | Antigravity |
| ClaudeCode *(legacy)* | `.claude/skills/*.skill.md` | Claude Code v1 |

---

## 🔄 Full Command Pipeline

```
GLOBAL ──────────▶ MIGRATING ─────────▶ OPERATIONAL
  stackmoss new       inject               run
                      resolve              check
                      promote              patch
                                           upgrade
```

| Command | Description |
|:---|:---|
| `stackmoss new <name>` | Create project + intake + generate + compile |
| `stackmoss inject` | Scan existing repo → MIGRATION_REPORT.md |
| `stackmoss resolve` | Interactive Q&A for open questions |
| `stackmoss promote --confirm` | 4 criteria gate → OPERATIONAL |
| `stackmoss run <alias>` | Execute command, auto-patch on failure |
| `stackmoss check` | Config sanity + word budget validation |
| `stackmoss patch apply/reject` | Manage patch proposals |
| `stackmoss upgrade [--apply]` | CONSTITUTION-only merge |

---

## 🏗️ Architecture

- **Deterministic** — no LLM required for any command
- **Atomic writes** — all-or-nothing file generation
- **State-aware** — commands validate state before execution
- **Word budgets** — enforced per capability section
- **Self-improving** — auto-generates patch proposals on command failure

---

## 🧪 Development

```bash
git clone https://github.com/nguyenlong2817/Stackmoss.git
cd Stackmoss
npm install
npm run build
npm test           # 265 tests, 29 files
```

---

## 📄 License

MIT © [StackMoss](LICENSE)
