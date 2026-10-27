import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { db, MediaItem, isMediaInUse } from '@/lib/db'
import {
  inspectImageBuffer,
  saveUploadedBuffer,
  deleteUploadedFile,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from '@/lib/media-storage'

export async function POST(
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
      return NextResponse.json({ error: 'Target media record not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No replacement image was uploaded' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds the 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)` },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const meta = inspectImageBuffer(buffer, file.name)
    if (!meta || !ALLOWED_MIME_TYPES.includes(meta.mimeType)) {
      return NextResponse.json(
        {
          error:
            'Unsupported or invalid replacement image. Allowed formats: PNG, JPEG, WebP, SVG.',
        },
        { status: 400 }
      )
    }

    const altText = formData.get('alt_text') as string | null
    const finalAltText = altText !== null && altText !== undefined ? altText.trim() : item.alt_text

    // Save new file safely
    const { filename: newFilename, url: newUrl } = await saveUploadedBuffer(
      buffer,
      file.name,
      meta
    )

    const oldUrl = item.url
    const now = new Date().toISOString()

    // 1. Update media record
    db.prepare(`
      UPDATE media
      SET filename = ?, original_name = ?, url = ?, alt_text = ?, mime_type = ?, file_size = ?, width = ?, height = ?, updated_at = ?
      WHERE id = ?
    `).run(
      newFilename,
      file.name,
      newUrl,
      finalAltText,
      meta.mimeType,
      meta.fileSize,
      meta.width,
      meta.height,
      now,
      id
    )

    // 2. Cascade replacement to site_settings
    db.prepare('UPDATE site_settings SET value = ?, updated_at = ? WHERE value = ?').run(
      newUrl,
      now,
      oldUrl
    )

    // 3. Cascade replacement to services and products
    db.prepare('UPDATE services SET image_url = ?, updated_at = ? WHERE image_url = ?').run(
      newUrl,
      now,
      oldUrl
    )
    db.prepare('UPDATE products SET image_url = ?, updated_at = ? WHERE image_url = ?').run(
      newUrl,
      now,
      oldUrl
    )

    // 4. If old file was in /uploads/, remove old file from disk
    if (oldUrl.startsWith('/uploads/')) {
      await deleteUploadedFile(oldUrl)
    }

    recordAuditLog(
      'REPLACE_MEDIA',
      'media',
      id,
      `Replaced image "${item.original_name}" (${oldUrl}) with "${file.name}" (${newUrl})`,
      admin.id,
      admin.email
    )

    const updated = (db.prepare('SELECT * FROM media WHERE id = ?').get(id) as unknown) as MediaItem
    const usage = isMediaInUse(updated.url)

    return NextResponse.json({
      success: true,
      message: 'Image replaced successfully and all public references synchronized.',
      media: {
        ...updated,
        is_in_use: usage.inUse,
        used_in: usage.locations,
      },
    })
  } catch (error) {
    console.error('Error replacing media:', error)
    return NextResponse.json({ error: 'Failed to replace image' }, { status: 500 })
  }
}
