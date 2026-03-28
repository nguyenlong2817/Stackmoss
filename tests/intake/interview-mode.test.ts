import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@inquirer/prompts', () => ({
    select: vi.fn(),
    input: vi.fn(),
    checkbox: vi.fn().mockResolvedValue([]),
}));

import { select, input, checkbox } from '@inquirer/prompts';
import { runInterviewMode } from '../../src/intake/interview-mode.js';

const mockSelect = vi.mocked(select);
const mockInput = vi.mocked(input);
const mockCheckbox = vi.mocked(checkbox);

describe('Interview Mode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('collects 9 interview answers', async () => {
        mockSelect
            .mockResolvedValueOnce('draft')
            .mockResolvedValueOnce('enterprise')
            .mockResolvedValueOnce('finance')
            .mockResolvedValueOnce('existing_repo');

        mockInput
            .mockResolvedValueOnce('AI workflow automation')
            .mockResolvedValueOnce('Developer tooling')
            .mockResolvedValueOnce('Reduce release coordination overhead')
            .mockResolvedValueOnce('No mobile app in v1')
            .mockResolvedValueOnce('6-week timeline, fixed team size');

        const result = await runInterviewMode();

        expect(result.answers['Q3']).toBe('draft');
        expect(result.answers['Q4']).toBe('AI workflow automation');
        expect(result.answers['Q5']).toBe('Developer tooling');
        expect(result.answers['Q2']).toBe('enterprise');
        expect(result.answers['Q10']).toBe('Reduce release coordination overhead');
        expect(result.answers['Q_NON_GOALS']).toBe('No mobile app in v1');
        expect(result.answers['Q7']).toBe('finance');
        expect(result.answers['Q6']).toBe('existing_repo');
        expect(result.answers['Q_CONSTRAINTS']).toBe('6-week timeline, fixed team size');
    });

    it('runs completeness gate for missing audience', async () => {
        mockSelect
            .mockResolvedValueOnce('none')
            .mockResolvedValueOnce(undefined as any)
            .mockResolvedValueOnce('none')
            .mockResolvedValueOnce('greenfield')
            .mockResolvedValueOnce('sme');

        mockInput
            .mockResolvedValueOnce('API orchestration toolkit')
            .mockResolvedValueOnce('Developer infrastructure')
            .mockResolvedValueOnce('Ship a validated BRD')
            .mockResolvedValueOnce('No ML model in v1')
            .mockResolvedValueOnce('Budget cap and legal review');

        const result = await runInterviewMode();

        expect(result.answers['Q2']).toBe('sme');
        expect(result.skippedQuestions).not.toContain('Q2');
    });

    it('runs completeness gate for missing success signal', async () => {
        mockSelect
            .mockResolvedValueOnce('none')
            .mockResolvedValueOnce('community')
            .mockResolvedValueOnce('none')
            .mockResolvedValueOnce('greenfield');

        mockInput
            .mockResolvedValueOnce('Learning assistant')
            .mockResolvedValueOnce('Education')
            .mockResolvedValueOnce('')
            .mockResolvedValueOnce('No paid plan in v1')
            .mockResolvedValueOnce('No external funding yet')
            .mockResolvedValueOnce('First users can complete onboarding end-to-end');

        const result = await runInterviewMode();

        expect(result.answers['Q10']).toBe('First users can complete onboarding end-to-end');
        expect(mockInput).toHaveBeenCalledTimes(6);
    });

    it('does not call role checkbox preselection', async () => {
        mockSelect
            .mockResolvedValueOnce('locked')
            .mockResolvedValueOnce('enterprise')
            .mockResolvedValueOnce('finance')
            .mockResolvedValueOnce('existing_repo');

        mockInput
            .mockResolvedValueOnce('Idea')
            .mockResolvedValueOnce('Domain')
            .mockResolvedValueOnce('Success')
            .mockResolvedValueOnce('Non-goal')
            .mockResolvedValueOnce('Constraint');

        await runInterviewMode();

        expect(mockCheckbox).not.toHaveBeenCalled();
    });
});