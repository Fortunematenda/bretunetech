# Check Bretunetech Server Status
# Run this to check what's on your server

$ServerIP = "161.97.120.107"
$Username = "root"

Write-Host "=== Bretunetech Server Check ===" -ForegroundColor Cyan
Write-Host "Server: $ServerIP" -ForegroundColor Gray
Write-Host ""

# Create temp script to run on server
$CheckScript = @'
#!/bin/bash
echo "=== Server Status Check ==="
echo "Date: $(date)"
echo ""

echo "=== Disk Space ==="
df -h | grep -E "(Filesystem|/dev/)"
echo ""

echo "=== Memory ==="
free -h
echo ""

echo "=== /var/www Directory ==="
if [ -d "/var/www" ]; then
    ls -la /var/www/
else
    echo "No /var/www directory found"
fi
echo ""

echo "=== Installed Software ==="
echo "Node: $(node --version 2>/dev/null || echo 'Not installed')"
echo "NPM: $(npm --version 2>/dev/null || echo 'Not installed')"
echo "PM2: $(pm2 --version 2>/dev/null || echo 'Not installed')"
echo "Nginx: $(nginx -v 2>&1 | head -1 || echo 'Not installed')"
echo "PostgreSQL: $(psql --version 2>/dev/null | head -1 || echo 'Not installed')"
echo ""

echo "=== Running Services ==="
systemctl is-active nginx 2>/dev/null && echo "Nginx: RUNNING" || echo "Nginx: NOT RUNNING"
systemctl is-active postgresql 2>/dev/null && echo "PostgreSQL: RUNNING" || echo "PostgreSQL: NOT RUNNING"
echo ""

echo "=== Open Ports ==="
netstat -tlnp 2>/dev/null | grep -E ':(80|443|3000|4000|5432)' || ss -tlnp 2>/dev/null | grep -E ':(80|443|3000|4000|5432)' || echo "Could not check ports"
echo ""

echo "=== PM2 Processes ==="
pm2 list 2>/dev/null || echo "No PM2 processes or PM2 not installed"
echo ""

echo "=== Databases ==="
sudo -u postgres psql -c '\l' 2>/dev/null | grep -E "(bretunetech|Name)" || echo "Cannot list databases (may need sudo)"
echo ""

echo "=== Check Complete ==="
'@

# Save temp script
$TempFile = "$env:TEMP\check_server.sh"
$CheckScript | Out-File -FilePath $TempFile -Encoding UTF8

Write-Host "To check your server, run these commands in a terminal with SSH access:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Connect to server:" -ForegroundColor Cyan
Write-Host "   ssh root@$ServerIP" -ForegroundColor White
Write-Host ""
Write-Host "2. Then run this check on the server:" -ForegroundColor Cyan
Write-Host ""
Write-Host $CheckScript -ForegroundColor Gray
Write-Host ""
Write-Host "Or copy this script to your server and run it:" -ForegroundColor Yellow
Write-Host "   scp $TempFile root@${ServerIP}:/tmp/check.sh"
Write-Host "   ssh root@$ServerIP 'bash /tmp/check.sh'" -ForegroundColor White
Write-Host ""

# Cleanup
Remove-Item $TempFile -ErrorAction SilentlyContinue
