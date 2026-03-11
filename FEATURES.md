# FEATURES — StackMoss Agent Team Config
_Managed by Tech Lead. Cập nhật sau mỗi feature cycle._

---

## F1: CLI Scaffold + State Machine (appetite: S)

**Outcome:**
- CLI binary `stackmoss` hoạt động, state machine validate state trước khi execute. `stackmoss new <name>` tạo folder trống + init state = GLOBAL.

**Non-goals:**
- Không implement intake questions trong F1
- Không generate output files trong F1
- Không implement Phase B/C commands

**Acceptance:**
- [x] Pass: `stackmoss --version` in version
- [x] Pass: `stackmoss new test-project` tạo folder + init `stackmoss.config.json` với `state: "GLOBAL"`
- [x] Pass: `stackmoss inject` trả lỗi "Command not available in GLOBAL state" (Phase B)
- [x] Pass: State validation block commands không thuộc state hiện tại
- [x] Fail if: Command chạy mà không check state trước
- [x] Fail if: Folder đã tồn tại → phải abort với message rõ, không overwrite
- [x] Fail if: Ctrl+C tạo partial files

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F2: Intake Engine (appetite: M)

**Outcome:**
- User chạy `stackmoss new <name>`, chọn Fast/Interview mode, trả lời intake questions. Output: `IntakeResult` JSON object chứa toàn bộ answers + detected persona + selected pack.

**Non-goals:**
- Không generate output files (đó là F3)
- Không implement BYO-LLM
- Không implement compile layer

**Interface contract (F2 → F3):**
```typescript
interface IntakeResult {
  mode: 'fast' | 'interview';
  answers: Record<string, string | string[]>;
  skippedQuestions: string[];
  persona: 'BizLed' | 'DevLed' | 'Solo' | 'Newbie';
  projectType: 'MVP' | 'Production' | 'InternalTool' | 'LibraryAPI';
  roles: string[];           // e.g. ['TL', 'BA', 'DEV', 'QA', 'DOCS']
  autoAddedRoles: string[];  // e.g. ['SEC-lite'] if Q5=PII
  firstFeature: { name: string; appetite: 'S' | 'M' | 'L' };
}
```

**Acceptance:**
- [x] Pass: Fast mode hỏi đúng 7 câu (6 BRD + Q_PT), completeness gate chỉ check Q5
- [x] Pass: Interview mode hỏi 13 câu + follow-up tối đa 2 câu
- [x] Pass: Câu skip → ghi vào `skippedQuestions[]`, không infer
- [x] Pass: Pack selection output đúng roles theo 2D matrix (BRD §10)
- [x] Pass: Q5=PII → `autoAddedRoles` chứa SEC-lite
- [x] Pass: Returns valid `IntakeResult` JSON
- [x] Fail if: LLM được dùng cho logic/routing
- [x] Fail if: Fast mode bị biến thành Interview mode

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F3: Template Engine + Compile Claude Code (appetite: M)

**Outcome:**
- Nhận `IntakeResult` từ F2 → generate all output files (`team.md`, `FEATURES.md`, `NORTH_STAR.md`, `NON_GOALS.md`, `stackmoss.config.json`, `README_AGENT_TEAM.md`, `OPEN_QUESTIONS.md` nếu có câu skip) → compile ra `.claude/skills/` (1 file per role).

**Non-goals:**
- Không implement BYO-LLM rewrite
- Không implement compile target Cursor/Roo/Antigravity (v0.2+)

**Acceptance:**
- [x] Pass: Mỗi template có validation test
- [x] Pass: Output match BRD §9 schema
- [x] Pass: team.md có CONSTITUTION, ROLES, WORKING CONTRACT, PROJECT_FACTS
- [x] Pass: FEATURES.md có F1 với appetite S/M/L rõ ràng
- [x] Pass: `OPEN_QUESTIONS.md` chỉ tạo khi có câu skip
- [x] Pass: Compile ra `.claude/skills/<role>.skill.md` cho mỗi role
- [x] Pass: Atomic write — tạo xong hết rồi mới write tất cả
- [x] Fail if: Template hardcode business logic
- [x] Fail if: Partial files khi Ctrl+C

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F4: Repo Scanner + `stackmoss inject` (appetite: M)

**Outcome:**
- User chạy `stackmoss inject` trong project đã tạo → scanner đọc repo → generate `MIGRATION_REPORT.md` (3 tiers: facts/hypotheses/questions) → state GLOBAL → MIGRATING.

**Non-goals:**
- Không execute code trong repo
- Không modify source files
- Không dùng LLM cho detection

**Acceptance:**
- [x] Pass: Detect package manager từ lockfile
- [x] Pass: Detect framework từ dependencies (Next.js, NestJS, etc.)
- [x] Pass: Detect monorepo signals (workspaces, /apps/, /packages/)
- [x] Pass: MIGRATION_REPORT.md match BRD §9.5 schema
- [x] Pass: State transition GLOBAL → MIGRATING
- [x] Fail if: Scanner chạy code hoặc modify source files

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F5: `stackmoss resolve` (appetite: S)

**Outcome:**
- User chạy `stackmoss resolve` → interactive Q&A từ MIGRATION_REPORT → update report in-place.

**Acceptance:**
- [x] Pass: Reads unresolved questions from MIGRATION_REPORT.md
- [x] Pass: Interactive answer/skip/stop flow
- [x] Pass: Updates report (move items to "Đã trả lời")
- [x] Fail if: Chạy khi state ≠ MIGRATING

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F6: `stackmoss promote --confirm` (appetite: S)

**Outcome:**
- User chạy `stackmoss promote --confirm` → 4 hard criteria checked → if all pass → state MIGRATING → OPERATIONAL.

**Acceptance:**
- [x] Pass: Blocks when unresolved questions exist
- [x] Pass: Blocks when critical hypothesis < 80% confidence
- [x] Pass: Blocks when no DEV-ENV command verified
- [x] Pass: Blocks when --confirm flag missing
- [x] Pass: Transitions state MIGRATING → OPERATIONAL when all pass
- [x] Pass: Does NOT transition when any fail
- [x] Fail if: Promotes without all 4 criteria satisfied

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F7: `stackmoss run <alias>` + Patch Engine (appetite: M)

**Outcome:**
- Chạy command alias từ package.json scripts hoặc team.md [DEV-ENV]. Fail → tạo Patch Proposal tự động.

**Acceptance:**
- [x] Pass: Resolve alias từ package.json scripts
- [x] Pass: Execute command với timeout (60s)
- [x] Pass: Tạo PatchProposal khi fail (BRD §12.2)
- [x] Pass: Patch proposals stored in `.stackmoss/patches/`
- [x] Fail if: Chạy khi state ≠ OPERATIONAL

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F8: `stackmoss check` (appetite: S)

**Outcome:**
- Verify config sanity: paths, commands, word budgets (BRD §12.4), team.md structure.

**Acceptance:**
- [x] Pass: Detect missing required files (FEATURES.md, NORTH_STAR.md)
- [x] Pass: Detect missing team.md sections (CONSTITUTION, ROLES, etc.)
- [x] Pass: Word budget check per capability (BRD §12.4)
- [x] Pass: Create PatchProposal for fixable issues

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F9: `stackmoss patch apply/reject` (appetite: S)

**Outcome:**
- Apply hoặc reject pending Patch Proposals. Apply enforce word budget ≤ old content.

**Acceptance:**
- [x] Pass: Apply replaces content in target file
- [x] Pass: Blocks when new content exceeds old content (word budget)
- [x] Pass: Reject logs reason
- [x] Pass: List shows all proposals by status

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F10: `stackmoss upgrade` (appetite: S)

**Outcome:**
- Merge ONLY CONSTITUTION section từ StackMoss version mới. NEVER touch PROJECT_FACTS.

**Acceptance:**
- [x] Pass: Extract + replace CONSTITUTION section only
- [x] Pass: Preserves PROJECT_FACTS and operational learnings
- [x] Pass: Shows diff before apply
- [x] Pass: --apply flag triggers write

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F11: Cursor Compile Target (appetite: S)

**Outcome:**
- Compile team roles → `.cursor/rules/*.mdc` with YAML frontmatter (description, alwaysApply, globs).

**Acceptance:**
- [x] Pass: Always-on rules (constitution, project-facts, working-contract)
- [x] Pass: Role-level rules with `alwaysApply: false`
- [x] Pass: YAML frontmatter format valid
- [x] Pass: Deduplicates roles

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F12: Claude Code V2 Target (appetite: S)

**Outcome:**
- Compile team roles → official format: `CLAUDE.md` root + `.claude/rules/*.md`.

**Acceptance:**
- [x] Pass: Generates `CLAUDE.md` at project root
- [x] Pass: Generates `.claude/rules/<role>.md` per role
- [x] Pass: CLAUDE.md references all role rule files
- [x] Pass: Deduplicates roles

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F13: Antigravity Compile Target (appetite: S)

**Outcome:**
- Atomic capability-level split: mỗi capability → 1 SKILL.md file riêng trong `.agents/skills/`.
- `[TL-ARCH] → .agents/skills/tech-lead--arch/SKILL.md` per BRD §15.1.

**Acceptance:**
- [x] Pass: 1 capability = 1 skill folder
- [x] Pass: Folder names match BRD §15.1 convention
- [x] Pass: YAML frontmatter (name, description)
- [x] Pass: Budget included in each skill
- [x] Pass: Deduplicates roles

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

## F14: Eval Harness Output (appetite: M)

**Outcome:**
- Eval-ready structure: `evals/rubric.md` + `evals/cases/*.md` + `evals/expected/*.md`
- Rubric from CONSTITUTION rules + capability budgets
- Cases per project type (Production: breaking change guard, MVP: speed vs quality)

**Acceptance:**
- [x] Pass: Rubric includes 8 core rules + budget table + quality criteria
- [x] Pass: 4-5 cases generated per project type
- [x] Pass: Expected patterns with anti-patterns
- [x] Pass: Pluggable into any eval runner

**Status:** DONE
**Owner:** Tech Lead
**Assigned:** DEV

---

_Thêm features mới bên dưới. TL là người duy nhất được add/reorder features._
