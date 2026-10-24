'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CtaBanner from '@/components/CtaBanner'
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
} from 'lucide-react'

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

          <div className="container hero-grid">
            {/* Left Copy */}
            <div className="hero-copy-col">
              <span className="hero-eyebrow">
                <Sparkles size={14} className="accent-cyan" />
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

                <Link href="/contact" className="quote-btn">
                  <span>Get a Free Quote</span>
                  <ArrowRight size={15} />
                </Link>

                <a href="#video-showcase" className="video-hero-pill" aria-label="Scroll to overview video">
                  <Play size={13} fill="currentColor" />
                  <span>Watch Demo</span>
                </a>
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
                  <span>Modern Tech</span>
                </div>
                <div className="badge-item">
                  <Users size={15} />
                  <span>Client-Focused</span>
                </div>
                <div className="badge-item">
                  <BarChart3 size={15} />
                  <span>Scalable</span>
                </div>
              </div>
            </div>

            {/* Right Visual (Realistic Laptop Mockup + Floating UI) */}
            <div className="hero-visual-wrapper">
              <div className="laptop-frame">
                <div className="laptop-top-bar">
                  <span className="camera-dot" />
                </div>

                <div className="laptop-screen-content">
                  {/* Dashboard Header */}
                  <div className="screen-header">
                    <div className="screen-brand">
                      <img src="/thenam-logo.png" alt="Thenam leaf" width="18" height="18" />
                      <strong>THENAM</strong>
                    </div>
                    <p className="screen-title">Business Overview</p>
                  </div>

                  {/* 4 KPIs */}
                  <div className="screen-kpi-grid">
                    <div className="kpi-card">
                      <span>Revenue</span>
                      <strong>₹ 12,48,000</strong>
                      <small>+12%</small>
                    </div>
                    <div className="kpi-card">
                      <span>Total Users</span>
                      <strong>1,420</strong>
                      <small>+18%</small>
                    </div>
                    <div className="kpi-card">
                      <span>Active Projects</span>
                      <strong>24</strong>
                      <small>+33%</small>
                    </div>
                    <div className="kpi-card">
                      <span>Satisfaction</span>
                      <strong>98%</strong>
                      <small>+2%</small>
                    </div>
                  </div>

                  {/* Growth Chart */}
                  <div className="screen-chart-card">
                    <div className="chart-header-row">
                      <span>Growth Overview</span>
                      <small>Last 12 Months ▾</small>
                    </div>
                    <div className="screen-fake-bars">
                      <i style={{ height: '35%' }} />
                      <i style={{ height: '42%' }} />
                      <i style={{ height: '38%' }} />
                      <i style={{ height: '55%' }} />
                      <i style={{ height: '62%' }} />
                      <i style={{ height: '58%' }} />
                      <i style={{ height: '70%' }} className="active-cyan" />
                      <i style={{ height: '78%' }} className="active-cyan" />
                      <i style={{ height: '85%' }} className="active-lime" />
                      <i style={{ height: '92%' }} className="active-lime" />
                      <i style={{ height: '96%' }} className="active-lime" />
                    </div>
                    <div className="chart-month-labels">
                      <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                    </div>
                  </div>

                  {/* Recent Projects Table */}
                  <div className="screen-recent-table">
                    <div className="recent-row">
                      <span>Business Website</span>
                      <span className="status-pill delivered">Delivered</span>
                      <small style={{ color: '#94a3b8' }}>Oct 10, 2026</small>
                    </div>
                    <div className="recent-row">
                      <span>AI Chatbot</span>
                      <span className="status-pill progress">In Progress</span>
                      <small style={{ color: '#94a3b8' }}>Oct 08, 2026</small>
                    </div>
                    <div className="recent-row">
                      <span>Management System</span>
                      <span className="status-pill planning">Planning</span>
                      <small style={{ color: '#94a3b8' }}>Oct 05, 2026</small>
                    </div>
                  </div>
                </div>

                <div className="laptop-base-edge" />
              </div>

              {/* Floating Card: AI Assistant */}
              <div className="float-card-ai" aria-hidden="true">
                <div className="ai-head-row">
                  <div className="ai-icon-chip">
                    <Bot size={13} />
                  </div>
                  <span>AI Assistant</span>
                </div>
                <p className="ai-prompt-text">How can I help you today?</p>
                <div className="ai-chips-list">
                  <button type="button" className="ai-chip-btn">Build a website</button>
                  <button type="button" className="ai-chip-btn">Get a quote</button>
                  <button type="button" className="ai-chip-btn">Discuss a project</button>
                </div>
              </div>

              {/* Floating Card: Create Solution */}
              <div className="float-card-solution" aria-hidden="true">
                <div style={{ color: '#0284c7', marginBottom: '4px' }}>
                  <Layers size={16} />
                </div>
                <strong>Create Solution</strong>
                <p>Turn your ideas into powerful digital products.</p>
                <Link href="/contact" className="solution-mini-btn">
                  <span>Get Started</span>
                  <ArrowRight size={10} />
                </Link>
              </div>

              {/* Floating Card: Phone Preview */}
              <div className="float-card-phone" aria-hidden="true">
                <div className="phone-speaker" />
                <p className="phone-title">Your Ideas</p>
                <div className="phone-list">
                  <span className="phone-pill">🌐 Web Dev</span>
                  <span className="phone-pill">🤖 AI Solutions</span>
                  <span className="phone-pill">💻 Software</span>
                  <span className="phone-pill">⚡ Automation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SERVICES SECTION ("What We Do" - CLEAN WHITE)
            ======================================================== */}
        <section className="services-section" id="services">
          <div className="container">
            <div className="section-head-split">
              <div>
                <span className="section-eyebrow">OUR SERVICES</span>
                <h2 className="section-title-large">
                  What <span className="accent-cyan-dark">We</span> <span className="accent-lime-dark">Do</span>
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

            {/* Right Projects Grid */}
            <div className="featured-work-grid-4">
              {/* Project 1: AgriSmart */}
              <article className="project-showcase-card">
                <div className="project-art-preview art-agrismart">
                  <div className="project-mock-box">
                    <div className="mock-top-bar" style={{ color: '#166534' }}>
                      <span>AgriSmart Drone & IoT</span>
                      <span>● Active</span>
                    </div>
                    <div className="mock-content-mini">
                      <div className="mock-avatar-circle" style={{ background: '#dcfce7', color: '#15803d' }}>
                        🌾
                      </div>
                      <div className="mock-lines-group">
                        <div className="mock-line" style={{ background: '#86efac' }} />
                        <div className="mock-line short" style={{ background: '#bbf7d0' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="project-meta-bottom">
                  <h3 className="project-title">AgriSmart</h3>
                  <p className="project-desc-mini">AI-Powered AgriTech Platform</p>
                  <div className="project-tag-row">
                    <span className="tag-pill">Web App</span>
                    <span className="tag-pill">AI/ML</span>
                    <span className="tag-pill">IoT</span>
                  </div>
                </div>
              </article>

              {/* Project 2: ZaraBot */}
              <article className="project-showcase-card">
                <div className="project-art-preview art-zarabot">
                  <div className="project-mock-box">
                    <div className="mock-top-bar" style={{ color: '#38bdf8' }}>
                      <span>ZaraBot AI Voice</span>
                      <span>⚡ Tamil-first</span>
                    </div>
                    <div className="mock-content-mini">
                      <div className="mock-avatar-circle" style={{ background: '#0c2340', color: '#38bdf8' }}>
                        🤖
                      </div>
                      <div className="mock-lines-group">
                        <div className="mock-line" style={{ background: '#38bdf8' }} />
                        <div className="mock-line short" style={{ background: '#0284c7' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="project-meta-bottom">
                  <h3 className="project-title">ZaraBot</h3>
                  <p className="project-desc-mini">Tamil-first AI Assistant</p>
                  <div className="project-tag-row">
                    <span className="tag-pill">AI</span>
                    <span className="tag-pill">Chatbot</span>
                    <span className="tag-pill">Voice</span>
                  </div>
                </div>
              </article>

              {/* Project 3: E-Commerce Platform */}
              <article className="project-showcase-card">
                <div className="project-art-preview art-ecommerce">
                  <div className="project-mock-box">
                    <div className="mock-top-bar" style={{ color: '#92400e' }}>
                      <span>Fresh Natural Products</span>
                      <span>🛒 Cart (3)</span>
                    </div>
                    <div className="mock-content-mini">
                      <div className="mock-avatar-circle" style={{ background: '#fef3c7', color: '#b45309' }}>
                        🛍️
                      </div>
                      <div className="mock-lines-group">
                        <div className="mock-line" style={{ background: '#fde68a' }} />
                        <div className="mock-line short" style={{ background: '#fcd34d' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="project-meta-bottom">
                  <h3 className="project-title">E-Commerce Platform</h3>
                  <p className="project-desc-mini">Business Website & Storefront</p>
                  <div className="project-tag-row">
                    <span className="tag-pill">Web Dev</span>
                    <span className="tag-pill">E-commerce</span>
                  </div>
                </div>
              </article>

              {/* Project 4: Business Management System */}
              <article className="project-showcase-card">
                <div className="project-art-preview art-bizmgmt">
                  <div className="project-mock-box">
                    <div className="mock-top-bar" style={{ color: '#0369a1' }}>
                      <span>Enterprise CRM & ERP</span>
                      <span>📊 Sync</span>
                    </div>
                    <div className="mock-content-mini">
                      <div className="mock-avatar-circle" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                        📈
                      </div>
                      <div className="mock-lines-group">
                        <div className="mock-line" style={{ background: '#bae6fd' }} />
                        <div className="mock-line short" style={{ background: '#7dd3fc' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="project-meta-bottom">
                  <h3 className="project-title">Business Management System</h3>
                  <p className="project-desc-mini">Custom Operations Software</p>
                  <div className="project-tag-row">
                    <span className="tag-pill">Web App</span>
                    <span className="tag-pill">Dashboard</span>
                  </div>
                </div>
              </article>
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
            CTA BANNER SECTION ("Have a project in mind?")
            ======================================================== */}
        <CtaBanner />
      </main>

      <Footer />
    </>
  )
}
