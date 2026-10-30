'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  Layers,
  Package,
  FileText,
  Image as LucideImage,
  BarChart3,
} from 'lucide-react'
import NotificationBell from './NotificationBell'

interface AdminUserSummary {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminShell({
  children,
  admin,
}: {
  children: React.ReactNode
  admin: AdminUserSummary | null
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!isLoginPage && !admin) {
      router.replace('/admin/login')
    }
  }, [isLoginPage, admin, router])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!admin) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#061426', color: '#ffffff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={36} color="#00c9f2" />
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>Checking administrator credentials...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
      router.push('/admin/login')
    }
  }

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { href: '/admin/services', label: 'Services', icon: Layers },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/content', label: 'Content Management', icon: FileText },
    { href: '/admin/media', label: 'Image Library', icon: LucideImage },
    { href: '/admin/users', label: 'Users & Clients', icon: Users },
    { href: '/admin/inquiries', label: 'Inquiries & Quotes', icon: MessageSquareText },
    { href: '/admin/applications', label: 'Applications', icon: Briefcase },
    { href: '/admin/settings', label: 'Security & Settings', icon: Settings },
  ]

  return (
    <div className="adm-shell">
      {/* Sidebar */}
      <aside className={`adm-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="adm-sidebar-brand">
          <Image
            src="/thenam-leaf-icon.png"
            alt="THENAM"
            width={30}
            height={30}
            style={{ objectFit: 'contain' }}
          />
          <div>
            <div className="adm-sidebar-brand-name">THENAM ADMIN</div>
            <span className="adm-sidebar-badge">Control Panel</span>
          </div>
        </div>

        <nav className="adm-nav" aria-label="Admin Navigation">
          {navLinks.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`adm-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-admin-pill">
            <div className="adm-admin-avatar">
              {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="adm-admin-info">
              <span className="adm-admin-name">{admin.name}</span>
              <span className="adm-admin-email">{admin.email}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="adm-logout-btn" type="button">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="adm-main-wrap">
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="adm-mobile-toggle"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span className="adm-topbar-title">THENAM Software Solutions</span>
          </div>

          <div className="adm-topbar-right">
            <NotificationBell />
            <Link href="/" target="_blank" className="adm-view-site-btn">
              <span>View Public Website</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        <main className="adm-content">{children}</main>
      </div>
    </div>
  )
}
