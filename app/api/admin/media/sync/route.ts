import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { syncAllPublicMedia } from '@/lib/db'

export async function POST() {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = syncAllPublicMedia()

    recordAuditLog(
      'SYNC_MEDIA',
      'media',
      null,
      `Synchronized media library. ${result.addedCount} newly registered, total ${result.total}.`,
      admin.id,
      admin.email
    )

    return NextResponse.json({
      success: true,
      addedCount: result.addedCount,
      total: result.total,
      message: `Media library synchronized. Total assets: ${result.total} (${result.addedCount} new added).`,
    })
  } catch (error) {
    console.error('Error synchronizing media assets:', error)
    return NextResponse.json({ error: 'Failed to synchronize media assets' }, { status: 500 })
  }
}

