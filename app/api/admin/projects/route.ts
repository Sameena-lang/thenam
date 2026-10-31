import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import { getAllProjects, createProject, getProjectBySlug } from '@/lib/db'

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

export async function GET() {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const projects = getAllProjects(true)
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching admin projects:', error)
    return NextResponse.json({ error: 'Failed to retrieve projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      slug,
      titleFirst,
      titleSecond,
      subtitle = '',
      categoryEyebrow = 'PROJECT',
      domain = '',
      visitUrl = '',
      category = 'Web Application',
      year = new Date().getFullYear().toString(),
      practice = 'Next.js',
      phase = 'Shipped',
      mockupImage = '',
      shortDesc = '',
      tag = 'Portfolio',
      tagType = 'Web Application',
      thumbnail = '',
      sortOrder = 99,
      isActive = true,
    } = body

    if (!slug || !titleFirst || !titleSecond) {
      return NextResponse.json(
        { error: 'Slug, first title, and second title are required' },
        { status: 400 }
      )
    }

    if (visitUrl && !isValidUrl(visitUrl)) {
      return NextResponse.json(
        { error: 'Please enter a valid Visit live site URL (e.g. https://example.com).' },
        { status: 400 }
      )
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const normalizedVisitUrl = visitUrl ? normalizeUrl(visitUrl) : ''

    const existing = getProjectBySlug(cleanSlug)
    if (existing) {
      return NextResponse.json(
        { error: `Project with slug "${cleanSlug}" already exists` },
        { status: 409 }
      )
    }

    const created = createProject({
      slug: cleanSlug,
      titleFirst: titleFirst.trim(),
      titleSecond: titleSecond.trim(),
      subtitle: subtitle.trim(),
      categoryEyebrow: categoryEyebrow.trim(),
      domain: domain.trim() || normalizedVisitUrl,
      visitUrl: normalizedVisitUrl,
      category: category.trim(),
      year: year.trim(),
      practice: practice.trim(),
      phase: phase.trim(),
      mockupImage: mockupImage.trim(),
      shortDesc: shortDesc.trim(),
      tag: tag.trim(),
      tagType: tagType.trim(),
      thumbnail: thumbnail.trim() || mockupImage.trim(),
      sortOrder: Number(sortOrder) || 99,
      isActive: Boolean(isActive),
    })

    recordAuditLog(
      'CREATE_PROJECT',
      'project',
      cleanSlug,
      `Created project: ${created.titleFirst} ${created.titleSecond} (Visit: ${created.visitUrl})`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ project: created }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

