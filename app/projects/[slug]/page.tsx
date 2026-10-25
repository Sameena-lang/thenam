import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { PROJECTS, ALL_PROJECTS } from '@/lib/projects-data'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Lock,
  ShoppingBag,
  Calendar,
  Code2,
  LayoutGrid,
  Sparkles,
  Compass,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return ALL_PROJECTS.map((p) => ({
    slug: p.slug,
  }))
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const project = PROJECTS[slug]

  if (!project) {
    notFound()
  }

  // Get other projects for "More Projects Like This"
  const relatedProjects = ALL_PROJECTS.filter((p) => p.slug !== slug).slice(0, 4)

  return (
    <>
      <Header />

      <main className="project-detail-main">
        {/* Ambient Dark Navy & Leaf Lighting */}
        <div className="project-bg-glow-cyan" aria-hidden="true" />
        <div className="project-bg-glow-lime" aria-hidden="true" />

        <div className="container project-detail-container">
          {/* Back Navigation Link */}
          <div className="project-back-wrap">
            <Link href="/" className="project-back-btn">
              <ArrowLeft size={14} />
              <span>Back to Projects</span>
            </Link>
          </div>

          {/* ========================================================
              PROJECT HERO SHOWCASE (Two-column layout matching Image 2)
              ======================================================== */}
          <section className="project-hero-grid" aria-label={`${project.titleFirst} ${project.titleSecond} showcase`}>
            {/* Left Column: Metadata & Details */}
            <div className="project-hero-copy">
              <span className="project-category-eyebrow">
                {project.categoryEyebrow}
              </span>

              <h1 className="project-page-title">
                {project.titleFirst}{' '}
                <span className="accent-cyan-lime">{project.titleSecond}</span>
              </h1>

              <p className="project-page-subtitle">{project.subtitle}</p>

              {/* Specs Grid (Category, Year, Practice, Phase) */}
              <div className="project-specs-grid">
                <div className="project-spec-item">
                  <div className="spec-icon-wrap">
                    <ShoppingBag size={17} className="spec-icon" />
                  </div>
                  <div className="spec-meta">
                    <span className="spec-label">Category</span>
                    <span className="spec-val">{project.category}</span>
                  </div>
                </div>

                <div className="project-spec-item">
                  <div className="spec-icon-wrap">
                    <Calendar size={17} className="spec-icon" />
                  </div>
                  <div className="spec-meta">
                    <span className="spec-label">Year</span>
                    <span className="spec-val">{project.year}</span>
                  </div>
                </div>

                <div className="project-spec-item">
                  <div className="spec-icon-wrap">
                    <Code2 size={17} className="spec-icon" />
                  </div>
                  <div className="spec-meta">
                    <span className="spec-label">Practice</span>
                    <span className="spec-val">{project.practice}</span>
                  </div>
                </div>

                <div className="project-spec-item">
                  <div className="spec-icon-wrap">
                    <span className="spec-live-dot" />
                  </div>
                  <div className="spec-meta">
                    <span className="spec-label">Phase</span>
                    <span className="spec-val">{project.phase}</span>
                  </div>
                </div>
              </div>

              {/* Primary Call to Action Button */}
              <div className="project-actions-row">
                <a
                  href={project.visitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-visit-btn"
                  aria-label={`Visit live site for ${project.titleFirst} ${project.titleSecond} at ${project.domain}`}
                >
                  <span>Visit live site</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Right Column: Glowing Browser Mockup Window */}
            <div className="project-hero-mockup-col">
              <div className="browser-mockup-frame">
                {/* Browser Top Chrome */}
                <div className="browser-chrome-bar">
                  <div className="browser-dots-row">
                    <span className="b-dot b-red" />
                    <span className="b-dot b-yellow" />
                    <span className="b-dot b-green" />
                  </div>
                  <div className="browser-url-pill">
                    <Lock size={10} className="b-lock-icon" />
                    <span className="b-domain-text">{project.domain}</span>
                  </div>
                </div>

                {/* Inner Website Content */}
                <div className="browser-content-viewport">
                  <img
                    src={project.mockupImage}
                    alt={`${project.titleFirst} ${project.titleSecond} storefront showcase`}
                    className="browser-content-image"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================
              RELATED PROJECTS SECTION ("More Projects Like This")
              ======================================================== */}
          <section className="related-projects-section" aria-label="Related projects showcase">
            <div className="related-head-split">
              <div>
                <span className="section-eyebrow">RELATED PROJECTS</span>
                <h2 className="related-section-title">
                  More Projects Like <span className="accent-cyan-lime">This</span>
                </h2>
                <p className="related-section-desc">
                  Explore other work from our e-commerce, custom software, and branding portfolio.
                </p>
              </div>

              <div className="related-filter-badge">
                <LayoutGrid size={13} />
                <span>{project.tag}</span>
              </div>
            </div>

            {/* 4 Related Project Cards Grid */}
            <div className="related-projects-grid-4">
              {relatedProjects.map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="related-project-card"
                  aria-label={`View project details for ${p.titleFirst} ${p.titleSecond}`}
                >
                  <div className="related-card-preview-wrap">
                    <img
                      src={p.thumbnail}
                      alt={`${p.titleFirst} ${p.titleSecond} thumbnail`}
                      className="related-card-img"
                    />
                  </div>

                  <div className="related-card-body">
                    <h3 className="related-card-title">
                      {p.titleFirst} {p.titleSecond}
                    </h3>
                    <p className="related-card-desc">{p.shortDesc}</p>

                    <div className="related-card-footer">
                      <span className="related-tag-item">
                        <Compass size={11} />
                        <span>{p.tag}</span>
                      </span>

                      <span className="related-circle-arrow" aria-hidden="true">
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
