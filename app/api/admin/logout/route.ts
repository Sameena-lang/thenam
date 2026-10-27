import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, destroyAdminSession, recordAuditLog } from '@/lib/auth'

export async function POST() {
  try {
    const admin = await getAuthenticatedAdmin()
    if (admin) {
      recordAuditLog('ADMIN_LOGOUT', 'admin_users', admin.id, 'Administrator logged out', admin.id, admin.email)
    }

    await destroyAdminSession()
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Failed to log out.' }, { status: 500 })
  }
}
