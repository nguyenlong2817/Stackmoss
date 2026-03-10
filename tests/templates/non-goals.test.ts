/**
 * Tests: NON_GOALS.md template
 * Authority: BRD §9.4 (adjacent)
 */

import { describe, it, expect } from 'vitest';
import { generateNonGoals } from '../../src/templates/non-goals.js';
import { createSampleInput } from './helpers.js';

describe('Template: NON_GOALS.md', () => {
    it('generates NON_GOALS.md file', () => {
        const result = generateNonGoals(createSampleInput());

        expect(result.path).toBe('NON_GOALS.md');
    });

    it('includes project name', () => {
        const result = generateNonGoals(createSampleInput());

        expect(result.content).toContain('test-project');
    });

    it('has exactly 3 non-goal lines', () => {
        const result = generateNonGoals(createSampleInput());
        const lines = result.content.split('\n').filter((l) => l.startsWith('- '));

        expect(lines).toHaveLength(3);
    });

    it('includes multi-project non-goal', () => {
        const result = generateNonGoals(createSampleInput());

        expect(result.content).toContain('multi-project');
    });

    it('includes no auto-deploy non-goal', () => {
        const result = generateNonGoals(createSampleInput());

        expect(result.content).toContain('suggest-only');
    });

    it('includes no LLM required non-goal', () => {
        const result = generateNonGoals(createSampleInput());

        expect(result.content).toContain('optional');
    });
});
