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

    const persona = PERSONA_LABELS[intake.persona] ?? 'Bootstrap PM/TL';
    const audience = AUDIENCE_LABELS[answers['Q2'] as string] ?? (answers['Q2'] as string) ?? 'TBD';
    const brdStatus = BRD_LABELS[intake.brdStatus] ?? intake.brdStatus;
    const dataSensitivity = mode === 'interview'
        ? ((answers['Q7'] as string) ?? 'none')
        : 'not_collected_in_fast_mode';
    const deployTargetRaw = 'unknown';
    const deployTarget = DEPLOY_LABELS[deployTargetRaw] ?? deployTargetRaw;

    const content = `# North Star - ${projectName}
_Generated from intake. Cap nhat bang tay khi direction thay doi._

**Ai dung:** ${persona} xay dung san pham cho ${audience}
**BRD status:** ${brdStatus}
**Idea:** ${intake.idea}
**Domain:** ${intake.domain}
**Success signal:** ${(answers['Q10'] as string) ?? '[can owner confirm]'}
**Non-goals:** ${(answers['Q_NON_GOALS'] as string) ?? '[can owner confirm]'}
**Main constraints:** ${(answers['Q_CONSTRAINTS'] as string) ?? '[can owner confirm]'}
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
