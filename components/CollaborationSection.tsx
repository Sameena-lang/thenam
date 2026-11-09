'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CollaborationSection() {
  const clientCollaborations = [
    {
      slug: 'swekas-luxe',
      name: 'Swekas Luxe',
      domain: 'Luxury & Fashion Retail',
      logo: '/marquee-logos/swekas-luxe.png',
      collaborationNote:
        'Co-created a bespoke luxury e-commerce web platform with responsive visual merchandising, high-speed product filters, and friction-free checkout.',
      metrics: '3.4x Conversion Increase · Sub-second page loads',
    },
    {
      slug: 'pink-fish',
      name: 'Pink Fish',
      domain: 'Apparel & Lifestyle Brand',
      logo: '/marquee-logos/pink-fish.png',
      collaborationNote:
        'Engineered an ultra-fast mobile-first lifestyle retail experience with real-time stock availability, dynamic cart drawer, and interactive lookbooks.',
      metrics: '70% Mobile Traffic Optimization · 99.9% Uptime',
    },
    {
      slug: 'magizh-mahal',
      name: 'Magizh Mahal',
      domain: 'Hospitality & Event Venues',
      logo: '/marquee-logos/magizh-mahal.png',
      collaborationNote:
        'Collaborated on a real-time event booking and hall availability management portal with interactive visual walkthroughs and client lead routing.',
      metrics: '100% Automated Inquiries · Real-time Calendar Sync',
    },
    {
      slug: 'chennai-tales',
      name: 'Chennai Tales',
      domain: 'Digital Publishing & Media',
      logo: '/marquee-logos/chennai-tales.png',
      collaborationNote:
        'Architected a multi-format digital storytelling editorial portal, cultural archives, and high-speed bilingual content engine.',
      metrics: '50K+ Monthly Readers · 100/100 Core Web Vitals',
    },
  ]

  return (
    <>
      {/* ========================================================
          1. COLLABORATION MODELS (CLEAN WHITE SECTION)
          ======================================================== */}
      <section
        id="collaboration"
        className="collab-models-section"
        aria-label="Collaboration Models"
        style={{
          backgroundColor: '#ffffff',
          color: '#0a1930',
          padding: '95px 0 100px',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* OUR COLLABORATIONS - INFOGRAPHIC BANNER */}
          <div style={{ textAlign: 'center', maxWidth: '1080px', margin: '0 auto' }}>
            <Link
              href="/contact?topic=collaboration"
              style={{
                display: 'block',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)',
                transition: 'transform 0.28s ease, box-shadow 0.28s ease',
              }}
            >
              <img
                src="/images/our-collaborations.jpg"
                alt="Our Collaborations - Building Strong Partnerships. Creating Greater Impact."
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. FEATURED CLIENT COLLABORATIONS (BLACK / DARK NAVY SECTION)
          ======================================================== */}
      <section
        className="collab-case-studies-section"
        aria-label="Client Case Studies and Collaborative Impact"
        style={{
          backgroundColor: '#030e1c',
          color: '#ffffff',
          padding: '95px 0 105px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient background glows */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-100px',
            left: '10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 201, 242, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
            pointerEvents: 'none',
            filter: 'blur(70px)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-120px',
            right: '8%',
            width: '550px',
            height: '550px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(158, 229, 53, 0.09) 0%, rgba(0, 0, 0, 0) 70%)',
            pointerEvents: 'none',
            filter: 'blur(80px)',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(6, 17, 34, 0.9) 0%, rgba(4, 11, 22, 0.95) 100%)',
              border: '1px solid rgba(24, 48, 82, 0.85)',
              borderRadius: '22px',
              padding: '42px 36px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: '800',
                  color: '#9ee535',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                PROVEN COLLABORATIVE IMPACT
              </span>
              <h3
                style={{
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  fontWeight: '800',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  margin: '0 0 10px',
                }}
              >
                Real brands built through <span className="accent-cyan">close co-engineering.</span>
              </h3>
              <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: 0, lineHeight: '1.6' }}>
                Explore how our collaborative delivery model produced measurable business milestones for these growing businesses:
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                gap: '20px',
              }}
            >
              {clientCollaborations.map((collab) => (
                <div
                  key={collab.slug}
                  style={{
                    background: 'rgba(8, 20, 38, 0.8)',
                    border: '1px solid rgba(30, 58, 98, 0.7)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 201, 242, 0.55)'
                    e.currentTarget.style.background = 'rgba(12, 28, 52, 0.95)'
                    e.currentTarget.style.transform = 'translateY(-3px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(30, 58, 98, 0.7)'
                    e.currentTarget.style.background = 'rgba(8, 20, 38, 0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div>
                    {/* Logo Container */}
                    <div
                      style={{
                        height: '62px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(3, 9, 18, 0.65)',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        marginBottom: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <img
                        src={collab.logo}
                        alt={`${collab.name} logo`}
                        style={{
                          maxHeight: '44px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>{collab.name}</h4>
                      <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '700', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 7px', borderRadius: '4px' }}>
                        {collab.domain}
                      </span>
                    </div>

                    <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 14px' }}>
                      {collab.collaborationNote}
                    </p>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#9ee535',
                        marginBottom: '14px',
                        background: 'rgba(158, 229, 53, 0.08)',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(158, 229, 53, 0.18)',
                      }}
                    >
                      {collab.metrics}
                    </div>

                    <Link
                      href={`/projects/${collab.slug}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#00c9f2',
                        textDecoration: 'none',
                        transition: 'gap 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.gap = '9px')}
                      onMouseLeave={(e) => (e.currentTarget.style.gap = '6px')}
                    >
                      <span>View Project Case Study</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
