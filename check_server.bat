@echo off
echo ==========================================
echo   BRETUNETECH SERVER CHECK
echo   Server: 161.97.120.107
echo ==========================================
echo.
echo Connecting to server...
echo When prompted for password, enter: M3Wt%%xw@
echo.

ssh -o StrictHostKeyChecking=no root@161.97.120.107 "uname -a; echo ''; echo '=== Node ==='; node --version 2>/dev/null || echo 'Not installed'; echo ''; echo '=== NPM ==='; npm --version 2>/dev/null || echo 'Not installed'; echo ''; echo '=== PostgreSQL ==='; psql --version 2>/dev/null | head -1 || echo 'Not installed'; echo ''; echo '=== Nginx ==='; nginx -v 2>&1 | head -1 || echo 'Not installed'; echo ''; echo '=== Services ==='; systemctl is-active nginx 2>/dev/null || echo 'Nginx not running'; systemctl is-active postgresql 2>/dev/null || echo 'PostgreSQL not running'; echo ''; echo '=== Ports ==='; ss -tlnp 2>/dev/null | grep -E ':(80|443|3000|4000|5432)' || netstat -tlnp 2>/dev/null | grep -E ':(80|443|3000|4000|5432)' || echo 'No ports'; echo ''; echo '=== /var/www ==='; ls -la /var/www/ 2>/dev/null || echo 'Not found'; echo ''; echo '=== PM2 ==='; pm2 list 2>/dev/null || echo 'Not installed'; echo ''; echo '=== Done ==="

echo.
pause
