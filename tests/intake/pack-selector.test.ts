import { describe, it, expect } from 'vitest';
import { detectPersona, getProjectType, selectRoles } from '../../src/intake/pack-selector.js';
import type { Persona, ProjectType, RawAnswers } from '../../src/intake/types.js';

describe('Pack Selector', () => {
    describe('detectPersona', () => {
        it('should map BizLed correctly', () => {
            expect(detectPersona('BizLed')).toBe('BizLed');
        });

        it('should map DevLed correctly', () => {
            expect(detectPersona('DevLed')).toBe('DevLed');
        });

        it('should map Solo correctly', () => {
            expect(detectPersona('Solo')).toBe('Solo');
        });

        it('should map Newbie correctly', () => {
            expect(detectPersona('Newbie')).toBe('Newbie');
        });

        it('should default to Newbie for unknown values', () => {
            expect(detectPersona('unknown')).toBe('Newbie');
            expect(detectPersona('')).toBe('Newbie');
        });
    });

    describe('getProjectType', () => {
        it('should read explicit Q_PT answer for MVP', () => {
            expect(getProjectType({ Q_PT: 'MVP' })).toBe('MVP');
        });

        it('should read explicit Q_PT answer for Production', () => {
            expect(getProjectType({ Q_PT: 'Production' })).toBe('Production');
        });

        it('should read explicit Q_PT answer for InternalTool', () => {
            expect(getProjectType({ Q_PT: 'InternalTool' })).toBe('InternalTool');
        });

        it('should read explicit Q_PT answer for LibraryAPI', () => {
            expect(getProjectType({ Q_PT: 'LibraryAPI' })).toBe('LibraryAPI');
        });

        it('should default to MVP if Q_PT is missing', () => {
            expect(getProjectType({})).toBe('MVP');
        });

        it('should default to MVP for invalid Q_PT value', () => {
            expect(getProjectType({ Q_PT: 'invalid' })).toBe('MVP');
        });
    });

    describe('selectRoles — 2D Matrix (BRD §10.2)', () => {
        // ─── BizLed ──────────────────────────────────────────
        it('BizLed × MVP → TL, BA, DEV, QA(light), DOCS', () => {
            const roles = selectRoles('BizLed', 'MVP');
            expect(roles).toEqual(['TL', 'BA', 'DEV', 'QA(light)', 'DOCS']);
        });

        it('BizLed × Production → TL, BA, DEV, QA(strong), OPS(light), DOCS', () => {
            const roles = selectRoles('BizLed', 'Production');
            expect(roles).toEqual(['TL', 'BA', 'DEV', 'QA(strong)', 'OPS(light)', 'DOCS']);
        });

        it('BizLed × InternalTool → TL, BA, DEV, QA(light), DOCS', () => {
            const roles = selectRoles('BizLed', 'InternalTool');
            expect(roles).toEqual(['TL', 'BA', 'DEV', 'QA(light)', 'DOCS']);
        });

        it('BizLed × LibraryAPI → TL, BA, DEV, QA(strong), DOCS', () => {
            const roles = selectRoles('BizLed', 'LibraryAPI');
            expect(roles).toEqual(['TL', 'BA', 'DEV', 'QA(strong)', 'DOCS']);
        });

        // ─── DevLed ──────────────────────────────────────────
        it('DevLed × MVP → TL, DEV, QA, DOCS', () => {
            const roles = selectRoles('DevLed', 'MVP');
            expect(roles).toEqual(['TL', 'DEV', 'QA', 'DOCS']);
        });

        it('DevLed × Production → TL, DEV, QA(strong), OPS, DOCS', () => {
            const roles = selectRoles('DevLed', 'Production');
            expect(roles).toEqual(['TL', 'DEV', 'QA(strong)', 'OPS', 'DOCS']);
        });

        // ─── Solo ────────────────────────────────────────────
        it('Solo × MVP → TL, DEV, QA(light)', () => {
            const roles = selectRoles('Solo', 'MVP');
            expect(roles).toEqual(['TL', 'DEV', 'QA(light)']);
        });

        it('Solo × Production → TL, DEV, QA, DOCS', () => {
            const roles = selectRoles('Solo', 'Production');
            expect(roles).toEqual(['TL', 'DEV', 'QA', 'DOCS']);
        });

        // ─── Newbie ──────────────────────────────────────────
        it('Newbie × any → TL(guide), DEV(small), QA(checklist), DOCS', () => {
            const projectTypes: ProjectType[] = ['MVP', 'Production', 'InternalTool', 'LibraryAPI'];
            for (const pt of projectTypes) {
                const roles = selectRoles('Newbie', pt);
                expect(roles).toEqual(['TL(guide)', 'DEV(small)', 'QA(checklist)', 'DOCS']);
            }
        });
    });
});
