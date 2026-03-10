/**
 * Tests: FEATURES.md template
 * Authority: BRD §9.3
 */

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

    it('has F1 with feature name from intake', () => {
        const result = generateFeatures(createSampleInput());

        expect(result.content).toContain('Tạo landing page');
    });

    it('has F1 with appetite S', () => {
        const result = generateFeatures(createSampleInput());

        expect(result.content).toContain('appetite: S');
    });

    it('has F1 with appetite M', () => {
        const input = createSampleInput({
            intake: createSampleIntake({
                firstFeature: { name: 'Auth system', appetite: 'M' },
            }),
        });
        const result = generateFeatures(input);

        expect(result.content).toContain('appetite: M');
    });

    it('has F1 with appetite L', () => {
        const input = createSampleInput({
            intake: createSampleIntake({
                firstFeature: { name: 'Full platform', appetite: 'L' },
            }),
        });
        const result = generateFeatures(input);

        expect(result.content).toContain('appetite: L');
    });

    it('has Status TODO', () => {
        const result = generateFeatures(createSampleInput());

        expect(result.content).toContain('**Status:** TODO');
    });

    it('has acceptance criteria placeholders', () => {
        const result = generateFeatures(createSampleInput());

        expect(result.content).toContain('- [ ] Pass:');
        expect(result.content).toContain('- [ ] Fail if:');
    });
});
