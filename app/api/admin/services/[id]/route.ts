import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, ServiceItem } from '@/lib/db'

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
    const service = (db.prepare('SELECT * FROM services WHERE id = ?').get(id) as unknown) as ServiceItem | undefined
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({
      service: {
        ...service,
        features: (() => {
          try {
            return JSON.parse(service.features)
          } catch {
            return []
          }
        })(),
      },
    })
  } catch (error) {
    console.error('Error retrieving service:', error)
    return NextResponse.json({ error: 'Failed to retrieve service' }, { status: 500 })
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
    const service = (db.prepare('SELECT * FROM services WHERE id = ?').get(id) as unknown) as ServiceItem | undefined
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      subtitle,
      badge,
      description,
      color_class,
      icon_name,
      features,
      sort_order,
      is_active,
      image_url,
      image_alt,
    } = body

    const updatedTitle = title !== undefined ? String(title).trim() : service.title
    const updatedSubtitle = subtitle !== undefined ? String(subtitle).trim() : service.subtitle
    const updatedBadge = badge !== undefined ? String(badge).trim() : service.badge
    const updatedDescription = description !== undefined ? String(description).trim() : service.description
    const updatedColorClass = color_class !== undefined ? String(color_class).trim() : service.color_class
    const updatedIconName = icon_name !== undefined ? String(icon_name).trim() : service.icon_name
    const updatedSortOrder = sort_order !== undefined ? Number(sort_order) : service.sort_order
    const updatedIsActive = is_active !== undefined ? (is_active ? 1 : 0) : service.is_active
    const updatedImageUrl = image_url !== undefined ? (image_url ? String(image_url).trim() : null) : (service.image_url ?? null)
    const updatedImageAlt = image_alt !== undefined ? String(image_alt).trim() : (service.image_alt ?? '')

    let updatedFeatures = service.features
    if (features !== undefined) {
      updatedFeatures = Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([])
    }

    const now = new Date().toISOString()

    db.prepare(`
      UPDATE services
      SET title = ?, subtitle = ?, badge = ?, description = ?, color_class = ?, icon_name = ?, features = ?, sort_order = ?, is_active = ?, image_url = ?, image_alt = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updatedTitle,
      updatedSubtitle,
      updatedBadge,
      updatedDescription,
      updatedColorClass,
      updatedIconName,
      updatedFeatures,
      updatedSortOrder,
      updatedIsActive,
      updatedImageUrl,
      updatedImageAlt,
      now,
      id
    )

    recordAuditLog(
      'UPDATE_SERVICE',
      'services',
      id,
      `Updated service "${updatedTitle}" (${id}): image=${updatedImageUrl || 'none'}`,
      admin.id,
      admin.email
    )

    const updated = (db.prepare('SELECT * FROM services WHERE id = ?').get(id) as unknown) as ServiceItem

    return NextResponse.json({
      success: true,
      service: {
        ...updated,
        features: (() => {
          try {
            return JSON.parse(updated.features)
          } catch {
            return []
          }
        })(),
      },
    })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
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
    const service = (db.prepare('SELECT * FROM services WHERE id = ?').get(id) as unknown) as ServiceItem | undefined
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    db.prepare('DELETE FROM services WHERE id = ?').run(id)

    recordAuditLog(
      'DELETE_SERVICE',
      'services',
      id,
      `Deleted service "${service.title}" (${id})`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ success: true, message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
