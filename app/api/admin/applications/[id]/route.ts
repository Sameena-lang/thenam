import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, CareerApplication } from '@/lib/db'

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
    const { status } = body

    if (!status || !['submitted', 'screening', 'interviewed', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid application status' }, { status: 400 })
    }

    const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(id) as CareerApplication | undefined
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, id)

    recordAuditLog(
      'UPDATE_APPLICATION_STATUS',
      'applications',
      id,
      `Updated application for ${app.full_name} (${app.role}) to ${status}`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
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
    db.prepare('DELETE FROM applications WHERE id = ?').run(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 })
  }
}
