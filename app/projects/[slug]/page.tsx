import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { PROJECTS, ALL_PROJECTS } from '@/lib/projects-data'
import { getProjectBySlug, getAllProjects } from '@/lib/db'
import './project-detail.css'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  Calendar,
  Code2,
  LayoutGrid,
  Compass,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  const all = getAllProjects(true)
  return all.map((p) => ({
    slug: p.slug,
  }))
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const project = getProjectBySlug(slug) || PROJECTS[slug]

  if (!project) {
    notFound()
  }

  // Get other active projects for "More Projects Like This"
  const allProjects = getAllProjects(false)
  const relatedProjects = allProjects.filter((p) => p.slug !== slug).slice(0, 4)

  return (
    <>
      <Header />

      <main className="p-page-wrapper" style={{ background: '#031422', minHeight: '100vh', position: 'relative', color: '#ffffff' }}>
        {/* Ambient Glows */}
        <div className="p-ambient-cyan" aria-hidden="true" />
        <div className="p-ambient-lime" aria-hidden="true" />
        <div className="p-leaf-bg-right" aria-hidden="true" />

        <div className="p-content-container" style={{ maxWidth: '1220px', margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 2 }}>
          {/* Back Navigation Link */}
          <div className="p-back-bar" style={{ padding: '30px 0 24px' }}>
            <Link
              href="/"
              className="p-back-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '13.5px', fontWeight: 600, textDecoration: 'none' }}
            >
              <ArrowLeft size={15} />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* ========================================================
              PROJECT HERO SHOWCASE (Two-column layout matching Image 2)
              ======================================================== */}
          <section
            className="p-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'center',
              marginBottom: '70px',
            }}
            aria-label={`${project.titleFirst} ${project.titleSecond} showcase`}
          >
            {/* Left Column: Metadata & Details */}
            <div className="p-hero-copy" style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                className="p-eyebrow"
                style={{
                  fontSize: '11.5px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  fontWeight: 800,
                  color: '#38bdf8',
                  marginBottom: '12px',
                  display: 'inline-block',
                }}
              >
                {project.categoryEyebrow}
              </span>

              <h1
                className="p-title"
                style={{
                  fontSize: 'clamp(36px, 4.4vw, 54px)',
                  fontWeight: 850,
                  lineHeight: 1.05,
                  letterSpacing: '-0.035em',
                  color: '#ffffff',
                  margin: '0 0 14px',
                }}
              >
                {project.titleFirst}{' '}
                <span
                  className="p-title-gradient"
                  style={{
                    background: 'linear-gradient(135deg, #00c9f2 0%, #00dfa5 60%, #a3e635 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                  }}
                >
                  {project.titleSecond}
                </span>
              </h1>

              <p
                className="p-subtitle"
                style={{
                  fontSize: '15.5px',
                  lineHeight: 1.6,
                  color: '#94a3b8',
                  margin: '0 0 28px',
                  maxWidth: '480px',
                }}
              >
                {project.subtitle}
              </p>

              {/* Specs Row: 4 items side-by-side */}
              <div
                className="p-specs-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px',
                  marginBottom: '34px',
                  padding: '4px 0',
                }}
              >
                {/* Category */}
                <div className="p-spec-col" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="p-spec-icon-box" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center' }}>
                    <ShoppingBag size={17} />
                  </div>
                  <div className="p-spec-texts" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="p-spec-label" style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '2px' }}>
                      Category
                    </span>
                    <span className="p-spec-value" style={{ fontSize: '13.5px', fontWeight: 750, color: '#ffffff' }}>
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Year */}
                <div className="p-spec-col" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="p-spec-icon-box" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center' }}>
                    <Calendar size={17} />
                  </div>
                  <div className="p-spec-texts" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="p-spec-label" style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '2px' }}>
                      Year
                    </span>
                    <span className="p-spec-value" style={{ fontSize: '13.5px', fontWeight: 750, color: '#ffffff' }}>
                      {project.year}
                    </span>
                  </div>
                </div>

                {/* Practice */}
                <div className="p-spec-col" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="p-spec-icon-box" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center' }}>
                    <Code2 size={17} />
                  </div>
                  <div className="p-spec-texts" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="p-spec-label" style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '2px' }}>
                      Practice
                    </span>
                    <span className="p-spec-value" style={{ fontSize: '13.5px', fontWeight: 750, color: '#ffffff' }}>
                      {project.practice}
                    </span>
                  </div>
                </div>

                {/* Phase */}
                <div className="p-spec-col" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="p-spec-icon-box" style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      className="p-pulse-dot"
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: '#00dfa5',
                        boxShadow: '0 0 10px #00dfa5',
                        display: 'inline-block',
                      }}
                    />
                  </div>
                  <div className="p-spec-texts" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="p-spec-label" style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '2px' }}>
                      Phase
                    </span>
                    <span className="p-spec-value" style={{ fontSize: '13.5px', fontWeight: 750, color: '#ffffff' }}>
                      {project.phase}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Call to Action Button */}
              <div className="p-btn-row" style={{ display: 'flex', alignItems: 'center' }}>
                <a
                  href={project.visitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-visit-pill-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 24px',
                    borderRadius: '9999px',
                    border: '1px solid #00c9f2',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    background: 'rgba(0, 201, 242, 0.08)',
                    textDecoration: 'none',
                    boxShadow: '0 0 16px rgba(0, 201, 242, 0.22)',
                  }}
                  aria-label={`Visit live site for ${project.titleFirst} ${project.titleSecond} at ${project.domain}`}
                >
                  <span>Visit live site</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Right Column: Glowing Browser Mockup Window matching Image 2 */}
            <div className="p-browser-col" style={{ position: 'relative' }}>
              <div
                className="p-browser-window"
                style={{
                  borderRadius: '16px',
                  background: '#07192d',
                  border: '2px solid #00c9f2',
                  boxShadow: '0 0 35px rgba(0, 201, 242, 0.42), 0 20px 55px rgba(0, 0, 0, 0.65)',
                  overflow: 'hidden',
                }}
              >
                {/* For swekas-luxe or mockups with authentic full browser frame */}
                {project.mockupImage?.includes('browser-exact') || (project.slug === 'swekas-luxe' && (!project.mockupImage || project.mockupImage === '/projects/swekas-browser-exact.png')) ? (
                  <img
                    src={project.mockupImage || '/projects/swekas-browser-exact.png'}
                    alt={`${project.titleFirst} ${project.titleSecond} live website preview at ${project.domain || project.visitUrl}`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                ) : (
                  <>
                    <div
                      className="p-browser-top-bar"
                      style={{
                        background: '#061527',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div className="p-dots-group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="p-traffic-dot p-dot-red" style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                        <span className="p-traffic-dot p-dot-yellow" style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                        <span className="p-traffic-dot p-dot-green" style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                      </div>
                      <div
                        className="p-url-pill"
                        style={{
                          flex: 1,
                          maxWidth: '300px',
                          margin: '0 auto',
                          background: 'rgba(255, 255, 255, 0.06)',
                          borderRadius: '6px',
                          padding: '4px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          fontSize: '11px',
                          color: '#94a3b8',
                          fontFamily: 'monospace',
                        }}
                      >
                        <span style={{ color: '#38bdf8' }}>🔒</span>
                        <span className="p-url-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {project.domain || project.visitUrl}
                        </span>
                      </div>
                    </div>
                    <div className="p-browser-screen-viewport" style={{ background: '#0a1d33', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
                      <img
                        src={project.mockupImage}
                        alt={`${project.titleFirst} ${project.titleSecond} showcase`}
                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* ========================================================
              RELATED PROJECTS SECTION ("More Projects Like This")
              ======================================================== */}
          <section className="p-related-section" style={{ paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} aria-label="Related projects showcase">
            <div className="p-related-header-row" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 800, color: '#38bdf8', display: 'block', marginBottom: '6px' }}>
                  RELATED PROJECTS
                </span>
                <h2
                  className="p-related-title"
                  style={{
                    fontSize: 'clamp(26px, 3.2vw, 38px)',
                    fontWeight: 850,
                    color: '#ffffff',
                    margin: '6px 0 8px',
                    letterSpacing: '-0.025em',
                  }}
                >
                  More Projects Like{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #00c9f2 0%, #00dfa5 60%, #a3e635 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'inline-block',
                    }}
                  >
                    This
                  </span>
                </h2>
                <p className="p-related-desc" style={{ fontSize: '14.5px', color: '#94a3b8', margin: 0 }}>
                  Explore other work from our e-commerce and branding portfolio.
                </p>
              </div>

              <div
                className="p-filter-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 15px',
                  borderRadius: '8px',
                  background: 'rgba(0, 201, 242, 0.1)',
                  border: '1px solid rgba(0, 201, 242, 0.3)',
                  color: '#38bdf8',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  userSelect: 'none',
                }}
              >
                <LayoutGrid size={14} />
                <span>E-Commerce</span>
              </div>
            </div>

            {/* 4 Related Project Cards Grid matching Image 2 */}
            <div
              className="p-related-cards-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
              }}
            >
              {relatedProjects.map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="p-project-card"
                  style={{
                    background: '#06192e',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.28)',
                  }}
                  aria-label={`View project details for ${p.titleFirst} ${p.titleSecond}`}
                >
                  <div
                    className="p-card-thumb-wrap"
                    style={{
                      height: '110px',
                      width: '100%',
                      overflow: 'hidden',
                      background: '#030e1a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={p.thumbnail}
                      alt={`${p.titleFirst} ${p.titleSecond} thumbnail`}
                      className="p-card-thumb-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div className="p-card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 className="p-card-heading" style={{ fontSize: '15px', fontWeight: 750, color: '#ffffff', margin: '0 0 6px' }}>
                      {p.titleFirst} {p.titleSecond}
                    </h3>
                    <p className="p-card-summary" style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>
                      {p.shortDesc}
                    </p>

                    <div
                      className="p-card-foot-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <span className="p-card-tag-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                        <Compass size={11} />
                        <span>{p.tag}</span>
                      </span>

                      <span
                        className="p-card-arrow-circle"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.06)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#38bdf8',
                        }}
                        aria-hidden="true"
                      >
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
