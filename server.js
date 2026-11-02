const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

const PORT = parseInt(process.env.PORT, 10) || 3080;
const PUBLIC_DIR = __dirname;

// ThaiD (DOPA Digital ID) OAuth 2.0 / OpenID Connect Configuration
const THAID_CONFIG = {
  authUrl: 'https://imauth.bora.dopa.go.th/api/v2/oauth2/auth/',
  tokenUrl: 'https://imauth.bora.dopa.go.th/api/v2/oauth2/token/',
  userinfoUrl: 'https://imauth.bora.dopa.go.th/api/v2/oauth2/userinfo/',
  clientId: 'Vm5laU1QY21waWNGTWVHc2NSVDhYajNxMkRiMEFLQUw',
  clientSecret: 'dmZnb0lpb2NqYnBWVUFRN3BFTjV6bVp4UGE4SEhNaU82dVFxS3BuRA',
  apiKey: 'A4ovGdTNcJW6uhVu8LxfPQgFkTTT56Yzk5d96lon',
  redirectUri: 'http://147.50.107.211:3080/',
  scope: 'openid pid name birthdate'
};

// Sessions Persistence
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');
let sessions = {};
try {
  if (fs.existsSync(SESSIONS_FILE)) {
    sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
  }
} catch (e) {
  sessions = {};
}

function saveSessions() {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf8');
  } catch (e) {
    console.error('[Session Error]', e.message);
  }
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;
  rc.split(';').forEach(c => {
    const parts = c.split('=');
    const key = parts[0].trim();
    if (key) list[key] = decodeURIComponent(parts.slice(1).join('=').trim());
  });
  return list;
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        const params = new URLSearchParams(body);
        const obj = {};
        for (const [k, v] of params.entries()) obj[k] = v;
        resolve(obj);
      }
    });
    req.on('error', () => resolve({}));
  });
}

function requestDopa(urlStr, options, postData) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqOptions = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed });
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('DOPA request timeout (15s)'));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function parseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
      return JSON.parse(payload);
    }
  } catch (e) {}
  return null;
}

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

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

  // API: ThaiD Configuration
  if (pathname === '/api/auth/thaid/config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      authUrl: THAID_CONFIG.authUrl,
      clientId: THAID_CONFIG.clientId,
      redirectUri: THAID_CONFIG.redirectUri,
      scope: THAID_CONFIG.scope
    }));
    return;
  }

  // API: ThaiD Login URL Generator
  if (pathname === '/api/auth/thaid/login-url' && req.method === 'GET') {
    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = `${THAID_CONFIG.authUrl}?response_type=code&client_id=${THAID_CONFIG.clientId}&redirect_uri=${encodeURIComponent(THAID_CONFIG.redirectUri)}&scope=${encodeURIComponent(THAID_CONFIG.scope)}&state=${state}`;
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      authUrl,
      state
    }));
    return;
  }

  // API: ThaiD Callback (Exchange Code for Token & User Info)
  if (pathname === '/api/auth/thaid/callback' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const code = body.code || parsedUrl.searchParams.get('code');
      const state = body.state || parsedUrl.searchParams.get('state');

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Authorization code is required' }));
        return;
      }

      console.log(`[ThaID Auth] Received code: ${code.substring(0, 10)}... (state: ${state})`);

      // Exchange code for token with DOPA Token Endpoint
      const authHeader = 'Basic ' + Buffer.from(`${THAID_CONFIG.clientId}:${THAID_CONFIG.clientSecret}`).toString('base64');
      const postData = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: THAID_CONFIG.redirectUri
      }).toString();

      console.log('[ThaID Auth] Exchanging token with DOPA gateway...');
      const tokenRes = await requestDopa(THAID_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'x-api-key': THAID_CONFIG.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, postData);

      console.log(`[ThaID Auth] DOPA token response status: ${tokenRes.statusCode}`);

      let userInfo = {};
      let idPayload = {};

      if (tokenRes.statusCode === 200 && tokenRes.data && tokenRes.data.access_token) {
        const accessToken = tokenRes.data.access_token;
        const idToken = tokenRes.data.id_token;

        if (idToken) {
          idPayload = parseJwt(idToken) || {};
        }

        // Fetch userinfo from DOPA
        try {
          const userinfoRes = await requestDopa(THAID_CONFIG.userinfoUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'x-api-key': THAID_CONFIG.apiKey
            }
          });
          if (userinfoRes.statusCode === 200 && typeof userinfoRes.data === 'object') {
            userInfo = userinfoRes.data;
          }
        } catch (uiErr) {
          console.warn('[ThaID Auth] Userinfo endpoint call warning:', uiErr.message);
        }

        // Construct User Identity Record
        const pid = userInfo.pid || idPayload.pid || '1-4799-00000-00-0';
        const name = userInfo.name || idPayload.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || 'ผู้ใช้งาน ThaID';
        const user = {
          pid,
          name,
          title: userInfo.title || idPayload.title || '',
          given_name: userInfo.given_name || idPayload.given_name || '',
          family_name: userInfo.family_name || idPayload.family_name || '',
          birthdate: userInfo.birthdate || idPayload.birthdate || '',
          gender: userInfo.gender || idPayload.gender || '',
          ial: userInfo.ial || idPayload.ial || '2.3',
          provider: 'ThaID (DOPA - กรมการปกครอง)',
          verifiedAt: new Date().toISOString()
        };

        const sessionId = crypto.randomUUID();
        sessions[sessionId] = { user, createdAt: Date.now() };
        saveSessions();

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Set-Cookie': `thaid_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
        });
        res.end(JSON.stringify({ success: true, user }));
        return;
      } else {
        // DOPA returned an error (e.g. invalid code or pending IP whitelist)
        console.warn('[ThaID Auth Warning] DOPA token exchange rejected:', tokenRes.data);
        res.writeHead(tokenRes.statusCode || 400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: false,
          error: (tokenRes.data && (tokenRes.data.error_description || tokenRes.data.error)) || 'การยืนยันตัวตนกับกรมการปกครองขัดข้อง',
          dopaStatus: tokenRes.statusCode,
          dopaData: tokenRes.data
        }));
        return;
      }
    } catch (err) {
      console.error('[ThaID Callback Exception]', err);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: err.message }));
      return;
    }
  }

  // API: Get Current Authenticated ThaiD User
  if (pathname === '/api/auth/thaid/me' && req.method === 'GET') {
    const cookies = parseCookies(req);
    const sid = cookies.thaid_session;
    if (sid && sessions[sid]) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ authenticated: true, user: sessions[sid].user }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ authenticated: false, user: null }));
    }
    return;
  }

  // API: ThaiD Logout
  if (pathname === '/api/auth/thaid/logout' && req.method === 'POST') {
    const cookies = parseCookies(req);
    const sid = cookies.thaid_session;
    if (sid && sessions[sid]) {
      delete sessions[sid];
      saveSessions();
    }
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': 'thaid_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // API: ThaiD Demo / Simulation Mode (สำหรับเจ้าหน้าที่ IT ทดสอบระบบการแสดงผลก่อนการเชื่อมต่อจริง)
  if (pathname === '/api/auth/thaid/demo-login' && req.method === 'POST') {
    const user = {
      pid: '1-4799-00128-49-1',
      name: 'นายภาณุเดช เพียรชนะ',
      title: 'นาย',
      given_name: 'ภาณุเดช',
      family_name: 'เพียรชนะ',
      birthdate: '2540-08-15',
      gender: 'ชาย',
      role: 'นักวิชาการคอมพิวเตอร์ (IT รพ.โคกศรีสุพรรณ)',
      ial: '2.3 (Verified Level)',
      provider: 'ThaID (DOPA - กรมการปกครอง)',
      verifiedAt: new Date().toISOString()
    };
    const sessionId = crypto.randomUUID();
    sessions[sessionId] = { user, createdAt: Date.now() };
    saveSessions();

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': `thaid_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
    });
    res.end(JSON.stringify({ success: true, user, isDemo: true }));
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
