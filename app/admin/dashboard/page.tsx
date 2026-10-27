'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  UserCheck,
  MessageSquareText,
  Briefcase,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

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
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    fetchStats()
  }, [])

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
          onClick={fetchStats}
          className="adm-btn adm-btn-outline"
          type="button"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
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
