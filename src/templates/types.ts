/**
 * Template Engine — Shared types
 * Authority: BRD §9, template-engine skill
 */

import type { IntakeResult } from '../intake/types.js';

// ─── Generated File ──────────────────────────────────────────────

/** A file to be written atomically */
export interface GeneratedFile {
    /** Relative path within the project folder */
    path: string;
    /** Full file content (ready to write) */
    content: string;
}

// ─── Template Input ──────────────────────────────────────────────

/** Input for all template generators */
export interface TemplateInput {
    /** Project name (folder name) */
    projectName: string;
    /** StackMoss version */
    version: string;
    /** IntakeResult from F2 */
    intake: IntakeResult;
}
