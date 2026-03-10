# StackMoss — BRD: Agent Team Config
**File:** `stackmoss-agent-config-BRD-v1.0.md`
**Version:** v1.0 (Complete — tổng hợp từ toàn bộ thảo luận Claude + OpenAI)
**Language:** Vietnamese
**Status:** Ready for dev review

---

## 0) Mục tiêu tài liệu

BRD này cover **toàn bộ lifecycle** của StackMoss Agent Team Config:
- Phase A: Idea-first Bootstrap (chưa có repo)
- Phase B: Repo Migration (đã có repo)
- Phase C: Operational (đang chạy, self-improving)

Không phải spec kỹ thuật. Không phải implementation guide. Là **product requirements** đủ để dev bắt đầu build.

---

## 1) Tóm tắt 1 câu

StackMoss cung cấp CLI pipeline để tạo và maintain **agent team config** — một đội agent có roles rõ ràng, governance tối thiểu, và khả năng tự calibrate theo từng project — giúp biz man lẫn developer ship theo **Feature Cycles** mà không cần ceremony sprint, không cần hiểu config kỹ thuật.

---

## 2) Bối cảnh & Painpoint

### 2.1 Painpoint cốt lõi

**Với vibe coder / biz man năm 2026:**
- AI code nhanh, debug tốt, nhưng thiếu ranh giới feature → drift, burn token vô hạn, config phình dần.
- Agent tự gen skill trong project → generic, thiếu domain knowledge, không có governance.
- Mỗi repo có path khác nhau, command khác nhau → agent test rất nhiều lệnh mới chạy đúng.
- Đi tìm skill trên marketplace → khó đọc, không biết có phù hợp không.

**Vấn đề root cause:**
Config không tự cập nhật đúng cách → append vô hạn → file phình → agent bị confused → phải viết lại từ đầu.

### 2.2 Mục tiêu kinh doanh

- Time-to-first-ship: user có agent team hoạt động được trong < 10 phút.
- Không ép user hiểu toolchain/config; họ chỉ trả lời câu hỏi constraint-level.
- Open source core → không yêu cầu API key → không có trust barrier.
- Tạo knowledge graph qua thời gian để giá trị tăng dần.

---

## 3) Design Principles (không thương lượng)

1. **Speed-first, not process-first:** StackMoss là "speed rails", không phải "process police". Không ép user viết roadmap/scope kỹ thuật trước khi ship.
2. **No silent assumptions:** Mọi thứ chưa biết phải ghi vào `OPEN_QUESTIONS.md`, không tự infer quyết định quan trọng.
3. **LLM-minimal:** Mặc định không cần LLM. BYO-LLM chỉ là enhancement cho docs.
4. **Deterministic decision tree:** Chọn pack/role bằng logic code, không dùng LLM cho logic.
5. **Replace-only + budget:** Config không được phép phình theo thời gian. Mọi update phải replace, không append.
6. **Safe by default:** Suggest-only, deny destructive tools ở free tier.
7. **Human-editable source of truth:** User chỉ cần edit `team.md` — compile output là generated, không cần chạm.
8. **Vision-first (Source of Trust):** Trước khi gen agent team config, user phải có **product vision rõ ràng** — tối thiểu là trả lời đủ intake questions để generate `NORTH_STAR.md`. Nếu user chưa rõ product vision → StackMoss **phải hướng dẫn user chốt vision** qua intake flow trước, không được gen team.md hay bất kỳ config nào khi chưa có vision confirmed. Thứ tự bắt buộc: **Vision (via intake) → NORTH_STAR.md → Agent Team Config → Feature Cycles → Ship.** Đối với StackMoss product development: BRD là authority doc — mọi implementation phải truy về BRD sections tương ứng.

---

### 3.1) StackMoss Product NON_GOALS

> Những gì StackMoss **không** làm — để tránh scope creep trong quá trình development.

- Không manage agent runtime (chỉ generate config)
- Không validate source code quality (chỉ validate config structure)
- Không auto-commit/push (suggest-only)
- Không support multiple concurrent projects trong v0.1
- Không là agent orchestrator — chỉ là config generator + compile layer

---

## 4) Methodology: Feature Cycles (Shape Up / FDD-ish)

**Không dùng sprint/roadmap timeline-based.**

Thay vào đó:
- `FEATURES.md`: danh sách feature theo priority.
- Mỗi feature có **appetite** (S/M/L) + outcome + non-goals + acceptance.
- Agent team nhận 1 feature → ship → cập nhật status → feature tiếp theo.
- Không có backlog ceremony, không có sprint review.

**Tại sao phù hợp năm 2026:** AI ship cực nhanh. Vấn đề không phải tốc độ mà là ranh giới. Feature appetite thay thế sprint vì nó định nghĩa "đủ để ship" không phải "đủ theo calendar".

---

## 5) Đối tượng người dùng (Personas)

| Persona | Mô tả | Cần gì nhất |
|---|---|---|
| **P1 — Biz-led** | Hiểu nghiệp vụ, không rành tech | Spec rõ, phân vai agent, không cần biết config |
| **P2 — Dev-led** | Biết code, thiếu requirement clarity | BA-lite, acceptance criteria, scope control |
| **P3 — Solo founder** | Biz + dev, muốn ship nhanh | Governance vừa đủ, QA nhẹ |
| **P4 — Newbie** | Chưa rõ cả biz lẫn tech | Step-by-step, guardrails mạnh, suggest-only |

---

## 6) State Machine: 3 trạng thái của Agent Team

```
GLOBAL ──[inject]──▶ MIGRATING ──[resolve + promote]──▶ OPERATIONAL
                                                              │
                                                    [upgrade] merge CONSTITUTION only
                                                    [patch apply] replace-only + budget gate
```

### State GLOBAL
- Template thuần, chưa biết gì về project cụ thể.
- Chứa: best practices chung + governance rules + role templates.
- Source: `~/.stackmoss/agents/` (global install).

### State MIGRATING
- Đã inject vào project cụ thể, đang calibrate.
- Được phép: đọc repo structure, detect tech stack, ghi vào `.agents/` trong project.
- Không được phép: chạy code, modify source files, external API calls, push commit.
- Output: `MIGRATION_REPORT.md` với 3 tầng: facts / hypotheses / questions.

### State OPERATIONAL
- Research mode bị lock.
- Chỉ học từ kinh nghiệm vận hành thực tế (xem Section 12: Patch Proposal).
- Update chỉ qua `stackmoss patch apply` với replace-only + budget gate.

---

## 7) CLI Commands (đầy đủ)

```
stackmoss new <project_name>    Phase A: Tạo workspace idea-first (chưa có repo)
stackmoss inject                Phase B: Scan repo, tạo MIGRATION_REPORT
stackmoss resolve               Phase B: Trả lời open questions (CLI Y/N)
stackmoss promote --confirm     Phase B: Hard criteria gate → lock OPERATIONAL
stackmoss run <alias>           Phase C: Wrapper → tạo Patch Proposal nếu fail
stackmoss check                 Phase C: Sanity check → Patch Proposal
stackmoss patch apply           Phase C: Apply patch (replace-only + budget gate)
stackmoss upgrade               Phase C: Merge CONSTITUTION only, giữ nguyên facts
```

---

## 8) Phase A: Idea-first Bootstrap (`stackmoss new`)

### 8.1 CLI Intake — Chọn Mode

Khi chạy `stackmoss new my-app`, hiển thị ngay:

```
Bạn muốn setup nhanh hay chi tiết?
[F] Fast    ~3 phút, 6 câu
[I] Interview   ~10 phút, 12 câu, team tốt hơn
```

> Không có default — user phải chọn chủ động.

---

### 8.2 Fast Mode (6 câu)

Tất cả câu đều "dễ trả lời", không cần hiểu tech:

| # | Câu hỏi | Lựa chọn |
|---|---|---|
| Q1 | Bạn là ai trong dự án này? | Biz lead / Dev lead / Solo / Không rõ |
| Q2 | Sản phẩm phục vụ ai? | Cá nhân / SME / Enterprise / Cộng đồng |
| Q3 | Phạm vi địa lý? | Nội bộ / VN / Global |
| Q4 | Kênh chính? | Web / Mobile / Chat (Zalo/FB/IG) / API |
| Q5 | Data nhạy cảm? | Không / PII / Tài chính / Compliance |
| Q6 | Feature đầu tiên muốn ship là gì? | (1 câu tự do) |
| Q6b | *(sub-question Q6)* Cần bao lâu để ship? | [S] Vài ngày / [M] 1-2 tuần / [L] Hơn 2 tuần |

**Fast mode completeness gate:** Chỉ check Q5 (data sensitivity). Nếu thiếu → hỏi lại Q5 một lần. Không check outcome/non-goals (tránh biến Fast thành Interview).

**Câu bỏ qua:** Ghi vào `OPEN_QUESTIONS.md`, không infer, không assume.

---

### 8.3 Interview Mode (12 câu)

**BLOCK 1 — Bối cảnh biz (4 câu)**

| # | Câu hỏi | Lựa chọn |
|---|---|---|
| Q1 | Bạn là ai trong dự án? | Biz lead / Dev lead / Solo / Không rõ |
| Q2 | Sản phẩm phục vụ ai? | Cá nhân / SME / Enterprise / Cộng đồng |
| Q3 | Phạm vi địa lý? | Nội bộ / VN / Global |
| Q4 | Monetization? | Free / Subscription / Usage-based / Chưa biết |

**BLOCK 2 — Constraint kỹ thuật (4 câu)**

| # | Câu hỏi | Lựa chọn |
|---|---|---|
| Q5 | Kênh chính? | Web / Mobile / Chat (Zalo/FB/IG) / API |
| Q6 | Data nhạy cảm? | Không / PII / Tài chính / Compliance |
| Q7 | Deploy ở đâu? | Local / VPS / Cloud / Chưa biết |
| Q8 | Budget để ship v1? | Rẻ nhất / Cân bằng / Nhanh nhất |

**BLOCK 3 — Team & velocity (4 câu)**

| # | Câu hỏi | Lựa chọn |
|---|---|---|
| Q9 | Ai maintain sau này? | Một mình / Team nhỏ / Outsource |
| Q10 | Ưu tiên? | Ship nhanh / Ship ổn định / Cả hai |
| Q11 | Nguồn dữ liệu chính ở đâu? | Sheets/Docs / DB / CRM / API bên ngoài / Chưa có |
| Q12 | Feature đầu tiên muốn ship? | (1 câu tự do + sub-question appetite S/M/L) |

**Interview mode completeness gate:** Check đầy đủ — có "for who", có outcome đo được, có ít nhất 1 non-goal. Nếu thiếu → hỏi thêm tối đa 2 câu follow-up targeted.

---

### 8.4 Output Files — Phase A

| File | Ai tạo | Fast | Interview | Ghi chú |
|---|---|---|---|---|
| `stackmoss.config.json` | Generated | ✅ | ✅ | Machine-readable, state + budgets |
| `team.md` | Generated | ✅ | ✅ | Source of truth, human-editable |
| `NORTH_STAR.md` | Generated | ✅ | ✅ | 10-15 dòng, ai/vấn đề/outcome/constraints |
| `NON_GOALS.md` | Generated | ✅ | ✅ | 3 dòng "v1 không làm gì" |
| `FEATURES.md` | Generated | ✅ | ✅ | F1 với appetite từ Q6 |
| `README_AGENT_TEAM.md` | Generated | ✅ | ✅ | Hướng dẫn dùng agent team |
| `OPEN_QUESTIONS.md` | Generated | Nếu có câu skip | Nếu có câu skip | Chỉ tạo khi cần |

---

## 9) Output File Schemas (đầy đủ)

### 9.1 `stackmoss.config.json`

```json
{
  "schemaVersion": "1.0",
  "state": "GLOBAL",
  "userType": "BizLed",
  "projectType": "MVP",
  "language": "vi",
  "targets": ["ClaudeCode"],
  "mode": "suggest_only",
  "intakeMode": "fast",
  "budgets": {
    "capabilityDefault": 120,
    "capabilityMax": 240,
    "teamTotalMax": 1800,
    "migrationReport": 700
  },
  "thresholds": {
    "promoteRequiresZeroQuestions": true,
    "promoteRequiresVerifiedAlias": true,
    "minHypothesisConfidence": 0.8,
    "patchTriggerMinRepeat": 2
  },
  "autoAddRoles": {
    "securityLite": false,
    "devOpsLite": false
  }
}
```

---

### 9.2 `team.md` — Full Schema (Source of Truth)

```markdown
# Team Config — [Project Name]
_Generated by StackMoss vX.X | State: GLOBAL | Target: ClaudeCode_

---

## CONSTITUTION
> Phần này là "luật chung" — stackmoss upgrade chỉ merge section này.
> Không được xóa hoặc rename section header.

### Governance Rules
- replace-only: true (không append vào config)
- budget-enforcement: hard (vượt budget → trim trước khi ghi)
- suggest-only: true (đề xuất hành động, không tự thực hiện)
- no-destructive-tools: true (không rm -rf, không drop table, không force push)

### Update Triggers (khi nào được phép patch)
- Command trong config fail với exit code ≠ 0 VÀ đã tìm được command đúng
- Path trong config không tồn tại VÀ đã resolve được path đúng
- Cùng lỗi lặp lại ≥ 2 lần trong session với cùng nguyên nhân gốc
- Tech Lead explicit ra lệnh "ghi nhớ điều này"

### Patch Rules
- Tìm section/capability chứa thông tin cũ → rewrite section đó
- Content length sau patch phải ≤ content length trước patch
- Không được tạo section mới để lưu note/log
- Sau khi patch → verify lại command/path đó hoạt động

---

## ROLES

### [TL] Tech Lead
lead: true
ceremony: medium
description: >
  Quản lý kiến trúc, review code, maintain CONTEXT.md và FEATURES.md,
  break down task từ feature sang subtasks, resolve conflict giữa agents.

#### Capabilities
- [TL-ARCH] Architecture decisions & ADR
  budget: 220
  priority: high
  trigger: "Use when architecture decision or design pattern needed"
  do_not_use: "Do not use for routine implementation tasks"

- [TL-REVIEW] Code review & merge gates
  budget: 180
  priority: high
  trigger: "Use when code needs review before merge/deploy"
  do_not_use: "Do not use for first-draft implementation"

- [TL-CONTEXT] Maintain CONTEXT.md & FEATURES.md
  budget: 150
  priority: medium
  trigger: "Use after completing a feature or major decision"
  do_not_use: "Do not use mid-task"

- [TL-PLAN] Break down features & assign subtasks
  budget: 160
  priority: high
  trigger: "Use at start of each feature cycle"
  do_not_use: "Do not use during implementation"

---

### [BA] Business Analyst
_Chỉ có ở BizLed pack_
lead: false
ceremony: medium

#### Capabilities
- [BA-REQ] Requirements elicitation & clarification
  budget: 180
  priority: high
  trigger: "Use when requirements are unclear or conflicting"
  do_not_use: "Do not use for technical decisions"

- [BA-AC] Acceptance criteria writing
  budget: 150
  priority: high
  trigger: "Use at start of feature to define pass/fail"
  do_not_use: "Do not use during implementation"

---

### [DEV] Developer
lead: false
ceremony: low

#### Capabilities
- [DEV-IMPL] Feature implementation
  budget: 200
  priority: high
  trigger: "Use when implementing code for a feature"
  do_not_use: "Do not use for architecture decisions"

- [DEV-ENV] Environment & command knowledge
  budget: 160
  priority: high
  trigger: "Use when running commands, checking paths, managing env"
  do_not_use: "Do not use for business logic decisions"
  _note: "Phần này được patch nhiều nhất — giữ commands đúng cho env này"

- [DEV-DEBUG] Debug & error resolution
  budget: 150
  priority: medium
  trigger: "Use when encountering errors or unexpected behavior"
  do_not_use: "Do not use for new feature planning"

---

### [QA] Quality Assurance
lead: false
ceremony: low

#### Capabilities
- [QA-TEST] Test & verify acceptance criteria
  budget: 150
  priority: high
  trigger: "Use after implementation to verify feature works"
  do_not_use: "Do not use during planning"

- [QA-REGRESSION] Regression checklist
  budget: 120
  priority: medium
  trigger: "Use before marking feature DONE"
  do_not_use: "Do not use for new feature development"

---

### [DOCS] Documentation
lead: false
ceremony: low

#### Capabilities
- [DOCS-README] README & runbook updates
  budget: 130
  priority: low
  trigger: "Use after feature is DONE"
  do_not_use: "Do not use during implementation"

- [DOCS-CHANGELOG] Changelog
  budget: 100
  priority: low
  trigger: "Use at end of feature cycle"
  do_not_use: "Do not use mid-feature"

---

### [SEC] Security-lite
_Auto-add khi Q5/Q6 = PII | Finance | Compliance_
lead: false
ceremony: low

#### Capabilities
- [SEC-SCAN] Basic security check
  budget: 140
  priority: high
  trigger: "Use before any feature touching auth, PII, or financial data"
  do_not_use: "Do not use for non-sensitive features"

---

### [OPS] DevOps-lite
_Auto-add khi deploy target = VPS | Cloud AND audience = SME | Enterprise_
lead: false
ceremony: low

#### Capabilities
- [OPS-DEPLOY] Deploy & infra checks
  budget: 140
  priority: medium
  trigger: "Use before deploy or infra changes"
  do_not_use: "Do not use for feature development"

---

## WORKING CONTRACT

### Definition of Done (per feature)
- [ ] Acceptance criteria trong FEATURES.md pass
- [ ] QA regression checklist pass
- [ ] TL review approved
- [ ] FEATURES.md status updated → DONE
- [ ] CHANGELOG cập nhật

### Escalation Rules
- Nếu agent bị stuck > 3 lần với cùng vấn đề → báo cáo lên TL
- Nếu TL không resolve → ghi vào OPEN_QUESTIONS.md, chờ human input
- Không tự expand scope của feature đang làm

### Review Gates
- Trước merge: DEV → QA → TL
- Trước deploy: TL + OPS-lite (nếu có)
- Trước feature start: TL break down → BA confirm AC (nếu BizLed)

---

## PROJECT_FACTS
> Section này được inject và update bởi stackmoss inject/patch.
> stackmoss upgrade KHÔNG được touch section này.

### Environment (populated by inject)
- Package manager: TBD
- Run command: TBD
- Build command: TBD
- Test command: TBD
- Known paths: TBD

### Tech Stack (populated by inject)
- Framework: TBD
- Database: TBD
- Deploy target: TBD

### Known Issues (populated by patch)
_(trống khi init, được update dần)_
```

---

### 9.3 `FEATURES.md`

```markdown
# FEATURES — [Project Name]
_Managed by Tech Lead. Cập nhật sau mỗi feature cycle._

---

## F1: [Feature name từ Q6/Q12] (appetite: S|M|L)

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
```

---

### 9.4 `NORTH_STAR.md`

```markdown
# North Star — [Project Name]
_Generated from intake. Cập nhật bằng tay khi direction thay đổi._

**Ai dùng:** [từ Q1/Q2]
**Vấn đề cần giải quyết:** [từ Q12/Q6]
**Success signal:** [khi nào coi là thành công]
**Constraints:** [địa lý, data sensitivity, budget, deploy]
**Phạm vi v1:** [những gì chắc chắn có]
```

---

### 9.5 `MIGRATION_REPORT.md` (Phase B)

```markdown
# Migration Report — [Project Name]
_Generated by stackmoss inject. Reviewed by human before promote._

## FACTS (confidence: high)
> Những gì đã được verify từ file thực tế trong repo.
- Package manager: npm (from package.json)
- Run command: `npm run dev` (from package.json scripts)
- Framework: Next.js 14 (from package.json dependencies)

## HYPOTHESES (confidence: medium, cần verify)
> Những gì StackMoss suy đoán nhưng chưa chắc.
- Monorepo: YES (confidence: 72%) — thấy /apps/ và /packages/ folders
- Database: PostgreSQL (confidence: 65%) — thấy pg trong dependencies

## OPEN QUESTIONS (cần human confirm trước khi promote)
- [ ] Deploy target là Vercel hay Coolify? (ảnh hưởng OPS config)
- [ ] Có auth layer không? (ảnh hưởng SEC-lite)
- [ ] `/apps/web` hay `/apps/api` là entry point chính?

_Sau khi resolve hết OPEN QUESTIONS → chạy `stackmoss promote --confirm`_
```

---

### 9.6 `README_AGENT_TEAM.md`

```markdown
# Hướng Dẫn Dùng Agent Team StackMoss
_Đây là tài liệu quan trọng nhất. Đọc trước khi bắt đầu._

---

## Đây là gì?

`team.md` là "sổ tay đội agent" của dự án bạn.  
Nó định nghĩa: ai làm gì, làm theo quy tắc nào, khi nào thì xong.

Bạn không cần đọc hết. Chỉ cần biết cách dùng.

---

## Bắt đầu nhanh (3 bước)

**Bước 1 — Chọn feature để làm**
Mở `FEATURES.md`. Chọn F1 (feature đầu tiên).

**Bước 2 — Giao việc cho Tech Lead**
Trong IDE/agent runtime của bạn, nói:

> "Tech Lead, hãy break down F1 thành subtasks và assign cho team."

Tech Lead sẽ phân chia việc cho Dev, QA, Docs.

**Bước 3 — Ship**
- Dev implement subtasks.
- QA verify acceptance criteria.
- Tech Lead review và approve.
- Khi xong: Tech Lead cập nhật `FEATURES.md` → F1 status = DONE.

Sau đó lặp lại với F2, F3...

---

## Quy tắc quan trọng

**Không append config:**  
Nếu agent đề xuất "thêm note vào config" → từ chối. Dùng patch replace thay thế.

**Khi agent bị stuck:**  
```
stackmoss check
```
Tool này phát hiện vấn đề và tạo patch proposal để fix.

**Khi có lỗi lạ:**  
```
stackmoss run <lệnh bị lỗi>
```
Wrapper sẽ log lỗi và đề xuất cách fix đúng cho env này.

---

## Khi dự án có repo thật

Nếu bạn đã bắt đầu code, chạy:
```
stackmoss inject     # Đọc repo, calibrate team config
stackmoss resolve    # Trả lời câu hỏi còn thiếu
stackmoss promote --confirm  # Lock config vào OPERATIONAL mode
```

---

## Các files cần biết

| File | Mục đích | Ai chỉnh |
|---|---|---|
| `team.md` | Sổ tay đội agent | Bạn (nếu muốn) |
| `FEATURES.md` | Danh sách feature | Tech Lead + Bạn |
| `NORTH_STAR.md` | Định hướng dự án | Bạn |
| `NON_GOALS.md` | Những gì KHÔNG làm | Bạn |
| `OPEN_QUESTIONS.md` | Câu hỏi chưa trả lời | Bạn cần confirm |
| `stackmoss.config.json` | Cài đặt hệ thống | Không chỉnh tay |
```

---

### 9.7 `OPEN_QUESTIONS.md`

```markdown
# Open Questions — [Project Name]
_Tạo khi có câu hỏi bị skip hoặc chưa được confirm._
_Xử lý trước khi promote --confirm (nếu đang ở MIGRATING)._

## Chưa được trả lời (cần bạn confirm)
- [ ] Deploy target là gì? (ảnh hưởng đến OPS config)
- [ ] Có dùng auth/login không? (ảnh hưởng đến SEC config)

## Đã được trả lời
_(sẽ được move xuống đây sau khi confirm)_
```

---

## 10) Framework Packs (2D Matrix: UserType × ProjectType)

### 10.1 Overlay Compose

Không viết 16 templates — compose từ 2 overlay sets:

**UserType overlays** (xác định ceremony + role leadership):
- `BizLed.md` → BA là required, TL ceremony cao, spec-first
- `DevLed.md` → BA là lite/optional, TL focus architecture
- `Solo.md` → TL kiêm PM, ceremony thấp
- `Newbie.md` → TL guide mode, suggest-only, nhiều guardrails

**ProjectType overlays** (xác định QA rigor + optional roles):
- `MVP.md` → QA light, no DevOps, fast acceptance
- `Production.md` → QA strong, DevOps-lite, regression bắt buộc
- `InternalTool.md` → QA medium, no SEC-lite trừ khi có PII
- `LibraryAPI.md` → QA strong, docs quan trọng, versioning

### 10.2 Role Mapping Table

| UserType | ProjectType | Roles tạo ra |
|---|---|---|
| BizLed | MVP | TL, BA, DEV, QA(light), DOCS |
| BizLed | Production | TL, BA, DEV, QA(strong), OPS(light), DOCS |
| DevLed | MVP | TL, DEV, QA, DOCS (BA-lite trong TL) |
| DevLed | Production | TL, DEV, QA(strong), OPS, DOCS |
| Solo | MVP | TL, DEV, QA(light) |
| Solo | Production | TL, DEV, QA, DOCS |
| Newbie | any | TL(guide), DEV(small), QA(checklist), DOCS |

**Auto-add rules (không hỏi user):**
- Q5 hoặc Q6 = PII / Finance / Compliance → thêm SEC-lite
- Q7 = VPS / Cloud VÀ Q2 = SME / Enterprise → thêm OPS-lite

---

## 11) BYO-LLM (Optional, Local-only)

### Nguyên tắc
- Key chỉ ở máy user: env var / `.env` local / keychain.
- Không log, không ghi file, không commit key.
- LLM chỉ được dùng để rewrite/clarify docs, không được thêm scope mới.

### Prompt Template Table

| File | Task | Input | Max tokens | Constraint |
|---|---|---|---|---|
| `NORTH_STAR.md` | Rewrite for clarity | Intake answers | 350 | Không thêm scope mới |
| `FEATURES.md` | Draft F1 | Q6/Q12 + constraints | 300 | Output 1 feature với appetite |
| `NON_GOALS.md` | Draft non-goals | Constraints + inferred | 150 | 3 dòng, không overreach |
| `OPEN_QUESTIONS.md` | Tóm tắt câu hỏi còn thiếu | Fast answers + defaults | 200 | Chỉ facts missing, không infer |

**Rule cứng:** Thiếu input → hỏi follow-up, không bịa.

---

## 12) Phase C: Operational — Self-Improving với Constraints

### 12.1 Patch Proposal Flow

```
stackmoss run <alias>
  → Nếu success: không làm gì
  → Nếu fail: log error + tìm fix + tạo Patch Proposal

stackmoss check
  → Verify paths, commands, config sanity
  → Nếu có issue: tạo Patch Proposal

User/TL review Patch Proposal
  → Apply: stackmoss patch apply
  → Reject: stackmoss patch reject (ghi lý do)
```

### 12.2 Patch Trigger Rules (hard-coded, không để agent tự quyết)

**DEV agent được trigger patch KHI:**
- Command trong `[DEV-ENV]` fail với exit code ≠ 0 VÀ đã tìm được command đúng.
- Path reference trong config không tồn tại VÀ đã resolve được path đúng.
- Cùng một lỗi xuất hiện ≥ 2 lần trong session với cùng nguyên nhân gốc.
- Tech Lead explicit ra lệnh "ghi nhớ điều này".

**KHÔNG patch khi:**
- Lỗi là logic error (không phải env/config error).
- Đây là lần đầu tiên gặp lỗi (chưa đủ signal).
- Fix chưa được verify chạy thật.

### 12.3 Patch Apply Rules

```
Tìm section chứa thông tin cũ → rewrite toàn bộ section đó
Content length sau patch ≤ content length trước patch
Nếu vượt budget → trim content ít quan trọng hơn trước khi ghi
Không tạo section mới để lưu log/note
```

### 12.4 Word Budget per Capability

> **Đơn vị budget: word count** (đếm bằng `wordCount(section_content)`). Không phải LLM tokens.
> Enforce bằng code thuần: nếu vượt budget → trim oldest/least-referenced bullet trước khi ghi.

| Role | Capability | Default budget (words) | Max budget (words) |
|---|---|---|---|
| TL | TL-ARCH | 220 | 280 |
| TL | TL-REVIEW | 180 | 220 |
| TL | TL-CONTEXT | 150 | 180 |
| TL | TL-PLAN | 160 | 200 |
| BA | BA-REQ | 180 | 220 |
| BA | BA-AC | 150 | 180 |
| DEV | DEV-IMPL | 200 | 260 |
| DEV | DEV-ENV | 160 | 200 |
| DEV | DEV-DEBUG | 150 | 180 |
| QA | QA-TEST | 150 | 180 |
| QA | QA-REGRESSION | 120 | 150 |
| DOCS | DOCS-README | 130 | 160 |
| DOCS | DOCS-CHANGELOG | 100 | 130 |
| SEC | SEC-SCAN | 140 | 180 |
| OPS | OPS-DEPLOY | 140 | 180 |

**Team total max: 1800 words**

---

## 13) Phase B: Repo Migration (`stackmoss inject`)

### 13.1 Quyền trong MIGRATING state

**Được phép:**
- Đọc toàn bộ repo structure
- Đọc `package.json`, `requirements.txt`, `Dockerfile`, `README`, config files
- Chạy safe commands: `ls`, `cat`, `find`, `which`
- Ghi vào `.agents/` trong project

**Không được phép:**
- Chạy code
- Modify source files
- External API calls
- Push commit

### 13.2 Promote Criteria (hard, không phải soft "confidence")

`stackmoss promote --confirm` chỉ thành công khi **TẤT CẢ** đúng:

1. `MIGRATION_REPORT.md` không còn item trong "OPEN QUESTIONS" (hoặc user đã chạy `stackmoss resolve` để clear hết).
2. Ít nhất 1 command trong `[DEV-ENV]` đã được verify (free tier: dry-run hoặc command exists; pro tier: chạy thật).
3. Không có hypothesis nào có confidence < 80% được đánh dấu "critical".
4. User gõ đúng flag `--confirm` (không phải Y/N).

Nếu chưa đủ → CLI in ra list việc còn thiếu, không tự promote.

---

## 14) `stackmoss upgrade` — Version Drift Protection

### Problem
StackMoss release version mới với CONSTITUTION update → user đang ở OPERATIONAL state → upgrade thế nào mà không mất operational learnings?

### Rules

```
stackmoss upgrade:
  1. Diff CONSTITUTION section: global mới vs CONSTITUTION trong project
  2. Merge ONLY CONSTITUTION section
  3. Không touch PROJECT_FACTS section
  4. Không touch operational learnings trong [DEV-ENV], [DEV-DEBUG]
  5. Output diff để user review trước khi apply
  6. Yêu cầu user confirm trước khi write

HARD RULE: upgrade không bao giờ overwrite PROJECT_FACTS section.
```

---

## 15) Compile Targets

### 15.1 Atomic Skill Split (cho Antigravity)

Antigravity yêu cầu mỗi skill là atomic. `team.md` dùng capability tags để compile layer tự split:

```
team.md role → compile thành:
[TL-ARCH]    → tech-lead--arch.skill.md
[TL-REVIEW]  → tech-lead--review.skill.md
[TL-CONTEXT] → tech-lead--context.skill.md
[TL-PLAN]    → tech-lead--plan.skill.md
```

### 15.2 Target Mapping Table

| Target | Split level | Format | Scope |
|---|---|---|---|
| Claude Code | Role-level (1 role = 1 file) | `.claude/skills/` | v0.1 |
| Cursor / Roo | Role-level | `.roo/skills/` | v0.1 |
| Antigravity | Capability-level (atomic) | `.agents/skills/` | v0.2 |

User không biết điều này xảy ra. Họ chỉ edit `team.md`. Compile layer handle split logic.

---

## 16) Acceptance Criteria (DONE cho toàn bộ Phase A)

1. `stackmoss new <name>` tạo folder + 5 file core + README mà không cần LLM.
2. Fast mode: 6 câu + completeness gate chỉ check Q5. Không biến thành Interview mode.
3. Interview mode: 12 câu + completeness gate đầy đủ + follow-up có điều kiện (tối đa 2 câu).
4. `team.md` có: CONSTITUTION, ROLES, capability budgets, WORKING CONTRACT, PROJECT_FACTS placeholder.
5. `FEATURES.md` có F1 với appetite S/M/L rõ ràng.
6. `README_AGENT_TEAM.md` tồn tại và user non-tech đọc được.
7. Không có API key bị ghi ra file/log.
8. Câu bị skip → ghi vào `OPEN_QUESTIONS.md`, không infer.
9. Compile ra Claude Code target (1 file per role) chạy được.
10. Ctrl+C bất kỳ lúc nào → không tạo partial files (atomic write: tạo xong hết → write tất cả, hoặc không write gì).
11. Folder đã tồn tại → abort với message rõ, không overwrite silent.
12. Permission error → message rõ ràng, không crash.

---

## 17) Success Metrics

| Metric | Target | Ghi chú |
|---|---|---|
| Time-to-bootstrap (Fast) | < 3 phút | Từ lệnh đến có 5 files |
| Time-to-bootstrap (Interview) | < 10 phút | Từ lệnh đến có đủ files |
| Completion rate | > 80% | Không bỏ dở giữa chừng |
| F1 có appetite rõ | > 90% | Sau bootstrap |
| Patch success rate | > 70% | Patch apply → command/path hoạt động |
| Config inflation rate | 0% | Không được phép tăng sau patch |

---

## 18) Roadmap Sequencing

### v0.1 (free — usable ngay)
- `stackmoss new` (Fast + Interview mode)
- Output 5 file core + README
- Compile 1 target: **Claude Code**
- BYO-LLM optional

### v0.2
- `stackmoss inject` → `MIGRATION_REPORT.md`
- `stackmoss resolve`
- `stackmoss promote --confirm`
- Compile thêm: Cursor / Roo

### v0.3
- `stackmoss run / check` → Patch Proposal pipeline
- `stackmoss patch apply`
- `stackmoss upgrade` (CONSTITUTION-only merge)

### v0.4 (Antigravity)
- Atomic capability split
- Compile target: Antigravity

---

## Appendix A: Edge Cases

| Case | Xử lý |
|---|---|
| User không biết trả lời câu nào | Skip → `OPEN_QUESTIONS.md`, dùng safe default chỉ cho skeleton |
| User muốn đổi hướng sau khi tạo | Edit `NORTH_STAR.md` + `FEATURES.md` tay; (future: `stackmoss reframe`) |
| BYO-LLM thiếu key | Warning → fallback no-llm, tiếp tục |
| LLM khác nhau (OpenAI/Anthropic/local) | BYO-LLM pluggable, chỉ cần "generate text" interface |
| Repo là monorepo | MIGRATION_REPORT ghi hypothesis, hỏi confirm trước promote |
| Promote criteria chưa đủ | CLI in list việc còn thiếu, không tự promote |

---

## Appendix B: OPEN_QUESTIONS.md Lifecycle

```
Tạo khi:   Có câu skip trong intake, hoặc hypothesis chưa confirm trong inject
Update khi: `stackmoss resolve` xử lý từng item → move xuống "Đã trả lời"
Xóa khi:   Tất cả items đã resolved (file trống → xóa file)

Promote gate:
  Nếu OPEN_QUESTIONS.md tồn tại + có unresolved items
  → `stackmoss promote --confirm` bị BLOCK
  → CLI in ra danh sách items cần resolve
```

---

*End of BRD v1.0*
*Tổng hợp từ: Claude + OpenAI multi-round debate*
*Các section đã được validate: 2D matrix, team.md schema, promote hard criteria, patch trigger rules, upgrade isolation, atomic compile*
