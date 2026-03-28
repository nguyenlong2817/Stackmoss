import { extractRoleId } from '../templates/team.js';

export type MethodologyModuleId =
    | 'tdd-cycle'
    | 'debugging-protocol'
    | 'evidence-gate'
    | 'planning-protocol'
    | 'review-reception'
    | 'git-workflow'
    | 'execution-loop'
    | 'repo-map-maintenance';

export interface MethodologyModule {
    id: MethodologyModuleId;
    title: string;
    source: 'superpowers-adapted' | 'original';
    upstreamSources: string[];
    roles: string[];
    summary: string;
    body: string;
}

export const METHODOLOGY_MODULE_MAX_WORDS = 120;
export const METHODOLOGY_SHARED_MAX_WORDS = 720;

const MODULES: Record<MethodologyModuleId, MethodologyModule> = {
    'tdd-cycle': {
        id: 'tdd-cycle',
        title: 'TDD Cycle',
        source: 'superpowers-adapted',
        upstreamSources: [
            'test-driven-development',
        ],
        roles: ['DEV', 'QA'],
        summary: 'Write or update the failing test first, confirm the failure, then add the smallest code change to pass.',
        body: 'Start with the smallest test that proves the intended behavior. Run it and confirm the failure is real before touching production code. Write the minimum change needed to make that test pass, rerun the targeted test, then widen verification to nearby regression checks. If code was written before the failing test existed, treat that as draft work and re-enter the cycle with a real failing test. QA should use the same discipline when converting acceptance criteria into executable checks.',
    },
    'debugging-protocol': {
        id: 'debugging-protocol',
        title: 'Systematic Debugging',
        source: 'superpowers-adapted',
        upstreamSources: [
            'systematic-debugging',
        ],
        roles: ['DEV'],
        summary: 'Reproduce first, isolate the fault, identify root cause, and only then patch.',
        body: 'Do not jump from symptom to fix. Reproduce the issue reliably, narrow the failing path, and identify the actual cause before changing code. Prefer targeted logging, focused experiments, and smallest-scope checks over random patching. Once root cause is clear, apply the narrowest fix that addresses it, rerun the reproducer, then run regression checks around the affected area. If the cause is still uncertain, report the uncertainty and ask for missing facts instead of guessing.',
    },
    'evidence-gate': {
        id: 'evidence-gate',
        title: 'Evidence Before Claims',
        source: 'superpowers-adapted',
        upstreamSources: [
            'verification-before-completion',
        ],
        roles: ['ALL'],
        summary: 'Do not claim done, fixed, or passing without fresh verification evidence.',
        body: 'Before claiming a task is done, identify the command, artifact, or observation that proves the claim. Run or inspect it fresh, read the actual result, and state the outcome accurately. If verification fails or is incomplete, report the real status instead of optimistic language. Cite the command or evidence you used whenever practical. This rule applies to implementation, QA, docs, security, and operations work equally: evidence first, claims second.',
    },
    'planning-protocol': {
        id: 'planning-protocol',
        title: 'Planning Protocol',
        source: 'superpowers-adapted',
        upstreamSources: [
            'writing-plans',
        ],
        roles: ['TL'],
        summary: 'Break work into parallel-friendly clusters with clear file ownership and test intent.',
        body: 'When planning non-trivial work, cluster tasks by backend, frontend, devops, and orchestration lanes so AI agents can ship in parallel. Each cluster should produce a verifiable outcome. Identify likely files, interfaces, and tests before execution starts. Prefer small, independently shippable steps over large sequential batches. Keep plans aligned with the locked BRD, the current repo reality, and StackMoss calibration rules. If BRD or repo facts are still unclear, stop planning feature execution and turn the next step into clarification or calibration work first.',
    },
    'git-workflow': {
        id: 'git-workflow',
        title: 'Git Workflow',
        source: 'superpowers-adapted',
        upstreamSources: [
            'git-conventions',
        ],
        roles: ['ALL'],
        summary: 'Initialize Git, commit with conventional messages, and only push after review intent plus a secret check.',
        body: 'At project start, ensure git init and the intended remote are configured. Use conventional commits (feat, fix, chore, docs, refactor) with scope. Commit after each meaningful change to avoid losing work. Before any push, review the diff for secrets, credentials, private keys, and accidental generated noise. Push only when the branch is meant to leave the machine, ideally after review or explicit user intent. Use feature branches for non-trivial work. Never force-push shared branches. Keep commits small and focused on one logical change.',
    },
    'execution-loop': {
        id: 'execution-loop',
        title: 'Execution Loop',
        source: 'superpowers-adapted',
        upstreamSources: [
            'executing-plans',
            'verification-before-completion',
        ],
        roles: ['ALL'],
        summary: 'TL assigns task → DEV implements → QA audits → Ship or Block verdict.',
        body: 'Follow the execution loop: TL breaks feature into subtasks and assigns to DEV. DEV implements with TDD discipline and commits. QA picks up completed work, runs acceptance criteria, and issues Ship or Block verdict. If Block, DEV fixes and resubmits. TL resolves cross-agent conflicts and updates FEATURES.md status. No agent skips the loop. No agent self-approves their own work.',
    },
    'review-reception': {
        id: 'review-reception',
        title: 'Review Reception',
        source: 'superpowers-adapted',
        upstreamSources: [
            'receiving-code-review',
        ],
        roles: ['TL', 'DEV', 'QA'],
        summary: 'Read feedback calmly, verify it against the codebase, then apply or challenge it with technical reasoning.',
        body: 'When receiving review feedback, do not jump into agreement or implementation. First restate or clarify the technical requirement, then verify it against the actual code, tests, and constraints of this repository. Apply changes one item at a time and re-test after each meaningful fix. If feedback is incomplete, conflicts with known constraints, or appears technically wrong, push back with evidence instead of performing agreement. Keep the discussion factual and focused on correctness.',
    },
    'repo-map-maintenance': {
        id: 'repo-map-maintenance',
        title: 'Code Map Maintenance',
        source: 'original',
        upstreamSources: [],
        roles: ['ALL'],
        summary: 'After structural changes, update CODE_MAP.md — no full re-scan needed.',
        body: 'After completing work that changes module boundaries, dependencies, entry points, or critical flows, update the impacted rows in CODE_MAP.md. You already know what changed — do not re-scan the entire codebase to rewrite the map. Patch only affected module rows and flow lines. Regular code edits inside existing boundaries do not require a map update. When in doubt ask: did this change module relationships or impact surface? If yes, update CODE_MAP.md.',
    },
};

function normalizeRoleId(roleId: string): string {
    return extractRoleId(roleId);
}

export function countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
}

function assertMethodologyBudgets(modules: MethodologyModule[]): void {
    let totalWords = 0;

    for (const module of modules) {
        const bodyWords = countWords(module.body);
        if (bodyWords > METHODOLOGY_MODULE_MAX_WORDS) {
            throw new Error(
                `Methodology module '${module.id}' exceeds ${METHODOLOGY_MODULE_MAX_WORDS} words (${bodyWords}).`,
            );
        }
        totalWords += bodyWords;
    }

    if (totalWords > METHODOLOGY_SHARED_MAX_WORDS) {
        throw new Error(
            `Shared methodology exceeds ${METHODOLOGY_SHARED_MAX_WORDS} words (${totalWords}).`,
        );
    }
}

assertMethodologyBudgets(Object.values(MODULES));

export function getMethodologyModulesForRole(roleId: string): MethodologyModule[] {
    const normalizedRole = normalizeRoleId(roleId);
    return Object.values(MODULES).filter(
        (module) => module.roles.includes('ALL') || module.roles.includes(normalizedRole),
    );
}

export function getSharedMethodologyModules(roleIds: string[]): MethodologyModule[] {
    const seen = new Set<MethodologyModuleId>();
    const modules: MethodologyModule[] = [];

    for (const roleId of roleIds) {
        for (const module of getMethodologyModulesForRole(roleId)) {
            if (seen.has(module.id)) {
                continue;
            }
            seen.add(module.id);
            modules.push(module);
        }
    }

    return modules;
}

function renderModuleList(modules: MethodologyModule[]): string {
    return modules.map((module) => `- ${module.title}: ${module.summary}`).join('\n');
}

export function renderSharedMethodologySkill(
    projectName: string,
    roleIds: string[],
    runtimeLabel: string,
): string {
    const modules = getSharedMethodologyModules(roleIds);
    const moduleBodies = modules
        .map((module) => `## ${module.title}\n- Upstream basis: ${module.upstreamSources.join(', ')}\n${module.body}`)
        .join('\n\n');

    return `---
name: stackmoss-methodology
description: Shared working methodology for ${projectName}. Use for planning, testing, debugging, verification, and review discipline.
---

# StackMoss Methodology - ${projectName}

This is the shared methodology layer for ${runtimeLabel}. Keep role files small and use this skill or guidance for working discipline.

## Included Modules
${renderModuleList(modules)}

${moduleBodies}
`;
}

export function renderMethodologyReference(): string {
    return 'Use the shared StackMoss methodology guidance for TDD, debugging, verification, planning, and review discipline.';
}

export function renderMethodologySection(roleIds: string[]): string {
    const modules = getSharedMethodologyModules(roleIds);
    const lines = [
        '## Methodology',
        '',
        'Adapted from selected Superpowers ideas by @obra: https://github.com/obra/superpowers',
        '',
        'Use these shared disciplines while working:',
        renderModuleList(modules),
        '',
        '- Do not import Superpowers workflow assumptions such as worktrees, mandatory subagents, or repo-specific save paths.',
    ];

    return lines.join('\n');
}

export function renderAntigravityMethodologyRule(projectName: string, roleIds: string[]): string {
    const modules = getSharedMethodologyModules(roleIds);
    const moduleBodies = modules
        .map((module) => `## ${module.title}\n- ${module.summary}`)
        .join('\n\n');

    return `# Shared Methodology - ${projectName}

Apply these disciplines across the StackMoss team.

${moduleBodies}

## Always On
- Prefer evidence over claims.
- Ask before applying shared config changes.
- Keep methodology shared and role files concise.
`;
}

export function renderAntigravityWorkflow(
    projectName: string,
    moduleId: Extract<MethodologyModuleId, 'tdd-cycle' | 'debugging-protocol' | 'review-reception' | 'planning-protocol' | 'git-workflow' | 'execution-loop'>,
): string {
    const module = MODULES[moduleId];

    return `# ${module.title}

Description: ${module.summary}

## Protocol
${module.body}

## Project Context
- Project: ${projectName}
- Shared source of truth: team.md
`;
}
