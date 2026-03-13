import type { RawAnswers } from './types.js';

const SEC_TRIGGER_VALUES = new Set(['pii', 'finance', 'compliance']);

export function detectAutoAddRoles(
    answers: RawAnswers,
    mode: 'fast' | 'interview',
): string[] {
    const autoAdded: string[] = [];

    const dataSensitivityCandidates = mode === 'fast'
        ? [
            answers['Q6'] as string | undefined,
            answers['Q5'] as string | undefined,
        ]
        : [
            answers['Q7'] as string | undefined,
            answers['Q6'] as string | undefined,
        ];
    const dataSensitivity = dataSensitivityCandidates.find(
        (value): value is string => typeof value === 'string' && SEC_TRIGGER_VALUES.has(value),
    ) ?? dataSensitivityCandidates.find((value): value is string => typeof value === 'string');

    if (dataSensitivity && SEC_TRIGGER_VALUES.has(dataSensitivity)) {
        autoAdded.push('SEC-lite');
    }

    if (mode === 'interview') {
        const deployTarget = (answers['Q8'] as string | undefined) ?? (answers['Q7'] as string | undefined);
        const audience = answers['Q2'] as string | undefined;
        const deployTrigger = deployTarget === 'vps' || deployTarget === 'cloud';
        const audienceTrigger = audience === 'sme' || audience === 'enterprise';

        if (deployTrigger && audienceTrigger) {
            autoAdded.push('OPS-lite');
        }
    }

    return autoAdded;
}
