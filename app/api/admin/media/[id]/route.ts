import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, MediaItem, isMediaInUse } from '@/lib/db'
import { deleteUploadedFile } from '@/lib/media-storage'

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
    const item = (db.prepare('SELECT * FROM media WHERE id = ?').get(id) as unknown) as MediaItem | undefined

    if (!item) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const usage = isMediaInUse(item.url)

    return NextResponse.json({
      media: {
        ...item,
        is_in_use: usage.inUse,
        used_in: usage.locations,
      },
    })
  } catch (error) {
    console.error('Error fetching media item:', error)
    return NextResponse.json({ error: 'Failed to retrieve media item' }, { status: 500 })
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
    const item = (db.prepare('SELECT * FROM media WHERE id = ?').get(id) as unknown) as MediaItem | undefined

    if (!item) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const body = await request.json()
    const { alt_text, section_tag, usage_ref } = body

    const updatedAlt = alt_text !== undefined ? String(alt_text).trim() : item.alt_text
    const updatedSection = section_tag !== undefined ? String(section_tag).trim() : item.section_tag
    const updatedUsageRef = usage_ref !== undefined ? (usage_ref ? String(usage_ref).trim() : null) : item.usage_ref
    const now = new Date().toISOString()

    db.prepare(`
      UPDATE media
      SET alt_text = ?, section_tag = ?, usage_ref = ?, updated_at = ?
      WHERE id = ?
    `).run(updatedAlt, updatedSection, updatedUsageRef, now, id)

    recordAuditLog(
      'UPDATE_MEDIA_META',
      'media',
      id,
      `Updated metadata for "${item.original_name}" (alt="${updatedAlt}", section="${updatedSection}")`,
      admin.id,
      admin.email
    )

    const updated = (db.prepare('SELECT * FROM media WHERE id = ?').get(id) as unknown) as MediaItem
    const usage = isMediaInUse(updated.url)

    return NextResponse.json({
      success: true,
      media: {
        ...updated,
        is_in_use: usage.inUse,
        used_in: usage.locations,
      },
    })
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json({ error: 'Failed to update media item' }, { status: 500 })
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
    const item = (db.prepare('SELECT * FROM media WHERE id = ?').get(id) as unknown) as MediaItem | undefined

    if (!item) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Safety check: Cannot delete image if currently in active use or is a core system asset
    const usage = isMediaInUse(item.url)
    if (usage.inUse) {
      return NextResponse.json(
        {
          error: `Cannot delete image because it is currently in use by: ${usage.locations.join(', ')}. Replace or remove its usage before deleting.`,
          inUse: true,
          locations: usage.locations,
        },
        { status: 400 }
      )
    }

    // Delete record from database
    db.prepare('DELETE FROM media WHERE id = ?').run(id)

    // Delete physical file from uploads directory if it is an uploaded file
    await deleteUploadedFile(item.url)

    recordAuditLog(
      'DELETE_MEDIA',
      'media',
      id,
      `Deleted media item "${item.original_name}" (${item.url})`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ success: true, message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Error deleting media item:', error)
    return NextResponse.json({ error: 'Failed to delete media item' }, { status: 500 })
  }
}
