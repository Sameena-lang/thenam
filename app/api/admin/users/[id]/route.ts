import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, WebsiteUser } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const user = (db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown) as WebsiteUser | undefined

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Associated inquiries matching user's email
    const inquiries = db
      .prepare('SELECT id, service_name, budget_tier, timeline, status, created_at FROM inquiries WHERE email = ? ORDER BY created_at DESC')
      .all(user.email)

    return NextResponse.json({ user, inquiries })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ error: 'Failed to retrieve user details' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { status, role, phone, company, notes } = body

    const user = (db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown) as WebsiteUser | undefined
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedStatus = status || user.status
    const updatedRole = role || user.role
    const updatedPhone = phone !== undefined ? phone : user.phone
    const updatedCompany = company !== undefined ? company : user.company
    const updatedNotes = notes !== undefined ? notes : user.notes

    db.prepare(`
      UPDATE users 
      SET status = ?, role = ?, phone = ?, company = ?, notes = ?
      WHERE id = ?
    `).run(updatedStatus, updatedRole, updatedPhone, updatedCompany, updatedNotes, id)

    recordAuditLog(
      'UPDATE_USER',
      'users',
      id,
      `Updated user ${user.name} (${user.email}): status=${updatedStatus}, role=${updatedRole}`,
      admin.id,
      admin.email
    )

    const updatedUser = (db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown) as WebsiteUser
    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const user = (db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown) as WebsiteUser | undefined
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id)

    recordAuditLog(
      'DELETE_USER',
      'users',
      id,
      `Deleted user account: ${user.name} (${user.email})`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
