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

declare global {
  // eslint-disable-next-line no-var
  var __thenam_db__: DatabaseSync | undefined
}

function getDatabase(): DatabaseSync {
  if (globalThis.__thenam_db__) {
    return globalThis.__thenam_db__
  }

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'thenam.db')
  const dbDir = path.dirname(dbPath)

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  const db = new DatabaseSync(dbPath)

  // Configure SQLite WAL mode & foreign keys for performance and integrity
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA foreign_keys = ON;')

  initializeSchema(db)

  globalThis.__thenam_db__ = db
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
}

export const db = getDatabase()
