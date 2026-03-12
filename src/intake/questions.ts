/**
 * Intake Engine — Question definitions
 * Authority: BRD §8.2 (Fast), §8.3 (Interview)
 *
 * All text read from i18n string table.
 * Do NOT add questions not in the BRD schema (intake-engine skill rule).
 * Exception: Q7/Q13 projectType — owner-approved addition.
 */

import type { Question } from './types.js';
import { t } from './i18n.js';

// ─── Build questions from i18n ───────────────────────────────────

function buildSharedQuestions(): { Q_ROLE: Question; Q_AUDIENCE: Question; Q_GEO: Question; Q_PROJECT_TYPE: Question } {
    const s = t();
    return {
        Q_ROLE: {
            id: 'Q1',
            text: s.q1Text,
            type: 'select',
            choices: [
                { label: s.q1BizLed, value: 'BizLed' },
                { label: s.q1DevLed, value: 'DevLed' },
                { label: s.q1Solo, value: 'Solo' },
                { label: s.q1Newbie, value: 'Newbie' },
            ],
            required: true,
        },
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
        Q_GEO: {
            id: 'Q3',
            text: s.q3Text,
            type: 'select',
            choices: [
                { label: s.q3Internal, value: 'internal' },
                { label: s.q3Vn, value: 'vn' },
                { label: s.q3Global, value: 'global' },
            ],
        },
        Q_PROJECT_TYPE: {
            id: 'Q_PT',
            text: s.ptText,
            type: 'select',
            choices: [
                { label: s.ptMvp, value: 'MVP' },
                { label: s.ptProduction, value: 'Production' },
                { label: s.ptInternalTool, value: 'InternalTool' },
                { label: s.ptLibraryApi, value: 'LibraryAPI' },
            ],
            required: true,
        },
    };
}

// ─── Fast Mode: 7 questions (Q1–Q6 + Q6b + Q_PT) ────────────────

export function getFastQuestions(): Question[] {
    const s = t();
    const { Q_ROLE, Q_AUDIENCE, Q_GEO, Q_PROJECT_TYPE } = buildSharedQuestions();

    return [
        Q_ROLE,
        Q_AUDIENCE,
        Q_GEO,
        {
            id: 'Q4',
            text: s.q4FastText,
            type: 'select',
            choices: [
                { label: s.q4Web, value: 'web' },
                { label: s.q4Mobile, value: 'mobile' },
                { label: s.q4Chat, value: 'chat' },
                { label: s.q4Api, value: 'api' },
            ],
        },
        {
            id: 'Q5',
            text: s.q5FastText,
            type: 'select',
            choices: [
                { label: s.q5None, value: 'none' },
                { label: s.q5Pii, value: 'pii' },
                { label: s.q5Finance, value: 'finance' },
                { label: s.q5Compliance, value: 'compliance' },
            ],
            required: true,
        },
        {
            id: 'Q6',
            text: s.q6Text,
            type: 'text',
            required: true,
            subQuestion: {
                id: 'Q6b',
                text: s.q6bText,
                type: 'select',
                choices: [
                    { label: s.appetiteS, value: 'S' },
                    { label: s.appetiteM, value: 'M' },
                    { label: s.appetiteL, value: 'L' },
                ],
                required: true,
            },
        },
        Q_PROJECT_TYPE,
    ];
}

// ─── Interview Mode: 13 questions in 3 blocks + Q_PT ─────────────

export function getInterviewQuestions(): Question[] {
    const s = t();
    const { Q_ROLE, Q_AUDIENCE, Q_GEO, Q_PROJECT_TYPE } = buildSharedQuestions();

    return [
        // BLOCK 1 — Business context (Q1–Q4)
        Q_ROLE,
        Q_AUDIENCE,
        Q_GEO,
        {
            id: 'Q4',
            text: s.q4InterviewText,
            type: 'select',
            choices: [
                { label: s.q4Free, value: 'free' },
                { label: s.q4Subscription, value: 'subscription' },
                { label: s.q4Usage, value: 'usage' },
                { label: s.q4Unknown, value: 'unknown' },
            ],
        },

        // BLOCK 2 — Technical constraints (Q5–Q8)
        {
            id: 'Q5',
            text: s.q4FastText,
            type: 'select',
            choices: [
                { label: s.q4Web, value: 'web' },
                { label: s.q4Mobile, value: 'mobile' },
                { label: s.q4Chat, value: 'chat' },
                { label: s.q4Api, value: 'api' },
            ],
        },
        {
            id: 'Q6',
            text: s.q5FastText,
            type: 'select',
            choices: [
                { label: s.q5None, value: 'none' },
                { label: s.q5Pii, value: 'pii' },
                { label: s.q5Finance, value: 'finance' },
                { label: s.q5Compliance, value: 'compliance' },
            ],
            required: true,
        },
        {
            id: 'Q7',
            text: s.q7Text,
            type: 'select',
            choices: [
                { label: s.q7Local, value: 'local' },
                { label: s.q7Vps, value: 'vps' },
                { label: s.q7Cloud, value: 'cloud' },
                { label: s.q7Unknown, value: 'unknown' },
            ],
        },
        {
            id: 'Q8',
            text: s.q8Text,
            type: 'select',
            choices: [
                { label: s.q8Cheapest, value: 'cheapest' },
                { label: s.q8Balanced, value: 'balanced' },
                { label: s.q8Fastest, value: 'fastest' },
            ],
        },

        // BLOCK 3 — Team & velocity (Q9–Q12)
        {
            id: 'Q9',
            text: s.q9Text,
            type: 'select',
            choices: [
                { label: s.q9Solo, value: 'solo' },
                { label: s.q9SmallTeam, value: 'small_team' },
                { label: s.q9Outsource, value: 'outsource' },
            ],
        },
        {
            id: 'Q10',
            text: s.q10Text,
            type: 'select',
            choices: [
                { label: s.q10Speed, value: 'speed' },
                { label: s.q10Stability, value: 'stability' },
                { label: s.q10Both, value: 'both' },
            ],
        },
        {
            id: 'Q11',
            text: s.q11Text,
            type: 'select',
            choices: [
                { label: s.q11Sheets, value: 'sheets' },
                { label: s.q11Db, value: 'db' },
                { label: s.q11Crm, value: 'crm' },
                { label: s.q11ExternalApi, value: 'external_api' },
                { label: s.q11None, value: 'none' },
            ],
        },
        {
            id: 'Q12',
            text: s.q6Text,
            type: 'text',
            required: true,
            subQuestion: {
                id: 'Q12b',
                text: s.q6bText,
                type: 'select',
                choices: [
                    { label: s.appetiteS, value: 'S' },
                    { label: s.appetiteM, value: 'M' },
                    { label: s.appetiteL, value: 'L' },
                ],
                required: true,
            },
        },

        // Project type (owner-approved addition)
        Q_PROJECT_TYPE,
    ];
}

// ─── Backward compat: static arrays for tests ────────────────────

/** @deprecated Use getFastQuestions() for i18n support */
export const FAST_QUESTIONS: Question[] = getFastQuestions();
/** @deprecated Use getInterviewQuestions() for i18n support */
export const INTERVIEW_QUESTIONS: Question[] = getInterviewQuestions();

// ─── Helpers ─────────────────────────────────────────────────────

/** Get the data sensitivity question ID for a given mode */
export function getDataSensitivityQuestionId(mode: 'fast' | 'interview'): string {
    return mode === 'fast' ? 'Q5' : 'Q6';
}

/** Get the deploy question ID (interview only) */
export function getDeployQuestionId(): string {
    return 'Q7';
}

/** Get the first feature question ID for a given mode */
export function getFeatureQuestionId(mode: 'fast' | 'interview'): string {
    return mode === 'fast' ? 'Q6' : 'Q12';
}

/** Get the appetite sub-question ID for a given mode */
export function getAppetiteQuestionId(mode: 'fast' | 'interview'): string {
    return mode === 'fast' ? 'Q6b' : 'Q12b';
}
