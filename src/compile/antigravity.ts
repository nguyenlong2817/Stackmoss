import type { GeneratedFile } from '../templates/types.js';
import { extractRoleId } from '../templates/team.js';
import { ROLE_CAPABILITIES, ROLE_RUNTIME_NAMES } from './claude-code.js';
import { getCapabilitiesForRole } from '../budgets.js';
import {
    renderAntigravityMethodologyRule,
    renderAntigravityWorkflow,
} from './methodology.js';
import { uniqueRoleIds, uniqueRoles } from './utils.js';
import { renderDeepSkillContent, renderRoleOverrideGuidance } from './role-skills.js';

function renderRuleMd(projectName: string): string {
    return `# StackMoss Team Bootstrap - ${projectName}

## Always On
- Start in Tech Lead-first calibration mode after bootstrap.
- Read ROLE_SKILL_OVERRIDES.md before applying project-specific role behavior.
- Confirm BRD or NORTH_STAR is locked before implementation.
- Replace stale facts inside existing sections instead of appending logs.
- Ask the user before applying any shared config patch.
- Never store or push secrets, tokens, passwords, or private keys in generated agent files.
`;
}

function renderWorkflowMd(projectName: string): string {
    return `# Calibrate Team

Description: Scan the repository, ask follow-up questions, and recalibrate the StackMoss team for ${projectName}.

## Steps
1. Read team.md, ROLE_SKILL_OVERRIDES.md, FEATURES.md, NORTH_STAR.md, and NON_GOALS.md.
2. Confirm BRD or NORTH_STAR is locked. If not, stop and convert F1 into locking scope and constraints.
3. Scan the repository for stack, commands, paths, tests, and deployment facts.
4. Ask focused follow-up questions when facts are missing or conflicting.
5. Update ROLE_SKILL_OVERRIDES.md with verified role-specific deltas instead of editing generated role skills directly.
6. Prepare replace-only config changes for Tech Lead review.
7. Ask the user before applying any shared config patch.
`;
}

function renderThreeNineSupportFiles(
    roleRoot: string,
    owner: string,
): GeneratedFile[] {
    return [
        {
            path: `${roleRoot}/references/layer-map.md`,
            content: `# 3-Layer to 9-Layer Map

- Layer 1: metadata in SKILL.md
- Layer 2: core instruction in SKILL.md
- Layer 3: references/
- Layer 4: examples/
- Layer 5: scripts/
- Layer 6: assets/templates/
- Layer 7: contracts/
- Layer 8: governance/
- Layer 9: data/
`,
        },
        {
            path: `${roleRoot}/examples/session-example.md`,
            content: `# Example Session

1. Read BRD and current constraints.
2. Execute validation command.
3. Record pass/fail in data/validation-log.ndjson.
4. Ask owner questions when validation cannot run.
`,
        },
        {
            path: `${roleRoot}/scripts/validate-and-log.mjs`,
            content: `#!/usr/bin/env node
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const command = process.argv[2];
const logPath = resolve(process.cwd(), process.argv[3] ?? 'data/validation-log.ndjson');
if (!command) {
  console.error('Usage: node scripts/validate-and-log.mjs \"<command>\" [log-path]');
  process.exit(1);
}
const result = spawnSync(command, { shell: true, encoding: 'utf-8' });
mkdirSync(dirname(logPath), { recursive: true });
appendFileSync(logPath, JSON.stringify({
  ts: new Date().toISOString(),
  runtime: 'Antigravity',
  owner: '${owner}',
  command,
  status: result.status === 0 ? 'pass' : 'fail',
  stdout: (result.stdout ?? '').slice(0, 2000),
  stderr: (result.stderr ?? '').slice(0, 2000),
}) + '\\n', 'utf-8');
process.exit(result.status ?? 1);
`,
        },
        {
            path: `${roleRoot}/assets/templates/owner-questions.md`,
            content: `# Owner Questions

1. Which validation command should be used for this role skill?
2. Which prerequisites are missing in the current environment?
3. Should this role skill remain blocked until validation is available?
`,
        },
        {
            path: `${roleRoot}/contracts/output-contract.md`,
            content: `# Output Contract

- Return concise status and decision summary.
- Include command and pass/fail evidence.
- If failed, provide remediation plan.
`,
        },
        {
            path: `${roleRoot}/governance/evolution.md`,
            content: `# Governance

- Role skill updates are replace-only.
- Validation evidence must be logged to local data layer.
- Runtime boundary: Antigravity paths only.
`,
        },
        {
            path: `${roleRoot}/data/research-cutoff.json`,
            content: `${JSON.stringify({
                baseline_cutoff: '2026-03-28',
                runtime: 'Antigravity',
                owner,
            }, null, 2)}
`,
        },
        {
            path: `${roleRoot}/data/validation-log.ndjson`,
            content: '',
        },
    ];
}

export function compileAntigravity(
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    const roleIds = uniqueRoleIds(roles, autoAddedRoles);
    const files: GeneratedFile[] = [
        { path: '.agent/rules/team-bootstrap.md', content: renderRuleMd(projectName) },
        { path: '.agent/rules/methodology.md', content: renderAntigravityMethodologyRule(projectName, roleIds) },
        { path: '.agent/workflows/calibrate-team.md', content: renderWorkflowMd(projectName) },
        { path: '.agent/workflows/tdd-cycle.md', content: renderAntigravityWorkflow(projectName, 'tdd-cycle') },
        { path: '.agent/workflows/debugging-protocol.md', content: renderAntigravityWorkflow(projectName, 'debugging-protocol') },
        { path: '.agent/workflows/review-reception.md', content: renderAntigravityWorkflow(projectName, 'review-reception') },
        { path: '.agent/workflows/planning-protocol.md', content: renderAntigravityWorkflow(projectName, 'planning-protocol') },
        { path: '.agent/workflows/git-workflow.md', content: renderAntigravityWorkflow(projectName, 'git-workflow') },
        { path: '.agent/workflows/execution-loop.md', content: renderAntigravityWorkflow(projectName, 'execution-loop') },
    ];

    // Role-level skills (not per-capability) for equalized output
    for (const role of uniqueRoles(roles, autoAddedRoles)) {
        const baseId = extractRoleId(role);
        const def = ROLE_CAPABILITIES[baseId];
        const slug = ROLE_RUNTIME_NAMES[baseId] ?? baseId.toLowerCase();
        const roleRoot = `.agent/skills/${slug}`;

        if (!def) {
            files.push({
                path: `${roleRoot}/SKILL.md`,
                content: `---
name: ${slug}
description: ${role} role for ${projectName}.
---

# ${role} - ${projectName}

## Instructions
- Read team.md before acting.
`,
            });
            files.push(...renderThreeNineSupportFiles(roleRoot, slug));
            continue;
        }

        const allowedCapabilities = new Set(getCapabilitiesForRole(role));
        const caps = def.capabilities.filter(
            (item) => allowedCapabilities.size === 0 || allowedCapabilities.has(item.id),
        );

        const capLines = caps.map((cap) =>
            `### ${cap.id}: ${cap.name}
- Budget: ${cap.budget} words
- Trigger: ${cap.trigger}
- Do not use: ${cap.doNotUse}`,
        ).join('\n\n');

        const deepContent = renderDeepSkillContent(baseId);

        files.push({
            path: `${roleRoot}/SKILL.md`,
            content: `---
name: ${slug}
description: ${def.name} role for ${projectName}.
---

# ${def.name} - ${projectName}

${deepContent}${renderRoleOverrideGuidance(baseId)}## Capabilities

${capLines}

## Instructions
- Read \`ROLE_SKILL_OVERRIDES.md\` before acting.
- Read team.md before acting.
- Respect replace-only config rules.
- Follow shared methodology rules and workflows.
- Never persist secrets or credentials into generated files or patch artifacts.
`,
        });

        if (baseId === 'TL') {
            files.push({
                path: `${roleRoot}/skill-creator.md`,
                content: `# TL Skill Creator

- Create Antigravity-only role skills under .agent/skills/*
- Follow 3-layer + 9-layer structure for generated skill bundles
- Validate each generated technical skill and log failures in data/validation-log.ndjson
`,
            });
            files.push({
                path: `${roleRoot}/calibrate.md`,
                content: `# TL Calibrate

1. Ensure BRD lock is complete with Product Manager.
2. Re-check repo constraints and execution lanes.
3. Update role bundles with replace-only edits.
4. Ask owner before applying shared config changes.
`,
            });
        }

        if (baseId === 'PM') {
            files.push({
                path: `${roleRoot}/brd-lock.md`,
                content: `# PM BRD Lock Protocol

1. Capture BRD summary, domain, audience, and success signal.
2. Define non-goals and hard constraints.
3. Mark BRD status as locked before implementation handoff.
`,
            });
        }

        if (baseId === 'PM' || baseId === 'TL') {
            files.push(...renderThreeNineSupportFiles(roleRoot, slug));
        }
    }

    return files;
}
