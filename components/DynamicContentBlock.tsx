'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Layers, ExternalLink } from 'lucide-react'

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
    <div className={`dynamic-content-wrapper ${className}`} style={{ marginTop: '36px', width: '100%' }}>
      {/* Optional Block Header if multiple items */}
      {items.length > 0 && heading && (
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
            style={{
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 800,
              color: '#ffffff',
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
            <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: 0, maxWidth: '600px' }}>
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
              ? 'repeat(auto-fit, minmax(300px, 1fr))'
              : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="dynamic-cms-card"
            style={{
              background: '#081426',
              border: '1px solid #162642',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45)',
              transition: 'transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease',
            }}
          >
            {/* Card Thumbnail */}
            {item.image_url && (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  background: '#030a14',
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
                    transition: 'transform 0.4s ease',
                  }}
                  className="dynamic-card-img"
                />
                {item.subtitle && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      padding: '3px 9px',
                      borderRadius: '4px',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: 'rgba(5, 12, 24, 0.85)',
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
            )}

            {/* Card Content Body */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: '0 0 8px',
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </h4>

              <p
                style={{
                  fontSize: '13px',
                  color: '#94a3b8',
                  lineHeight: 1.55,
                  margin: '0 0 16px',
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
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(0, 201, 242, 0.15), rgba(0, 223, 165, 0.15))',
                        border: '1px solid rgba(0, 201, 242, 0.35)',
                        color: '#00c9f2',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
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
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(0, 201, 242, 0.15), rgba(0, 223, 165, 0.15))',
                        border: '1px solid rgba(0, 201, 242, 0.35)',
                        color: '#00c9f2',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
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

