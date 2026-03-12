# 🚀 StackMoss — Hướng dẫn Test từ A-Z

## Bước 0: Chuẩn bị

```bash
# Cần Node.js >= 18
node --version

# Nếu đã có bản cũ, gỡ trước
npm uninstall -g stackmoss
```

---

## Bước 1: Cài StackMoss

```bash
npm install -g stackmoss
```

Verify:
```bash
stackmoss --version
# → 0.5.0

stackmoss --help
# → Hiện danh sách commands
```

---

## Bước 2: Tạo Agent Team cho dự án mới

### 2.1 Tạo folder test

```bash
mkdir E:\test-stackmoss
cd E:\test-stackmoss
```

### 2.2 Chạy StackMoss

```bash
stackmoss new my-app
```

### 2.3 Trả lời 7 câu hỏi

Trả lời theo flow — không cần đúng/sai, chỉ cần test:

| # | Câu hỏi | Gợi ý trả lời |
|:---|:---|:---|
| Q1 | Bạn là ai? | `Solo dev` |
| Q2 | Quy mô doanh nghiệp? | `sme` |
| Q3 | Thị trường? | `vn` |
| Q4 | Loại sản phẩm? | `web` |
| Q5 | Có dữ liệu nhạy cảm? | `pii` |
| Q6 | Feature đầu tiên? | `Login page` |
| Q6b | Appetite? | `S` |
| Q_PT | Project type? | `Production` |

### 2.4 Kiểm tra output

```bash
cd my-app

# Xem toàn bộ files được tạo
dir

# Kiểm tra team.md (source of truth)
type team.md

# Kiểm tra CLAUDE.md (Claude Code đọc file này)
type CLAUDE.md

# Kiểm tra role rules
dir .claude\rules

# Kiểm tra eval harness
dir evals
dir evals\cases
dir evals\expected
type evals\rubric.md
```

**Expected output structure:**
```
my-app/
├── team.md                     ← Source of truth — roles & capabilities
├── FEATURES.md                 ← Feature tracking (appetite S/M/L)
├── NORTH_STAR.md               ← Project vision
├── NON_GOALS.md                ← What NOT to build
├── OPEN_QUESTIONS.md            ← Unresolved decisions (nếu có)
├── README_AGENT_TEAM.md        ← Hướng dẫn dùng team agent
├── stackmoss.config.json       ← State machine config
│
├── CLAUDE.md                   ← Claude Code root instructions
├── .claude/rules/              ← Per-role rules
│   ├── tl.md
│   ├── dev.md
│   ├── qa.md
│   └── sec.md
│
└── evals/                      ← Eval harness
    ├── rubric.md               ← 8 core rules + budget table
    ├── cases/                  ← Test scenarios
    │   ├── case-01-feature-impl.md
    │   ├── case-02-code-review.md
    │   ├── case-03-no-assumption.md
    │   ├── case-04-patch-budget.md
    │   └── case-05-breaking-change.md   (Production only)
    └── expected/               ← Golden output patterns
        ├── case-01-feature-impl.md
        └── ...
```

---

## Bước 3: Test với Claude Code

### 3.1 Mở project trong VS Code / Cursor

```bash
code .
```

### 3.2 Mở Claude Code (hoặc Cursor)

Claude Code sẽ **tự động đọc** `CLAUDE.md` khi bắt đầu session.

### 3.3 Test thử các scenario

**Test 1: Agent follow rules**
```
Implement login page with email/password. AC: validates email format, shows error, submits to /api/auth/login
```
→ Kỳ vọng: Agent chỉ làm đúng AC, không tự thêm "password reset", "remember me"

**Test 2: No Silent Assumptions**
```
Add caching to the app
```
→ Kỳ vọng: Agent HỎI "cache gì? Redis? in-memory? API responses?" thay vì tự assume

**Test 3: Budget discipline**
→ Check xem agent response có vượt word budget trong rubric.md không

---

## Bước 4: Test với dự án đã có repo

### 4.1 CD vào repo đang có

```bash
cd E:\MyExistingProject
```

### 4.2 Chạy inject (scan repo)

```bash
stackmoss inject
```

→ Tạo `MIGRATION_REPORT.md` với:
- **Facts:** Những gì chắc chắn từ code scan
- **Hypotheses:** Phỏng đoán (có confidence %)
- **Questions:** Cần anh trả lời trước khi dùng

### 4.3 Trả lời câu hỏi

```bash
stackmoss resolve
```

→ Interactive Q&A cho mỗi question trong MIGRATION_REPORT

### 4.4 Promote lên OPERATIONAL

```bash
stackmoss promote --confirm
```

→ 4 hard criteria:
1. Questions = 0
2. Ít nhất 1 alias verified
3. Config valid
4. User explicit confirm

### 4.5 Chạy operational commands

```bash
stackmoss check           # Validate config + word budgets
stackmoss run test        # Execute "npm test" via alias
stackmoss patch list      # Xem pending patches
```

---

## Compile Target khác

### Dùng Cursor thay Claude Code

Trước khi chạy `stackmoss new`, edit `stackmoss.config.json`:
```json
{
  "compileTarget": "Cursor"
}
```

Output: `.cursor/rules/*.mdc` (YAML frontmatter)

### Dùng Antigravity (atomic split)

```json
{
  "compileTarget": "Antigravity"
}
```

Output: `.agents/skills/<role>--<cap>/SKILL.md` (1 file per capability)

---

## Troubleshooting

| Vấn đề | Fix |
|:---|:---|
| `stackmoss: command not found` | `npm install -g stackmoss` |
| Permission denied | Terminal as Admin |
| `ENOENT` error | Chạy trong thư mục trống hoặc project root |
| Output không có `.claude/` | Check `stackmoss.config.json` compileTarget |
| Files không hiện trong Cursor | Restart IDE |

---

## Tóm tắt commands

```bash
stackmoss new <name>          # Tạo project + intake + generate + compile
stackmoss inject              # Scan existing repo → MIGRATION_REPORT
stackmoss resolve             # Trả lời câu hỏi từ scan
stackmoss promote --confirm   # MIGRATING → OPERATIONAL
stackmoss run <alias>         # Execute command, auto-patch on fail
stackmoss check               # Config + budget validation
stackmoss patch list/apply/reject
stackmoss upgrade [--apply]   # Update constitution only
```
