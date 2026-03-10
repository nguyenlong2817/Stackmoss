/**
 * Template Engine — Orchestrator
 * Authority: BRD §8.4, template-engine skill
 *
 * Generates all Phase A output files from IntakeResult.
 * Returns GeneratedFile[] for atomic write by the caller.
 */

import type { GeneratedFile, TemplateInput } from './types.js';
import { generateConfig } from './config.js';
import { generateTeam } from './team.js';
import { generateFeatures } from './features.js';
import { generateNorthStar } from './north-star.js';
import { generateNonGoals } from './non-goals.js';
import { generateReadme } from './readme.js';
import { generateOpenQuestions } from './open-questions.js';

// Re-export types for convenience
export type { GeneratedFile, TemplateInput } from './types.js';

// ─── Generate All Files ──────────────────────────────────────────

/**
 * Generate all Phase A output files from intake result.
 *
 * Returns an array of GeneratedFile ready for atomic write.
 * OPEN_QUESTIONS.md is conditionally included.
 */
export function generateAllFiles(input: TemplateInput): GeneratedFile[] {
    const files: GeneratedFile[] = [
        generateConfig(input),
        generateTeam(input),
        generateFeatures(input),
        generateNorthStar(input),
        generateNonGoals(input),
        generateReadme(input),
    ];

    // Conditionally add OPEN_QUESTIONS.md
    const openQuestions = generateOpenQuestions(input);
    if (openQuestions) {
        files.push(openQuestions);
    }

    return files;
}
