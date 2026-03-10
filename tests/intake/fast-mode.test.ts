import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @inquirer/prompts before importing the module under test
vi.mock('@inquirer/prompts', () => ({
    select: vi.fn(),
    input: vi.fn(),
}));

import { select, input } from '@inquirer/prompts';
import { runFastMode } from '../../src/intake/fast-mode.js';

const mockSelect = vi.mocked(select);
const mockInput = vi.mocked(input);

describe('Fast Mode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should collect all 7 answers when all are provided', async () => {
        // Setup mock responses for 7 questions + 1 sub-question (Q6b)
        // Q1 (select) → BizLed
        // Q2 (select) → sme
        // Q3 (select) → vn
        // Q4 (select) → web
        // Q5 (select) → pii
        // Q6 (input) → "Login page"
        // Q6b (select) → S  (sub-question)
        // Q_PT (select) → MVP
        mockSelect
            .mockResolvedValueOnce('BizLed')   // Q1
            .mockResolvedValueOnce('sme')      // Q2
            .mockResolvedValueOnce('vn')       // Q3
            .mockResolvedValueOnce('web')      // Q4
            .mockResolvedValueOnce('pii')      // Q5
            .mockResolvedValueOnce('S')        // Q6b sub-question
            .mockResolvedValueOnce('MVP');      // Q_PT

        mockInput.mockResolvedValueOnce('Login page'); // Q6

        const result = await runFastMode();

        expect(result.answers['Q1']).toBe('BizLed');
        expect(result.answers['Q2']).toBe('sme');
        expect(result.answers['Q5']).toBe('pii');
        expect(result.answers['Q6']).toBe('Login page');
        expect(result.answers['Q6b']).toBe('S');
        expect(result.answers['Q_PT']).toBe('MVP');
        expect(result.skippedQuestions).toHaveLength(0);
    });

    it('should track skipped questions', async () => {
        // Skip Q3 (return undefined from select)
        mockSelect
            .mockResolvedValueOnce('Solo')     // Q1
            .mockResolvedValueOnce('individual') // Q2
            .mockResolvedValueOnce(undefined as any)  // Q3 - skipped
            .mockResolvedValueOnce('mobile')   // Q4
            .mockResolvedValueOnce('none')     // Q5
            .mockResolvedValueOnce('M')        // Q6b
            .mockResolvedValueOnce('MVP');      // Q_PT

        mockInput.mockResolvedValueOnce('Dashboard'); // Q6

        const result = await runFastMode();

        expect(result.skippedQuestions).toContain('Q3');
        expect(result.answers['Q3']).toBeUndefined();
    });

    it('should re-ask Q5 once if skipped (completeness gate)', async () => {
        // First pass: skip Q5
        mockSelect
            .mockResolvedValueOnce('DevLed')   // Q1
            .mockResolvedValueOnce('enterprise') // Q2
            .mockResolvedValueOnce('global')   // Q3
            .mockResolvedValueOnce('api')      // Q4
            .mockResolvedValueOnce(undefined as any)  // Q5 - skipped!
            .mockResolvedValueOnce('L')        // Q6b
            .mockResolvedValueOnce('Production') // Q_PT
            .mockResolvedValueOnce('finance'); // Q5 - re-ask (completeness gate)

        mockInput.mockResolvedValueOnce('API Gateway'); // Q6

        const result = await runFastMode();

        // Q5 should be answered after re-ask
        expect(result.answers['Q5']).toBe('finance');
        expect(result.skippedQuestions).not.toContain('Q5');
    });
});
