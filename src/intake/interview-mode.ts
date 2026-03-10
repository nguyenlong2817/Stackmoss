/**
 * Interview Mode — 13-question flow (~10 min)
 * Authority: BRD §8.3, intake-engine skill
 *
 * Block 1 (Q1–Q4): Business context
 * Block 2 (Q5–Q8): Technical constraints
 * Block 3 (Q9–Q12): Team & velocity
 * + Q_PT: Project type
 *
 * Completeness gate: Must have "for who" (Q2), measurable outcome (Q12),
 * at least 1 non-goal implied. If missing → up to 2 targeted follow-up questions.
 */

import { select, input } from '@inquirer/prompts';
import type { Question, RawAnswers } from './types.js';
import { INTERVIEW_QUESTIONS } from './questions.js';

// ─── Block labels for UX ─────────────────────────────────────────

const BLOCK_LABELS: Record<number, string> = {
    0: '📋 Block 1 — Bối cảnh biz',
    4: '🔧 Block 2 — Constraint kỹ thuật',
    8: '👥 Block 3 — Team & velocity',
};

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
        return undefined;
    }

    return undefined;
}

// ─── Run Interview Mode ──────────────────────────────────────────

export interface InterviewModeResult {
    answers: RawAnswers;
    skippedQuestions: string[];
}

export async function runInterviewMode(): Promise<InterviewModeResult> {
    const answers: RawAnswers = {};
    const skippedQuestions: string[] = [];

    console.log('\n📝 Interview Mode — 13 câu hỏi, ~10 phút\n');

    for (let i = 0; i < INTERVIEW_QUESTIONS.length; i++) {
        // Print block label if entering a new block
        if (BLOCK_LABELS[i]) {
            console.log(`\n${BLOCK_LABELS[i]}\n`);
        }

        const question = INTERVIEW_QUESTIONS[i]!;
        const answer = await askQuestion(question);

        if (answer !== undefined && answer !== '') {
            answers[question.id] = answer;

            // Handle sub-question (e.g. Q12b appetite)
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

    // ─── Completeness gate ───────────────────────────────────
    await runCompletenessGate(answers, skippedQuestions);

    return { answers, skippedQuestions };
}

// ─── Completeness Gate ───────────────────────────────────────────

/**
 * Interview mode completeness gate.
 * Check: "for who" (Q2), measurable outcome (Q12), at least 1 non-goal implied.
 * If missing → up to 2 targeted follow-up questions.
 */
async function runCompletenessGate(
    answers: RawAnswers,
    skippedQuestions: string[],
): Promise<void> {
    let followUpCount = 0;
    const maxFollowUps = 2;

    // Check Q2: "for who"
    if (!answers['Q2'] && followUpCount < maxFollowUps) {
        console.log('\n⚠️  Cần biết sản phẩm phục vụ ai (Q2).\n');
        const q2 = INTERVIEW_QUESTIONS.find((q) => q.id === 'Q2');
        if (q2) {
            const answer = await askQuestion(q2);
            if (answer) {
                answers['Q2'] = answer;
                const idx = skippedQuestions.indexOf('Q2');
                if (idx !== -1) skippedQuestions.splice(idx, 1);
            }
            followUpCount++;
        }
    }

    // Check Q12: measurable outcome (first feature)
    if (!answers['Q12'] && followUpCount < maxFollowUps) {
        console.log('\n⚠️  Cần biết feature đầu tiên muốn ship (Q12).\n');
        const q12 = INTERVIEW_QUESTIONS.find((q) => q.id === 'Q12');
        if (q12) {
            const answer = await askQuestion(q12);
            if (answer) {
                answers['Q12'] = answer;
                const idx = skippedQuestions.indexOf('Q12');
                if (idx !== -1) skippedQuestions.splice(idx, 1);

                // Also ask sub-question if not yet answered
                if (q12.subQuestion && !answers[q12.subQuestion.id]) {
                    const subAnswer = await askQuestion(q12.subQuestion);
                    if (subAnswer) {
                        answers[q12.subQuestion.id] = subAnswer;
                        const subIdx = skippedQuestions.indexOf(q12.subQuestion.id);
                        if (subIdx !== -1) skippedQuestions.splice(subIdx, 1);
                    }
                }
            }
            followUpCount++;
        }
    }
}
