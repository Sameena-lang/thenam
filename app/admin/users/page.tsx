'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Trash2,
  ExternalLink,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react'

interface WebsiteUser {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  role: 'client' | 'partner' | 'student' | 'founder'
  status: 'active' | 'pending' | 'deactivated'
  created_at: string
  notes: string | null
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<WebsiteUser[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPhone, setCreatePhone] = useState('')
  const [createCompany, setCreateCompany] = useState('')
  const [createRole, setCreateRole] = useState<'client' | 'partner' | 'student' | 'founder'>('client')
  const [createStatus, setCreateStatus] = useState<'active' | 'pending'>('active')
  const [createNotes, setCreateNotes] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Delete confirmation
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchUsers = useCallback(async (pageToLoad = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pageToLoad.toString(),
        limit: '10',
        search,
        status: statusFilter,
        role: roleFilter,
      })

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (!res.ok) {
        throw new Error('Failed to retrieve user records')
      }

      const data = await res.json()
      setUsers(data.users || [])
      setPagination(data.pagination)
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error fetching users')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, roleFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  const handleToggleStatus = async (user: WebsiteUser) => {
    const newStatus = user.status === 'active' ? 'deactivated' : 'active'
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update user status')
      fetchUsers(pagination.page)
    } catch (err) {
      alert('Could not update user status. Please try again.')
    }
  }

  const handleDeleteUser = async (id: string) => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user')
      setDeleteUserId(null)
      fetchUsers(pagination.page)
    } catch (err) {
      alert('Could not delete user account.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    setCreateLoading(true)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName,
          email: createEmail,
          phone: createPhone,
          company: createCompany,
          role: createRole,
          status: createStatus,
          notes: createNotes,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create user')
        setCreateLoading(false)
        return
      }

      // Success
      setShowCreateModal(false)
      setCreateName('')
      setCreateEmail('')
      setCreatePhone('')
      setCreateCompany('')
      setCreateNotes('')
      fetchUsers(1)
    } catch (err) {
      console.error(err)
      setCreateError('Network error while registering user.')
    } finally {
      setCreateLoading(false)
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            User &amp; Client Management
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            Inspect, search, and manage verified clients, partners, and platform user records.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="adm-btn adm-btn-primary"
          style={{ width: 'auto', padding: '10px 18px' }}
          type="button"
        >
          <Plus size={16} />
          <span>Add New Client/User</span>
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
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name, email, company, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-input adm-input-light"
              style={{ paddingLeft: '38px', height: '40px' }}
            />
          </div>

          {/* Status Filter */}
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
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
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
            <option value="all">All Roles</option>
            <option value="client">Client</option>
            <option value="partner">Partner</option>
            <option value="founder">Founder</option>
            <option value="student">Student</option>
          </select>

          <button
            onClick={() => fetchUsers(pagination.page)}
            className="adm-btn adm-btn-outline"
            style={{ height: '40px' }}
            type="button"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="adm-card">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>User / Organization</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Loading user records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No matching user records found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <Link href={`/admin/users/${u.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <strong style={{ display: 'block', color: '#0f172a', fontSize: '14px' }}>{u.name}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{u.company || 'Individual Account'}</span>
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#0f172a' }}>{u.email}</div>
                      {u.phone && <div style={{ fontSize: '11.5px', color: '#64748b' }}>{u.phone}</div>}
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge adm-badge-${u.status}`}>{u.status}</span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#64748b' }}>{formatDate(u.created_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          title="View user details"
                        >
                          Details
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`adm-btn adm-btn-sm ${u.status === 'active' ? 'adm-btn-outline' : 'adm-btn-primary'}`}
                          style={u.status !== 'active' ? { width: 'auto', padding: '5px 10px', fontSize: '11.5px' } : {}}
                          title={u.status === 'active' ? 'Deactivate account' : 'Activate account'}
                          type="button"
                        >
                          {u.status === 'active' ? <UserX size={13} /> : <UserCheck size={13} />}
                          <span>{u.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                        </button>

                        <button
                          onClick={() => setDeleteUserId(u.id)}
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          title="Delete user record"
                          type="button"
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
            Showing <strong>{users.length}</strong> of <strong>{pagination.total}</strong> total users
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="adm-btn adm-btn-outline adm-btn-sm"
              type="button"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <span style={{ fontSize: '13px', color: '#334155', fontWeight: '700', padding: '0 8px' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="adm-btn adm-btn-outline adm-btn-sm"
              type="button"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteUserId && (
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
          <div className="adm-card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', margin: '0 0 8px' }}>
              Confirm User Deletion
            </h3>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to permanently delete this user account? This action cannot be undone. Associated inquiries will be preserved.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteUserId(null)}
                disabled={deleteLoading}
                className="adm-btn adm-btn-outline"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteUserId)}
                disabled={deleteLoading}
                className="adm-btn adm-btn-danger"
                type="button"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
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
            overflowY: 'auto',
          }}
        >
          <div className="adm-card" style={{ maxWidth: '520px', width: '100%', padding: '28px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Register New Client / User
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Add verified record into database</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {createError && (
              <div className="adm-alert-error" role="alert">
                <AlertCircle size={15} />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                    Full Name *
                  </label>
                  <input
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Anandha Kumar"
                    className="adm-input adm-input-light"
                    style={{ padding: '9px 12px' }}
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="anand@company.in"
                    className="adm-input adm-input-light"
                    style={{ padding: '9px 12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                    Phone Number
                  </label>
                  <input
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="+91 98400 12345"
                    className="adm-input adm-input-light"
                    style={{ padding: '9px 12px' }}
                  />
                </div>

                <div>
                  <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                    Company / Organization
                  </label>
                  <input
                    value={createCompany}
                    onChange={(e) => setCreateCompany(e.target.value)}
                    placeholder="e.g. ZenTech Solutions"
                    className="adm-input adm-input-light"
                    style={{ padding: '9px 12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                    Account Role
                  </label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as any)}
                    className="adm-input adm-input-light"
                    style={{ padding: '9px 12px', height: '42px' }}
                  >
                    <option value="client">Client</option>
                    <option value="partner">Partner</option>
                    <option value="founder">Founder</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <div>
                  <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                    Status
                  </label>
                  <select
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value as any)}
                    className="adm-input adm-input-light"
                    style={{ padding: '9px 12px', height: '42px' }}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                  Administrative Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  placeholder="Notes about project scope, tier agreement, or referral source..."
                  className="adm-input adm-input-light"
                  style={{ padding: '9px 12px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createLoading}
                  className="adm-btn adm-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !createName || !createEmail}
                  className="adm-btn adm-btn-primary"
                  style={{ width: 'auto' }}
                >
                  {createLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Register User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
