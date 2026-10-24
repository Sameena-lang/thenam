'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CtaBanner() {
  return (
    <section className="cta-banner-section" aria-label="Call to action">
      <div className="container cta-banner-inner">
        {/* Left Side: Eyebrow and Heading */}
        <div className="cta-copy">
          <span className="cta-eyebrow">LET&apos;S BUILD TOGETHER</span>
          <h2 className="cta-heading">
            Have <span className="cta-heading-gradient">a project</span> in mind?
          </h2>
        </div>

        {/* Center: Supporting Text */}
        <div className="cta-middle">
          <p className="cta-desc">
            Tell us what you want to build. We&apos;ll help you choose{' '}
            <br className="cta-break-desktop" />
            the right solution for your business.
          </p>
        </div>

        {/* Right Side: Decorative Curved Arrow and CTA Button */}
        <div className="cta-action-wrap">
          <svg
            className="cta-arrow-svg"
            width="38"
            height="26"
            viewBox="0 0 38 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M 2 24 C 2 12, 10 4, 26 4 L 34 5"
              stroke="#00c9ff"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <path
              d="M 28 1.5 L 35 5 L 28 9"
              stroke="#00c9ff"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Link
            href="/contact"
            className="cta-btn"
            aria-label="Tell us what you need - Go to contact page"
          >
            <span>Tell us what you need</span>
            <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
