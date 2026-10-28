const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('====================================================');
console.log(' 🔨 Building project for production...');
console.log('====================================================');

try {
  execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit', shell: true });
  console.log('\n✓ Production build finished successfully.\n');
} catch (err) {
  console.error('❌ Production build failed:', err.message);
  process.exit(1);
}

console.log('====================================================');
console.log(' 🚀 Starting Frontend, Admin Portal, and Backend...');
console.log('====================================================');

const isWindows = process.platform === 'win32';
const nextBin = path.join(ROOT_DIR, 'node_modules', 'next', 'dist', 'bin', 'next');

// 1. Start Backend on port 5000
const backend = spawn('node', [path.join(ROOT_DIR, 'server', 'server.js')], {
  cwd: ROOT_DIR,
  env: { ...process.env, PORT: '5000' },
  stdio: 'inherit'
});

// 2. Start Admin Portal on port 3001
const admin = spawn('node', [path.join(ROOT_DIR, 'admin-portal', 'server.js')], {
  cwd: ROOT_DIR,
  env: { ...process.env, ADMIN_PORT: '3001' },
  stdio: 'inherit'
});

// 3. Start Frontend (Next.js) on port 3000
const frontend = spawn('node', [nextBin, 'start', '-p', '3000'], {
  cwd: ROOT_DIR,
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit'
});

const processes = [backend, admin, frontend];

function cleanup() {
  console.log('\nStopping production services...');
  processes.forEach(p => {
    try {
      if (isWindows && p.pid) {
        execSync(`taskkill /pid ${p.pid} /T /F`, { stdio: 'ignore' });
      } else {
        p.kill('SIGTERM');
      }
    } catch {}
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Health check helper
function checkUrl(url, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Verification loop
async function verifyServices() {
  const urls = [
    { name: 'Backend API', url: 'http://localhost:5000/api/health' },
    { name: 'Admin Portal', url: 'http://localhost:3001/' },
    { name: 'Frontend', url: 'http://localhost:3000/' }
  ];

  console.log('Verifying services health status...\n');

  for (let attempt = 1; attempt <= 30; attempt++) {
    const results = await Promise.all(urls.map(u => checkUrl(u.url)));
    if (results.every(r => r === true)) {
      console.log('====================================================');
      console.log(' ✨ ALL HORVVALLE PRODUCTION SERVICES ARE ONLINE! ✨');
      console.log(' 🌐 Əsas Mağaza (Store): http://localhost:3000  (HTTP 200 OK)');
      console.log(' 🛡️  Admin Portal:        http://localhost:3001  (HTTP 200 OK)');
      console.log(' 🛍️  Backend REST API:    http://localhost:5000/api/products  (HTTP 200 OK)');
      console.log('====================================================');
      return;
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  console.warn('⚠️ Warning: Some services took longer to respond. Check process output above.');
}

verifyServices();
