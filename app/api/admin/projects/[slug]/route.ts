import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { getProjectBySlug, updateProject, deleteProject } from '@/lib/db'

export const dynamic = 'force-dynamic'

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed
  if (!/^https?:\/\//i.test(trimmed)) {
    return 'https://' + trimmed
  }
  return trimmed
}

function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true
  // Must not have spaces
  if (/\s/.test(trimmed)) return false
  try {
    const toTest = !/^https?:\/\//i.test(trimmed) ? 'https://' + trimmed : trimmed
    const parsed = new URL(toTest)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.')
  } catch {
    return false
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await params
    const project = getProjectBySlug(slug)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Failed to retrieve project' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await params
    const existing = getProjectBySlug(slug)
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const body = await request.json()

    // Validate visitUrl if provided
    let normalizedVisitUrl = body.visitUrl
    if (body.visitUrl !== undefined) {
      if (!isValidUrl(body.visitUrl)) {
        return NextResponse.json(
          { error: 'Invalid URL. Please enter a valid web destination (e.g. https://swekasluxe.com).' },
          { status: 400 }
        )
      }
      normalizedVisitUrl = normalizeUrl(body.visitUrl)
    }

    // If visitUrl is being updated and domain is empty or matches previous visitUrl, sync domain too
    let domainUpdate = body.domain
    if (normalizedVisitUrl !== undefined && (!body.domain || body.domain === existing.domain)) {
      try {
        const parsed = new URL(normalizedVisitUrl)
        domainUpdate = parsed.origin
      } catch {
        domainUpdate = normalizedVisitUrl
      }
    }

    const updated = updateProject(slug, {
      ...body,
      visitUrl: normalizedVisitUrl !== undefined ? normalizedVisitUrl : body.visitUrl,
      domain: domainUpdate !== undefined ? domainUpdate : body.domain,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    // Immediate Next.js cache revalidation for this project and related showcase pages
    try {
      revalidatePath(`/projects/${slug}`, 'page')
      revalidatePath('/projects/[slug]', 'page')
      revalidatePath('/projects', 'page')
      revalidatePath('/', 'page')
    } catch (revalErr) {
      console.warn('Next.js cache revalidation warning:', revalErr)
    }

    const changesSummary = []
    if (normalizedVisitUrl !== undefined && normalizedVisitUrl !== existing.visitUrl) {
      changesSummary.push(`visitUrl: "${existing.visitUrl}" -> "${normalizedVisitUrl}"`)
    }
    if (body.titleFirst !== undefined || body.titleSecond !== undefined) {
      changesSummary.push(`title: "${updated.titleFirst} ${updated.titleSecond}"`)
    }

    recordAuditLog(
      'UPDATE_PROJECT',
      'project',
      slug,
      `Updated project ${slug}: ${changesSummary.join(', ') || 'attributes updated'}`,
      admin.id,
      admin.email
    )

    return NextResponse.json({
      project: updated,
      message: 'Project updated successfully',
    })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await params
    const existing = getProjectBySlug(slug)
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const success = deleteProject(slug)
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }

    try {
      revalidatePath(`/projects/${slug}`)
      revalidatePath('/projects')
      revalidatePath('/')
    } catch {
      // cache revalidation
    }

    recordAuditLog(
      'DELETE_PROJECT',
      'project',
      slug,
      `Deleted project: ${existing.titleFirst} ${existing.titleSecond}`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}

