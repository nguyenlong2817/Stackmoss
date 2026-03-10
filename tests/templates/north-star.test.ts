/**
 * Tests: NORTH_STAR.md template
 * Authority: BRD §9.4
 */

import { describe, it, expect } from 'vitest';
import { generateNorthStar } from '../../src/templates/north-star.js';
import { createSampleInput, createInterviewIntake } from './helpers.js';

describe('Template: NORTH_STAR.md', () => {
    it('generates NORTH_STAR.md file', () => {
        const result = generateNorthStar(createSampleInput());

        expect(result.path).toBe('NORTH_STAR.md');
        expect(result.content.length).toBeGreaterThan(0);
    });

    it('includes project name', () => {
        const result = generateNorthStar(createSampleInput());

        expect(result.content).toContain('test-project');
    });

    it('maps persona from intake', () => {
        const result = generateNorthStar(createSampleInput());

        expect(result.content).toContain('Biz lead');
    });

    it('maps audience from Q2', () => {
        const result = generateNorthStar(createSampleInput());

        expect(result.content).toContain('SME');
    });

    it('maps geography constraint from Q3', () => {
        const result = generateNorthStar(createSampleInput());

        expect(result.content).toContain('Việt Nam');
    });

    it('includes first feature name', () => {
        const result = generateNorthStar(createSampleInput());

        expect(result.content).toContain('Tạo landing page');
    });

    it('includes data sensitivity info', () => {
        const result = generateNorthStar(createSampleInput());

        expect(result.content).toContain('PII');
    });

    it('includes interview-only constraints (deploy, budget)', () => {
        const input = createSampleInput({
            intake: createInterviewIntake(),
        });
        const result = generateNorthStar(input);

        expect(result.content).toContain('Cloud');
        expect(result.content).toContain('Cân bằng');
    });
});
