'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CtaBanner from '@/components/CtaBanner'
import CommunityFeeds from '@/components/CommunityFeeds'
import {
  ArrowRight,
  Headphones,
  Cpu,
  Users,
  BarChart3,
  Monitor,
  Code2,
  Sparkles,
  Cog,
  ShoppingCart,
  GraduationCap,
  Heart,
  Factory,
  Building2,
  MoreHorizontal,
  Bot,
  Activity,
  Layers,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Film,
  Zap,
  RotateCw,
  Search,
  Bell,
  User,
} from 'lucide-react'

interface MarqueeLogo {
  id: string
  name: string
  src: string
  width: number
  height: number
  className: string
}

const CLIENT_MARQUEE_LOGOS: MarqueeLogo[] = [
  {
    id: 'magizh-mahal',
    name: 'Magizh Mahal',
    src: '/marquee-logos/magizh-mahal.png',
    width: 34,
    height: 34,
    className: 'marquee-logo-magizh',
  },
  {
    id: 'pink-fish',
    name: 'Pink Fish',
    src: '/marquee-logos/pink-fish.png',
    width: 48,
    height: 34,
    className: 'marquee-logo-pinkfish',
  },
  {
    id: 'swekas-luxe',
    name: 'Swekas Luxe',
    src: '/marquee-logos/swekas-luxe.png',
    width: 34,
    height: 34,
    className: 'marquee-logo-swekas',
  },
  {
    id: 'chennai-tales',
    name: 'Chennai Tales',
    src: '/marquee-logos/chennai-tales.png',
    width: 76,
    height: 34,
    className: 'marquee-logo-chennai',
  },
]

// Repeat 4x per track group to create a seamless continuous scrolling ribbon
const MARQUEE_ITEMS = [
  ...CLIENT_MARQUEE_LOGOS,
  ...CLIENT_MARQUEE_LOGOS,
  ...CLIENT_MARQUEE_LOGOS,
  ...CLIENT_MARQUEE_LOGOS,
]

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)

  const toggleCardFlip = (index: number) => {
    setFlippedIndex((prev) => (prev === index ? null : index))
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }
  return (
    <>
      <Header />

      <main id="main-content">
        {/* ========================================================
            HERO SECTION (DARK NAVY WITH LAPTOP & FLOATING CARDS)
            ======================================================== */}
        <section className="hero-section" aria-label="Hero Introduction">
          <div className="hero-glow-cyan" aria-hidden="true" />
          <div className="hero-glow-lime" aria-hidden="true" />
          <div className="hero-plant-left" aria-hidden="true" />
          <div className="hero-plant-right" aria-hidden="true" />

          <div className="container hero-grid">
            {/* Left Copy */}
            <div className="hero-copy-col">
              <span className="hero-eyebrow">
                <Sparkles size={13} className="accent-cyan" />
                DIGITAL SOLUTIONS FOR A SMARTER TOMORROW
              </span>

              <h1 className="hero-title">
                Technology that moves<br />
                your <span className="accent-cyan">business</span>{' '}
                <span className="accent-lime">forward.</span>
              </h1>

              <p className="hero-desc">
                We build websites, AI-powered applications, and custom software that solve real business problems.
              </p>

              <div className="hero-btn-row">
                <Link href="/services" className="explore-btn">
                  <span>Explore Our Services</span>
                  <ArrowRight size={15} />
                </Link>

                <Link href="/contact" className="quote-btn hero-quote-btn">
                  <span>Get a Free Quote</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="price-callout">
                <span>Websites starting from</span>
                <span className="price-highlight">₹1,999*</span>
              </div>

              <div className="hero-badges-row">
                <div className="badge-item">
                  <Headphones size={15} />
                  <span>Reliable Support</span>
                </div>
                <div className="badge-item">
                  <Cpu size={15} />
                  <span>Modern Technology</span>
                </div>
                <div className="badge-item">
                  <Users size={15} />
                  <span>Client-Focused</span>
                </div>
                <div className="badge-item">
                  <BarChart3 size={15} />
                  <span>Scalable Solutions</span>
                </div>
              </div>
            </div>

            {/* Right Spacer Column (Allows background laptop & phone to shine cleanly) */}
            <div className="hero-visual-spacer" aria-hidden="true" />
          </div>
        </section>

        {/* ========================================================
            CLIENT PORTFOLIO MARQUEE (Continuous horizontal logos band)
            ======================================================== */}
        <section className="marquee-strip-section" aria-label="Client portfolio showcase">
          <div className="marquee-track">
            <div className="marquee-group">
              {MARQUEE_ITEMS.map((item, i) => (
                <span key={`group-1-${i}`} className="marquee-item">
                  <span className="marquee-dot" aria-hidden="true" />
                  <div className={`marquee-logo-frame ${item.className}`} title={item.name}>
                    <Image
                      src={item.src}
                      alt={item.name}
                      width={item.width}
                      height={item.height}
                      className="marquee-logo-image"
                      priority={i < 4}
                    />
                  </div>
                </span>
              ))}
            </div>
            <div className="marquee-group" aria-hidden="true">
              {MARQUEE_ITEMS.map((item, i) => (
                <span key={`group-2-${i}`} className="marquee-item">
                  <span className="marquee-dot" aria-hidden="true" />
                  <div className={`marquee-logo-frame ${item.className}`} title={item.name}>
                    <Image
                      src={item.src}
                      alt={item.name}
                      width={item.width}
                      height={item.height}
                      className="marquee-logo-image"
                    />
                  </div>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            SERVICES SECTION ("What We Do" - 3D FLIP CARDS)
            ======================================================== */}
        <section className="services-section" id="services">
          <div className="container">
            <div className="section-head-split">
              <div>
                <span className="section-eyebrow">OUR SERVICES</span>
                <h2 className="section-title-large">
                  What <span className="accent-gradient-text">We Do</span>
                </h2>
              </div>
              <div className="section-sub-wrap">
                <p className="section-desc-light">
                  End-to-end technology solutions to help businesses build, automate and grow in the digital world.
                </p>
                <Link href="/services" className="view-all-link">
                  <span>View All Services</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div className="services-grid-4" onMouseLeave={() => setFlippedIndex(null)}>
              {/* Card 1: Web Development */}
              <article
                className={`service-flip-card ${flippedIndex === 0 ? 'is-flipped' : ''}`}
                onClick={() => toggleCardFlip(0)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCardFlip(0)
                  }
                }}
                tabIndex={0}
                role="region"
                aria-label="Web Development service card - hover or tap to flip for details"
              >
                <div className="service-flip-inner">
                  {/* Front side - default view */}
                  <div className="service-flip-front">
                    <div className="service-card-media-wrap">
                      <img
                        src="/services/web-development.jpg"
                        alt="Web Development - Responsive Desktop, Tablet, Mobile"
                        className="service-card-img"
                        loading="lazy"
                      />
                      <div className="service-icon-floating cyan">
                        <Monitor size={18} />
                      </div>
                    </div>
                    <h3 className="service-card-title">Web Development</h3>
                  </div>

                  {/* Back side - on hover / flip */}
                  <div className="service-flip-back">
                    <div className="service-back-top">
                      <div className="service-back-header">
                        <div className="service-icon-wrap cyan mini">
                          <Monitor size={18} />
                        </div>
                        <h3 className="service-back-title">Web Development</h3>
                      </div>
                      <p className="service-back-desc">
                        Modern websites and web applications for businesses, startups and brands. Responsive, fast and SEO-ready.
                      </p>
                    </div>
                    <div className="service-back-foot">
                      <span className="service-foot-price">From ₹1,999*</span>
                      <Link
                        href="/services#web-development"
                        className="service-circle-btn"
                        aria-label="Learn about Web Development"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 2: AI & Machine Learning */}
              <article
                className={`service-flip-card ${flippedIndex === 1 ? 'is-flipped' : ''}`}
                onClick={() => toggleCardFlip(1)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCardFlip(1)
                  }
                }}
                tabIndex={0}
                role="region"
                aria-label="AI & Machine Learning service card - hover or tap to flip for details"
              >
                <div className="service-flip-inner">
                  {/* Front side - default view */}
                  <div className="service-flip-front">
                    <div className="service-card-media-wrap">
                      <img
                        src="/services/ai-machine-learning.jpg"
                        alt="AI & Machine Learning - Intelligent Automation & Models"
                        className="service-card-img"
                        loading="lazy"
                      />
                      <div className="service-icon-floating green">
                        <Cpu size={18} />
                      </div>
                    </div>
                    <h3 className="service-card-title">AI & Machine Learning</h3>
                  </div>

                  {/* Back side - on hover / flip */}
                  <div className="service-flip-back">
                    <div className="service-back-top">
                      <div className="service-back-header">
                        <div className="service-icon-wrap green mini">
                          <Cpu size={18} />
                        </div>
                        <h3 className="service-back-title">AI & Machine Learning</h3>
                      </div>
                      <p className="service-back-desc">
                        AI-powered applications, chatbots, computer vision and intelligent automated workflows.
                      </p>
                    </div>
                    <div className="service-back-foot">
                      <span className="service-foot-link">Get a Quote</span>
                      <Link
                        href="/contact"
                        className="service-circle-btn"
                        aria-label="Get a quote for AI & Machine Learning"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 3: Custom Software */}
              <article
                className={`service-flip-card ${flippedIndex === 2 ? 'is-flipped' : ''}`}
                onClick={() => toggleCardFlip(2)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCardFlip(2)
                  }
                }}
                tabIndex={0}
                role="region"
                aria-label="Custom Software service card - hover or tap to flip for details"
              >
                <div className="service-flip-inner">
                  {/* Front side - default view */}
                  <div className="service-flip-front">
                    <div className="service-card-media-wrap">
                      <img
                        src="/services/custom-software.jpg"
                        alt="Custom Software Development - Dashboards & Scalable Systems"
                        className="service-card-img"
                        loading="lazy"
                      />
                      <div className="service-icon-floating blue">
                        <Code2 size={18} />
                      </div>
                    </div>
                    <h3 className="service-card-title">Custom Software</h3>
                  </div>

                  {/* Back side - on hover / flip */}
                  <div className="service-flip-back">
                    <div className="service-back-top">
                      <div className="service-back-header">
                        <div className="service-icon-wrap blue mini">
                          <Code2 size={18} />
                        </div>
                        <h3 className="service-back-title">Custom Software</h3>
                      </div>
                      <p className="service-back-desc">
                        Tailored software solutions built to fit your unique business operations and scale securely.
                      </p>
                    </div>
                    <div className="service-back-foot">
                      <span className="service-foot-link">Get a Quote</span>
                      <Link
                        href="/contact"
                        className="service-circle-btn"
                        aria-label="Get a quote for Custom Software"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 4: Business Automation */}
              <article
                className={`service-flip-card ${flippedIndex === 3 ? 'is-flipped' : ''}`}
                onClick={() => toggleCardFlip(3)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCardFlip(3)
                  }
                }}
                tabIndex={0}
                role="region"
                aria-label="Business Automation service card - hover or tap to flip for details"
              >
                <div className="service-flip-inner">
                  {/* Front side - default view */}
                  <div className="service-flip-front">
                    <div className="service-card-media-wrap">
                      <img
                        src="/services/business-automation.jpg"
                        alt="Business Automation - Streamline Processes & Workflows"
                        className="service-card-img"
                        loading="lazy"
                      />
                      <div className="service-icon-floating lime">
                        <Cog size={18} />
                      </div>
                    </div>
                    <h3 className="service-card-title">Business Automation</h3>
                  </div>

                  {/* Back side - on hover / flip */}
                  <div className="service-flip-back">
                    <div className="service-back-top">
                      <div className="service-back-header">
                        <div className="service-icon-wrap lime mini">
                          <Cog size={18} />
                        </div>
                        <h3 className="service-back-title">Business Automation</h3>
                      </div>
                      <p className="service-back-desc">
                        Automate repetitive tasks, sync business software and streamline manual bottlenecks.
                      </p>
                    </div>
                    <div className="service-back-foot">
                      <span className="service-foot-link">Get a Quote</span>
                      <Link
                        href="/contact"
                        className="service-circle-btn"
                        aria-label="Get a quote for Business Automation"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ========================================================
            AUDIENCE STRIP BANNER ("Built for startups · SMEs")
            ======================================================== */}
        <section className="audience-strip" aria-label="Target industries and businesses">
          <div className="container audience-strip-inner">
            <span className="audience-label">
              Built for startups &nbsp;•&nbsp; SMEs &nbsp;•&nbsp; Growing teams
            </span>

            <div className="industry-pills-row">
              <span className="industry-pill"><ShoppingCart size={14} /> Retail & E-commerce</span>
              <span className="industry-pill"><GraduationCap size={14} /> Education</span>
              <span className="industry-pill"><Heart size={14} /> Healthcare</span>
              <span className="industry-pill"><Factory size={14} /> Manufacturing</span>
              <span className="industry-pill"><Building2 size={14} /> Real Estate</span>
              <span className="industry-pill"><MoreHorizontal size={14} /> And More</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            FEATURED WORK ("Turning ideas into real solutions.")
            ======================================================== */}
        <section className="featured-work-section" id="products">
          <div className="container featured-work-grid">
            {/* Left Header */}
            <div className="featured-work-copy">
              <span className="section-eyebrow">FEATURED WORK</span>
              <h2 className="section-title-large">
                Turning ideas into<br />
                <span className="accent-cyan-dark">real</span>{' '}
                <span className="accent-lime-dark">solutions.</span>
              </h2>
              <p className="section-desc-light" style={{ marginTop: '16px' }}>
                Here are some of our recent projects and engineered products helping clients grow.
              </p>
              <Link href="/products" className="view-all-link" style={{ marginTop: '8px' }}>
                <span>Explore our work</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right Projects 2x2 Grid with 3D Flip */}
            <div className="featured-work-grid-2x2">
              {/* Project 1: AgriSmart */}
              <div
                className={`project-showcase-card-wrapper ${flippedIndex === 0 ? 'is-flipped' : ''}`}
                tabIndex={0}
                role="region"
                aria-label="AgriSmart — AI-Powered AgriTech Platform. Hover or click to flip for details."
                aria-expanded={flippedIndex === 0}
                onClick={() => toggleCardFlip(0)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCardFlip(0)
                  }
                }}
              >
                <div className="project-card-flipper">
                  {/* FRONT */}
                  <div className="project-card-front">
                    <div className="project-art-preview art-agrismart">
                      <div className="project-mock-box">
                        <div className="mock-top-bar" style={{ color: '#166534' }}>
                          <span>AgriSmart Drone &amp; IoT</span>
                          <span className="mock-live-badge">● Active</span>
                        </div>
                        <div className="mock-content-mini">
                          <div className="mock-avatar-circle" style={{ background: '#dcfce7', color: '#15803d' }}>
                            🌾
                          </div>
                          <div className="mock-lines-group">
                            <div className="mock-line" style={{ background: '#86efac', width: '85%' }} />
                            <div className="mock-line short" style={{ background: '#bbf7d0', width: '55%' }} />
                          </div>
                        </div>
                        <div className="mock-stat-pill" style={{ background: 'rgba(22, 101, 52, 0.08)', color: '#166534' }}>
                          <span>Telemetry: 99.2% Accuracy</span>
                          <span>Sensor Grid Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="project-meta-bottom">
                      <div className="project-meta-header">
                        <h3 className="project-title">AgriSmart</h3>
                        <span className="project-flip-hint">
                          <RotateCw size={11} /> 3D Flip
                        </span>
                      </div>
                      <p className="project-desc-mini">AI-Powered AgriTech Platform</p>
                      <div className="project-tag-row">
                        <span className="tag-pill">Web App</span>
                        <span className="tag-pill">AI/ML</span>
                        <span className="tag-pill">IoT</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="project-card-back">
                    <div className="card-back-header">
                      <span className="card-back-badge">AGRITECH &amp; AI</span>
                      <h3 className="card-back-title">AgriSmart</h3>
                      <p className="card-back-subtitle">AI-Powered AgriTech Platform</p>
                    </div>
                    <p className="card-back-desc">
                      Real-time crop anomaly detection, precision drone analytics, and automated soil sensor diagnostics engineered to maximize agricultural yields.
                    </p>
                    <div className="card-back-detail-box">
                      <span className="detail-box-label">KEY IMPACT &amp; FEATURES</span>
                      <p className="detail-box-text">Multispectral NDVI imaging, predictive weather modeling, and offline-first edge IoT telemetry saving up to 35% water consumption.</p>
                    </div>
                    <div className="card-back-footer">
                      <div className="project-tag-row">
                        <span className="tag-pill">Python / PyTorch</span>
                        <span className="tag-pill">FastAPI</span>
                        <span className="tag-pill">React</span>
                        <span className="tag-pill">IoT Edge</span>
                      </div>
                      <Link href="/products" className="card-back-cta" onClick={(e) => e.stopPropagation()}>
                        <span>Explore case study</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project 2: ZaraBot */}
              <div
                className={`project-showcase-card-wrapper ${flippedIndex === 1 ? 'is-flipped' : ''}`}
                tabIndex={0}
                role="region"
                aria-label="ZaraBot — Tamil-first AI Assistant. Hover or click to flip for details."
                aria-expanded={flippedIndex === 1}
                onClick={() => toggleCardFlip(1)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCardFlip(1)
                  }
                }}
              >
                <div className="project-card-flipper">
                  {/* FRONT */}
                  <div className="project-card-front">
                    <div className="project-art-preview art-zarabot">
                      <div className="project-mock-box">
                        <div className="mock-top-bar" style={{ color: '#38bdf8' }}>
                          <span>ZaraBot AI Voice</span>
                          <span className="mock-live-badge">⚡ Tamil-first</span>
                        </div>
                        <div className="mock-content-mini">
                          <div className="mock-avatar-circle" style={{ background: '#0c2340', color: '#38bdf8' }}>
                            🤖
                          </div>
                          <div className="mock-lines-group">
                            <div className="mock-line" style={{ background: '#38bdf8', width: '80%' }} />
                            <div className="mock-line short" style={{ background: '#0284c7', width: '60%' }} />
                          </div>
                        </div>
                        <div className="mock-stat-pill" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                          <span>Latency: &lt;280ms Voice</span>
                          <span>Bilingual NLP</span>
                        </div>
                      </div>
                    </div>
                    <div className="project-meta-bottom">
                      <div className="project-meta-header">
                        <h3 className="project-title">ZaraBot</h3>
                        <span className="project-flip-hint">
                          <RotateCw size={11} /> 3D Flip
                        </span>
                      </div>
                      <p className="project-desc-mini">Tamil-first AI Assistant</p>
                      <div className="project-tag-row">
                        <span className="tag-pill">AI</span>
                        <span className="tag-pill">Chatbot</span>
                        <span className="tag-pill">Voice</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="project-card-back">
                    <div className="card-back-header">
                      <span className="card-back-badge">CONVERSATIONAL AI</span>
                      <h3 className="card-back-title">ZaraBot</h3>
                      <p className="card-back-subtitle">Tamil-first AI Assistant</p>
                    </div>
                    <p className="card-back-desc">
                      Next-generation conversational assistant with context-aware Tamil &amp; English speech recognition and automated customer self-service workflows.
                    </p>
                    <div className="card-back-detail-box">
                      <span className="detail-box-label">KEY IMPACT &amp; FEATURES</span>
                      <p className="detail-box-text">Fine-tuned Tamil acoustic models, instant speech-to-text, and omni-channel WhatsApp &amp; web voice integration for enterprises.</p>
                    </div>
                    <div className="card-back-footer">
                      <div className="project-tag-row">
                        <span className="tag-pill">Whisper ASR</span>
                        <span className="tag-pill">Llama 3</span>
                        <span className="tag-pill">WebSockets</span>
                        <span className="tag-pill">Next.js</span>
                      </div>
                      <Link href="/products" className="card-back-cta" onClick={(e) => e.stopPropagation()}>
                        <span>Explore case study</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project 3: E-Commerce Platform */}
              <div
                className={`project-showcase-card-wrapper ${flippedIndex === 2 ? 'is-flipped' : ''}`}
                tabIndex={0}
                role="region"
                aria-label="E-Commerce Platform — Business Website & Storefront. Hover or click to flip for details."
                aria-expanded={flippedIndex === 2}
                onClick={() => toggleCardFlip(2)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCardFlip(2)
                  }
                }}
              >
                <div className="project-card-flipper">
                  {/* FRONT */}
                  <div className="project-card-front">
                    <div className="project-art-preview art-ecommerce">
                      <div className="project-mock-box">
                        <div className="mock-top-bar" style={{ color: '#92400e' }}>
                          <span>Fresh Natural Products</span>
                          <span className="mock-live-badge">🛒 Cart (3)</span>
                        </div>
                        <div className="mock-content-mini">
                          <div className="mock-avatar-circle" style={{ background: '#fef3c7', color: '#b45309' }}>
                            🛍️
                          </div>
                          <div className="mock-lines-group">
                            <div className="mock-line" style={{ background: '#fde68a', width: '88%' }} />
                            <div className="mock-line short" style={{ background: '#fcd34d', width: '62%' }} />
                          </div>
                        </div>
                        <div className="mock-stat-pill" style={{ background: 'rgba(180, 83, 9, 0.08)', color: '#92400e' }}>
                          <span>Speed: 0.4s Fast Checkout</span>
                          <span>Multi-Currency</span>
                        </div>
                      </div>
                    </div>
                    <div className="project-meta-bottom">
                      <div className="project-meta-header">
                        <h3 className="project-title">E-Commerce Platform</h3>
                        <span className="project-flip-hint">
                          <RotateCw size={11} /> 3D Flip
                        </span>
                      </div>
                      <p className="project-desc-mini">Business Website &amp; Storefront</p>
                      <div className="project-tag-row">
                        <span className="tag-pill">Web Dev</span>
                        <span className="tag-pill">E-commerce</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="project-card-back">
                    <div className="card-back-header">
                      <span className="card-back-badge">DIGITAL COMMERCE</span>
                      <h3 className="card-back-title">E-Commerce Platform</h3>
                      <p className="card-back-subtitle">Business Website &amp; Storefront</p>
                    </div>
                    <p className="card-back-desc">
                      Modern headless commerce storefront built for lightning-fast catalog search, frictionless checkout flows, and synchronized inventory across channels.
                    </p>
                    <div className="card-back-detail-box">
                      <span className="detail-box-label">KEY IMPACT &amp; FEATURES</span>
                      <p className="detail-box-text">Instant search indexing, integrated Stripe/Razorpay gateways, and automated delivery tracking that drove +42% online orders.</p>
                    </div>
                    <div className="card-back-footer">
                      <div className="project-tag-row">
                        <span className="tag-pill">Next.js 14</span>
                        <span className="tag-pill">Tailwind CSS</span>
                        <span className="tag-pill">Stripe API</span>
                        <span className="tag-pill">PostgreSQL</span>
                      </div>
                      <Link href="/products" className="card-back-cta" onClick={(e) => e.stopPropagation()}>
                        <span>Explore case study</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project 4: Business Management System */}
              <div
                className={`project-showcase-card-wrapper ${flippedIndex === 3 ? 'is-flipped' : ''}`}
                tabIndex={0}
                role="region"
                aria-label="Business Management System — Custom Operations Software. Hover or click to flip for details."
                aria-expanded={flippedIndex === 3}
                onClick={() => toggleCardFlip(3)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCardFlip(3)
                  }
                }}
              >
                <div className="project-card-flipper">
                  {/* FRONT */}
                  <div className="project-card-front">
                    <div className="project-art-preview art-bizmgmt">
                      <div className="project-mock-box">
                        <div className="mock-top-bar" style={{ color: '#0369a1' }}>
                          <span>Enterprise CRM &amp; ERP</span>
                          <span className="mock-live-badge">📊 Sync</span>
                        </div>
                        <div className="mock-content-mini">
                          <div className="mock-avatar-circle" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                            📈
                          </div>
                          <div className="mock-lines-group">
                            <div className="mock-line" style={{ background: '#bae6fd', width: '85%' }} />
                            <div className="mock-line short" style={{ background: '#7dd3fc', width: '50%' }} />
                          </div>
                        </div>
                        <div className="mock-stat-pill" style={{ background: 'rgba(2, 132, 199, 0.08)', color: '#0369a1' }}>
                          <span>Efficiency: +60% Ops Speed</span>
                          <span>Role-Based Access</span>
                        </div>
                      </div>
                    </div>
                    <div className="project-meta-bottom">
                      <div className="project-meta-header">
                        <h3 className="project-title">Business Management System</h3>
                        <span className="project-flip-hint">
                          <RotateCw size={11} /> 3D Flip
                        </span>
                      </div>
                      <p className="project-desc-mini">Custom Operations Software</p>
                      <div className="project-tag-row">
                        <span className="tag-pill">Web App</span>
                        <span className="tag-pill">Dashboard</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="project-card-back">
                    <div className="card-back-header">
                      <span className="card-back-badge">OPERATIONS &amp; ERP</span>
                      <h3 className="card-back-title">Business Management System</h3>
                      <p className="card-back-subtitle">Custom Operations Software</p>
                    </div>
                    <p className="card-back-desc">
                      Comprehensive enterprise operations dashboard uniting lead tracking, automated GST billing, employee scheduling, and real-time financial reporting.
                    </p>
                    <div className="card-back-detail-box">
                      <span className="detail-box-label">KEY IMPACT &amp; FEATURES</span>
                      <p className="detail-box-text">Granular role-based security, automated audit trails, and customizable KPI reporting reducing manual administrative hours by 60%.</p>
                    </div>
                    <div className="card-back-footer">
                      <div className="project-tag-row">
                        <span className="tag-pill">React</span>
                        <span className="tag-pill">Node.js</span>
                        <span className="tag-pill">PostgreSQL</span>
                        <span className="tag-pill">Docker</span>
                      </div>
                      <Link href="/products" className="card-back-cta" onClick={(e) => e.stopPropagation()}>
                        <span>Explore case study</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            VIDEO SHOWCASE SECTION ("Watch Thenam in Action")
            ======================================================== */}
        <section className="video-showcase-section" id="video-showcase" aria-label="Product and technology video showcase">
          <div className="hero-glow-cyan" aria-hidden="true" style={{ top: '20%', left: '10%' }} />
          <div className="hero-glow-lime" aria-hidden="true" style={{ bottom: '20%', right: '10%' }} />

          <div className="container video-container">
            <div className="video-header-center">
              <span className="hero-eyebrow" style={{ color: 'var(--cyan)' }}>
                <Film size={14} className="accent-cyan" />
                EXPERIENCE THENAM · HIGH-PERFORMANCE TECH
              </span>
              <h2 className="section-title-large" style={{ color: '#ffffff', fontSize: 'clamp(30px, 4vw, 44px)' }}>
                Watch how we bring <span className="accent-cyan">intelligence</span> and{' '}
                <span className="accent-lime">velocity</span> to life.
              </h2>
              <p className="section-desc-light" style={{ margin: '14px auto 0', color: '#94a3b8', maxWidth: '640px' }}>
                Explore our engineering craftsmanship in action. From ultra-responsive web portals to scalable AI engines and automated dashboards.
              </p>
            </div>

            {/* Video Player Window Card */}
            <div className="video-frame-outer">
              <div className="video-frame-inner">
                {/* Top Window Bar */}
                <div className="video-window-bar">
                  <div className="window-dots">
                    <span className="window-dot red" />
                    <span className="window-dot yellow" />
                    <span className="window-dot green" />
                  </div>
                  <div className="video-window-title">
                    <Film size={13} className="text-cyan" />
                    <span>thenam-platform-overview.mp4</span>
                  </div>
                  <span className="video-window-badge">1080p Ultra HD · 60fps</span>
                </div>

                {/* Video Media Wrap */}
                <div className="video-media-wrap">
                  {/* Floating Live Badge */}
                  <div className="video-floating-badge">
                    <span className="status-ping" style={{ background: '#00c9ff' }} />
                    <span>Live Demonstration</span>
                  </div>

                  <video
                    ref={videoRef}
                    className="showcase-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src="/hero-background.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Custom Overlay Controls */}
                  <div className="video-overlay-controls">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="video-btn-pill"
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                      <span>{isPlaying ? 'Pause' : 'Play Video'}</span>
                    </button>

                    <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="video-btn-pill"
                        aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                      >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        <span>{isMuted ? 'Unmute' : 'Muted'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="video-btn-pill"
                        aria-label="Fullscreen video"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video 3 Feature Cards */}
            <div className="video-features-row">
              <div className="video-feature-box">
                <div className="video-feature-icon">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="video-feature-title">Rapid Turnaround</h3>
                  <p className="video-feature-desc">
                    Websites and MVPs engineered and deployed in 48 to 72 hours with top-tier Lighthouse scores.
                  </p>
                </div>
              </div>

              <div className="video-feature-box">
                <div className="video-feature-icon lime">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="video-feature-title">AI-Powered Systems</h3>
                  <p className="video-feature-desc">
                    Conversational agents, custom LLM workflows, and multi-modal models built for Indian languages.
                  </p>
                </div>
              </div>

              <div className="video-feature-box">
                <div className="video-feature-icon mint">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="video-feature-title">Scalable Architecture</h3>
                  <p className="video-feature-desc">
                    Cloud-native Next.js and API microservices with 99.9% uptime and zero maintenance headaches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            COMMUNITY & SOCIAL FEEDS SECTION (INSTAGRAM, LINKEDIN, YOUTUBE)
            ======================================================== */}
        <CommunityFeeds />

        {/* ========================================================
            CTA BANNER SECTION ("Have a project in mind?")
            ======================================================== */}
        <CtaBanner />
      </main>

      <Footer />
    </>
  )
}
