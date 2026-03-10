/**
 * Template: stackmoss.config.json
 * Authority: BRD §9.1
 *
 * Pure function, string interpolation only, no LLM.
 */

import type { GeneratedFile, TemplateInput } from './types.js';

// ─── Full Config Schema (BRD §9.1) ──────────────────────────────

export interface FullStackMossConfig {
    schemaVersion: string;
    state: 'GLOBAL' | 'MIGRATING' | 'OPERATIONAL';
    userType: string;
    projectType: string;
    language: string;
    targets: string[];
    mode: string;
    intakeMode: 'fast' | 'interview';
    budgets: {
        capabilityDefault: number;
        capabilityMax: number;
        teamTotalMax: number;
        migrationReport: number;
    };
    thresholds: {
        promoteRequiresZeroQuestions: boolean;
        promoteRequiresVerifiedAlias: boolean;
        minHypothesisConfidence: number;
        patchTriggerMinRepeat: number;
    };
    autoAddRoles: {
        securityLite: boolean;
        devOpsLite: boolean;
    };
}

// ─── Generator ───────────────────────────────────────────────────

export function generateConfig(input: TemplateInput): GeneratedFile {
    const { intake } = input;

    const config: FullStackMossConfig = {
        schemaVersion: '1.0',
        state: 'GLOBAL',
        userType: intake.persona,
        projectType: intake.projectType,
        language: 'vi',
        targets: ['ClaudeCode'],
        mode: 'suggest_only',
        intakeMode: intake.mode,
        budgets: {
            capabilityDefault: 120,
            capabilityMax: 240,
            teamTotalMax: 1800,
            migrationReport: 700,
        },
        thresholds: {
            promoteRequiresZeroQuestions: true,
            promoteRequiresVerifiedAlias: true,
            minHypothesisConfidence: 0.8,
            patchTriggerMinRepeat: 2,
        },
        autoAddRoles: {
            securityLite: intake.autoAddedRoles.includes('SEC-lite'),
            devOpsLite: intake.autoAddedRoles.includes('OPS-lite'),
        },
    };

    return {
        path: 'stackmoss.config.json',
        content: JSON.stringify(config, null, 2) + '\n',
    };
}
