/**
 * Patch module barrel export
 */

export { createProposal, listProposals, applyProposal, rejectProposal, wordCount } from './engine.js';
export type {
    PatchProposal,
    PatchFix,
    PatchTrigger,
    PatchStatus,
    RunResult,
    CheckIssue,
    CheckResult,
} from './types.js';
export type { ApplyResult } from './engine.js';
