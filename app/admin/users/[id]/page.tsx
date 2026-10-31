'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Shield,
  FileText,
  UserCheck,
  UserX,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
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

interface UserInquiry {
  id: string
  service_name: string
  budget_tier: string | null
  timeline: string | null
  status: string
  created_at: string
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [user, setUser] = useState<WebsiteUser | null>(null)
  const [inquiries, setInquiries] = useState<UserInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchUser = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/users/${id}`)
        if (!res.ok) {
          throw new Error('User not found')
        }
        const data = await res.json()
        setUser(data.user)
        setInquiries(data.inquiries || [])

        setName(data.user.name || '')
        setEmail(data.user.email || '')
        setRole(data.user.role)
        setStatus(data.user.status)
        setPhone(data.user.phone || '')
        setCompany(data.user.company || '')
        setNotes(data.user.notes || '')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setSaveSuccess(false)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, status, phone, company, notes }),
      })
      if (!res.ok) throw new Error('Failed to update user profile')
      const data = await res.json()
      setUser(data.user)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err) {
      alert('Error updating user record.')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user')
      router.push('/admin/users')
    } catch (err) {
      alert('Could not delete user.')
      setDeleteLoading(false)
    }
  }

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p>Loading user profile details...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div>
        <Link href="/admin/users" className="adm-btn adm-btn-outline" style={{ marginBottom: '20px' }}>
          <ArrowLeft size={14} />
          <span>Back to Users</span>
        </Link>
        <div className="adm-alert-error">
          <AlertCircle size={16} />
          <span>{error || 'User record not found.'}</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/admin/users" className="adm-btn adm-btn-outline">
          <ArrowLeft size={14} />
          <span>Back to All Users</span>
        </Link>
      </div>

      {saveSuccess && (
        <div className="adm-alert-success" role="status">
          <CheckCircle2 size={16} />
          <span>User profile successfully saved to database.</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="adm-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #00c9f2 0%, #00dfa5 100%)',
                color: '#061426',
                fontSize: '24px',
                fontWeight: '900',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{user.name}</h1>
                <span className={`adm-badge adm-badge-${user.status}`}>{user.status}</span>
              </div>
              <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
                {user.company ? `${user.company} · ` : ''}Account ID: <code style={{ fontSize: '12px' }}>{user.id}</code>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="adm-btn adm-btn-danger"
              type="button"
            >
              <Trash2 size={14} />
              <span>Delete User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Profile Edit Form & Inquiries History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Left: User Details & Settings Form */}
        <div className="adm-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px' }}>
            Account Information &amp; Status
          </h2>

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block', fontSize: '12.5px', fontWeight: 600 }}>
                  Full Name *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="adm-input adm-input-light"
                  style={{ padding: '9px 12px' }}
                />
              </div>

              <div>
                <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block', fontSize: '12.5px', fontWeight: 600 }}>
                  Primary Email *
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="adm-input adm-input-light"
                  style={{ height: '42px', padding: '0 12px' }}
                >
                  <option value="client">Client</option>
                  <option value="partner">Partner</option>
                  <option value="founder">Founder</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="adm-input adm-input-light"
                  style={{ height: '42px', padding: '0 12px' }}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                  Phone / WhatsApp
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 ..."
                  className="adm-input adm-input-light"
                  style={{ padding: '9px 12px' }}
                />
              </div>

              <div>
                <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                  Company Name
                </label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Organization or brand"
                  className="adm-input adm-input-light"
                  style={{ padding: '9px 12px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                Administrative Internal Notes
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log internal notes, client milestones, contract tier details..."
                className="adm-input adm-input-light"
                style={{ padding: '9px 12px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Registered on: {formatDate(user.created_at)}
              </span>

              <button
                type="submit"
                disabled={saveLoading}
                className="adm-btn adm-btn-primary"
                style={{ width: 'auto' }}
              >
                {saveLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Inquiries & Interaction History */}
        <div className="adm-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
            Associated Inquiries &amp; Quotes
          </h2>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 18px' }}>
            Proposals and quote requests linked to this user’s email address
          </p>

          {inquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', borderRadius: '10px' }}>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                No quote inquiries submitted by this user yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13.5px', color: '#0284c7' }}>{inq.service_name}</strong>
                    <span className={`adm-badge adm-badge-${inq.status}`}>{inq.status}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '14px' }}>
                    {inq.budget_tier && <span>Tier: {inq.budget_tier}</span>}
                    {inq.timeline && <span>Timeline: {inq.timeline}</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                    Received: {formatDate(inq.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
              Confirm Deletion of {user.name}
            </h3>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to delete this user record ({user.email})? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="adm-btn adm-btn-outline"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="adm-btn adm-btn-danger"
                type="button"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
