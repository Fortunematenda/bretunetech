
module.exports = {
  apps: [
    {
      name: 'bretunetech-backend',
      cwd: '/var/www/bretunetech/backend',
      script: 'dist/src/server.js',
      interpreter: '/opt/bretunetech-node/bin/node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        // Newsletter flags are intentionally NOT pinned here.
        // Source of truth: backend/.env (dotenv). Deploy scripts fail-closed if .env is not false.
        // Operators enable sending/worker only by editing backend/.env then restarting this app.
      },
    },
    {
      name: 'bretunetech-frontend',
      cwd: '/var/www/bretunetech/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      interpreter: '/opt/bretunetech-node/bin/node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
