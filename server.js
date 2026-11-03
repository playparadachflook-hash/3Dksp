const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

const PORT = parseInt(process.env.PORT, 10) || 3080;
const PUBLIC_DIR = __dirname;

// =========================================================================
// MOPH Provider ID / Health ID OAuth Configuration (PRD Environment)
// =========================================================================
const MOPH_CONFIG = {
  HEALTH_ID_CLIENT_ID: 'Vm5IaU1QY21waWNGTWVHc2NSVDhYajNxMkRiMEFLQUw',
  HEALTH_ID_SECRET: 'dmZnb0lpb2NqYnBWVUFRN3BFTjV6bVp4UGE4SEhNaU82dVFxS3BuRA',
  HEALTH_ID_API_KEY: 'A4ovGdTNcJW6uhVu8LxfPQgFKtTT56Yzk5d96lon',
  PROVIDER_ID_CLIENT_ID: 'QVMwdkZzSXpzR05STUJTTkx1Smd1QU81dHJ5SFE2NFo',
  PROVIDER_ID_SECRET: 'V21Qa2dvQkRDWWZFYjdTdlJjbE5nN1ZnMUY5aWJiVU0zUFNwMXhGbg',
  PROVIDER_ID_API_KEY: 'vdWNePFng5t9wn7wh5VtprQAR63LiNe9EEolXalS',
  AUTH_REDIRECT_URL: 'https://moph.id.th/oauth/redirect',
  TOKEN_URL: 'https://moph.id.th/api/v1/token',
  PROVIDER_TOKEN_URL: 'https://provider.id.th/api/v1/services/token',
  PROVIDER_PROFILE_URL: 'https://provider.id.th/api/v1/services/profile',
  HOSPCODE: '11101',
  HOSPITAL_NAME: 'โรงพยาบาลโคกศรีสุพรรณ'
};

// =========================================================================
// HOSxP MySQL Database Pool (opduser)
// =========================================================================
let dbPool = null;
try {
  const mysql = require('mysql2/promise');
  dbPool = mysql.createPool({
    host: process.env.DB_HOST || '192.168.2.254',
    user: process.env.DB_USER || 'opd',
    password: process.env.DB_PASSWORD || 'opd',
    database: process.env.DB_NAME || 'hos',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
  console.log('[HOSxP Database] MySQL pool connected to 192.168.2.254 (hos)');
} catch (e) {
  console.warn('[HOSxP Database] MySQL pool init warning:', e.message);
}

async function queryHOSxP(sql, params = []) {
  if (!dbPool) return [];
  try {
    const [rows] = await dbPool.query(sql, params);
    return rows;
  } catch (err) {
    console.error('[HOSxP Query Error]', err.message);
    return [];
  }
}

// =========================================================================
// Sessions Persistence (moph_sessions.json)
// =========================================================================
const SESSIONS_FILE = path.join(__dirname, 'moph_sessions.json');
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
    console.error('[Session Save Error]', e.message);
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

function getCallbackUrl(req) {
  // Registered Callback Endpoint in MOPH Developer Console is http://147.50.107.211:3080/
  const host = req.headers['host'] || '147.50.107.211:3080';
  if (host.includes('147.50.107.211')) {
    return 'http://147.50.107.211:3080/';
  }
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto ? forwardedProto.split(',')[0].trim() : 'http';
  return `${protocol}://${host}/`;
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

  // =========================================================================
  // MOPH Provider ID Authentication Flow
  // =========================================================================

  // Step 1 (Redirect Login): Redirect user to MOPH Health ID OAuth
  if (pathname === '/api/auth/moph/login' && req.method === 'GET') {
    const callbackUrl = getCallbackUrl(req);
    const state = crypto.randomBytes(16).toString('hex');
    const targetUrl = `${MOPH_CONFIG.AUTH_REDIRECT_URL}?client_id=${MOPH_CONFIG.HEALTH_ID_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&state=${state}&scope=openid%20profile%20pid`;
    console.log(`[MOPH Auth] Redirecting user to: ${targetUrl}`);
    res.writeHead(302, { 'Location': targetUrl });
    res.end();
    return;
  }

  // Step 2, 3, 4, 5: MOPH OAuth Callback Handler (handles /api/auth/moph/callback AND /?code=...)
  const isAuthCallback = (pathname === '/api/auth/moph/callback') ||
    ((pathname === '/' || pathname === '/index.html') && (parsedUrl.searchParams.has('code') || parsedUrl.searchParams.has('error')));

  if (isAuthCallback && req.method === 'GET') {
    const code = parsedUrl.searchParams.get('code');
    const state = parsedUrl.searchParams.get('state');
    const error = parsedUrl.searchParams.get('error') || parsedUrl.searchParams.get('error_description');

    if (error || !code) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>เข้าสู่ระบบไม่สำเร็จ - MOPH Provider ID</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 440px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h2 { color: #f87171; margin-top: 0; }
    p { color: #cbd5e1; font-size: 14px; line-height: 1.6; }
    a { display: inline-block; margin-top: 20px; background: #059669; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h2>⚠️ การยืนยันตัวตนไม่สำเร็จ</h2>
    <p>${error || 'ไม่ได้รับ Authorization Code จากระบบ MOPH Provider ID'}</p>
    <a href="/">กลับหน้าหลัก</a>
  </div>
</body>
</html>`);
      return;
    }

    try {
      const callbackUrl = getCallbackUrl(req);
      const userAgent = req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

      // Step 2: Exchange Health ID Token
      console.log(`[MOPH Auth] Exchanging code: ${code.substring(0, 10)}... via ${MOPH_CONFIG.TOKEN_URL}`);
      const tokenRes = await fetch(MOPH_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'x-api-key': MOPH_CONFIG.HEALTH_ID_API_KEY
        },
        body: JSON.stringify({
          client_id: MOPH_CONFIG.HEALTH_ID_CLIENT_ID,
          client_secret: MOPH_CONFIG.HEALTH_ID_SECRET,
          code: code,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code'
        })
      });

      const tokenText = await tokenRes.text();
      let tokenData = {};
      try {
        tokenData = JSON.parse(tokenText);
      } catch (e) {
        throw new Error(`Health ID Token exchange HTTP ${tokenRes.status}: ${tokenText.substring(0, 150)}`);
      }

      if (tokenData.status === 'fail' || tokenData.error) {
        throw new Error(tokenData.message || tokenData.error_description || tokenData.error || 'Health ID Token exchange failed');
      }

      const healthToken = (tokenData.data && (tokenData.data.access_token || tokenData.data.token))
                       || tokenData.access_token
                       || tokenData.token;

      if (!healthToken) {
        throw new Error('ไม่พบ access_token ในผลลัพธ์ของ Health ID Token');
      }

      // Step 3: Exchange Provider ID Token
      console.log(`[MOPH Auth] Exchanging Health ID token for Provider ID access token...`);
      const pRes = await fetch(MOPH_CONFIG.PROVIDER_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'client-id': MOPH_CONFIG.PROVIDER_ID_CLIENT_ID,
          'secret-key': MOPH_CONFIG.PROVIDER_ID_SECRET,
          'x-api-key': MOPH_CONFIG.PROVIDER_ID_API_KEY
        },
        body: JSON.stringify({
          client_id: MOPH_CONFIG.PROVIDER_ID_CLIENT_ID,
          secret_key: MOPH_CONFIG.PROVIDER_ID_SECRET,
          token_by: 'Health ID',
          token: healthToken
        })
      });

      const pText = await pRes.text();
      let pJson = {};
      try {
        pJson = JSON.parse(pText);
      } catch (e) {
        throw new Error(`Provider Token endpoint HTTP ${pRes.status}: ${pText.substring(0, 150)}`);
      }

      const providerAccessToken = pJson && pJson.data && pJson.data.access_token;
      if (!providerAccessToken) {
        throw new Error(pJson.message || pJson.message_th || 'ไม่สามารถรับ Provider ID Access Token ได้');
      }

      // Step 4: Get Provider Profile
      console.log(`[MOPH Auth] Fetching Provider profile from ${MOPH_CONFIG.PROVIDER_PROFILE_URL}...`);
      const profRes = await fetch(MOPH_CONFIG.PROVIDER_PROFILE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerAccessToken}`,
          'client-id': MOPH_CONFIG.PROVIDER_ID_CLIENT_ID,
          'secret-key': MOPH_CONFIG.PROVIDER_ID_SECRET,
          'x-api-key': MOPH_CONFIG.PROVIDER_ID_API_KEY,
          'User-Agent': userAgent
        }
      });

      const profText = await profRes.text();
      let profJson = {};
      try {
        profJson = JSON.parse(profText);
      } catch (e) {
        throw new Error(`Provider Profile endpoint HTTP ${profRes.status}: ${profText.substring(0, 150)}`);
      }

      const pData = profJson.data || {};
      const hashCid = pData.hash_cid || null;
      const name_th = pData.name_th || `${pData.firstname_th || ''} ${pData.lastname_th || ''}`.trim() || null;
      let licenseId = null;
      if (Array.isArray(pData.organization) && pData.organization.length > 0) {
        licenseId = pData.organization[0].license_id || null;
      }

      console.log(`[MOPH Auth] Profile received: Name="${name_th}", hash_cid="${hashCid}", license="${licenseId}"`);

      // Step 5: Match User in HOSxP Database (opduser)
      let matchedUser = null;

      // A. Match strictly by hash_cid (SHA-256 of Thai National ID without dashes)
      if (hashCid) {
        console.log(`[MOPH Auth] Matching HOSxP opduser by hash_cid: ${hashCid}`);
        const rows = await queryHOSxP(`
          SELECT u.loginname, u.name, u.doctorcode, u.groupname, u.department, u.cid, u.account_disable
          FROM opduser u
          WHERE SHA2(REPLACE(u.cid, '-', ''), 256) = ? AND (u.account_disable IS NULL OR u.account_disable != 'Y')
          LIMIT 1
        `, [hashCid]);
        if (rows.length > 0) matchedUser = rows[0];
      }

      // B. Fallback: Match by Doctor License ID (เลข ว.)
      if (!matchedUser && licenseId) {
        console.log(`[MOPH Auth] Matching HOSxP opduser by doctor license: ${licenseId}`);
        const rows = await queryHOSxP(`
          SELECT u.loginname, u.name, u.doctorcode, u.groupname, u.department, u.cid, u.account_disable
          FROM opduser u
          LEFT JOIN doctor d ON d.code = u.doctorcode
          WHERE (d.licenseno = ? OR u.doctorcode = ?) AND (u.account_disable IS NULL OR u.account_disable != 'Y')
          LIMIT 1
        `, [licenseId, licenseId]);
        if (rows.length > 0) matchedUser = rows[0];
      }

      // C. Fallback: Match by Thai Name
      if (!matchedUser && name_th) {
        console.log(`[MOPH Auth] Matching HOSxP opduser by name: ${name_th}`);
        const rows = await queryHOSxP(`
          SELECT u.loginname, u.name, u.doctorcode, u.groupname, u.department, u.cid, u.account_disable
          FROM opduser u
          WHERE (u.name = ? OR u.name LIKE ?) AND (u.account_disable IS NULL OR u.account_disable != 'Y')
          LIMIT 1
        `, [name_th, `%${name_th}%`]);
        if (rows.length > 0) matchedUser = rows[0];
      }

      // Step 6: Construct Session User
      const sessionUser = {
        loginname: matchedUser ? matchedUser.loginname : 'moph_provider',
        name: matchedUser ? matchedUser.name : (name_th || 'เจ้าหน้าที่สาธารณสุข'),
        doctorcode: matchedUser ? matchedUser.doctorcode : null,
        groupname: matchedUser ? matchedUser.groupname : 'บุคลากรทางการแพทย์',
        department: matchedUser ? matchedUser.department : MOPH_CONFIG.HOSPITAL_NAME,
        license_id: licenseId,
        hash_cid: hashCid,
        provider_id: pData.provider_id || null,
        provider_type: pData.provider_type || null,
        organizations: pData.organization || [],
        auth_provider: 'MOPH Provider ID (หมอพร้อม)',
        verified_hosxp: Boolean(matchedUser),
        login_at: new Date().toISOString()
      };

      const sessionId = crypto.randomUUID();
      sessions[sessionId] = { user: sessionUser, createdAt: Date.now() };
      saveSessions();

      console.log(`[MOPH Auth] Login success! User: ${sessionUser.name} (${sessionUser.loginname}), Session: ${sessionId}`);

      // Respond with Content-Type: text/html; charset=utf-8
      const b64User = Buffer.from(JSON.stringify(sessionUser), 'utf-8').toString('base64');
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': `moph_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
      });
      res.end(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>เข้าสู่ระบบสำเร็จ - โรงพยาบาลโคกศรีสุพรรณ</title>
  <style>
    body {
      margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh;
      background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .card {
      background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 36px 32px; text-align: center; max-width: 420px; width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .icon { font-size: 54px; margin-bottom: 12px; }
    h2 { margin: 0 0 8px; color: #34d399; font-size: 22px; }
    p { margin: 6px 0; color: #94a3b8; font-size: 14px; }
    .user-box {
      background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 14px; margin: 18px 0; text-align: left;
    }
    .user-name { font-weight: 700; color: #f8fafc; font-size: 15px; }
    .user-sub { font-size: 12px; color: #6ee7b7; margin-top: 4px; }
    .loader {
      display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(52, 211, 153, 0.3); border-radius: 50%;
      border-top-color: #34d399; animation: spin 1s ease-in-out infinite; margin-top: 14px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🩺</div>
    <h2>เข้าสู่ระบบสำเร็จ</h2>
    <p>ยืนยันตัวตนผ่าน MOPH Provider ID เรียบร้อย</p>
    <div class="user-box">
      <div class="user-name">คุณ${sessionUser.name}</div>
      <div class="user-sub">${sessionUser.groupname || 'บุคลากร'} • ${sessionUser.department || 'รพ.โคกศรีสุพรรณ'} ${sessionUser.doctorcode ? '[ว.' + sessionUser.doctorcode + ']' : ''}</div>
    </div>
    <div class="loader"></div>
    <p style="font-size: 12px; color: #64748b; margin-top: 12px;">กำลังนำท่านเข้าสู่ระบบ Digital Twin...</p>
  </div>
  <script>
    try {
      const user = JSON.parse(atob("${b64User}"));
      localStorage.setItem('moph_user', JSON.stringify(user));
    } catch (e) {
      console.warn('localStorage save warning:', e);
    }
    setTimeout(() => {
      window.location.replace('/');
    }, 1200);
  </script>
</body>
</html>`);
    } catch (err) {
      console.error('[MOPH Auth Callback Exception]', err);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>เข้าสู่ระบบไม่สำเร็จ - MOPH Provider ID</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
    .card { background: #1e293b; border: 1px solid #ef4444; border-radius: 16px; padding: 32px; max-width: 440px; text-align: center; }
    h2 { color: #f87171; margin-top: 0; }
    p { color: #cbd5e1; font-size: 14px; line-height: 1.6; }
    a { display: inline-block; margin-top: 20px; background: #059669; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h2>❌ เกิดข้อผิดพลาดในการเชื่อมต่อ</h2>
    <p>${err.message}</p>
    <a href="/">กลับหน้าหลัก</a>
  </div>
</body>
</html>`);
    }
    return;
  }

  // API: Get Current Authenticated MOPH User
  if (pathname === '/api/auth/moph/me' && req.method === 'GET') {
    const cookies = parseCookies(req);
    const sid = cookies.moph_session;
    if (sid && sessions[sid]) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ authenticated: true, user: sessions[sid].user }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ authenticated: false, user: null }));
    }
    return;
  }

  // API: MOPH Logout
  if (pathname === '/api/auth/moph/logout' && req.method === 'POST') {
    const cookies = parseCookies(req);
    const sid = cookies.moph_session;
    if (sid && sessions[sid]) {
      delete sessions[sid];
      saveSessions();
    }
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': 'moph_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    });
    res.end(JSON.stringify({ success: true }));
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
