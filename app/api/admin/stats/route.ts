import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Current counts
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count
    const activeUsers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get() as { count: number }).count
    const pendingUsers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'pending'").get() as { count: number }).count
    const deactivatedUsers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'deactivated'").get() as { count: number }).count

    const totalInquiries = (db.prepare('SELECT COUNT(*) as count FROM inquiries').get() as { count: number }).count
    const newInquiries = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'").get() as { count: number }).count
    const contactedInquiries = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'contacted'").get() as { count: number }).count

    const totalApplications = (db.prepare('SELECT COUNT(*) as count FROM applications').get() as { count: number }).count
    const newApplications = (db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'submitted'").get() as { count: number }).count

    // Recent user records
    const recentUsers = db.prepare('SELECT id, name, email, company, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 5').all()

    // Recent inquiries
    const recentInquiries = db.prepare('SELECT id, full_name, email, service_name, budget_tier, status, created_at FROM inquiries ORDER BY created_at DESC LIMIT 5').all()

    // Recent system audit logs
    const recentLogs = db.prepare('SELECT id, admin_email, action, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 6').all()

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        pendingUsers,
        deactivatedUsers,
        totalInquiries,
        newInquiries,
        contactedInquiries,
        totalApplications,
        newApplications,
      },
      recentUsers,
      recentInquiries,
      recentLogs,
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json({ error: 'Internal server error while fetching statistics' }, { status: 500 })
  }
}
