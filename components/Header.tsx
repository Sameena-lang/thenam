'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X, Sparkles } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)
  const [clickedHref, setClickedHref] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const isLight = document.documentElement.classList.contains('light')
    setTheme(isLight ? 'light' : 'dark')
  }, [])

  useEffect(() => {
    setClickedHref(null)
  }, [pathname])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
      try {
        localStorage.setItem('thenam-theme', 'light')
      } catch (e) {}
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      document.documentElement.setAttribute('data-theme', 'dark')
      try {
        localStorage.setItem('thenam-theme', 'dark')
      } catch (e) {}
    }
  }

  const navLinks = [
    { label: 'Home', href: '/', pillClass: 'pill-home' },
    { label: 'Services', href: '/services', pillClass: 'pill-services' },
    { label: 'Projects', href: '/projects', pillClass: 'pill-projects' },
    { label: 'About Us', href: '/about', pillClass: 'pill-about' },
    { label: 'Careers', href: '/careers', pillClass: 'pill-careers' },
    { label: 'Collaboration', href: '/collaboration', pillClass: 'pill-collaboration' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/projects') return pathname.startsWith('/projects') || pathname.startsWith('/products')
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Main Navbar */}
      <header className="main-header">
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 980px) {
            .header-quote-btn {
              display: none !important;
            }
            .desktop-nav {
              display: none !important;
            }
            .mobile-toggle {
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              width: 38px !important;
              height: 38px !important;
              border-radius: 8px !important;
              background: rgba(255, 255, 255, 0.06) !important;
              border: 1px solid rgba(255, 255, 255, 0.14) !important;
              color: #ffffff !important;
              cursor: pointer !important;
              flex-shrink: 0 !important;
            }
            .brand-logo {
              min-width: 0 !important;
              flex-shrink: 0 !important;
              gap: 9px !important;
            }
            .brand-name {
              font-size: 16.5px !important;
              white-space: nowrap !important;
            }
            .brand-tagline {
              font-size: 7px !important;
              letter-spacing: 0.13em !important;
              white-space: nowrap !important;
            }
            .logo-leaf {
              width: 34px !important;
              height: 34px !important;
              flex-shrink: 0 !important;
            }
          }
          @media (max-width: 360px) {
            .brand-name {
              font-size: 15px !important;
            }
            .brand-tagline {
              font-size: 6.5px !important;
              letter-spacing: 0.1em !important;
            }
            .logo-leaf {
              width: 30px !important;
              height: 30px !important;
            }
          }
        ` }} />
        <div className="container header-inner">
          {/* Logo */}
          <Link href="/" className="brand-logo" aria-label="Thenam Software Solutions home">
            <img src="/thenam-leaf-clean.png" alt="Thenam Logo" className="logo-leaf header-logo-leaf" width="38" height="38" />
            <div className="brand-text" style={{ flexShrink: 0, minWidth: 0 }}>
              <span className="brand-name" style={{ whiteSpace: 'nowrap' }}>
                THEN<span className="brand-name-accent">AM</span>
              </span>
              <span className="brand-tagline" style={{ whiteSpace: 'nowrap' }}>SOFTWARE SOLUTIONS</span>
            </div>
          </Link>

          {/* Desktop Nav - Centered with Home highlighted with cyan text & cyan-to-green underline */}
          <nav className="desktop-nav">
            {navLinks.map((link) => {
              const active = clickedHref ? clickedHref === link.href : isActive(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setClickedHref(link.href)}
                  className={`nav-item-link ${active ? 'is-active-nav' : ''}`}
                  aria-label={link.label}
                >
                  <span className="nav-item-text">{link.label}</span>
                  {active && <span className="nav-active-bar" aria-hidden="true" />}
                </Link>
              )
            })}
          </nav>

          {/* Right Action */}
          <div className="header-actions">
            {/* Gradient Quote Button */}
            <Link href="/contact" className="quote-btn header-quote-btn">
              <span>Get a Free Quote</span>
              <ArrowRight size={15} />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="mobile-toggle"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <div className="container mobile-drawer-inner">
              <nav className="mobile-nav-list">
                {navLinks.map((link) => {
                  const active = clickedHref ? clickedHref === link.href : isActive(link.href)

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`mobile-nav-item mobile-nav-pill ${link.pillClass} ${active ? 'is-active-pill' : ''}`}
                      onClick={() => {
                        setClickedHref(link.href)
                        setMobileMenuOpen(false)
                      }}
                    >
                      <div className="mobile-pill-content">
                        <img
                          src="/thenam-logo-transparent.png"
                          alt=""
                          className={`nav-pill-leaf ${active ? 'active-leaf' : 'inactive-leaf'}`}
                          width="16"
                          height="16"
                        />
                        <span>{link.label}</span>
                      </div>
                      {active && <span className="mobile-active-badge">Active</span>}
                    </Link>
                  )
                })}
              </nav>
              <div className="mobile-drawer-footer">
                <Link
                  href="/contact"
                  className="quote-btn full-width"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Get a Free Quote</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
