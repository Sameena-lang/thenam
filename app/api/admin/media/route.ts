import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, MediaItem, isMediaInUse, updateSiteSetting } from '@/lib/db'
import {
  inspectImageBuffer,
  saveUploadedBuffer,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from '@/lib/media-storage'

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim().toLowerCase() || ''
    const section = searchParams.get('section')?.trim() || 'all'

    let query = 'SELECT * FROM media WHERE 1=1'
    const queryParams: (string | number)[] = []

    if (section && section !== 'all') {
      query += ' AND section_tag = ?'
      queryParams.push(section)
    }

    if (search) {
      query += ' AND (filename LIKE ? OR original_name LIKE ? OR alt_text LIKE ? OR section_tag LIKE ? OR url LIKE ?)'
      const s = `%${search}%`
      queryParams.push(s, s, s, s, s)
    }

    query += ' ORDER BY created_at DESC'

    const rawMedia = (db.prepare(query).all(...queryParams) as unknown) as MediaItem[]

    // Enrich each item with real-time dependency status
    const media = rawMedia.map((m) => {
      const usage = isMediaInUse(m.url)
      return {
        ...m,
        is_in_use: usage.inUse,
        used_in: usage.locations,
      }
    })

    // Total stats & section counts
    const totalCount = (db.prepare('SELECT COUNT(*) as count FROM media').get() as { count: number }).count
    const totalBytes = (db.prepare('SELECT COALESCE(SUM(file_size), 0) as total FROM media').get() as { total: number }).total

    const sectionCountsRows = (db.prepare('SELECT section_tag, COUNT(*) as count FROM media GROUP BY section_tag').all() as unknown) as Array<{ section_tag: string; count: number }>
    const sectionCounts: Record<string, number> = { all: totalCount }
    for (const r of sectionCountsRows) {
      if (r.section_tag) {
        sectionCounts[r.section_tag] = r.count
      }
    }

    return NextResponse.json({
      media,
      stats: {
        totalCount,
        totalBytes,
        sectionCounts,
      },
    })
  } catch (error) {
    console.error('Error fetching media library:', error)
    return NextResponse.json({ error: 'Failed to retrieve media library' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const altText = (formData.get('alt_text') as string | null) || ''
    const sectionTag = (formData.get('section_tag') as string | null) || 'general'
    const assignToKey = (formData.get('assign_to_key') as string | null) || null

    if (!file) {
      return NextResponse.json({ error: 'No image file was uploaded' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds the 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)` },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Inspect content and magic bytes (validates actual image binary, not just filename)
    const meta = inspectImageBuffer(buffer, file.name)
    if (!meta || !ALLOWED_MIME_TYPES.includes(meta.mimeType)) {
      return NextResponse.json(
        {
          error:
            'Unsupported or invalid image file. Allowed formats: PNG, JPEG, WebP, SVG (sanitized).',
        },
        { status: 400 }
      )
    }

    // Save safely to persistent local storage
    const { filename, url } = await saveUploadedBuffer(buffer, file.name, meta)

    const mediaId = 'med_' + crypto.randomBytes(8).toString('hex')
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO media (id, filename, original_name, url, alt_text, mime_type, file_size, width, height, section_tag, usage_ref, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(
      mediaId,
      filename,
      file.name,
      url,
      altText.trim(),
      meta.mimeType,
      meta.fileSize,
      meta.width,
      meta.height,
      sectionTag,
      assignToKey || null,
      now,
      now
    )

    // If an assignment key was specified (e.g. homepage_hero_bg), update site_settings immediately
    if (assignToKey) {
      updateSiteSetting(assignToKey, url)
      if (altText) {
        updateSiteSetting(`${assignToKey}_alt`, altText.trim())
      }
    }

    recordAuditLog(
      'UPLOAD_MEDIA',
      'media',
      mediaId,
      `Uploaded image "${file.name}" (${meta.width}x${meta.height}, ${(meta.fileSize / 1024).toFixed(1)}KB) as ${url}`,
      admin.id,
      admin.email
    )

    const created = (db.prepare('SELECT * FROM media WHERE id = ?').get(mediaId) as unknown) as MediaItem

    return NextResponse.json({
      success: true,
      media: {
        ...created,
        is_in_use: Boolean(assignToKey),
        used_in: assignToKey ? [`Site Setting: ${assignToKey}`] : [],
      },
    })
  } catch (error) {
    console.error('Error handling media upload:', error)
    return NextResponse.json({ error: 'Failed to upload and store image' }, { status: 500 })
  }
}
