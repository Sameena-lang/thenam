// THENAM PostgreSQL schema installer.
// This script ONLY creates the schema. It does not import or alter SQLite data.
// Requires DATABASE_URL in .env and the pg package to be installed.

const { Client } = require('pg');

const schemaSql = String.raw`-- THENAM Software Solutions: PostgreSQL schema converted from the existing SQLite schema.
-- Creates tables and indexes only. Does NOT import, update, or delete application data.
-- SQLite INTEGER 0/1 fields remain INTEGER to preserve the existing application values.
-- Email fields use PostgreSQL CITEXT to preserve SQLite's case-insensitive email behavior.

BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;

-- Create the referenced parent table before admin_sessions.
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email CITEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT DEFAULT 'super_admin',
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL,
  last_login TEXT
);

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

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email CITEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  portfolio_link TEXT,
  experience_level TEXT,
  message TEXT,
  status TEXT DEFAULT 'submitted',
  created_at TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email CITEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  budget_tier TEXT,
  timeline TEXT,
  message TEXT NOT NULL,
  need_nda INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new',
  created_at TEXT NOT NULL,
  visitor_id TEXT
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id TEXT PRIMARY KEY,
  ip_address TEXT NOT NULL,
  email CITEXT NOT NULL,
  attempted_at TEXT NOT NULL,
  success INTEGER DEFAULT 0
);

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
  updated_at TEXT NOT NULL,
  image_url TEXT,
  image_alt TEXT
);

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
  updated_at TEXT NOT NULL,
  image_url TEXT,
  image_alt TEXT
);

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

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  phone TEXT,
  company TEXT,
  role TEXT DEFAULT 'client',
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL,
  notes TEXT
);

-- Application indexes. The primary-key and UNIQUE constraints above already
-- create indexes for those fields, so redundant SQLite indexes are omitted.
CREATE INDEX IF NOT EXISTS idx_analytics_ev_name_date ON analytics_events(event_name, date);
CREATE INDEX IF NOT EXISTS idx_analytics_ev_visitor ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_pv_created ON analytics_pageviews(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_pv_date ON analytics_pageviews(date);
CREATE INDEX IF NOT EXISTS idx_analytics_pv_path ON analytics_pageviews(path);
CREATE INDEX IF NOT EXISTS idx_analytics_pv_visitor ON analytics_pageviews(visitor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_visitor ON inquiries(visitor_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts ON login_attempts(ip_address, attempted_at);
CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_section ON media(section_tag);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON admin_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_products_active_sort ON products(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order ASC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_services_active_sort ON services(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_site_content_order ON site_content(display_order, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_site_content_status ON site_content(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

COMMIT;
`;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL was not found. Check your project .env file.');
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();

    const connection = await client.query(
      'SELECT current_database() AS database_name, current_user AS connected_role'
    );
    const { database_name, connected_role } = connection.rows[0];
    console.log(`Connected database: ${database_name}`);
    console.log(`Connected role: ${connected_role}`);

    if (database_name !== 'neondb') {
      throw new Error(`Safety stop: expected database neondb, but connected to ${database_name}.`);
    }

    const before = await client.query(`
      SELECT COUNT(*)::int AS table_count
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    if (before.rows[0].table_count !== 0) {
      throw new Error(`Safety stop: public schema already contains ${before.rows[0].table_count} table(s). Nothing was changed.`);
    }

    console.log('Public schema is empty. Creating the THENAM tables...');
    await client.query(schemaSql);

    const after = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`\nCreated ${after.rows.length} table(s):`);
    for (const row of after.rows) console.log(`- ${row.table_name}`);
    if (after.rows.length !== 16) {
      throw new Error(`Verification failed: expected 16 tables, found ${after.rows.length}.`);
    }

    console.log('\nSUCCESS: All 16 THENAM tables are present in Neon.');
    console.log('No SQLite records were imported, deleted, or modified.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('\nSCHEMA INSTALLATION FAILED:');
  console.error(error.message || error);
  process.exitCode = 1;
});
