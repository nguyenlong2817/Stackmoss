/**
 * Tests: stackmoss.config.json template
 * Authority: BRD §9.1
 */

import { describe, it, expect } from 'vitest';
import { generateConfig } from '../../src/templates/config.js';
import type { FullStackMossConfig } from '../../src/templates/config.js';
import { createSampleInput, createInterviewIntake } from './helpers.js';

describe('Template: stackmoss.config.json', () => {
    it('generates valid JSON', () => {
        const input = createSampleInput();
        const result = generateConfig(input);

        expect(result.path).toBe('stackmoss.config.json');
        const parsed = JSON.parse(result.content) as FullStackMossConfig;
        expect(parsed).toBeDefined();
    });

    it('matches BRD §9.1 schema fields', () => {
        const input = createSampleInput();
        const result = generateConfig(input);
        const config = JSON.parse(result.content) as FullStackMossConfig;

        expect(config.schemaVersion).toBe('1.0');
        expect(config.state).toBe('GLOBAL');
        expect(config.userType).toBe('BizLed');
        expect(config.projectType).toBe('MVP');
        expect(config.language).toBe('vi');
        expect(config.targets).toEqual(['ClaudeCode']);
        expect(config.mode).toBe('suggest_only');
        expect(config.intakeMode).toBe('fast');
    });

    it('has correct budget values', () => {
        const input = createSampleInput();
        const config = JSON.parse(generateConfig(input).content) as FullStackMossConfig;

        expect(config.budgets.capabilityDefault).toBe(120);
        expect(config.budgets.capabilityMax).toBe(240);
        expect(config.budgets.teamTotalMax).toBe(1800);
        expect(config.budgets.migrationReport).toBe(700);
    });

    it('has correct threshold values', () => {
        const input = createSampleInput();
        const config = JSON.parse(generateConfig(input).content) as FullStackMossConfig;

        expect(config.thresholds.promoteRequiresZeroQuestions).toBe(true);
        expect(config.thresholds.promoteRequiresVerifiedAlias).toBe(true);
        expect(config.thresholds.minHypothesisConfidence).toBe(0.8);
        expect(config.thresholds.patchTriggerMinRepeat).toBe(2);
    });

    it('derives autoAddRoles.securityLite from intake', () => {
        const input = createSampleInput(); // has SEC-lite in autoAddedRoles
        const config = JSON.parse(generateConfig(input).content) as FullStackMossConfig;

        expect(config.autoAddRoles.securityLite).toBe(true);
    });

    it('derives autoAddRoles.devOpsLite from intake', () => {
        const input = createSampleInput({
            intake: createInterviewIntake(), // has OPS-lite
        });
        const config = JSON.parse(generateConfig(input).content) as FullStackMossConfig;

        expect(config.autoAddRoles.devOpsLite).toBe(true);
    });

    it('sets intakeMode correctly for interview mode', () => {
        const input = createSampleInput({
            intake: createInterviewIntake(),
        });
        const config = JSON.parse(generateConfig(input).content) as FullStackMossConfig;

        expect(config.intakeMode).toBe('interview');
    });
});
