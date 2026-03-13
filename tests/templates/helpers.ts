import type { IntakeResult } from '../../src/intake/types.js';
import type { TemplateInput } from '../../src/templates/types.js';

export function createSampleIntake(overrides: Partial<IntakeResult> = {}): IntakeResult {
    return {
        mode: 'fast',
        language: 'en',
        answers: {
            Q1: 'BizLed',
            Q2: 'sme',
            Q3: 'none',
            Q4: 'AI coding assistant for retail teams',
            Q5: 'Retail operations',
            Q6: 'pii',
            Q_PT: 'MVP',
        },
        skippedQuestions: [],
        persona: 'BizLed',
        projectType: 'MVP',
        brdStatus: 'none',
        roles: ['TL', 'BA', 'DEV', 'QA(light)', 'DOCS'],
        autoAddedRoles: ['SEC-lite'],
        idea: 'AI coding assistant for retail teams',
        domain: 'Retail operations',
        firstFeature: { name: 'Lock BRD with Tech Lead and BA', appetite: 'M' },
        ...overrides,
    };
}

export function createSampleInput(overrides: Partial<TemplateInput> = {}): TemplateInput {
    return {
        projectName: 'test-project',
        version: '0.1.0',
        intake: createSampleIntake(),
        ...overrides,
    };
}

export function createInterviewIntake(overrides: Partial<IntakeResult> = {}): IntakeResult {
    return {
        mode: 'interview',
        language: 'en',
        answers: {
            Q1: 'DevLed',
            Q2: 'enterprise',
            Q3: 'locked',
            Q4: 'Internal AI workflow automation',
            Q5: 'Developer tooling',
            Q6: 'existing_repo',
            Q7: 'finance',
            Q8: 'cloud',
            Q9: 'small_team',
            Q10: 'Shorten release cycles by 50%',
            Q11: 'partial',
            Q_PT: 'Production',
        },
        skippedQuestions: [],
        persona: 'DevLed',
        projectType: 'Production',
        brdStatus: 'locked',
        roles: ['TL', 'DEV', 'QA(strong)', 'OPS', 'DOCS'],
        autoAddedRoles: ['SEC-lite', 'OPS-lite'],
        idea: 'Internal AI workflow automation',
        domain: 'Developer tooling',
        firstFeature: { name: 'Calibrate team from locked BRD', appetite: 'M' },
        ...overrides,
    };
}
