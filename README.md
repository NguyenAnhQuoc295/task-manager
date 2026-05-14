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
   - VERCEL_ORG_ID: Team Settings → General → Team ID
   - VERCEL_PROJECT_ID: Project Settings → General → Project ID
```

---

## BƯỚC 5 — Setup AWS EC2 (Backend)

```
1. Đăng nhập AWS Console → EC2 → Launch Instance
2. Cấu hình:
   - AMI: Ubuntu Server 22.04 LTS (Free tier)
   - Instance type: t2.micro (Free tier)
   - Key pair: Tạo mới → download file .pem
   - Security Group (Inbound rules):
       Port 22  (SSH)    — My IP
       Port 80  (HTTP)   — Anywhere
       Port 443 (HTTPS)  — Anywhere
3. Launch instance → Lấy Public IP

4. SSH vào server lần đầu:
   chmod 400 your-key.pem
   ssh -i your-key.pem ubuntu@YOUR_EC2_IP

5. Chạy setup script:
   # Copy file lên server
   scp -i your-key.pem -r infra/ ubuntu@YOUR_EC2_IP:/home/ubuntu/

   # SSH vào và chạy
   ssh -i your-key.pem ubuntu@YOUR_EC2_IP
   bash /home/ubuntu/infra/setup-ec2.sh
```

---

## BƯỚC 6 — Cấu hình GitHub Secrets

```
GitHub Repo → Settings → Secrets and variables → Actions → New repository secret

Thêm lần lượt:
┌─────────────────────┬────────────────────────────────────────┐
│ Name                │ Value                                  │
├─────────────────────┼────────────────────────────────────────┤
│ EC2_HOST            │ 54.xxx.xxx.xxx (Public IP của EC2)     │
│ EC2_USER            │ ubuntu                                 │
│ EC2_PRIVATE_KEY     │ [Toàn bộ nội dung file .pem]           │
│ VERCEL_TOKEN        │ [Token từ Vercel Account Settings]     │
│ VERCEL_ORG_ID       │ [Team ID từ Vercel]                    │
│ VERCEL_PROJECT_ID   │ [Project ID từ Vercel]                 │
│ SLACK_WEBHOOK_URL   │ [Webhook URL từ Slack App] (optional)  │
└─────────────────────┴────────────────────────────────────────┘
```

---

## BƯỚC 7 — Trigger Pipeline lần đầu

```bash
# Thay đổi gì đó, ví dụ thêm task mới vào backend/src/app.js
git add .
git commit -m "feat: add initial tasks"
git push origin main

# → Mở GitHub → Actions tab → xem pipeline chạy realtime
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

## Xem logs trên EC2

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Logs của Node.js app
pm2 logs task-manager-api

# Status các process
pm2 status

# Logs của Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Kiểm tra SSL auto-renewal
sudo certbot renew --dry-run
```
