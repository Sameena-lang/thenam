const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (_) {}
        resolve({ statusCode: res.statusCode, headers: res.headers, body, json });
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function testToggle() {
  // Login
  const login = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'admin@thenamsoft.com', password: 'ThenamAdmin#2026' });
  const cookie = login.headers['set-cookie'][0].split(';')[0];

  // 1. Hide mobile-apps
  console.log('Toggling mobile-apps to Hidden (is_active: 0)...');
  await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/services/mobile-apps',
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
  }, { is_active: 0 });

  let pub = await request({ hostname: 'localhost', port: 3000, path: '/api/services', method: 'GET' });
  let found = pub.json.services.find(s => s.id === 'mobile-apps');
  console.log('Public services count when 1 hidden:', pub.json.services.length, '(Found mobile-apps:', Boolean(found), ')');
  if (found) throw new Error('mobile-apps should not be in public list when hidden');

  // 2. Unhide mobile-apps
  console.log('Restoring mobile-apps to Active (is_active: 1)...');
  await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/services/mobile-apps',
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
  }, { is_active: 1 });

  pub = await request({ hostname: 'localhost', port: 3000, path: '/api/services', method: 'GET' });
  found = pub.json.services.find(s => s.id === 'mobile-apps');
  console.log('Public services count when restored:', pub.json.services.length, '(Found mobile-apps:', Boolean(found), ')');
  if (!found) throw new Error('mobile-apps should be in public list when active');

  console.log('>>> Visibility toggle test passed cleanly! <<<');
}

testToggle().catch(err => {
  console.error(err);
  process.exit(1);
});
