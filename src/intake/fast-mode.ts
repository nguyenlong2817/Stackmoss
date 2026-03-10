/**
 * Fast Mode — 7-question flow (~3 min)
 * Authority: BRD §8.2, intake-engine skill
 *
 * Completeness gate: Only check Q5 (data sensitivity).
 * If missing → re-ask Q5 once. Do NOT check outcome/non-goals.
 */

import { select, input } from '@inquirer/prompts';
import type { Question, RawAnswers } from './types.js';
import { FAST_QUESTIONS, getDataSensitivityQuestionId } from './questions.js';

// ─── Prompt a single question ────────────────────────────────────

async function askQuestion(question: Question): Promise<string | undefined> {
    try {
        if (question.type === 'select' && question.choices) {
            const answer = await select({
                message: question.text,
                choices: question.choices.map((c) => ({
                    name: c.label,
                    value: c.value,
                })),
            });
            return answer;
        }

        if (question.type === 'text') {
            const answer = await input({
                message: question.text,
            });
            return answer.trim() || undefined;
        }
    } catch {
        // User pressed Ctrl+C or cancelled
        return undefined;
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

    console.log('\n🚀 Fast Mode — 7 câu hỏi, ~3 phút\n');

    for (const question of FAST_QUESTIONS) {
        const answer = await askQuestion(question);

        if (answer !== undefined && answer !== '') {
            answers[question.id] = answer;

            // Handle sub-question (e.g. Q6b appetite)
            if (question.subQuestion) {
                const subAnswer = await askQuestion(question.subQuestion);
                if (subAnswer !== undefined && subAnswer !== '') {
                    answers[question.subQuestion.id] = subAnswer;
                } else {
                    skippedQuestions.push(question.subQuestion.id);
                }
            }
        } else {
            skippedQuestions.push(question.id);
        }
    }

    // ─── Completeness gate: only check Q5 ────────────────────
    const dataSensitivityId = getDataSensitivityQuestionId('fast');

    if (!(dataSensitivityId in answers)) {
        console.log('\n⚠️  Data nhạy cảm (Q5) là bắt buộc. Hỏi lại một lần.\n');

        const q5 = FAST_QUESTIONS.find((q) => q.id === dataSensitivityId);
        if (q5) {
            const retryAnswer = await askQuestion(q5);
            if (retryAnswer !== undefined && retryAnswer !== '') {
                answers[dataSensitivityId] = retryAnswer;
                // Remove from skipped if it was there
                const idx = skippedQuestions.indexOf(dataSensitivityId);
                if (idx !== -1) skippedQuestions.splice(idx, 1);
            }
            // If still missing after retry, keep in skippedQuestions
        }
    }

    return { answers, skippedQuestions };
}
