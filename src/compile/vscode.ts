/**
 * Compile Layer: VS Code / GitHub Copilot
 * Authority: VS Code and GitHub Copilot support repository instructions in
 * .github/copilot-instructions.md and optional *.instructions.md files.
 */

import { extractRoleId } from '../templates/team.js';
import type { GeneratedFile } from '../templates/types.js';

function uniqueRoleIds(roles: string[], autoAddedRoles: string[]): string[] {
    return Array.from(new Set([...roles, ...autoAddedRoles].map(extractRoleId)));
}

export function compileVSCode(
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    const roleIds = uniqueRoleIds(roles, autoAddedRoles);
    const roleList = roleIds.map((roleId) => `- ${roleId}`).join('\n');

    const rootInstructions = `# StackMoss Bootstrap Instructions - ${projectName}

## Working Mode

- Treat \`team.md\` as the shared bootstrap source of truth.
- Before real implementation, confirm the BRD or \`NORTH_STAR.md\` is locked.
- If the BRD is not locked, convert F1 into locking scope, constraints, and success criteria.
- In an existing repo, begin as Tech Lead: scan the codebase, compare repo facts with \`team.md\`, and ask targeted follow-up questions when facts are missing.
- Replace stale facts inside existing sections. Do not append memory logs to config files.
- Ask the user before applying any shared config patch.

## Team Bootstrap

${roleList}

## Expected References

- \`team.md\`
- \`FEATURES.md\`
- \`NORTH_STAR.md\`
- \`NON_GOALS.md\`
- \`AGENTS.md\`
- \`CLAUDE.md\`
`;

    const teamBootstrapInstructions = `---
applyTo: "**"
---

# Team Bootstrap Protocol

- Tech Lead is the coordinator and single writer for shared team config.
- Other roles may report verified commands, paths, stack facts, and acceptance criteria, but must not directly rewrite shared config.
- Ask follow-up questions when repo facts are missing or conflicting.
- Use concise, concrete change proposals and wait for user confirmation before applying config patches.
- Prefer calibrating the agent team before expanding feature scope.
`;

    return [
        {
            path: '.github/copilot-instructions.md',
            content: rootInstructions,
        },
        {
            path: '.github/instructions/team-bootstrap.instructions.md',
            content: teamBootstrapInstructions,
        },
    ];
}
