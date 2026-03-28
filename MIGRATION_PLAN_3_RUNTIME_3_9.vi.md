# Ke hoach migration StackMoss (ban da chot)

## 1. Quyết định đã chốt

1. AGENTS.md chỉ dành cho Codex.
2. Claude dùng CLAUDE.md, không dùng AGENTS.md làm runtime config.
3. Bỏ hoàn toàn Cursor, VS Code/Copilot, Roo.
4. Không dùng target ClaudeCodeV2.
5. Vẫn dùng target tên ClaudeCode nhưng giữ format hiện đại:
   - `CLAUDE.md`
   - `.claude/skills/<skill-name>/...`
6. Sau init chỉ bootstrap 2 role:
   - Product Manager (PM)
   - Tech Lead (TL)
7. Bỏ intake chọn role.
8. Tạo sẵn skill-creator cho cả 3 runtime.
9. Skill-creator runtime nào chỉ được tạo skill cho runtime đó.

---

## 2. Runtime contract sau migration

## 2.1 Claude

- Root instruction: `CLAUDE.md`
- Skills: `.claude/skills/<skill-name>/...`
- PM và TL được bootstrap sẵn theo cấu trúc 3-9.

## 2.2 Codex

- Root instruction: `AGENTS.md`
- Skills: `.agents/skills/<skill-name>/...`
- PM và TL được bootstrap sẵn theo cấu trúc 3-9.

## 2.3 Antigravity

- Cấu trúc:
  - `.agent/skills/`
  - `.agent/rules/`
  - `.agent/workflows/`
- PM và TL được bootstrap sẵn theo cấu trúc 3-9.
- Đặc thù Antigravity:
  - một role có thể có nhiều file skill trong cùng role folder.
  - ví dụ role TL có thể gồm `SKILL.md`, `skill-creator.md`, `calibrate.md`, ...
  - `SKILL.md` vẫn là instruction chính.

---

## 3. User flow sau init

1. User chạy `stackmoss init`.
2. Intake chỉ làm rõ BRD context (không chọn role).
3. Bootstrap tạo 3 runtime (Claude/Codex/Antigravity), mỗi runtime chỉ có PM + TL.
4. Bước bắt buộc đầu tiên: lock BRD với Product Manager.
5. Sau khi BRD lock: làm việc với Tech Lead.
6. Tech Lead dùng skill-creator runtime-specific để sinh thêm role skills theo BRD.

---

## 4. Quy tắc cứng cho skill-creator

1. Runtime isolation bắt buộc:
   - Claude skill-creator chỉ sinh `.claude/skills/...`
   - Codex skill-creator chỉ sinh `.agents/skills/...`
   - Antigravity skill-creator chỉ sinh `.agent/skills/...` (+ rules/workflows nếu cần)
2. Mọi skill kỹ thuật do skill-creator sinh ra phải:
   - có command validate thực thi được,
   - có log failure trong data layer của chính skill,
   - nếu không thể validate thì phải hỏi owner theo checklist và block done.

---

## 5. Chuẩn skill 3-9 áp dụng cho bootstrap PM/TL

Mỗi skill phải có tối thiểu:

- Layer 1: metadata frontmatter.
- Layer 2: core `SKILL.md`.
- Layer 3: `references/`.
- Layer 4: `examples/`.
- Layer 5: `scripts/`.
- Layer 6: `assets/templates/`.
- Layer 7: output contract + QC.
- Layer 8: governance/evolution + cutoff + validation logs.

---

## 6. Intake mới (đã align theo yêu cầu)

## 6.1 Quick intake (3 câu)

1. `Q_BRD_STATUS`: BRD status? (`locked` | `draft` | `none`)
2. `Q_BRD_SUMMARY`: Tóm tắt BRD/idea hiện tại (1-3 câu).
3. `Q_DOMAIN`: Domain của sản phẩm.

## 6.2 Interview intake (9 câu, nằm trong yêu cầu 8-10)

1. `Q_BRD_STATUS`: BRD status.
2. `Q_BRD_SUMMARY`: Tóm tắt BRD/idea hiện tại.
3. `Q_DOMAIN`: Domain.
4. `Q_AUDIENCE`: User mục tiêu.
5. `Q_SUCCESS`: Success criteria cho v1.
6. `Q_NON_GOALS`: Non-goals/out-of-scope.
7. `Q_DATA_SENSITIVITY`: Data sensitivity (`none` | `pii` | `finance` | `compliance`).
8. `Q_REPO_STATE`: Repo state (`existing_repo` | `greenfield`).
9. `Q_CONSTRAINTS`: Constraint chính (timeline/compliance/budget/dependency).

---

## 7. Phạm vi thay đổi code

## Phase A - Runtime contraction

1. `src/compile/index.ts`
   - chỉ còn `ClaudeCode`, `Codex`, `Antigravity`.
   - bỏ `ClaudeCodeV2`, `Cursor`, `Roo`, `VSCode`.
2. `src/config.ts` + `src/templates/config.ts`
   - default targets chỉ còn 3 runtime.
3. `src/commands/init.ts` + `src/commands/new.ts`
   - report bootstrap chỉ còn 3 runtime.
4. docs/templates:
   - `README.md`, `AGENTS.md`, `src/templates/readme.ts`, `src/templates/calibrate.ts`.

## Phase B - Intake simplification + PM/TL only

1. Đổi question set sang quick 3 và interview 9.
2. Bỏ role selection hoàn toàn.
3. Intake result cố định bootstrap roles = `PM`, `TL`.
4. Bỏ auto-add role logic trong bootstrap path.

## Phase C - PM/TL skill bundle 3-9 cho 3 runtime

1. Mỗi runtime sinh PM/TL theo bundle 3-9.
2. Sinh sẵn skill-creator runtime-specific cho 3 runtime.
3. Antigravity TL role có nhiều skill file (SKILL chính + skill-creator + calibrate).

## Phase D - Test + hardening

1. Cập nhật/xóa test cũ liên quan target đã bỏ.
2. Thêm test cho:
   - 3 runtime only.
   - bootstrap PM/TL only.
   - intake không còn role selection.
   - runtime-specific skill-creator boundary.
   - bundle 3-9 output contract.

---

## 8. Acceptance criteria

1. `stackmoss init` không tạo artifact của Cursor/VSCode/Roo.
2. Compile target không còn `ClaudeCodeV2`.
3. Claude dùng `CLAUDE.md`; Codex dùng `AGENTS.md`; Antigravity dùng `.agent/*`.
4. Bootstrap chỉ có PM + TL.
5. Intake không còn chọn role.
6. PM/TL skills của cả 3 runtime tuân thủ 3-9.
7. Skill-creator runtime nào chỉ sinh skill runtime đó.
8. `npm test` và `npm run build` pass.

