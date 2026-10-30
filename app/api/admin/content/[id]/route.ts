import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedAdmin, recordAuditLog } from '@/lib/auth'
import {
  getContentById,
  updateContent,
  deleteContent,
} from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 })
  }

  const { id } = await context.params
  const item = getContentById(id)

  if (!item) {
    return NextResponse.json({ error: 'Content item not found.' }, { status: 404 })
  }

  return NextResponse.json({ item })
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 })
  }

  const { id } = await context.params
  const existing = getContentById(id)

  if (!existing) {
    return NextResponse.json({ error: 'Content item not found.' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const updated = updateContent(id, body)

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update content item.' }, { status: 500 })
    }

    // Revalidate public cache
    try {
      revalidatePath('/')
      revalidatePath(`/${existing.page}`)
      if (updated.page !== existing.page) {
        revalidatePath(`/${updated.page}`)
      }
    } catch {
      // safe fallback
    }

    // Audit log
    const action =
      body.status && body.status !== existing.status
        ? body.status === 'published'
          ? 'PUBLISH_CONTENT'
          : 'UNPUBLISH_CONTENT'
        : 'UPDATE_CONTENT'

    recordAuditLog(
      action,
      'site_content',
      id,
      `Updated content "${updated.title}" (${updated.page} / ${updated.section})`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ success: true, item: updated })
  } catch (error) {
    console.error('Error updating content item:', error)
    return NextResponse.json({ error: 'Failed to update content item.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 })
  }

  const { id } = await context.params
  const existing = getContentById(id)

  if (!existing) {
    return NextResponse.json({ error: 'Content item not found.' }, { status: 404 })
  }

  try {
    const success = deleteContent(id)
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete content item.' }, { status: 500 })
    }

    // Revalidate public cache
    try {
      revalidatePath('/')
      revalidatePath(`/${existing.page}`)
    } catch {
      // safe fallback
    }

    recordAuditLog(
      'DELETE_CONTENT',
      'site_content',
      id,
      `Deleted content "${existing.title}" from page "${existing.page}"`,
      admin.id,
      admin.email
    )

    return NextResponse.json({ success: true, message: 'Content item deleted successfully.' })
  } catch (error) {
    console.error('Error deleting content item:', error)
    return NextResponse.json({ error: 'Failed to delete content item.' }, { status: 500 })
  }
}

