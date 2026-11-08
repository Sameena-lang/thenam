'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Image as ImageIcon,
  Building2,
  Users2,
  Calendar,
  Code2,
  Handshake,
  PartyPopper,
  ArrowRight,
  X,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'

export interface GalleryCategory {
  id: string
  title: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>
  image: string
  tag: string
  headline: string
  desc: string
  highlights: string[]
}

const galleryData: GalleryCategory[] = [
  {
    id: 'office-infrastructure',
    title: 'Our Office & Infrastructure',
    icon: Building2,
    image: '/images/gallery/office-infrastructure.jpg',
    tag: 'Chennai Headquarters & Labs',
    headline: 'Modern High-Performance Engineering Workspaces',
    desc: 'Our headquarters in Chennai is engineered for high-velocity software delivery. Equipped with ergonomic developer workstations, dual 4K monitors, high-speed fiber networks, and isolated testing sandboxes for web, mobile, and cloud environments.',
    highlights: [
      'High-security network with strict Git & zero-trust access controls',
      'Dedicated QA & automated testing device workstations',
      'Collaborative architecture whiteboard pods for sprint design',
    ],
  },
  {
    id: 'team-collaboration',
    title: 'Team Collaboration',
    icon: Users2,
    image: '/images/gallery/team-collaboration.jpg',
    tag: 'Synchronous Agile Cadence',
    headline: 'Real-Time Cross-Functional Agile Pods',
    desc: 'We engineer with radical transparency. Engineering squads collaborate synchronously across UI/UX design, frontend components, and backend microservices with daily standups, live pull request reviews, and continuous team sharing.',
    highlights: [
      'Direct founder-to-engineer collaborative sprint rituals',
      'Live peer programming and architectural code audits',
      'Seamless timezone alignment across global time zones',
    ],
  },
  {
    id: 'corporate-events',
    title: 'Corporate Events',
    icon: Calendar,
    image: '/images/gallery/corporate-events.jpg',
    tag: 'Symposiums & Keynotes',
    headline: 'Tech Symposiums, Demos & Industry Keynotes',
    desc: 'From hosting technical demo days and university campus hackathons to presenting breakthroughs in regional Tamil AI language models, our leadership and developers regularly share knowledge with the wider ecosystem.',
    highlights: [
      'Annual Thenam Tech Showcase & live MVP demos',
      'Campus engineering workshops across Tamil Nadu',
      'Industry partner panels and startup incubator talks',
    ],
  },
  {
    id: 'technology-development',
    title: 'Technology Development',
    icon: Code2,
    image: '/images/gallery/technology-development.jpg',
    tag: 'Full-Stack Craftsmanship',
    headline: 'Architecting Scalable Next.js 16 & AI Pipelines',
    desc: 'At our core is an unrelenting focus on code craftsmanship. We develop type-safe Next.js 16 architectures, PostgreSQL relational layers, automated CI/CD DevOps workflows, and enterprise LLM vector pipelines.',
    highlights: [
      'Strict TypeScript and Next.js 16 App Router standards',
      'High-concurrency PostgreSQL and serverless backends',
      'Enterprise RAG pipelines & Tamil language agents',
    ],
  },
  {
    id: 'client-meetings',
    title: 'Client Meetings',
    icon: Handshake,
    image: '/images/gallery/client-meetings.jpg',
    tag: 'Transparent Advisory',
    headline: 'Weekly Milestone Demos & Strategic Alignment',
    desc: 'We partner closely with founders and enterprises. Every week, our squads host live sprint demos with clients, walking through production builds, discussing user feedback, and shaping product roadmaps together.',
    highlights: [
      'Interactive preview links on every Git commit',
      'Weekly live video demo and stakeholder Q&A',
      'Direct Slack & Linear shared workspaces',
    ],
  },
  {
    id: 'workshops-celebrations',
    title: 'Workshops & Celebrations',
    icon: PartyPopper,
    image: '/images/gallery/workshops-celebrations.jpg',
    tag: 'Culture & Milestones',
    headline: 'Workshops, Hackathons & Team Celebrations',
    desc: 'Culture fuels our velocity. From celebratory launches and team dinners to internal hackathons and open-source contributions, we celebrate each milestone as one united engineering unit.',
    highlights: [
      'Quarterly project shipment celebrations',
      'Internal weekend hackathons and AI build sprints',
      'Continuous mentorship and developer growth',
    ],
  },
]

export default function ThenamGallerySection() {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false)
    }
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen])

  return (
    <section
      className="thenam-gallery-section"
      aria-label="THENAM Moments Gallery"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '85px 0 95px',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* ========================================================
          DECORATIVE SVG ELEMENTS (CORNER GRADIENTS & DOTS)
          ======================================================== */}
      {/* Top-Left Cyan & Lime Wave Accent */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '320px',
          height: '240px',
          pointerEvents: 'none',
          opacity: 0.85,
          zIndex: 0,
        }}
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="tlCyanLimeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00c9f2" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#10b981" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#82e62e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,0 L240,0 C200,90 140,160 50,195 C15,205 0,210 0,210 Z"
          fill="url(#tlCyanLimeGrad)"
        />
      </svg>

      {/* Bottom-Right Cyan & Green Flowing Wave Accent */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '360px',
          height: '260px',
          pointerEvents: 'none',
          opacity: 0.9,
          zIndex: 0,
        }}
        viewBox="0 0 360 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brCyanLimeGrad" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#82e62e" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#00c9f2" stopOpacity="0.35" />
            <stop offset="75%" stopColor="#0284c7" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M360,260 L80,260 C130,170 210,100 300,40 C325,25 345,15 360,0 Z"
          fill="url(#brCyanLimeGrad)"
        />
      </svg>

      {/* Top-Right Decorative Dot Matrix Grid */}
      <div
        className="gallery-decorative-dots"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '28px',
          right: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 6px)',
          gap: '8px',
          pointerEvents: 'none',
          opacity: 0.6,
          zIndex: 0,
        }}
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#00c9f2',
            }}
          />
        ))}
      </div>

      {/* Bottom-Left Decorative Dot Matrix Grid */}
      <div
        className="gallery-decorative-dots"
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '36px',
          left: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 6px)',
          gap: '8px',
          pointerEvents: 'none',
          opacity: 0.65,
          zIndex: 0,
        }}
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#0284c7',
            }}
          />
        ))}
      </div>

      {/* ========================================================
          MAIN CONTENT CONTAINER
          ======================================================== */}
      <div
        className="container"
        style={{
          position: 'relative',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 24px',
          zIndex: 1,
        }}
      >
        {/* ========================================================
            TOP CONTENT AREA: 2-COLUMN LAYOUT
            ======================================================== */}
        <div className="gallery-top-grid">
          {/* Left Column: Eyebrow, Heading & Description */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  backgroundColor: '#e0f2fe',
                  border: '1px solid rgba(2, 132, 199, 0.2)',
                  color: '#0284c7',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <ImageIcon size={13} style={{ color: '#0284c7' }} />
                <span>OUR GALLERY</span>
              </div>
              <div
                style={{
                  width: '54px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #00c9f2, #10b981)',
                  borderRadius: '2px',
                }}
              />
            </div>

            <h2
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: '900',
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                margin: '0 0 16px',
              }}
            >
              <span style={{ color: '#0f172a', display: 'block' }}>Moments That</span>
              <span
                style={{
                  display: 'block',
                  background: 'linear-gradient(90deg, #0284c7 0%, #00c9f2 35%, #10b981 75%, #82e62e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Define Our Journey.
              </span>
            </h2>

            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.65,
                color: '#475569',
                margin: '0 0 14px',
                maxWidth: '460px',
                fontWeight: '500',
              }}
            >
              Discover the people, projects, partnerships and innovations behind THENAM Software Solutions.
            </p>

            <div
              style={{
                width: '44px',
                height: '3px',
                borderRadius: '2px',
                background: 'linear-gradient(90deg, #00c9f2, #82e62e)',
              }}
            />
          </div>

          {/* Right Column: Large Main Office Photograph with Decorative Glow */}
          <div style={{ position: 'relative' }}>
            {/* Floating decorative gradient translucent badge */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-14px',
                left: '-14px',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                transform: 'rotate(-10deg)',
                background: 'linear-gradient(135deg, rgba(0, 201, 242, 0.9), rgba(130, 230, 46, 0.9))',
                boxShadow: '0 8px 24px rgba(0, 201, 242, 0.35)',
                zIndex: 3,
              }}
            />

            {/* Main Office Image Frame */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: '22px',
                overflow: 'hidden',
                border: '1.5px solid rgba(0, 201, 242, 0.35)',
                boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08), 0 4px 14px rgba(0, 201, 242, 0.06)',
                backgroundColor: '#f8fafc',
              }}
            >
              <Image
                src="/images/gallery/main-office-collaboration.jpg"
                alt="THENAM Software Solutions - Technology Team Collaborating in Modern Office"
                fill
                sizes="(max-width: 768px) 100vw, 620px"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            SIX INDIVIDUAL GALLERY PHOTO CARDS IN ONE ROW ON DESKTOP
            ======================================================== */}
        <div className="gallery-cards-grid">
          {galleryData.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="gallery-card-item"
                onClick={() => {
                  setActiveCategoryIndex(idx)
                  setIsModalOpen(true)
                }}
              >
                {/* Photo Element */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1.24 / 1', overflow: 'hidden' }}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {/* Caption Bar */}
                <div
                  style={{
                    padding: '10px 10px 11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: '#ffffff',
                    borderTop: '1px solid #f1f5f9',
                    minHeight: '46px',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      background: 'rgba(2, 132, 199, 0.1)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={12} style={{ color: '#0284c7' }} />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#0f172a',
                      lineHeight: '1.25',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                    title={item.title}
                  >
                    {item.title}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* ========================================================
            BOTTOM BUTTON WITH SUBTLE GRADIENT DIVIDER LINE
            ======================================================== */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '28px',
          }}
        >
          {/* Subtle horizontal gradient line behind button */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '8%',
              right: '8%',
              height: '1.5px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(0, 201, 242, 0.5) 25%, rgba(16, 185, 129, 0.6) 50%, rgba(130, 230, 46, 0.5) 75%, transparent 100%)',
              zIndex: 1,
            }}
          />

          <button
            type="button"
            onClick={() => {
              setActiveCategoryIndex(0)
              setIsModalOpen(true)
            }}
            className="gallery-explore-btn"
          >
            <span>Explore Our Moments</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* ========================================================
          INTERACTIVE CULTURE DETAILS MODAL DIALOG
          ======================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Explore THENAM Culture & Moments"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(3, 7, 18, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#070f1e',
              borderRadius: '24px',
              border: '1px solid #1e3a62',
              padding: '32px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#00c9f2',
                    marginBottom: '4px',
                  }}
                >
                  THENAM CULTURE &amp; MOMENTS
                </span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  Moments That Define Our Journey
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Selector Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '12px',
                marginBottom: '20px',
              }}
            >
              {galleryData.map((c, idx) => {
                const isActive = activeCategoryIndex === idx
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategoryIndex(idx)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                      border: isActive ? '1px solid #00c9f2' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isActive ? 'rgba(0, 201, 242, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: isActive ? '#00c9f2' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {c.title}
                  </button>
                )
              })}
            </div>

            {/* Active Category Display */}
            {(() => {
              const current = galleryData[activeCategoryIndex]
              const Icon = current.icon
              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    background: 'rgba(11, 22, 43, 0.65)',
                    border: '1px solid rgba(30, 58, 98, 0.6)',
                    borderRadius: '18px',
                    padding: '24px',
                    marginBottom: '28px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(158, 229, 53, 0.12)',
                        color: '#9ee535',
                        fontSize: '11px',
                        fontWeight: '700',
                        marginBottom: '12px',
                      }}
                    >
                      <Icon size={13} />
                      <span>{current.tag}</span>
                    </div>

                    <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '0 0 10px', lineHeight: '1.3' }}>
                      {current.headline}
                    </h4>

                    <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.65', margin: '0 0 16px' }}>
                      {current.desc}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {current.highlights.map((h, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#e2e8f0' }}>
                          <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '240px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <Image
                      src={current.image}
                      alt={current.headline}
                      fill
                      sizes="(max-width: 768px) 100vw, 420px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
              )
            })()}

            {/* Modal Footer Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '20px',
              }}
            >
              <a
                href="https://www.instagram.com/thenam_software_solutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="quote-btn"
                style={{ padding: '10px 18px', fontSize: '12.5px' }}
              >
                <span>Follow Our Live Moments on Instagram</span>
                <ExternalLink size={14} />
              </a>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#cbd5e1',
                  padding: '10px 18px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
