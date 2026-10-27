'use client'

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CtaBanner from '@/components/CtaBanner'
import CreativePortfolioCarousel from '@/components/CreativePortfolioCarousel'
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
            ABOUT HERO SECTION (WITH MOVING 3D CAROUSEL IN BACKGROUND)
            ======================================================== */}
        <section
          className="inner-page-hero about-hero-with-bg"
          aria-label="About Us Header"
          style={{ position: 'relative', overflow: 'hidden', minHeight: '490px', display: 'flex', alignItems: 'center' }}
        >
          <div className="hero-glow-cyan" aria-hidden="true" />
          
          {/* Moving 3D coverflow carousel in the background */}
          <CreativePortfolioCarousel variant="hero-bg" autoPlay={true} />

          <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
            <div className="inner-hero-content" style={{ maxWidth: '620px' }}>
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
            OUR CREATIVE PORTFOLIO (MOVING SPOTLIGHT CAROUSEL)
            ======================================================== */}
        <CreativePortfolioCarousel variant="section" autoPlay={true} />

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
            LEADERSHIP & CREATIVE ARCHITECTS (FOUNDING MINDS)
            ======================================================== */}
        <section className="inner-white-section" id="leadership" style={{ borderTop: '1px solid #e2e8f0', padding: '80px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 52px' }}>
              <span className="section-eyebrow">LEADERSHIP &amp; VISION</span>
              <h2 className="section-title-large">
                The minds <span className="accent-cyan-dark">architecting</span> our{' '}
                <span className="accent-lime-dark">technology.</span>
              </h2>
              <p className="section-desc-light" style={{ margin: '14px auto 0', fontSize: '15px', lineHeight: '1.65' }}>
                Meet the engineering leaders and product designers turning ambitious technical roadmaps into scalable, high-converting digital realities.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', maxWidth: '960px', margin: '0 auto' }}>
              {/* Leader 1: Tharun Varshan U */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(6, 20, 38, 0.05)',
                  transition: 'transform 0.28s ease, box-shadow 0.28s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '380px', background: '#061426', overflow: 'hidden' }}>
                  <Image
                    src="/about-portfolio/team-curly-jacket.jpg"
                    alt="Tharun Varshan U - Founder & CEO"
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
                    priority
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 65%, rgba(6, 20, 38, 0.85) 100%)',
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: 'rgba(0, 201, 242, 0.2)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(0, 201, 242, 0.5)',
                        color: '#38bdf8',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                      }}
                    >
                      Founder &amp; CEO
                    </span>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>
                      Tharun Varshan U
                    </h3>
                  </div>
                </div>

                <div style={{ padding: '24px 24px 28px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0284c7', display: 'block', marginBottom: '8px' }}>
                      Systems Architecture &amp; Engineering Lead
                    </span>
                    <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.7', margin: '0 0 20px' }}>
                      Leading Thenam&apos;s architectural vision and engineering squads. Dedicated to crafting ultra-fast web platforms, cloud automation pipelines, and high-performance applications designed to scale effortlessly.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', background: '#f0f9ff', color: '#0369a1', padding: '4px 10px', borderRadius: '6px' }}>
                      Next.js 16
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', background: '#f0fdf4', color: '#15803d', padding: '4px 10px', borderRadius: '6px' }}>
                      TypeScript
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', background: '#faf5ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '6px' }}>
                      AI Architecture
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', background: '#f8fafc', color: '#475569', padding: '4px 10px', borderRadius: '6px' }}>
                      Cloud Infrastructure
                    </span>
                  </div>
                </div>
              </div>

              {/* Leader 2: Yuvan Dharshan U */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(6, 20, 38, 0.05)',
                  transition: 'transform 0.28s ease, box-shadow 0.28s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '380px', background: '#061426', overflow: 'hidden' }}>
                  <Image
                    src="/about-portfolio/team-glasses-chair.jpg"
                    alt="Yuvan Dharshan U - Co-Founder"
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
                    priority
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 65%, rgba(6, 20, 38, 0.85) 100%)',
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: 'rgba(130, 230, 46, 0.2)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(130, 230, 46, 0.5)',
                        color: '#82e62e',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                      }}
                    >
                      Co-Founder
                    </span>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>
                      Yuvan Dharshan U
                    </h3>
                  </div>
                </div>

                <div style={{ padding: '24px 24px 28px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#059669', display: 'block', marginBottom: '8px' }}>
                      Product Design &amp; Creative Technology
                    </span>
                    <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.7', margin: '0 0 20px' }}>
                      Directing product design systems, user experience journeys, and full-stack digital transformations. Blending aesthetic precision with technical rigor to help startups and enterprises establish modern digital dominance.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', background: '#f0fdf4', color: '#15803d', padding: '4px 10px', borderRadius: '6px' }}>
                      Product Strategy
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', background: '#f0f9ff', color: '#0369a1', padding: '4px 10px', borderRadius: '6px' }}>
                      UI/UX Design Systems
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', background: '#faf5ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '6px' }}>
                      Full-Stack Dev
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', background: '#f8fafc', color: '#475569', padding: '4px 10px', borderRadius: '6px' }}>
                      Figma &amp; Prototyping
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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

        <CtaBanner />
      </main>

      <Footer />
    </>
  )
}
