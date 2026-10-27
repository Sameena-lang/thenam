import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export interface UnifiedActivity {
  id: string
  category: 'inquiry' | 'quote' | 'user' | 'application' | 'admin'
  title: string
  description: string
  actor: string
  timestamp: string
  link: string
  status: string
  badgeType: 'cyan' | 'green' | 'amber' | 'purple' | 'slate' | 'red'
  isOverdue?: boolean
  overdueReason?: string | null
}

export interface PendingFollowupItem {
  id: string
  type: 'inquiry' | 'application' | 'user'
  title: string
  subtitle: string
  serviceOrRole: string
  ageHours: number
  ageDays: number
  isOverdue: boolean
  urgency: 'overdue' | 'pending' | 'review'
  status: string
  link: string
  date: string
}

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)))
    const search = searchParams.get('search')?.toLowerCase().trim() || ''

    const now = Date.now()
    const activities: UnifiedActivity[] = []

    // 1. Inquiries & Quote Requests
    const inquiries = db.prepare(`
      SELECT id, full_name, email, company, service_name, budget_tier, timeline, message, status, created_at 
      FROM inquiries 
      ORDER BY created_at DESC 
      LIMIT 30
    `).all() as Array<{
      id: string
      full_name: string
      email: string
      company: string | null
      service_name: string
      budget_tier: string | null
      timeline: string | null
      message: string
      status: string
      created_at: string
    }>

    for (const inq of inquiries) {
      const createdMs = new Date(inq.created_at).getTime()
      const ageHours = Math.max(0, Math.floor((now - createdMs) / (1000 * 60 * 60)))
      const isOverdue = inq.status === 'new' && ageHours >= 24

      activities.push({
        id: `act_inq_${inq.id}`,
        category: inq.status === 'contacted' ? 'quote' : 'inquiry',
        title: inq.status === 'contacted' 
          ? `Quote Proposal Contacted: ${inq.full_name}`
          : `New Inquiry / Quote Request: ${inq.full_name}`,
        description: `${inq.company ? `${inq.company} · ` : ''}${inq.service_name} (${inq.budget_tier || 'Custom Budget'}) — ${inq.message.slice(0, 100)}${inq.message.length > 100 ? '...' : ''}`,
        actor: inq.email,
        timestamp: inq.created_at,
        link: '/admin/inquiries',
        status: inq.status,
        badgeType: inq.status === 'new' ? 'cyan' : inq.status === 'contacted' ? 'green' : 'amber',
        isOverdue,
        overdueReason: isOverdue ? `Awaiting admin response for ${Math.floor(ageHours / 24)} days (${ageHours}h)` : null,
      })
    }

    // 2. Client & Partner Registrations
    const users = db.prepare(`
      SELECT id, name, email, company, role, status, created_at, notes 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 30
    `).all() as Array<{
      id: string
      name: string
      email: string
      company: string | null
      role: string
      status: string
      created_at: string
      notes: string | null
    }>

    for (const u of users) {
      activities.push({
        id: `act_usr_${u.id}`,
        category: 'user',
        title: `Client Registered: ${u.name}`,
        description: `${u.role.toUpperCase()} account verified${u.company ? ` for ${u.company}` : ''}. ${u.notes || 'Verified client record in system.'}`,
        actor: u.email,
        timestamp: u.created_at,
        link: `/admin/users/${u.id}`,
        status: u.status,
        badgeType: u.status === 'active' ? 'green' : u.status === 'pending' ? 'amber' : 'slate',
        isOverdue: false,
      })
    }

    // 3. Career Applications
    const applications = db.prepare(`
      SELECT id, full_name, email, phone, role, experience_level, status, created_at 
      FROM applications 
      ORDER BY created_at DESC 
      LIMIT 30
    `).all() as Array<{
      id: string
      full_name: string
      email: string
      phone: string
      role: string
      experience_level: string | null
      status: string
      created_at: string
    }>

    for (const app of applications) {
      const createdMs = new Date(app.created_at).getTime()
      const ageHours = Math.max(0, Math.floor((now - createdMs) / (1000 * 60 * 60)))
      const isOverdue = app.status === 'submitted' && ageHours >= 72

      activities.push({
        id: `act_app_${app.id}`,
        category: 'application',
        title: `Career Application: ${app.full_name}`,
        description: `Applied for ${app.role} (${app.experience_level || 'Applicant'}). Phone: ${app.phone}`,
        actor: app.email,
        timestamp: app.created_at,
        link: '/admin/applications',
        status: app.status,
        badgeType: app.status === 'submitted' ? 'purple' : app.status === 'accepted' ? 'green' : 'slate',
        isOverdue,
        overdueReason: isOverdue ? `Application screening pending for ${Math.floor(ageHours / 24)} days` : null,
      })
    }

    // 4. Admin Audit Trail Actions
    const auditLogs = db.prepare(`
      SELECT id, admin_id, admin_email, action, target_type, target_id, details, created_at 
      FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT 40
    `).all() as Array<{
      id: string
      admin_id: string | null
      admin_email: string | null
      action: string
      target_type: string | null
      target_id: string | null
      details: string | null
      created_at: string
    }>

    for (const log of auditLogs) {
      let targetLink = '/admin/settings'
      if (log.target_type === 'inquiries') targetLink = '/admin/inquiries'
      else if (log.target_type === 'users') targetLink = log.target_id ? `/admin/users/${log.target_id}` : '/admin/users'
      else if (log.target_type === 'applications') targetLink = '/admin/applications'

      activities.push({
        id: `act_log_${log.id}`,
        category: 'admin',
        title: `Admin Action: ${log.action.replace(/_/g, ' ')}`,
        description: log.details || `Administrative event performed on ${log.target_type || 'system'}.`,
        actor: log.admin_email || 'System',
        timestamp: log.created_at,
        link: targetLink,
        status: 'completed',
        badgeType: 'slate',
        isOverdue: false,
      })
    }

    // Sort all activities chronologically descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Filter by category if not 'all'
    let filteredActivities = activities
    if (category === 'inquiries' || category === 'quote') {
      filteredActivities = activities.filter((a) => a.category === 'inquiry' || a.category === 'quote')
    } else if (category === 'users') {
      filteredActivities = activities.filter((a) => a.category === 'user')
    } else if (category === 'applications') {
      filteredActivities = activities.filter((a) => a.category === 'application')
    } else if (category === 'admin') {
      filteredActivities = activities.filter((a) => a.category === 'admin')
    }

    // Search filter
    if (search) {
      filteredActivities = filteredActivities.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.description.toLowerCase().includes(search) ||
          a.actor.toLowerCase().includes(search) ||
          a.status.toLowerCase().includes(search)
      )
    }

    // Compute Pending Follow-ups and Overdue Items list
    const pendingFollowups: PendingFollowupItem[] = []

    // A. Inquiries in 'new' or 'reviewing'
    for (const inq of inquiries) {
      if (inq.status === 'new' || inq.status === 'reviewing') {
        const createdMs = new Date(inq.created_at).getTime()
        const ageHours = Math.max(0, Math.floor((now - createdMs) / (1000 * 60 * 60)))
        const ageDays = Math.floor(ageHours / 24)
        const isOverdue = ageHours >= 24

        pendingFollowups.push({
          id: inq.id,
          type: 'inquiry',
          title: inq.full_name,
          subtitle: `${inq.company ? `${inq.company} · ` : ''}${inq.service_name} (${inq.budget_tier || 'Budget tier unspecified'})`,
          serviceOrRole: inq.service_name,
          ageHours,
          ageDays,
          isOverdue,
          urgency: isOverdue ? 'overdue' : inq.status === 'reviewing' ? 'review' : 'pending',
          status: inq.status,
          link: '/admin/inquiries',
          date: inq.created_at,
        })
      }
    }

    // B. Users in 'pending'
    for (const u of users) {
      if (u.status === 'pending') {
        const createdMs = new Date(u.created_at).getTime()
        const ageHours = Math.max(0, Math.floor((now - createdMs) / (1000 * 60 * 60)))
        const ageDays = Math.floor(ageHours / 24)
        const isOverdue = ageHours >= 48

        pendingFollowups.push({
          id: u.id,
          type: 'user',
          title: u.name,
          subtitle: `${u.role.toUpperCase()} onboarding review · ${u.email}`,
          serviceOrRole: `${u.role} profile`,
          ageHours,
          ageDays,
          isOverdue,
          urgency: isOverdue ? 'overdue' : 'pending',
          status: u.status,
          link: `/admin/users/${u.id}`,
          date: u.created_at,
        })
      }
    }

    // C. Applications in 'submitted' or 'screening'
    for (const app of applications) {
      if (app.status === 'submitted' || app.status === 'screening') {
        const createdMs = new Date(app.created_at).getTime()
        const ageHours = Math.max(0, Math.floor((now - createdMs) / (1000 * 60 * 60)))
        const ageDays = Math.floor(ageHours / 24)
        const isOverdue = ageHours >= 72

        pendingFollowups.push({
          id: app.id,
          type: 'application',
          title: app.full_name,
          subtitle: `${app.role} candidate (${app.experience_level || 'Applicant'})`,
          serviceOrRole: app.role,
          ageHours,
          ageDays,
          isOverdue,
          urgency: isOverdue ? 'overdue' : 'pending',
          status: app.status,
          link: '/admin/applications',
          date: app.created_at,
        })
      }
    }

    // Sort pending items: overdue first, then oldest
    pendingFollowups.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1
      if (!a.isOverdue && b.isOverdue) return 1
      return b.ageHours - a.ageHours
    })

    const counts = {
      all: activities.length,
      inquiries: activities.filter((a) => a.category === 'inquiry' || a.category === 'quote').length,
      users: activities.filter((a) => a.category === 'user').length,
      applications: activities.filter((a) => a.category === 'application').length,
      admin: activities.filter((a) => a.category === 'admin').length,
      overdue: pendingFollowups.filter((p) => p.isOverdue).length,
      pending: pendingFollowups.length,
    }

    return NextResponse.json({
      activities: filteredActivities.slice(0, limit),
      pendingFollowups,
      counts,
      total: filteredActivities.length,
    })
  } catch (error) {
    console.error('Error fetching admin activities:', error)
    return NextResponse.json({ error: 'Failed to retrieve administrative activities' }, { status: 500 })
  }
}
