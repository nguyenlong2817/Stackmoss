/**
 * Compile Layer: Cursor Target
 * Authority: Cursor Agent Skills docs
 *
 * Cursor natively loads skills from:
 * - .cursor/skills/
 */

import type { GeneratedFile } from '../templates/types.js';
import { extractRoleId } from '../templates/team.js';
import { ROLE_CAPABILITIES, roleToSlug } from './claude-code.js';
import { getCapabilitiesForRole } from '../budgets.js';

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

function renderFrontmatter(name: string, description: string, disableModelInvocation?: boolean): string {
    const lines = ['---', `name: ${name}`, `description: ${description}`];
    if (disableModelInvocation) {
        lines.push('disable-model-invocation: true');
    }
    lines.push('---');
    return lines.join('\n');
}

function renderRoleSkill(roleStr: string, projectName: string): string {
    const baseId = extractRoleId(roleStr);
    const def = ROLE_CAPABILITIES[baseId];
    const slug = roleToSlug(roleStr);

    if (!def) {
        return `${renderFrontmatter(slug, `${roleStr} role for ${projectName}.`)}

# ${roleStr} - ${projectName}

## When to Use
- Use this skill when the user explicitly assigns work to this role.

## Instructions
- Read team.md before acting.
`;
    }

    const allowedCapabilities = new Set(getCapabilitiesForRole(roleStr));
    const capabilities = def.capabilities
        .filter((cap) => allowedCapabilities.size === 0 || allowedCapabilities.has(cap.id))
        .map((cap) =>
            `### ${cap.id}: ${cap.name}
- Budget: ${cap.budget} words
- Trigger: ${cap.trigger}
- Do not use: ${cap.doNotUse}`,
        )
        .join('\n\n');

    const maintenanceLines = baseId === 'TL'
        ? [
            'Confirm BRD or NORTH_STAR is locked before implementation.',
            'Scan the repo, ask follow-up questions, and recalibrate the team before implementation.',
            'Prepare replace-only config patches and ask the user before apply.',
        ]
        : [
            'Do not edit shared team config directly.',
            'Send verified command, path, test, and deploy signals to Tech Lead.',
        ];

    return `${renderFrontmatter(
        slug,
        `${def.name} role for ${projectName}. Use when ${def.name.toLowerCase()} work is needed.`,
    )}

# ${def.name} - ${projectName}

## When to Use
${def.capabilities
        .filter((cap) => allowedCapabilities.size === 0 || allowedCapabilities.has(cap.id))
        .map((cap) => `- ${cap.trigger}`)
        .join('\n')}

## Instructions
${maintenanceLines.map((line) => `- ${line}`).join('\n')}

## Capabilities

${capabilities}
`;
}

function renderBootstrapSkill(projectName: string): string {
    return `${renderFrontmatter(
        'stackmoss-bootstrap',
        `Bootstrap and recalibrate the ${projectName} agent team. Use when initializing, calibrating, or reshaping the team for this repository.`,
    )}

# StackMoss Bootstrap - ${projectName}

## When to Use
- Use when the repository has just been bootstrapped with StackMoss.
- Use when the user asks Tech Lead to scan the repo or recalibrate the team.

## Instructions
- Start by reading team.md, FEATURES.md, NORTH_STAR.md, and NON_GOALS.md.
- Confirm BRD or NORTH_STAR is locked before implementation. If not, turn F1 into locking scope and constraints.
- Scan the repo, ask follow-up questions for missing facts, and replace stale facts inside existing sections.
- Tech Lead is the single writer for shared config and must ask the user before applying patches.
`;
}

/**
 * Compile roles to Cursor-native skills.
 */
export function compileCursor(
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    const files: GeneratedFile[] = [
        {
            path: '.cursor/skills/stackmoss-bootstrap/SKILL.md',
            content: renderBootstrapSkill(projectName),
        },
    ];

    for (const role of uniqueRoles(roles, autoAddedRoles)) {
        files.push({
            path: `.cursor/skills/${roleToSlug(role)}/SKILL.md`,
            content: renderRoleSkill(role, projectName),
        });
    }

    return files;
}
