/**
 * Fast Mode — 7-question flow (~3 min)
 * Authority: BRD §8.2, intake-engine skill
 *
 * Features:
 * - Ctrl+C properly exits (re-throws ExitPromptError)
 * - "← Back" option on select questions
 * - Completeness gate: only check Q5 (data sensitivity)
 */

import { select, input } from '@inquirer/prompts';
import type { Question, RawAnswers } from './types.js';
import { getFastQuestions, getDataSensitivityQuestionId } from './questions.js';
import { t } from './i18n.js';

// ─── Back sentinel ───────────────────────────────────────────────

const BACK = '__BACK__';

// ─── Prompt a single question ────────────────────────────────────

async function askQuestion(question: Question, allowBack: boolean): Promise<string | typeof BACK | undefined> {
    if (question.type === 'select' && question.choices) {
        const choices = question.choices.map((c) => ({
            name: c.label,
            value: c.value,
        }));

        if (allowBack) {
            choices.unshift({ name: t().backLabel, value: BACK });
        }

        const answer = await select({
            message: question.text,
            choices,
        });
        return answer;
    }

    if (question.type === 'text') {
        const answer = await input({
            message: question.text,
        });
        const trimmed = answer.trim();
        if (trimmed === '') return undefined;
        return trimmed;
    }

    return undefined;
}

// ─── Run Fast Mode ───────────────────────────────────────────────

export interface FastModeResult {
    answers: RawAnswers;
    skippedQuestions: string[];
}

export async function runFastMode(): Promise<FastModeResult> {
    const answers: RawAnswers = {};
    const skippedQuestions: string[] = [];
    const questions = getFastQuestions();

    console.log(`\n${t().fastModeHeader}\n`);

    let i = 0;
    while (i < questions.length) {
        const question = questions[i]!;
        const allowBack = i > 0;

        const answer = await askQuestion(question, allowBack);

        // Handle back navigation
        if (answer === BACK) {
            // Remove previous answer if exists
            const prevQuestion = questions[i - 1]!;
            delete answers[prevQuestion.id];
            if (prevQuestion.subQuestion) {
                delete answers[prevQuestion.subQuestion.id];
            }
            // Remove from skipped
            const idx = skippedQuestions.indexOf(prevQuestion.id);
            if (idx !== -1) skippedQuestions.splice(idx, 1);
            i--;
            continue;
        }

        if (answer !== undefined && answer !== '') {
            answers[question.id] = answer;

            // Handle sub-question (e.g. Q6b appetite)
            if (question.subQuestion) {
                const subAnswer = await askQuestion(question.subQuestion, false);
                if (subAnswer === BACK) {
                    // Back from sub-question → re-ask parent
                    delete answers[question.id];
                    continue;
                }
                if (subAnswer !== undefined && subAnswer !== '') {
                    answers[question.subQuestion.id] = subAnswer;
                } else {
                    skippedQuestions.push(question.subQuestion.id);
                }
            }
        } else {
            skippedQuestions.push(question.id);
        }

        i++;
    }

    // ─── Completeness gate: only check Q5 ────────────────────
    const dataSensitivityId = getDataSensitivityQuestionId('fast');

    if (!(dataSensitivityId in answers)) {
        console.log(t().gateQ5Required);

        const q5 = questions.find((q) => q.id === dataSensitivityId);
        if (q5) {
            const retryAnswer = await askQuestion(q5, false);
            if (retryAnswer !== undefined && retryAnswer !== '' && retryAnswer !== BACK) {
                answers[dataSensitivityId] = retryAnswer;
                const idx = skippedQuestions.indexOf(dataSensitivityId);
                if (idx !== -1) skippedQuestions.splice(idx, 1);
            }
        }
    }

    return { answers, skippedQuestions };
}
