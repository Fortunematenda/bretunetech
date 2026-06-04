# Bretunetech Deployment Guide

## Prerequisites
- VPS/Server with Ubuntu 20.04+ or similar
- PostgreSQL 14+ installed
- Node.js 18+ installed
- PM2 installed globally (`npm install -g pm2`)

## Step 1: Server Setup

```bash
# Update server
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/bretunetech
sudo chown $USER:$USER /var/www/bretunetech
```

## Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE bretunetech;
CREATE USER bretunetech WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bretunetech TO bretunetech;
\q

# Import database schema
cd /var/www/bretunetech
psql -U bretunetech -d bretunetech -f database/bretunetech.sql
```

## Step 3: Deploy Application

### Option A: Using SCP/SFTP
1. Build locally: `cd frontend && npm run build`
2. Copy files to server:
   - Backend: `/var/www/bretunetech/backend/`
   - Frontend build: `/var/www/bretunetech/frontend/.next/`
   - Frontend public: `/var/www/bretunetech/frontend/public/`
   - Database: `/var/www/bretunetech/database/`

### Option B: Using Git
```bash
cd /var/www/bretunetech
git clone https://github.com/yourusername/bretunetech.git .
cd frontend && npm install && npm run build
cd ../backend && npm install && npm run build
```

## Step 4: Environment Configuration

Create `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://bretunetech:your_secure_password@localhost:5432/bretunetech?schema=public"

# JWT Secrets (generate strong random strings)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV="production"
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"
DEFAULT_MARKUP_PERCENTAGE="25"

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Payment Gateways (configure as needed)
PAYFAST_MERCHANT_ID=""
PAYFAST_MERCHANT_KEY=""
PAYFAST_PASSPHRASE=""
PAYFAST_SANDBOX="false"

OZOW_SITE_CODE=""
OZOW_PRIVATE_KEY=""
OZOW_API_KEY=""
```

## Step 5: Start Services

### Using PM2 (Recommended)
```bash
cd /var/www/bretunetech/backend
pm2 start dist/server.js --name "bretunetech-api"

# Save PM2 config
pm2 save
pm2 startup
```

### Frontend (Static)
Option 1: Using Next.js
```bash
cd /var/www/bretunetech/frontend
npm start
```

Option 2: Using serve (static export)
```bash
cd /var/www/bretunetech/frontend
npm install -g serve
serve -s .next -l 3000
```

## Step 6: Nginx Configuration

```nginx
# /etc/nginx/sites-available/bretunetech
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
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
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/bretunetech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 7: SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo systemctl restart nginx
```

## Maintenance

### Update Application
```bash
cd /var/www/bretunetech
git pull
cd frontend && npm install && npm run build
cd ../backend && npm install && npm run build
pm2 restart bretunetech-api
```

### Database Backup
```bash
pg_dump -U bretunetech bretunetech > backup_$(date +%Y%m%d).sql
```

### View Logs
```bash
pm2 logs bretunetech-api
```

## Troubleshooting

- **Database connection errors**: Check DATABASE_URL and ensure PostgreSQL is running
- **Port conflicts**: Ensure ports 3000 (frontend) and 4000 (backend) are available
- **Permission errors**: Check file ownership: `sudo chown -R $USER:$USER /var/www/bretunetech`
- **CORS errors**: Update CORS_ORIGIN in backend/.env with your actual domain
