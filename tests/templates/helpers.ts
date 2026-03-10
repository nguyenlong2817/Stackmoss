/**
 * Test helpers — shared test fixtures for template tests
 */

import type { IntakeResult } from '../../src/intake/types.js';
import type { TemplateInput } from '../../src/templates/types.js';

/**
 * Create a sample IntakeResult for testing.
 * Defaults to fast mode, BizLed persona, MVP project.
 */
export function createSampleIntake(overrides: Partial<IntakeResult> = {}): IntakeResult {
    return {
        mode: 'fast',
        answers: {
            Q1: 'BizLed',
            Q2: 'sme',
            Q3: 'vn',
            Q4: 'web',
            Q5: 'pii',
            Q6: 'Tạo landing page',
            Q6b: 'S',
            Q_PT: 'MVP',
        },
        skippedQuestions: [],
        persona: 'BizLed',
        projectType: 'MVP',
        roles: ['TL', 'BA', 'DEV', 'QA(light)', 'DOCS'],
        autoAddedRoles: ['SEC-lite'],
        firstFeature: { name: 'Tạo landing page', appetite: 'S' },
        ...overrides,
    };
}

/**
 * Create a sample TemplateInput for testing.
 */
export function createSampleInput(overrides: Partial<TemplateInput> = {}): TemplateInput {
    return {
        projectName: 'test-project',
        version: '0.1.0',
        intake: createSampleIntake(),
        ...overrides,
    };
}

/**
 * Create an interview-mode IntakeResult.
 */
export function createInterviewIntake(overrides: Partial<IntakeResult> = {}): IntakeResult {
    return {
        mode: 'interview',
        answers: {
            Q1: 'DevLed',
            Q2: 'enterprise',
            Q3: 'global',
            Q4: 'subscription',
            Q5: 'web',
            Q6: 'pii',
            Q7: 'cloud',
            Q8: 'balanced',
            Q9: 'small_team',
            Q10: 'stability',
            Q11: 'db',
            Q12: 'User authentication',
            Q12b: 'M',
            Q_PT: 'Production',
        },
        skippedQuestions: [],
        persona: 'DevLed',
        projectType: 'Production',
        roles: ['TL', 'DEV', 'QA(strong)', 'OPS', 'DOCS'],
        autoAddedRoles: ['SEC-lite', 'OPS-lite'],
        firstFeature: { name: 'User authentication', appetite: 'M' },
        ...overrides,
    };
}
