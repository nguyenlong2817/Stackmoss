/**
 * Template: NORTH_STAR.md
 * Authority: BRD §9.4
 *
 * Pure function, string interpolation only, no LLM.
 */

import type { GeneratedFile, TemplateInput } from './types.js';

// ─── Answer Label Maps ───────────────────────────────────────────

const AUDIENCE_LABELS: Record<string, string> = {
    individual: 'Cá nhân',
    sme: 'SME (doanh nghiệp nhỏ)',
    enterprise: 'Enterprise',
    community: 'Cộng đồng',
};

const GEO_LABELS: Record<string, string> = {
    internal: 'Nội bộ',
    vn: 'Việt Nam',
    global: 'Global',
};

const PERSONA_LABELS: Record<string, string> = {
    BizLed: 'Biz lead',
    DevLed: 'Dev lead',
    Solo: 'Solo founder',
    Newbie: 'Người mới',
};

// ─── Generator ───────────────────────────────────────────────────

export function generateNorthStar(input: TemplateInput): GeneratedFile {
    const { projectName, intake } = input;
    const { answers, mode } = intake;

    // Map answers to display values
    const persona = PERSONA_LABELS[intake.persona] ?? intake.persona;
    const audience = AUDIENCE_LABELS[answers['Q2'] as string] ?? (answers['Q2'] as string) ?? 'TBD';
    const geo = GEO_LABELS[answers['Q3'] as string] ?? (answers['Q3'] as string) ?? 'TBD';

    // Feature question differs by mode
    const featureName = intake.firstFeature.name || 'TBD';

    // Data sensitivity
    const dataSensitivityId = mode === 'fast' ? 'Q5' : 'Q6';
    const dataSensitivity = (answers[dataSensitivityId] as string) ?? 'none';
    const sensitivityLabel = dataSensitivity === 'none' ? 'Không có data nhạy cảm' : `Data nhạy cảm: ${dataSensitivity.toUpperCase()}`;

    // Constraints list
    const constraints: string[] = [];
    constraints.push(`Địa lý: ${geo}`);
    constraints.push(sensitivityLabel);

    // Interview-only constraints
    if (mode === 'interview') {
        const deployTarget = (answers['Q7'] as string) ?? '';
        if (deployTarget) {
            const deployLabels: Record<string, string> = {
                local: 'Local',
                vps: 'VPS',
                cloud: 'Cloud',
                unknown: 'Chưa xác định',
            };
            constraints.push(`Deploy: ${deployLabels[deployTarget] ?? deployTarget}`);
        }

        const budget = (answers['Q8'] as string) ?? '';
        if (budget) {
            const budgetLabels: Record<string, string> = {
                cheapest: 'Rẻ nhất',
                balanced: 'Cân bằng',
                fastest: 'Nhanh nhất',
            };
            constraints.push(`Budget: ${budgetLabels[budget] ?? budget}`);
        }
    }

    const content = `# North Star — ${projectName}
_Generated from intake. Cập nhật bằng tay khi direction thay đổi._

**Ai dùng:** ${persona} xây dựng sản phẩm cho ${audience}
**Vấn đề cần giải quyết:** ${featureName}
**Success signal:** [khi nào coi là thành công — cần owner confirm]
**Constraints:**
${constraints.map((c) => `- ${c}`).join('\n')}
**Phạm vi v1:** Feature đầu tiên: ${featureName} [${intake.firstFeature.appetite}]
`;

    return {
        path: 'NORTH_STAR.md',
        content,
    };
}
