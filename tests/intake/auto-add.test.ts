import { describe, it, expect } from 'vitest';
import { detectAutoAddRoles } from '../../src/intake/auto-add.js';
import type { RawAnswers } from '../../src/intake/types.js';

describe('Auto-Add Rules', () => {
    describe('SEC-lite detection', () => {
        it('should add SEC-lite when Fast Q5 = pii', () => {
            const answers: RawAnswers = { Q5: 'pii' };
            expect(detectAutoAddRoles(answers, 'fast')).toContain('SEC-lite');
        });

        it('should add SEC-lite when Fast Q5 = finance', () => {
            const answers: RawAnswers = { Q5: 'finance' };
            expect(detectAutoAddRoles(answers, 'fast')).toContain('SEC-lite');
        });

        it('should add SEC-lite when Fast Q5 = compliance', () => {
            const answers: RawAnswers = { Q5: 'compliance' };
            expect(detectAutoAddRoles(answers, 'fast')).toContain('SEC-lite');
        });

        it('should NOT add SEC-lite when Fast Q5 = none', () => {
            const answers: RawAnswers = { Q5: 'none' };
            expect(detectAutoAddRoles(answers, 'fast')).not.toContain('SEC-lite');
        });

        it('should add SEC-lite when Interview Q6 = pii', () => {
            const answers: RawAnswers = { Q6: 'pii' };
            expect(detectAutoAddRoles(answers, 'interview')).toContain('SEC-lite');
        });

        it('should add SEC-lite when Interview Q6 = finance', () => {
            const answers: RawAnswers = { Q6: 'finance' };
            expect(detectAutoAddRoles(answers, 'interview')).toContain('SEC-lite');
        });

        it('should NOT add SEC-lite when Interview Q6 = none', () => {
            const answers: RawAnswers = { Q6: 'none' };
            expect(detectAutoAddRoles(answers, 'interview')).not.toContain('SEC-lite');
        });
    });

    describe('OPS-lite detection', () => {
        it('should add OPS-lite when Interview Q7=vps AND Q2=sme', () => {
            const answers: RawAnswers = { Q7: 'vps', Q2: 'sme' };
            expect(detectAutoAddRoles(answers, 'interview')).toContain('OPS-lite');
        });

        it('should add OPS-lite when Interview Q7=cloud AND Q2=enterprise', () => {
            const answers: RawAnswers = { Q7: 'cloud', Q2: 'enterprise' };
            expect(detectAutoAddRoles(answers, 'interview')).toContain('OPS-lite');
        });

        it('should NOT add OPS-lite when Q7=vps AND Q2=individual', () => {
            const answers: RawAnswers = { Q7: 'vps', Q2: 'individual' };
            expect(detectAutoAddRoles(answers, 'interview')).not.toContain('OPS-lite');
        });

        it('should NOT add OPS-lite when Q7=local AND Q2=enterprise', () => {
            const answers: RawAnswers = { Q7: 'local', Q2: 'enterprise' };
            expect(detectAutoAddRoles(answers, 'interview')).not.toContain('OPS-lite');
        });

        it('should NOT add OPS-lite in fast mode (no Q7)', () => {
            const answers: RawAnswers = { Q5: 'pii' };
            const roles = detectAutoAddRoles(answers, 'fast');
            expect(roles).not.toContain('OPS-lite');
        });
    });

    describe('Combined rules', () => {
        it('should add both SEC-lite and OPS-lite when both conditions met', () => {
            const answers: RawAnswers = {
                Q6: 'finance',
                Q7: 'cloud',
                Q2: 'enterprise',
            };
            const roles = detectAutoAddRoles(answers, 'interview');
            expect(roles).toContain('SEC-lite');
            expect(roles).toContain('OPS-lite');
            expect(roles).toHaveLength(2);
        });

        it('should return empty array when no conditions met', () => {
            const answers: RawAnswers = {
                Q6: 'none',
                Q7: 'local',
                Q2: 'individual',
            };
            expect(detectAutoAddRoles(answers, 'interview')).toHaveLength(0);
        });
    });
});
