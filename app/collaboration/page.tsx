import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CtaBanner from '@/components/CtaBanner'
import CollaborationSection from '@/components/CollaborationSection'
import { Sparkles, ArrowRight, Handshake } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Collaboration & Partnerships | Thenam Software Solutions',
  description:
    'Collaborate with Thenam Software Solutions. Dedicated engineering pods, startup MVP co-creation, enterprise cloud & AI alliances, and academic R&D across Tamil Nadu and globally.',
}

export default function CollaborationPage() {
  return (
    <>
      <Header />

      <main>
        {/* ========================================================
            COLLABORATION HERO SECTION
            ======================================================== */}
        <section className="inner-page-hero collaboration-hero-with-bg" aria-label="Collaboration Header">
          {/* Background image layers */}
          <div className="collaboration-hero-bg-layer" aria-hidden="true">
            <div className="collaboration-hero-bg-img" />
            <div className="collaboration-hero-gradient-overlay" />
            <div className="collaboration-hero-glow" />
          </div>

          <div className="container" style={{ position: 'relative', zIndex: 5, width: '100%' }}>
            <div className="inner-hero-content">
              <span className="inner-hero-eyebrow">
                <Sparkles size={13} style={{ display: 'inline', marginRight: '6px' }} />
                PARTNERSHIPS &amp; CO-ENGINEERING
              </span>
              <h1 className="inner-hero-title">
                Co-engineering the future with <span className="accent-cyan">visionary</span>{' '}
                <span className="accent-lime">partners.</span>
              </h1>
              <p className="inner-hero-desc">
                From early-stage founders building 0-to-1 MVPs to global scale-ups augmenting dedicated tech pods and academic research labs, we partner across transparent, high-agility collaboration frameworks.
              </p>
              <div className="hero-btn-row">
                <a href="#collaboration" className="quote-btn">
                  <span>Explore Collaboration Models</span>
                  <ArrowRight size={15} />
                </a>
                <Link href="/contact?topic=collaboration" className="explore-btn">
                  <span>Start a Conversation</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            COLLABORATION MODELS, CLIENT SHOWCASE & WORKFLOW
            ======================================================== */}
        <CollaborationSection />

        <CtaBanner />
      </main>

      <Footer />
    </>
  )
}
