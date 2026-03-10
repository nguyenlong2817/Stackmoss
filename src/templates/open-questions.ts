/**
 * Template: OPEN_QUESTIONS.md
 * Authority: BRD §9.7
 *
 * Only generated when there are skipped questions.
 * Pure function, string interpolation only, no LLM.
 */

import type { GeneratedFile, TemplateInput } from './types.js';

// ─── Question label map (for display) ────────────────────────────

const QUESTION_LABELS: Record<string, string> = {
    Q1: 'Bạn là ai trong dự án?',
    Q2: 'Sản phẩm phục vụ ai?',
    Q3: 'Phạm vi địa lý?',
    Q4: 'Kênh chính / Monetization?',
    Q5: 'Data nhạy cảm / Kênh chính?',
    Q6: 'Feature đầu tiên / Data nhạy cảm?',
    Q6b: 'Appetite cho feature đầu tiên?',
    Q7: 'Deploy ở đâu?',
    Q8: 'Budget để ship v1?',
    Q9: 'Ai maintain?',
    Q10: 'Ưu tiên?',
    Q11: 'Nguồn dữ liệu?',
    Q12: 'Feature đầu tiên?',
    Q12b: 'Appetite cho feature đầu tiên?',
    Q_PT: 'Loại dự án?',
};

// ─── Generator ───────────────────────────────────────────────────

/**
 * Generate OPEN_QUESTIONS.md — returns null if no skipped questions.
 */
export function generateOpenQuestions(input: TemplateInput): GeneratedFile | null {
    const { projectName, intake } = input;

    if (intake.skippedQuestions.length === 0) {
        return null;
    }

    const items = intake.skippedQuestions
        .map((qId) => {
            const label = QUESTION_LABELS[qId] ?? qId;
            return `- [ ] ${qId}: ${label}`;
        })
        .join('\n');

    const content = `# Open Questions — ${projectName}
_Tạo khi có câu hỏi bị skip hoặc chưa được confirm._
_Xử lý trước khi promote --confirm (nếu đang ở MIGRATING)._

## Chưa được trả lời (cần bạn confirm)
${items}

## Đã được trả lời
_(sẽ được move xuống đây sau khi confirm)_
`;

    return {
        path: 'OPEN_QUESTIONS.md',
        content,
    };
}
