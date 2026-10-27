import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'node:crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, phone, role, portfolioLink, experienceLevel, message } = body

    if (!fullName || !email || !phone || !role) {
      return NextResponse.json({ error: 'Name, email, phone, and role are required.' }, { status: 400 })
    }

    const id = 'app_' + crypto.randomBytes(8).toString('hex')
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO applications (
        id, full_name, email, phone, role, portfolio_link, experience_level, message, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)
    `).run(
      id,
      String(fullName).trim(),
      String(email).trim().toLowerCase(),
      String(phone).trim(),
      String(role).trim(),
      portfolioLink ? String(portfolioLink).trim() : null,
      experienceLevel ? String(experienceLevel).trim() : null,
      message ? String(message).trim() : null,
      now
    )

    return NextResponse.json({
      success: true,
      message: 'Application received successfully.',
      applicationId: id,
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json({ error: 'Failed to process application.' }, { status: 500 })
  }
}
