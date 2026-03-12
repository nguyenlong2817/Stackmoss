/**
 * Intake Engine — Entry point
 * Authority: BRD §8, FEATURES.md F2
 *
 * Orchestrates:
 * 1. Language selection (Q_LANG)
 * 2. Mode selection (Fast/Interview)
 * 3. Run selected mode flow
 * 4. Build IntakeResult (persona + roles + auto-add)
 * 5. Return IntakeResult
 */

import { select } from '@inquirer/prompts';
import type { IntakeMode, IntakeResult, Appetite } from './types.js';
import { getFeatureQuestionId, getAppetiteQuestionId } from './questions.js';
import { runFastMode } from './fast-mode.js';
import { runInterviewMode } from './interview-mode.js';
import { detectPersona, getProjectType, selectRoles } from './pack-selector.js';
import { detectAutoAddRoles } from './auto-add.js';
import { setLanguage, getLanguage, t } from './i18n.js';
import type { Language } from './i18n.js';

// ─── Language Selection ──────────────────────────────────────────

async function selectLanguage(): Promise<Language> {
    const lang = await select({
        message: 'Language / Ngôn ngữ?',
        choices: [
            { name: '[EN] English', value: 'en' as const },
            { name: '[VI] Tiếng Việt', value: 'vi' as const },
        ],
    });
    return lang;
}

// ─── Mode Selection ──────────────────────────────────────────────

async function selectMode(): Promise<IntakeMode> {
    const s = t();
    const mode = await select({
        message: s.modeQuestion,
        choices: [
            { name: s.modeFastLabel, value: 'fast' as const },
            { name: s.modeInterviewLabel, value: 'interview' as const },
        ],
    });

    return mode;
}

// ─── Build IntakeResult ──────────────────────────────────────────

/**
 * Run the full intake flow and return a valid IntakeResult.
 */
export async function runIntake(): Promise<IntakeResult> {
    // Step 0: Language selection
    const lang = await selectLanguage();
    setLanguage(lang);

    // Step 1: Mode selection (no default — user must choose)
    const mode = await selectMode();

    // Step 2: Run selected mode
    let answers: Record<string, string | string[]>;
    let skippedQuestions: string[];

    if (mode === 'fast') {
        const result = await runFastMode();
        answers = result.answers;
        skippedQuestions = result.skippedQuestions;
    } else {
        const result = await runInterviewMode();
        answers = result.answers;
        skippedQuestions = result.skippedQuestions;
    }

    // Step 3: Build IntakeResult
    const persona = detectPersona(answers['Q1'] as string);
    const projectType = getProjectType(answers);
    const roles = selectRoles(persona, projectType);
    const autoAddedRoles = detectAutoAddRoles(answers, mode);

    // Extract first feature
    const featureQId = getFeatureQuestionId(mode);
    const appetiteQId = getAppetiteQuestionId(mode);

    const firstFeature = {
        name: (answers[featureQId] as string) ?? '',
        appetite: ((answers[appetiteQId] as string) ?? 'M') as Appetite,
    };

    const result: IntakeResult = {
        mode,
        language: lang,
        answers,
        skippedQuestions,
        persona,
        projectType,
        roles,
        autoAddedRoles,
        firstFeature,
    };

    return result;
}

// ─── Report ──────────────────────────────────────────────────────

/**
 * Print intake summary to console.
 */
export function reportIntake(result: IntakeResult): void {
    const s = t();
    console.log('\n────────────────────────────────────────');
    console.log(s.reportHeader);
    console.log('────────────────────────────────────────');
    console.log(`   ${s.reportMode}:       ${result.mode}`);
    console.log(`   ${s.reportPersona}:    ${result.persona}`);
    console.log(`   ${s.reportProject}:    ${result.projectType}`);
    console.log(`   ${s.reportRoles}:      ${result.roles.join(', ')}`);

    if (result.autoAddedRoles.length > 0) {
        console.log(`   ${s.reportAutoAdded}: ${result.autoAddedRoles.join(', ')}`);
    }

    console.log(`   ${s.reportFeature}:    ${result.firstFeature.name} [${result.firstFeature.appetite}]`);

    if (result.skippedQuestions.length > 0) {
        console.log(`   ⚠️  ${s.reportSkipped}:  ${result.skippedQuestions.join(', ')}`);
    }

    console.log('────────────────────────────────────────\n');
}
