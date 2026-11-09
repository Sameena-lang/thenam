'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, ExternalLink, X } from 'lucide-react'

interface AnnouncementItem {
  id: string
  title: string
  subtitle: string | null
  short_description: string
  button_text: string | null
  button_url: string | null
  image_url: string | null
  status: string
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [dismissedId, setDismissedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function fetchAnnouncements() {
      try {
        const storedDismissedId = sessionStorage.getItem('thenam_announcement_dismissed_id')
        if (storedDismissedId) {
          setDismissedId(storedDismissedId)
        }

        const res = await fetch('/api/content?page=home&section=announcements')
        if (!res.ok) return
        const data = await res.json()
        if (active && Array.isArray(data.content) && data.content.length > 0) {
          setAnnouncements(data.content)
        }
      } catch (err) {
        console.error('Error loading announcements:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchAnnouncements()
    return () => {
      active = false
    }
  }, [])

  if (loading || announcements.length === 0) {
    return null
  }

  // Display the first / highest priority announcement
  const item = announcements[0]

  // If this specific announcement was already dismissed by the user in this session, hide it
  if (dismissedId === item.id) {
    return null
  }

  const handleDismiss = () => {
    setDismissedId(item.id)
    try {
      sessionStorage.setItem('thenam_announcement_dismissed_id', item.id)
    } catch (e) {}
  }

  return (
    <aside
      className="site-announcement-bar"
      aria-label="Latest Announcement"
      style={{
        position: 'relative',
        zIndex: 40,
        width: '100%',
        background: 'linear-gradient(90deg, #021226 0%, #061c38 50%, #021226 100%)',
        borderBottom: '1px solid rgba(0, 201, 242, 0.35)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        color: '#ffffff',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '10px 16px',
          minHeight: '46px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left Badge & Content */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: '1 1 auto',
            minWidth: 0,
            flexWrap: 'wrap',
          }}
        >
          {/* Pulsing Pill Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'linear-gradient(135deg, rgba(0, 201, 242, 0.22), rgba(130, 230, 46, 0.22))',
              color: '#00e5ff',
              border: '1px solid rgba(0, 201, 242, 0.45)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#82e62e',
                boxShadow: '0 0 8px #82e62e',
                display: 'inline-block',
              }}
            />
            <Sparkles size={11} />
            <span>{item.subtitle || 'Announcement'}</span>
          </span>

          {/* Title & Short description */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              lineHeight: 1.4,
              flexWrap: 'wrap',
            }}
          >
            <strong
              style={{
                color: '#ffffff',
                fontWeight: 700,
                letterSpacing: '-0.01em',
              }}
            >
              {item.title}:
            </strong>
            <span
              style={{
                color: '#cbd5e1',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.short_description}
            </span>
          </div>
        </div>

        {/* Right CTA Button & Dismiss */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          {item.button_text && item.button_url && (
            item.button_url.startsWith('http') ? (
              <a
                href={item.button_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #00c9f2 0%, #00e599 100%)',
                  color: '#031525',
                  fontSize: '12px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 10px rgba(0, 201, 242, 0.35)',
                  transition: 'transform 0.18s ease, filter 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{item.button_text}</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              <Link
                href={item.button_url}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #00c9f2 0%, #00e599 100%)',
                  color: '#031525',
                  fontSize: '12px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 10px rgba(0, 201, 242, 0.35)',
                  transition: 'transform 0.18s ease, filter 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{item.button_text}</span>
                <ArrowRight size={12} />
              </Link>
            )
          )}

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            title="Dismiss announcement"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              padding: 0,
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'color 0.18s ease, background-color 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
