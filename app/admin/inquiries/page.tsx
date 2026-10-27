'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MessageSquareText,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'

interface Inquiry {
  id: string
  full_name: string
  email: string
  phone: string | null
  company: string | null
  service_id: string
  service_name: string
  budget_tier: string | null
  timeline: string | null
  message: string
  need_nda: number
  status: 'new' | 'reviewing' | 'contacted' | 'closed'
  created_at: string
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Selected inquiry for detail modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchInquiries = useCallback(async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: '10',
        search,
        status: statusFilter,
      })
      const res = await fetch(`/api/admin/inquiries?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load inquiries')
      const data = await res.json()
      setInquiries(data.inquiries || [])
      setPage(data.pagination.page)
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching inquiries')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchInquiries])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update inquiry status')
      fetchInquiries(page)
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus as any })
      }
    } catch (err) {
      alert('Could not update status.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete inquiry')
      setDeleteId(null)
      if (selectedInquiry && selectedInquiry.id === id) setSelectedInquiry(null)
      fetchInquiries(page)
    } catch (err) {
      alert('Could not delete inquiry.')
    }
  }

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Inquiries &amp; Custom Proposals
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            Manage direct project proposals, quote requests, and client consultation inquiries.
          </p>
        </div>

        <button
          onClick={() => fetchInquiries(page)}
          className="adm-btn adm-btn-outline"
          type="button"
        >
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

      {/* Filter and Search Bar */}
      <div className="adm-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by client name, email, company, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-input adm-input-light"
              style={{ paddingLeft: '38px', height: '40px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="#64748b" />
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
              <option value="all">All Inquiries</option>
              <option value="new">New (Unread)</option>
              <option value="reviewing">In Review</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="adm-card">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Prospect</th>
                <th>Service Required</th>
                <th>Budget / Timeline</th>
                <th>NDA</th>
                <th>Status</th>
                <th>Received</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Loading inquiries...
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No matching inquiries found.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '13.5px' }}>{inq.full_name}</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{inq.email}</span>
                      {inq.company && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{inq.company}</div>}
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0284c7' }}>
                        {inq.service_name}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#334155' }}>{inq.budget_tier || '—'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{inq.timeline || '—'}</div>
                    </td>
                    <td>
                      {inq.need_nda === 1 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#b45309', fontWeight: '700', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                          <Shield size={11} /> Required
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Standard</span>
                      )}
                    </td>
                    <td>
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
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
                        <option value="new">New</option>
                        <option value="reviewing">In Review</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(inq.created_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          type="button"
                        >
                          View Message
                        </button>
                        <button
                          onClick={() => setDeleteId(inq.id)}
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          type="button"
                          title="Delete inquiry"
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

        {/* Pagination Bar */}
        <div className="adm-pagination">
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing <strong>{inquiries.length}</strong> of <strong>{total}</strong> inquiries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => fetchInquiries(page - 1)}
              disabled={page <= 1 || loading}
              className="adm-btn adm-btn-outline adm-btn-sm"
              type="button"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <span style={{ fontSize: '13px', color: '#334155', fontWeight: '700', padding: '0 8px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchInquiries(page + 1)}
              disabled={page >= totalPages || loading}
              className="adm-btn adm-btn-outline adm-btn-sm"
              type="button"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6, 20, 38, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div className="adm-card" style={{ maxWidth: '600px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className={`adm-badge adm-badge-${selectedInquiry.status}`} style={{ marginBottom: '6px' }}>
                  {selectedInquiry.status}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
                  {selectedInquiry.full_name}
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  {selectedInquiry.email} {selectedInquiry.phone ? `· ${selectedInquiry.phone}` : ''}
                </span>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Service</span>
                <strong style={{ fontSize: '13px', color: '#0284c7' }}>{selectedInquiry.service_name}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Budget</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{selectedInquiry.budget_tier || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Timeline</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{selectedInquiry.timeline || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>NDA Agreement</span>
                <strong style={{ fontSize: '13px', color: selectedInquiry.need_nda ? '#b45309' : '#059669' }}>
                  {selectedInquiry.need_nda ? 'Required before discovery' : 'Not required'}
                </strong>
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Client Project Description:
              </span>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '13.5px',
                  color: '#1e293b',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedInquiry.message}
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <a
                href={`mailto:${selectedInquiry.email}?subject=Regarding your ${selectedInquiry.service_name} inquiry with Thenam Software`}
                className="adm-btn adm-btn-outline"
                style={{ textDecoration: 'none' }}
              >
                <Mail size={14} />
                <span>Send Email</span>
              </a>

              {selectedInquiry.phone && (
                <a
                  href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}?text=Hi ${encodeURIComponent(selectedInquiry.full_name)}, this is Thenam Software Solutions following up on your ${encodeURIComponent(selectedInquiry.service_name)} inquiry.`}
                  target="_blank"
                  rel="noreferrer"
                  className="adm-btn adm-btn-outline"
                  style={{ textDecoration: 'none', color: '#059669', borderColor: '#a7f3d0' }}
                >
                  <MessageCircle size={14} />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              <button
                onClick={() => handleUpdateStatus(selectedInquiry.id, 'contacted')}
                className="adm-btn adm-btn-primary"
                style={{ marginLeft: 'auto', width: 'auto' }}
                type="button"
              >
                <CheckCircle size={14} />
                <span>Mark Contacted</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6, 20, 38, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div className="adm-card" style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', margin: '0 0 8px' }}>
              Delete Inquiry
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 18px' }}>
              Are you sure you want to delete this customer inquiry?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setDeleteId(null)} className="adm-btn adm-btn-outline" type="button">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="adm-btn adm-btn-danger" type="button">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
