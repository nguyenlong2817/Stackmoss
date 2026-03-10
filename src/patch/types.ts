/**
 * Patch Proposal Types
 * Authority: BRD §12
 */

// ─── Patch Proposal ──────────────────────────────────────────────

export interface PatchProposal {
    id: string;
    createdAt: string;
    trigger: PatchTrigger;
    /** Command that caused the issue */
    command: string;
    /** Error output from the failed command/check */
    errorOutput: string;
    /** Suggested fix */
    suggestedFix: PatchFix;
    status: PatchStatus;
    rejectReason?: string;
}

export type PatchTrigger = 'run_fail' | 'check_fail' | 'repeat_error' | 'tl_instruction';

export type PatchStatus = 'pending' | 'applied' | 'rejected';

export interface PatchFix {
    /** Target file to modify */
    targetFile: string;
    /** Section/capability being patched */
    section: string;
    /** Old content to replace */
    oldContent: string;
    /** New content (must be ≤ old content length in words) */
    newContent: string;
}

// ─── Run Result ──────────────────────────────────────────────────

export interface RunResult {
    alias: string;
    command: string;
    exitCode: number;
    stdout: string;
    stderr: string;
    success: boolean;
    patchCreated: boolean;
    patchId?: string;
}

// ─── Check Result ────────────────────────────────────────────────

export interface CheckIssue {
    category: 'path_missing' | 'command_not_found' | 'budget_exceeded' | 'structure_invalid';
    detail: string;
    fixable: boolean;
    patchId?: string;
}

export interface CheckResult {
    issues: CheckIssue[];
    patchesCreated: number;
    allClear: boolean;
}
