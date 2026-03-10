---
name: intake-engine
description: StackMoss CLI intake flow — Fast mode (6 questions), Interview mode (12 questions), persona detection, decision tree, pack overlay composition, and completeness gates. Use when working on the onboarding questionnaire or pack selection logic.
---

# Intake Engine Skill

## When to Use
- Implementing the intake questionnaire (Fast/Interview mode)
- Building the persona detection + pack selection logic
- Working on completeness gates
- Implementing the 2D Matrix overlay compose (UserType × ProjectType)

## Intake Modes

### Fast Mode (6 questions, ~3 min)
| # | Question | Choices |
|:---|:---|:---|
| Q1 | Role in project? | Biz lead / Dev lead / Solo / Unknown |
| Q2 | Who is the product for? | Individual / SME / Enterprise / Community |
| Q3 | Geography? | Internal / VN / Global |
| Q4 | Primary channel? | Web / Mobile / Chat / API |
| Q5 | Sensitive data? | None / PII / Finance / Compliance |
| Q6 | First feature to ship? | (free text + appetite S/M/L) |

**Completeness gate**: Only check Q5. If missing → re-ask Q5 once. Do NOT check outcome/non-goals (avoid turning Fast into Interview).

### Interview Mode (12 questions, ~10 min)
- Block 1 (Q1–Q4): Business context
- Block 2 (Q5–Q8): Technical constraints
- Block 3 (Q9–Q12): Team & velocity

**Completeness gate**: Full check — must have "for who", measurable outcome, at least 1 non-goal. If missing → up to 2 targeted follow-up questions.

## 2D Matrix: Pack Selection

```
UserType overlay × ProjectType overlay → Role set
```

| UserType | ProjectType | Roles |
|:---|:---|:---|
| BizLed | MVP | TL, BA, DEV, QA(light), DOCS |
| BizLed | Production | TL, BA, DEV, QA(strong), OPS(light), DOCS |
| DevLed | MVP | TL, DEV, QA, DOCS (BA-lite in TL) |
| DevLed | Production | TL, DEV, QA(strong), OPS, DOCS |
| Solo | MVP | TL, DEV, QA(light) |
| Solo | Production | TL, DEV, QA, DOCS |
| Newbie | any | TL(guide), DEV(small), QA(checklist), DOCS |

### Auto-add Rules (no user prompt needed)
- Q5/Q6 = PII / Finance / Compliance → add **SEC-lite**
- Q7 = VPS / Cloud AND Q2 = SME / Enterprise → add **OPS-lite**

## Architecture Rules

### Decision Tree (deterministic, no LLM)
```
src/intake/
├── questions.ts       → Question definitions + validation
├── fast-mode.ts       → 6-question flow + completeness gate
├── interview-mode.ts  → 12-question flow + completeness gate
├── pack-selector.ts   → 2D matrix overlay compose
└── auto-add.ts        → SEC-lite / OPS-lite auto-detection
```

### Skipped Questions
- Any skipped question → write to `OPEN_QUESTIONS.md`
- Never infer, never assume, never use default for critical fields

## Authority Sources
- **BRD §5**: Personas (P1–P4)
- **BRD §8**: Phase A intake flow (Fast + Interview)
- **BRD §10**: Framework Packs (overlay compose + role mapping)
- **BRD §11**: BYO-LLM (optional enhancement)

## Do NOT
- Use LLM for pack/role selection logic
- Infer answers to skipped questions
- Add questions not in the BRD schema
- Turn Fast mode into Interview mode via extra validation
