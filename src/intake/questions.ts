/**
 * Intake Engine — Question definitions
 * Authority: BRD §8.2 (Fast), §8.3 (Interview)
 *
 * Do NOT add questions not in the BRD schema (intake-engine skill rule).
 * Exception: Q7/Q13 projectType — owner-approved addition.
 */

import type { Question } from './types.js';

// ─── Shared Questions ────────────────────────────────────────────

const Q_ROLE: Question = {
    id: 'Q1',
    text: 'Bạn là ai trong dự án này?',
    type: 'select',
    choices: [
        { label: 'Biz lead', value: 'BizLed' },
        { label: 'Dev lead', value: 'DevLed' },
        { label: 'Solo', value: 'Solo' },
        { label: 'Không rõ', value: 'Newbie' },
    ],
    required: true,
};

const Q_AUDIENCE: Question = {
    id: 'Q2',
    text: 'Sản phẩm phục vụ ai?',
    type: 'select',
    choices: [
        { label: 'Cá nhân', value: 'individual' },
        { label: 'SME', value: 'sme' },
        { label: 'Enterprise', value: 'enterprise' },
        { label: 'Cộng đồng', value: 'community' },
    ],
    required: true,
};

const Q_GEO: Question = {
    id: 'Q3',
    text: 'Phạm vi địa lý?',
    type: 'select',
    choices: [
        { label: 'Nội bộ', value: 'internal' },
        { label: 'VN', value: 'vn' },
        { label: 'Global', value: 'global' },
    ],
};

const Q_PROJECT_TYPE: Question = {
    id: 'Q_PT',
    text: 'Dự án này thuộc loại nào?',
    type: 'select',
    choices: [
        { label: 'MVP — ship nhanh, test ý tưởng', value: 'MVP' },
        { label: 'Production — ổn định, cần QA mạnh', value: 'Production' },
        { label: 'Internal Tool — công cụ nội bộ', value: 'InternalTool' },
        { label: 'Library / API — thư viện hoặc API service', value: 'LibraryAPI' },
    ],
    required: true,
};

// ─── Fast Mode: 7 questions (Q1–Q6 + Q6b + Q_PT) ────────────────

export const FAST_QUESTIONS: Question[] = [
    Q_ROLE,
    Q_AUDIENCE,
    Q_GEO,
    {
        id: 'Q4',
        text: 'Kênh chính?',
        type: 'select',
        choices: [
            { label: 'Web', value: 'web' },
            { label: 'Mobile', value: 'mobile' },
            { label: 'Chat (Zalo/FB/IG)', value: 'chat' },
            { label: 'API', value: 'api' },
        ],
    },
    {
        id: 'Q5',
        text: 'Data nhạy cảm?',
        type: 'select',
        choices: [
            { label: 'Không', value: 'none' },
            { label: 'PII', value: 'pii' },
            { label: 'Tài chính', value: 'finance' },
            { label: 'Compliance', value: 'compliance' },
        ],
        required: true, // completeness gate checks this
    },
    {
        id: 'Q6',
        text: 'Feature đầu tiên muốn ship là gì?',
        type: 'text',
        required: true,
        subQuestion: {
            id: 'Q6b',
            text: 'Cần bao lâu để ship?',
            type: 'select',
            choices: [
                { label: '[S] Vài ngày', value: 'S' },
                { label: '[M] 1-2 tuần', value: 'M' },
                { label: '[L] Hơn 2 tuần', value: 'L' },
            ],
            required: true,
        },
    },
    Q_PROJECT_TYPE,
];

// ─── Interview Mode: 13 questions in 3 blocks + Q_PT ─────────────

export const INTERVIEW_QUESTIONS: Question[] = [
    // BLOCK 1 — Bối cảnh biz (Q1–Q4)
    Q_ROLE,
    Q_AUDIENCE,
    Q_GEO,
    {
        id: 'Q4',
        text: 'Monetization?',
        type: 'select',
        choices: [
            { label: 'Free', value: 'free' },
            { label: 'Subscription', value: 'subscription' },
            { label: 'Usage-based', value: 'usage' },
            { label: 'Chưa biết', value: 'unknown' },
        ],
    },

    // BLOCK 2 — Constraint kỹ thuật (Q5–Q8)
    {
        id: 'Q5',
        text: 'Kênh chính?',
        type: 'select',
        choices: [
            { label: 'Web', value: 'web' },
            { label: 'Mobile', value: 'mobile' },
            { label: 'Chat (Zalo/FB/IG)', value: 'chat' },
            { label: 'API', value: 'api' },
        ],
    },
    {
        id: 'Q6',
        text: 'Data nhạy cảm?',
        type: 'select',
        choices: [
            { label: 'Không', value: 'none' },
            { label: 'PII', value: 'pii' },
            { label: 'Tài chính', value: 'finance' },
            { label: 'Compliance', value: 'compliance' },
        ],
        required: true,
    },
    {
        id: 'Q7',
        text: 'Deploy ở đâu?',
        type: 'select',
        choices: [
            { label: 'Local', value: 'local' },
            { label: 'VPS', value: 'vps' },
            { label: 'Cloud', value: 'cloud' },
            { label: 'Chưa biết', value: 'unknown' },
        ],
    },
    {
        id: 'Q8',
        text: 'Budget để ship v1?',
        type: 'select',
        choices: [
            { label: 'Rẻ nhất', value: 'cheapest' },
            { label: 'Cân bằng', value: 'balanced' },
            { label: 'Nhanh nhất', value: 'fastest' },
        ],
    },

    // BLOCK 3 — Team & velocity (Q9–Q12)
    {
        id: 'Q9',
        text: 'Ai maintain sau này?',
        type: 'select',
        choices: [
            { label: 'Một mình', value: 'solo' },
            { label: 'Team nhỏ', value: 'small_team' },
            { label: 'Outsource', value: 'outsource' },
        ],
    },
    {
        id: 'Q10',
        text: 'Ưu tiên?',
        type: 'select',
        choices: [
            { label: 'Ship nhanh', value: 'speed' },
            { label: 'Ship ổn định', value: 'stability' },
            { label: 'Cả hai', value: 'both' },
        ],
    },
    {
        id: 'Q11',
        text: 'Nguồn dữ liệu chính ở đâu?',
        type: 'select',
        choices: [
            { label: 'Sheets/Docs', value: 'sheets' },
            { label: 'DB', value: 'db' },
            { label: 'CRM', value: 'crm' },
            { label: 'API bên ngoài', value: 'external_api' },
            { label: 'Chưa có', value: 'none' },
        ],
    },
    {
        id: 'Q12',
        text: 'Feature đầu tiên muốn ship?',
        type: 'text',
        required: true,
        subQuestion: {
            id: 'Q12b',
            text: 'Cần bao lâu để ship?',
            type: 'select',
            choices: [
                { label: '[S] Vài ngày', value: 'S' },
                { label: '[M] 1-2 tuần', value: 'M' },
                { label: '[L] Hơn 2 tuần', value: 'L' },
            ],
            required: true,
        },
    },

    // Project type (owner-approved addition)
    Q_PROJECT_TYPE,
];

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
