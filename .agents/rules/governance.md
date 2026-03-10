# Governance Rules — StackMoss

> These rules are **always-on**. Injected into every agent interaction.
> Authority: [BRD v1.0](file:///e:/Stackmoss/stackmoss-agent-config-BRD-v1.0.md) §3

## Non-Negotiable Principles

1. **Speed-first, not process-first.** StackMoss is "speed rails", not "process police". Do not force roadmap/scope docs before shipping.
2. **No silent assumptions.** Anything unknown → write to `OPEN_QUESTIONS.md`. Never infer critical decisions.
3. **Vision-first.** User must have a confirmed product vision (`NORTH_STAR.md` via intake) before any team config is generated. For StackMoss dev: BRD is authority doc.
4. **LLM-minimal.** Default path requires zero LLM calls. BYO-LLM is enhancement only.
5. **Deterministic decision tree.** Pack/role selection uses code logic, never LLM.
6. **Replace-only + word budget.** Config must never grow over time. Every update replaces, never appends. Word count after patch ≤ word count before patch.
7. **Safe by default.** Suggest-only mode. Deny destructive tools (no `rm -rf`, no `drop table`, no `force push`) at free tier.
8. **Human-editable source of truth.** `team.md` is the only file humans need to touch. Compiled outputs are generated — do not edit them.

## Patch Rules (when config can be updated)

**Allowed when:**
- A command in config fails with exit code ≠ 0 AND correct command has been found
- A path in config does not exist AND correct path has been resolved
- Same error repeats ≥ 2 times in session with same root cause
- Tech Lead explicitly says "remember this"

**Forbidden when:**
- Error is a logic error (not env/config)
- First-time error (not enough signal)
- Fix has not been verified

## Word Budget Enforcement

- Each capability has a **word budget** (default + max ceiling)
- Team total max: **1800 words**
- Measured by: `wordCount(section_content)`
- If patch would exceed budget → trim oldest/least-referenced bullet before writing
- Never create new sections to store notes/logs
