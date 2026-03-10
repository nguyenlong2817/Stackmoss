import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@inquirer/prompts', () => ({
    select: vi.fn(),
    input: vi.fn(),
}));

import { select, input } from '@inquirer/prompts';
import { runInterviewMode } from '../../src/intake/interview-mode.js';

const mockSelect = vi.mocked(select);
const mockInput = vi.mocked(input);

/**
 * Helper: set up mock responses for all 13 interview questions + sub-questions.
 */
function mockAllInterviewAnswers(overrides?: Record<string, string>) {
    const defaults: Record<string, string> = {
        Q1: 'BizLed',
        Q2: 'enterprise',
        Q3: 'global',
        Q4: 'subscription',
        Q5: 'web',
        Q6: 'pii',
        Q7: 'cloud',
        Q8: 'balanced',
        Q9: 'small_team',
        Q10: 'stability',
        Q11: 'db',
        Q12: 'User dashboard',
        Q12b: 'M',
        Q_PT: 'Production',
    };
    const vals = { ...defaults, ...overrides };

    // 13 questions: selects for all except Q12 (text)
    // Order: Q1(sel), Q2(sel), Q3(sel), Q4(sel), Q5(sel), Q6(sel), Q7(sel), Q8(sel),
    //        Q9(sel), Q10(sel), Q11(sel), Q12(input), Q12b(sel), Q_PT(sel)
    mockSelect
        .mockResolvedValueOnce(vals['Q1']!)    // Q1
        .mockResolvedValueOnce(vals['Q2']!)    // Q2
        .mockResolvedValueOnce(vals['Q3']!)    // Q3
        .mockResolvedValueOnce(vals['Q4']!)    // Q4
        .mockResolvedValueOnce(vals['Q5']!)    // Q5
        .mockResolvedValueOnce(vals['Q6']!)    // Q6
        .mockResolvedValueOnce(vals['Q7']!)    // Q7
        .mockResolvedValueOnce(vals['Q8']!)    // Q8
        .mockResolvedValueOnce(vals['Q9']!)    // Q9
        .mockResolvedValueOnce(vals['Q10']!)   // Q10
        .mockResolvedValueOnce(vals['Q11']!)   // Q11
        .mockResolvedValueOnce(vals['Q12b']!)  // Q12b (sub-question)
        .mockResolvedValueOnce(vals['Q_PT']!); // Q_PT

    mockInput.mockResolvedValueOnce(vals['Q12']!); // Q12 (text)
}

describe('Interview Mode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should collect all 13 answers when all are provided', async () => {
        mockAllInterviewAnswers();

        const result = await runInterviewMode();

        expect(result.answers['Q1']).toBe('BizLed');
        expect(result.answers['Q2']).toBe('enterprise');
        expect(result.answers['Q6']).toBe('pii');
        expect(result.answers['Q12']).toBe('User dashboard');
        expect(result.answers['Q12b']).toBe('M');
        expect(result.answers['Q_PT']).toBe('Production');
        expect(result.skippedQuestions).toHaveLength(0);
    });

    it('should handle skipped questions', async () => {
        // Skip Q3 and Q11
        mockSelect
            .mockResolvedValueOnce('Solo')         // Q1
            .mockResolvedValueOnce('individual')   // Q2
            .mockResolvedValueOnce(undefined as any) // Q3 - skipped
            .mockResolvedValueOnce('free')         // Q4
            .mockResolvedValueOnce('mobile')       // Q5
            .mockResolvedValueOnce('none')         // Q6
            .mockResolvedValueOnce('local')        // Q7
            .mockResolvedValueOnce('cheapest')     // Q8
            .mockResolvedValueOnce('solo')         // Q9
            .mockResolvedValueOnce('speed')        // Q10
            .mockResolvedValueOnce(undefined as any) // Q11 - skipped
            .mockResolvedValueOnce('S')            // Q12b
            .mockResolvedValueOnce('MVP');          // Q_PT

        mockInput.mockResolvedValueOnce('Landing page'); // Q12

        const result = await runInterviewMode();

        expect(result.skippedQuestions).toContain('Q3');
        expect(result.skippedQuestions).toContain('Q11');
        expect(result.skippedQuestions).toHaveLength(2);
    });

    it('should run completeness gate follow-up for missing Q2', async () => {
        // Skip Q2, completeness gate should re-ask it
        mockSelect
            .mockResolvedValueOnce('DevLed')       // Q1
            .mockResolvedValueOnce(undefined as any) // Q2 - skipped
            .mockResolvedValueOnce('vn')           // Q3
            .mockResolvedValueOnce('unknown')      // Q4
            .mockResolvedValueOnce('api')          // Q5
            .mockResolvedValueOnce('finance')      // Q6
            .mockResolvedValueOnce('vps')          // Q7
            .mockResolvedValueOnce('fastest')      // Q8
            .mockResolvedValueOnce('outsource')    // Q9
            .mockResolvedValueOnce('both')         // Q10
            .mockResolvedValueOnce('external_api') // Q11
            .mockResolvedValueOnce('L')            // Q12b
            .mockResolvedValueOnce('LibraryAPI')   // Q_PT
            .mockResolvedValueOnce('sme');         // Q2 re-ask (completeness gate)

        mockInput.mockResolvedValueOnce('API Service'); // Q12

        const result = await runInterviewMode();

        // Q2 should be answered after follow-up
        expect(result.answers['Q2']).toBe('sme');
        expect(result.skippedQuestions).not.toContain('Q2');
    });
});
