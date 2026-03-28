import { describe, it, expect } from 'vitest';
import {
    getFastQuestions,
    getInterviewQuestions,
    getDataSensitivityQuestionId,
} from '../../src/intake/questions.js';

describe('Intake Questions', () => {
    describe('Fast questions', () => {
        it('has 3 BRD-first questions', () => {
            expect(getFastQuestions()).toHaveLength(3);
        });

        it('captures BRD status, BRD summary, and domain', () => {
            const ids = getFastQuestions().map((question) => question.id);
            expect(ids).toEqual(['Q3', 'Q4', 'Q5']);
        });

        it('does not ask role selection in fast mode', () => {
            expect(getFastQuestions().some((question) => question.id === 'Q_ROLES')).toBe(false);
        });
    });

    describe('Interview questions', () => {
        it('has 9 questions', () => {
            expect(getInterviewQuestions()).toHaveLength(9);
        });

        it('covers BRD, product context, and delivery constraints', () => {
            const ids = getInterviewQuestions().map((question) => question.id);
            expect(ids).toEqual(['Q3', 'Q4', 'Q5', 'Q2', 'Q10', 'Q_NON_GOALS', 'Q7', 'Q6', 'Q_CONSTRAINTS']);
        });

        it('does not ask role selection in interview mode', () => {
            expect(getInterviewQuestions().some((question) => question.id === 'Q_ROLES')).toBe(false);
        });
    });

    it('maps data sensitivity question id per mode', () => {
        expect(getDataSensitivityQuestionId('fast')).toBe(null);
        expect(getDataSensitivityQuestionId('interview')).toBe('Q7');
    });
});