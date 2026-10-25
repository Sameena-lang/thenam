'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CtaBanner from '@/components/CtaBanner'
import CollaborationSection from '@/components/CollaborationSection'
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  HeartHandshake,
  Lightbulb,
  CheckCircle2,
  MapPin,
  Award,
  Users2,
  Code2,
} from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: ShieldCheck,
      color: '#0284c7',
      bg: '#e0f2fe',
      title: 'Discipline in Engineering',
      desc: 'We don’t cut corners. From type-safe code to automated testing and clean architectures, we build software designed to stand the test of scale.',
    },
    {
      icon: Compass,
      color: '#059669',
      bg: '#ecfdf5',
      title: 'Radical Transparency',
      desc: 'No jargon, no hidden fees, no opaque black boxes. You get complete visibility into the progress, codebase, and deployment environments every step.',
    },
    {
      icon: Lightbulb,
      color: '#65a30d',
      bg: '#f7fee7',
      title: 'Practical Intelligence',
      desc: 'We don’t chase tech hypes for the sake of it. We implement AI, automation, and modern web frameworks strictly where they produce real economic return.',
    },
    {
      icon: HeartHandshake,
      color: '#2563eb',
      bg: '#eff6ff',
      title: 'Enduring Partnership',
      desc: 'We consider our work done only when your business succeeds. We back our deliverables with responsive post-launch support and continuous advisory.',
    },
  ]

  const stats = [
    { number: '50+', label: 'Delivered Projects' },
    { number: '98%', label: 'Client Satisfaction' },
    { number: '₹1,999*', label: 'Accessible Entry Starting Tier' },
    { number: '15+', label: 'Industries Served Globally' },
  ]

  return (
    <>
      <Header />

      <main>
        {/* ========================================================
            ABOUT HERO SECTION
            ======================================================== */}
        <section className="inner-page-hero" aria-label="About Us Header">
          <div className="hero-glow-cyan" aria-hidden="true" />
          <div className="container">
            <div className="inner-hero-content">
              <span className="inner-hero-eyebrow">
                <Sparkles size={13} style={{ display: 'inline', marginRight: '6px' }} />
                ABOUT THENAM SOFTWARE SOLUTIONS
              </span>
              <h1 className="inner-hero-title">
                Engineered with discipline, <span className="accent-cyan">driven</span> by{' '}
                <span className="accent-lime">curiosity.</span>
              </h1>
              <p className="inner-hero-desc">
                Headquartered in Chennai, Tamil Nadu, Thenam Software Solutions combines human-centered product design with rigorous software engineering to turn ambitious ideas into lasting digital reality.
              </p>
              <div className="hero-btn-row">
                <Link href="/contact" className="quote-btn">
                  <span>Start a Conversation</span>
                  <ArrowRight size={15} />
                </Link>
                <a
                  href="#collaboration"
                  className="explore-btn"
                  style={{
                    borderColor: 'rgba(0, 201, 242, 0.5)',
                    background: 'rgba(0, 201, 242, 0.08)',
                    color: '#ffffff',
                  }}
                >
                  <Users2 size={15} style={{ color: '#00c9f2' }} />
                  <span>How We Collaborate</span>
                </a>
                <Link href="/services" className="explore-btn">
                  <span>Explore What We Do</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            KEY METRICS STRIP
            ======================================================== */}
        <section style={{ background: '#070f1e', borderBottom: '1px solid #162642', padding: '36px 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
              {stats.map((s, idx) => (
                <div key={idx} style={{ padding: '10px' }}>
                  <strong style={{ display: 'block', fontSize: '36px', fontWeight: '800', color: idx % 2 === 0 ? '#00c9ff' : '#9ee535', letterSpacing: '-0.03em' }}>
                    {s.number}
                  </strong>
                  <span style={{ fontSize: '12.5px', color: '#94a3b8', fontWeight: '600' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            OUR STORY & MISSION
            ======================================================== */}
        <section className="inner-white-section">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
              <div>
                <span className="section-eyebrow">OUR ORIGIN &amp; PURPOSE</span>
                <h2 className="section-title-large" style={{ marginBottom: '22px' }}>
                  Building thoughtful technology for <span className="accent-cyan-dark">teams</span> that{' '}
                  <span className="accent-lime-dark">matter.</span>
                </h2>
                <p style={{ fontSize: '14.5px', lineHeight: '1.75', color: '#475569', marginBottom: '16px' }}>
                  Thenam Software Solutions was founded with a straightforward belief: world-class software engineering should be accessible, transparent, and grounded in real-world results.
                </p>
                <p style={{ fontSize: '14.5px', lineHeight: '1.75', color: '#475569', marginBottom: '24px' }}>
                  Whether creating modern web storefronts starting at <strong>₹1,999*</strong> for growing merchants or deploying intelligent Tamil AI assistants and AgriTech IoT telemetry, our team treats every codebase with craftsmanship and rigorous discipline.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#1e293b' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <strong>Rooted in Chennai, India — delivering globally across 15+ countries</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#1e293b' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <strong>Full lifecycle accountability: UX Strategy, Architecture, QA &amp; DevSecOps</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#10b981' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <strong>100% intellectual property ownership transferred to client</strong>
                  </div>
                </div>
              </div>

              {/* Graphic Card */}
              <div
                style={{
                  background: '#070f1e',
                  border: '1px solid #162642',
                  borderRadius: '18px',
                  padding: '36px',
                  color: '#ffffff',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <img src="/thenam-logo.png" alt="Thenam leaf logo" width="36" height="36" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>THENAM SOFTWARE</h3>
                    <small style={{ color: '#00c9ff', fontSize: '10px', letterSpacing: '0.1em' }}>ENGINEERING EXCELLENCE</small>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#cbd5e1' }}>
                  <div style={{ background: '#0b162b', padding: '14px 16px', borderRadius: '10px', border: '1px solid #1c2e4d' }}>
                    <strong style={{ color: '#9ee535', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Our Vision
                    </strong>
                    To be the most trusted technology engineering partner for organizations that value longevity, speed, and real economic value.
                  </div>

                  <div style={{ background: '#0b162b', padding: '14px 16px', borderRadius: '10px', border: '1px solid #1c2e4d' }}>
                    <strong style={{ color: '#00c9ff', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Location &amp; Delivery
                    </strong>
                    Based in Chennai, Tamil Nadu, operating a high-efficiency remote-first engineering model across APAC, EMEA, and North America.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            FOUR CORE VALUES
            ======================================================== */}
        <section className="inner-pale-section">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto 50px' }}>
              <span className="section-eyebrow">WHAT WE STAND FOR</span>
              <h2 className="section-title-large">
                Principles that <span className="accent-cyan-dark">shape</span> every{' '}
                <span className="accent-lime-dark">commit.</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              {values.map((v, i) => {
                const Icon = v.icon
                return (
                  <div
                    key={i}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '28px',
                      boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
                    }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: v.bg, color: v.color, display: 'grid', placeItems: 'center', marginBottom: '18px' }}>
                      <Icon size={22} />
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px' }}>
                      {v.title}
                    </h3>
                    <p style={{ fontSize: '13px', lineHeight: '1.65', color: '#64748b', margin: 0 }}>
                      {v.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            STRATEGIC COLLABORATION & PARTNERSHIPS
            ======================================================== */}
        <CollaborationSection />

        <CtaBanner />
      </main>

      <Footer />
    </>
  )
}
