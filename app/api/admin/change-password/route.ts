import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, verifyPassword, hashPassword, recordAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'
import crypto from 'node:crypto'

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 })
    }

    // Verify current password
    const isCurrentValid = verifyPassword(currentPassword, admin.password_hash, admin.salt)
    if (!isCurrentValid) {
      recordAuditLog('FAILED_PASSWORD_CHANGE', 'admin_users', admin.id, 'Incorrect current password provided', admin.id, admin.email)
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
    }

    // Hash new password with fresh salt
    const newSalt = crypto.randomBytes(16).toString('hex')
    const newHash = hashPassword(newPassword, newSalt)

    db.prepare('UPDATE admin_users SET password_hash = ?, salt = ? WHERE id = ?').run(newHash, newSalt, admin.id)

    recordAuditLog('CHANGE_PASSWORD', 'admin_users', admin.id, 'Administrator successfully changed their password', admin.id, admin.email)

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error changing admin password:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
