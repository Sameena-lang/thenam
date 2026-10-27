import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, SiteSetting, updateSiteSetting } from '@/lib/db'

export async function GET() {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = (db
      .prepare('SELECT key, value, description, updated_at FROM site_settings ORDER BY key ASC')
      .all() as unknown) as SiteSetting[]

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching admin site settings:', error)
    return NextResponse.json({ error: 'Failed to retrieve site settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { key, value, settings } = body

    if (Array.isArray(settings)) {
      for (const item of settings) {
        if (item.key && item.value !== undefined) {
          updateSiteSetting(item.key, String(item.value).trim())
          recordAuditLog(
            'UPDATE_SITE_SETTING',
            'site_settings',
            item.key,
            `Updated setting ${item.key} = "${item.value}"`,
            admin.id,
            admin.email
          )
        }
      }
      return NextResponse.json({ success: true, message: 'Settings updated successfully' })
    }

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    updateSiteSetting(key, String(value).trim())

    recordAuditLog(
      'UPDATE_SITE_SETTING',
      'site_settings',
      key,
      `Updated setting ${key} = "${value}"`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ success: true, key, value })
  } catch (error) {
    console.error('Error updating site setting:', error)
    return NextResponse.json({ error: 'Failed to update site setting' }, { status: 500 })
  }
}
