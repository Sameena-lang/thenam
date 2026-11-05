import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export interface ImageMetadata {
  mimeType: string
  width: number
  height: number
  fileSize: number
}

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]

/**
 * Inspect buffer contents and return MIME type & dimensions
 */
export function inspectImageBuffer(buffer: Buffer, originalFilename = ''): ImageMetadata | null {
  if (!buffer || buffer.length === 0) return null

  // 1. Check PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    const width = buffer.readUInt32BE(16)
    const height = buffer.readUInt32BE(20)
    return { mimeType: 'image/png', width, height, fileSize: buffer.length }
  }

  // 2. Check JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    let offset = 2
    let width = 0
    let height = 0
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xff) break
      const marker = buffer[offset + 1]
      // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        height = buffer.readUInt16BE(offset + 5)
        width = buffer.readUInt16BE(offset + 7)
        break
      }
      const segmentLength = buffer.readUInt16BE(offset + 2)
      offset += 2 + segmentLength
    }
    return { mimeType: 'image/jpeg', width, height, fileSize: buffer.length }
  }

  // 3. Check WebP: RIFF .... WEBP
  if (
    buffer.length >= 16 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunkType = buffer.toString('ascii', 12, 16)
    let width = 0
    let height = 0

    if (chunkType === 'VP8 ' && buffer.length >= 30) {
      width = buffer.readUInt16LE(26) & 0x3fff
      height = buffer.readUInt16LE(28) & 0x3fff
    } else if (chunkType === 'VP8L' && buffer.length >= 25) {
      const b0 = buffer[21]
      const b1 = buffer[22]
      const b2 = buffer[23]
      const b3 = buffer[24]
      width = 1 + (((b1 & 0x3f) << 8) | b0)
      height = 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6))
    } else if (chunkType === 'VP8X' && buffer.length >= 30) {
      width = 1 + buffer.readUIntLE(24, 3)
      height = 1 + buffer.readUIntLE(27, 3)
    }

    return { mimeType: 'image/webp', width, height, fileSize: buffer.length }
  }

  // 4. Check SVG
  const sample = buffer.subarray(0, 2048).toString('utf8')
  if (sample.includes('<svg') || originalFilename.toLowerCase().endsWith('.svg')) {
    // Basic security check: forbid executable script tags or inline handlers
    if (
      /<script[\s>]/i.test(sample) ||
      /onload\s*=/i.test(sample) ||
      /onerror\s*=/i.test(sample) ||
      /javascript:/i.test(sample)
    ) {
      return null // Malicious SVG detected
    }

    const wMatch = sample.match(/width=["'](\d+)(?:px)?["']/i)
    const hMatch = sample.match(/height=["'](\d+)(?:px)?["']/i)
    const vbMatch = sample.match(/viewBox=["'][\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)["']/i)
    const width = wMatch ? parseInt(wMatch[1], 10) : vbMatch ? Math.round(parseFloat(vbMatch[1])) : 0
    const height = hMatch ? parseInt(hMatch[1], 10) : vbMatch ? Math.round(parseFloat(vbMatch[2])) : 0

    return { mimeType: 'image/svg+xml', width, height, fileSize: buffer.length }
  }

  return null
}

/**
 * Returns the upload directory on disk: <project_root>/public/uploads
 */
export function getUploadDirectory(): string {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
  return uploadDir
}

/**
 * Save an uploaded buffer to disk safely
 */
export async function saveUploadedBuffer(
  buffer: Buffer,
  originalName: string,
  meta: ImageMetadata
): Promise<{ filename: string; url: string }> {
  const uploadDir = getUploadDirectory()

  // Determine extension from detected MIME
  let ext = '.png'
  if (meta.mimeType === 'image/jpeg') ext = '.jpg'
  else if (meta.mimeType === 'image/webp') ext = '.webp'
  else if (meta.mimeType === 'image/svg+xml') ext = '.svg'

  const safeBase = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .substring(0, 30)

  const uniqueSuffix = Date.now() + '_' + crypto.randomBytes(4).toString('hex')
  const filename = `${safeBase ? safeBase + '-' : ''}${uniqueSuffix}${ext}`
  const targetPath = path.join(uploadDir, filename)

  // Strict check that resolved path is inside uploadDir
  const normalized = path.normalize(targetPath)
  if (!normalized.startsWith(uploadDir)) {
    throw new Error('Path traversal detected')
  }

  await fs.promises.writeFile(targetPath, buffer)

  return {
    filename,
    url: `/uploads/${filename}`,
  }
}

/**
 * Safely delete an uploaded file from disk if it's located in /uploads
 */
export async function deleteUploadedFile(url: string): Promise<boolean> {
  if (!url.startsWith('/uploads/')) {
    // Do not delete root public or seed assets from disk
    return false
  }

  const uploadDir = getUploadDirectory()
  const basename = path.basename(url)
  const fullPath = path.join(uploadDir, basename)

  const normalized = path.normalize(fullPath)
  if (!normalized.startsWith(uploadDir)) {
    throw new Error('Invalid file path')
  }

  if (fs.existsSync(normalized)) {
    await fs.promises.unlink(normalized)
    return true
  }

  return false
}
