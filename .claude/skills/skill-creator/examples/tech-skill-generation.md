# Example: Technical Skill Generation

## Owner Request

"Create a skill that can scaffold a Node API endpoint and verify it with automated tests."

## Expected Skill-Engineer Actions

1. Build trigger-focused metadata:
   - What: scaffold + validate Node API endpoint skills.
   - When: endpoint creation, refactor, API regression checks.
2. Create layered files:
   - Core instructions in `SKILL.md`.
   - API patterns and constraints in `references/`.
   - Reusable command templates in `assets/templates/`.
3. Add executable validation:
   - Example command: `npm test -- api-endpoint`
4. Run validation with logging:
   - `node scripts/validate-and-log.mjs --command "npm test -- api-endpoint" --id "api-endpoint-smoke-01" --owner "repo-owner"`
5. If failing:
   - Keep evidence in `data/validation-log.ndjson`.
   - Ask owner focused unblock questions.

## Done Criteria

- Skill artifacts generated with 9-layer coverage.
- At least one successful validation run or explicit blocked-state with owner questions.
- Updated cutoff + reference sources.

