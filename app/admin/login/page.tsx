'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please check your credentials.')
        setLoading(false)
        return
      }

      // Successful login
      router.push('/admin/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Login submit error:', err)
      setError('A network error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <div className="adm-login-header">
          <div className="adm-login-logo">
            <Image
              src="/thenam-leaf-icon.png"
              alt="THENAM Software Solutions"
              width={42}
              height={42}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h1 className="adm-login-title">THENAM Software Solutions</h1>
          <p className="adm-login-desc">Sign in to access the Centralized Admin Dashboard</p>
          <div className="adm-login-badge">
            <ShieldCheck size={13} />
            <span>Encrypted Administrator Gateway</span>
          </div>
        </div>

        {error && (
          <div className="adm-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="adm-form-group">
            <label className="adm-form-label" htmlFor="admin-email">
              Administrator Email
            </label>
            <div className="adm-input-wrap">
              <Mail size={16} className="adm-input-icon" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thenamsoft.com"
                className="adm-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label" htmlFor="admin-password">
              Password
            </label>
            <div className="adm-input-wrap">
              <Lock size={16} className="adm-input-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="adm-input"
                style={{ paddingRight: '40px' }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="adm-input-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="adm-btn-primary"
            style={{ marginTop: '12px' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
