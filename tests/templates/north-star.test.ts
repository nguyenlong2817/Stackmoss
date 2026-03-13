import { describe, it, expect } from 'vitest';
import { generateNorthStar } from '../../src/templates/north-star.js';
import { createSampleInput, createInterviewIntake } from './helpers.js';

describe('Template: NORTH_STAR.md', () => {
    it('generates NORTH_STAR.md file', () => {
        const result = generateNorthStar(createSampleInput());

        expect(result.path).toBe('NORTH_STAR.md');
        expect(result.content.length).toBeGreaterThan(0);
    });

    it('includes project name and persona', () => {
        const result = generateNorthStar(createSampleInput());

        expect(result.content).toContain('test-project');
        expect(result.content).toContain('Biz lead');
    });

    it('includes audience, BRD status, idea, and domain', () => {
        const result = generateNorthStar(createSampleInput());

        expect(result.content).toContain('SME');
        expect(result.content).toContain('Chua co');
        expect(result.content).toContain('AI coding assistant for retail teams');
        expect(result.content).toContain('Retail operations');
    });

    it('includes derived bootstrap objective', () => {
        const result = generateNorthStar(createSampleInput());
        expect(result.content).toContain('Lock BRD with Tech Lead and BA');
    });

    it('includes interview-only deploy and success info', () => {
        const input = createSampleInput({ intake: createInterviewIntake() });
        const result = generateNorthStar(input);

        expect(result.content).toContain('Cloud');
        expect(result.content).toContain('Shorten release cycles by 50%');
        expect(result.content).toContain('Calibrate team from locked BRD');
    });
});
