import { cookies } from 'next/headers'
import crypto from 'node:crypto'
import { db, AdminUser } from './db'

const SESSION_COOKIE_NAME = 'thenam_admin_session'
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const computedHash = hashPassword(password, salt)
    const storedBuf = Buffer.from(storedHash, 'hex')
    const computedBuf = Buffer.from(computedHash, 'hex')
    if (storedBuf.length !== computedBuf.length) return false
    return crypto.timingSafeEqual(storedBuf, computedBuf)
  } catch {
    return false
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Rate Limiting: Max 5 failed attempts in 15 minutes per IP
export function checkRateLimit(ip: string, email: string): { allowed: boolean; remainingAttempts: number; retryAfterSec?: number } {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

  // Clean up attempts older than 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  db.prepare('DELETE FROM login_attempts WHERE attempted_at < ?').run(oneDayAgo)

  const failedAttempts = db
    .prepare(
      `SELECT COUNT(*) as count, MAX(attempted_at) as last_attempt 
       FROM login_attempts 
       WHERE ip_address = ? AND success = 0 AND attempted_at > ?`
    )
    .get(ip, fifteenMinutesAgo) as { count: number; last_attempt: string | null }

  if (failedAttempts.count >= 5) {
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSec: 900,
    }
  }

  return {
    allowed: true,
    remainingAttempts: 5 - failedAttempts.count,
  }
}

export function recordLoginAttempt(ip: string, email: string, success: boolean) {
  const id = 'att_' + crypto.randomBytes(8).toString('hex')
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO login_attempts (id, ip_address, email, attempted_at, success)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, ip, email, success ? 1 : 0, now)
}

export async function createAdminSession(
  adminId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ token: string; expiresAt: string }> {
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(rawToken)
  const sessionId = 'ses_' + crypto.randomBytes(8).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString()
  const now = new Date().toISOString()

  // Insert session into DB
  db.prepare(`
    INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId, adminId, tokenHash, expiresAt, ipAddress || null, userAgent || null, now)

  // Update last_login on admin
  db.prepare(`
    UPDATE admin_users SET last_login = ? WHERE id = ?
  `).run(now, adminId)

  // Set HTTP-Only Cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

  return { token: rawToken, expiresAt }
}

export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!token) return null

    const tokenHash = hashToken(token)
    const now = new Date().toISOString()

    // Find valid session
    const session = db
      .prepare(
        `SELECT admin_id FROM admin_sessions 
         WHERE token_hash = ? AND expires_at > ?`
      )
      .get(tokenHash, now) as { admin_id: string } | undefined

    if (!session) {
      return null
    }

    // Find active admin user
    const admin = db
      .prepare(
        `SELECT id, email, name, password_hash, salt, role, status, created_at, last_login 
         FROM admin_users 
         WHERE id = ? AND status = 'active'`
      )
      .get(session.admin_id) as AdminUser | undefined

    return admin || null
  } catch (error) {
    console.error('Failed to authenticate admin session:', error)
    return null
  }
}

export async function destroyAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (token) {
      const tokenHash = hashToken(token)
      db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash)
    }

    cookieStore.delete(SESSION_COOKIE_NAME)
  } catch (error) {
    console.error('Failed to destroy admin session:', error)
  }
}

export function recordAuditLog(
  action: string,
  targetType: string | null = null,
  targetId: string | null = null,
  details: string | null = null,
  adminId: string | null = null,
  adminEmail: string | null = null
) {
  try {
    const id = 'log_' + crypto.randomBytes(8).toString('hex')
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO audit_logs (id, admin_id, admin_email, action, target_type, target_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, adminId, adminEmail, action, targetType, targetId, details, now)
  } catch (error) {
    console.error('Failed to record audit log:', error)
  }
}
