import { PROJECTS, ProjectDetail } from './projects-data'
import { DatabaseSync } from 'node:sqlite'
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
  var __thenam_db__: DatabaseSync | undefined
}

function getDatabase(): DatabaseSync {
  let db = globalThis.__thenam_db__

  if (!db) {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'thenam.db')
    const dbDir = path.dirname(dbPath)

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    db = new DatabaseSync(dbPath)

    // Configure SQLite WAL mode & foreign keys for performance and integrity
    db.exec('PRAGMA journal_mode = WAL;')
    db.exec('PRAGMA foreign_keys = ON;')

    globalThis.__thenam_db__ = db
  }

  // Ensure all schema tables and initial seeds exist (safe and idempotent)
  initializeSchema(db)

  return db
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

function initializeSchema(db: DatabaseSync) {
  // 1. Admin Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT DEFAULT 'super_admin',
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      last_login TEXT
    );
  `)

  // 2. Website Users (Registered Clients, Partners, Founders)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      phone TEXT,
      company TEXT,
      role TEXT DEFAULT 'client',
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      notes TEXT
    );
  `)

  // 3. Inquiries & Project Quotes Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE,
      phone TEXT,
      company TEXT,
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      budget_tier TEXT,
      timeline TEXT,
      message TEXT NOT NULL,
      need_nda INTEGER DEFAULT 0,
      status TEXT DEFAULT 'new',
      created_at TEXT NOT NULL
    );
  `)

  // 4. Career Applications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      portfolio_link TEXT,
      experience_level TEXT,
      message TEXT,
      status TEXT DEFAULT 'submitted',
      created_at TEXT NOT NULL
    );
  `)

  // 5. Admin Sessions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );
  `)

  // 6. Audit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT,
      admin_email TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );
  `)

  // 7. Login Attempts (Rate Limiting) Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id TEXT PRIMARY KEY,
      ip_address TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE,
      attempted_at TEXT NOT NULL,
      success INTEGER DEFAULT 0
    );
  `)

  // 8. Services Table (Offerings displayed on public website and manageable via Admin)
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      badge TEXT NOT NULL,
      description TEXT NOT NULL,
      color_class TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      features TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  // 9. Products Table (Proprietary software platforms displayed on public website and manageable via Admin)
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      badge TEXT NOT NULL,
      badge_color TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      icon_color TEXT NOT NULL,
      icon_bg TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT NOT NULL,
      metrics TEXT NOT NULL,
      features TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  // Ensure image_url and image_alt columns exist on services and products
  try { db.exec('ALTER TABLE services ADD COLUMN image_url TEXT;') } catch { /* exists */ }
  try { db.exec('ALTER TABLE services ADD COLUMN image_alt TEXT;') } catch { /* exists */ }
  try { db.exec('ALTER TABLE products ADD COLUMN image_url TEXT;') } catch { /* exists */ }
  try { db.exec('ALTER TABLE products ADD COLUMN image_alt TEXT;') } catch { /* exists */ }

  // 10. Media Library Table (Persistent picture storage metadata & references)
  db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      url TEXT UNIQUE NOT NULL,
      alt_text TEXT NOT NULL DEFAULT '',
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      width INTEGER DEFAULT 0,
      height INTEGER DEFAULT 0,
      section_tag TEXT DEFAULT 'general',
      usage_ref TEXT,
      is_system INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  // 11. Site Settings Table (Configurable image references & homepage content keys)
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT NOT NULL
    );
  `)

  // 12. Admin Notifications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT NOT NULL,
      reference_id TEXT,
      reference_type TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `)

  // 13. Website Analytics Pageviews Table (Lightweight First-Party Tracking)
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_pageviews (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      path TEXT NOT NULL,
      title TEXT,
      referrer TEXT,
      service_id TEXT,
      product_id TEXT,
      device_type TEXT DEFAULT 'desktop',
      browser TEXT,
      os TEXT,
      created_at TEXT NOT NULL,
      date TEXT NOT NULL
    );
  `)

  // 14. Website Analytics Events Table (Conversions, Enquiries, Interactions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      event_name TEXT NOT NULL,
      event_category TEXT DEFAULT 'conversion',
      resource_id TEXT,
      resource_name TEXT,
      created_at TEXT NOT NULL,
      date TEXT NOT NULL
    );
  `)

  // Ensure visitor_id column exists on inquiries for conversion tracking
  try { db.exec('ALTER TABLE inquiries ADD COLUMN visitor_id TEXT;') } catch { /* exists */ }

  // 15. Content Management Table (site_content)
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_content (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      short_description TEXT NOT NULL,
      full_description TEXT,
      image_url TEXT,
      image_alt TEXT,
      page TEXT NOT NULL,
      section TEXT NOT NULL,
      button_text TEXT,
      button_url TEXT,
      display_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page);
    CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
    CREATE INDEX IF NOT EXISTS idx_site_content_status ON site_content(status);
    CREATE INDEX IF NOT EXISTS idx_site_content_order ON site_content(display_order, created_at DESC);
  `)

  // Indexes for fast lookup
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
    CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    CREATE INDEX IF NOT EXISTS idx_inquiries_visitor ON inquiries(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON admin_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_login_attempts ON login_attempts(ip_address, attempted_at);
    CREATE INDEX IF NOT EXISTS idx_services_active_sort ON services(is_active, sort_order);
    CREATE INDEX IF NOT EXISTS idx_products_active_sort ON products(is_active, sort_order);
    CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_media_section ON media(section_tag);
    CREATE INDEX IF NOT EXISTS idx_media_url ON media(url);
    CREATE INDEX IF NOT EXISTS idx_notifications_created ON admin_notifications(created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON admin_notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_analytics_pv_date ON analytics_pageviews(date);
    CREATE INDEX IF NOT EXISTS idx_analytics_pv_visitor ON analytics_pageviews(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_pv_path ON analytics_pageviews(path);
    CREATE INDEX IF NOT EXISTS idx_analytics_pv_created ON analytics_pageviews(created_at);
    CREATE INDEX IF NOT EXISTS idx_analytics_ev_name_date ON analytics_events(event_name, date);
    CREATE INDEX IF NOT EXISTS idx_analytics_ev_visitor ON analytics_events(visitor_id);
  `)

// 16. Projects Table (Client Case Studies, Portfolio & Live Visit Links)
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      slug TEXT PRIMARY KEY,
      title_first TEXT NOT NULL,
      title_second TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      category_eyebrow TEXT NOT NULL,
      domain TEXT NOT NULL,
      visit_url TEXT NOT NULL,
      category TEXT NOT NULL,
      year TEXT NOT NULL,
      practice TEXT NOT NULL,
      phase TEXT NOT NULL,
      mockup_image TEXT NOT NULL,
      short_desc TEXT NOT NULL,
      tag TEXT NOT NULL,
      tag_type TEXT NOT NULL,
      thumbnail TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order ASC, created_at ASC);
    CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);
  `)

  // Seed Initial Projects from projects-data.ts if table is empty
  const checkProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }
  if (checkProjects.count === 0) {
    const now = new Date().toISOString()
    const stmt = db.prepare(`
      INSERT INTO projects (
        slug, title_first, title_second, subtitle, category_eyebrow,
        domain, visit_url, category, year, practice, phase,
        mockup_image, short_desc, tag, tag_type, thumbnail,
        sort_order, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `)

    let sort = 1
    for (const p of Object.values(PROJECTS)) {
      stmt.run(
        p.slug, p.titleFirst, p.titleSecond, p.subtitle, p.categoryEyebrow,
        p.domain, p.visitUrl, p.category, p.year, p.practice, p.phase,
        p.mockupImage, p.shortDesc, p.tag, p.tagType, p.thumbnail,
        sort++, now, now
      )
    }
  }

  // Seed Initial Admin User if none exists
  const checkAdmin = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number }
  if (checkAdmin.count === 0) {
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@thenamsoft.com'
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ThenamAdmin#2026'
    const adminName = process.env.ADMIN_INITIAL_NAME || 'Thenam Administrator'
    const salt = crypto.randomBytes(16).toString('hex')
    const passwordHash = hashPassword(adminPassword, salt)
    const adminId = 'adm_' + crypto.randomBytes(8).toString('hex')
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO admin_users (id, email, name, password_hash, salt, role, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'super_admin', 'active', ?)
    `).run(adminId, adminEmail, adminName, passwordHash, salt, now)

    db.prepare(`
      INSERT INTO audit_logs (id, admin_id, admin_email, action, target_type, target_id, details, created_at)
      VALUES (?, ?, ?, 'PROVISION_INITIAL_ADMIN', 'admin_users', ?, 'Initial administrator account provisioned', ?)
    `).run('log_' + crypto.randomBytes(8).toString('hex'), adminId, adminEmail, adminId, now)
  }

  // Seed Initial Verified Client/User Records if table is empty
  const checkUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  if (checkUsers.count === 0) {
    const seedUsers = [
      {
        id: 'usr_swekas01',
        name: 'Swekas Luxe Retail Group',
        email: 'founders@swekasluxe.in',
        phone: '+91 94440 12890',
        company: 'Swekas Luxe Pvt Ltd',
        role: 'client',
        status: 'active',
        created_at: '2026-02-14T10:30:00Z',
        notes: 'Enterprise e-commerce and visual merchandising client.',
      },
      {
        id: 'usr_pinkfish02',
        name: 'Pink Fish Apparel',
        email: 'ops@pinkfishapparel.com',
        phone: '+91 98840 56712',
        company: 'Pink Fish Retail Ltd',
        role: 'client',
        status: 'active',
        created_at: '2026-03-01T14:15:00Z',
        notes: 'Mobile-first lifestyle e-commerce client with dynamic cart sync.',
      },
      {
        id: 'usr_magizh03',
        name: 'Magizh Mahal Hospitality',
        email: 'events@magizhmahal.com',
        phone: '+91 98410 77341',
        company: 'Magizh Conventions',
        role: 'client',
        status: 'active',
        created_at: '2026-03-18T09:45:00Z',
        notes: 'Real-time wedding and convention hall availability portal client.',
      },
      {
        id: 'usr_chennai04',
        name: 'Chennai Tales Media',
        email: 'editor@chennaitales.org',
        phone: '+91 97910 88234',
        company: 'Chennai Tales Publishing',
        role: 'partner',
        status: 'active',
        created_at: '2026-04-05T16:20:00Z',
        notes: 'Digital storytelling platform and high-speed bilingual content engine.',
      },
      {
        id: 'usr_agrismart05',
        name: 'Kavitha S. (AgriSmart Founder)',
        email: 'kavitha@agrismart.in',
        phone: '+91 99401 23456',
        company: 'AgriSmart Telemetry',
        role: 'founder',
        status: 'active',
        created_at: '2026-04-12T11:00:00Z',
        notes: 'IoT agricultural sensors and telemetry dashboard co-creation client.',
      },
    ]

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, phone, company, role, status, created_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const u of seedUsers) {
      insertUser.run(u.id, u.name, u.email, u.phone, u.company, u.role, u.status, u.created_at, u.notes)
    }
  }

  // Seed sample initial inquiries if inquiries table is empty
  const checkInquiries = db.prepare('SELECT COUNT(*) as count FROM inquiries').get() as { count: number }
  if (checkInquiries.count === 0) {
    const seedInquiries = [
      {
        id: 'inq_init01',
        full_name: 'Rajesh Kannan',
        email: 'rajesh@techventure.in',
        phone: '+91 98402 33445',
        company: 'TechVenture Chennai',
        service_id: 'ai',
        service_name: 'AI & Machine Learning',
        budget_tier: 'Growth (₹15k - ₹50k)',
        timeline: 'Standard (2 - 4 Weeks)',
        message: 'Looking to integrate a bilingual Tamil and English customer assistant chatbot into our logistics portal.',
        need_nda: 1,
        status: 'new',
        created_at: '2026-04-20T08:30:00Z',
      },
      {
        id: 'inq_init02',
        full_name: 'Priyanka Sundaram',
        email: 'priyanka@vogueboutique.co',
        phone: '+91 97109 88123',
        company: 'Vogue Boutique',
        service_id: 'web',
        service_name: 'Web Development',
        budget_tier: 'Starter (₹1,999 - ₹15k)',
        timeline: 'Urgent (< 2 Weeks)',
        message: 'Need a fast landing storefront with Razorpay checkout integration for our festive pop-up launch.',
        need_nda: 0,
        status: 'contacted',
        created_at: '2026-04-18T14:45:00Z',
      },
    ]

    const insertInq = db.prepare(`
      INSERT INTO inquiries (id, full_name, email, phone, company, service_id, service_name, budget_tier, timeline, message, need_nda, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const inq of seedInquiries) {
      insertInq.run(
        inq.id,
        inq.full_name,
        inq.email,
        inq.phone,
        inq.company,
        inq.service_id,
        inq.service_name,
        inq.budget_tier,
        inq.timeline,
        inq.message,
        inq.need_nda,
        inq.status,
        inq.created_at
      )
    }
  }

  // Seed Services if table is empty
  const checkServices = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number }
  if (checkServices.count === 0) {
    const now = new Date().toISOString()
    const seedServices = [
      {
        id: 'web-development',
        title: 'Web Development',
        subtitle: 'Modern, high-conversion websites and custom web applications.',
        badge: 'From ₹1,999*',
        description:
          'We engineer responsive, blazing-fast websites and web applications with Next.js, React, and Tailwind CSS. Built with clean code, SEO optimization, and intuitive UX.',
        color_class: 'cyan',
        icon_name: 'Monitor',
        features: JSON.stringify([
          'Single Page & Landing Pages (Starting ₹1,999*)',
          'Corporate & Business Portals',
          'E-Commerce & Payment Gateway Integration',
          'SEO-optimized, ultra-fast Lighthouse 95+ score',
          'Mobile-first responsive design for all devices',
        ]),
        sort_order: 1,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'ai-machine-learning',
        title: 'AI & Machine Learning',
        subtitle: 'Practical AI tools that automate work and deliver smart decisions.',
        badge: 'High Impact',
        description:
          'Turn state-of-the-art language models and computer vision into business productivity. We build conversational agents, predictive tools, and intelligent data pipelines.',
        color_class: 'green',
        icon_name: 'Cpu',
        features: JSON.stringify([
          'Custom AI Assistants & Support Chatbots (Tamil & Multilingual)',
          'Document Processing & OCR Extraction',
          'Predictive Analytics & Customer Churn Modeling',
          'Fine-tuned LLM agents & RAG knowledge bases',
          'Seamless integration into your existing CRM/ERP',
        ]),
        sort_order: 2,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'custom-software',
        title: 'Custom Software Development',
        subtitle: 'Tailored software crafted around your specific operational workflows.',
        badge: 'Enterprise Grade',
        description:
          'Eliminate repetitive spreadsheet chaos with secure, scalable custom software. We build internal business tools, client portals, and cloud-native SaaS systems.',
        color_class: 'blue',
        icon_name: 'Code2',
        features: JSON.stringify([
          'Business Management & Operations Dashboards',
          'Customer Relationship Management (CRM) Systems',
          'Inventory & Supply Chain Tracking Portals',
          'Role-based Access Control (RBAC) & Enterprise Security',
          'RESTful & GraphQL API Architecture',
        ]),
        sort_order: 3,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'business-automation',
        title: 'Business Automation',
        subtitle: 'Connect your business tools and let workflows run automatically.',
        badge: 'Save 20+ hrs/wk',
        description:
          'Stop doing manual data entry. We design automated workflows connecting WhatsApp, email, payment systems, databases, and accounting software.',
        color_class: 'lime',
        icon_name: 'Cog',
        features: JSON.stringify([
          'WhatsApp Business Automated Lead Capture & Booking',
          'Automated Invoicing, GST & Payment Reminders',
          'Multi-app Sync (Zapier, Make, Custom Webhooks)',
          'Database Sync & Automated Reporting Pipelines',
          'Zero-error validation & automated alerts',
        ]),
        sort_order: 4,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'mobile-apps',
        title: 'Mobile App Development',
        subtitle: 'Cross-platform mobile apps with native speed and fluid animations.',
        badge: 'iOS & Android',
        description:
          'Deliver your services directly to customers’ pockets. We develop high-performance iOS and Android applications with React Native and modern native bridges.',
        color_class: 'cyan',
        icon_name: 'Smartphone',
        features: JSON.stringify([
          'Cross-Platform iOS & Android from a single codebase',
          'Offline-first architecture with local cache sync',
          'Push notifications & in-app engagement tools',
          'Secure biometric authentication (FaceID / Fingerprint)',
          'App Store & Play Store publication assistance',
        ]),
        sort_order: 5,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cloud-devops',
        title: 'Cloud & DevOps Solutions',
        subtitle: 'Secure, cost-optimized cloud infrastructure on AWS, GCP & Vercel.',
        badge: '99.99% Uptime',
        description:
          'Ensure your digital products stay online, fast, and secure under peak traffic. We design automated CI/CD pipelines, containerized microservices, and managed backups.',
        color_class: 'green',
        icon_name: 'Cloud',
        features: JSON.stringify([
          'Cloud Architecture on AWS, Google Cloud & Vercel',
          'Automated CI/CD Deployment Pipelines (GitHub Actions)',
          'Containerization with Docker & Kubernetes',
          'Database Optimization, Backups & Disaster Recovery',
          'Cloud Cost Optimization & Security Auditing',
        ]),
        sort_order: 6,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
    ]

    const insertService = db.prepare(`
      INSERT INTO services (id, title, subtitle, badge, description, color_class, icon_name, features, sort_order, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const s of seedServices) {
      insertService.run(
        s.id,
        s.title,
        s.subtitle,
        s.badge,
        s.description,
        s.color_class,
        s.icon_name,
        s.features,
        s.sort_order,
        s.is_active,
        s.created_at,
        s.updated_at
      )
    }
  }

  // Seed Products if table is empty
  const checkProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }
  if (checkProducts.count === 0) {
    const now = new Date().toISOString()
    const seedProducts = [
      {
        id: 'agrismart',
        name: 'AgriSmart',
        category: 'AI-Powered AgriTech Platform',
        badge: 'Active Deployment',
        badge_color: 'lime',
        icon_name: 'Wheat',
        icon_color: '#15803d',
        icon_bg: '#dcfce7',
        tagline: 'Precision agricultural intelligence for farmers, cooperatives, and agribusinesses.',
        description:
          'AgriSmart blends satellite remote sensing, localized weather forecasting, and drone vision AI to identify crop diseases before they spread. Built with offline-first capabilities and multilingual advisory.',
        tags: JSON.stringify(['Web App', 'AI/ML', 'Computer Vision', 'IoT']),
        metrics: JSON.stringify([
          { label: 'Yield Increase', val: '+24%' },
          { label: 'Pesticide Reduction', val: '-35%' },
          { label: 'Active Acres', val: '12,000+' },
        ]),
        features: JSON.stringify([
          'Early crop blight and pest detection via smartphone camera',
          'Soil moisture and micro-climate sensor telemetry',
          'Voice alerts in Tamil and regional Indian languages',
          'Direct market price tracking & harvest logistics sync',
        ]),
        sort_order: 1,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'zarabot',
        name: 'ZaraBot',
        category: 'Tamil-First Conversational AI Assistant',
        badge: 'Trending Product',
        badge_color: 'cyan',
        icon_name: 'Bot',
        icon_color: '#0284c7',
        icon_bg: '#e0f2fe',
        tagline: 'Natural conversational customer support in Tamil and Indian English.',
        description:
          'ZaraBot handles complex customer queries, appointment scheduling, and order status tracking over WhatsApp, web chat, and voice telephony. Trained specifically on colloquial Tamil nuances.',
        tags: JSON.stringify(['AI Agent', 'Chatbot', 'Voice AI', 'WhatsApp API']),
        metrics: JSON.stringify([
          { label: 'Resolution Rate', val: '88%' },
          { label: 'Response Time', val: '< 1.2s' },
          { label: 'Hours Saved/Mo', val: '140 hrs' },
        ]),
        features: JSON.stringify([
          'Natural language understanding in Tamil script and Tanglish',
          'Official WhatsApp Business API native integration',
          'Automated lead qualification and CRM database sync',
          'Instant human handoff when complex escalation is needed',
        ]),
        sort_order: 2,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'commerceflow',
        name: 'E-Commerce Platform',
        category: 'High-Conversion D2C Storefront Engine',
        badge: 'Turnkey Solution',
        badge_color: 'yellow',
        icon_name: 'ShoppingBag',
        icon_color: '#b45309',
        icon_bg: '#fef3c7',
        tagline: 'Lightning-fast online stores engineered for maximum checkout conversion.',
        description:
          'Built for fresh organic brands, regional manufacturers, and direct-to-consumer businesses. Out-of-the-box UPI 1-click checkout, local pincode delivery checks, and automated WhatsApp order notifications.',
        tags: JSON.stringify(['Next.js 16', 'UPI / Razorpay', 'E-commerce', 'SEO Fast']),
        metrics: JSON.stringify([
          { label: 'Lighthouse Score', val: '99/100' },
          { label: 'Cart Abandonment', val: '-28%' },
          { label: 'Avg Setup Time', val: '48 hrs' },
        ]),
        features: JSON.stringify([
          'Blazing-fast mobile storefront with zero page reloads',
          'Instant UPI, PhonePe, Google Pay, and COD checkout',
          'Automated shipping label printing and WhatsApp tracking',
          'Inventory alerts and multi-warehouse support',
        ]),
        sort_order: 3,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'pulse-core',
        name: 'Business Management System',
        category: 'Operations, CRM & Resource Cockpit',
        badge: 'Enterprise SaaS',
        badge_color: 'blue',
        icon_name: 'BarChart2',
        icon_color: '#0284c7',
        icon_bg: '#e0f2fe',
        tagline: 'The all-in-one operations operating system for ambitious businesses.',
        description:
          'Replace 5 disconnected tools with a single unified workspace. Track client milestones, monitor team velocity, automate recurring invoicing, and view real-time profit and loss metrics at a glance.',
        tags: JSON.stringify(['Dashboard', 'CRM / ERP', 'Analytics', 'Role-Based RBAC']),
        metrics: JSON.stringify([
          { label: 'Sync Speed', val: 'Realtime' },
          { label: 'Data Accuracy', val: '100%' },
          { label: 'Tools Replaced', val: '4 to 6' },
        ]),
        features: JSON.stringify([
          'Executive business overview KPI cards and dynamic growth charts',
          'Client project milestones with automated deadline reminders',
          'GST-ready automated invoice generator and payment logging',
          'Encrypted role-based access for managers, staff, and accountants',
        ]),
        sort_order: 4,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
    ]

    const insertProduct = db.prepare(`
      INSERT INTO products (id, name, category, badge, badge_color, icon_name, icon_color, icon_bg, tagline, description, tags, metrics, features, sort_order, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const p of seedProducts) {
      insertProduct.run(
        p.id,
        p.name,
        p.category,
        p.badge,
        p.badge_color,
        p.icon_name,
        p.icon_color,
        p.icon_bg,
        p.tagline,
        p.description,
        p.tags,
        p.metrics,
        p.features,
        p.sort_order,
        p.is_active,
        p.created_at,
        p.updated_at
      )
    }
  }

  // Seed Site Settings if table is empty
  const checkSettings = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number }
  if (checkSettings.count === 0) {
    const now = new Date().toISOString()
    const defaultSettings = [
      { key: 'homepage_hero_bg', value: '/hero-bg.png', description: 'Homepage Hero Section Background Image' },
      { key: 'homepage_hero_alt', value: 'THENAM Software Solutions Hero Background', description: 'Homepage Hero Alt Text' },
      { key: 'service_img_web_development', value: '/services/web-development.jpg', description: 'Homepage Service Card: Web Development' },
      { key: 'service_img_ai_machine_learning', value: '/services/ai-machine-learning.jpg', description: 'Homepage Service Card: AI & Machine Learning' },
      { key: 'service_img_custom_software', value: '/services/custom-software.jpg', description: 'Homepage Service Card: Custom Software' },
      { key: 'service_img_business_automation', value: '/services/business-automation.jpg', description: 'Homepage Service Card: Business Automation' },
      { key: 'product_img_agrismart', value: '/projects/featured-agrismart-hq.png', description: 'Homepage Featured Product: AgriSmart' },
      { key: 'product_img_zarabot', value: '/projects/featured-zarabot-hq.png', description: 'Homepage Featured Product: ZaraBot' },
      { key: 'product_img_commerceflow', value: '/projects/featured-ecommerce-hq.png', description: 'Homepage Featured Product: E-Commerce Platform' },
      { key: 'product_img_pulse_core', value: '/projects/featured-bizmgmt-hq.png', description: 'Homepage Featured Product: Business Management System' },
      { key: 'team_img_tharun', value: '/about-portfolio/team-curly-jacket.jpg', description: 'Leadership Portrait: Tharun Varshan U (CEO)' },
      { key: 'team_img_yuvan', value: '/about-portfolio/team-glasses-chair.jpg', description: 'Leadership Portrait: Yuvan Dharshan U (Co-Founder)' },
    ]

    const insertSetting = db.prepare(`
      INSERT INTO site_settings (key, value, description, updated_at)
      VALUES (?, ?, ?, ?)
    `)

    for (const s of defaultSettings) {
      insertSetting.run(s.key, s.value, s.description, now)
    }
  }

  // Seed Media Table if table is empty
  const checkMedia = db.prepare('SELECT COUNT(*) as count FROM media').get() as { count: number }
  if (checkMedia.count === 0) {
    const now = new Date().toISOString()
    const defaultMedia = [
      {
        id: 'med_hero_bg',
        filename: 'hero-bg.png',
        original_name: 'hero-bg.png',
        url: '/hero-bg.png',
        alt_text: 'THENAM Software Solutions Hero Background with Laptop and Digital Interface',
        mime_type: 'image/png',
        file_size: 972582,
        width: 1024,
        height: 575,
        section_tag: 'hero',
        usage_ref: 'homepage_hero_bg',
        is_system: 1,
      },
      {
        id: 'med_srv_web',
        filename: 'web-development.jpg',
        original_name: 'web-development.jpg',
        url: '/services/web-development.jpg',
        alt_text: 'Web Development - Responsive Desktop, Tablet, Mobile',
        mime_type: 'image/jpeg',
        file_size: 89217,
        width: 702,
        height: 531,
        section_tag: 'services',
        usage_ref: 'service:web-development',
        is_system: 1,
      },
      {
        id: 'med_srv_ai',
        filename: 'ai-machine-learning.jpg',
        original_name: 'ai-machine-learning.jpg',
        url: '/services/ai-machine-learning.jpg',
        alt_text: 'AI & Machine Learning - Intelligent Automation & Models',
        mime_type: 'image/jpeg',
        file_size: 81275,
        width: 702,
        height: 531,
        section_tag: 'services',
        usage_ref: 'service:ai-machine-learning',
        is_system: 1,
      },
      {
        id: 'med_srv_custom',
        filename: 'custom-software.jpg',
        original_name: 'custom-software.jpg',
        url: '/services/custom-software.jpg',
        alt_text: 'Custom Software Development - Dashboards & Scalable Systems',
        mime_type: 'image/jpeg',
        file_size: 80030,
        width: 702,
        height: 531,
        section_tag: 'services',
        usage_ref: 'service:custom-software',
        is_system: 1,
      },
      {
        id: 'med_srv_bizauto',
        filename: 'business-automation.jpg',
        original_name: 'business-automation.jpg',
        url: '/services/business-automation.jpg',
        alt_text: 'Business Automation - Streamline Processes & Workflows',
        mime_type: 'image/jpeg',
        file_size: 221053,
        width: 702,
        height: 531,
        section_tag: 'services',
        usage_ref: 'service:business-automation',
        is_system: 1,
      },
      {
        id: 'med_prod_agrismart',
        filename: 'featured-agrismart-hq.png',
        original_name: 'featured-agrismart-hq.png',
        url: '/projects/featured-agrismart-hq.png',
        alt_text: 'AgriSmart platform preview and crop telemetry dashboard',
        mime_type: 'image/png',
        file_size: 199711,
        width: 499,
        height: 243,
        section_tag: 'products',
        usage_ref: 'product:agrismart',
        is_system: 1,
      },
      {
        id: 'med_prod_zarabot',
        filename: 'featured-zarabot-hq.png',
        original_name: 'featured-zarabot-hq.png',
        url: '/projects/featured-zarabot-hq.png',
        alt_text: 'ZaraBot Tamil-first AI Assistant interface mockup',
        mime_type: 'image/png',
        file_size: 147305,
        width: 499,
        height: 243,
        section_tag: 'products',
        usage_ref: 'product:zarabot',
        is_system: 1,
      },
      {
        id: 'med_prod_ecom',
        filename: 'featured-ecommerce-hq.png',
        original_name: 'featured-ecommerce-hq.png',
        url: '/projects/featured-ecommerce-hq.png',
        alt_text: 'High-conversion D2C storefront engine preview',
        mime_type: 'image/png',
        file_size: 202263,
        width: 499,
        height: 243,
        section_tag: 'products',
        usage_ref: 'product:commerceflow',
        is_system: 1,
      },
      {
        id: 'med_prod_bizmgmt',
        filename: 'featured-bizmgmt-hq.png',
        original_name: 'featured-bizmgmt-hq.png',
        url: '/projects/featured-bizmgmt-hq.png',
        alt_text: 'Business Management System unified cockpit',
        mime_type: 'image/png',
        file_size: 129173,
        width: 499,
        height: 243,
        section_tag: 'products',
        usage_ref: 'product:pulse-core',
        is_system: 1,
      },
      {
        id: 'med_team_tharun',
        filename: 'team-curly-jacket.jpg',
        original_name: 'team-curly-jacket.jpg',
        url: '/about-portfolio/team-curly-jacket.jpg',
        alt_text: 'Tharun Varshan U - Founder & CEO',
        mime_type: 'image/jpeg',
        file_size: 310522,
        width: 776,
        height: 1024,
        section_tag: 'team',
        usage_ref: 'team:tharun',
        is_system: 1,
      },
      {
        id: 'med_team_yuvan',
        filename: 'team-glasses-chair.jpg',
        original_name: 'team-glasses-chair.jpg',
        url: '/about-portfolio/team-glasses-chair.jpg',
        alt_text: 'Yuvan Dharshan U - Co-Founder',
        mime_type: 'image/jpeg',
        file_size: 329940,
        width: 776,
        height: 1024,
        section_tag: 'team',
        usage_ref: 'team:yuvan',
        is_system: 1,
      },
      {
        id: 'med_brand_logo',
        filename: 'thenam-logo.png',
        original_name: 'thenam-logo.png',
        url: '/thenam-logo.png',
        alt_text: 'THENAM Software Solutions Official Logo',
        mime_type: 'image/png',
        file_size: 106002,
        width: 512,
        height: 512,
        section_tag: 'branding',
        usage_ref: 'branding:logo',
        is_system: 1,
      },
      {
        id: 'med_brand_leaf',
        filename: 'thenam-leaf-icon.png',
        original_name: 'thenam-leaf-icon.png',
        url: '/thenam-leaf-icon.png',
        alt_text: 'THENAM Iconic Leaf Emblem',
        mime_type: 'image/png',
        file_size: 41362,
        width: 256,
        height: 256,
        section_tag: 'branding',
        usage_ref: 'branding:leaf',
        is_system: 1,
      },
    ]

    const insertMedia = db.prepare(`
      INSERT INTO media (id, filename, original_name, url, alt_text, mime_type, file_size, width, height, section_tag, usage_ref, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const m of defaultMedia) {
      insertMedia.run(
        m.id,
        m.filename,
        m.original_name,
        m.url,
        m.alt_text,
        m.mime_type,
        m.file_size,
        m.width,
        m.height,
        m.section_tag,
        m.usage_ref,
        m.is_system,
        now,
        now
      )
    }
  }

  // Automatically synchronize all static and uploaded images in public/
  syncAllPublicMediaWithDb(db)

  // Seed sample initial notifications if admin_notifications table is empty
  const checkNotifs = db.prepare('SELECT COUNT(*) as count FROM admin_notifications').get() as { count: number }
  if (checkNotifs.count === 0) {
    const seedNotifications = [
      {
        id: 'notif_init01',
        type: 'inquiry',
        title: 'New Proposal Request: Rajesh Kannan',
        message: 'Rajesh Kannan requested an AI & Machine Learning proposal (Growth Tier, ₹15k - ₹50k). Follow-up pending response.',
        link: '/admin/inquiries',
        reference_id: 'inq_init01',
        reference_type: 'inquiries',
        is_read: 0,
        created_at: '2026-04-20T08:30:00Z',
      },
      {
        id: 'notif_init02',
        type: 'quote',
        title: 'Inquiry Contacted: Priyanka Sundaram',
        message: 'Proposal request for Web Development marked contacted with Vogue Boutique.',
        link: '/admin/inquiries',
        reference_id: 'inq_init02',
        reference_type: 'inquiries',
        is_read: 1,
        created_at: '2026-04-18T14:45:00Z',
      },
      {
        id: 'notif_init03',
        type: 'user',
        title: 'Client Registered: AgriSmart Telemetry',
        message: 'Kavitha S. successfully verified client account under founder role.',
        link: '/admin/users',
        reference_id: 'usr_agrismart05',
        reference_type: 'users',
        is_read: 1,
        created_at: '2026-04-12T11:00:00Z',
      },
      {
        id: 'notif_init04',
        type: 'audit',
        title: 'Admin Security: Administrator Provisioned',
        message: 'Initial administrator credentials generated and registered.',
        link: '/admin/settings',
        reference_id: 'adm_bbe50737c06ea410',
        reference_type: 'admin_users',
        is_read: 1,
        created_at: '2026-04-01T00:00:00Z',
      },
    ]

    const insertNotif = db.prepare(`
      INSERT INTO admin_notifications (id, type, title, message, link, reference_id, reference_type, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const n of seedNotifications) {
      insertNotif.run(n.id, n.type, n.title, n.message, n.link, n.reference_id, n.reference_type, n.is_read, n.created_at)
    }
  }
}

function syncAllPublicMediaWithDb(targetDb: DatabaseSync): { addedCount: number; total: number } {
  try {
    const publicDir = path.join(process.cwd(), 'public')
    if (!fs.existsSync(publicDir)) {
      return { addedCount: 0, total: 0 }
    }

    const existingRows = (targetDb.prepare('SELECT url FROM media').all() as unknown) as Array<{ url: string }>
    const existingUrls = new Set(existingRows.map((r) => r.url))

    function scanDir(dir: string): string[] {
      let list: string[] = []
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true })
        for (const item of items) {
          const full = path.join(dir, item.name)
          if (item.isDirectory()) {
            list = list.concat(scanDir(full))
          } else if (/\.(png|jpe?g|webp|svg)$/i.test(item.name)) {
            list.push(full)
          }
        }
      } catch (e) {
        console.error('Error scanning dir for media:', dir, e)
      }
      return list
    }

    function deriveAltAndSection(url: string, filename: string): { section: string; alt: string } {
      const norm = url.toLowerCase()
      const base = path
        .basename(filename, path.extname(filename))
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())

      if (norm.startsWith('/hero') || norm.includes('banner') || norm.includes('desk-bg') || norm.includes('laptop-dashboard')) {
        return { section: 'hero', alt: `Hero: ${base}` }
      }
      if (norm.startsWith('/services/')) {
        return { section: 'services', alt: `Service: ${base}` }
      }
      if (norm.startsWith('/projects/')) {
        return { section: 'products', alt: `Project: ${base}` }
      }
      if (norm.startsWith('/about-portfolio/')) {
        return { section: 'team', alt: `About & Portfolio: ${base}` }
      }
      if (norm.startsWith('/marquee-logos/')) {
        return { section: 'branding', alt: `Client Brand: ${base}` }
      }
      if (norm.startsWith('/social/')) {
        return { section: 'social', alt: `Social Media: ${base}` }
      }
      if (norm.includes('logo') || norm.includes('leaf') || norm.includes('icon') || norm.includes('favicon')) {
        return { section: 'branding', alt: `THENAM Brand: ${base}` }
      }
      return { section: 'general', alt: base }
    }

    const allFiles = scanDir(publicDir)
    let addedCount = 0
    const now = new Date().toISOString()

    const insertStmt = targetDb.prepare(`
      INSERT INTO media (id, filename, original_name, url, alt_text, mime_type, file_size, width, height, section_tag, usage_ref, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `)

    for (const filePath of allFiles) {
      const relUrl = '/' + path.relative(publicDir, filePath).split(path.sep).join('/')
      if (existingUrls.has(relUrl)) {
        continue
      }

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

        insertStmt.run(
          id,
          filename,
          filename,
          relUrl,
          alt,
          meta.mimeType,
          meta.fileSize,
          meta.width,
          meta.height,
          section,
          null,
          now,
          now
        )

        existingUrls.add(relUrl)
        addedCount++
      } catch (err) {
        console.error('Error importing media file:', relUrl, err)
      }
    }

    const total = ((targetDb.prepare('SELECT COUNT(*) as count FROM media').get() as unknown) as { count: number }).count
    return { addedCount, total }
  } catch (err) {
    console.error('Error in syncAllPublicMediaWithDb:', err)
    return { addedCount: 0, total: 0 }
  }
}

export function syncAllPublicMedia(customDb?: DatabaseSync): { addedCount: number; total: number } {
  return syncAllPublicMediaWithDb(customDb || db)
}

export const db = getDatabase()

/**
 * Check if an image URL is in active use across the website
 */
export function isMediaInUse(url: string): { inUse: boolean; locations: string[] } {
  const locations: string[] = []

  // Check site_settings
  const settingRows = (db
    .prepare('SELECT key, description FROM site_settings WHERE value = ?')
    .all(url) as unknown) as Array<{ key: string; description: string | null }>
  for (const s of settingRows) {
    locations.push(`Site Setting: ${s.description || s.key}`)
  }

  // Check services
  const serviceRows = (db
    .prepare('SELECT title FROM services WHERE image_url = ?')
    .all(url) as unknown) as Array<{ title: string }>
  for (const s of serviceRows) {
    locations.push(`Service Offering: ${s.title}`)
  }

  // Check products
  const productRows = (db
    .prepare('SELECT name FROM products WHERE image_url = ?')
    .all(url) as unknown) as Array<{ name: string }>
  for (const p of productRows) {
    locations.push(`Proprietary Product: ${p.name}`)
  }

// Check site_content
  try {
    const contentRows = (db
      .prepare('SELECT title, page, section FROM site_content WHERE image_url = ?')
      .all(url) as unknown) as Array<{ title: string; page: string; section: string }>
    for (const c of contentRows) {
      locations.push(`Content (${c.page} - ${c.section}): ${c.title}`)
    }
  } catch {
    // safe fallback
  }

// Check projects
  try {
    const projectRows = (db
      .prepare('SELECT title_first, title_second FROM projects WHERE mockup_image = ? OR thumbnail = ?')
      .all(url, url) as unknown) as Array<{ title_first: string; title_second: string }>
    for (const p of projectRows) {
      locations.push(`Project Case Study: ${p.title_first} ${p.title_second}`)
    }
  } catch {
    // safe fallback
  }

  // Check if it's marked as a core system asset
  const mediaRow = (db
    .prepare('SELECT is_system, usage_ref FROM media WHERE url = ?')
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
export function getAllSiteSettings(): Record<string, string> {
  const rows = (db.prepare('SELECT key, value FROM site_settings').all() as unknown) as SiteSetting[]
  const map: Record<string, string> = {}
  for (const r of rows) {
    map[r.key] = r.value
  }
  return map
}

/**
 * Update a site setting key-value
 */
export function updateSiteSetting(key: string, value: string): void {
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, value, now)
}

export function recordNotification(options: {
  type: 'inquiry' | 'quote' | 'user' | 'application' | 'audit' | 'system'
  title: string
  message: string
  link: string
  referenceId?: string | null
  referenceType?: string | null
  isRead?: number
  createdAt?: string
}): string {
  const id = 'notif_' + crypto.randomBytes(8).toString('hex')
  const now = options.createdAt || new Date().toISOString()
  db.prepare(`
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
export function recordPageView(data: {
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
}): string {
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

  db.prepare(`
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
export function recordAnalyticsEvent(data: {
  visitorId: string
  sessionId: string
  eventName: string
  eventCategory?: string | null
  resourceId?: string | null
  resourceName?: string | null
  createdAt?: string | null
}): string {
  const id = 'ev_' + crypto.randomBytes(8).toString('hex')
  const now = data.createdAt || new Date().toISOString()
  const date = now.slice(0, 10)

  db.prepare(`
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
export function getAnalyticsOverview(startDate: string, endDate: string) {
  // 1. Total Page Views
  const pvRow = db.prepare(`
    SELECT COUNT(*) as count 
    FROM analytics_pageviews 
    WHERE date >= ? AND date <= ?
  `).get(startDate, endDate) as { count: number }
  const totalPageViews = pvRow?.count || 0

  // 2. Unique Visitors (distinct visitor_id)
  const uvRow = db.prepare(`
    SELECT COUNT(DISTINCT visitor_id) as count 
    FROM analytics_pageviews 
    WHERE date >= ? AND date <= ?
  `).get(startDate, endDate) as { count: number }
  const uniqueVisitors = uvRow?.count || 0

  // 3. Total Website Visits / Sessions
  const sessRow = db.prepare(`
    SELECT COUNT(DISTINCT session_id) as count 
    FROM analytics_pageviews 
    WHERE date >= ? AND date <= ?
  `).get(startDate, endDate) as { count: number }
  const totalVisitors = sessRow?.count || 0

  // 4. Total Enquiries in period
  const inqRow = db.prepare(`
    SELECT COUNT(*) as count 
    FROM inquiries 
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
  `).get(startDate, endDate) as { count: number }
  const totalEnquiries = inqRow?.count || 0

  // 5. Number of website visitors who submitted an enquiry (deduplicated by visitor_id)
  // Cross-reference visitors from analytics_events and inquiries.visitor_id
  const enquiringVisitorsRow = db.prepare(`
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
export function getDailyTrafficSeries(startDate: string, endDate: string) {
  const dateList = getDateRangeArray(startDate, endDate)

  // Query daily pageviews & unique visitors
  const pvRows = db.prepare(`
    SELECT date, COUNT(*) as page_views, COUNT(DISTINCT visitor_id) as unique_visitors
    FROM analytics_pageviews
    WHERE date >= ? AND date <= ?
    GROUP BY date
  `).all(startDate, endDate) as Array<{ date: string; page_views: number; unique_visitors: number }>

  // Query daily inquiries
  const inqRows = db.prepare(`
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
export function getTopPages(startDate: string, endDate: string, limit = 10) {
  const rows = db.prepare(`
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
export function getPopularServicesAndProducts(startDate: string, endDate: string) {
  // 1. Most Viewed Services
  // From direct service page visits or service_id tags
  const serviceViewRows = db.prepare(`
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
  const allServices = db.prepare('SELECT id, title, badge, icon_name FROM services').all() as Array<{
    id: string
    title: string
    badge: string
    icon_name: string
  }>

  // Enquiries per service
  const serviceInqRows = db.prepare(`
    SELECT service_id, service_name, COUNT(*) as inq_count
    FROM inquiries
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    GROUP BY service_id
  `).all(startDate, endDate) as Array<{ service_id: string; service_name: string; inq_count: number }>

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
  const productViewRows = db.prepare(`
    SELECT 
      product_id, 
      COUNT(*) as views, 
      COUNT(DISTINCT visitor_id) as unique_visitors
    FROM analytics_pageviews
    WHERE date >= ? AND date <= ? AND product_id IS NOT NULL AND product_id != ''
    GROUP BY product_id
    ORDER BY views DESC
  `).all(startDate, endDate) as Array<{ product_id: string; views: number; unique_visitors: number }>

  const allProducts = db.prepare('SELECT id, name, category, badge FROM products').all() as Array<{
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
export function getEnquiryPerformanceData(startDate: string, endDate: string) {
  // Monthly trend for last 6 months
  const monthlyRows = db.prepare(`
    SELECT 
      substr(created_at, 1, 7) as month,
      COUNT(*) as count
    FROM inquiries
    GROUP BY substr(created_at, 1, 7)
    ORDER BY month DESC
    LIMIT 6
  `).all() as Array<{ month: string; count: number }>

  // Daily inquiries in current period
  const dailyRows = db.prepare(`
    SELECT 
      substr(created_at, 1, 10) as date,
      COUNT(*) as count
    FROM inquiries
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    GROUP BY substr(created_at, 1, 10)
    ORDER BY date ASC
  `).all(startDate, endDate) as Array<{ date: string; count: number }>

  // Breakdown by service in current period
  const serviceBreakdown = db.prepare(`
    SELECT 
      service_name, 
      COUNT(*) as count
    FROM inquiries
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    GROUP BY service_name
    ORDER BY count DESC
  `).all(startDate, endDate) as Array<{ service_name: string; count: number }>

  // Budget Tier Breakdown
  const budgetBreakdown = db.prepare(`
    SELECT 
      COALESCE(budget_tier, 'Not Specified') as tier,
      COUNT(*) as count
    FROM inquiries
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    GROUP BY tier
    ORDER BY count DESC
  `).all(startDate, endDate) as Array<{ tier: string; count: number }>

  // Status breakdown
  const statusBreakdown = db.prepare(`
    SELECT 
      status,
      COUNT(*) as count
    FROM inquiries
    WHERE substr(created_at, 1, 10) >= ? AND substr(created_at, 1, 10) <= ?
    GROUP BY status
  `).all(startDate, endDate) as Array<{ status: string; count: number }>

  // NDA Requests
  const ndaRow = db.prepare(`
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

export function getAllContent(filters?: {
  page?: string
  section?: string
  status?: string
  search?: string
}): ContentItem[] {
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
    query += ' AND (title LIKE ? OR subtitle LIKE ? OR short_description LIKE ? OR full_description LIKE ? OR button_text LIKE ?)'
    params.push(term, term, term, term, term)
  }

  query += ' ORDER BY display_order ASC, created_at DESC'

  const rows = (db.prepare(query).all(...params) as unknown) as ContentItem[]
  return rows
}

export function getContentById(id: string): ContentItem | null {
  const row = (db.prepare('SELECT * FROM site_content WHERE id = ?').get(id) as unknown) as ContentItem | undefined
  return row || null
}

export function createContent(
  item: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): ContentItem {
  const id = item.id?.trim() || ('cnt_' + crypto.randomBytes(8).toString('hex'))
  const now = new Date().toISOString()

  db.prepare(`
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

  const created = getContentById(id)
  if (!created) {
    throw new Error('Failed to retrieve newly created content item.')
  }
  return created
}

export function updateContent(
  id: string,
  updates: Partial<Omit<ContentItem, 'id' | 'created_at'>>
): ContentItem | null {
  const existing = getContentById(id)
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

  db.prepare(`UPDATE site_content SET ${updatedFields.join(', ')} WHERE id = ?`).run(...params)
  return getContentById(id)
}

export function deleteContent(id: string): boolean {
  const result = db.prepare('DELETE FROM site_content WHERE id = ?').run(id)
  return result.changes > 0
}

export function getPublicContentByPage(page: string, section?: string): ContentItem[] {
  let query = "SELECT * FROM site_content WHERE page = ? AND status = 'published'"
  const params: (string | number | null)[] = [page.trim().toLowerCase()]

  if (section && section !== 'all') {
    query += ' AND section = ?'
    params.push(section.trim().toLowerCase())
  }

  query += ' ORDER BY display_order ASC, created_at DESC'

  const rows = (db.prepare(query).all(...params) as unknown) as ContentItem[]
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

export function getAllProjects(includeInactive = false): (ProjectDetail & { sortOrder: number; isActive: boolean; createdAt: string; updatedAt: string })[] {
  try {
    const query = includeInactive
      ? 'SELECT * FROM projects ORDER BY sort_order ASC, created_at ASC'
      : 'SELECT * FROM projects WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC'
    const rows = (db.prepare(query).all() as unknown) as ProjectItem[]
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

export function getProjectBySlug(slug: string): (ProjectDetail & { sortOrder: number; isActive: boolean; createdAt: string; updatedAt: string }) | null {
  try {
    const row = (db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as unknown) as ProjectItem | undefined
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

export function updateProject(
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
): (ProjectDetail & { sortOrder: number; isActive: boolean; createdAt: string; updatedAt: string }) | null {
  const existing = getProjectBySlug(slug)
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

  db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE slug = ?`).run(...params)
  return getProjectBySlug(slug)
}

export function createProject(
  project: ProjectDetail & { sortOrder?: number; isActive?: boolean }
): ProjectDetail & { sortOrder: number; isActive: boolean; createdAt: string; updatedAt: string } {
  const now = new Date().toISOString()
  const slug = project.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')

  db.prepare(`
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

  const created = getProjectBySlug(slug)
  if (!created) {
    throw new Error(`Failed to retrieve newly created project "${slug}".`)
  }
  return created
}

export function deleteProject(slug: string): boolean {
  const res = db.prepare('DELETE FROM projects WHERE slug = ?').run(slug)
  return res.changes > 0
}

export interface ProductDetailParsed extends ProductItem {
  tagsList: string[]
  metricsList: Array<{ label: string; val: string }>
  featuresList: string[]
}

export function getProductById(id: string): ProductDetailParsed | null {
  try {
    const cleanId = id.trim().toLowerCase()
    const row = (db.prepare('SELECT * FROM products WHERE id = ?').get(cleanId) as unknown) as ProductItem | undefined
    if (!row) {
      // Try fuzzy match or fallback for common slugs (e.g. ecommerce -> commerceflow)
      const all = (db.prepare('SELECT * FROM products').all() as unknown) as ProductItem[]
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

export function getAllProductsFromDb(activeOnly = true): ProductDetailParsed[] {
  try {
    const sql = activeOnly
      ? 'SELECT * FROM products WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC'
      : 'SELECT * FROM products ORDER BY sort_order ASC, created_at ASC'
    const rows = (db.prepare(sql).all() as unknown) as ProductItem[]
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

