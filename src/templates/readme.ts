/**
 * Template: README_AGENT_TEAM.md
 * Authority: BRD §9.6
 *
 * Pure function, string interpolation only, no LLM.
 * Must be readable by non-technical users.
 */

import type { GeneratedFile, TemplateInput } from './types.js';

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

## Bắt đầu nhanh (4 bước)

**Bước 1 — Khóa BRD / North Star**
Trước khi giao implementation, Tech Lead phải xác nhận BRD hoặc \`NORTH_STAR.md\` đã khóa.
Nếu chưa khóa đủ, F1 phải là: khóa BRD, scope, constraints, success criteria.

**Bước 2 — Yêu cầu Tech Lead calibrate team**
Trong IDE/agent runtime của bạn, nói:

> "Tech Lead, hãy scan repo, calibrate lại agent team theo BRD đã khóa, rồi đề xuất mọi thay đổi config cần thiết."

Tech Lead phải:
- scan repo và stack thực tế
- thay thông tin sai hoặc TBD bằng thông tin đúng trong \`team.md\`
- replace dòng \`Calibration status: bootstrap...\` bằng trạng thái đã calibrate khi đủ bằng chứng
- đề xuất thay đổi role hoặc số lane nếu dự án cần ít hoặc nhiều DEV hơn template ban đầu
- hỏi bạn trước khi apply bất kỳ patch config nào

**Bước 3 — Giao việc cho Tech Lead**
Trong IDE/agent runtime của bạn, nói:

> "Tech Lead, hãy break down F1 thành subtasks và assign cho team."

Tech Lead sẽ phân chia việc cho Dev, QA, Docs.

**Bước 4 — Ship**
- Dev implement subtasks.
- QA verify acceptance criteria.
- Tech Lead review và approve.
- Khi xong: Tech Lead cập nhật \`FEATURES.md\` → F1 status = DONE.

Sau đó lặp lại với F2, F3...

---

## Quy tắc quan trọng

**Không append config:**  
Nếu agent đề xuất "thêm note vào config" → từ chối. Dùng patch replace thay thế.

**Ai được sửa config:**  
Chỉ Tech Lead được chuẩn bị patch cho config chung. Các agent khác chỉ gửi signal đã verify cho Tech Lead.

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
stackmoss inject     # Đọc repo, sync PROJECT_FACTS, chuẩn bị calibrate
stackmoss resolve    # Trả lời câu hỏi còn thiếu
stackmoss promote --confirm  # Lock config vào OPERATIONAL mode
\`\`\`

---

## Các files cần biết

| File | Mục đích | Ai chỉnh |
|---|---|---|
| \`team.md\` | Sổ tay đội agent | Tech Lead + bạn |
| \`FEATURES.md\` | Danh sách feature | Tech Lead + bạn |
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
