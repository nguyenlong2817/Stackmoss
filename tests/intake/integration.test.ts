import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@inquirer/prompts', () => ({
    select: vi.fn(),
    input: vi.fn(),
}));

import { select, input } from '@inquirer/prompts';
import { runIntake } from '../../src/intake/index.js';
import type { IntakeResult } from '../../src/intake/types.js';

const mockSelect = vi.mocked(select);
const mockInput = vi.mocked(input);

describe('Intake Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return valid IntakeResult for fast mode', async () => {
        // Mode selection → fast
        // Fast Q1-Q6 + Q6b + Q_PT
        mockSelect
            .mockResolvedValueOnce('en')        // Language selection
            .mockResolvedValueOnce('fast')     // Mode selection
            .mockResolvedValueOnce('BizLed')   // Q1
            .mockResolvedValueOnce('sme')      // Q2
            .mockResolvedValueOnce('vn')       // Q3
            .mockResolvedValueOnce('web')      // Q4
            .mockResolvedValueOnce('pii')      // Q5
            .mockResolvedValueOnce('M')        // Q6b
            .mockResolvedValueOnce('MVP');      // Q_PT

        mockInput.mockResolvedValueOnce('Landing page'); // Q6

        const result: IntakeResult = await runIntake();

        // Validate IntakeResult structure
        expect(result.mode).toBe('fast');
        expect(result.persona).toBe('BizLed');
        expect(result.projectType).toBe('MVP');
        expect(result.roles).toEqual(['TL', 'BA', 'DEV', 'QA(light)', 'DOCS']);
        expect(result.autoAddedRoles).toContain('SEC-lite'); // Q5=pii
        expect(result.firstFeature.name).toBe('Landing page');
        expect(result.firstFeature.appetite).toBe('M');
        expect(result.skippedQuestions).toHaveLength(0);
    });

    it('should return valid IntakeResult for interview mode', async () => {
        mockSelect
            .mockResolvedValueOnce('en')           // Language selection
            .mockResolvedValueOnce('interview')    // Mode selection
            .mockResolvedValueOnce('DevLed')       // Q1
            .mockResolvedValueOnce('enterprise')   // Q2
            .mockResolvedValueOnce('global')       // Q3
            .mockResolvedValueOnce('subscription') // Q4
            .mockResolvedValueOnce('web')          // Q5
            .mockResolvedValueOnce('finance')      // Q6
            .mockResolvedValueOnce('cloud')        // Q7
            .mockResolvedValueOnce('balanced')     // Q8
            .mockResolvedValueOnce('small_team')   // Q9
            .mockResolvedValueOnce('stability')    // Q10
            .mockResolvedValueOnce('db')           // Q11
            .mockResolvedValueOnce('L')            // Q12b
            .mockResolvedValueOnce('Production');  // Q_PT

        mockInput.mockResolvedValueOnce('User dashboard'); // Q12

        const result: IntakeResult = await runIntake();

        expect(result.mode).toBe('interview');
        expect(result.persona).toBe('DevLed');
        expect(result.projectType).toBe('Production');
        expect(result.roles).toEqual(['TL', 'DEV', 'QA(strong)', 'OPS', 'DOCS']);
        expect(result.autoAddedRoles).toContain('SEC-lite');  // Q6=finance
        expect(result.autoAddedRoles).toContain('OPS-lite');  // Q7=cloud + Q2=enterprise
        expect(result.firstFeature.name).toBe('User dashboard');
        expect(result.firstFeature.appetite).toBe('L');
    });

    it('should validate IntakeResult has all required fields', async () => {
        mockSelect
            .mockResolvedValueOnce('en')     // Language selection
            .mockResolvedValueOnce('fast')
            .mockResolvedValueOnce('Solo')
            .mockResolvedValueOnce('individual')
            .mockResolvedValueOnce('internal')
            .mockResolvedValueOnce('mobile')
            .mockResolvedValueOnce('none')
            .mockResolvedValueOnce('S')
            .mockResolvedValueOnce('InternalTool');

        mockInput.mockResolvedValueOnce('Todo app');

        const result: IntakeResult = await runIntake();

        // Check all fields exist
        expect(result).toHaveProperty('mode');
        expect(result).toHaveProperty('answers');
        expect(result).toHaveProperty('skippedQuestions');
        expect(result).toHaveProperty('persona');
        expect(result).toHaveProperty('projectType');
        expect(result).toHaveProperty('roles');
        expect(result).toHaveProperty('autoAddedRoles');
        expect(result).toHaveProperty('firstFeature');
        expect(result.firstFeature).toHaveProperty('name');
        expect(result.firstFeature).toHaveProperty('appetite');

        // Validate types
        expect(['fast', 'interview']).toContain(result.mode);
        expect(['BizLed', 'DevLed', 'Solo', 'Newbie']).toContain(result.persona);
        expect(['MVP', 'Production', 'InternalTool', 'LibraryAPI']).toContain(result.projectType);
        expect(['S', 'M', 'L']).toContain(result.firstFeature.appetite);
        expect(Array.isArray(result.roles)).toBe(true);
        expect(Array.isArray(result.autoAddedRoles)).toBe(true);
        expect(Array.isArray(result.skippedQuestions)).toBe(true);
    });
});
