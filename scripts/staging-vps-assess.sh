#!/usr/bin/env bash
# READ-ONLY VPS assessment for BretuneTech staging planning.
# Safe to run on production host: no restarts, no writes to app dirs.
set -euo pipefail
echo '=== HOST ==='
hostname || true
uname -a || true
echo '=== CPU/RAM/DISK ==='
nproc || true
free -h || true
df -h / /var /var/www 2>/dev/null || df -h
echo '=== POSTGRES ==='
psql --version 2>/dev/null || true
pg_dump --version 2>/dev/null || true
sudo -u postgres psql -tAc 'SHOW server_version' 2>/dev/null || true
sudo -u postgres psql -tAc "SELECT datname FROM pg_database WHERE datname LIKE 'bretune%' ORDER BY 1" 2>/dev/null || true
echo '=== PM2 ==='
pm2 jlist 2>/dev/null | node -e '
let s=""; process.stdin.on("data",d=>s+=d); process.stdin.on("end",()=>{
  try {
    JSON.parse(s).forEach(p=>{
      const mem=Math.round(((p.monit&&p.monit.memory)||0)/1048576);
      console.log([p.name, p.pm2_env&&p.pm2_env.status, "mem="+mem+"MB", "pid="+p.pid].join(" "));
    });
  } catch (e) { console.log("pm2-unavailable"); }
});
' || echo 'pm2-unavailable'
echo '=== LISTEN PORTS ==='
(ss -lntH 2>/dev/null || netstat -lnt 2>/dev/null || true) | awk '{print $4}' | sed 's/.*://' | sort -n | uniq | grep -E '^(80|443|3000|3005|4000|4005|5432|22)$' || true
echo '=== NGINX ==='
nginx -v 2>&1 || true
ls /etc/nginx/sites-enabled 2>/dev/null || true
ls /etc/nginx/conf.d 2>/dev/null || true
echo '=== APP DIRS ==='
ls -ld /var/www/bretunetech /var/www/bretunetech-staging 2>/dev/null || true
echo '=== NEWSLETTER FLAGS (values) ==='
if [[ -f /var/www/bretunetech/backend/.env ]]; then
  grep -E '^NEWSLETTER_(SENDING|WORKER)_ENABLED=' /var/www/bretunetech/backend/.env || echo 'flags-unset'
else
  echo 'backend-env-missing'
fi
echo '=== DONE ==='
