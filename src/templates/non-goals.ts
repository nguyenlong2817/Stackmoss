/**
 * Template: NON_GOALS.md
 * Authority: BRD §9.4 (adjacent)
 *
 * Pure function, string interpolation only, no LLM.
 * 3 safe default lines — no inference from answers.
 */

import type { GeneratedFile, TemplateInput } from './types.js';

// ─── Generator ───────────────────────────────────────────────────

export function generateNonGoals(input: TemplateInput): GeneratedFile {
    const { projectName } = input;

    const content = `# Non-Goals — ${projectName}
_v1 không làm những điều sau. Cập nhật khi scope thay đổi._

- Không hỗ trợ nhiều project cùng lúc (multi-project)
- Không tự động deploy hoặc push code (suggest-only)
- Không yêu cầu LLM API key để chạy (BYO-LLM là optional)
`;

    return {
        path: 'NON_GOALS.md',
        content,
    };
}
