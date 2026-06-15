# ═══════════════════════════════════════════════════════════════
#  Bretunetech - Upload project to VPS
#  Run from D:\Workspace\voltnet (or bretunetech after rename)
#  Requires: OpenSSH or PuTTY (pscp) installed
# ═══════════════════════════════════════════════════════════════

$VPS_IP = "161.97.120.107"
$VPS_USER = "root"
$LOCAL_PATH = $PSScriptRoot

Write-Host "📦 Uploading Bretunetech to VPS $VPS_IP..." -ForegroundColor Cyan

# Create remote directory
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p /var/www/bretunetech"

# Upload backend (exclude node_modules, .env)
Write-Host "⬆️  Uploading backend..." -ForegroundColor Yellow
scp -r `
  "$LOCAL_PATH\backend\src" `
  "$LOCAL_PATH\backend\dist" `
  "$LOCAL_PATH\backend\package.json" `
  "$LOCAL_PATH\backend\package-lock.json" `
  "$LOCAL_PATH\backend\tsconfig.json" `
  "$LOCAL_PATH\backend\prisma" `
  "${VPS_USER}@${VPS_IP}:/var/www/bretunetech/backend/"

# Upload frontend (exclude node_modules)
Write-Host "⬆️  Uploading frontend..." -ForegroundColor Yellow
scp -r `
  "$LOCAL_PATH\frontend\src" `
  "$LOCAL_PATH\frontend\.next" `
  "$LOCAL_PATH\frontend\public" `
  "$LOCAL_PATH\frontend\package.json" `
  "$LOCAL_PATH\frontend\package-lock.json" `
  "$LOCAL_PATH\frontend\tsconfig.json" `
  "$LOCAL_PATH\frontend\next.config*" `
  "$LOCAL_PATH\frontend\tailwind.config*" `
  "$LOCAL_PATH\frontend\postcss.config*" `
  "${VPS_USER}@${VPS_IP}:/var/www/bretunetech/frontend/"

# Upload deployment files
Write-Host "⬆️  Uploading deployment config..." -ForegroundColor Yellow
scp "$LOCAL_PATH\ecosystem.config.js" "${VPS_USER}@${VPS_IP}:/var/www/bretunetech/"
scp -r "$LOCAL_PATH\nginx" "${VPS_USER}@${VPS_IP}:/var/www/bretunetech/"
scp "$LOCAL_PATH\deploy.sh" "${VPS_USER}@${VPS_IP}:/var/www/bretunetech/"

# Make deploy script executable and run it
Write-Host "🚀 Running deployment script on VPS..." -ForegroundColor Green
ssh "${VPS_USER}@${VPS_IP}" "chmod +x /var/www/bretunetech/deploy.sh; bash /var/www/bretunetech/deploy.sh"

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅  Upload and deployment complete!" -ForegroundColor Green
Write-Host "   🌐 https://bretunetech.com" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
