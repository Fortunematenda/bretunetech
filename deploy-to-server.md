# Deploy Bretunetech to Your Server

## Server Details
- **IP**: 161.97.120.107
- **Domain**: bretunetech.com
- **Username**: root
- **Password**: M3Wt%xw@

---

## Step 1: Connect to Your Server

Open PowerShell or Terminal and run:

```bash
ssh root@161.97.120.107
# Enter password when prompted: M3Wt%xw@
```

---

## Step 2: Check Current Server State

Once connected, run this to see what's installed:

```bash
echo "=== Server Check ==="
echo "Node: $(node --version 2>/dev/null || echo 'Not installed')"
echo "NPM: $(npm --version 2>/dev/null || echo 'Not installed')"
echo "Nginx: $(nginx -v 2>&1 | head -1 || echo 'Not installed')"
echo "PostgreSQL: $(psql --version 2>/dev/null | head -1 || echo 'Not installed')"
echo ""
echo "=== Services ==="
systemctl is-active nginx 2>/dev/null || echo "Nginx not running"
systemctl is-active postgresql 2>/dev/null || echo "PostgreSQL not running"
echo ""
echo "=== /var/www ==="
ls -la /var/www/ 2>/dev/null || echo "Directory doesn't exist"
```

---

## Step 3: Install Prerequisites (if not installed)

Run these commands on the server:

```bash
# Update packages
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 10.x.x

# Install PostgreSQL
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

---

## Step 4: Setup Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE bretunetech;
CREATE USER bretunetech WITH PASSWORD 'BretuneTech2024!';
GRANT ALL PRIVILEGES ON DATABASE bretunetech TO bretunetech;
\q

# Verify database created
sudo -u postgres psql -c '\l' | grep bretunetech
```

---

## Step 5: Upload Your Project

From your LOCAL machine (PowerShell), run:

```powershell
# First, build your frontend locally
cd D:\Workspace\bretunetech\frontend
npm install
npm run build

# Create deployment directory on server
ssh root@161.97.120.107 "mkdir -p /var/www/bretunetech"

# Upload backend
scp -r D:\Workspace\bretunetech\backend root@161.97.120.107:/var/www/bretunetech/

# Upload frontend build
scp -r D:\Workspace\bretunetech\frontend\.next root@161.97.120.107:/var/www/bretunetech/frontend/
scp -r D:\Workspace\bretunetech\frontend\public root@161.97.120.107:/var/www/bretunetech/frontend/
scp D:\Workspace\bretunetech\frontend\package.json root@161.97.120.107:/var/www/bretunetech/frontend/

# Upload database
scp D:\Workspace\bretunetech\database\bretunetech.sql root@161.97.120.107:/var/www/bretunetech/
```

---

## Step 6: Import Database

On the server:

```bash
cd /var/www/bretunetech

# Import the database
sudo -u postgres psql -d bretunetech -f bretunetech.sql

# Verify tables were created
sudo -u postgres psql -d bretunetech -c '\dt'
```

---

## Step 7: Configure Backend Environment

```bash
cd /var/www/bretunetech/backend

# Create .env file
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://bretunetech:BretuneTech2024!@localhost:5432/bretunetech?schema=public"

# JWT Secrets - Generate secure random strings!
JWT_SECRET="bretunetech-super-secret-key-change-this-32-chars"
JWT_REFRESH_SECRET="bretunetech-refresh-secret-change-this-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV="production"
CORS_ORIGIN="https://bretunetech.com,https://www.bretunetech.com,http://161.97.120.107"
DEFAULT_MARKUP_PERCENTAGE="25"

# Payment Gateways (configure later)
PAYFAST_MERCHANT_ID=""
PAYFAST_MERCHANT_KEY=""
PAYFAST_PASSPHRASE=""
PAYFAST_SANDBOX="true"
EOF

# Install dependencies and build
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

---

## Step 8: Start Backend with PM2

```bash
cd /var/www/bretunetech/backend

# Start with PM2
pm2 start dist/server.js --name "bretunetech-api"

# Save PM2 config
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs bretunetech-api --lines 50
```

---

## Step 9: Configure Nginx

Create the Nginx config:

```bash
cat > /etc/nginx/sites-available/bretunetech << 'EOF'
server {
    listen 80;
    server_name bretunetech.com www.bretunetech.com 161.97.120.107;
    
    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;
    
    # For now, serve HTTP
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/bretunetech /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
nginx -t
systemctl reload nginx
```

---

## Step 10: Start Frontend

```bash
cd /var/www/bretunetech/frontend

# Install only production dependencies
npm install --production

# Start Next.js
pm2 start "npm start" --name "bretunetech-web"

# Or use npx serve for static
# npm install -g serve
# pm2 start "serve -s .next -l 3000" --name "bretunetech-web"
```

---

## Step 11: Setup SSL Certificate (Let's Encrypt)

```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d bretunetech.com -d www.bretunetech.com --non-interactive --agree-tos --email admin@bretunetech.com

# Auto-renewal test
certbot renew --dry-run
```

---

## Verify Deployment

Check these URLs:
- http://161.97.120.107 - Should show your app
- http://bretunetech.com - Should show your app
- http://161.97.120.107/api/health - Should show API health check

---

## Useful Commands

```bash
# View logs
pm2 logs bretunetech-api
pm2 logs bretunetech-web

# Restart services
pm2 restart bretunetech-api
pm2 restart bretunetech-web

# Database backup
pg_dump -U bretunetech bretunetech > backup_$(date +%Y%m%d).sql

# Update deployment
cd /var/www/bretunetech/backend && git pull && npm install && npm run build && pm2 restart bretunetech-api
cd /var/www/bretunetech/frontend && git pull && npm install && npm run build && pm2 restart bretunetech-web
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 4000 already in use | `lsof -ti:4000 \| xargs kill -9` then restart |
| Database connection failed | Check DATABASE_URL in .env, ensure PostgreSQL is running |
| Permission denied | `chown -R root:root /var/www/bretunetech` |
| Frontend not loading | Check if port 3000 is open: `ufw allow 3000` |
| API not responding | Check PM2 logs: `pm2 logs bretunetech-api` |

---

## Security Checklist

- [ ] Change default database password
- [ ] Use strong JWT secrets (generate with `openssl rand -base64 32`)
- [ ] Enable firewall: `ufw enable && ufw allow 80 && ufw allow 443 && ufw allow 22`
- [ ] Disable root SSH (create new user with sudo)
- [ ] Enable automatic security updates: `apt install unattended-upgrades`
- [ ] Setup fail2ban for brute force protection
