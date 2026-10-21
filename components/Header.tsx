'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X, Sparkles } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Products', href: '/products' },
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="top-announcement">
        <div className="container announcement-inner">
          <div className="announcement-left">
            <Sparkles size={13} className="text-lime" />
            <span>Digital Solutions for a Smarter Tomorrow</span>
          </div>
          <div className="announcement-right">
            <span>Websites starting from <strong>₹1,999*</strong></span>
            <span className="dot-divider">•</span>
            <Link href="/contact" className="announcement-link">
              Talk to us <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="main-header">
        <div className="container header-inner">
          {/* Logo */}
          <Link href="/" className="brand-logo" aria-label="Thenam Software Solutions home">
            <img src="/thenam-logo.png" alt="Thenam Logo" className="logo-leaf" />
            <div className="brand-text">
              <span className="brand-name">
                THEN<span className="brand-name-accent">AM</span>
              </span>
              <span className="brand-tagline">SOFTWARE SOLUTIONS</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${active ? 'active' : ''}`}
                >
                  {link.label}
                  {active && <span className="active-dot" />}
                </Link>
              )
            })}
          </nav>

          {/* Right Action */}
          <div className="header-actions">
            <Link href="/contact" className="quote-btn">
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
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`mobile-nav-item ${isActive(link.href) ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{link.label}</span>
                    {isActive(link.href) && <span className="mobile-active-badge">Active</span>}
                  </Link>
                ))}
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
