/**
 * Auto-Add Rules — SEC-lite / OPS-lite auto-detection
 * Authority: BRD §10 auto-add rules, intake-engine skill
 *
 * These roles are added automatically without user prompt.
 */

import type { RawAnswers } from './types.js';

// ─── Sensitive data values that trigger SEC-lite ─────────────────

const SEC_TRIGGER_VALUES = new Set(['pii', 'finance', 'compliance']);

// ─── Auto-Add Detection ─────────────────────────────────────────

/**
 * Detect auto-added roles based on answers.
 *
 * Rules (BRD §10):
 * - Fast Q5 / Interview Q6 = PII | Finance | Compliance → add SEC-lite
 * - Interview Q7 = VPS | Cloud AND Q2 = SME | Enterprise → add OPS-lite
 */
export function detectAutoAddRoles(
    answers: RawAnswers,
    mode: 'fast' | 'interview',
): string[] {
    const autoAdded: string[] = [];

    // ─── SEC-lite check ──────────────────────────────────────
    const dataSensitivityId = mode === 'fast' ? 'Q5' : 'Q6';
    const dataSensitivity = answers[dataSensitivityId] as string | undefined;

    if (dataSensitivity && SEC_TRIGGER_VALUES.has(dataSensitivity)) {
        autoAdded.push('SEC-lite');
    }

    // ─── OPS-lite check (interview only) ─────────────────────
    if (mode === 'interview') {
        const deployTarget = answers['Q7'] as string | undefined;
        const audience = answers['Q2'] as string | undefined;

        const deployTrigger = deployTarget === 'vps' || deployTarget === 'cloud';
        const audienceTrigger = audience === 'sme' || audience === 'enterprise';

        if (deployTrigger && audienceTrigger) {
            autoAdded.push('OPS-lite');
        }
    }

    return autoAdded;
}
