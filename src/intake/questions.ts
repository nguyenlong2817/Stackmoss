/**
 * Intake Engine - Question definitions
 */

import type { Question } from './types.js';
import { t } from './i18n.js';

function buildRoleChoices() {
    return [
        { label: '🤷 Not sure — let Tech Lead decide after BRD is finalized', value: '_skip_roles' },
        { label: '── Leadership ──', value: '_header_leadership' },
        { label: 'Tech Lead (TL)', value: 'TL' },
        { label: 'Tech Lead Guide (TL(guide))', value: 'TL(guide)' },
        { label: 'Product Manager (PM)', value: 'PM' },
        { label: '── Business ──', value: '_header_business' },
        { label: 'Business Analyst (BA)', value: 'BA' },
        { label: '── Engineering ──', value: '_header_engineering' },
        { label: 'Developer (DEV)', value: 'DEV' },
        { label: 'Developer Small-Lane (DEV(small))', value: 'DEV(small)' },
        { label: 'Frontend (FE)', value: 'FE' },
        { label: 'Backend (BE)', value: 'BE' },
        { label: 'Fullstack (FS)', value: 'FS' },
        { label: 'Mobile (MOBILE)', value: 'MOBILE' },
        { label: 'DevOps Engineer (DEVOPS)', value: 'DEVOPS' },
        { label: 'DevOps / Deploy Lane (OPS)', value: 'OPS' },
        { label: 'DevOps Light (OPS(light))', value: 'OPS(light)' },
        { label: 'DevOps Lite (OPS-lite)', value: 'OPS-lite' },
        { label: 'Data Engineer (DATA)', value: 'DATA' },
        { label: 'ML Engineer (MLE)', value: 'MLE' },
        { label: 'Prompt Engineer (PE)', value: 'PE' },
        { label: '── Design ──', value: '_header_design' },
        { label: 'UI/UX Designer (UIUX)', value: 'UIUX' },
        { label: 'Brand / Graphic (BRAND)', value: 'BRAND' },
        { label: '── Quality ──', value: '_header_quality' },
        { label: 'QA Engineer (QA)', value: 'QA' },
        { label: 'QA Light (QA(light))', value: 'QA(light)' },
        { label: 'QA Strong (QA(strong))', value: 'QA(strong)' },
        { label: 'QA Checklist (QA(checklist))', value: 'QA(checklist)' },
        { label: 'Cybersecurity (SEC)', value: 'SEC' },
        { label: 'Cybersecurity Lite (SEC-lite)', value: 'SEC-lite' },
        { label: '── Operations ──', value: '_header_operations' },
        { label: 'Documentation (DOCS)', value: 'DOCS' },
    ];
}

function buildSharedQuestions(): { Q_ROLE: Question; Q_AUDIENCE: Question; Q_BRD: Question; Q_PROJECT_TYPE: Question; Q_ROLES: Question } {
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
        Q_ROLES: {
            id: 'Q_ROLES',
            text: s.qRolesText,
            type: 'multiselect',
            choices: buildRoleChoices(),
            required: true,
        },
    };
}

export function getFastQuestions(): Question[] {
    const s = t();
    const { Q_ROLE, Q_AUDIENCE, Q_BRD, Q_PROJECT_TYPE, Q_ROLES } = buildSharedQuestions();

    return [
        Q_ROLE,
        Q_AUDIENCE,
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
            id: 'Q6',
            text: s.q6DataText,
            type: 'select',
            choices: [
                { label: s.q6None, value: 'none' },
                { label: s.q6Pii, value: 'pii' },
                { label: s.q6Finance, value: 'finance' },
                { label: s.q6Compliance, value: 'compliance' },
            ],
            required: true,
        },
        Q_PROJECT_TYPE,
        Q_ROLES,
    ];
}

export function getInterviewQuestions(): Question[] {
    const s = t();
    const { Q_ROLE, Q_AUDIENCE, Q_BRD, Q_PROJECT_TYPE, Q_ROLES } = buildSharedQuestions();

    return [
        Q_ROLE,
        Q_AUDIENCE,
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
            id: 'Q6',
            text: s.q6RepoText,
            type: 'select',
            choices: [
                { label: s.q6RepoExisting, value: 'existing_repo' },
                { label: s.q6RepoGreenfield, value: 'greenfield' },
            ],
            required: true,
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
            required: true,
        },
        {
            id: 'Q8',
            text: s.q8DeployText,
            type: 'select',
            choices: [
                { label: s.q8Local, value: 'local' },
                { label: s.q8Vps, value: 'vps' },
                { label: s.q8Cloud, value: 'cloud' },
                { label: s.q8Unknown, value: 'unknown' },
            ],
        },
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
            text: s.q10SuccessText,
            type: 'text',
            required: true,
        },
        {
            id: 'Q11',
            text: s.q11StackText,
            type: 'select',
            choices: [
                { label: s.q11Known, value: 'known' },
                { label: s.q11Partial, value: 'partial' },
                { label: s.q11Unknown, value: 'unknown' },
            ],
            required: true,
        },
        Q_PROJECT_TYPE,
        Q_ROLES,
    ];
}

export function getDataSensitivityQuestionId(mode: 'fast' | 'interview'): string {
    return mode === 'fast' ? 'Q6' : 'Q7';
}
