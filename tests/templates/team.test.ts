/**
 * Tests: team.md template
 * Authority: BRD §9.2
 */

import { describe, it, expect } from 'vitest';
import { generateTeam, extractRoleId } from '../../src/templates/team.js';
import { createSampleInput, createInterviewIntake } from './helpers.js';

describe('Template: team.md', () => {
    it('generates team.md file', () => {
        const input = createSampleInput();
        const result = generateTeam(input);

        expect(result.path).toBe('team.md');
        expect(result.content.length).toBeGreaterThan(0);
    });

    it('has CONSTITUTION section', () => {
        const input = createSampleInput();
        const result = generateTeam(input);

        expect(result.content).toContain('## CONSTITUTION');
        expect(result.content).toContain('### Governance Rules');
        expect(result.content).toContain('replace-only: true');
        expect(result.content).toContain('budget-enforcement: hard');
        expect(result.content).toContain('suggest-only: true');
    });

    it('has ROLES section with selected roles', () => {
        const input = createSampleInput();
        const result = generateTeam(input);

        expect(result.content).toContain('## ROLES');
        expect(result.content).toContain('[TL] Tech Lead');
        expect(result.content).toContain('[BA] Business Analyst');
        expect(result.content).toContain('[DEV] Developer');
        expect(result.content).toContain('[QA] Quality Assurance');
        expect(result.content).toContain('[DOCS] Documentation');
    });

    it('includes auto-added roles', () => {
        const input = createSampleInput(); // has SEC-lite auto-added
        const result = generateTeam(input);

        expect(result.content).toContain('[SEC] Security-lite');
    });

    it('has WORKING CONTRACT section', () => {
        const input = createSampleInput();
        const result = generateTeam(input);

        expect(result.content).toContain('## WORKING CONTRACT');
        expect(result.content).toContain('### Definition of Done');
        expect(result.content).toContain('### Escalation Rules');
        expect(result.content).toContain('### Review Gates');
    });

    it('has PROJECT_FACTS section with TBD placeholders', () => {
        const input = createSampleInput();
        const result = generateTeam(input);

        expect(result.content).toContain('## PROJECT_FACTS');
        expect(result.content).toContain('Package manager: TBD');
        expect(result.content).toContain('Framework: TBD');
    });

    it('includes capabilities with budgets', () => {
        const input = createSampleInput();
        const result = generateTeam(input);

        expect(result.content).toContain('[TL-ARCH]');
        expect(result.content).toContain('budget: 220');
        expect(result.content).toContain('[DEV-IMPL]');
        expect(result.content).toContain('budget: 200');
    });

    it('includes project name and version in header', () => {
        const input = createSampleInput();
        const result = generateTeam(input);

        expect(result.content).toContain('test-project');
        expect(result.content).toContain('v0.1.0');
    });

    it('does not include BA for DevLed persona', () => {
        const input = createSampleInput({
            intake: createInterviewIntake(), // DevLed → no BA
        });
        const result = generateTeam(input);

        expect(result.content).not.toContain('[BA] Business Analyst');
    });
});

describe('extractRoleId', () => {
    it('extracts base ID from simple role', () => {
        expect(extractRoleId('TL')).toBe('TL');
        expect(extractRoleId('DEV')).toBe('DEV');
    });

    it('extracts base ID from qualified role', () => {
        expect(extractRoleId('QA(light)')).toBe('QA');
        expect(extractRoleId('TL(guide)')).toBe('TL');
        expect(extractRoleId('DEV(small)')).toBe('DEV');
    });
});
