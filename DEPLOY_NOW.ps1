# Bretunetech Auto-Deployment Script
# Server: 161.97.120.107
# This script will deploy your application to the VPS

param(
    [string]$ServerIP = "161.97.120.107",
    [string]$Username = "root",
    [string]$Password = "M3Wt%xw@",
    [string]$Domain = "bretunetech.com"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  BRETUNETECH DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server: $ServerIP" -ForegroundColor Gray
Write-Host "Domain: $Domain" -ForegroundColor Gray
Write-Host ""

# Step 1: Build Frontend Locally
Write-Host "Step 1: Building frontend locally..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend"

Write-Host "  - Installing npm packages..." -ForegroundColor Gray
npm install 2>&1 | Out-Null

Write-Host "  - Building Next.js app..." -ForegroundColor Gray
npm run build 2>&1 | Out-Null

Set-Location $PSScriptRoot
Write-Host "  ✓ Frontend built successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Create Remote Deployment Script
Write-Host "Step 2: Creating remote deployment script..." -ForegroundColor Yellow

$RemoteScript = @"
#!/bin/bash
set -e

echo "================================"
echo "REMOTE DEPLOYMENT STARTED"
echo "================================"
echo ""

# Update system
echo "[1/12] Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq 2>/dev/null || true

# Install Node.js 18 if not present
echo "[2/12] Checking/Installing Node.js..."
if ! command -v node &> /dev/null || [[ \$(node --version | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
echo "  Node version: \$(node --version)"
echo "  NPM version: \$(npm --version)"

# Install PostgreSQL if not present
echo "[3/12] Checking/Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt-get install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
fi

# Install PM2 if not present
echo "[4/12] Checking/Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Install Nginx if not present
echo "[5/12] Checking/Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
fi

echo ""
echo "[6/12] Setting up database..."
# Create database and user
sudo -u postgres psql << 'PGSQL'
CREATE DATABASE bretunetech;
CREATE USER bretunetech WITH PASSWORD 'BretuneTech2024!';
GRANT ALL PRIVILEGES ON DATABASE bretunetech TO bretunetech;
\q
PGSQL

echo ""
echo "[7/12] Creating application directory..."
mkdir -p /var/www/bretunetech
cd /var/www/bretunetech

# Wait for files to be uploaded via SCP
echo "  Waiting for files to be uploaded..."
echo "  (You need to run the SCP commands from your local machine)"
echo ""
"@

$RemoteScript | Out-File -FilePath "$PSScriptRoot\remote_deploy.sh" -Encoding UTF8 -NoNewline

Write-Host "  ✓ Remote script created" -ForegroundColor Green
Write-Host ""

# Step 3: Show SCP Commands
Write-Host "Step 3: Upload files to server" -ForegroundColor Yellow
Write-Host "  Run these commands from YOUR local machine:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # Upload remote script:" -ForegroundColor White
Write-Host "  scp -o StrictHostKeyChecking=no $PSScriptRoot\remote_deploy.sh ${Username}@${ServerIP}:/tmp/" -ForegroundColor Gray
Write-Host ""
Write-Host "  # Run remote setup:" -ForegroundColor White
Write-Host "  ssh -o StrictHostKeyChecking=no ${Username}@${ServerIP} 'bash /tmp/remote_deploy.sh'" -ForegroundColor Gray
Write-Host ""
Write-Host "  # Upload backend:" -ForegroundColor White
Write-Host "  scp -r -o StrictHostKeyChecking=no $PSScriptRoot\backend ${Username}@${ServerIP}:/var/www/bretunetech/" -ForegroundColor Gray
Write-Host ""
Write-Host "  # Upload frontend:" -ForegroundColor White
Write-Host "  scp -r -o StrictHostKeyChecking=no $PSScriptRoot\frontend\.next ${Username}@${ServerIP}:/var/www/bretunetech/frontend/" -ForegroundColor Gray
Write-Host "  scp -r -o StrictHostKeyChecking=no $PSScriptRoot\frontend\public ${Username}@${ServerIP}:/var/www/bretunetech/frontend/" -ForegroundColor Gray
Write-Host "  scp -o StrictHostKeyChecking=no $PSScriptRoot\frontend\package.json ${Username}@${ServerIP}:/var/www/bretunetech/frontend/" -ForegroundColor Gray
Write-Host ""
Write-Host "  # Upload database:" -ForegroundColor White
Write-Host "  scp -o StrictHostKeyChecking=no $PSScriptRoot\database\bretunetech.sql ${Username}@${ServerIP}:/var/www/bretunetech/" -ForegroundColor Gray
Write-Host ""

# Step 4: Show Post-Upload Commands
Write-Host "Step 4: After files are uploaded, run these on the server:" -ForegroundColor Yellow
Write-Host ""

$PostUploadScript = @"
# Post-upload configuration
cd /var/www/bretunetech

echo "[8/12] Importing database..."
sudo -u postgres psql -d bretunetech -f bretunetech.sql 2>&1 | head -20

echo ""
echo "[9/12] Setting up backend..."
cd backend

# Create .env file
cat > .env << 'ENVFILE'
DATABASE_URL="postgresql://bretunetech:BretuneTech2024!@localhost:5432/bretunetech?schema=public"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="production"
CORS_ORIGIN="https://$Domain,http://$ServerIP"
DEFAULT_MARKUP_PERCENTAGE="25"
ENVFILE

npm install 2>&1 | tail -5
npm run build 2>&1 | tail -10

echo ""
echo "[10/12] Starting backend with PM2..."
pm2 stop bretunetech-api 2>/dev/null || true
pm2 delete bretunetech-api 2>/dev/null || true
pm2 start dist/server.js --name "bretunetech-api"
pm2 save

echo ""
echo "[11/12] Starting frontend..."
cd ../frontend
npm install --production 2>&1 | tail -5

pm2 stop bretunetech-web 2>/dev/null || true
pm2 delete bretunetech-web 2>/dev/null || true
pm2 start "npm start" --name "bretunetech-web"
pm2 save

echo ""
echo "[12/12] Configuring Nginx..."
cat > /etc/nginx/sites-available/bretunetech << 'NGINX'
server {
    listen 80;
    server_name $Domain $ServerIP;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/bretunetech /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

nginx -t && systemctl reload nginx

echo ""
echo "================================"
echo "DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "Your application should be available at:"
echo "  - http://$ServerIP"
echo "  - http://$Domain"
echo ""
echo "API Health check: http://$ServerIP/api/health"
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "To view logs:"
echo "  pm2 logs bretunetech-api"
echo "  pm2 logs bretunetech-web"
"@

$PostUploadScript | Out-File -FilePath "$PSScriptRoot\post_upload.sh" -Encoding UTF8 -NoNewline

Write-Host "  scp -o StrictHostKeyChecking=no $PSScriptRoot\post_upload.sh ${Username}@${ServerIP}:/tmp/" -ForegroundColor Gray
Write-Host "  ssh -o StrictHostKeyChecking=no ${Username}@${ServerIP} 'bash /tmp/post_upload.sh'" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT INSTRUCTIONS READY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Two helper scripts have been created:" -ForegroundColor Yellow
Write-Host "  1. remote_deploy.sh - Server setup (run first)" -ForegroundColor White
Write-Host "  2. post_upload.sh - Final configuration (run after file upload)" -ForegroundColor White
Write-Host ""
Write-Host "Quick Start:" -ForegroundColor Green
Write-Host "1. Copy the commands above and run them in PowerShell" -ForegroundColor White
Write-Host "2. Or manually SSH to your server and run the scripts" -ForegroundColor White
Write-Host ""
Write-Host "Manual SSH:" -ForegroundColor Yellow
Write-Host "  ssh root@$ServerIP" -ForegroundColor Gray
Write-Host "  Password: $Password" -ForegroundColor Gray
Write-Host ""
