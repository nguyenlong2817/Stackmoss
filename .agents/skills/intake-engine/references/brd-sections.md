# BRD Reference — Intake Engine Skill

> Excerpts from `stackmoss-agent-config-BRD-v1.0.md` relevant to this skill.

## §5 — Personas

| Persona | Description | Need |
|:---|:---|:---|
| P1 — Biz-led | Understands business, not tech | Clear spec, role assignment |
| P2 — Dev-led | Knows code, lacks requirement clarity | BA-lite, acceptance criteria |
| P3 — Solo | Biz + dev, wants to ship fast | Minimal governance, light QA |
| P4 — Newbie | Unclear on both | Step-by-step, guardrails, suggest-only |

## §8 — Intake Flow

### Fast Mode (6 questions, ~3 min)
Q1: Role (Biz/Dev/Solo/Unknown) · Q2: Audience (Individual/SME/Enterprise/Community) · Q3: Geography (Internal/VN/Global) · Q4: Channel (Web/Mobile/Chat/API) · Q5: Data sensitivity (None/PII/Finance/Compliance) · Q6: First feature + appetite (S/M/L)

Completeness gate: ONLY check Q5. If missing → re-ask once. Do NOT turn Fast into Interview.

### Interview Mode (12 questions, ~10 min)
Block 1 (Q1-Q4): Business context · Block 2 (Q5-Q8): Technical constraints · Block 3 (Q9-Q12): Team & velocity

Completeness gate: Full check — "for who", measurable outcome, ≥1 non-goal. Missing → up to 2 follow-up questions.

## §10 — Framework Packs (2D Matrix)

UserType × ProjectType → Role set (see BRD §10.2 for full table).

Auto-add rules:
- Q5/Q6 = PII | Finance | Compliance → add SEC-lite
- Q7 = VPS | Cloud AND Q2 = SME | Enterprise → add OPS-lite

## §11 — BYO-LLM

Key only on user machine. No log, no file, no commit. LLM only for docs rewrite, never scope expansion.
