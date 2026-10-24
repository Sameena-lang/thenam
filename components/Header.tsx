'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X, Sparkles, Sun, Moon } from 'lucide-react'

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
    { label: 'Products', href: '/products', pillClass: 'pill-products' },
    { label: 'About Us', href: '/about', pillClass: 'pill-about' },
    { label: 'Careers', href: '/careers', pillClass: 'pill-careers' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Main Navbar */}
      <header className="main-header">
        <div className="container header-inner">
          {/* Logo */}
          <Link href="/" className="brand-logo" aria-label="Thenam Software Solutions home">
            <img src="/thenam-leaf-clean.png" alt="Thenam Logo" className="logo-leaf header-logo-leaf" width="38" height="38" />
            <div className="brand-text">
              <span className="brand-name">
                THEN<span className="brand-name-accent">AM</span>
              </span>
              <span className="brand-tagline">SOFTWARE SOLUTIONS</span>
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
            {/* Theme Toggle Button (Yellow Sun Icon) */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {mounted && theme === 'light' ? (
                <Moon size={18} className="theme-toggle-icon moon" />
              ) : (
                <Sun size={18} className="theme-toggle-icon sun" />
              )}
            </button>

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
                <button
                  type="button"
                  className="mobile-theme-toggle"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  <span className="mobile-theme-label">
                    Appearance: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
                  </span>
                  {mounted && theme === 'light' ? (
                    <Moon size={17} style={{ color: '#0284c7' }} />
                  ) : (
                    <Sun size={17} style={{ color: '#fbbf24' }} />
                  )}
                </button>

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
