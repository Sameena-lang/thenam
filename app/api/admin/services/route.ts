import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, ServiceItem } from '@/lib/db'

export async function GET() {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawServices = (db
      .prepare('SELECT * FROM services ORDER BY sort_order ASC, created_at ASC')
      .all() as unknown) as ServiceItem[]

    const services = rawServices.map((s) => ({
      ...s,
      features: (() => {
        try {
          return JSON.parse(s.features)
        } catch {
          return []
        }
      })(),
    }))

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Error fetching admin services:', error)
    return NextResponse.json({ error: 'Failed to retrieve services' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      id,
      title,
      subtitle,
      badge,
      description,
      color_class = 'cyan',
      icon_name = 'Monitor',
      features = [],
      sort_order = 99,
      is_active = 1,
      image_url = null,
      image_alt = '',
    } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    // Generate slug id if not provided
    const serviceId =
      id?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
      title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // Check if ID exists
    const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(serviceId)
    if (existing) {
      return NextResponse.json({ error: `Service with id "${serviceId}" already exists.` }, { status: 409 })
    }

    const now = new Date().toISOString()
    const featuresJson = Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([])

    db.prepare(`
      INSERT INTO services (id, title, subtitle, badge, description, color_class, icon_name, features, sort_order, is_active, image_url, image_alt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      serviceId,
      title.trim(),
      (subtitle || '').trim(),
      (badge || 'New').trim(),
      description.trim(),
      color_class,
      icon_name,
      featuresJson,
      Number(sort_order) || 0,
      is_active ? 1 : 0,
      image_url ? String(image_url).trim() : null,
      image_alt ? String(image_alt).trim() : '',
      now,
      now
    )

    recordAuditLog(
      'CREATE_SERVICE',
      'services',
      serviceId,
      `Created service "${title}" (${serviceId})`,
      admin.id,
      admin.email
    )

    return NextResponse.json({
      success: true,
      service: {
        id: serviceId,
        title,
        subtitle,
        badge,
        description,
        color_class,
        icon_name,
        features: Array.isArray(features) ? features : [],
        sort_order: Number(sort_order) || 0,
        is_active: is_active ? 1 : 0,
        image_url: image_url || null,
        image_alt: image_alt || '',
        created_at: now,
        updated_at: now,
      },
    })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
