import { select } from '@inquirer/prompts';
import type { IntakeMode, IntakeResult, Appetite, BrdStatus } from './types.js';
import { runFastMode } from './fast-mode.js';
import { runInterviewMode } from './interview-mode.js';
import { detectPersona, getProjectType, selectRoles } from './pack-selector.js';
import { detectAutoAddRoles } from './auto-add.js';
import { setLanguage, t } from './i18n.js';
import type { Language } from './i18n.js';

async function selectLanguage(): Promise<Language> {
    return select({
        message: 'Language / Ngon ngu?',
        choices: [
            { name: '[EN] English', value: 'en' as const },
            { name: '[VI] Tieng Viet', value: 'vi' as const },
        ],
    });
}

async function selectMode(): Promise<IntakeMode> {
    const s = t();
    return select({
        message: s.modeQuestion,
        choices: [
            { name: s.modeFastLabel, value: 'fast' as const },
            { name: s.modeInterviewLabel, value: 'interview' as const },
        ],
    });
}

function deriveBootstrapFeature(brdStatus: BrdStatus): { name: string; appetite: Appetite } {
    if (brdStatus === 'locked') {
        return {
            name: 'Calibrate team from locked BRD',
            appetite: 'M',
        };
    }

    return {
        name: 'Lock BRD with Tech Lead and BA',
        appetite: 'M',
    };
}

function ensureBrdLockRoles(
    roles: string[],
    brdStatus: BrdStatus,
): string[] {
    if (brdStatus === 'locked' || roles.includes('BA')) {
        return roles;
    }

    return [...roles.slice(0, 1), 'BA', ...roles.slice(1)];
}

export async function runIntake(): Promise<IntakeResult> {
    const lang = await selectLanguage();
    setLanguage(lang);

    const mode = await selectMode();
    const modeResult = mode === 'fast' ? await runFastMode() : await runInterviewMode();
    const { answers, skippedQuestions } = modeResult;

    const persona = detectPersona(answers['Q1'] as string);
    const projectType = getProjectType(answers);
    const brdStatus = ((answers['Q3'] as string) ?? 'none') as BrdStatus;
    const idea = ((answers['Q4'] as string) ?? '').trim();
    const domain = ((answers['Q5'] as string) ?? '').trim();
    const autoAddedRoles = detectAutoAddRoles(answers, mode);
    const roles = ensureBrdLockRoles(selectRoles(persona, projectType), brdStatus);
    const firstFeature = deriveBootstrapFeature(brdStatus);

    if (!idea) {
        throw new Error('Product idea is required. Please run intake again.');
    }

    if (!domain) {
        throw new Error('Domain is required. Please run intake again.');
    }

    return {
        mode,
        language: lang,
        answers,
        skippedQuestions,
        persona,
        projectType,
        brdStatus,
        roles,
        autoAddedRoles,
        idea,
        domain,
        firstFeature,
    };
}

export function reportIntake(result: IntakeResult): void {
    const s = t();
    console.log('\n----------------------------------------');
    console.log(s.reportHeader);
    console.log('----------------------------------------');
    console.log(`   ${s.reportMode}:       ${result.mode}`);
    console.log(`   ${s.reportPersona}:    ${result.persona}`);
    console.log(`   ${s.reportProject}:    ${result.projectType}`);
    console.log(`   ${s.reportBrd}:        ${result.brdStatus}`);
    console.log(`   ${s.reportRoles}:      ${result.roles.join(', ')}`);

    if (result.autoAddedRoles.length > 0) {
        console.log(`   ${s.reportAutoAdded}: ${result.autoAddedRoles.join(', ')}`);
    }

    console.log(`   ${s.reportFeature}:    ${result.firstFeature.name} [${result.firstFeature.appetite}]`);

    if (result.skippedQuestions.length > 0) {
        console.log(`   ${s.reportSkipped}:  ${result.skippedQuestions.join(', ')}`);
    }

    console.log('----------------------------------------\n');
}
