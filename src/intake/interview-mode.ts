/**
 * Interview Mode — 13-question flow (~10 min)
 * Authority: BRD §8.3, intake-engine skill
 *
 * Features:
 * - Ctrl+C properly exits (no catch swallowing)
 * - "← Back" option on select questions
 * - Block labels for UX
 * - Completeness gate: Q2, Q12
 */

import { select, input } from '@inquirer/prompts';
import type { Question, RawAnswers } from './types.js';
import { getInterviewQuestions } from './questions.js';
import { t } from './i18n.js';

// ─── Back sentinel ───────────────────────────────────────────────

const BACK = '__BACK__';

// ─── Block labels by question index ──────────────────────────────

function getBlockLabels(): Record<number, string> {
    const s = t();
    return { 0: s.blockBiz, 4: s.blockTech, 8: s.blockTeam };
}

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
            validate: (val: string) => val.length > 200 ? 'Max 200 characters' : true,
        });
        const trimmed = answer.trim();
        if (trimmed === '') return undefined;
        return trimmed;
    }

    return undefined;
}

async function askFollowUpText(message: string): Promise<string | undefined> {
    const answer = await input({
        message,
        validate: (val: string) => val.length > 200 ? 'Max 200 characters' : true,
    });

    const trimmed = answer.trim();
    return trimmed === '' ? undefined : trimmed;
}

// ─── Run Interview Mode ──────────────────────────────────────────

export interface InterviewModeResult {
    answers: RawAnswers;
    skippedQuestions: string[];
}

export async function runInterviewMode(): Promise<InterviewModeResult> {
    const answers: RawAnswers = {};
    const skippedQuestions: string[] = [];
    const questions = getInterviewQuestions();
    const blockLabels = getBlockLabels();

    console.log(`\n${t().interviewModeHeader}\n`);

    // Track which blocks we've printed
    const printedBlocks = new Set<number>();

    let i = 0;
    while (i < questions.length) {
        // Print block label if entering a new block
        if (blockLabels[i] && !printedBlocks.has(i)) {
            console.log(`\n${blockLabels[i]}\n`);
            printedBlocks.add(i);
        }

        const question = questions[i]!;
        const allowBack = i > 0;

        const answer = await askQuestion(question, allowBack);

        // Handle back navigation
        if (answer === BACK) {
            const prevQuestion = questions[i - 1]!;
            delete answers[prevQuestion.id];
            if (prevQuestion.subQuestion) {
                delete answers[prevQuestion.subQuestion.id];
            }
            const idx = skippedQuestions.indexOf(prevQuestion.id);
            if (idx !== -1) skippedQuestions.splice(idx, 1);
            i--;
            continue;
        }

        if (answer !== undefined && answer !== '') {
            answers[question.id] = answer;

            // Handle sub-question (e.g. Q12b appetite)
            if (question.subQuestion) {
                const subAnswer = await askQuestion(question.subQuestion, false);
                if (subAnswer === BACK) {
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

    // ─── Completeness gate ───────────────────────────────────
    await runCompletenessGate(answers, skippedQuestions, questions);

    return { answers, skippedQuestions };
}

// ─── Completeness Gate ───────────────────────────────────────────

async function runCompletenessGate(
    answers: RawAnswers,
    skippedQuestions: string[],
    questions: Question[],
): Promise<void> {
    const s = t();
    let followUpCount = 0;
    const maxFollowUps = 2;

    // Check Q2: "for who"
    if (!answers['Q2'] && followUpCount < maxFollowUps) {
        console.log(s.gateQ2Required);
        const q2 = questions.find((q) => q.id === 'Q2');
        if (q2) {
            const answer = await askQuestion(q2, false);
            if (answer && answer !== BACK) {
                answers['Q2'] = answer;
                const idx = skippedQuestions.indexOf('Q2');
                if (idx !== -1) skippedQuestions.splice(idx, 1);
            }
            followUpCount++;
        }
    }

    // Check Q12: measurable outcome (first feature)
    if (!answers['Q12'] && followUpCount < maxFollowUps) {
        console.log(s.gateQ12Required);
        const q12 = questions.find((q) => q.id === 'Q12');
        if (q12) {
            const answer = await askQuestion(q12, false);
            if (answer && answer !== BACK) {
                answers['Q12'] = answer;
                const idx = skippedQuestions.indexOf('Q12');
                if (idx !== -1) skippedQuestions.splice(idx, 1);

                if (q12.subQuestion && !answers[q12.subQuestion.id]) {
                    const subAnswer = await askQuestion(q12.subQuestion, false);
                    if (subAnswer && subAnswer !== BACK) {
                        answers[q12.subQuestion.id] = subAnswer;
                        const subIdx = skippedQuestions.indexOf(q12.subQuestion.id);
                        if (subIdx !== -1) skippedQuestions.splice(subIdx, 1);
                    }
                }
            }
            followUpCount++;
        }
    }

    if (!answers['Q12_NON_GOAL'] && followUpCount < maxFollowUps) {
        console.log('\n⚠️  Need at least one explicit non-goal for the first feature.\n');
        const answer = await askFollowUpText('One thing this first feature must NOT do?');
        if (answer) {
            answers['Q12_NON_GOAL'] = answer;
            const idx = skippedQuestions.indexOf('Q12_NON_GOAL');
            if (idx !== -1) skippedQuestions.splice(idx, 1);
        } else if (!skippedQuestions.includes('Q12_NON_GOAL')) {
            skippedQuestions.push('Q12_NON_GOAL');
        }
        followUpCount++;
    }
}
