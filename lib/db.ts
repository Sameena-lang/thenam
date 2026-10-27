import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

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

export interface SiteSetting {
  key: string
  value: string
  description: string | null
  updated_at: string
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

  // Indexes for fast lookup
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
    CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON admin_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_login_attempts ON login_attempts(ip_address, attempted_at);
    CREATE INDEX IF NOT EXISTS idx_services_active_sort ON services(is_active, sort_order);
    CREATE INDEX IF NOT EXISTS idx_products_active_sort ON products(is_active, sort_order);
    CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_media_section ON media(section_tag);
    CREATE INDEX IF NOT EXISTS idx_media_url ON media(url);
  `)

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

