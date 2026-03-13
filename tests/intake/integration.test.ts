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

    it('returns a valid IntakeResult for fast mode', async () => {
        mockSelect
            .mockResolvedValueOnce('en')
            .mockResolvedValueOnce('fast')
            .mockResolvedValueOnce('BizLed')
            .mockResolvedValueOnce('sme')
            .mockResolvedValueOnce('none')
            .mockResolvedValueOnce('pii')
            .mockResolvedValueOnce('MVP');

        mockInput
            .mockResolvedValueOnce('Retail ops copilot')
            .mockResolvedValueOnce('Retail operations');

        const result: IntakeResult = await runIntake();

        expect(result.mode).toBe('fast');
        expect(result.persona).toBe('BizLed');
        expect(result.projectType).toBe('MVP');
        expect(result.brdStatus).toBe('none');
        expect(result.roles).toEqual(['TL', 'BA', 'DEV', 'QA(light)', 'DOCS']);
        expect(result.autoAddedRoles).toContain('SEC-lite');
        expect(result.idea).toBe('Retail ops copilot');
        expect(result.domain).toBe('Retail operations');
        expect(result.firstFeature.name).toBe('Lock BRD with Tech Lead and BA');
        expect(result.firstFeature.appetite).toBe('M');
    });

    it('returns a valid IntakeResult for interview mode with locked BRD', async () => {
        mockSelect
            .mockResolvedValueOnce('en')
            .mockResolvedValueOnce('interview')
            .mockResolvedValueOnce('DevLed')
            .mockResolvedValueOnce('enterprise')
            .mockResolvedValueOnce('locked')
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

        const result: IntakeResult = await runIntake();

        expect(result.mode).toBe('interview');
        expect(result.persona).toBe('DevLed');
        expect(result.projectType).toBe('Production');
        expect(result.brdStatus).toBe('locked');
        expect(result.roles).toEqual(['TL', 'DEV', 'QA(strong)', 'OPS', 'DOCS']);
        expect(result.autoAddedRoles).toContain('SEC-lite');
        expect(result.autoAddedRoles).toContain('OPS-lite');
        expect(result.firstFeature.name).toBe('Calibrate team from locked BRD');
        expect(result.firstFeature.appetite).toBe('M');
    });

    it('adds BA when BRD is not locked even for non-BizLed personas', async () => {
        mockSelect
            .mockResolvedValueOnce('en')
            .mockResolvedValueOnce('fast')
            .mockResolvedValueOnce('Solo')
            .mockResolvedValueOnce('individual')
            .mockResolvedValueOnce('draft')
            .mockResolvedValueOnce('none')
            .mockResolvedValueOnce('InternalTool');

        mockInput
            .mockResolvedValueOnce('Internal helper')
            .mockResolvedValueOnce('Operations');

        const result = await runIntake();

        expect(result.roles).toContain('BA');
        expect(result.firstFeature.name).toBe('Lock BRD with Tech Lead and BA');
    });
});
