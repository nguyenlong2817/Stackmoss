# Example: Technical Role Skill Generation

## Owner Request

"Create a Tech Lead role skill that can plan API delivery by features and enforce validation gates."

## Expected Skill-Engineer Actions

1. Capture role intent:
   - mission: translate locked BRD to feature roadmap
   - triggers: architecture trade-offs, team coordination, release gating
2. Create layered artifacts:
   - core `SKILL.md` with decision mandate and execution loop
   - references for architecture and risk playbooks
   - templates for feature roadmap and risk register
3. Add technical validation path:
   - command example: `npm test`
4. Run validation with logging:
   - `node scripts/validate-and-log.mjs --command "npm test" --id "tech-lead-smoke-01" --owner "repo-owner"`
5. If failing:
   - keep failure evidence in `data/validation-log.ndjson`
   - mark blocked and ask focused owner questions

## Done Criteria

- role skill artifacts generated with 3-layer plus 9-layer coverage
- at least one validation run recorded (pass or fail with remediation)
- updated research cutoff metadata and source list
