import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin } from '@/lib/auth'
import { db, AdminNotification } from '@/lib/db'

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const search = searchParams.get('search')?.trim() || ''

    let whereClause = 'WHERE 1=1'
    const params: (string | number)[] = []

    if (filter === 'unread') {
      whereClause += ' AND is_read = 0'
    } else if (filter === 'inquiry' || filter === 'quote' || filter === 'user' || filter === 'application' || filter === 'audit') {
      whereClause += ' AND type = ?'
      params.push(filter)
    }

    if (search) {
      whereClause += ' AND (title LIKE ? OR message LIKE ?)'
      const pattern = `%${search}%`
      params.push(pattern, pattern)
    }

    // Unread count
    const unreadCount = (
      db.prepare('SELECT COUNT(*) as count FROM admin_notifications WHERE is_read = 0').get() as { count: number }
    ).count

    // Total count matching filter
    const totalCount = (
      db.prepare(`SELECT COUNT(*) as count FROM admin_notifications ${whereClause}`).get(...params) as { count: number }
    ).count

    // Query notifications
    const query = `
      SELECT id, type, title, message, link, reference_id, reference_type, is_read, created_at 
      FROM admin_notifications 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ?
    `
    const notifications = (db.prepare(query).all(...params, limit) as unknown) as AdminNotification[]

    // Compute Pending and Overdue summary
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

    const overdueInquiriesCount = (
      db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new' AND created_at < ?").get(oneDayAgo) as { count: number }
    ).count

    const pendingInquiriesCount = (
      db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'").get() as { count: number }
    ).count

    const pendingUsersCount = (
      db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'pending'").get() as { count: number }
    ).count

    const pendingApplicationsCount = (
      db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'submitted' OR status = 'screening'").get() as { count: number }
    ).count

    return NextResponse.json({
      notifications,
      unreadCount,
      totalCount,
      pendingSummary: {
        overdueInquiriesCount,
        pendingInquiriesCount,
        pendingUsersCount,
        pendingApplicationsCount,
        totalPendingActions: pendingInquiriesCount + pendingUsersCount + pendingApplicationsCount,
      },
    })
  } catch (error) {
    console.error('Error fetching admin notifications:', error)
    return NextResponse.json({ error: 'Failed to retrieve notifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { action } = body

    if (action === 'mark_all_read' || !action) {
      db.prepare('UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0').run()
      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}
