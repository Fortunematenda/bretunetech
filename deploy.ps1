# Bretunetech Deployment Script
# Run this on your VPS/server to deploy the application

param(
    [string]$ServerIP = "your-server-ip",
    [string]$User = "root"
)

Write-Host "=== Bretunetech Deployment Script ===" -ForegroundColor Cyan
Write-Host ""

# Build frontend locally first
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build
Set-Location ..

# Backend setup on server
Write-Host ""
Write-Host "Deploying to server: $ServerIP" -ForegroundColor Yellow

# Create deployment package (excluding node_modules, .git, etc.)
Write-Host "Creating deployment package..." -ForegroundColor Yellow
$exclude = @('node_modules', '.git', '.next', 'spurtcommerce', 'special', '*.log')
$tempDir = "deploy_temp"

if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}

# Copy files to temp directory
Copy-Item -Recurse backend $tempDir\backend
Copy-Item -Recurse frontend\.next $tempDir\frontend\.next
Copy-Item -Recurse frontend\public $tempDir\frontend\public
Copy-Item frontend\package.json $tempDir\frontend\
Copy-Item database\bretunetech.sql $tempDir\database.sql

# Create startup scripts
@"
#!/bin/bash
cd backend
npm install
npm run build
npm start
"@ | Out-File -FilePath "$tempDir\start-backend.sh" -Encoding UTF8

@"
#!/bin/bash
cd frontend
npm install -g serve
serve -s .next -l 3000
"@ | Out-File -FilePath "$tempDir\start-frontend.sh" -Encoding UTF8

# Upload to server (requires SSH key setup)
Write-Host "Uploading to server..." -ForegroundColor Yellow
# scp -r $tempDir/* ${User}@${ServerIP}:/var/www/bretunetech/

Write-Host ""
Write-Host "=== Deployment Steps ===" -ForegroundColor Green
Write-Host "1. Copy files to server: /var/www/bretunetech/" -ForegroundColor White
Write-Host "2. Import database: psql -U bretunetech -d bretunetech -f database.sql" -ForegroundColor White
Write-Host "3. Setup environment variables in backend/.env" -ForegroundColor White
Write-Host "4. Start backend: cd backend && npm start" -ForegroundColor White
Write-Host "5. Start frontend: cd frontend && npm run start" -ForegroundColor White
Write-Host ""
Write-Host "Or use PM2 for production: pm2 start backend/dist/server.js --name bretunetech-api" -ForegroundColor Yellow
Write-Host ""

# Cleanup
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue

Write-Host "Deployment package ready!" -ForegroundColor Green
