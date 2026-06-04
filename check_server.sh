#!/bin/bash
echo "=================================="
echo "  BRETUNETECH SERVER STATUS CHECK"
echo "=================================="
echo "Date: $(date)"
echo "Hostname: $(hostname)"
echo ""

echo "=== SYSTEM INFO ==="
echo "OS: $(cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d '"' || echo 'Unknown')"
echo "Uptime: $(uptime -p 2>/dev/null || uptime | awk -F',' '{print $1}')"
echo ""

echo "=== DISK SPACE ==="
df -h / 2>/dev/null | tail -1 || echo "Cannot check disk"
echo ""

echo "=== MEMORY ==="
free -h 2>/dev/null | grep Mem || echo "Cannot check memory"
echo ""

echo "=== INSTALLED SOFTWARE ==="
if command -v node &> /dev/null; then
    echo "Node.js: $(node --version)"
else
    echo "Node.js: NOT INSTALLED"
fi

if command -v npm &> /dev/null; then
    echo "NPM: $(npm --version)"
else
    echo "NPM: NOT INSTALLED"
fi

if command -v psql &> /dev/null; then
    echo "PostgreSQL: $(psql --version | head -1)"
else
    echo "PostgreSQL: NOT INSTALLED"
fi

if command -v nginx &> /dev/null; then
    echo "Nginx: $(nginx -v 2>&1 | head -1)"
else
    echo "Nginx: NOT INSTALLED"
fi

if command -v pm2 &> /dev/null; then
    echo "PM2: $(pm2 --version)"
else
    echo "PM2: NOT INSTALLED"
fi
echo ""

echo "=== SERVICES STATUS ==="
if systemctl is-active nginx &> /dev/null; then
    echo "Nginx: RUNNING"
else
    echo "Nginx: NOT RUNNING"
fi

if systemctl is-active postgresql &> /dev/null; then
    echo "PostgreSQL: RUNNING"
else
    echo "PostgreSQL: NOT RUNNING"
fi
echo ""

echo "=== OPEN PORTS ==="
if command -v netstat &> /dev/null; then
    netstat -tlnp 2>/dev/null | grep -E ':80|:443|:3000|:4000|:5432' || echo "No relevant ports found"
elif command -v ss &> /dev/null; then
    ss -tlnp 2>/dev/null | grep -E ':80|:443|:3000|:4000|:5432' || echo "No relevant ports found"
else
    echo "Cannot check ports (netstat/ss not available)"
fi
echo ""

echo "=== /var/www DIRECTORY ==="
if [ -d "/var/www" ]; then
    ls -la /var/www/
else
    echo "Directory does not exist"
fi
echo ""

echo "=== PM2 PROCESSES ==="
if command -v pm2 &> /dev/null; then
    pm2 list 2>/dev/null || echo "No PM2 processes running"
else
    echo "PM2 not installed"
fi
echo ""

echo "=== DATABASES ==="
if command -v psql &> /dev/null; then
    sudo -u postgres psql -c '\l' 2>/dev/null | grep -E 'bretunetech|Name' || echo "No bretunetech database found"
else
    echo "PostgreSQL not installed"
fi
echo ""

echo "=== NGINX SITES ==="
if [ -d "/etc/nginx/sites-enabled" ]; then
    echo "Enabled sites:"
    ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "None"
else
    echo "Nginx sites directory not found"
fi
echo ""

echo "=================================="
echo "  CHECK COMPLETE"
echo "=================================="
