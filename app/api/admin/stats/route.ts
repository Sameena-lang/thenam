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
    const totalUsers = (await db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count
    const activeUsers = (await db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get() as { count: number }).count
    const pendingUsers = (await db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'pending'").get() as { count: number }).count
    const deactivatedUsers = (await db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'deactivated'").get() as { count: number }).count

    const totalInquiries = (await db.prepare('SELECT COUNT(*) as count FROM inquiries').get() as { count: number }).count
    const newInquiries = (await db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'").get() as { count: number }).count
    const contactedInquiries = (await db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'contacted'").get() as { count: number }).count

    const totalApplications = (await db.prepare('SELECT COUNT(*) as count FROM applications').get() as { count: number }).count
    const newApplications = (await db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'submitted'").get() as { count: number }).count

    const totalServices = (await db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number }).count
    const activeServices = (await db.prepare('SELECT COUNT(*) as count FROM services WHERE is_active = 1').get() as { count: number }).count

    const totalProducts = (await db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count
    const activeProducts = (await db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get() as { count: number }).count

    const totalMedia = (await db.prepare('SELECT COUNT(*) as count FROM media').get() as { count: number }).count

    // Recent user records
    const recentUsers = await db.prepare('SELECT id, name, email, company, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 5').all()

    // Recent inquiries
    const recentInquiries = await db.prepare('SELECT id, full_name, email, service_name, budget_tier, status, created_at FROM inquiries ORDER BY created_at DESC LIMIT 5').all()

    // Recent system audit logs
    const recentLogs = await db.prepare('SELECT id, admin_email, action, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 6').all()

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
        totalServices,
        activeServices,
        totalProducts,
        activeProducts,
        totalMedia,
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
