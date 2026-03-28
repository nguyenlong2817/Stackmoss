import { select } from '@inquirer/prompts';
import type { IntakeMode, IntakeResult, Appetite, BrdStatus } from './types.js';
import { runFastMode } from './fast-mode.js';
import { runInterviewMode } from './interview-mode.js';
import { setLanguage, t } from './i18n.js';
import type { Language } from './i18n.js';
import { getNextStepLines } from '../user-guidance.js';

const BOOTSTRAP_ROLES = ['PM', 'TL'] as const;

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
            name: 'Calibrate PM/TL team from locked BRD',
            appetite: 'M',
        };
    }

    return {
        name: 'Lock BRD with Product Manager before implementation',
        appetite: 'M',
    };
}

export async function runIntake(): Promise<IntakeResult> {
    const lang = await selectLanguage();
    setLanguage(lang);

    const mode = await selectMode();
    const modeResult = mode === 'fast' ? await runFastMode() : await runInterviewMode();
    const { answers, skippedQuestions } = modeResult;

    const brdStatus = ((answers['Q3'] as string) ?? 'none') as BrdStatus;
    const idea = ((answers['Q4'] as string) ?? '').trim();
    const domain = ((answers['Q5'] as string) ?? '').trim();
    const roles = [...BOOTSTRAP_ROLES];
    const autoAddedRoles: string[] = [];
    const firstFeature = deriveBootstrapFeature(brdStatus);

    if (!idea) {
        throw new Error('BRD summary/idea is required. Please run intake again.');
    }

    if (!domain) {
        throw new Error('Domain is required. Please run intake again.');
    }

    return {
        mode,
        language: lang,
        answers,
        skippedQuestions,
        persona: 'BizLed',
        projectType: 'MVP',
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
    console.log(`   ${s.reportBrd}:        ${result.brdStatus}`);
    console.log(`   ${s.reportRoles}:      ${result.roles.join(', ')}`);
    console.log(`   ${s.reportFeature}:    ${result.firstFeature.name} [${result.firstFeature.appetite}]`);

    if (result.skippedQuestions.length > 0) {
        console.log(`   ${s.reportSkipped}:  ${result.skippedQuestions.join(', ')}`);
    }

    console.log('----------------------------------------');
    for (const line of getNextStepLines(result.language, 'bootstrap')) {
        console.log(line);
    }
    console.log('');
}