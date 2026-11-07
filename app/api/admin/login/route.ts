import { NextResponse } from 'next/server'
import { db, AdminUser } from '@/lib/db'
import { checkRateLimit, recordLoginAttempt, verifyPassword, createAdminSession, recordAuditLog } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Rate limiting check
    const rateLimit = await checkRateLimit(ip, cleanEmail)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    // Lookup admin
    const admin = await db.prepare('SELECT * FROM admin_users WHERE email = ?')
      .get(cleanEmail) as AdminUser | undefined

    if (!admin || admin.status !== 'active') {
      await recordLoginAttempt(ip, cleanEmail, false)
      await recordAuditLog('FAILED_LOGIN_ATTEMPT', 'admin_users', cleanEmail, `Failed login attempt from IP ${ip}`)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Verify password securely
    const isValid = verifyPassword(password, admin.password_hash, admin.salt)
    if (!isValid) {
      await recordLoginAttempt(ip, cleanEmail, false)
      await recordAuditLog('FAILED_LOGIN_ATTEMPT', 'admin_users', admin.id, `Password mismatch from IP ${ip}`)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Successful login
    await recordLoginAttempt(ip, cleanEmail, true)
    await createAdminSession(admin.id, ip, userAgent)
    await recordAuditLog('ADMIN_LOGIN', 'admin_users', admin.id, `Successful login from IP ${ip}`, admin.id, admin.email)

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'An unexpected authentication error occurred.' }, { status: 500 })
  }
}
