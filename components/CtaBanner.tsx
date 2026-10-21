'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CtaBanner() {
  return (
    <section className="cta-banner-section" aria-label="Call to action">
      <div className="container cta-banner-inner">
        <div className="cta-copy">
          <span className="cta-eyebrow">LET&apos;S BUILD TOGETHER</span>
          <h2 className="cta-heading">
            Have <span className="cta-accent-mint">a project</span> in mind?
          </h2>
        </div>

        <div className="cta-middle">
          <p className="cta-desc">
            Tell us what you want to build. We&apos;ll help you choose the right solution for your business.
          </p>
        </div>

        <div className="cta-action-wrap">
          {/* Decorative curved pointer SVG */}
          <svg
            className="cta-arrow-svg"
            width="46"
            height="32"
            viewBox="0 0 46 32"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 4C14 4 34 8 40 26M40 26L34 22M40 26L44 19"
              stroke="#00c9ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Link href="/contact" className="quote-btn cta-btn">
            <span>Tell us what you need</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
