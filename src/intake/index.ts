/**
 * Intake Engine — Entry point
 * Authority: BRD §8, FEATURES.md F2
 *
 * Orchestrates:
 * 1. Mode selection (Fast/Interview)
 * 2. Run selected mode flow
 * 3. Build IntakeResult (persona + roles + auto-add)
 * 4. Return IntakeResult
 */

import { select } from '@inquirer/prompts';
import type { IntakeMode, IntakeResult, Appetite } from './types.js';
import { getFeatureQuestionId, getAppetiteQuestionId } from './questions.js';
import { runFastMode } from './fast-mode.js';
import { runInterviewMode } from './interview-mode.js';
import { detectPersona, getProjectType, selectRoles } from './pack-selector.js';
import { detectAutoAddRoles } from './auto-add.js';

// ─── Mode Selection ──────────────────────────────────────────────

async function selectMode(): Promise<IntakeMode> {
    const mode = await select({
        message: 'Bạn muốn setup nhanh hay chi tiết?',
        choices: [
            { name: '[F] Fast    ~3 phút, 7 câu', value: 'fast' as const },
            { name: '[I] Interview   ~10 phút, 13 câu, team tốt hơn', value: 'interview' as const },
        ],
    });

    return mode;
}

// ─── Build IntakeResult ──────────────────────────────────────────

/**
 * Run the full intake flow and return a valid IntakeResult.
 */
export async function runIntake(): Promise<IntakeResult> {
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
    console.log('\n────────────────────────────────────────');
    console.log('📊 Intake Summary');
    console.log('────────────────────────────────────────');
    console.log(`   Mode:       ${result.mode}`);
    console.log(`   Persona:    ${result.persona}`);
    console.log(`   Project:    ${result.projectType}`);
    console.log(`   Roles:      ${result.roles.join(', ')}`);

    if (result.autoAddedRoles.length > 0) {
        console.log(`   Auto-added: ${result.autoAddedRoles.join(', ')}`);
    }

    console.log(`   Feature:    ${result.firstFeature.name} [${result.firstFeature.appetite}]`);

    if (result.skippedQuestions.length > 0) {
        console.log(`   ⚠️  Skipped:  ${result.skippedQuestions.join(', ')}`);
    }

    console.log('────────────────────────────────────────\n');
}
