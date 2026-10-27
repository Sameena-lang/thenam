/**
 * End-to-End Image & Media Management Integration Test
 * Verifies upload security, magic byte validation, auth guards, deletion protection,
 * image replacement cascade, and site settings.
 */

const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

// 1x1 Transparent PNG binary buffer
const VALID_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

// Fake image buffer (text file masquerading as image)
const FAKE_IMAGE_BUFFER = Buffer.from('THIS IS NOT A REAL PNG FILE AT ALL. IT IS PLAIN TEXT.')

async function runTests() {
  console.log('=====================================================')
  console.log('🚀 RUNNING MEDIA MANAGEMENT INTEGRATION TEST SUITE')
  console.log(`Target: ${BASE_URL}`)
  console.log('=====================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${message}`)
      failed++
    }
  }

  try {
    // -----------------------------------------------------------------
    // TEST 1: Unauthorized access rejection
    // -----------------------------------------------------------------
    console.log('--- Test 1: Authentication & Authorization Guards ---')
    const unauthRes = await fetch(`${BASE_URL}/api/admin/media`)
    assert(unauthRes.status === 401, 'GET /api/admin/media rejects unauthenticated requests with 401')

    const unauthPost = await fetch(`${BASE_URL}/api/admin/media`, { method: 'POST' })
    assert(unauthPost.status === 401, 'POST /api/admin/media rejects unauthenticated requests with 401')

    const unauthSettings = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'homepage_hero_bg', value: '/test.png' }),
    })
    assert(unauthSettings.status === 401, 'PATCH /api/admin/site-settings rejects unauthenticated requests with 401')

    // -----------------------------------------------------------------
    // TEST 2: Admin Authentication (Login)
    // -----------------------------------------------------------------
    console.log('\n--- Test 2: Admin Login ---')
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@thenamsoft.com',
        password: 'ThenamAdmin#2026',
      }),
    })
    assert(loginRes.status === 200, 'Admin login succeeds with 200 OK')

    // Extract session cookie
    const setCookie = loginRes.headers.get('set-cookie')
    assert(Boolean(setCookie && setCookie.includes('thenam_admin_session')), 'Session cookie thenam_admin_session received')

    const authHeaders = {
      Cookie: setCookie ? setCookie.split(';')[0] : '',
    }

    // -----------------------------------------------------------------
    // TEST 3: Media Library Listing
    // -----------------------------------------------------------------
    console.log('\n--- Test 3: Media Library Listing & Statistics ---')
    const listRes = await fetch(`${BASE_URL}/api/admin/media`, { headers: authHeaders })
    assert(listRes.status === 200, 'GET /api/admin/media succeeds with 200 OK')
    const listData = await listRes.json()
    assert(Array.isArray(listData.media) && listData.media.length >= 10, `Found ${listData.media.length} media records in database`)
    assert(listData.stats && listData.stats.totalCount >= 10, 'Media stats return totalCount')
    console.log(`   Total media: ${listData.stats.totalCount}, Total size: ${Math.round(listData.stats.totalBytes / 1024)} KB`)

    // Verify system assets are present
    const heroBg = listData.media.find((m) => m.url === '/hero-bg.png')
    assert(Boolean(heroBg), 'System hero background (/hero-bg.png) exists in media library')
    assert(heroBg && heroBg.is_in_use === true, 'Hero background correctly detected as is_in_use=true')

    // -----------------------------------------------------------------
    // TEST 4: Upload Validation (Reject Fake / Forged Image)
    // -----------------------------------------------------------------
    console.log('\n--- Test 4: Upload Security & Magic Byte Validation ---')
    const fakeBlob = new Blob([FAKE_IMAGE_BUFFER], { type: 'image/png' })
    const fakeForm = new FormData()
    fakeForm.append('file', fakeBlob, 'fake-malicious.png')
    fakeForm.append('alt_text', 'Malicious file disguised as PNG')

    const fakeUploadRes = await fetch(`${BASE_URL}/api/admin/media`, {
      method: 'POST',
      headers: authHeaders,
      body: fakeForm,
    })
    assert(fakeUploadRes.status === 400, 'Reject forged file with 400 Bad Request')
    const fakeJson = await fakeUploadRes.json()
    assert(Boolean(fakeJson.error && (fakeJson.error.toLowerCase().includes('unsupported') || fakeJson.error.toLowerCase().includes('invalid'))), `Rejection message validated: "${fakeJson.error}"`)

    // -----------------------------------------------------------------
    // TEST 5: Valid PNG Upload
    // -----------------------------------------------------------------
    console.log('\n--- Test 5: Valid Image Upload & Metadata Parsing ---')
    const validBlob = new Blob([VALID_PNG_BUFFER], { type: 'image/png' })
    const validForm = new FormData()
    validForm.append('file', validBlob, 'test-pixel.png')
    validForm.append('alt_text', 'Automated Test 1x1 Pixel')
    validForm.append('section_tag', 'general')

    const validUploadRes = await fetch(`${BASE_URL}/api/admin/media`, {
      method: 'POST',
      headers: authHeaders,
      body: validForm,
    })
    assert(validUploadRes.status === 200 || validUploadRes.status === 201, 'Upload valid PNG returns 200/201 status')
    const uploadJson = await validUploadRes.json()
    const uploadedMedia = uploadJson.media
    assert(Boolean(uploadedMedia && uploadedMedia.id), 'Uploaded media object returned with unique ID')
    assert(uploadedMedia.mime_type === 'image/png', 'MIME type verified as image/png')
    assert(uploadedMedia.width === 1 && uploadedMedia.height === 1, `Dimensions parsed correctly: ${uploadedMedia.width}x${uploadedMedia.height}`)
    assert(uploadedMedia.url.startsWith('/uploads/'), `URL correctly points to /uploads/: ${uploadedMedia.url}`)

    // -----------------------------------------------------------------
    // TEST 6: In-Use Deletion Protection
    // -----------------------------------------------------------------
    console.log('\n--- Test 6: Safe Deletion Guard (In-Use Protection) ---')
    if (heroBg) {
      const deleteInUseRes = await fetch(`${BASE_URL}/api/admin/media/${heroBg.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      assert(deleteInUseRes.status === 400, 'Attempting to delete active image returns 400 Bad Request')
      const delErrJson = await deleteInUseRes.json()
      assert(delErrJson.inUse === true, 'Response specifies inUse: true')
      assert(Array.isArray(delErrJson.locations) && delErrJson.locations.length > 0, `Dependency locations reported: ${delErrJson.locations.join(', ')}`)
    }

    // -----------------------------------------------------------------
    // TEST 7: Image Replacement & Cascade
    // -----------------------------------------------------------------
    console.log('\n--- Test 7: Image Replacement & Cascade ---')
    const replaceForm = new FormData()
    replaceForm.append('file', validBlob, 'replacement-pixel.png')
    replaceForm.append('alt_text', 'Updated Replacement Pixel Alt')

    const replaceRes = await fetch(`${BASE_URL}/api/admin/media/${uploadedMedia.id}/replace`, {
      method: 'POST',
      headers: authHeaders,
      body: replaceForm,
    })
    assert(replaceRes.status === 200, 'Replacing media file returns 200 OK')
    const replaceJson = await replaceRes.json()
    assert(replaceJson.success === true, 'Replacement successful flag set')
    assert(replaceJson.media.alt_text === 'Updated Replacement Pixel Alt', 'Alt text updated during replacement')

    // -----------------------------------------------------------------
    // TEST 8: Successful Deletion of Unreferenced Image
    // -----------------------------------------------------------------
    console.log('\n--- Test 8: Deletion of Unused Image ---')
    const deleteRes = await fetch(`${BASE_URL}/api/admin/media/${uploadedMedia.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    })
    assert(deleteRes.status === 200, 'Deleting unused media returns 200 OK')
    const deleteJson = await deleteRes.json()
    assert(deleteJson.success === true, 'Delete confirmed with success: true')

    // Verify physical file was removed
    const physicalPath = path.join(process.cwd(), 'public', replaceJson.media.url.replace(/^\//, ''))
    assert(!fs.existsSync(physicalPath), `Physical file removed from disk: ${physicalPath}`)

    // -----------------------------------------------------------------
    // TEST 9: Public and Admin Site Settings
    // -----------------------------------------------------------------
    console.log('\n--- Test 9: Site Settings API ---')
    const publicSettingsRes = await fetch(`${BASE_URL}/api/site-settings`)
    assert(publicSettingsRes.status === 200, 'GET /api/site-settings succeeds with 200 OK')
    const publicSettings = await publicSettingsRes.json()
    assert(publicSettings.settings && publicSettings.settings.homepage_hero_bg === '/hero-bg.png', 'Default hero background setting is /hero-bg.png')

    const updateSettingRes = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'homepage_hero_bg',
        value: '/hero-bg.png', // keep safe default
      }),
    })
    assert(updateSettingRes.status === 200, 'PATCH /api/admin/site-settings succeeds with 200 OK')

    // -----------------------------------------------------------------
    // TEST 10: Services & Products Image Attachment & Persistence
    // -----------------------------------------------------------------
    console.log('\n--- Test 10: Services & Products Image Persistence ---')
    // Update service image
    const serviceRes = await fetch(`${BASE_URL}/api/admin/services/web-development`, {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: '/services/web-development.jpg',
        image_alt: 'Full-Stack Web Development Illustration',
      }),
    })
    assert(serviceRes.status === 200, 'PATCH service with image_url succeeds')
    const sJson = await serviceRes.json()
    assert(sJson.service && sJson.service.image_url === '/services/web-development.jpg', 'Service image_url persisted in database')

    // Update product image
    const productRes = await fetch(`${BASE_URL}/api/admin/products/agrismart`, {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: '/projects/featured-agrismart-hq.png',
        image_alt: 'AgriSmart Precision Agriculture Dashboard Mockup',
      }),
    })
    assert(productRes.status === 200, 'PATCH product with image_url succeeds')
    const pJson = await productRes.json()
    assert(pJson.product && pJson.product.image_url === '/projects/featured-agrismart-hq.png', 'Product image_url persisted in database')

    // -----------------------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------------------
    console.log('\n=====================================================')
    console.log(`🎉 TEST RUN COMPLETED: ${passed} PASSED, ${failed} FAILED`)
    console.log('=====================================================')

    if (failed > 0) {
      process.exit(1)
    }
  } catch (err) {
    console.error('Fatal test error:', err)
    process.exit(1)
  }
}

runTests()
