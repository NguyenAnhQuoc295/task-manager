# Task Manager — CI/CD Pipeline Demo

### Dự án demo cho buổi học "Cloud Deployment & CI/CD Pipelines"

---

## Cấu trúc project

```
task-manager/
├── .github/
│   └── workflows/
│       └── ci-cd.yml        ← Pipeline chính
├── backend/                 ← Node.js + Express API
│   ├── src/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   └── api.test.js
│   └── package.json
├── frontend/                ← React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskList.jsx
│   │   └── __tests__/
│   │       ├── TaskForm.test.jsx
│   │       └── TaskList.test.jsx
│   └── package.json
└── infra/                   ← Server config
    ├── nginx/
    │   └── task-manager.conf
    ├── ecosystem.config.json
    └── setup-ec2.sh
```

---

## BƯỚC 1 — Chạy project ở local

```bash
# Terminal 1: Start backend
cd backend
npm install
npm run dev
# → http://localhost:3000/health

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## BƯỚC 2 — Chạy tests (demo cho sinh viên)

```bash
# Backend tests
cd backend
npm test

# ✅ Output mong muốn:
# PASS tests/api.test.js
#   GET /health ✓
#   GET /api/tasks ✓
#   POST /api/tasks ✓
#   PATCH /api/tasks/:id ✓
#   DELETE /api/tasks/:id ✓

# Frontend tests
cd frontend
npm test

# ✅ Output mong muốn:
# PASS src/__tests__/TaskForm.test.jsx
# PASS src/__tests__/TaskList.test.jsx
```

---

## BƯỚC 3 — Setup GitHub Repository

```bash
# 1. Tạo repo mới trên GitHub (đặt tên: task-manager)

# 2. Push code lên GitHub
git init
git add .
git commit -m "feat: initial project setup"
git remote add origin https://github.com/YOUR_USERNAME/task-manager.git
git push -u origin main
```

---

## BƯỚC 4 — Setup Vercel (Frontend)

```
1. Truy cập https://vercel.com → Sign in with GitHub
2. Click "Add New Project" → Import repo task-manager
3. Cấu hình:
   - Root Directory: frontend
   - Framework Preset: Vite
   - Environment Variables:
       VITE_API_URL = https://api.yourdomain.com/api
4. Click "Deploy"
5. Lấy thông tin:
   - VERCEL_TOKEN: Account Settings → Tokens → Create
     (dạng: vcp_xxxxxxxxxxxxxxxxxxxx)

   - VERCEL_ORG_ID: Team Settings → General → Team ID:
     (dạng: team_xxxxxxxxxxxxxxxxxxxxxxxx)

   - VERCEL_PROJECT_ID: Project Settings → General → Project ID:
     (dạng: prj_xxxxxxxxxxxxxxxxxxxxxxxx)
```

---

## BƯỚC 5 — Setup Render (Backend)

```
1. Truy cập https://render.com → Sign in with GitHub
2. Click "New +" → "Web Service"
3. Chọn repo task-manager → Configure:
   - Name: task-manager-api
   - Root Directory: backend
   - Runtime: Node
   - Build Command: npm install
   - Start Command: node src/server.js
   - Instance Type: Free
4. Click "Create Web Service" → chờ deploy lần đầu
5. Lấy Deploy Hook URL:
   Service → Settings → Deploy Hook → Copy URL
   (dạng: https://api.render.com/deploy/srv-xxx?key=yyy)
```

---

## BƯỚC 6 — Cấu hình GitHub Secrets

```
GitHub Repo → Settings → Secrets and variables → Actions → New repository secret

Thêm lần lượt:
┌──────────────────────────┬─────────────────────────────────────────────────────────────┐
│ Name                     │ Value                                                       │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ RENDER_DEPLOY_HOOK_URL   │ [Deploy Hook URL từ Render Service → Settings → Deploy Hook]│
│ VERCEL_TOKEN             │ [Token từ Vercel Account Settings]                          │
│ VERCEL_ORG_ID            │ [Team ID từ Vercel]                                         │
│ VERCEL_PROJECT_ID        │ [Project ID từ Vercel]                                      │
│ SLACK_WEBHOOK_URL        │ [Webhook URL từ Slack App] (optional)                       │
└──────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## BƯỚC 7 — Tạo GitHub Actions Workflow

```bash
# Tạo thư mục và file workflow

# macOS / Linux:
mkdir -p .github/workflows

# Windows (PowerShell):
New-Item -ItemType Directory -Force -Path .github/workflows
```

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
        working-directory: backend
      - run: npm test
        working-directory: backend

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
        working-directory: frontend
      - run: npm test
        working-directory: frontend

  deploy-backend:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Trigger Render Deploy
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"

  deploy-frontend:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
          vercel-args: "--prod"
```

```bash
# Commit workflow file
git add .github/workflows/ci-cd.yml
git commit -m "ci: add GitHub Actions CI/CD workflow"
git push origin main
```

---

## BƯỚC 8 — Trigger Pipeline lần đầu

```bash
# Mở file backend/src/app.js, tìm mảng tasks và thêm task thứ 4:
```

```js
// backend/src/app.js — tìm đoạn này:
let tasks = [
  { id: 1, title: "Learn CI/CD", done: false },
  { id: 2, title: "Setup GitHub Actions", done: false },
  { id: 3, title: "Deploy to AWS EC2", done: false },
  // ✅ Thêm 2 dòng này:
  { id: 4, title: "Monitor with Render Logs", done: false },
  { id: 5, title: "Write unit tests for API", done: false },
];
let nextId = 6; // ← cập nhật từ 4 → 6
```

```bash
# Sau khi lưu file, commit và push:
git add backend/src/app.js
git commit -m "feat: add Monitor with Render Logs task"
git push origin main

# → Mở GitHub → Actions tab → xem pipeline chạy realtime
# ✅ Jobs sẽ chạy theo thứ tự:
#    test-backend → test-frontend → deploy-backend + deploy-frontend

# ──────────────────────────────────────
# Nhận biết pipeline THÀNH CÔNG hay THẤT BẠI:
# ──────────────────────────────────────

# 1. Trên GitHub:
#    → Vào repo → tab "Actions"
#    → Thấy workflow run mới nhất:
#       🟡 Vòng tròn vàng  = đang chạy
#       ✅ Dấu tích xanh   = PASS — deploy thành công
#       ❌ Dấu X đỏ        = FAIL — có lỗi, KHÔNG deploy

# 2. Kiểm tra backend đã deploy chưa (sau ~2-3 phút):
curl https://task-manager-api.onrender.com/api/tasks
# → Nếu thấy task "Monitor with Render Logs" trong danh sách = ✅ thành công
# → Nếu timeout hoặc lỗi 502 = ❌ Render chưa deploy xong, chờ thêm

# 3. Kiểm tra frontend đã cập nhật chưa:
# → Mở browser: https://your-app.vercel.app
# → Nếu thấy 2 task mới hiển thị trong danh sách = ✅ thành công

# 4. Xem log chi tiết nếu FAIL:
#    → GitHub Actions → click vào workflow run bị lỗi
#    → Click vào job bị đỏ (test-backend / test-frontend)
#    → Xem dòng lỗi cụ thể trong log
```

---

## Demo "Break & Fix" cho sinh viên thấy pipeline bảo vệ

```bash
# Tạo branch mới
git checkout -b demo/failing-test

# Sửa backend/src/app.js — cố ý làm API trả về sai
# Dòng: res.json(tasks)
# Sửa thành: res.json([])    ← Bug: luôn trả về mảng rỗng

git add .
git commit -m "bug: accidentally broke tasks endpoint"
git push origin demo/failing-test

# Tạo Pull Request vào main
# → GitHub Actions chạy → tests FAIL → KHÔNG merge được
# → Sinh viên thấy CI/CD bảo vệ production branch

# Fix lại
git revert HEAD
git push origin demo/failing-test
# → Pipeline chạy lại → PASS → Merge được
```

---

## Kiểm tra sau khi deploy

```bash
# 1. Kiểm tra backend
curl https://api.yourdomain.com/health
# → {"status":"ok","timestamp":"..."}

curl https://api.yourdomain.com/api/tasks
# → [{"id":1,"title":"Learn CI/CD","done":false},...]

# 2. Kiểm tra HTTPS certificate
curl -vI https://api.yourdomain.com 2>&1 | grep -E "SSL|subject|expire"

# 3. Kiểm tra frontend
# → Mở browser: https://your-app.vercel.app
```

---

## Xem logs trên Render

```
1. Truy cập https://render.com → Dashboard → task-manager-api
2. Click tab "Logs" → xem real-time logs
3. Click tab "Events" → xem lịch sử deploy

# Kiểm tra backend đang chạy
curl https://task-manager-api.onrender.com/health
# → {"status":"ok","timestamp":"..."}
```
