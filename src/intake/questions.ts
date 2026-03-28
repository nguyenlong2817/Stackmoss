/**
 * Intake Engine - Question definitions
 */

import type { Question } from './types.js';
import { t } from './i18n.js';

function buildSharedQuestions(): { Q_AUDIENCE: Question; Q_BRD: Question } {
    const s = t();
    return {
        Q_AUDIENCE: {
            id: 'Q2',
            text: s.q2Text,
            type: 'select',
            choices: [
                { label: s.q2Individual, value: 'individual' },
                { label: s.q2Sme, value: 'sme' },
                { label: s.q2Enterprise, value: 'enterprise' },
                { label: s.q2Community, value: 'community' },
            ],
            required: true,
        },
        Q_BRD: {
            id: 'Q3',
            text: s.q3BrdText,
            type: 'select',
            choices: [
                { label: s.q3BrdLocked, value: 'locked' },
                { label: s.q3BrdDraft, value: 'draft' },
                { label: s.q3BrdNone, value: 'none' },
            ],
            required: true,
        },
    };
}

export function getFastQuestions(): Question[] {
    const s = t();
    const { Q_BRD } = buildSharedQuestions();

    return [
        Q_BRD,
        {
            id: 'Q4',
            text: s.q4IdeaText,
            type: 'text',
            required: true,
        },
        {
            id: 'Q5',
            text: s.q5DomainText,
            type: 'text',
            required: true,
        },
    ];
}

export function getInterviewQuestions(): Question[] {
    const s = t();
    const { Q_AUDIENCE, Q_BRD } = buildSharedQuestions();

    return [
        Q_BRD,
        {
            id: 'Q4',
            text: s.q4IdeaText,
            type: 'text',
            required: true,
        },
        {
            id: 'Q5',
            text: s.q5DomainText,
            type: 'text',
            required: true,
        },
        {
            ...Q_AUDIENCE,
            required: false,
        },
        {
            id: 'Q10',
            text: s.q10SuccessText,
            type: 'text',
            required: true,
        },
        {
            id: 'Q_NON_GOALS',
            text: s.qNonGoalsText,
            type: 'text',
        },
        {
            id: 'Q7',
            text: s.q7DataText,
            type: 'select',
            choices: [
                { label: s.q7None, value: 'none' },
                { label: s.q7Pii, value: 'pii' },
                { label: s.q7Finance, value: 'finance' },
                { label: s.q7Compliance, value: 'compliance' },
            ],
            required: false,
        },
        {
            id: 'Q6',
            text: s.q6RepoText,
            type: 'select',
            choices: [
                { label: s.q6RepoExisting, value: 'existing_repo' },
                { label: s.q6RepoGreenfield, value: 'greenfield' },
            ],
            required: false,
        },
        {
            id: 'Q_CONSTRAINTS',
            text: s.qConstraintsText,
            type: 'text',
        },
    ];
}

export function getDataSensitivityQuestionId(mode: 'fast' | 'interview'): string | null {
    return mode === 'interview' ? 'Q7' : null;
}