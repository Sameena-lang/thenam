import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, Inquiry, recordNotification } from '@/lib/db'

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

    if (!status || !['new', 'reviewing', 'contacted', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) as Inquiry | undefined
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, id)

    recordAuditLog(
      'UPDATE_INQUIRY_STATUS',
      'inquiries',
      id,
      `Changed status of inquiry from ${inquiry.full_name} (${inquiry.email}) to "${status}"`,
      admin.id,
      admin.email
    )

    recordNotification({
      type: 'quote',
      title: `Quote / Inquiry Updated: ${inquiry.full_name}`,
      message: `Status for ${inquiry.service_name} proposal requested by ${inquiry.full_name} changed to "${status}".`,
      link: '/admin/inquiries',
      referenceId: id,
      referenceType: 'inquiries',
      isRead: 1,
    })

    const updated = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id)
    return NextResponse.json({ success: true, inquiry: updated })
  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
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
    const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) as Inquiry | undefined
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    db.prepare('DELETE FROM inquiries WHERE id = ?').run(id)

    recordAuditLog(
      'DELETE_INQUIRY',
      'inquiries',
      id,
      `Deleted inquiry from ${inquiry.full_name} (${inquiry.email})`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ success: true, message: 'Inquiry deleted successfully' })
  } catch (error) {
    console.error('Error deleting inquiry:', error)
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 })
  }
}
