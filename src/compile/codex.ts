/**
 * Compile Layer: Codex target
 * Authority:
 * - OpenAI Codex uses AGENTS.md for repo-scoped instructions
 * - Project skills are loaded from .agents/skills/<skill-name>/SKILL.md
 */

import { extractRoleId } from '../templates/team.js';
import type { GeneratedFile } from '../templates/types.js';
import {
    getSharedMethodologyModules,
    renderMethodologySection,
} from './methodology.js';
import { ROLE_CAPABILITIES, renderSkillFile, roleToSlug } from './claude-code.js';
import { uniqueRoleIds, uniqueRoles } from './utils.js';

function renderFrontmatter(name: string, description: string): string {
    return ['---', `name: ${name}`, `description: ${description}`, '---'].join('\n');
}

function renderBootstrapSkill(projectName: string): string {
    return `${renderFrontmatter(
        'stackmoss-bootstrap',
        `Bootstrap and recalibrate the ${projectName} Codex team. Use when initializing, calibrating, or reshaping the team for this repository.`,
    )}

# StackMoss Bootstrap - ${projectName}

## When to Use
- Use when the repository has just been bootstrapped with StackMoss.
- Use when the user asks to calibrate or reshape the Codex agent team.

## Instructions
- Start by reading \`team.md\`, \`FEATURES.md\`, \`NORTH_STAR.md\`, and \`NON_GOALS.md\`.
- Read \`ROLE_SKILL_OVERRIDES.md\` before applying any project-specific role calibration.
- Confirm BRD or \`NORTH_STAR.md\` is locked before implementation. If not, turn F1 into locking scope and constraints.
- Scan the repo before changing delivery lanes. If the repo is still bootstrap-only, report that state instead of inventing implementation facts.
- Treat \`AGENTS.md\` as the repo-level Codex instruction file and \`.agents/skills/*\` as the Codex skill tree.
- Keep \`.agent/*\` reserved for Antigravity and do not mirror Antigravity-only layouts into Codex instructions.
- Tech Lead is the single writer for shared config and must ask the user before applying shared-config patches.
- Never store secrets, tokens, passwords, or private keys in \`AGENTS.md\`, generated skills, or patch artifacts.
`;
}

function renderMethodologySkill(projectName: string, roleIds: string[]): string {
    const modules = getSharedMethodologyModules(roleIds);
    const moduleList = modules.map((module) => `- ${module.title}: ${module.summary}`).join('\n');
    const moduleBodies = modules
        .map((module) => `## ${module.title}\n- Upstream basis: ${module.upstreamSources.join(', ')}\n${module.body}`)
        .join('\n\n');

    return `${renderFrontmatter(
        'methodology',
        `Shared working methodology for ${projectName}. Use for planning, testing, debugging, verification, and review discipline.`,
    )}

# StackMoss Methodology - ${projectName}

This is the shared methodology layer for Codex. Keep role files small and use this skill for working discipline.

## Included Modules
${moduleList}

${moduleBodies}
`;
}

function renderThreeNineSupportFiles(
    skillRoot: string,
    runtimeName: string,
    owner: string,
): GeneratedFile[] {
    return [
        {
            path: `${skillRoot}/references/layer-map.md`,
            content: `# 3-Layer to 9-Layer Map

- Layer 1: metadata frontmatter in SKILL.md
- Layer 2: core instructions in SKILL.md
- Layer 3: references/ and examples/
- Layer 4: executable scripts/
- Layer 5: assets/templates/
- Layer 6: contracts/
- Layer 7: governance/
- Layer 8: data/research-cutoff.json
- Layer 9: data/validation-log.ndjson
`,
        },
        {
            path: `${skillRoot}/examples/session-example.md`,
            content: `# Example Session

1. Read BRD lock status.
2. Execute validation command.
3. Record pass/fail in data/validation-log.ndjson.
4. Ask owner questions if execution cannot run.
`,
        },
        {
            path: `${skillRoot}/scripts/validate-and-log.mjs`,
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
  runtime: '${runtimeName}',
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
            path: `${skillRoot}/assets/templates/owner-questions.md`,
            content: `# Owner Questions

1. Which command should validate this skill in your runtime?
2. Which missing prerequisites must be provided?
3. Should this skill remain blocked until validation can run?
`,
        },
        {
            path: `${skillRoot}/contracts/output-contract.md`,
            content: `# Output Contract

- Return concise status.
- Include command and pass/fail outcome.
- Provide remediation when failed.
`,
        },
        {
            path: `${skillRoot}/governance/evolution.md`,
            content: `# Governance

- Runtime boundary: this skill can modify only ${runtimeName} paths.
- Replace-only updates for generated instructions.
- Validation evidence must stay in local data logs.
`,
        },
        {
            path: `${skillRoot}/data/research-cutoff.json`,
            content: `${JSON.stringify({
                baseline_cutoff: '2026-03-28',
                runtime: runtimeName,
                owner,
            }, null, 2)}
`,
        },
        {
            path: `${skillRoot}/data/validation-log.ndjson`,
            content: '',
        },
    ];
}

export function compileCodex(
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    const allRoles = uniqueRoles(roles, autoAddedRoles);
    const roleIds = uniqueRoleIds(roles, autoAddedRoles);
    const roleList = roleIds.map((roleId) => `- ${roleId}`).join('\n');
    const methodologySection = renderMethodologySection(roleIds);
    const skillList = [
        '- stackmoss-bootstrap: Bootstrap and recalibrate the Codex team for this repository',
        '- skill-creator: Create Codex-only role skills with 3-layer + 9-layer structure',
        ...allRoles.map((role) => {
            const baseId = extractRoleId(role);
            const roleName = ROLE_CAPABILITIES[baseId]?.name ?? role;
            return `- ${roleToSlug(role)}: ${roleName} role behavior for Codex`;
        }),
        '- methodology: Evidence, TDD, debugging, planning, and review discipline',
    ].join('\n');

    const content = `# StackMoss Agent Bootstrap - ${projectName}

Codex should treat this repository as a Tech Lead-first workflow.
This file is \`AGENTS.md\` for Codex and should stay at repo scope.

## First Session Policy

- Start by reading \`team.md\`, \`FEATURES.md\`, \`NORTH_STAR.md\`, and \`NON_GOALS.md\`.
- Read \`ROLE_SKILL_OVERRIDES.md\` before changing role-specific examples, anti-patterns, or checklists.
- Before real feature delivery, confirm the BRD or \`NORTH_STAR.md\` is locked.
- If the BRD is not locked, turn F1 into locking scope, constraints, and success criteria.
- In an existing repo, act as Tech Lead first: scan the repository, ask follow-up questions if facts are missing, and propose bootstrap corrections before implementation.
- Replace stale facts in existing sections. Never append memory logs to config.
- Ask the user before applying any shared config patch.
- Redact secrets from logs, stderr, and copied commands before storing them in repo files.

## Agent Team

${roleList}

## Codex Skills

Codex uses \`AGENTS.md\` as the repo instruction entrypoint and \`.agents/skills/<skill-name>/SKILL.md\` for project skills.
Do not treat \`.agent/*\` as Codex skill folders; that tree remains Antigravity-specific.

Skills live in \`.agents/skills/\` and are auto-discovered by Codex:
${skillList}

## Tech Lead Protocol

- Tech Lead is the coordinator and single writer for shared team config.
- Other roles can surface verified signals, but they do not rewrite shared config directly.
- If commands, paths, or stack facts are uncertain, ask focused follow-up questions instead of assuming.
- When calibrating Codex, keep runtime boundaries clean: \`AGENTS.md\` + \`.agents/skills/*\` for Codex, \`.agent/*\` for Antigravity, \`.claude/*\` for Claude.
- When calibration is complete, update \`team.md\` by replacing the bootstrap calibration marker and stale facts.

${methodologySection}

_Generated by StackMoss. Edit team.md to change shared project instructions._
`;

    const files: GeneratedFile[] = [
        { path: 'AGENTS.md', content },
        {
            path: '.agents/skills/stackmoss-bootstrap/SKILL.md',
            content: renderBootstrapSkill(projectName),
        },
        {
            path: '.agents/skills/methodology/SKILL.md',
            content: renderMethodologySkill(projectName, roleIds),
        },
        {
            path: '.agents/skills/skill-creator/SKILL.md',
            content: `${renderFrontmatter(
                'skill-creator',
                'Runtime-specific skill factory for Codex. Generates only .agents/skills/* bundles with 3-layer + 9-layer structure.',
            )}

# Skill Creator - ${projectName}

## Scope
- Create or update Codex runtime skills only under .agents/skills/*
- Follow the 3-layer + 9-layer structure for each generated skill

## Workflow
1. Validate BRD context and owner intent.
2. Generate one role skill bundle under .agents/skills/<role>/...
3. Run validation command and log pass/fail.

## Validation
- Command(s): node scripts/validate-and-log.mjs "<command>" data/validation-log.ndjson
- Required evidence: command result + pass/fail entry.

## Fallback
- If validation cannot run, ask owner questions and keep status blocked.
`,
        },
    ];

    for (const role of allRoles) {
        const slug = roleToSlug(role);
        const baseId = extractRoleId(role);
        const owner = baseId === 'PM' ? 'product-manager' : baseId === 'TL' ? 'tech-lead' : baseId.toLowerCase();
        const roleRoot = `.agents/skills/${slug}`;
        const roleFile: GeneratedFile = {
            path: `${roleRoot}/SKILL.md`,
            content: renderSkillFile(role, projectName),
        };
        const roleSupport = (baseId === 'PM' || baseId === 'TL')
            ? renderThreeNineSupportFiles(roleRoot, 'Codex', owner)
            : [];
        (files as GeneratedFile[]).push(roleFile, ...roleSupport);
    }

    files.push(...renderThreeNineSupportFiles('.agents/skills/skill-creator', 'Codex', 'skill-creator'));

    return files;
}
