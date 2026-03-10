# North Star — StackMoss Agent Team Config

_Generated from BRD v1.0. Cập nhật bằng tay khi direction thay đổi._

**Ai dùng:** Vibe coder, biz man, solo founder, dev team nhỏ — những người dùng AI agent để ship product nhưng thiếu governance cho agent team.

**Vấn đề cần giải quyết:** AI code nhanh nhưng thiếu ranh giới feature → drift, burn token, config phình. Agent tự gen skill → generic, thiếu domain knowledge. Config không tự cập nhật đúng cách → append vô hạn → agent confused.

**Success signal:** User có agent team hoạt động trong < 10 phút. Config không phình sau nhiều patch cycles. Feature Cycles chạy mượt không cần sprint ceremony.

**Constraints:**
- Open source core, không cần API key
- LLM-minimal (BYO-LLM optional)
- Replace-only config updates
- Safe by default (suggest-only)

**Phạm vi v1:**
- `stackmoss new` (Fast + Interview mode)
- Output 5 file core + README
- Compile target: Claude Code
- BYO-LLM optional
