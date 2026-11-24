
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
