import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@inquirer/prompts', () => ({
    select: vi.fn(),
    input: vi.fn(),
}));

import { select, input } from '@inquirer/prompts';
import { runInterviewMode } from '../../src/intake/interview-mode.js';

const mockSelect = vi.mocked(select);
const mockInput = vi.mocked(input);

describe('Interview Mode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('collects deeper discovery answers', async () => {
        mockSelect
            .mockResolvedValueOnce('BizLed')
            .mockResolvedValueOnce('enterprise')
            .mockResolvedValueOnce('draft')
            .mockResolvedValueOnce('existing_repo')
            .mockResolvedValueOnce('finance')
            .mockResolvedValueOnce('cloud')
            .mockResolvedValueOnce('small_team')
            .mockResolvedValueOnce('partial')
            .mockResolvedValueOnce('Production');

        mockInput
            .mockResolvedValueOnce('AI workflow automation')
            .mockResolvedValueOnce('Developer tooling')
            .mockResolvedValueOnce('Reduce release coordination overhead');

        const result = await runInterviewMode();

        expect(result.answers['Q3']).toBe('draft');
        expect(result.answers['Q4']).toBe('AI workflow automation');
        expect(result.answers['Q5']).toBe('Developer tooling');
        expect(result.answers['Q6']).toBe('existing_repo');
        expect(result.answers['Q7']).toBe('finance');
        expect(result.answers['Q10']).toBe('Reduce release coordination overhead');
        expect(result.answers['Q_PT']).toBe('Production');
    });

    it('runs completeness gate for missing audience', async () => {
        mockSelect
            .mockResolvedValueOnce('DevLed')
            .mockResolvedValueOnce(undefined as any)
            .mockResolvedValueOnce('none')
            .mockResolvedValueOnce('greenfield')
            .mockResolvedValueOnce('none')
            .mockResolvedValueOnce('unknown')
            .mockResolvedValueOnce('solo')
            .mockResolvedValueOnce('unknown')
            .mockResolvedValueOnce('LibraryAPI')
            .mockResolvedValueOnce('sme');

        mockInput
            .mockResolvedValueOnce('API orchestration toolkit')
            .mockResolvedValueOnce('Developer infrastructure')
            .mockResolvedValueOnce('Ship a validated BRD');

        const result = await runInterviewMode();

        expect(result.answers['Q2']).toBe('sme');
        expect(result.skippedQuestions).not.toContain('Q2');
    });

    it('runs completeness gate for missing success signal and stops at 2 follow-ups', async () => {
        mockSelect
            .mockResolvedValueOnce('Newbie')
            .mockResolvedValueOnce('community')
            .mockResolvedValueOnce('none')
            .mockResolvedValueOnce('greenfield')
            .mockResolvedValueOnce('none')
            .mockResolvedValueOnce('local')
            .mockResolvedValueOnce('solo')
            .mockResolvedValueOnce('unknown')
            .mockResolvedValueOnce('MVP');

        mockInput
            .mockResolvedValueOnce('Learning assistant')
            .mockResolvedValueOnce('Education')
            .mockResolvedValueOnce('')
            .mockResolvedValueOnce('First users can complete onboarding end-to-end');

        const result = await runInterviewMode();

        expect(result.answers['Q10']).toBe('First users can complete onboarding end-to-end');
        expect(mockInput).toHaveBeenCalledTimes(4);
    });
});
