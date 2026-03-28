/**
 * Tests: OPEN_QUESTIONS.md template
 * Authority: BRD §9.7
 */

import { describe, expect, it } from 'vitest';
import { generateOpenQuestions } from '../../src/templates/open-questions.js';
import { createSampleInput, createSampleIntake } from './helpers.js';

describe('Template: OPEN_QUESTIONS.md', () => {
    it('returns null when no skipped questions', () => {
        const input = createSampleInput();
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

    it('includes updated BRD-first labels', () => {
        const input = createSampleInput({
            intake: createSampleIntake({
                skippedQuestions: ['Q3'],
            }),
        });
        const result = generateOpenQuestions(input)!;

        expect(result.content).toContain('BRD dang o trang thai nao?');
    });

    it('uses mode-specific labels for each mode question set', () => {
        const fastInput = createSampleInput({
            intake: createSampleIntake({
                skippedQuestions: ['Q4'],
            }),
        });
        const interviewInput = createSampleInput({
            intake: createSampleIntake({
                mode: 'interview',
                skippedQuestions: ['Q6'],
            }),
        });

        expect(generateOpenQuestions(fastInput)!.content).toContain('Idea cua san pham la gi?');
        expect(generateOpenQuestions(interviewInput)!.content).toContain('Repo hien tai dang o trang thai nao?');
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
