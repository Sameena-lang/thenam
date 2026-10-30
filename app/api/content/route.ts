import { NextResponse } from 'next/server'
import { getPublicContentByPage } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const section = searchParams.get('section') || undefined

    if (!page) {
      return NextResponse.json(
        { error: 'Missing required query parameter "page".' },
        { status: 400 }
      )
    }

    const items = getPublicContentByPage(page, section)
    return NextResponse.json({
      page,
      section: section || 'all',
      count: items.length,
      content: items,
    })
  } catch (error) {
    console.error('Error fetching public content:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve website content.' },
      { status: 500 }
    )
  }
}

