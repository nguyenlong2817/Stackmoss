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

    const content = `# Huong Dan Dung Agent Team StackMoss
_Day la tai lieu quan trong nhat. Doc truoc khi bat dau._

---

## Day la gi?

\`team.md\` la "so tay doi agent" cua du an ${projectName}.
No dinh nghia: ai lam gi, lam theo quy tac nao, va khi nao thi xong.

StackMoss chi bootstrap team ban dau. Sau do Tech Lead phai scan repo that, hoi tiep khi can, va calibrate lai team theo BRD da khoa.

---

## Bat dau nhanh

**Buoc 1 - Khoa BRD / North Star**
Truoc khi giao implementation, Tech Lead phai xac nhan BRD hoac \`NORTH_STAR.md\` da khoa.
Neu chua khoa du, F1 phai tro thanh: khoa BRD, scope, constraints, success criteria.

**Buoc 2 - Chat voi Tech Lead truoc**
Trong IDE hoac CLI agent cua ban, noi:

> "Tech Lead, hay scan repo, hoi tiep bat ky cau hoi can thiet, calibrate lai agent team theo BRD da khoa, va de xuat moi thay doi config can thiet. Khong apply patch khi chua hoi toi."

Tech Lead phai:
- scan repo va stack thuc te
- hoi tiep khi repo facts con thieu hoac mau thuan
- thay thong tin sai hoac TBD bang thong tin dung trong \`team.md\`
- replace dong \`Calibration status: bootstrap...\` bang trang thai da calibrate khi du bang chung
- de xuat thay doi role hoac so lane neu du an can it hoac nhieu DEV hon template ban dau
- giu dung cau truc bootstrap cua runtime ban dang dung
- hoi ban truoc khi apply bat ky patch config nao

**Buoc 3 - Yeu cau Tech Lead break down F1**
Trong IDE hoac CLI agent cua ban, noi:

> "Tech Lead, hay break down F1 thanh subtasks va assign cho team."

**Buoc 4 - Ship**
- Dev implement subtasks
- QA verify acceptance criteria
- Tech Lead review va approve
- Khi xong: Tech Lead cap nhat \`FEATURES.md\` -> F1 status = DONE

---

## Bootstrap outputs da co san

Sau \`stackmoss init\` hoac \`stackmoss new\`, StackMoss tao san bootstrap config cho cac runtime nay:

| Runtime | Cau truc can co | Ghi chu |
|---|---|---|
| Claude Code | \`CLAUDE.md\` + \`.claude/skills/<skill-name>/SKILL.md\` | Dung khi user chat trong Claude Code |
| Cursor | \`.cursor/skills/<skill-name>/SKILL.md\` | Dung khi user chat trong Cursor |
| VS Code / Copilot | \`.github/copilot-instructions.md\` | Repo-level instructions |
| Codex | \`AGENTS.md\` | Repo-level instructions |
| Antigravity | \`.agent/skills/<skill-name>/SKILL.md\` + \`.agent/rules/*.md\` + \`.agent/workflows/*.md\` | Dung khi user chat trong Antigravity |

User flow dung sau khi bootstrap la: mo IDE/CLI ban dang dung va chat voi Tech Lead truoc.

---

## Quy tac quan trong

**Khong append config**
Neu agent de xuat "them note vao config" -> tu choi. Dung patch replace thay the.

**Ai duoc sua config**
Chi Tech Lead duoc chuan bi patch cho config chung. Cac agent khac chi gui signal da verify cho Tech Lead.

**Khi agent bi stuck**
\`\`\`
stackmoss check
\`\`\`
Tool nay phat hien van de va canh bao neu team van con o bootstrap state.

**Khi co loi la**
\`\`\`
stackmoss run <lenh-bi-loi>
\`\`\`
Wrapper se log loi va de xuat cach fix dung cho env nay.

---

## Advanced commands

Phan lon user khong can nho cac lenh nay trong happy path. Dung chung khi can debug hoac tu kiem tra state:
\`\`\`
stackmoss inject
stackmoss resolve
stackmoss promote --confirm
stackmoss check
\`\`\`

---

## Cac file can biet

| File | Muc dich | Ai chinh |
|---|---|---|
| \`team.md\` | So tay doi agent | Tech Lead + ban |
| \`FEATURES.md\` | Danh sach feature | Tech Lead + ban |
| \`NORTH_STAR.md\` | Dinh huong du an | Ban |
| \`NON_GOALS.md\` | Nhung gi KHONG lam | Ban |
| \`OPEN_QUESTIONS.md\` | Cau hoi chua tra loi | Ban can confirm |
| \`stackmoss.config.json\` | Cai dat he thong | Khong chinh tay |
| \`AGENTS.md\` | Bootstrap instructions cho Codex | StackMoss |
| \`CLAUDE.md\` | Repo-level guidance cho Claude Code | StackMoss |
| \`.github/copilot-instructions.md\` | Bootstrap instructions cho VS Code / Copilot | StackMoss |
`;

    return {
        path: 'README_AGENT_TEAM.md',
        content,
    };
}
