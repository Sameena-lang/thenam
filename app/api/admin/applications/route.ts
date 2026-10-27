import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin } from '@/lib/auth'
import { db, CareerApplication } from '@/lib/db'

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const status = searchParams.get('status') || 'all'

    let whereClause = 'WHERE 1=1'
    const params: string[] = []

    if (search) {
      whereClause += ' AND (full_name LIKE ? OR email LIKE ? OR role LIKE ?)'
      const p = `%${search}%`
      params.push(p, p, p)
    }

    if (status !== 'all') {
      whereClause += ' AND status = ?'
      params.push(status)
    }

    const query = `
      SELECT * FROM applications 
      ${whereClause} 
      ORDER BY created_at DESC
    `
    const applications = (db.prepare(query).all(...params) as unknown) as CareerApplication[]

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to retrieve applications' }, { status: 500 })
  }
}
