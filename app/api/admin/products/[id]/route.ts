import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, ProductItem } from '@/lib/db'

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
    const product = (db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown) as ProductItem | undefined
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      product: {
        ...product,
        badgeColor: product.badge_color,
        iconColor: product.icon_color,
        iconBg: product.icon_bg,
        tags: (() => {
          try {
            return JSON.parse(product.tags)
          } catch {
            return []
          }
        })(),
        metrics: (() => {
          try {
            return JSON.parse(product.metrics)
          } catch {
            return []
          }
        })(),
        features: (() => {
          try {
            return JSON.parse(product.features)
          } catch {
            return []
          }
        })(),
      },
    })
  } catch (error) {
    console.error('Error retrieving product:', error)
    return NextResponse.json({ error: 'Failed to retrieve product' }, { status: 500 })
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
    const product = (db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown) as ProductItem | undefined
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      category,
      badge,
      badge_color,
      badgeColor,
      icon_name,
      icon_color,
      iconColor,
      icon_bg,
      iconBg,
      tagline,
      description,
      tags,
      metrics,
      features,
      sort_order,
      is_active,
      image_url,
      image_alt,
    } = body

    const updatedName = name !== undefined ? String(name).trim() : product.name
    const updatedCategory = category !== undefined ? String(category).trim() : product.category
    const updatedBadge = badge !== undefined ? String(badge).trim() : product.badge
    const updatedBadgeColor = (badge_color || badgeColor) !== undefined ? String(badge_color || badgeColor).trim() : product.badge_color
    const updatedIconName = icon_name !== undefined ? String(icon_name).trim() : product.icon_name
    const updatedIconColor = (icon_color || iconColor) !== undefined ? String(icon_color || iconColor).trim() : product.icon_color
    const updatedIconBg = (icon_bg || iconBg) !== undefined ? String(icon_bg || iconBg).trim() : product.icon_bg
    const updatedTagline = tagline !== undefined ? String(tagline).trim() : product.tagline
    const updatedDescription = description !== undefined ? String(description).trim() : product.description
    const updatedSortOrder = sort_order !== undefined ? Number(sort_order) : product.sort_order
    const updatedIsActive = is_active !== undefined ? (is_active ? 1 : 0) : product.is_active
    const updatedImageUrl = image_url !== undefined ? (image_url ? String(image_url).trim() : null) : (product.image_url ?? null)
    const updatedImageAlt = image_alt !== undefined ? String(image_alt).trim() : (product.image_alt ?? '')

    let updatedTags = product.tags
    if (tags !== undefined) {
      updatedTags = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([])
    }

    let updatedMetrics = product.metrics
    if (metrics !== undefined) {
      updatedMetrics = Array.isArray(metrics) ? JSON.stringify(metrics) : JSON.stringify([])
    }

    let updatedFeatures = product.features
    if (features !== undefined) {
      updatedFeatures = Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([])
    }

    const now = new Date().toISOString()

    db.prepare(`
      UPDATE products
      SET name = ?, category = ?, badge = ?, badge_color = ?, icon_name = ?, icon_color = ?, icon_bg = ?, tagline = ?, description = ?, tags = ?, metrics = ?, features = ?, sort_order = ?, is_active = ?, image_url = ?, image_alt = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updatedName,
      updatedCategory,
      updatedBadge,
      updatedBadgeColor,
      updatedIconName,
      updatedIconColor,
      updatedIconBg,
      updatedTagline,
      updatedDescription,
      updatedTags,
      updatedMetrics,
      updatedFeatures,
      updatedSortOrder,
      updatedIsActive,
      updatedImageUrl,
      updatedImageAlt,
      now,
      id
    )

    recordAuditLog(
      'UPDATE_PRODUCT',
      'products',
      id,
      `Updated product "${updatedName}" (${id}): image=${updatedImageUrl || 'none'}`,
      admin.id,
      admin.email
    )

    const updated = (db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown) as ProductItem

    return NextResponse.json({
      success: true,
      product: {
        ...updated,
        badgeColor: updated.badge_color,
        iconColor: updated.icon_color,
        iconBg: updated.icon_bg,
        tags: (() => {
          try {
            return JSON.parse(updated.tags)
          } catch {
            return []
          }
        })(),
        metrics: (() => {
          try {
            return JSON.parse(updated.metrics)
          } catch {
            return []
          }
        })(),
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
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
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
    const product = (db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown) as ProductItem | undefined
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id)

    recordAuditLog(
      'DELETE_PRODUCT',
      'products',
      id,
      `Deleted product "${product.name}" (${id})`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
