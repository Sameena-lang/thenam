import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'node:crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      company,
      serviceId = 'web',
      serviceName = 'Web Development',
      budgetTier,
      timeline,
      message,
      needNda = false,
    } = body

    if (!fullName || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and project message are required.' }, { status: 400 })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const cleanName = String(fullName).trim()
    const id = 'inq_' + crypto.randomBytes(8).toString('hex')
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO inquiries (
        id, full_name, email, phone, company, service_id, service_name, budget_tier, timeline, message, need_nda, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
    `).run(
      id,
      cleanName,
      cleanEmail,
      phone ? String(phone).trim() : null,
      company ? String(company).trim() : null,
      String(serviceId),
      String(serviceName),
      budgetTier ? String(budgetTier) : null,
      timeline ? String(timeline) : null,
      String(message).trim(),
      needNda ? 1 : 0,
      now
    )

    // Also auto-register or associate user in users table if new
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail)
    if (!existingUser) {
      const userId = 'usr_' + crypto.randomBytes(8).toString('hex')
      db.prepare(`
        INSERT INTO users (id, name, email, phone, company, role, status, created_at, notes)
        VALUES (?, ?, ?, ?, ?, 'client', 'active', ?, ?)
      `).run(
        userId,
        cleanName,
        cleanEmail,
        phone ? String(phone).trim() : null,
        company ? String(company).trim() : null,
        now,
        `Inquiry submitted for ${serviceName}`
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully. Our team will review your proposal request.',
      inquiryId: id,
    })
  } catch (error) {
    console.error('Error submitting inquiry:', error)
    return NextResponse.json({ error: 'Failed to process inquiry submission.' }, { status: 500 })
  }
}
