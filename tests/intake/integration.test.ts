import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@inquirer/prompts', () => ({
    select: vi.fn(),
    input: vi.fn(),
    checkbox: vi.fn().mockResolvedValue([]),
}));

import { select, input, checkbox } from '@inquirer/prompts';
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
        expect(result.roles).toEqual(['TL', 'PM', 'BA', 'FS', 'QA', 'DOCS']);
        expect(result.autoAddedRoles).toContain('SEC-lite');
        expect(result.idea).toBe('Retail ops copilot');
        expect(result.domain).toBe('Retail operations');
        expect(result.firstFeature.name).toBe('Finalize BRD with Product Manager, then calibrate team');
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
        expect(result.roles).toEqual(['TL', 'FE', 'BE', 'QA(strong)', 'DEVOPS', 'DOCS']);
        expect(result.autoAddedRoles).toContain('SEC-lite');
        expect(result.firstFeature.name).toBe('Calibrate team from locked BRD');
        expect(result.firstFeature.appetite).toBe('M');
    });

    it('does not duplicate auto-added roles already covered by the selected matrix', async () => {
        mockSelect
            .mockResolvedValueOnce('en')
            .mockResolvedValueOnce('interview')
            .mockResolvedValueOnce('BizLed')
            .mockResolvedValueOnce('enterprise')
            .mockResolvedValueOnce('locked')
            .mockResolvedValueOnce('existing_repo')
            .mockResolvedValueOnce('finance')
            .mockResolvedValueOnce('cloud')
            .mockResolvedValueOnce('small_team')
            .mockResolvedValueOnce('partial')
            .mockResolvedValueOnce('Production');

        mockInput
            .mockResolvedValueOnce('Revenue copilot')
            .mockResolvedValueOnce('Finance')
            .mockResolvedValueOnce('Reduce manual ops');

        const result = await runIntake();

        expect(result.roles).toEqual(['TL', 'BA', 'FE', 'BE', 'QA(strong)', 'OPS(light)', 'DOCS', 'SEC-lite']);
        expect(result.autoAddedRoles).toHaveLength(0);
    });

    it('adds PM and BA when BRD is not locked even for non-BizLed personas', async () => {
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

        expect(result.roles).toContain('PM');
        expect(result.roles).toContain('BA');
        expect(result.firstFeature.name).toBe('Finalize BRD with Product Manager, then calibrate team');
    });
});
