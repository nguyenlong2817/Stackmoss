import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@inquirer/prompts', () => ({
    select: vi.fn(),
    input: vi.fn(),
    checkbox: vi.fn().mockResolvedValue([]),
}));

import { select, input, checkbox } from '@inquirer/prompts';
import { runFastMode } from '../../src/intake/fast-mode.js';

const mockSelect = vi.mocked(select);
const mockInput = vi.mocked(input);
const mockCheckbox = vi.mocked(checkbox);

describe('Fast Mode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('collects 3 BRD-first answers', async () => {
        mockSelect
            .mockResolvedValueOnce('none');

        mockInput
            .mockResolvedValueOnce('Retail ops copilot BRD draft')
            .mockResolvedValueOnce('Retail operations');

        const result = await runFastMode();

        expect(result.answers['Q3']).toBe('none');
        expect(result.answers['Q4']).toBe('Retail ops copilot BRD draft');
        expect(result.answers['Q5']).toBe('Retail operations');
    });

    it('tracks skipped text questions', async () => {
        mockSelect.mockResolvedValueOnce('locked');
        mockInput
            .mockResolvedValueOnce('')
            .mockResolvedValueOnce('Internal workflow');

        const result = await runFastMode();

        expect(result.skippedQuestions).toContain('Q4');
        expect(result.answers['Q4']).toBeUndefined();
        expect(result.answers['Q5']).toBe('Internal workflow');
    });

    it('does not call checkbox role picker', async () => {
        mockSelect.mockResolvedValueOnce('draft');
        mockInput
            .mockResolvedValueOnce('Idea')
            .mockResolvedValueOnce('Domain');

        await runFastMode();

        expect(mockCheckbox).not.toHaveBeenCalled();
    });
});