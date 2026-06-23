const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, 'dist', 'src', 'server.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  // Restart the server if it exits unexpectedly
  if (code !== 0) {
    console.log('Restarting server...');
    setTimeout(() => {
      const newServer = spawn('node', [serverPath], {
        stdio: 'inherit',
        shell: true
      });
      newServer.on('error', (err) => {
        console.error('Failed to restart server:', err);
        process.exit(1);
      });
    }, 1000);
  }
});

// Keep this process alive
process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});
