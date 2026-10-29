const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = parseInt(process.env.PORT, 10) || 3080;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: __dirname, timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve((stdout || '').trim());
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // API: Health check
  if (pathname === '/api/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT, uptime: Math.floor(process.uptime()) }));
    return;
  }

  // API: Check GitHub git status
  if (pathname === '/api/git-status' && req.method === 'GET') {
    try {
      // Get local commit
      const localCommitFull = await runCommand('git rev-parse HEAD');
      const localCommit = localCommitFull.substring(0, 7);
      const localMsg = await runCommand('git log -1 --format=%s');
      const localDate = await runCommand('git log -1 --format=%cd --date=relative');

      // Check remote commit from GitHub without modifying working tree
      let remoteCommitFull = '';
      let remoteCommit = '';
      let hasUpdate = false;
      let errorMsg = null;

      try {
        const lsRemoteOut = await runCommand('git ls-remote origin -h refs/heads/main');
        if (lsRemoteOut) {
          const parts = lsRemoteOut.split(/\s+/);
          remoteCommitFull = parts[0] || '';
          remoteCommit = remoteCommitFull.substring(0, 7);
          if (remoteCommitFull && localCommitFull) {
            hasUpdate = remoteCommitFull.trim() !== localCommitFull.trim();
          }
        }
      } catch (err) {
        errorMsg = 'Cannot reach GitHub origin: ' + err.message;
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        hasUpdate,
        localCommit,
        remoteCommit: remoteCommit || localCommit,
        localMsg,
        localDate,
        checkedAt: new Date().toISOString(),
        error: errorMsg
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API: Trigger Git Update from GitHub
  if (pathname === '/api/git-update' && req.method === 'POST') {
    try {
      console.log('[Git Update] Fetching and resetting to origin/main...');
      await runCommand('git fetch origin main');
      const updateOut = await runCommand('git reset --hard origin/main');
      const newCommit = (await runCommand('git rev-parse HEAD')).substring(0, 7);
      const newMsg = await runCommand('git log -1 --format=%s');

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        message: 'อัปเดตระบบจาก GitHub สำเร็จแล้ว!',
        commit: newCommit,
        subject: newMsg,
        output: updateOut
      }));

      // Trigger automatic restart via PM2 or exit after 1 second
      setTimeout(() => {
        console.log('[Git Update] Exiting process to allow PM2/systemd to restart fresh server...');
        process.exit(0);
      }, 1000);
    } catch (err) {
      console.error('[Git Update Error]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Serve Static Files
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // No cache for html, json, or root js so updates take effect immediately
    const headers = { 'Content-Type': contentType };
    if (ext === '.html' || ext === '.json' || safePath.includes('js/data.js')) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      headers['Cache-Control'] = 'public, max-age=3600';
    }

    res.writeHead(200, headers);
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🏥 Khok Si Suphan 3D Digital Twin Server is RUNNING`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🌐 LAN URL:   http://192.168.2.202:${PORT}`);
  console.log(`📂 Path:      ${__dirname}`);
  console.log(`====================================================`);
});
