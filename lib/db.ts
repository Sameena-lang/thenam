import { Pool, types as pgTypes } from 'pg'
import { PROJECTS, ProjectDetail } from './projects-data'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { inspectImageBuffer } from './media-storage'

// Types
export interface AdminUser {
  id: string
  email: string
  name: string
  password_hash: string
  salt: string
  role: 'super_admin' | 'admin' | 'viewer'
  status: 'active' | 'deactivated'
  created_at: string
  last_login: string | null
}

export interface WebsiteUser {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  role: 'client' | 'partner' | 'student' | 'founder'
  status: 'active' | 'pending' | 'deactivated'
  created_at: string
  notes: string | null
}

export interface Inquiry {
  id: string
  full_name: string
  email: string
  phone: string | null
  company: string | null
  service_id: string
  service_name: string
  budget_tier: string | null
  timeline: string | null
  message: string
  need_nda: number
  status: 'new' | 'reviewing' | 'contacted' | 'closed'
  created_at: string
}

export interface CareerApplication {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
  portfolio_link: string | null
  experience_level: string | null
  message: string | null
  status: 'submitted' | 'screening' | 'interviewed' | 'accepted' | 'rejected'
  created_at: string
}

export interface AuditLog {
  id: string
  admin_id: string | null
  admin_email: string | null
  action: string
  target_type: string | null
  target_id: string | null
  details: string | null
  created_at: string
}

export interface ServiceItem {
  id: string
  title: string
  subtitle: string
  badge: string
  description: string
  color_class: string
  icon_name: string
  features: string // JSON array
  sort_order: number
  is_active: number
  image_url?: string | null
  image_alt?: string | null
  created_at: string
  updated_at: string
}

export interface ProductItem {
  id: string
  name: string
  category: string
  badge: string
  badge_color: string
  icon_name: string
  icon_color: string
  icon_bg: string
  tagline: string
  description: string
  tags: string // JSON array
  metrics: string // JSON array
  features: string // JSON array
  sort_order: number
  is_active: number
  image_url?: string | null
  image_alt?: string | null
  created_at: string
  updated_at: string
}

export interface MediaItem {
  id: string
  filename: string
  original_name: string
  url: string
  alt_text: string
  mime_type: string
  file_size: number
  width: number
  height: number
  section_tag: string // 'hero' | 'services' | 'products' | 'team' | 'portfolio' | 'general'
  usage_ref: string | null
  is_system: number
  created_at: string
  updated_at: string
}

export interface ContentItem {
  id: string
  title: string
  subtitle: string | null
  short_description: string
  full_description: string | null
  image_url: string | null
  image_alt: string | null
  page: string // 'home' | 'services' | 'products' | 'projects' | 'about' | 'careers' | 'collaboration'
  section: string
  button_text: string | null
  button_url: string | null
  display_order: number
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export interface ProjectItem {
  slug: string
  title_first: string
  title_second: string
  subtitle: string
  category_eyebrow: string
  domain: string
  visit_url: string
  category: string
  year: string
  practice: string
  phase: string
  mockup_image: string
  short_desc: string
  tag: string
  tag_type: string
  thumbnail: string
  sort_order: number
  is_active: number
  created_at: string
  updated_at: string
}

export interface SiteSetting {
  key: string
  value: string
  description: string | null
  updated_at: string
}

export interface AdminNotification {
  id: string
  type: 'inquiry' | 'quote' | 'user' | 'application' | 'audit' | 'system'
  title: string
  message: string
  link: string
  reference_id: string | null
  reference_type: string | null
  is_read: number
  created_at: string
}

export interface PageViewRecord {
  id: string
  visitor_id: string
  session_id: string
  path: string
  title: string | null
  referrer: string | null
  service_id: string | null
  product_id: string | null
  device_type: string
  browser: string | null
  os: string | null
  created_at: string
  date: string
}

export interface AnalyticsEventRecord {
  id: string
  visitor_id: string
  session_id: string
  event_name: string
  event_category: string
  resource_id: string | null
  resource_name: string | null
  created_at: string
  date: string
}

declare global {
  // eslint-disable-next-line no-var
  var __thenam_pg_pool__: Pool | undefined
}

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to connect to the THENAM PostgreSQL database.')
  }

  if (!globalThis.__thenam_pg_pool__) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
    pool.on('error', (error) => {
      console.error('Unexpected PostgreSQL pool error:', error)
    })
    globalThis.__thenam_pg_pool__ = pool
  }

  return globalThis.__thenam_pg_pool__
}

// node-postgres returns int8 values as strings by default. Application counts
// and byte totals are within JavaScript's safe integer range.
pgTypes.setTypeParser(20, (value) => Number.parseInt(value, 10))

function toPostgresPlaceholders(sql: string): string {
  let output = ''
  let parameterIndex = 0
  let state: 'normal' | 'single' | 'double' | 'line-comment' | 'block-comment' = 'normal'

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    const next = sql[i + 1]

    if (state === 'single') {
      output += char
      if (char === "'" && next === "'") {
        output += next
        i++
      } else if (char === "'") {
        state = 'normal'
      }
      continue
    }

    if (state === 'double') {
      output += char
      if (char === '"' && next === '"') {
        output += next
        i++
      } else if (char === '"') {
        state = 'normal'
      }
      continue
    }

    if (state === 'line-comment') {
      output += char
      if (char === '\n') state = 'normal'
      continue
    }

    if (state === 'block-comment') {
      output += char
      if (char === '*' && next === '/') {
        output += next
        i++
        state = 'normal'
      }
      continue
    }

    if (char === "'") {
      state = 'single'
      output += char
    } else if (char === '"') {
      state = 'double'
      output += char
    } else if (char === '-' && next === '-') {
      state = 'line-comment'
      output += '--'
      i++
    } else if (char === '/' && next === '*') {
      state = 'block-comment'
      output += '/*'
      i++
    } else if (char === '?') {
      parameterIndex++
      output += `$${parameterIndex}`
    } else {
      output += char
    }
  }

  return output
}

class PgStatement {
  private readonly queryText: string

  constructor(sql: string) {
    this.queryText = toPostgresPlaceholders(sql)
  }

  async get<T = Record<string, unknown>>(...params: unknown[]): Promise<T | undefined> {
    const result = await getPool().query(this.queryText, params)
    return result.rows[0] as T | undefined
  }

  async all<T = Record<string, unknown>>(...params: unknown[]): Promise<T[]> {
    const result = await getPool().query(this.queryText, params)
    return result.rows as T[]
  }

  async run(...params: unknown[]): Promise<{ changes: number }> {
    const result = await getPool().query(this.queryText, params)
    return { changes: result.rowCount ?? 0 }
  }
}

// Retain the familiar prepare/get/all/run shape while every operation is async.
export const db = {
  prepare(sql: string): PgStatement {
    return new PgStatement(sql)
  },
}

export async function syncAllPublicMedia(): Promise<{ addedCount: number; total: number }> {
  try {
    const publicDir = path.join(process.cwd(), 'public')
    if (!fs.existsSync(publicDir)) return { addedCount: 0, total: 0 }

    const existingRows = await db.prepare('SELECT url FROM media').all() as Array<{ url: string }>
    const existingUrls = new Set(existingRows.map((row) => row.url))

    function scanDir(dir: string): string[] {
      let list: string[] = []
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true })
        for (const item of items) {
          const full = path.join(dir, item.name)
          if (item.isDirectory()) list = list.concat(scanDir(full))
          else if (/\.(png|jpe?g|webp|svg)$/i.test(item.name)) list.push(full)
        }
      } catch (error) {
        console.error('Error scanning dir for media:', dir, error)
      }
      return list
    }

    function deriveAltAndSection(url: string, filename: string): { section: string; alt: string } {
      const norm = url.toLowerCase()
      const base = path.basename(filename, path.extname(filename))
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())

      if (norm.startsWith('/hero') || norm.includes('banner') || norm.includes('desk-bg') || norm.includes('laptop-dashboard')) {
        return { section: 'hero', alt: `Hero: ${base}` }
      }
      if (norm.startsWith('/services/')) return { section: 'services', alt: `Service: ${base}` }
      if (norm.startsWith('/projects/')) return { section: 'products', alt: `Project: ${base}` }
      if (norm.startsWith('/about-portfolio/')) return { section: 'team', alt: `About & Portfolio: ${base}` }
      if (norm.startsWith('/marquee-logos/')) return { section: 'branding', alt: `Client Brand: ${base}` }
      if (norm.startsWith('/social/')) return { section: 'social', alt: `Social Media: ${base}` }
      if (norm.includes('logo') || norm.includes('leaf') || norm.includes('icon') || norm.includes('favicon')) {
        return { section: 'branding', alt: `THENAM Brand: ${base}` }
      }
      return { section: 'general', alt: base }
    }

    const files = scanDir(publicDir)
    let addedCount = 0
    const now = new Date().toISOString()
    const insertStatement = db.prepare(`
      INSERT INTO media (
        id, filename, original_name, url, alt_text, mime_type, file_size,
        width, height, section_tag, usage_ref, is_system, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `)

    for (const filePath of files) {
      const relUrl = '/' + path.relative(publicDir, filePath).split(path.sep).join('/')
      if (existingUrls.has(relUrl)) continue

      try {
        const buffer = fs.readFileSync(filePath)
        const filename = path.basename(filePath)
        const meta = inspectImageBuffer(buffer, filename) || {
          mimeType: 'image/png',
          width: 0,
          height: 0,
          fileSize: buffer.length,
        }
        const { section, alt } = deriveAltAndSection(relUrl, filename)
        const id = 'med_' + crypto.createHash('md5').update(relUrl).digest('hex').substring(0, 12)

        await insertStatement.run(
          id, filename, filename, relUrl, alt, meta.mimeType, meta.fileSize,
          meta.width, meta.height, section, null, now, now
        )
        existingUrls.add(relUrl)
        addedCount++
      } catch (error) {
        console.error('Error importing media file:', relUrl, error)
      }
    }

    const totalRow = await db.prepare('SELECT COUNT(*) AS count FROM media').get() as { count: number } | undefined
    return { addedCount, total: Number(totalRow?.count ?? 0) }
  } catch (error) {
    console.error('Error in syncAllPublicMedia:', error)
    return { addedCount: 0, total: 0 }
  }
}


/**
 * Check if an image URL is in active use across the website
 */
export async function isMediaInUse(url: string): Promise<{ inUse: boolean; locations: string[] }> {
  const locations: string[] = []

  // Check site_settings
  const settingRows = (await db.prepare('SELECT key, description FROM site_settings WHERE value = ?')
    .all(url) as unknown) as Array<{ key: string; description: string | null }>
  for (const s of settingRows) {
    locations.push(`Site Setting: ${s.description || s.key}`)
  }

  // Check services
  const serviceRows = (await db.prepare('SELECT title FROM services WHERE image_url = ?')
    .all(url) as unknown) as Array<{ title: string }>
  for (const s of serviceRows) {
    locations.push(`Service Offering: ${s.title}`)
  }

  // Check products
  const productRows = (await db.prepare('SELECT name FROM products WHERE image_url = ?')
    .all(url) as unknown) as Array<{ name: string }>
  for (const p of productRows) {
    locations.push(`Proprietary Product: ${p.name}`)
  }

// Check site_content
  try {
    const contentRows = (await db.prepare('SELECT title, page, section FROM site_content WHERE image_url = ?')
      .all(url) as unknown) as Array<{ title: string; page: string; section: string }>
    for (const c of contentRows) {
      locations.push(`Content (${c.page} - ${c.section}): ${c.title}`)
    }
  } catch {
    // safe fallback
  }

// Check projects
  try {
    const projectRows = (await db.prepare('SELECT title_first, title_second FROM projects WHERE mockup_image = ? OR thumbnail = ?')
      .all(url, url) as unknown) as Array<{ title_first: string; title_second: string }>
    for (const p of projectRows) {
      locations.push(`Project Case Study: ${p.title_first} ${p.title_second}`)
    }
  } catch {
    // safe fallback
  }

  // Check if it's marked as a core system asset
  const mediaRow = (await db.prepare('SELECT is_system, usage_ref FROM media WHERE url = ?')
    .get(url) as unknown) as { is_system: number; usage_ref: string | null } | undefined
  if (mediaRow && mediaRow.is_system === 1) {
    locations.push('Core System Asset')
  }

  return {
    inUse: locations.length > 0,
    locations,
  }
}

/**
 * Get all current site settings as a key-value map
 */
export async function getAllSiteSettings(): Promise<Record<string, string>> {
  const rows = (await db.prepare('SELECT key, value FROM site_settings').all() as unknown) as SiteSetting[]
  const map: Record<string, string> = {}
  for (const r of rows) {
    map[r.key] = r.value
  }
  return map
}

/**
 * Update a site setting key-value
 */
export async function updateSiteSetting(key: string, value: string): Promise<void> {
  const now = new Date().toISOString()
  await db.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, value, now)
}

export async function recordNotification(options: {
  type: 'inquiry' | 'quote' | 'user' | 'application' | 'audit' | 'system'
  title: string
  message: string
  link: string
  referenceId?: string | null
  referenceType?: string | null
  isRead?: number
  createdAt?: string
}): Promise<string> {
  const id = 'notif_' + crypto.randomBytes(8).toString('hex')
  const now = options.createdAt || new Date().toISOString()
  await db.prepare(`
    INSERT INTO admin_notifications (id, type, title, message, link, reference_id, reference_type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    options.type,
    options.title,
    options.message,
    options.link,
    options.referenceId || null,
    options.referenceType || null,
    options.isRead ?? 0,
    now
  )
  return id
}

/* ========================================================
   WEBSITE ANALYTICS & REPORTING REPOSITORY FUNCTIONS
   ======================================================== */

/**
 * Record a pageview event with privacy safeguards (no raw IP or PII)
 */
export async function recordPageView(data: {
  visitorId: string
  sessionId: string
  path: string
  title?: string | null
  referrer?: string | null
  serviceId?: string | null
  productId?: string | null
  deviceType?: string | null
  browser?: string | null
  os?: string | null
  createdAt?: string | null
}): Promise<string> {
  const id = 'pv_' + crypto.randomBytes(8).toString('hex')
  const now = data.createdAt || new Date().toISOString()
  const date = now.slice(0, 10)

  // Sanitize path (strip origin, limit 250 chars)
  let cleanPath = (data.path || '/').trim()
  if (cleanPath.startsWith('http')) {
    try {
      cleanPath = new URL(cleanPath).pathname
    } catch {
      cleanPath = cleanPath.slice(0, 120)
    }
  }
  cleanPath = cleanPath.slice(0, 250)

  await db.prepare(`
    INSERT INTO analytics_pageviews (
      id, visitor_id, session_id, path, title, referrer, service_id, product_id, device_type, browser, os, created_at, date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId.slice(0, 64),
    data.sessionId.slice(0, 64),
    cleanPath,
    data.title ? data.title.slice(0, 200) : null,
    data.referrer ? data.referrer.slice(0, 200) : null,
    data.serviceId ? data.serviceId.slice(0, 64) : null,
    data.productId ? data.productId.slice(0, 64) : null,
    data.deviceType || 'desktop',
    data.browser ? data.browser.slice(0, 60) : null,
    data.os ? data.os.slice(0, 60) : null,
    now,
    date
  )

  return id
}

/**
 * Record an analytics interaction or conversion event
 */
export async function recordAnalyticsEvent(data: {
  visitorId: string
  sessionId: string
  eventName: string
  eventCategory?: string | null
  resourceId?: string | null
  resourceName?: string | null
  createdAt?: string | null
}): Promise<string> {
  const id = 'ev_' + crypto.randomBytes(8).toString('hex')
  const now = data.createdAt || new Date().toISOString()
  const date = now.slice(0, 10)

  await db.prepare(`
    INSERT INTO analytics_events (
      id, visitor_id, session_id, event_name, event_category, resource_id, resource_name, created_at, date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId.slice(0, 64),
    data.sessionId.slice(0, 64),
    data.eventName.slice(0, 80),
    data.eventCategory || 'conversion',
    data.resourceId ? data.resourceId.slice(0, 80) : null,
    data.resourceName ? data.resourceName.slice(0, 120) : null,
    now,
    date
  )

  return id
}

/**
 * Fetch analytics overview summary for a specific date range
 */
export async function getAnalyticsOverview(startDate: string, endDate: string) {
  // 1. Total Page Views
  const pvRow = await db.prepare(`
    SELECT COUNT(*) as count 
    FROM analytics_pageviews 
    WHERE date >= ? AND date <= ?
  `).get(startDate, endDate) as { count: number }
  const totalPageViews = pvRow?.count || 0

  // 2. Unique Visitors (distinct visitor_id)
  const uvRow = await db.prepare(`
    SELECT COUNT(DISTINCT visitor_id) as count 
    FROM analytics_pageviews 
    WHERE date >= ? AND date <= ?
  `).get(startDate, endDate) as { count: number }
  const uniqueVisitors = uvRow?.count || 0

  // 3. Total Website Visits / Sessions
  const sessRow = await db.prepare(`
    SELECT COUNT(DISTINCT session_id) as count 
    FROM analytics_pageviews 
    WHERE date >= ? AND date <= ?
  `).get(startDate, endDate) as { count: number }
  const totalVisitors = sessRow?.count || 0

  // 4. Total Enquiries in period
  const inqRow = await db.prepare(`
    SELECT COUNT(*) as count 
    FROM inquiries 
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
  `).get(startDate, endDate) as { count: number }
  const totalEnquiries = inqRow?.count || 0

  // 5. Number of website visitors who submitted an enquiry (deduplicated by visitor_id)
  // Cross-reference visitors from analytics_events and inquiries.visitor_id
  const enquiringVisitorsRow = await db.prepare(`
    SELECT COUNT(DISTINCT visitor_id) as count 
    FROM (
      SELECT visitor_id FROM analytics_events 
      WHERE event_name = 'enquiry_submitted' AND date >= ? AND date <= ?
      UNION 
      SELECT visitor_id FROM inquiries 
      WHERE visitor_id IS NOT NULL AND visitor_id != '' AND substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    )
  `).get(startDate, endDate, startDate, endDate) as { count: number }
  
  // Note: if enquiries were submitted prior to tracking or by direct submissions without cookie,
  // we count the verified distinct enquiring visitors, capped at totalEnquiries and uniqueVisitors
  let enquiringVisitors = enquiringVisitorsRow?.count || 0
  if (enquiringVisitors === 0 && totalEnquiries > 0 && uniqueVisitors > 0) {
    // If enquiries exist in the date range but no visitor_id was tagged yet, treat matching count as estimated
    enquiringVisitors = Math.min(totalEnquiries, uniqueVisitors)
  }

  // 6. Enquiry Conversion Rate: (Visitors who submitted enquiry / Unique visitors) * 100
  const conversionRate = uniqueVisitors > 0 
    ? Number(((enquiringVisitors / uniqueVisitors) * 100).toFixed(2)) 
    : 0

  return {
    totalVisitors,
    uniqueVisitors,
    totalPageViews,
    totalEnquiries,
    enquiringVisitors,
    conversionRate,
    startDate,
    endDate,
  }
}

/**
 * Helper to generate all dates between startDate and endDate in YYYY-MM-DD
 */
function getDateRangeArray(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate + 'T00:00:00Z')
  const last = new Date(endDate + 'T00:00:00Z')

  if (isNaN(current.getTime()) || isNaN(last.getTime()) || current > last) {
    return [startDate]
  }

  // Cap at 366 days max for safety
  let count = 0
  while (current <= last && count < 366) {
    dates.push(current.toISOString().slice(0, 10))
    current.setUTCDate(current.getUTCDate() + 1)
    count++
  }
  return dates
}

/**
 * Fetch daily traffic series for interactive charting
 */
export async function getDailyTrafficSeries(startDate: string, endDate: string) {
  const dateList = getDateRangeArray(startDate, endDate)

  // Query daily pageviews & unique visitors
  const pvRows = await db.prepare(`
    SELECT date, COUNT(*) as page_views, COUNT(DISTINCT visitor_id) as unique_visitors
    FROM analytics_pageviews
    WHERE date >= ? AND date <= ?
    GROUP BY date
  `).all(startDate, endDate) as Array<{ date: string; page_views: number; unique_visitors: number }>

  // Query daily inquiries
  const inqRows = await db.prepare(`
    SELECT substr(created_at, 1, 10) as date, COUNT(*) as enquiries
    FROM inquiries
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    GROUP BY substr(created_at, 1, 10)
  `).all(startDate, endDate) as Array<{ date: string; enquiries: number }>

  const pvMap = new Map<string, { pageViews: number; uniqueVisitors: number }>()
  for (const r of pvRows) {
    pvMap.set(r.date, { pageViews: r.page_views, uniqueVisitors: r.unique_visitors })
  }

  const inqMap = new Map<string, number>()
  for (const r of inqRows) {
    inqMap.set(r.date, r.enquiries)
  }

  return dateList.map((d) => {
    const pv = pvMap.get(d) || { pageViews: 0, uniqueVisitors: 0 }
    const enq = inqMap.get(d) || 0
    return {
      date: d,
      pageViews: pv.pageViews,
      uniqueVisitors: pv.uniqueVisitors,
      enquiries: enq,
    }
  })
}

/**
 * Fetch most visited pages
 */
export async function getTopPages(startDate: string, endDate: string, limit = 10) {
  const rows = await db.prepare(`
    SELECT 
      path, 
      MAX(title) as title,
      COUNT(*) as views, 
      COUNT(DISTINCT visitor_id) as unique_visitors
    FROM analytics_pageviews
    WHERE date >= ? AND date <= ?
    GROUP BY path
    ORDER BY views DESC
    LIMIT ?
  `).all(startDate, endDate, limit) as Array<{
    path: string
    title: string | null
    views: number
    unique_visitors: number
  }>

  const totalViews = rows.reduce((sum, r) => sum + r.views, 0)

  return rows.map((r) => ({
    path: r.path,
    title: r.title || r.path,
    views: r.views,
    uniqueVisitors: r.unique_visitors,
    percentage: totalViews > 0 ? Number(((r.views / totalViews) * 100).toFixed(1)) : 0,
  }))
}

/**
 * Fetch popular services and products
 */
export async function getPopularServicesAndProducts(startDate: string, endDate: string) {
  // 1. Most Viewed Services
  // From direct service page visits or service_id tags
  const serviceViewRows = await db.prepare(`
    SELECT 
      service_id, 
      COUNT(*) as views, 
      COUNT(DISTINCT visitor_id) as unique_visitors
    FROM analytics_pageviews
    WHERE date >= ? AND date <= ? AND service_id IS NOT NULL AND service_id != ''
    GROUP BY service_id
    ORDER BY views DESC
  `).all(startDate, endDate) as Array<{ service_id: string; views: number; unique_visitors: number }>

  // Also query all active services from DB to correlate titles
  const allServices = await db.prepare('SELECT id, title, badge, icon_name FROM services').all() as Array<{
    id: string
    title: string
    badge: string
    icon_name: string
  }>

  // Enquiries per service
  const serviceInqRows = await db.prepare(`
    SELECT service_id, COUNT(*) as inq_count
    FROM inquiries
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    GROUP BY service_id
  `).all(startDate, endDate) as Array<{ service_id: string; inq_count: number }>

  const inqCountByService = new Map<string, number>()
  for (const row of serviceInqRows) {
    inqCountByService.set(row.service_id, row.inq_count)
  }

  const serviceViewsMap = new Map<string, { views: number; uniqueVisitors: number }>()
  for (const row of serviceViewRows) {
    serviceViewsMap.set(row.service_id, { views: row.views, uniqueVisitors: row.unique_visitors })
  }

  const services = allServices.map((s) => {
    const stats = serviceViewsMap.get(s.id) || { views: 0, uniqueVisitors: 0 }
    const enquiries = inqCountByService.get(s.id) || 0
    return {
      id: s.id,
      title: s.title,
      badge: s.badge,
      views: stats.views,
      uniqueVisitors: stats.uniqueVisitors,
      enquiries,
    }
  }).sort((a, b) => (b.views + b.enquiries * 5) - (a.views + a.enquiries * 5))

  // 2. Most Viewed Products
  const productViewRows = await db.prepare(`
    SELECT 
      product_id, 
      COUNT(*) as views, 
      COUNT(DISTINCT visitor_id) as unique_visitors
    FROM analytics_pageviews
    WHERE date >= ? AND date <= ? AND product_id IS NOT NULL AND product_id != ''
    GROUP BY product_id
    ORDER BY views DESC
  `).all(startDate, endDate) as Array<{ product_id: string; views: number; unique_visitors: number }>

  const allProducts = await db.prepare('SELECT id, name, category, badge FROM products').all() as Array<{
    id: string
    name: string
    category: string
    badge: string
  }>

  const productViewsMap = new Map<string, { views: number; uniqueVisitors: number }>()
  for (const row of productViewRows) {
    productViewsMap.set(row.product_id, { views: row.views, uniqueVisitors: row.unique_visitors })
  }

  const products = allProducts.map((p) => {
    const stats = productViewsMap.get(p.id) || { views: 0, uniqueVisitors: 0 }
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      badge: p.badge,
      views: stats.views,
      uniqueVisitors: stats.uniqueVisitors,
    }
  }).sort((a, b) => b.views - a.views)

  return { services, products }
}

/**
 * Fetch enquiry performance metrics and trends
 */
export async function getEnquiryPerformanceData(startDate: string, endDate: string) {
  // Monthly trend for last 6 months
  const monthlyRows = await db.prepare(`
    SELECT 
      substr(created_at, 1, 7) as month,
      COUNT(*) as count
    FROM inquiries
    GROUP BY substr(created_at, 1, 7)
    ORDER BY month DESC
    LIMIT 6
  `).all() as Array<{ month: string; count: number }>

  // Daily inquiries in current period
  const dailyRows = await db.prepare(`
    SELECT 
      substr(created_at, 1, 10) as date,
      COUNT(*) as count
    FROM inquiries
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    GROUP BY substr(created_at, 1, 10)
    ORDER BY date ASC
  `).all(startDate, endDate) as Array<{ date: string; count: number }>

  // Breakdown by service in current period
  const serviceBreakdown = await db.prepare(`
    SELECT 
      service_name, 
      COUNT(*) as count
    FROM inquiries
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    GROUP BY service_name
    ORDER BY count DESC
  `).all(startDate, endDate) as Array<{ service_name: string; count: number }>

  // Budget Tier Breakdown
  const budgetBreakdown = await db.prepare(`
    SELECT 
      COALESCE(budget_tier, 'Not Specified') as tier,
      COUNT(*) as count
    FROM inquiries
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    GROUP BY tier
    ORDER BY count DESC
  `).all(startDate, endDate) as Array<{ tier: string; count: number }>

  // Status breakdown
  const statusBreakdown = await db.prepare(`
    SELECT 
      status,
      COUNT(*) as count
    FROM inquiries
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    GROUP BY status
  `).all(startDate, endDate) as Array<{ status: string; count: number }>

  // NDA Requests
  const ndaRow = await db.prepare(`
    SELECT COUNT(*) as count 
    FROM inquiries 
    WHERE need_nda = 1 AND substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
  `).get(startDate, endDate) as { count: number }

  return {
    monthlyTrend: monthlyRows.reverse(),
    dailyTrend: dailyRows,
    serviceBreakdown,
    budgetBreakdown,
    statusBreakdown,
    ndaRequests: ndaRow?.count || 0,
  }
}


/**
 * ========================================================
 * CONTENT MANAGEMENT CRUD HELPERS
 * ========================================================
 */

export async function getAllContent(filters?: {
  page?: string
  section?: string
  status?: string
  search?: string
}): Promise<ContentItem[]> {
  let query = 'SELECT * FROM site_content WHERE 1=1'
  const params: (string | number | null)[] = []

  if (filters?.page && filters.page !== 'all') {
    query += ' AND page = ?'
    params.push(filters.page)
  }

  if (filters?.section && filters.section !== 'all') {
    query += ' AND section = ?'
    params.push(filters.section)
  }

  if (filters?.status && filters.status !== 'all') {
    query += ' AND status = ?'
    params.push(filters.status)
  }

  if (filters?.search && filters.search.trim()) {
    const term = `%${filters.search.trim()}%`
    query += ' AND (title ILIKE ? OR subtitle ILIKE ? OR short_description ILIKE ? OR full_description ILIKE ? OR button_text ILIKE ?)'
    params.push(term, term, term, term, term)
  }

  query += ' ORDER BY display_order ASC, created_at DESC'

  const rows = (await db.prepare(query).all(...params) as unknown) as ContentItem[]
  return rows
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  const row = (await db.prepare('SELECT * FROM site_content WHERE id = ?').get(id) as unknown) as ContentItem | undefined
  return row || null
}

export async function createContent(
  item: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<ContentItem> {
  const id = item.id?.trim() || ('cnt_' + crypto.randomBytes(8).toString('hex'))
  const now = new Date().toISOString()

  await db.prepare(`
    INSERT INTO site_content (
      id, title, subtitle, short_description, full_description,
      image_url, image_alt, page, section, button_text, button_url,
      display_order, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    item.title.trim(),
    item.subtitle?.trim() || null,
    item.short_description.trim(),
    item.full_description?.trim() || null,
    item.image_url?.trim() || null,
    item.image_alt?.trim() || null,
    item.page.trim().toLowerCase(),
    item.section.trim().toLowerCase(),
    item.button_text?.trim() || null,
    item.button_url?.trim() || null,
    Number(item.display_order) || 0,
    item.status === 'published' ? 'published' : 'draft',
    now,
    now
  )

  const created = await getContentById(id)
  if (!created) {
    throw new Error('Failed to retrieve newly created content item.')
  }
  return created
}

export async function updateContent(
  id: string,
  updates: Partial<Omit<ContentItem, 'id' | 'created_at'>>
): Promise<ContentItem | null> {
  const existing = await getContentById(id)
  if (!existing) return null

  const updatedFields: string[] = []
  const params: (string | number | null)[] = []

  const allowedFields: Array<keyof Omit<ContentItem, 'id' | 'created_at'>> = [
    'title',
    'subtitle',
    'short_description',
    'full_description',
    'image_url',
    'image_alt',
    'page',
    'section',
    'button_text',
    'button_url',
    'display_order',
    'status',
  ]

  for (const field of allowedFields) {
    if (field in updates) {
      updatedFields.push(`${field} = ?`)
      let val = updates[field]
      if (typeof val === 'string') val = val.trim()
      if (field === 'display_order') val = Number(val) || 0
      params.push(val ?? null)
    }
  }

  const now = new Date().toISOString()
  updatedFields.push('updated_at = ?')
  params.push(now)
  params.push(id)

  await db.prepare(`UPDATE site_content SET ${updatedFields.join(', ')} WHERE id = ?`).run(...params)
  return await getContentById(id)
}

export async function deleteContent(id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM site_content WHERE id = ?').run(id)
  return result.changes > 0
}

export async function getPublicContentByPage(page: string, section?: string): Promise<ContentItem[]> {
  let query = "SELECT * FROM site_content WHERE page = ? AND status = 'published'"
  const params: (string | number | null)[] = [page.trim().toLowerCase()]

  if (section && section !== 'all') {
    query += ' AND section = ?'
    params.push(section.trim().toLowerCase())
  }

  query += ' ORDER BY display_order ASC, created_at DESC'

  const rows = (await db.prepare(query).all(...params) as unknown) as ContentItem[]
  return rows
}


/**
 * ========================================================
 * PROJECTS & PORTFOLIO CRUD HELPERS
 * ========================================================
 */

function mapProjectItemToDetail(item: ProjectItem): ProjectDetail & { sortOrder: number; isActive: boolean; createdAt: string; updatedAt: string } {
  return {
    slug: item.slug,
    titleFirst: item.title_first,
    titleSecond: item.title_second,
    subtitle: item.subtitle,
    categoryEyebrow: item.category_eyebrow,
    domain: item.domain,
    visitUrl: item.visit_url,
    category: item.category,
    year: item.year,
    practice: item.practice,
    phase: item.phase,
    mockupImage: item.mockup_image,
    shortDesc: item.short_desc,
    tag: item.tag,
    tagType: item.tag_type,
    thumbnail: item.thumbnail,
    sortOrder: item.sort_order,
    isActive: item.is_active === 1,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export async function getAllProjects(includeInactive = false): Promise<(ProjectDetail & { sortOrder: number; isActive: boolean; createdAt: string; updatedAt: string })[]> {
  try {
    const query = includeInactive
      ? 'SELECT * FROM projects ORDER BY sort_order ASC, created_at ASC'
      : 'SELECT * FROM projects WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC'
    const rows = (await db.prepare(query).all() as unknown) as ProjectItem[]
    if (rows && rows.length > 0) {
      return rows.map(mapProjectItemToDetail)
    }
  } catch (err) {
    console.error('Failed to query projects from database, using fallback:', err)
  }

  // Fallback to in-memory default projects
  return Object.values(PROJECTS).map((p, idx) => ({
    ...p,
    sortOrder: idx + 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
}

export async function getProjectBySlug(slug: string): Promise<(ProjectDetail & { sortOrder: number; isActive: boolean; createdAt: string; updatedAt: string }) | null> {
  try {
    const row = (await db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as unknown) as ProjectItem | undefined
    if (row) {
      return mapProjectItemToDetail(row)
    }
  } catch (err) {
    console.error('Failed to query project by slug from database:', err)
  }

  const fallback = PROJECTS[slug]
  if (fallback) {
    return {
      ...fallback,
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  return null
}

export async function updateProject(
  slug: string,
  updates: Partial<{
    titleFirst: string
    titleSecond: string
    subtitle: string
    categoryEyebrow: string
    domain: string
    visitUrl: string
    category: string
    year: string
    practice: string
    phase: string
    mockupImage: string
    shortDesc: string
    tag: string
    tagType: string
    thumbnail: string
    sortOrder: number
    isActive: boolean | number
  }>
): Promise<(ProjectDetail & { sortOrder: number; isActive: boolean; createdAt: string; updatedAt: string }) | null> {
  const existing = await getProjectBySlug(slug)
  if (!existing) return null

  const fields: string[] = []
  const params: (string | number | null)[] = []

  if (updates.titleFirst !== undefined) { fields.push('title_first = ?'); params.push(updates.titleFirst.trim()) }
  if (updates.titleSecond !== undefined) { fields.push('title_second = ?'); params.push(updates.titleSecond.trim()) }
  if (updates.subtitle !== undefined) { fields.push('subtitle = ?'); params.push(updates.subtitle.trim()) }
  if (updates.categoryEyebrow !== undefined) { fields.push('category_eyebrow = ?'); params.push(updates.categoryEyebrow.trim()) }
  if (updates.domain !== undefined) { fields.push('domain = ?'); params.push(updates.domain.trim()) }
  if (updates.visitUrl !== undefined) { fields.push('visit_url = ?'); params.push(updates.visitUrl.trim()) }
  if (updates.category !== undefined) { fields.push('category = ?'); params.push(updates.category.trim()) }
  if (updates.year !== undefined) { fields.push('year = ?'); params.push(updates.year.trim()) }
  if (updates.practice !== undefined) { fields.push('practice = ?'); params.push(updates.practice.trim()) }
  if (updates.phase !== undefined) { fields.push('phase = ?'); params.push(updates.phase.trim()) }
  if (updates.mockupImage !== undefined) { fields.push('mockup_image = ?'); params.push(updates.mockupImage.trim()) }
  if (updates.shortDesc !== undefined) { fields.push('short_desc = ?'); params.push(updates.shortDesc.trim()) }
  if (updates.tag !== undefined) { fields.push('tag = ?'); params.push(updates.tag.trim()) }
  if (updates.tagType !== undefined) { fields.push('tag_type = ?'); params.push(updates.tagType.trim()) }
  if (updates.thumbnail !== undefined) { fields.push('thumbnail = ?'); params.push(updates.thumbnail.trim()) }
  if (updates.sortOrder !== undefined) { fields.push('sort_order = ?'); params.push(Number(updates.sortOrder) || 0) }
  if (updates.isActive !== undefined) { fields.push('is_active = ?'); params.push(updates.isActive ? 1 : 0) }

  const now = new Date().toISOString()
  fields.push('updated_at = ?')
  params.push(now)
  params.push(slug)

  await db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE slug = ?`).run(...params)
  return await getProjectBySlug(slug)
}

export async function createProject(
  project: ProjectDetail & { sortOrder?: number; isActive?: boolean }
): Promise<ProjectDetail & { sortOrder: number; isActive: boolean; createdAt: string; updatedAt: string }> {
  const now = new Date().toISOString()
  const slug = project.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')

  await db.prepare(`
    INSERT INTO projects (
      slug, title_first, title_second, subtitle, category_eyebrow,
      domain, visit_url, category, year, practice, phase,
      mockup_image, short_desc, tag, tag_type, thumbnail,
      sort_order, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    slug,
    project.titleFirst.trim(),
    project.titleSecond.trim(),
    project.subtitle.trim(),
    project.categoryEyebrow.trim(),
    project.domain.trim(),
    project.visitUrl.trim(),
    project.category.trim(),
    project.year.trim(),
    project.practice.trim(),
    project.phase.trim(),
    project.mockupImage.trim(),
    project.shortDesc.trim(),
    project.tag.trim(),
    project.tagType.trim(),
    project.thumbnail.trim(),
    Number(project.sortOrder) || 99,
    project.isActive !== false ? 1 : 0,
    now,
    now
  )

  const created = await getProjectBySlug(slug)
  if (!created) {
    throw new Error(`Failed to retrieve newly created project "${slug}".`)
  }
  return created
}

export async function deleteProject(slug: string): Promise<boolean> {
  const res = await db.prepare('DELETE FROM projects WHERE slug = ?').run(slug)
  return res.changes > 0
}

export interface ProductDetailParsed extends ProductItem {
  tagsList: string[]
  metricsList: Array<{ label: string; val: string }>
  featuresList: string[]
}

export async function getProductById(id: string): Promise<ProductDetailParsed | null> {
  try {
    const cleanId = id.trim().toLowerCase()
    const row = (await db.prepare('SELECT * FROM products WHERE id = ?').get(cleanId) as unknown) as ProductItem | undefined
    if (!row) {
      // Try fuzzy match or fallback for common slugs (e.g. ecommerce -> commerceflow)
      const all = (await db.prepare('SELECT * FROM products').all() as unknown) as ProductItem[]
      const found = all.find(
        (p) =>
          p.id.toLowerCase() === cleanId ||
          p.id.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId.replace(/[^a-z0-9]/g, '') ||
          p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId.replace(/[^a-z0-9]/g, '')
      )
      if (!found) return null
      return {
        ...found,
        tagsList: (() => { try { return JSON.parse(found.tags) } catch { return [] } })(),
        metricsList: (() => { try { return JSON.parse(found.metrics) } catch { return [] } })(),
        featuresList: (() => { try { return JSON.parse(found.features) } catch { return [] } })(),
      }
    }
    return {
      ...row,
      tagsList: (() => { try { return JSON.parse(row.tags) } catch { return [] } })(),
      metricsList: (() => { try { return JSON.parse(row.metrics) } catch { return [] } })(),
      featuresList: (() => { try { return JSON.parse(row.features) } catch { return [] } })(),
    }
  } catch (err) {
    console.error('Failed to get product by id:', err)
    return null
  }
}

export async function getAllProductsFromDb(activeOnly = true): Promise<ProductDetailParsed[]> {
  try {
    const sql = activeOnly
      ? 'SELECT * FROM products WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC'
      : 'SELECT * FROM products ORDER BY sort_order ASC, created_at ASC'
    const rows = (await db.prepare(sql).all() as unknown) as ProductItem[]
    return rows.map((row) => ({
      ...row,
      tagsList: (() => { try { return JSON.parse(row.tags) } catch { return [] } })(),
      metricsList: (() => { try { return JSON.parse(row.metrics) } catch { return [] } })(),
      featuresList: (() => { try { return JSON.parse(row.features) } catch { return [] } })(),
    }))
  } catch (err) {
    console.error('Failed to get all products from db:', err)
    return []
  }
}

