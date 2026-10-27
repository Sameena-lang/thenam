'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  UserCheck,
  MessageSquareText,
  Briefcase,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Bell,
  Activity,
  Shield,
  FileText,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  X,
} from 'lucide-react'

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

interface DashboardData {
  stats: {
    totalUsers: number
    activeUsers: number
    pendingUsers: number
    deactivatedUsers: number
    totalInquiries: number
    newInquiries: number
    contactedInquiries: number
    totalApplications: number
    newApplications: number
  }
  recentUsers: Array<{
    id: string
    name: string
    email: string
    company: string | null
    role: string
    status: string
    created_at: string
  }>
  recentInquiries: Array<{
    id: string
    full_name: string
    email: string
    service_name: string
    budget_tier: string | null
    status: string
    created_at: string
  }>
  recentLogs: Array<{
    id: string
    admin_email: string | null
    action: string
    details: string | null
    created_at: string
  }>
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Recent Admin Activity & Notifications Section State
  const [activities, setActivities] = useState<UnifiedActivity[]>([])
  const [pendingFollowups, setPendingFollowups] = useState<PendingFollowupItem[]>([])
  const [activityCounts, setActivityCounts] = useState({
    all: 0,
    inquiries: 0,
    users: 0,
    applications: 0,
    admin: 0,
    overdue: 0,
    pending: 0,
  })
  const [activityCategory, setActivityCategory] = useState<'all' | 'inquiries' | 'users' | 'applications' | 'admin'>('all')
  const [activityLoading, setActivityLoading] = useState(true)
  const [showAllModal, setShowAllModal] = useState(false)
  const [modalSearch, setModalSearch] = useState('')
  const [modalCategoryFilter, setModalCategoryFilter] = useState('all')

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) {
        throw new Error('Failed to load dashboard statistics')
      }
      const json = await res.json()
      setData(json)
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error fetching dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchActivities = useCallback(async (cat = activityCategory) => {
    setActivityLoading(true)
    try {
      const res = await fetch(`/api/admin/activities?category=${cat}&limit=25`)
      if (!res.ok) throw new Error('Failed to load recent activities')
      const json = await res.json()
      setActivities(json.activities || [])
      setPendingFollowups(json.pendingFollowups || [])
      if (json.counts) {
        setActivityCounts(json.counts)
      }
    } catch (err) {
      console.error('Error fetching activities:', err)
    } finally {
      setActivityLoading(false)
    }
  }, [activityCategory])

  const handleRefreshAll = () => {
    fetchStats()
    fetchActivities(activityCategory)
  }

  useEffect(() => {
    fetchStats()
    fetchActivities('all')
  }, [])

  useEffect(() => {
    fetchActivities(activityCategory)
  }, [activityCategory, fetchActivities])

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  const formatRelativeTime = (isoString: string) => {
    try {
      const now = Date.now()
      const diffMs = now - new Date(isoString).getTime()
      const mins = Math.floor(diffMs / 60000)
      if (mins < 1) return 'Just now'
      if (mins < 60) return `${mins}m ago`
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      if (days < 7) return `${days}d ago`
      return formatDate(isoString)
    } catch {
      return isoString
    }
  }

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'inquiry':
        return <MessageSquareText size={18} />
      case 'quote':
        return <FileText size={18} />
      case 'user':
        return <UserCheck size={18} />
      case 'application':
        return <Briefcase size={18} />
      case 'admin':
      default:
        return <Shield size={18} />
    }
  }

  return (
    <div>
      {/* Page Title & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            System Overview &amp; Metrics
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            Real-time management for users, inquiries, applications, and system audits.
          </p>
        </div>

        <button
          onClick={handleRefreshAll}
          className="adm-btn adm-btn-outline"
          type="button"
          disabled={loading || activityLoading}
        >
          <RefreshCw size={14} className={loading || activityLoading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="adm-alert-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="adm-stats-grid">
        {/* Total Users */}
        <div className="adm-stat-card">
          <div>
            <span className="adm-stat-label">Total Users / Clients</span>
            <div className="adm-stat-number">{loading ? '—' : data?.stats.totalUsers ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700', marginTop: '4px' }}>
              {loading ? '' : `${data?.stats.activeUsers ?? 0} currently active`}
            </div>
          </div>
          <div className="adm-stat-icon-wrap cyan">
            <Users size={22} />
          </div>
        </div>

        {/* Active Accounts */}
        <div className="adm-stat-card">
          <div>
            <span className="adm-stat-label">Active User Accounts</span>
            <div className="adm-stat-number">{loading ? '—' : data?.stats.activeUsers ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              {loading ? '' : `${data?.stats.pendingUsers ?? 0} pending review`}
            </div>
          </div>
          <div className="adm-stat-icon-wrap green">
            <UserCheck size={22} />
          </div>
        </div>

        {/* New Inquiries */}
        <div className="adm-stat-card">
          <div>
            <span className="adm-stat-label">Total Inquiries</span>
            <div className="adm-stat-number">{loading ? '—' : data?.stats.totalInquiries ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', marginTop: '4px' }}>
              {loading ? '' : `${data?.stats.newInquiries ?? 0} awaiting response`}
            </div>
          </div>
          <div className="adm-stat-icon-wrap amber">
            <MessageSquareText size={22} />
          </div>
        </div>

        {/* Career Applications */}
        <div className="adm-stat-card">
          <div>
            <span className="adm-stat-label">Career Applications</span>
            <div className="adm-stat-number">{loading ? '—' : data?.stats.totalApplications ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '700', marginTop: '4px' }}>
              {loading ? '' : `${data?.stats.newApplications ?? 0} new submitted`}
            </div>
          </div>
          <div className="adm-stat-icon-wrap purple">
            <Briefcase size={22} />
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Users & Recent Inquiries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Recent Users Table */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h2 className="adm-card-title">Recent Registered Users</h2>
              <p className="adm-card-desc">Verified clients, partners &amp; platform accounts</p>
            </div>
            <Link href="/admin/users" className="adm-btn adm-btn-outline adm-btn-sm">
              <span>View All Users</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>User / Client</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      Loading user records...
                    </td>
                  </tr>
                ) : !data?.recentUsers || data.recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      No registered users found.
                    </td>
                  </tr>
                ) : (
                  data.recentUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <Link href={`/admin/users/${u.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <strong style={{ display: 'block', color: '#0f172a' }}>{u.name}</strong>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>{u.email}</span>
                        </Link>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontSize: '12px', fontWeight: '600' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`adm-badge adm-badge-${u.status}`}>{u.status}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(u.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Inquiries Table */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h2 className="adm-card-title">Recent Inquiries &amp; Quotes</h2>
              <p className="adm-card-desc">Direct proposals requested from /contact</p>
            </div>
            <Link href="/admin/inquiries" className="adm-btn adm-btn-outline adm-btn-sm">
              <span>View Inquiries</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Prospect</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      Loading inquiries...
                    </td>
                  </tr>
                ) : !data?.recentInquiries || data.recentInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      No customer inquiries recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.recentInquiries.map((inq) => (
                    <tr key={inq.id}>
                      <td>
                        <strong style={{ display: 'block', color: '#0f172a' }}>{inq.full_name}</strong>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>{inq.email}</span>
                      </td>
                      <td style={{ fontSize: '12px', fontWeight: '600', color: '#0284c7' }}>
                        {inq.service_name}
                      </td>
                      <td>
                        <span className={`adm-badge adm-badge-${inq.status}`}>{inq.status}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(inq.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================
          RECENT ADMIN ACTIVITY & NOTIFICATIONS SECTION
          ======================================================== */}
      <div className="adm-activity-card" id="activity-section">
        <div className="adm-activity-header">
          <div className="adm-activity-header-left">
            <h2 className="adm-activity-title">
              <Activity size={20} color="#00c9f2" />
              <span>Recent Admin Activity &amp; Notifications</span>
              {pendingFollowups.length > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 9px',
                    borderRadius: '20px',
                    background: activityCounts.overdue > 0 ? '#fee2e2' : '#fef3c7',
                    color: activityCounts.overdue > 0 ? '#b91c1c' : '#b45309',
                    border: `1px solid ${activityCounts.overdue > 0 ? '#fca5a5' : '#fde68a'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <AlertTriangle size={12} />
                  <span>
                    {activityCounts.overdue > 0
                      ? `${activityCounts.overdue} Overdue Follow-up${activityCounts.overdue > 1 ? 's' : ''}`
                      : `${activityCounts.pending} Pending Action${activityCounts.pending > 1 ? 's' : ''}`}
                  </span>
                </span>
              )}
            </h2>
            <p className="adm-activity-subtitle">
              Live chronological stream of admin actions, quote requests, client registrations, and pending follow-ups
            </p>
          </div>

          <div className="adm-activity-header-actions">
            <button
              type="button"
              onClick={() => fetchActivities(activityCategory)}
              className="adm-btn adm-btn-outline adm-btn-sm"
              disabled={activityLoading}
              title="Refresh activity stream"
            >
              <RefreshCw size={13} className={activityLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAllModal(true)}
              className="adm-btn adm-btn-outline adm-btn-sm"
            >
              <span>View All Activity</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Pending Follow-ups and Overdue Items Banner */}
        {pendingFollowups.length > 0 ? (
          <div className="adm-overdue-banner">
            <div className="adm-overdue-header">
              <div className="adm-overdue-title">
                <AlertTriangle size={17} color="#d97706" />
                <span>Action Needed: Pending Follow-ups &amp; Overdue Items</span>
              </div>
              <span style={{ fontSize: '12px', color: '#92400e', fontWeight: '700' }}>
                {pendingFollowups.length} item{pendingFollowups.length > 1 ? 's' : ''} require attention
              </span>
            </div>

            <div className="adm-overdue-grid">
              {pendingFollowups.map((item) => (
                <div key={`${item.type}_${item.id}`} className="adm-overdue-item-card">
                  <div className="adm-overdue-item-top">
                    {item.isOverdue ? (
                      <span className="adm-overdue-badge">
                        <Clock size={11} />
                        <span>OVERDUE ({item.ageDays > 0 ? `${item.ageDays}d` : `${item.ageHours}h`})</span>
                      </span>
                    ) : (
                      <span className="adm-pending-badge">
                        <Clock size={11} />
                        <span>PENDING RESPONSE</span>
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatDate(item.date)}</span>
                  </div>

                  <div>
                    <strong style={{ display: 'block', fontSize: '13.5px', color: '#0f172a', marginBottom: '2px' }}>
                      {item.title}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', lineHeight: 1.35 }}>
                      {item.subtitle}
                    </span>
                  </div>

                  <Link
                    href={item.link}
                    className="adm-btn adm-btn-outline adm-btn-sm"
                    style={{ alignSelf: 'flex-start', marginTop: '4px', borderColor: '#fde68a', color: '#92400e' }}
                  >
                    <span>
                      {item.type === 'inquiry'
                        ? 'Respond to Inquiry'
                        : item.type === 'application'
                        ? 'Screen Candidate'
                        : 'Review User Account'}
                    </span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              margin: '16px 24px',
              padding: '12px 18px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CheckCircle2 size={16} color="#059669" />
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#065f46' }}>
              All customer follow-ups, quote requests, and candidate applications are fully up to date.
            </span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="adm-activity-tabs">
          <button
            type="button"
            onClick={() => setActivityCategory('all')}
            className={`adm-activity-tab-btn ${activityCategory === 'all' ? 'active' : ''}`}
          >
            <span>All Activities</span>
            <span className="adm-activity-tab-count">{activityCounts.all}</span>
          </button>
          <button
            type="button"
            onClick={() => setActivityCategory('inquiries')}
            className={`adm-activity-tab-btn ${activityCategory === 'inquiries' ? 'active' : ''}`}
          >
            <span>Inquiries &amp; Quotes</span>
            <span className="adm-activity-tab-count">{activityCounts.inquiries}</span>
          </button>
          <button
            type="button"
            onClick={() => setActivityCategory('users')}
            className={`adm-activity-tab-btn ${activityCategory === 'users' ? 'active' : ''}`}
          >
            <span>Client Registrations</span>
            <span className="adm-activity-tab-count">{activityCounts.users}</span>
          </button>
          <button
            type="button"
            onClick={() => setActivityCategory('applications')}
            className={`adm-activity-tab-btn ${activityCategory === 'applications' ? 'active' : ''}`}
          >
            <span>Career Applications</span>
            <span className="adm-activity-tab-count">{activityCounts.applications}</span>
          </button>
          <button
            type="button"
            onClick={() => setActivityCategory('admin')}
            className={`adm-activity-tab-btn ${activityCategory === 'admin' ? 'active' : ''}`}
          >
            <span>Admin Actions</span>
            <span className="adm-activity-tab-count">{activityCounts.admin}</span>
          </button>
        </div>

        {/* Activity Stream Feed */}
        <div className="adm-activity-feed">
          {activityLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '13px', margin: 0 }}>Loading recent administrative activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
              <Activity size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#334155', margin: '0 0 4px' }}>
                No recent activity recorded for this category
              </p>
              <p style={{ fontSize: '12px', margin: 0 }}>
                New inquiries, proposal quote updates, applications, and admin changes will appear here.
              </p>
            </div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="adm-activity-row">
                <div className="adm-activity-row-left">
                  <div className={`adm-activity-avatar ${act.badgeType}`}>
                    {getActivityIcon(act.category)}
                  </div>

                  <div className="adm-activity-details">
                    <div className="adm-activity-row-title">{act.title}</div>
                    <div className="adm-activity-row-desc">{act.description}</div>
                    <div className="adm-activity-row-meta">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        <span>{formatRelativeTime(act.timestamp)}</span>
                      </span>
                      <span>·</span>
                      <span>By: {act.actor}</span>
                      {act.isOverdue && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: '800',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fca5a5',
                          }}
                        >
                          {act.overdueReason || 'Follow-up overdue'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="adm-activity-row-right">
                  <span className={`adm-badge adm-badge-${act.status}`}>
                    {act.status}
                  </span>

                  <Link href={act.link} className="adm-btn adm-btn-outline adm-btn-sm">
                    <span>View Page</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View All Activity & Notifications Modal */}
      {showAllModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAllModal(false)}>
          <div
            className="adm-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-activity-title"
          >
            <div className="adm-modal-header">
              <div className="adm-modal-title" id="all-activity-title">
                <Activity size={18} color="#00c9f2" />
                <span>Complete Administrative Activity &amp; Notifications</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="adm-btn adm-btn-outline adm-btn-sm"
                style={{ padding: '6px' }}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                padding: '14px 24px',
                borderBottom: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                <Search
                  size={14}
                  style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  placeholder="Filter activities by name, keyword, or email..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="adm-input adm-input-light"
                  style={{ padding: '7px 12px 7px 32px', fontSize: '13px' }}
                />
              </div>

              <select
                value={modalCategoryFilter}
                onChange={(e) => setModalCategoryFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: '#334155',
                  background: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="all">All Categories</option>
                <option value="inquiry">Inquiries &amp; Quotes</option>
                <option value="user">Client Registrations</option>
                <option value="application">Career Applications</option>
                <option value="admin">Admin Actions</option>
              </select>
            </div>

            <div className="adm-modal-body">
              {activities
                .filter((a) => {
                  const matchesSearch =
                    modalSearch === '' ||
                    a.title.toLowerCase().includes(modalSearch.toLowerCase()) ||
                    a.description.toLowerCase().includes(modalSearch.toLowerCase()) ||
                    a.actor.toLowerCase().includes(modalSearch.toLowerCase())
                  const matchesCategory =
                    modalCategoryFilter === 'all' ||
                    a.category === modalCategoryFilter ||
                    (modalCategoryFilter === 'inquiry' && a.category === 'quote')
                  return matchesSearch && matchesCategory
                })
                .map((a) => (
                  <div
                    key={`modal_${a.id}`}
                    onClick={() => {
                      setShowAllModal(false)
                      router.push(a.link)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00c9f2'
                      e.currentTarget.style.backgroundColor = '#f8fafc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.backgroundColor = '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div className={`adm-activity-avatar ${a.badgeType}`} style={{ width: '34px', height: '34px' }}>
                        {getActivityIcon(a.category)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{a.title}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {a.description}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                          {formatRelativeTime(a.timestamp)} · By {a.actor}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span className={`adm-badge adm-badge-${a.status}`}>{a.status}</span>
                      <ChevronRight size={15} color="#94a3b8" />
                    </div>
                  </div>
                ))}
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="adm-btn adm-btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Section */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <h2 className="adm-card-title">Recent Administrative Audit Logs</h2>
            <p className="adm-card-desc">Immutable log of security actions, status changes, and user management</p>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Administrator</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    Loading audit trail...
                  </td>
                </tr>
              ) : !data?.recentLogs || data.recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                data.recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.02em' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{log.admin_email || 'System'}</td>
                    <td style={{ fontSize: '12.5px', color: '#334155' }}>{log.details || '—'}</td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(log.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
