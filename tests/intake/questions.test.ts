import { describe, it, expect } from 'vitest';
import {
    getFastQuestions,
    getInterviewQuestions,
    getDataSensitivityQuestionId,
} from '../../src/intake/questions.js';

describe('Intake Questions', () => {
    describe('Fast questions', () => {
        it('has 7 questions', () => {
            expect(getFastQuestions()).toHaveLength(7);
        });

        it('focuses on audience, BRD, idea, domain, and data sensitivity', () => {
            const ids = getFastQuestions().map((question) => question.id);
            expect(ids).toEqual(['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q_PT']);
        });

        it('does not ask first-feature appetite in fast mode', () => {
            expect(getFastQuestions().some((question) => question.subQuestion)).toBe(false);
        });
    });

    describe('Interview questions', () => {
        it('has 12 questions', () => {
            expect(getInterviewQuestions()).toHaveLength(12);
        });

        it('goes deeper into repo and delivery context', () => {
            const ids = getInterviewQuestions().map((question) => question.id);
            expect(ids).toEqual(['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q_PT']);
        });

        it('does not ask first-feature appetite in interview mode', () => {
            expect(getInterviewQuestions().some((question) => question.subQuestion)).toBe(false);
        });
    });

    it('maps data sensitivity question id per mode', () => {
        expect(getDataSensitivityQuestionId('fast')).toBe('Q6');
        expect(getDataSensitivityQuestionId('interview')).toBe('Q7');
    });
});
