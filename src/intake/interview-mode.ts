import { select, input } from '@inquirer/prompts';
import type { Question, RawAnswers } from './types.js';
import { getInterviewQuestions } from './questions.js';
import { t } from './i18n.js';

const BACK = '__BACK__';

function getBlockLabels(): Record<number, string> {
    const s = t();
    return { 0: s.blockBiz, 3: s.blockTech, 6: s.blockTeam };
}

async function askQuestion(
    question: Question,
    allowBack: boolean,
): Promise<string | typeof BACK | undefined> {
    if (question.type === 'select' && question.choices) {
        const choices = question.choices.map((choice) => ({
            name: choice.label,
            value: choice.value,
        }));

        if (allowBack) {
            choices.unshift({ name: t().backLabel, value: BACK });
        }

        return select({
            message: question.text,
            choices,
        });
    }

    if (question.type === 'text') {
        const answer = await input({
            message: question.text,
            validate: (val: string) => val.length > 400 ? 'Max 400 characters' : true,
        });
        const trimmed = (answer ?? '').trim();
        return trimmed === '' ? undefined : trimmed;
    }

    return undefined;
}

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

    const printedBlocks = new Set<number>();
    let index = 0;

    while (index < questions.length) {
        if (blockLabels[index] && !printedBlocks.has(index)) {
            console.log(`\n${blockLabels[index]}\n`);
            printedBlocks.add(index);
        }

        const question = questions[index]!;
        const answer = await askQuestion(question, index > 0);

        if (answer === BACK) {
            const prevQuestion = questions[index - 1]!;
            delete answers[prevQuestion.id];
            const skippedIndex = skippedQuestions.indexOf(prevQuestion.id);
            if (skippedIndex !== -1) skippedQuestions.splice(skippedIndex, 1);
            index--;
            continue;
        }

        if (answer !== undefined && answer !== '') {
            answers[question.id] = answer;
        } else {
            skippedQuestions.push(question.id);
        }

        index++;
    }

    await runCompletenessGate(answers, skippedQuestions, questions);

    return { answers, skippedQuestions };
}

async function runCompletenessGate(
    answers: RawAnswers,
    skippedQuestions: string[],
    questions: Question[],
): Promise<void> {
    const s = t();
    let followUpCount = 0;
    const maxFollowUps = 2;

    if (!answers['Q2'] && followUpCount < maxFollowUps) {
        console.log(s.gateAudienceRequired);
        const q2 = questions.find((question) => question.id === 'Q2');
        if (q2) {
            const answer = await askQuestion(q2, false);
            if (answer && answer !== BACK) {
                answers['Q2'] = answer;
                const idx = skippedQuestions.indexOf('Q2');
                if (idx !== -1) skippedQuestions.splice(idx, 1);
            }
        }
        followUpCount++;
    }

    if (!answers['Q10'] && followUpCount < maxFollowUps) {
        console.log(s.gateSuccessRequired);
        const q10 = questions.find((question) => question.id === 'Q10');
        if (q10) {
            const answer = await askQuestion(q10, false);
            if (answer && answer !== BACK) {
                answers['Q10'] = answer;
                const idx = skippedQuestions.indexOf('Q10');
                if (idx !== -1) skippedQuestions.splice(idx, 1);
            }
        }
    }
}