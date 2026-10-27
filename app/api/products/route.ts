import { NextResponse } from 'next/server'
import { db, ProductItem } from '@/lib/db'

export async function GET() {
  try {
    const rawProducts = (db
      .prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC')
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
    console.error('Error fetching public products from database:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [] },
      { status: 500 }
    )
  }
}
