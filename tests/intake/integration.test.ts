import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@inquirer/prompts', () => ({
    select: vi.fn(),
    input: vi.fn(),
    checkbox: vi.fn().mockResolvedValue([]),
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

    it('returns PM/TL-only IntakeResult for fast mode', async () => {
        mockSelect
            .mockResolvedValueOnce('en')
            .mockResolvedValueOnce('fast')
            .mockResolvedValueOnce('none');

        mockInput
            .mockResolvedValueOnce('Retail ops copilot BRD draft')
            .mockResolvedValueOnce('Retail operations');

        const result: IntakeResult = await runIntake();

        expect(result.mode).toBe('fast');
        expect(result.brdStatus).toBe('none');
        expect(result.roles).toEqual(['PM', 'TL']);
        expect(result.autoAddedRoles).toEqual([]);
        expect(result.idea).toBe('Retail ops copilot BRD draft');
        expect(result.domain).toBe('Retail operations');
        expect(result.firstFeature.name).toBe('Lock BRD with Product Manager before implementation');
        expect(result.firstFeature.appetite).toBe('M');
    });

    it('returns interview result with locked BRD and fixed bootstrap roles', async () => {
        mockSelect
            .mockResolvedValueOnce('en')
            .mockResolvedValueOnce('interview')
            .mockResolvedValueOnce('locked')
            .mockResolvedValueOnce('enterprise')
            .mockResolvedValueOnce('finance')
            .mockResolvedValueOnce('existing_repo');

        mockInput
            .mockResolvedValueOnce('AI workflow automation')
            .mockResolvedValueOnce('Developer tooling')
            .mockResolvedValueOnce('Reduce release coordination overhead')
            .mockResolvedValueOnce('No mobile app in v1')
            .mockResolvedValueOnce('6-week timeline, fixed team size');

        const result: IntakeResult = await runIntake();

        expect(result.mode).toBe('interview');
        expect(result.brdStatus).toBe('locked');
        expect(result.roles).toEqual(['PM', 'TL']);
        expect(result.autoAddedRoles).toEqual([]);
        expect(result.firstFeature.name).toBe('Calibrate PM/TL team from locked BRD');
        expect(result.answers['Q2']).toBe('enterprise');
        expect(result.answers['Q10']).toBe('Reduce release coordination overhead');
    });

    it('keeps PM/TL roles even when interview answers include sensitive data', async () => {
        mockSelect
            .mockResolvedValueOnce('en')
            .mockResolvedValueOnce('interview')
            .mockResolvedValueOnce('draft')
            .mockResolvedValueOnce('sme')
            .mockResolvedValueOnce('compliance')
            .mockResolvedValueOnce('greenfield');

        mockInput
            .mockResolvedValueOnce('Compliance dashboard')
            .mockResolvedValueOnce('RegTech')
            .mockResolvedValueOnce('Pass pilot with 2 clients')
            .mockResolvedValueOnce('No self-serve onboarding')
            .mockResolvedValueOnce('Strict legal timeline');

        const result = await runIntake();

        expect(result.roles).toEqual(['PM', 'TL']);
        expect(result.autoAddedRoles).toEqual([]);
    });
});