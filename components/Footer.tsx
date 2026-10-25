'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  return (
    <footer className="theme-footer">
      {/* Ambient background decoration */}
      <div className="footer-glow" />
      {/* Leaf decoration — exact reference image botanical leaf */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/footer-leaf-exact.png"
        alt=""
        aria-hidden="true"
        className="footer-leaf-art"
      />

      <div className="container footer-main">
        {/* Brand column */}
        <div className="footer-brand-col">
          <Link href="/" className="footer-logo-link" aria-label="Thenam Software Solutions home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/thenam-logo.png"
              alt="Thenam Software Solutions"
              className="footer-logo-img"
              width="210"
              height="55"
            />
          </Link>
          {/* SEO & Screen Reader accessible description */}
          <p className="sr-only">
            We build websites, AI-powered applications, and custom software that solve real business problems. Chennai, Tamil Nadu, India.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-nav">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/products">Products</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/collaboration">Collaboration</Link></li>
          </ul>
        </div>

        {/* Our Services */}
        <div className="footer-col">
          <h4 className="footer-heading">Our Services</h4>
          <ul className="footer-nav">
            <li><Link href="/services#web-development">Web Development</Link></li>
            <li><Link href="/services#ai-machine-learning">AI & Machine Learning</Link></li>
            <li><Link href="/services#custom-software">Custom Software</Link></li>
            <li><Link href="/services#business-automation">Business Automation</Link></li>
            <li><Link href="/services#digital-marketing">Digital Marketing</Link></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="footer-col footer-contact-col">
          <h4 className="footer-heading">Contact Us</h4>
          <ul className="footer-contact-list">
            <li>
              <MapPin size={14} className="contact-icon" />
              <span>Chennai, Tamil Nadu, India</span>
            </li>
            <li>
              <Mail size={14} className="contact-icon" />
              <a href="mailto:hello@thenamsoft.com">hello@thenamsoft.com</a>
            </li>
            <li>
              <Phone size={14} className="contact-icon" />
              <a href="tel:+919876543210">+91 98765 43210</a>
            </li>
          </ul>

          {/* Social Icons — exact reference order: LinkedIn, Instagram, YouTube, WhatsApp */}
          <div className="footer-social-row">
            <a
              href="https://www.linkedin.com/company/thenam-software-solutions/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn - Thenam Software Solutions"
              title="LinkedIn - Thenam Software Solutions"
              className="social-btn"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75c.97 0 1.76.78 1.76 1.75s-.79 1.76-1.76 1.76m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/thenam_software_solutions/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @thenam_software_solutions"
              title="Instagram @thenam_software_solutions"
              className="social-btn"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@Thenamsoftwaresolutions-v9w"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube @Thenamsoftwaresolutions-v9w"
              title="YouTube @Thenamsoftwaresolutions-v9w"
              className="social-btn"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://wa.me/916380456410"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
              className="social-btn"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Stay Updated / Newsletter */}
        <div className="footer-col newsletter-col">
          <h4 className="footer-heading">Stay Updated</h4>
          <p className="newsletter-desc">
            Get the latest updates, insights and opportunities.
          </p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="newsletter-input-wrap">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="newsletter-submit-btn"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
          {subscribed && (
            <p className="newsletter-success">
              <CheckCircle2 size={13} /> Thanks for subscribing!
            </p>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <p className="copyright-text">
            © {new Date().getFullYear()} Thenam Software Solutions. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <Link href="/privacy">Privacy Policy</Link>
            <span className="pipe-sep">|</span>
            <Link href="/terms">Terms & Conditions</Link>
            <span className="pipe-sep">|</span>
            <Link href="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
