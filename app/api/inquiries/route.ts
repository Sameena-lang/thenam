import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, recordNotification, recordAnalyticsEvent } from '@/lib/db'
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
      visitorId: bodyVisitorId,
      sessionId: bodySessionId,
    } = body

    if (!fullName || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and project message are required.' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const cookieVid = cookieStore.get('thenam_vid')?.value
    const visitorId = bodyVisitorId || cookieVid || null
    const sessionId = bodySessionId || cookieStore.get('thenam_sid')?.value || 's_inq_direct'

    const cleanEmail = String(email).trim().toLowerCase()
    const cleanName = String(fullName).trim()
    const id = 'inq_' + crypto.randomBytes(8).toString('hex')
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO inquiries (
        id, full_name, email, phone, company, service_id, service_name, budget_tier, timeline, message, need_nda, status, created_at, visitor_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
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
      now,
      visitorId
    )

    // Record conversion analytics event with privacy safeguards (no PII)
    if (visitorId) {
      recordAnalyticsEvent({
        visitorId,
        sessionId,
        eventName: 'enquiry_submitted',
        eventCategory: 'conversion',
        resourceId: String(serviceId),
        resourceName: String(serviceName),
        createdAt: now,
      })
    }

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

    // Trigger Admin Notification for the incoming inquiry/quote request
    recordNotification({
      type: 'inquiry',
      title: `New Proposal Request: ${cleanName}`,
      message: `${cleanName} requested a quote for ${serviceName}${budgetTier ? ` (${budgetTier})` : ''}. Follow-up required.`,
      link: '/admin/inquiries',
      referenceId: id,
      referenceType: 'inquiries',
      isRead: 0,
      createdAt: now,
    })

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
