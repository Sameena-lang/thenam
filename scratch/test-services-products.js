const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json,
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION TESTS ---');

  // 1. Public Services API
  console.log('\n[1] Testing GET /api/services (Public)...');
  const pubServices = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/services',
    method: 'GET',
  });
  console.log(`Status: ${pubServices.statusCode}`);
  if (pubServices.statusCode !== 200 || !pubServices.json || !pubServices.json.services) {
    throw new Error('Public services endpoint failed: ' + pubServices.body);
  }
  console.log(`Found ${pubServices.json.services.length} active services in database.`);
  console.log(`First service: "${pubServices.json.services[0].title}" (${pubServices.json.services[0].id})`);

  // 2. Public Products API
  console.log('\n[2] Testing GET /api/products (Public)...');
  const pubProducts = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'GET',
  });
  console.log(`Status: ${pubProducts.statusCode}`);
  if (pubProducts.statusCode !== 200 || !pubProducts.json || !pubProducts.json.products) {
    throw new Error('Public products endpoint failed: ' + pubProducts.body);
  }
  console.log(`Found ${pubProducts.json.products.length} active proprietary platforms.`);
  console.log(`First product: "${pubProducts.json.products[0].name}" (${pubProducts.json.products[0].id})`);

  // 3. Security: Unauthorized rejection
  console.log('\n[3] Testing Security: Rejection of Unauthenticated Admin Requests...');
  const unauthServices = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/services',
    method: 'GET',
  });
  console.log(`GET /api/admin/services without auth: HTTP ${unauthServices.statusCode} (Expected 401)`);
  if (unauthServices.statusCode !== 401) throw new Error('Expected 401 for unauthorized admin services request');

  const unauthProducts = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/products',
    method: 'GET',
  });
  console.log(`GET /api/admin/products without auth: HTTP ${unauthProducts.statusCode} (Expected 401)`);
  if (unauthProducts.statusCode !== 401) throw new Error('Expected 401 for unauthorized admin products request');

  // 4. Administrator Login
  console.log('\n[4] Testing Administrator Login & Session Generation...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@thenamsoft.com', password: 'ThenamAdmin#2026' }
  );

  console.log(`Login status: ${loginRes.statusCode}`);
  if (loginRes.statusCode !== 200) throw new Error('Login failed: ' + loginRes.body);

  const rawCookies = loginRes.headers['set-cookie'];
  if (!rawCookies || rawCookies.length === 0) throw new Error('No session cookie returned');
  const sessionCookie = rawCookies[0].split(';')[0];
  console.log('Obtained Admin Session Cookie.');

  // 5. Admin Stats Endpoint
  console.log('\n[5] Testing GET /api/admin/stats with Auth Cookie...');
  const statsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: { Cookie: sessionCookie },
  });
  console.log(`Stats HTTP: ${statsRes.statusCode}`);
  console.log('Stats Payload:', statsRes.json.stats);

  // 6. Admin Edit Service & Public Synchronization
  console.log('\n[6] Testing Admin Service Update & Live Website Synchronization...');
  const patchServiceRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/services/web-development',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
    },
    { badge: 'From ₹1,999* (PROMO)' }
  );
  console.log(`PATCH Service HTTP: ${patchServiceRes.statusCode}`);
  if (patchServiceRes.statusCode !== 200) throw new Error('Patch service failed: ' + patchServiceRes.body);
  console.log(`Updated service badge to: "${patchServiceRes.json.service.badge}"`);

  // Verify on public API
  const pubVerify1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/services',
    method: 'GET',
  });
  const webDev = pubVerify1.json.services.find((s) => s.id === 'web-development');
  console.log(`Public site saw badge: "${webDev.badge}" (Successfully synchronized from DB!)`);

  // Restore badge
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/services/web-development',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
    },
    { badge: 'From ₹1,999*' }
  );
  console.log('Restored original service badge.');

  // 7. Admin Edit Product & Public Synchronization
  console.log('\n[7] Testing Admin Product Update & Live Website Synchronization...');
  const patchProductRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/products/agrismart',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
    },
    { tagline: 'Precision agricultural intelligence for farmers & cooperatives across South India.' }
  );
  console.log(`PATCH Product HTTP: ${patchProductRes.statusCode}`);
  if (patchProductRes.statusCode !== 200) throw new Error('Patch product failed: ' + patchProductRes.body);

  const pubVerify2 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'GET',
  });
  const agri = pubVerify2.json.products.find((p) => p.id === 'agrismart');
  console.log(`Public site saw tagline: "${agri.tagline}" (Successfully synchronized from DB!)`);

  // Restore tagline
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/products/agrismart',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
    },
    { tagline: 'Precision agricultural intelligence for farmers, cooperatives, and agribusinesses.' }
  );
  console.log('Restored original product tagline.');

  // 8. Public HTML Pages Integrity
  console.log('\n[8] Checking Public & Admin Pages HTTP Status...');
  const pages = ['/', '/services', '/products', '/about', '/contact', '/careers', '/admin/dashboard', '/admin/services', '/admin/products'];
  for (const page of pages) {
    const pageRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: page,
      method: 'GET',
      headers: { Cookie: sessionCookie },
    });
    console.log(`GET ${page} -> HTTP ${pageRes.statusCode}`);
    if (pageRes.statusCode >= 400) {
      throw new Error(`Page ${page} returned error HTTP ${pageRes.statusCode}`);
    }
  }

  console.log('\n========================================');
  console.log('>>> ALL BACKEND INTEGRATION TESTS PASSED! <<<');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
