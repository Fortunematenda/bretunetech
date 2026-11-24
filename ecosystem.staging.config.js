/**
 * PM2 apps for isolated BretuneTech staging.
 * Never reuse production app names, ports, or DATABASE_URL.
 *
 * Start (after /var/www/bretunetech-staging is prepared):
 *   pm2 start ecosystem.staging.config.js
 *   pm2 save
 */
module.exports = {
  apps: [
    {
      name: 'bretunetech-staging-backend',
      cwd: '/var/www/bretunetech-staging/backend',
      script: 'dist/src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4005,
      },
    },
    {
      name: 'bretunetech-staging-frontend',
      cwd: '/var/www/bretunetech-staging/frontend',
      script: 'node_modules/.bin/next',
      args: 'start -H 127.0.0.1 -p 3015',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3015,
      },
    },
  ],
};
