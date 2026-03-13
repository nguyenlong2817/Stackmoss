import type { GeneratedFile, TemplateInput } from './types.js';

const AUDIENCE_LABELS: Record<string, string> = {
    individual: 'Ca nhan',
    sme: 'SME',
    enterprise: 'Enterprise',
    community: 'Cong dong',
};

const PERSONA_LABELS: Record<string, string> = {
    BizLed: 'Biz lead',
    DevLed: 'Dev lead',
    Solo: 'Solo founder',
    Newbie: 'Nguoi moi',
};

const BRD_LABELS: Record<string, string> = {
    locked: 'Da lock',
    draft: 'Dang draft',
    none: 'Chua co',
};

const DEPLOY_LABELS: Record<string, string> = {
    local: 'Local',
    vps: 'VPS',
    cloud: 'Cloud',
    unknown: 'Unknown',
};

export function generateNorthStar(input: TemplateInput): GeneratedFile {
    const { projectName, intake } = input;
    const { answers, mode } = intake;

    const persona = PERSONA_LABELS[intake.persona] ?? intake.persona;
    const audience = AUDIENCE_LABELS[answers['Q2'] as string] ?? (answers['Q2'] as string) ?? 'TBD';
    const brdStatus = BRD_LABELS[intake.brdStatus] ?? intake.brdStatus;
    const dataSensitivityId = mode === 'fast' ? 'Q6' : 'Q7';
    const dataSensitivity = (answers[dataSensitivityId] as string) ?? 'none';
    const deployTargetRaw = mode === 'interview' ? ((answers['Q8'] as string) ?? 'unknown') : 'unknown';
    const deployTarget = DEPLOY_LABELS[deployTargetRaw] ?? deployTargetRaw;

    const content = `# North Star - ${projectName}
_Generated from intake. Cap nhat bang tay khi direction thay doi._

**Ai dung:** ${persona} xay dung san pham cho ${audience}
**BRD status:** ${brdStatus}
**Idea:** ${intake.idea}
**Domain:** ${intake.domain}
**Success signal:** ${(answers['Q10'] as string) ?? '[can owner confirm]'}
**Constraints:**
- Data sensitivity: ${dataSensitivity.toUpperCase()}
- Deploy target: ${deployTarget}
- Team bootstrap objective: ${intake.firstFeature.name}
**Pham vi v1:** ${intake.firstFeature.name} [${intake.firstFeature.appetite}]
`;

    return {
        path: 'NORTH_STAR.md',
        content,
    };
}
