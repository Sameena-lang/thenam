import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, ProductItem } from '@/lib/db'

export async function GET() {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawProducts = (db
      .prepare('SELECT * FROM products ORDER BY sort_order ASC, created_at ASC')
      .all() as unknown) as ProductItem[]

    const products = rawProducts.map((p) => ({
      ...p,
      badgeColor: p.badge_color,
      iconColor: p.icon_color,
      iconBg: p.icon_bg,
      tags: (() => {
        try {
          return JSON.parse(p.tags)
        } catch {
          return []
        }
      })(),
      metrics: (() => {
        try {
          return JSON.parse(p.metrics)
        } catch {
          return []
        }
      })(),
      features: (() => {
        try {
          return JSON.parse(p.features)
        } catch {
          return []
        }
      })(),
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 })
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
      name,
      category,
      badge,
      badge_color = 'cyan',
      icon_name = 'Bot',
      icon_color = '#0284c7',
      icon_bg = '#e0f2fe',
      tagline,
      description,
      tags = [],
      metrics = [],
      features = [],
      sort_order = 99,
      is_active = 1,
      image_url = null,
      image_alt = '',
    } = body

    if (!name || !description) {
      return NextResponse.json({ error: 'Product name and description are required' }, { status: 400 })
    }

    const productId =
      id?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
      name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(productId)
    if (existing) {
      return NextResponse.json({ error: `Product with id "${productId}" already exists.` }, { status: 409 })
    }

    const now = new Date().toISOString()
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([])
    const metricsJson = Array.isArray(metrics) ? JSON.stringify(metrics) : JSON.stringify([])
    const featuresJson = Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([])

    db.prepare(`
      INSERT INTO products (
        id, name, category, badge, badge_color, icon_name, icon_color, icon_bg, tagline, description, tags, metrics, features, sort_order, is_active, image_url, image_alt, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      productId,
      name.trim(),
      (category || 'Proprietary Software').trim(),
      (badge || 'Active').trim(),
      badge_color,
      icon_name,
      icon_color,
      icon_bg,
      (tagline || '').trim(),
      description.trim(),
      tagsJson,
      metricsJson,
      featuresJson,
      Number(sort_order) || 0,
      is_active ? 1 : 0,
      image_url ? String(image_url).trim() : null,
      image_alt ? String(image_alt).trim() : '',
      now,
      now
    )

    recordAuditLog(
      'CREATE_PRODUCT',
      'products',
      productId,
      `Created proprietary product "${name}" (${productId})`,
      admin.id,
      admin.email
    )

    return NextResponse.json({
      success: true,
      product: {
        id: productId,
        name,
        category,
        badge,
        badge_color,
        icon_name,
        icon_color,
        icon_bg,
        tagline,
        description,
        tags: Array.isArray(tags) ? tags : [],
        metrics: Array.isArray(metrics) ? metrics : [],
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
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
