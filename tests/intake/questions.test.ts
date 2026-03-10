import { describe, it, expect } from 'vitest';
import {
    FAST_QUESTIONS,
    INTERVIEW_QUESTIONS,
    getDataSensitivityQuestionId,
    getFeatureQuestionId,
    getAppetiteQuestionId,
} from '../../src/intake/questions.js';

describe('Intake Questions', () => {
    describe('FAST_QUESTIONS', () => {
        it('should have 7 questions (Q1-Q6 + Q6b sub + Q_PT)', () => {
            expect(FAST_QUESTIONS).toHaveLength(7);
        });

        it('should start with Q1 (role)', () => {
            expect(FAST_QUESTIONS[0]!.id).toBe('Q1');
        });

        it('should have Q5 (data sensitivity) marked as required', () => {
            const q5 = FAST_QUESTIONS.find((q) => q.id === 'Q5');
            expect(q5).toBeDefined();
            expect(q5!.required).toBe(true);
        });

        it('should have Q6 with Q6b sub-question (appetite)', () => {
            const q6 = FAST_QUESTIONS.find((q) => q.id === 'Q6');
            expect(q6).toBeDefined();
            expect(q6!.type).toBe('text');
            expect(q6!.subQuestion).toBeDefined();
            expect(q6!.subQuestion!.id).toBe('Q6b');
            expect(q6!.subQuestion!.choices).toHaveLength(3); // S, M, L
        });

        it('should have Q_PT (project type) as last question', () => {
            const last = FAST_QUESTIONS[FAST_QUESTIONS.length - 1]!;
            expect(last.id).toBe('Q_PT');
            expect(last.choices).toHaveLength(4); // MVP, Production, InternalTool, LibraryAPI
        });

        it('should have all questions with Vietnamese text', () => {
            for (const q of FAST_QUESTIONS) {
                expect(q.text).toBeTruthy();
                expect(typeof q.text).toBe('string');
            }
        });

        it('should have choices for all select-type questions', () => {
            for (const q of FAST_QUESTIONS) {
                if (q.type === 'select') {
                    expect(q.choices).toBeDefined();
                    expect(q.choices!.length).toBeGreaterThan(0);
                }
            }
        });
    });

    describe('INTERVIEW_QUESTIONS', () => {
        it('should have 13 questions (Q1-Q12 + Q_PT)', () => {
            expect(INTERVIEW_QUESTIONS).toHaveLength(13);
        });

        it('should have Q12 with Q12b sub-question (appetite)', () => {
            const q12 = INTERVIEW_QUESTIONS.find((q) => q.id === 'Q12');
            expect(q12).toBeDefined();
            expect(q12!.type).toBe('text');
            expect(q12!.subQuestion).toBeDefined();
            expect(q12!.subQuestion!.id).toBe('Q12b');
        });

        it('should have Q6 (data sensitivity) marked as required', () => {
            const q6 = INTERVIEW_QUESTIONS.find((q) => q.id === 'Q6');
            expect(q6).toBeDefined();
            expect(q6!.required).toBe(true);
        });

        it('should have Q_PT as last question', () => {
            const last = INTERVIEW_QUESTIONS[INTERVIEW_QUESTIONS.length - 1]!;
            expect(last.id).toBe('Q_PT');
        });

        it('Block 1 should be Q1-Q4 (biz context)', () => {
            expect(INTERVIEW_QUESTIONS[0]!.id).toBe('Q1');
            expect(INTERVIEW_QUESTIONS[1]!.id).toBe('Q2');
            expect(INTERVIEW_QUESTIONS[2]!.id).toBe('Q3');
            expect(INTERVIEW_QUESTIONS[3]!.id).toBe('Q4');
        });

        it('Block 2 should be Q5-Q8 (technical constraints)', () => {
            expect(INTERVIEW_QUESTIONS[4]!.id).toBe('Q5');
            expect(INTERVIEW_QUESTIONS[5]!.id).toBe('Q6');
            expect(INTERVIEW_QUESTIONS[6]!.id).toBe('Q7');
            expect(INTERVIEW_QUESTIONS[7]!.id).toBe('Q8');
        });

        it('Block 3 should be Q9-Q12 (team & velocity)', () => {
            expect(INTERVIEW_QUESTIONS[8]!.id).toBe('Q9');
            expect(INTERVIEW_QUESTIONS[9]!.id).toBe('Q10');
            expect(INTERVIEW_QUESTIONS[10]!.id).toBe('Q11');
            expect(INTERVIEW_QUESTIONS[11]!.id).toBe('Q12');
        });
    });

    describe('Helper functions', () => {
        it('getDataSensitivityQuestionId returns Q5 for fast, Q6 for interview', () => {
            expect(getDataSensitivityQuestionId('fast')).toBe('Q5');
            expect(getDataSensitivityQuestionId('interview')).toBe('Q6');
        });

        it('getFeatureQuestionId returns Q6 for fast, Q12 for interview', () => {
            expect(getFeatureQuestionId('fast')).toBe('Q6');
            expect(getFeatureQuestionId('interview')).toBe('Q12');
        });

        it('getAppetiteQuestionId returns Q6b for fast, Q12b for interview', () => {
            expect(getAppetiteQuestionId('fast')).toBe('Q6b');
            expect(getAppetiteQuestionId('interview')).toBe('Q12b');
        });
    });
});
