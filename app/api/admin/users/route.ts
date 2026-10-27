import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, WebsiteUser, recordNotification } from '@/lib/db'
import crypto from 'node:crypto'

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const status = searchParams.get('status') || 'all'
    const role = searchParams.get('role') || 'all'
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder')?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params: (string | number)[] = []

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ? OR phone LIKE ?)'
      const pattern = `%${search}%`
      params.push(pattern, pattern, pattern, pattern)
    }

    if (status !== 'all') {
      whereClause += ' AND status = ?'
      params.push(status)
    }

    if (role !== 'all') {
      whereClause += ' AND role = ?'
      params.push(role)
    }

    // Allowed sort columns
    const allowedSortColumns = ['name', 'email', 'created_at', 'status', 'role']
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at'

    // Total count query
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`
    const totalCount = (db.prepare(countQuery).get(...params) as { total: number }).total

    // Paged items query
    const query = `
      SELECT id, name, email, phone, company, role, status, created_at, notes 
      FROM users 
      ${whereClause} 
      ORDER BY ${safeSortBy} ${sortOrder} 
      LIMIT ? OFFSET ?
    `
    const users = (db.prepare(query).all(...params, limit, offset) as unknown) as WebsiteUser[]

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to retrieve user records' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, phone, company, role = 'client', status = 'active', notes } = body

    if (!name || !email || typeof name !== 'string' || typeof email !== 'string') {
      return NextResponse.json({ error: 'Name and a valid email are required.' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()

    // Check duplicate email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail)
    if (existing) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 })
    }

    const id = 'usr_' + crypto.randomBytes(8).toString('hex')
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO users (id, name, email, phone, company, role, status, created_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, cleanName, cleanEmail, phone ? String(phone).trim() : null, company ? String(company).trim() : null, role, status, now, notes ? String(notes).trim() : null)

    recordAuditLog('CREATE_USER', 'users', id, `Created user record for ${cleanName} (${cleanEmail})`, admin.id, admin.email)

    recordNotification({
      type: 'user',
      title: `Client Account Created: ${cleanName}`,
      message: `New ${role} profile created for ${cleanName} (${company || 'Individual Client'}).`,
      link: `/admin/users/${id}`,
      referenceId: id,
      referenceType: 'users',
      isRead: 1,
    })

    const newUser = (db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown) as WebsiteUser

    return NextResponse.json({ success: true, user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
  }
}
