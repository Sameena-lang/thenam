import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin } from '@/lib/auth'
import { db, Inquiry } from '@/lib/db'

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const status = searchParams.get('status') || 'all'
    const service = searchParams.get('service') || 'all'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params: (string | number)[] = []

    if (search) {
      whereClause += ' AND (full_name LIKE ? OR email LIKE ? OR company LIKE ? OR message LIKE ?)'
      const pattern = `%${search}%`
      params.push(pattern, pattern, pattern, pattern)
    }

    if (status !== 'all') {
      whereClause += ' AND status = ?'
      params.push(status)
    }

    if (service !== 'all') {
      whereClause += ' AND service_id = ?'
      params.push(service)
    }

    const countQuery = `SELECT COUNT(*) as total FROM inquiries ${whereClause}`
    const totalCount = (db.prepare(countQuery).get(...params) as { total: number }).total

    const query = `
      SELECT * FROM inquiries 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `
    const inquiries = (db.prepare(query).all(...params, limit, offset) as unknown) as Inquiry[]

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json({ error: 'Failed to retrieve inquiries' }, { status: 500 })
  }
}
