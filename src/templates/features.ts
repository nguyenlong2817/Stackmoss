/**
 * Template: FEATURES.md
 * Authority: BRD §9.3
 *
 * Pure function, string interpolation only, no LLM.
 */

import type { GeneratedFile, TemplateInput } from './types.js';

// ─── Generator ───────────────────────────────────────────────────

export function generateFeatures(input: TemplateInput): GeneratedFile {
    const { projectName, intake } = input;
    const { firstFeature } = intake;

    const content = `# FEATURES — ${projectName}
_Managed by Tech Lead. Cập nhật sau mỗi feature cycle._

---

## F1: ${firstFeature.name} (appetite: ${firstFeature.appetite})

**Outcome:**
- [Kết quả đo được khi feature hoàn thành]

**Non-goals:**
- [Những gì feature này KHÔNG làm]

**Acceptance:**
- [ ] Pass: [điều kiện pass]
- [ ] Pass: [điều kiện pass]
- [ ] Fail if: [điều kiện fail]

**Status:** TODO
**Owner:** Tech Lead
**Assigned:** DEV

---

_Thêm features mới bên dưới. TL là người duy nhất được add/reorder features._
`;

    return {
        path: 'FEATURES.md',
        content,
    };
}
