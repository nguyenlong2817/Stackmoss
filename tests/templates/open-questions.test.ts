/**
 * Tests: OPEN_QUESTIONS.md template
 * Authority: BRD §9.7
 */

import { describe, it, expect } from 'vitest';
import { generateOpenQuestions } from '../../src/templates/open-questions.js';
import { createSampleInput, createSampleIntake } from './helpers.js';

describe('Template: OPEN_QUESTIONS.md', () => {
    it('returns null when no skipped questions', () => {
        const input = createSampleInput(); // no skipped questions
        const result = generateOpenQuestions(input);

        expect(result).toBeNull();
    });

    it('generates file when there are skipped questions', () => {
        const input = createSampleInput({
            intake: createSampleIntake({
                skippedQuestions: ['Q3', 'Q4'],
            }),
        });
        const result = generateOpenQuestions(input);

        expect(result).not.toBeNull();
        expect(result!.path).toBe('OPEN_QUESTIONS.md');
    });

    it('lists each skipped question as unresolved', () => {
        const input = createSampleInput({
            intake: createSampleIntake({
                skippedQuestions: ['Q3', 'Q4'],
            }),
        });
        const result = generateOpenQuestions(input)!;

        expect(result.content).toContain('Q3:');
        expect(result.content).toContain('Q4:');
    });

    it('includes question labels', () => {
        const input = createSampleInput({
            intake: createSampleIntake({
                skippedQuestions: ['Q3'],
            }),
        });
        const result = generateOpenQuestions(input)!;

        expect(result.content).toContain('Phạm vi địa lý');
    });

    it('has checkbox format for unresolved items', () => {
        const input = createSampleInput({
            intake: createSampleIntake({
                skippedQuestions: ['Q3'],
            }),
        });
        const result = generateOpenQuestions(input)!;

        expect(result.content).toContain('- [ ]');
    });

    it('includes project name', () => {
        const input = createSampleInput({
            intake: createSampleIntake({
                skippedQuestions: ['Q3'],
            }),
        });
        const result = generateOpenQuestions(input)!;

        expect(result.content).toContain('test-project');
    });
});
