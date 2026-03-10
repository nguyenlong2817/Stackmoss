---
description: Create or update a StackMoss output file template with schema validation.
---

# /new-template — Create/Update Output Template

## Steps

1. **Ask** for template name (e.g., `team.md`, `FEATURES.md`, `stackmoss.config.json`).

2. **Read authority**: Open BRD §9 to find the exact schema for this template.
   - Read: `stackmoss-agent-config-BRD-v1.0.md` → Section 9.x (matching subsection)

3. **Activate skill**: Load `template-engine` skill for architecture rules.

4. **Create template file**:
   ```
   src/templates/<name>.ts       ← template generator function
   tests/templates/<name>.test.ts ← validation test
   ```

5. **Implement generator**:
   - Accept intake answers as input
   - Use string interpolation (not LLM)
   - Output must match BRD schema exactly
   - Handle skipped fields → `OPEN_QUESTIONS.md`

6. **Write validation test**:
   - Generate with sample intake data
   - Assert output matches schema structure
   - Assert skipped fields appear in OPEN_QUESTIONS section

7. **Run tests**: `npm test -- --grep "<name>"` to verify.

## Stop Conditions
- STOP if template schema is not in BRD §9 → ask owner.
- STOP if output format is ambiguous → add to `OPEN_QUESTIONS.md`.
