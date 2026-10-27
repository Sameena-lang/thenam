import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin } from '@/lib/auth'
import { db, AuditLog } from '@/lib/db'

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)))

    const logs = (db
      .prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?')
      .all(limit) as unknown) as AuditLog[]

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 })
  }
}
