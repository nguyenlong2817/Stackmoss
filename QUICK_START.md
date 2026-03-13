# StackMoss - Huong dan test nhanh

Tai lieu nay dung cho 2 truong hop:

- Tao mot du an moi bang StackMoss
- Dua StackMoss vao mot repo da co san

Neu ban da co BRD, hay khoa BRD truoc khi giao feature implementation dau tien.

---

## 1. Cai dat

```bash
npm install -g stackmoss
stackmoss --version
stackmoss --help
```

---

## 2. Test voi du an moi

### 2.1 Tao project

```bash
mkdir E:\test-stackmoss
cd E:\test-stackmoss
stackmoss new my-app
cd my-app
```

### 2.2 Kiem tra output co ban

```bash
dir
type team.md
type FEATURES.md
type NORTH_STAR.md
type README_AGENT_TEAM.md
dir .claude\skills
dir .cursor\skills
dir .agent
```

Ky vong:

- `team.md` la source of truth
- `FEATURES.md` co F1
- `README_AGENT_TEAM.md` nhac ro BRD lock va TL calibration
- bootstrap output duoc tao ngay cho Claude Code, Cursor, VS Code / Copilot, Codex, va Antigravity

### 2.3 Flow dung team dung cach

Voi du an moi, khong nen giao implementation ngay. Dung theo thu tu sau:

1. Khoa BRD hoac `NORTH_STAR.md`
2. Yeu cau Tech Lead scan repo va calibrate lai team
3. Review patch de xac nhan role count, stack facts, commands, paths
4. Sau khi confirm, moi giao F1 cho team

Prompt goi y:

```text
Tech Lead, hay scan repo, hoi tiep bat ky cau hoi can thiet, calibrate lai agent team theo BRD da khoa, thay thong tin sai trong team.md bang thong tin dung, roi de xuat patch cho toi review truoc khi apply.
```

### 2.4 Kiem tra calibration marker

Trong `team.md`, section `Config Maintenance` se bat dau voi marker bootstrap. Sau khi Tech Lead calibrate xong, marker do phai duoc thay bang trang thai calibrated.

Neu van con marker bootstrap hoac con nhieu `TBD`, `stackmoss check` se canh bao config chua san sang.

```bash
stackmoss check
```

---

## 3. Test voi repo da co san

### 3.1 Di vao repo

```bash
cd E:\MyExistingProject
```

### 3.2 Chay migration flow

```bash
stackmoss init
```

Sau `init`, happy path la mo runtime anh dang dung va chat voi Tech Lead truoc. Chi dung `resolve` / `promote` khi migration report van con open questions hoac state chua len duoc `OPERATIONAL`.

### 3.3 Kiem tra operational flow

```bash
stackmoss check
stackmoss run test
stackmoss patch list
```

Ky vong:

- `init` bootstrap StackMoss ngay trong repo hien tai va tu inject neu repo da co code
- `inject` sync repo facts vao `PROJECT_FACTS`
- `resolve` va `promote` chi can khi migration state van can human confirm
- `check` bao neu team van chua duoc TL calibrate

---

## 4. Test agent behavior trong IDE

Mo project trong Claude Code, Cursor, Codex, VS Code / Copilot, hoac Antigravity.

Kiem tra 3 diem:

1. Agent khong duoc silently assume khi BRD chua khoa
2. Tech Lead phai de xuat reshape team neu stack thuc te khac template
3. Moi patch config phai yeu cau ban confirm truoc khi apply

Prompt goi y:

```text
Tech Lead, day la BRD da khoa. Hay calibrate lai agent team cho repo nay, de xuat moi thay doi role hoac command can thiet, nhung khong duoc apply patch khi chua hoi toi.
```

---

## 5. Lenh can nho

```bash
stackmoss new <name>
stackmoss init [name]
stackmoss inject
stackmoss resolve
stackmoss promote --confirm
stackmoss check
stackmoss run <alias>
stackmoss patch list
stackmoss patch apply <id>
stackmoss patch reject "<reason>" <id>
stackmoss upgrade
```

---

## 6. Troubleshooting

| Van de | Cach xu ly |
|:---|:---|
| `stackmoss: command not found` | Cai lai bang `npm install -g stackmoss` |
| `check` bao `calibration_needed` | Cho Tech Lead calibrate lai team va thay marker bootstrap |
| `run` hoac `patch` canh bao bootstrap calibration state | Team van la bootstrap team, chua duoc TL calibrate day du |
| Compile output khong thay doi | Sua `team.md`, sau do recompile/generate lai |
