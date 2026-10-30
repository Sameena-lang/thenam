import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import {
  getAllContent,
  createContent,
  ContentItem,
} from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || undefined
    const section = searchParams.get('section') || undefined
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('q') || searchParams.get('search') || undefined

    const items = getAllContent({ page, section, status, search })
    const allItems = getAllContent()

    const publishedCount = allItems.filter((i) => i.status === 'published').length
    const draftCount = allItems.filter((i) => i.status === 'draft').length

    return NextResponse.json({
      content: items,
      total: items.length,
      publishedCount,
      draftCount,
    })
  } catch (error) {
    console.error('Error fetching admin content:', error)
    return NextResponse.json({ error: 'Failed to retrieve content items.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      title,
      subtitle,
      short_description,
      full_description,
      image_url,
      image_alt,
      page,
      section,
      button_text,
      button_url,
      display_order = 0,
      status = 'draft',
    } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
    }

    if (!short_description || typeof short_description !== 'string' || !short_description.trim()) {
      return NextResponse.json({ error: 'Short description is required.' }, { status: 400 })
    }

    if (!page || typeof page !== 'string' || !page.trim()) {
      return NextResponse.json({ error: 'Target website page is required.' }, { status: 400 })
    }

    if (!section || typeof section !== 'string' || !section.trim()) {
      return NextResponse.json({ error: 'Placement section is required.' }, { status: 400 })
    }

    const newItem = createContent({
      title: title.trim(),
      subtitle: subtitle ? String(subtitle).trim() : null,
      short_description: short_description.trim(),
      full_description: full_description ? String(full_description).trim() : null,
      image_url: image_url ? String(image_url).trim() : null,
      image_alt: image_alt ? String(image_alt).trim() : null,
      page: page.trim().toLowerCase(),
      section: section.trim().toLowerCase(),
      button_text: button_text ? String(button_text).trim() : null,
      button_url: button_url ? String(button_url).trim() : null,
      display_order: Number(display_order) || 0,
      status: status === 'published' ? 'published' : 'draft',
    })

    // Revalidate public cache
    try {
      revalidatePath('/')
      revalidatePath(`/${newItem.page}`)
    } catch {
      // safe fallback
    }

    // Log admin action
    recordAuditLog(
      'CREATE_CONTENT',
      'site_content',
      newItem.id,
      `Created content "${newItem.title}" for page "${newItem.page}" (${newItem.status})`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ success: true, item: newItem }, { status: 201 })
  } catch (error) {
    console.error('Error creating content item:', error)
    return NextResponse.json({ error: 'Failed to create content item.' }, { status: 500 })
  }
}

