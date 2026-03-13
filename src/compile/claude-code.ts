/**
 * Compile Layer: Claude Code Targets
 * Authority:
 * - Claude Code skills docs (.claude/skills/<skill-name>/SKILL.md)
 * - CLAUDE.md repo guidance
 */

import type { GeneratedFile } from '../templates/types.js';
import { extractRoleId } from '../templates/team.js';
import { CAPABILITY_BUDGETS, getCapabilitiesForRole } from '../budgets.js';

interface SkillCapability {
    id: string;
    name: string;
    budget: number;
    trigger: string;
    doNotUse: string;
}

export const ROLE_RUNTIME_NAMES: Record<string, string> = {
    TL: 'tech-lead',
    BA: 'business-analyst',
    DEV: 'developer',
    QA: 'quality-assurance',
    DOCS: 'documentation',
    SEC: 'security-auditor',
    OPS: 'devops',
};

function getRoleMaintenance(roleStr: string): string[] {
    const baseId = extractRoleId(roleStr);

    if (baseId === 'TL') {
        return [
            'Confirm BRD or NORTH_STAR is locked before implementation; if not, turn F1 into locking scope and constraints.',
            'Scan the repo, ask focused follow-up questions, and recalibrate the team to the real stack, topology, and delivery lanes.',
            'Act as the single writer for shared team config and prepare replace-only patches when facts change.',
            'Ask the user before applying any shared config patch.',
        ];
    }

    return [
        'Do not edit shared team config directly.',
        'When you verify a command, path, test flow, or deploy fact, send that verified signal to Tech Lead.',
        'Never append memory logs to shared config.',
    ];
}

export const ROLE_CAPABILITIES: Record<string, { name: string; capabilities: SkillCapability[] }> = {
    TL: {
        name: 'Tech Lead',
        capabilities: [
            { id: 'TL-ARCH', name: 'Architecture decisions & ADR', budget: CAPABILITY_BUDGETS['TL-ARCH'] ?? 280, trigger: 'Use when architecture decisions, repo calibration, or team topology changes are needed.', doNotUse: 'Do not use for routine implementation tasks.' },
            { id: 'TL-REVIEW', name: 'Code review & merge gates', budget: CAPABILITY_BUDGETS['TL-REVIEW'] ?? 220, trigger: 'Use when code needs review before merge or deploy.', doNotUse: 'Do not use for first-draft implementation.' },
            { id: 'TL-CONTEXT', name: 'Maintain CONTEXT.md & FEATURES.md', budget: CAPABILITY_BUDGETS['TL-CONTEXT'] ?? 180, trigger: 'Use after completing a feature or major decision.', doNotUse: 'Do not use mid-task.' },
            { id: 'TL-PLAN', name: 'Break down features & assign subtasks', budget: CAPABILITY_BUDGETS['TL-PLAN'] ?? 200, trigger: 'Use at the start of each feature cycle or when reshaping delivery lanes.', doNotUse: 'Do not use during isolated coding work.' },
        ],
    },
    BA: {
        name: 'Business Analyst',
        capabilities: [
            { id: 'BA-REQ', name: 'Requirements elicitation & clarification', budget: CAPABILITY_BUDGETS['BA-REQ'] ?? 220, trigger: 'Use when requirements are unclear or conflicting.', doNotUse: 'Do not use for technical decisions.' },
            { id: 'BA-AC', name: 'Acceptance criteria writing', budget: CAPABILITY_BUDGETS['BA-AC'] ?? 180, trigger: 'Use at feature start to define pass/fail criteria.', doNotUse: 'Do not use during implementation.' },
        ],
    },
    DEV: {
        name: 'Developer',
        capabilities: [
            { id: 'DEV-IMPL', name: 'Feature implementation', budget: CAPABILITY_BUDGETS['DEV-IMPL'] ?? 260, trigger: 'Use when implementing code for a feature.', doNotUse: 'Do not use for architecture decisions.' },
            { id: 'DEV-ENV', name: 'Environment & command knowledge', budget: CAPABILITY_BUDGETS['DEV-ENV'] ?? 200, trigger: 'Use when running commands, checking paths, or managing the local environment.', doNotUse: 'Do not use for business logic decisions.' },
            { id: 'DEV-DEBUG', name: 'Debug & error resolution', budget: CAPABILITY_BUDGETS['DEV-DEBUG'] ?? 180, trigger: 'Use when debugging errors or unexpected behavior.', doNotUse: 'Do not use for new feature planning.' },
        ],
    },
    QA: {
        name: 'Quality Assurance',
        capabilities: [
            { id: 'QA-TEST', name: 'Test & verify acceptance criteria', budget: CAPABILITY_BUDGETS['QA-TEST'] ?? 180, trigger: 'Use after implementation to verify that a feature works.', doNotUse: 'Do not use during planning.' },
            { id: 'QA-REGRESSION', name: 'Regression checklist', budget: CAPABILITY_BUDGETS['QA-REGRESSION'] ?? 150, trigger: 'Use before marking a feature done.', doNotUse: 'Do not use for new feature development.' },
        ],
    },
    DOCS: {
        name: 'Documentation',
        capabilities: [
            { id: 'DOCS-README', name: 'README & runbook updates', budget: CAPABILITY_BUDGETS['DOCS-README'] ?? 160, trigger: 'Use after a feature is done.', doNotUse: 'Do not use during implementation.' },
            { id: 'DOCS-CHANGELOG', name: 'Changelog', budget: CAPABILITY_BUDGETS['DOCS-CHANGELOG'] ?? 130, trigger: 'Use at the end of a feature cycle.', doNotUse: 'Do not use mid-feature.' },
        ],
    },
    SEC: {
        name: 'Security-lite',
        capabilities: [
            { id: 'SEC-SCAN', name: 'Basic security check', budget: CAPABILITY_BUDGETS['SEC-SCAN'] ?? 180, trigger: 'Use before any feature touching auth, PII, or financial data.', doNotUse: 'Do not use for non-sensitive features.' },
        ],
    },
    OPS: {
        name: 'DevOps-lite',
        capabilities: [
            { id: 'OPS-DEPLOY', name: 'Deploy & infra checks', budget: CAPABILITY_BUDGETS['OPS-DEPLOY'] ?? 180, trigger: 'Use before deploy or infrastructure changes.', doNotUse: 'Do not use for feature development.' },
        ],
    },
};

function uniqueRoles(roles: string[], autoAddedRoles: string[]): string[] {
    const seen = new Set<string>();
    const allRoles: string[] = [];

    for (const role of [...roles, ...autoAddedRoles]) {
        const baseId = extractRoleId(role);
        if (!seen.has(baseId)) {
            seen.add(baseId);
            allRoles.push(role);
        }
    }

    return allRoles;
}

export function roleToSlug(role: string): string {
    const baseId = extractRoleId(role);
    return ROLE_RUNTIME_NAMES[baseId] ?? baseId.toLowerCase();
}

function getRoleDefinition(roleStr: string): { name: string; capabilities: SkillCapability[] } | undefined {
    const baseId = extractRoleId(roleStr);
    const def = ROLE_CAPABILITIES[baseId];

    if (!def) {
        return undefined;
    }

    const allowedCapabilities = new Set(getCapabilitiesForRole(roleStr));
    return {
        name: def.name,
        capabilities: def.capabilities.filter(
            (cap) => allowedCapabilities.size === 0 || allowedCapabilities.has(cap.id),
        ),
    };
}

function renderSkillBody(roleStr: string, projectName: string): string {
    const def = getRoleDefinition(roleStr);

    if (!def) {
        return `# ${roleStr} - ${projectName}

## When to Use
- Use when tasks for this role are explicitly requested.

## Instructions
- Read team.md before acting.
`;
    }

    const capLines = def.capabilities.map((cap) =>
        `### ${cap.id}: ${cap.name}
- Budget: ${cap.budget} words
- Trigger: ${cap.trigger}
- Do not use: ${cap.doNotUse}`,
    ).join('\n\n');

    return `# ${def.name} - ${projectName}

## When to Use
${def.capabilities.map((cap) => `- ${cap.trigger}`).join('\n')}

## Capabilities

${capLines}

## Config Maintenance
${getRoleMaintenance(roleStr).map((line) => `- ${line}`).join('\n')}

`;
}

function renderSkillFile(roleStr: string, projectName: string): string {
    const slug = roleToSlug(roleStr);
    const def = getRoleDefinition(roleStr);
    const description = def
        ? `${def.name} role for ${projectName}. Use when ${def.name.toLowerCase()} work is needed.`
        : `${roleStr} role for ${projectName}.`;

    return `---
name: ${slug}
description: ${description}
---

${renderSkillBody(roleStr, projectName)}`;
}

function renderClaudeMd(roles: string[], projectName: string): string {
    const lines = [
        `# ${projectName}`,
        '_Agent team bootstrap generated by StackMoss._',
        '',
        '## First Session Policy',
        '- Read team.md, FEATURES.md, NORTH_STAR.md, and NON_GOALS.md before acting.',
        '- Confirm BRD or NORTH_STAR is locked before real feature delivery.',
        '- If the BRD is not locked, turn F1 into locking scope, constraints, and success criteria.',
        '- Begin in Tech Lead mode: scan the repo, ask follow-up questions, and calibrate the team before implementation.',
        '- Shared config changes are replace-only and require user confirmation before apply.',
        '',
        '## Claude Code Skill Layout',
        '- Project skills live in .claude/skills/<skill-name>/SKILL.md.',
        '- Keep CLAUDE.md for repo-wide guidance and use skill folders for role behavior.',
        '',
        '## Team Skills',
    ];

    for (const role of roles) {
        const baseId = extractRoleId(role);
        const roleName = ROLE_CAPABILITIES[baseId]?.name ?? role;
        lines.push(`- ${roleName}: .claude/skills/${roleToSlug(role)}/SKILL.md`);
    }

    lines.push('');

    return `${lines.join('\n')}\n`;
}

/**
 * Legacy Claude Code target preserved for compatibility.
 */
export function compileClaudeCode(
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    return uniqueRoles(roles, autoAddedRoles).map((role) => ({
        path: `.claude/skills/${roleToSlug(role)}.skill.md`,
        content: renderSkillBody(role, projectName),
    }));
}

/**
 * Official Claude Code bootstrap:
 * - CLAUDE.md at repo root
 * - .claude/skills/<skill-name>/SKILL.md
 */
export function compileClaudeCodeV2(
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    const allRoles = uniqueRoles(roles, autoAddedRoles);
    const files: GeneratedFile[] = [
        {
            path: 'CLAUDE.md',
            content: renderClaudeMd(allRoles, projectName),
        },
    ];

    for (const role of allRoles) {
        files.push({
            path: `.claude/skills/${roleToSlug(role)}/SKILL.md`,
            content: renderSkillFile(role, projectName),
        });
    }

    return files;
}
