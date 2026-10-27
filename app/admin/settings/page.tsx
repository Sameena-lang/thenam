'use client'

import { useState } from 'react'
import {
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  Server,
  Loader2,
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update password')
        setLoading(false)
        return
      }

      setSuccess('Your administrator password has been updated securely.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError('A network error occurred while updating your password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Security &amp; Administrative Settings
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
          Manage your administrator credentials, security policies, and inspect system integrity.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Password Update Card */}
        <div className="adm-card" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 201, 242, 0.12)', color: '#0284c7', display: 'grid', placeItems: 'center' }}>
              <Key size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Change Administrator Password
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Hashed with scrypt &amp; cryptographically salted
              </span>
            </div>
          </div>

          {error && (
            <div className="adm-alert-error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="adm-alert-success" role="status">
              <CheckCircle2 size={15} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: '14px' }}>
              <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="adm-input adm-input-light"
                style={{ padding: '9px 12px' }}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                New Password (Min 8 characters) *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="adm-input adm-input-light"
                style={{ padding: '9px 12px' }}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="adm-form-label" style={{ color: '#334155', marginBottom: '4px', display: 'block' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="adm-input adm-input-light"
                style={{ padding: '9px 12px' }}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="adm-btn adm-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Administrator Password</span>
              )}
            </button>
          </form>
        </div>

        {/* Security Overview & System Health */}
        <div className="adm-card" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'grid', placeItems: 'center' }}>
              <Shield size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                System Architecture &amp; Health
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Database engine, encryption, and session configuration
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={15} color="#0284c7" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Database Engine</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#059669' }}>
                Node.js Native SQLite (WAL Mode)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={15} color="#0284c7" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Session Security</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7' }}>
                HttpOnly, SameSite=Lax, SHA-256 Hashed
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={15} color="#0284c7" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Brute-Force Shield</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#059669' }}>
                Active (5-attempt lockout per IP)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={15} color="#0284c7" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Audit Logging</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#059669' }}>
                Enabled (All administrative actions recorded)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
