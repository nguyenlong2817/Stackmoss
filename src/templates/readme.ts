/**
 * Template: README_AGENT_TEAM.md
 * Authority: BRD §9.6
 *
 * Pure function, string interpolation only, no LLM.
 * Must be readable by non-technical users.
 */

import type { GeneratedFile, TemplateInput } from './types.js';

// ─── Generator ───────────────────────────────────────────────────

export function generateReadme(input: TemplateInput): GeneratedFile {
    const { projectName } = input;

    const content = `# Hướng Dẫn Dùng Agent Team StackMoss
_Đây là tài liệu quan trọng nhất. Đọc trước khi bắt đầu._

---

## Đây là gì?

\`team.md\` là "sổ tay đội agent" của dự án ${projectName}.  
Nó định nghĩa: ai làm gì, làm theo quy tắc nào, khi nào thì xong.

Bạn không cần đọc hết. Chỉ cần biết cách dùng.

---

## Bắt đầu nhanh (3 bước)

**Bước 1 — Chọn feature để làm**
Mở \`FEATURES.md\`. Chọn F1 (feature đầu tiên).

**Bước 2 — Giao việc cho Tech Lead**
Trong IDE/agent runtime của bạn, nói:

> "Tech Lead, hãy break down F1 thành subtasks và assign cho team."

Tech Lead sẽ phân chia việc cho Dev, QA, Docs.

**Bước 3 — Ship**
- Dev implement subtasks.
- QA verify acceptance criteria.
- Tech Lead review và approve.
- Khi xong: Tech Lead cập nhật \`FEATURES.md\` → F1 status = DONE.

Sau đó lặp lại với F2, F3...

---

## Quy tắc quan trọng

**Không append config:**  
Nếu agent đề xuất "thêm note vào config" → từ chối. Dùng patch replace thay thế.

**Khi agent bị stuck:**  
\`\`\`
stackmoss check
\`\`\`
Tool này phát hiện vấn đề và tạo patch proposal để fix.

**Khi có lỗi lạ:**  
\`\`\`
stackmoss run <lệnh bị lỗi>
\`\`\`
Wrapper sẽ log lỗi và đề xuất cách fix đúng cho env này.

---

## Khi dự án có repo thật

Nếu bạn đã bắt đầu code, chạy:
\`\`\`
stackmoss inject     # Đọc repo, calibrate team config
stackmoss resolve    # Trả lời câu hỏi còn thiếu
stackmoss promote --confirm  # Lock config vào OPERATIONAL mode
\`\`\`

---

## Các files cần biết

| File | Mục đích | Ai chỉnh |
|---|---|---|
| \`team.md\` | Sổ tay đội agent | Bạn (nếu muốn) |
| \`FEATURES.md\` | Danh sách feature | Tech Lead + Bạn |
| \`NORTH_STAR.md\` | Định hướng dự án | Bạn |
| \`NON_GOALS.md\` | Những gì KHÔNG làm | Bạn |
| \`OPEN_QUESTIONS.md\` | Câu hỏi chưa trả lời | Bạn cần confirm |
| \`stackmoss.config.json\` | Cài đặt hệ thống | Không chỉnh tay |
`;

    return {
        path: 'README_AGENT_TEAM.md',
        content,
    };
}
