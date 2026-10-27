import { NextResponse } from 'next/server'
import { db, ServiceItem } from '@/lib/db'

export async function GET() {
  try {
    const rawServices = (db
      .prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC')
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
    console.error('Error fetching public services from database:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services', services: [] },
      { status: 500 }
    )
  }
}
