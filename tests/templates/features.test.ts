import { describe, it, expect } from 'vitest';
import { generateFeatures } from '../../src/templates/features.js';
import { createSampleInput, createSampleIntake } from './helpers.js';

describe('Template: FEATURES.md', () => {
    it('generates FEATURES.md file', () => {
        const result = generateFeatures(createSampleInput());

        expect(result.path).toBe('FEATURES.md');
        expect(result.content.length).toBeGreaterThan(0);
    });

    it('includes project name', () => {
        const result = generateFeatures(createSampleInput());
        expect(result.content).toContain('test-project');
    });

    it('uses derived bootstrap F1 by default', () => {
        const result = generateFeatures(createSampleInput());

        expect(result.content).toContain('Lock BRD with Tech Lead and BA');
        expect(result.content).toContain('appetite: M');
    });

    it('supports explicit feature overrides in fixtures', () => {
        const input = createSampleInput({
            intake: createSampleIntake({
                firstFeature: { name: 'Auth system', appetite: 'L' },
            }),
        });
        const result = generateFeatures(input);

        expect(result.content).toContain('Auth system');
        expect(result.content).toContain('appetite: L');
    });

    it('has status and acceptance placeholders', () => {
        const result = generateFeatures(createSampleInput());

        expect(result.content).toContain('**Status:** TODO');
        expect(result.content).toContain('- [ ] Pass:');
        expect(result.content).toContain('- [ ] Fail if:');
    });
});
