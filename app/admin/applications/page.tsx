'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Briefcase,
  Search,
  RefreshCw,
  ExternalLink,
  Mail,
  Trash2,
  AlertCircle,
} from 'lucide-react'

interface Application {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
  portfolio_link: string | null
  experience_level: string | null
  message: string | null
  status: 'submitted' | 'screening' | 'interviewed' | 'accepted' | 'rejected'
  created_at: string
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchApps = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ search, status: statusFilter })
      const res = await fetch(`/api/admin/applications?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load applications')
      const data = await res.json()
      setApps(data.applications || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching applications')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApps()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchApps])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      fetchApps()
    } catch (err) {
      alert('Could not update status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return
    try {
      await fetch(`/api/admin/applications/${id}`, { method: 'DELETE' })
      fetchApps()
    } catch (err) {
      alert('Could not delete application')
    }
  }

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Career &amp; Talent Applications
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            Talent applications and student internship submissions from /careers.
          </p>
        </div>

        <button onClick={fetchApps} className="adm-btn adm-btn-outline" type="button">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="adm-alert-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="adm-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search candidate name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-input adm-input-light"
              style={{ paddingLeft: '38px', height: '40px' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: '40px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13px',
              color: '#334155',
              outline: 'none',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="screening">Screening</option>
            <option value="interviewed">Interviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="adm-card">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Role Applied For</th>
                <th>Portfolio / Links</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Loading candidate applications...
                  </td>
                </tr>
              ) : apps.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No applications recorded yet.
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{app.full_name}</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{app.email}</span>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{app.phone}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0284c7' }}>
                        {app.role}
                      </span>
                    </td>
                    <td>
                      {app.portfolio_link ? (
                        <a
                          href={app.portfolio_link}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#0284c7',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          <span>View Portfolio</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Not provided</span>
                      )}
                    </td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        style={{
                          fontSize: '11.5px',
                          fontWeight: '700',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="screening">Screening</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(app.created_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <a
                          href={`mailto:${app.email}?subject=Thenam Software Application - ${app.role}`}
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          title="Contact candidate"
                        >
                          <Mail size={13} />
                        </a>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          type="button"
                          title="Delete application"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
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
