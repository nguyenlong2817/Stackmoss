/**
 * Pack Selector — 2D Matrix overlay compose (UserType × ProjectType)
 * Authority: BRD §10, intake-engine skill
 *
 * Deterministic logic, no LLM.
 */

import type { Persona, ProjectType, RawAnswers } from './types.js';

// ─── Persona Detection ───────────────────────────────────────────

/**
 * Map Q1 answer → Persona.
 * Direct mapping, no inference.
 */
export function detectPersona(q1Answer: string): Persona {
    const map: Record<string, Persona> = {
        BizLed: 'BizLed',
        DevLed: 'DevLed',
        Solo: 'Solo',
        Newbie: 'Newbie',
    };

    return map[q1Answer] ?? 'Newbie';
}

// ─── Project Type ────────────────────────────────────────────────

/**
 * Read explicit project type from Q_PT answer.
 * Owner-approved: explicit question, no inference.
 */
export function getProjectType(answers: RawAnswers): ProjectType {
    const raw = answers['Q_PT'] as string | undefined;
    const valid: ProjectType[] = ['MVP', 'Production', 'InternalTool', 'LibraryAPI'];

    if (raw && valid.includes(raw as ProjectType)) {
        return raw as ProjectType;
    }

    if (!raw) {
        throw new Error('Project type is required (Q_PT).');
    }

    throw new Error(`Invalid project type: '${raw}'. Valid: ${valid.join(', ')}`);
}

// ─── 2D Matrix: Role Selection ───────────────────────────────────

/**
 * BRD §10.2 Role Mapping Table.
 *
 * | UserType | ProjectType  | Roles                              |
 * |----------|--------------|-------------------------------------|
 * | BizLed   | MVP          | TL, BA, DEV, QA(light), DOCS        |
 * | BizLed   | Production   | TL, BA, DEV, QA(strong), OPS(light), DOCS |
 * | DevLed   | MVP          | TL, DEV, QA, DOCS                   |
 * | DevLed   | Production   | TL, DEV, QA(strong), OPS, DOCS      |
 * | Solo     | MVP          | TL, DEV, QA(light)                  |
 * | Solo     | Production   | TL, DEV, QA, DOCS                   |
 * | Newbie   | any          | TL(guide), DEV(small), QA(checklist), DOCS |
 */
export function selectRoles(persona: Persona, projectType: ProjectType): string[] {
    // Newbie overrides everything
    if (persona === 'Newbie') {
        return ['TL(guide)', 'DEV(small)', 'QA(checklist)', 'DOCS'];
    }

    const matrix: Record<string, Record<string, string[]>> = {
        BizLed: {
            MVP: ['TL', 'BA', 'DEV', 'QA(light)', 'DOCS'],
            Production: ['TL', 'BA', 'DEV', 'QA(strong)', 'OPS(light)', 'DOCS'],
            InternalTool: ['TL', 'BA', 'DEV', 'QA(light)', 'DOCS'],
            LibraryAPI: ['TL', 'BA', 'DEV', 'QA(strong)', 'DOCS'],
        },
        DevLed: {
            MVP: ['TL', 'DEV', 'QA', 'DOCS'],
            Production: ['TL', 'DEV', 'QA(strong)', 'OPS', 'DOCS'],
            InternalTool: ['TL', 'DEV', 'QA', 'DOCS'],
            LibraryAPI: ['TL', 'DEV', 'QA(strong)', 'DOCS'],
        },
        Solo: {
            MVP: ['TL', 'DEV', 'QA(light)'],
            Production: ['TL', 'DEV', 'QA', 'DOCS'],
            InternalTool: ['TL', 'DEV', 'QA(light)'],
            LibraryAPI: ['TL', 'DEV', 'QA', 'DOCS'],
        },
    };

    return matrix[persona]?.[projectType] ?? ['TL', 'DEV', 'QA'];
}
