#!/bin/bash
# =============================================================
# Script setup EC2 từ đầu (Ubuntu 22.04)
# Chạy 1 lần duy nhất sau khi tạo EC2 instance mới
# Cách dùng: bash setup-ec2.sh
# =============================================================
set -e  # Dừng nếu có lỗi

DOMAIN="api.yourdomain.com"       # ← SỬA thành domain của bạn
APP_DIR="/var/www/task-manager"
REPO_URL="https://github.com/your-username/task-manager.git"  # ← SỬA

echo "======================================"
echo " Task Manager — EC2 Setup Script"
echo "======================================"

# ─── 1. Cập nhật hệ thống ───────────────────────────────────
echo ""
echo "[1/7] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# ─── 2. Cài Node.js 20 ──────────────────────────────────────
echo ""
echo "[2/7] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# ─── 3. Cài PM2 (process manager) ───────────────────────────
echo ""
echo "[3/7] Installing PM2..."
sudo npm install -g pm2

# Tự động start PM2 khi reboot
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | bash

# ─── 4. Cài Nginx ────────────────────────────────────────────
echo ""
echo "[4/7] Installing Nginx..."
sudo apt-get install -y nginx

# Copy nginx config
sudo cp "$(dirname "$0")/nginx/task-manager.conf" /etc/nginx/sites-available/task-manager
sudo sed -i "s/api.yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/task-manager

# Enable site
sudo ln -sf /etc/nginx/sites-available/task-manager /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Xóa default config

# Test và reload nginx
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx

# ─── 5. Clone repo ───────────────────────────────────────────
echo ""
echo "[5/7] Cloning repository..."
sudo mkdir -p $APP_DIR
sudo chown ubuntu:ubuntu $APP_DIR
git clone $REPO_URL $APP_DIR
cd $APP_DIR/backend
npm ci --production

# ─── 6. Khởi động app với PM2 ────────────────────────────────
echo ""
echo "[6/7] Starting app with PM2..."
cd $APP_DIR/backend
pm2 start src/server.js --name task-manager-api
pm2 save  # Lưu process list

# Verify app đang chạy
sleep 2
curl -f http://localhost:3000/health && echo " ✓ App is running!"

# ─── 7. Cài SSL với Certbot ──────────────────────────────────
echo ""
echo "[7/7] Installing SSL certificate..."
sudo apt-get install -y certbot python3-certbot-nginx

# ⚠️  Đảm bảo domain đã trỏ về IP của EC2 trước khi chạy lệnh này!
echo ""
echo "  Domain: $DOMAIN"
echo "  Ensure this domain points to this server's IP before continuing."
echo ""
read -p "  DNS đã trỏ chưa? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Certbot tự động:
    # 1. Xác thực domain qua HTTP-01 challenge
    # 2. Lấy certificate từ Let's Encrypt
    # 3. Tự động cấu hình Nginx HTTPS
    # 4. Redirect HTTP → HTTPS
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@yourdomain.com
    echo " ✓ SSL certificate installed!"
    echo " ✓ Auto-renewal enabled (systemd timer)"
else
    echo "  Skipping SSL. Run manually: sudo certbot --nginx -d $DOMAIN"
fi

echo ""
echo "======================================"
echo " Setup Complete!"
echo " API: https://$DOMAIN/health"
echo " PM2: pm2 status"
echo " Nginx: sudo systemctl status nginx"
echo "======================================"
