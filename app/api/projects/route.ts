import { NextResponse } from 'next/server'
import { getAllProjects } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const projects = getAllProjects(false)
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching public projects:', error)
    return NextResponse.json({ error: 'Failed to retrieve projects' }, { status: 500 })
  }
}

