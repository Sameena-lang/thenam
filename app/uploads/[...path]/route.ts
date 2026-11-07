import fs from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await context.params

    if (
      !segments ||
      segments.length !== 1 ||
      !/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|svg)$/i.test(segments[0])
    ) {
      return new NextResponse('Not found', { status: 404 })
    }

    const filename = segments[0]

    const uploadDir = path.resolve(
      process.env.UPLOAD_DIR ||
        path.join(process.cwd(), 'public', 'uploads')
    )

    const persistentFile = path.resolve(uploadDir, filename)

    let filePath = persistentFile

    // Fall back to the existing tracked public image
    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(
        process.cwd(),
        'public',
        'uploads',
        filename
      )
    }

    if (path.dirname(filePath) !== path.dirname(
      path.resolve(filePath)
    )) {
      return new NextResponse('Not found', { status: 404 })
    }

    const stats = await fs.promises.lstat(filePath)

    if (!stats.isFile() || stats.isSymbolicLink()) {
      return new NextResponse('Not found', { status: 404 })
    }

    const file = await fs.promises.readFile(filePath)
    const extension = path.extname(filename).toLowerCase()
    const contentType = MIME_TYPES[extension]

    if (!contentType) {
      return new NextResponse('Unsupported file type', { status: 415 })
    }

    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(file.length),
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new NextResponse('Image not found', { status: 404 })
    }

    console.error('Image serving error:', error)

    return new NextResponse('Unable to load image', { status: 500 })
  }
}

