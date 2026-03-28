/**
 * StackMoss Config - schema and shared defaults for stackmoss.config.json
 * Authority: BRD §9.1
 */

export const CONFIG_FILENAME = 'stackmoss.config.json';

export const DEFAULT_CONFIG_TARGETS = [
    'ClaudeCode',
    'Antigravity',
    'Codex',
] as const;

export const DEFAULT_CONFIG_BUDGETS = {
    capabilityDefault: 120,
    capabilityMax: 240,
    teamTotalMax: 1800,
    migrationReport: 700,
} as const;

export const DEFAULT_CONFIG_THRESHOLDS = {
    promoteRequiresZeroQuestions: true,
    promoteRequiresVerifiedAlias: true,
    minHypothesisConfidence: 0.8,
    patchTriggerMinRepeat: 2,
} as const;

export const REQUIRED_CONFIG_FIELDS = [
    'schemaVersion',
    'state',
    'userType',
    'projectType',
    'language',
    'targets',
    'mode',
    'intakeMode',
    'budgets',
    'thresholds',
    'autoAddRoles',
] as const;

export interface StackMossConfig {
    schemaVersion: string;
    state: 'GLOBAL' | 'MIGRATING' | 'OPERATIONAL';
    userType: string;
    projectType: string;
    language: 'en' | 'vi';
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
    projectName?: string;
    createdAt?: string;
}

export function createDefaultConfig(
    projectName: string,
    overrides: Partial<StackMossConfig> = {},
): StackMossConfig {
    return {
        schemaVersion: '1.0',
        state: 'GLOBAL',
        userType: 'Unknown',
        projectType: 'Unknown',
        language: 'en',
        targets: [...DEFAULT_CONFIG_TARGETS],
        mode: 'suggest_only',
        intakeMode: 'fast',
        budgets: { ...DEFAULT_CONFIG_BUDGETS },
        thresholds: { ...DEFAULT_CONFIG_THRESHOLDS },
        autoAddRoles: {
            securityLite: false,
            devOpsLite: false,
        },
        projectName,
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}
