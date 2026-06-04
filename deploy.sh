#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Bretunetech VPS Deployment Script
#  Server: 161.97.120.107
#  Run this ON the VPS as root
# ═══════════════════════════════════════════════════════════════

set -e

echo "🚀 Starting Bretunetech deployment..."

# ─── 1. System Dependencies ────────────────────────────────────
echo "📦 Installing system dependencies..."
apt-get update -qq
apt-get install -y curl git nginx postgresql postgresql-contrib ufw

# ─── 2. Node.js 20 LTS ─────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "✅ Node $(node -v) | npm $(npm -v)"

# ─── 3. PM2 ────────────────────────────────────────────────────
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

# ─── 4. PostgreSQL Setup ────────────────────────────────────────
echo "🗄️  Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create DB user and database
sudo -u postgres psql -c "CREATE USER bretunetech WITH PASSWORD 'BretuneTech2024#Secure';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE bretunetech OWNER bretunetech;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bretunetech TO bretunetech;" 2>/dev/null || true
echo "✅ PostgreSQL ready"

# ─── 5. Project Directory ───────────────────────────────────────
echo "📁 Setting up project directory..."
mkdir -p /var/www/bretunetech

# ─── 6. Clone / Pull Project ────────────────────────────────────
# Option A: Using Git (recommended - set up a private repo on GitHub first)
# git clone https://github.com/YOUR_USERNAME/bretunetech.git /var/www/bretunetech
# cd /var/www/bretunetech && git pull

# Option B: Files already uploaded via SCP/SFTP
# (run the upload commands from your Windows machine first)
cd /var/www/bretunetech

# ─── 7. Backend Setup ───────────────────────────────────────────
echo "⚙️  Setting up backend..."
cd /var/www/bretunetech/backend

# Create production .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://bretunetech:BretuneTech2024#Secure@localhost:5432/bretunetech?schema=public"
JWT_SECRET="bretunetech-jwt-secret-change-this-to-random-string-2024"
JWT_REFRESH_SECRET="bretunetech-refresh-secret-change-this-2024"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="production"
CORS_ORIGIN="https://bretunetech.com,https://www.bretunetech.com,https://admin.bretunetech.com"
DEFAULT_MARKUP_PERCENTAGE="25"
EOF

npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
echo "✅ Backend built"

# ─── 8. Frontend Setup ──────────────────────────────────────────
echo "⚙️  Setting up frontend..."
cd /var/www/bretunetech/frontend

# Create production .env
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api.bretunetech.com/api
EOF

npm install
npm run build
echo "✅ Frontend built"

# ─── 9. PM2 ─────────────────────────────────────────────────────
echo "🔄 Starting apps with PM2..."
cd /var/www/bretunetech
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
echo "✅ PM2 apps running"

# ─── 10. Nginx ──────────────────────────────────────────────────
echo "🌐 Configuring Nginx..."
cp /var/www/bretunetech/nginx/bretunetech.conf /etc/nginx/sites-available/bretunetech
ln -sf /etc/nginx/sites-available/bretunetech /etc/nginx/sites-enabled/bretunetech
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "✅ Nginx configured"

# ─── 11. Firewall ───────────────────────────────────────────────
echo "🔒 Configuring firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable
echo "✅ Firewall active"

# ─── 12. SSL (Let's Encrypt) ────────────────────────────────────
echo "🔐 Installing SSL certificates..."
apt-get install -y certbot python3-certbot-nginx
certbot --nginx \
  -d bretunetech.com \
  -d www.bretunetech.com \
  -d api.bretunetech.com \
  -d admin.bretunetech.com \
  --non-interactive \
  --agree-tos \
  -m fortune@bretunetech.com
echo "✅ SSL certificates installed"

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅  Bretunetech deployment complete!"
echo "   🌐 Site:  https://bretunetech.com"
echo "   🔧 API:   https://api.bretunetech.com/api/health"
echo "   📊 Admin: https://bretunetech.com/admin"
echo "═══════════════════════════════════════════════════"
