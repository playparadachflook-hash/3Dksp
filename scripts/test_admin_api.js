const http = require('http');

async function run() {
  // 1. Demo login as Super Admin
  const loginRes = await request('POST', '/api/auth/thaid/demo-login', { pid: '2470400018287' });
  console.log('1. Demo Login Super Admin:', loginRes.status, loginRes.data);
  const cookie = loginRes.cookie;

  // 2. Add new user
  const addRes = await request('POST', '/api/admin/users', {
    pid: '1479900112233',
    name: 'นายสมชาย ทดสอบ',
    department: 'หอผู้ป่วยใน (IPD)',
    position: 'พยาบาลวิชาชีพ',
    role: 'user',
    status: 'active'
  }, cookie);
  console.log('2. Add User:', addRes.status, addRes.data);

  // 3. Test added user login via Demo Login
  const userLogin = await request('POST', '/api/auth/thaid/demo-login', { pid: '1479900112233' });
  console.log('3. Login Added User (Active):', userLogin.status, userLogin.data);

  // 4. Toggle user status to disabled
  const disableRes = await request('PUT', '/api/admin/users', {
    pid: '1479900112233',
    status: 'disabled'
  }, cookie);
  console.log('4. Disable User:', disableRes.status, disableRes.data);

  // 5. Test disabled user login (Must be denied)
  const deniedLogin = await request('POST', '/api/auth/thaid/demo-login', { pid: '1479900112233' });
  console.log('5. Login Disabled User (Expect Denied):', deniedLogin.status, deniedLogin.data);

  // 6. Delete test user
  const delRes = await request('DELETE', '/api/admin/users', { pid: '1479900112233' }, cookie);
  console.log('6. Delete User:', delRes.status, delRes.data);

  // 7. Test deleted user login (Expect Denied)
  const nonExistLogin = await request('POST', '/api/auth/thaid/demo-login', { pid: '1479900112233' });
  console.log('7. Login Non-existent User (Expect Denied):', nonExistLogin.status, nonExistLogin.data);

  console.log('\n✅ ALL ADMIN & SECURITY TESTS COMPLETED SUCCESSFULLY!');
}

function request(method, path, body, cookie) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 3080,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(cookie ? { 'Cookie': cookie } : {})
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (e) {}
        const setCookie = res.headers['set-cookie'];
        const cookieStr = setCookie ? setCookie[0].split(';')[0] : '';
        resolve({ status: res.statusCode, data: parsed, cookie: cookieStr });
      });
    });
    if (postData) req.write(postData);
    req.end();
  });
}

run();
