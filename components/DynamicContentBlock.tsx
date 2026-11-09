'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Layers, ExternalLink, Bot } from 'lucide-react'

export interface DynamicContentItem {
  id: string
  title: string
  subtitle: string | null
  short_description: string
  full_description: string | null
  image_url: string | null
  image_alt: string | null
  page: string
  section: string
  button_text: string | null
  button_url: string | null
  display_order: number
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

interface DynamicContentBlockProps {
  page: string
  section?: string
  eyebrow?: string
  heading?: string
  headingHighlight?: string
  description?: string
  variant?: 'cards-row' | 'grid-3' | 'spotlight'
  className?: string
}

export default function DynamicContentBlock({
  page,
  section,
  eyebrow = 'DYNAMIC HIGHLIGHTS',
  heading = 'Latest Additions &',
  headingHighlight = 'Updates',
  description,
  variant = 'cards-row',
  className = '',
}: DynamicContentBlockProps) {
  const [items, setItems] = useState<DynamicContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadContent() {
      try {
        const url = `/api/content?page=${encodeURIComponent(page)}${
          section ? `&section=${encodeURIComponent(section)}` : ''
        }`
        const res = await fetch(url)
        if (!res.ok) return
        const data = await res.json()
        if (active && Array.isArray(data.content)) {
          setItems(data.content)
        }
      } catch (err) {
        console.error('Error fetching dynamic content block:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadContent()
    return () => {
      active = false
    }
  }, [page, section])

  // If loading or no published items, do not render anything to preserve exact page layout
  if (loading || items.length === 0) {
    return null
  }

  return (
    <div
      className={`dynamic-content-wrapper ${className}`}
      style={{
        marginTop: '36px',
        marginBottom: '36px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .dynamic-cms-heading {
          color: #ffffff;
        }
        .light .dynamic-cms-heading,
        .inner-white-section .dynamic-cms-heading,
        .inner-pale-section .dynamic-cms-heading {
          color: #0f172a !important;
        }
        .dynamic-cms-desc {
          color: #94a3b8;
        }
        .light .dynamic-cms-desc,
        .inner-white-section .dynamic-cms-desc,
        .inner-pale-section .dynamic-cms-desc {
          color: #475569 !important;
        }
        .dynamic-cms-card {
          background: linear-gradient(180deg, #071529 0%, #030d1c 100%);
          border: 1px solid rgba(0, 201, 242, 0.25);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
        }
        .light .dynamic-cms-card,
        .inner-white-section .dynamic-cms-card,
        .inner-pale-section .dynamic-cms-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.07) !important;
        }
        .dynamic-card-title {
          color: #ffffff;
        }
        .light .dynamic-card-title,
        .inner-white-section .dynamic-card-title,
        .inner-pale-section .dynamic-card-title {
          color: #0f172a !important;
        }
        .dynamic-card-desc {
          color: #94a3b8;
        }
        .light .dynamic-card-desc,
        .inner-white-section .dynamic-card-desc,
        .inner-pale-section .dynamic-card-desc {
          color: #475569 !important;
        }
      ` }} />

      {/* Optional Block Header */}
      {heading && (
        <div style={{ marginBottom: '24px' }}>
          {eyebrow && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#00c9f2',
                marginBottom: '8px',
              }}
            >
              <Sparkles size={12} />
              <span>{eyebrow}</span>
            </span>
          )}
          <h3
            className="dynamic-cms-heading"
            style={{
              fontSize: 'clamp(22px, 2.5vw, 30px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
            }}
          >
            {heading}{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00c9f2, #82e62e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {headingHighlight}
            </span>
          </h3>
          {description && (
            <p className="dynamic-cms-desc" style={{ fontSize: '14px', margin: 0, maxWidth: '640px' }}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Render matching Cards Row or Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            variant === 'grid-3'
              ? 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))'
              : 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '24px',
        }}
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="dynamic-cms-card"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = 'rgba(0, 201, 242, 0.55)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.borderColor = ''
            }}
          >
            {/* Card Thumbnail */}
            {item.image_url ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  background: '#020914',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.image_alt || item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  className="dynamic-card-img"
                />
                {item.subtitle && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: 'rgba(5, 12, 24, 0.88)',
                      color: '#00c9f2',
                      border: '1px solid rgba(0, 201, 242, 0.4)',
                      backdropFilter: 'blur(6px)',
                      zIndex: 2,
                    }}
                  >
                    {item.subtitle}
                  </span>
                )}
              </div>
            ) : (
              /* Fallback Header when no image was uploaded */
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  padding: '24px 20px',
                  background: 'linear-gradient(135deg, rgba(0, 201, 242, 0.14) 0%, rgba(130, 230, 46, 0.08) 100%)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(0, 201, 242, 0.15)',
                    border: '1px solid rgba(0, 201, 242, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00c9f2',
                  }}
                >
                  <Bot size={22} />
                </div>
                {item.subtitle && (
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: 'rgba(0, 201, 242, 0.15)',
                      color: '#00c9f2',
                      border: '1px solid rgba(0, 201, 242, 0.35)',
                    }}
                  >
                    {item.subtitle}
                  </span>
                )}
              </div>
            )}

            {/* Card Content Body */}
            <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4
                className="dynamic-card-title"
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  margin: '0 0 10px',
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                }}
              >
                {item.title}
              </h4>

              <p
                className="dynamic-card-desc"
                style={{
                  fontSize: '13.5px',
                  lineHeight: 1.6,
                  margin: '0 0 18px',
                  flex: 1,
                }}
              >
                {item.short_description}
              </p>

              {item.button_text && item.button_url && (
                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  {item.button_url.startsWith('http') ? (
                    <a
                      href={item.button_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(0, 201, 242, 0.18), rgba(0, 223, 165, 0.18))',
                        border: '1px solid rgba(0, 201, 242, 0.4)',
                        color: '#00c9f2',
                        fontSize: '13px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span>{item.button_text}</span>
                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <Link
                      href={item.button_url}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(0, 201, 242, 0.18), rgba(0, 223, 165, 0.18))',
                        border: '1px solid rgba(0, 201, 242, 0.4)',
                        color: '#00c9f2',
                        fontSize: '13px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span>{item.button_text}</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
