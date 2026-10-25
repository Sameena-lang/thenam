'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
  href: string
}

const CLIENT_MARQUEE_LOGOS: MarqueeLogo[] = [
  {
    id: 'magizh-mahal',
    name: 'Magizh Mahal',
    src: '/marquee-logos/magizh-mahal.png',
    width: 34,
    height: 34,
    className: 'marquee-logo-magizh',
    href: '/projects/magizh-mahal',
  },
  {
    id: 'pink-fish',
    name: 'Pink Fish',
    src: '/marquee-logos/pink-fish.png',
    width: 48,
    height: 34,
    className: 'marquee-logo-pinkfish',
    href: '/projects/pink-fish',
  },
  {
    id: 'swekas-luxe',
    name: 'Swekas Luxe',
    src: '/marquee-logos/swekas-luxe.png',
    width: 34,
    height: 34,
    className: 'marquee-logo-swekas',
    href: '/projects/swekas-luxe',
  },
  {
    id: 'chennai-tales',
    name: 'Chennai Tales',
    src: '/marquee-logos/chennai-tales.png',
    width: 76,
    height: 34,
    className: 'marquee-logo-chennai',
    href: '/projects/chennai-tales',
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
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)

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
                  <Link
                    href={item.href}
                    className="marquee-logo-link"
                    title={`View ${item.name} project`}
                  >
                    <div className={`marquee-logo-frame ${item.className}`}>
                      <Image
                        src={item.src}
                        alt={item.name}
                        width={item.width}
                        height={item.height}
                        className="marquee-logo-image"
                        priority={i < 4}
                      />
                    </div>
                  </Link>
                </span>
              ))}
            </div>
            <div className="marquee-group" aria-hidden="true">
              {MARQUEE_ITEMS.map((item, i) => (
                <span key={`group-2-${i}`} className="marquee-item">
                  <span className="marquee-dot" aria-hidden="true" />
                  <Link
                    href={item.href}
                    className="marquee-logo-link"
                    title={`View ${item.name} project`}
                    tabIndex={-1}
                  >
                    <div className={`marquee-logo-frame ${item.className}`}>
                      <Image
                        src={item.src}
                        alt={item.name}
                        width={item.width}
                        height={item.height}
                        className="marquee-logo-image"
                      />
                    </div>
                  </Link>
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

            <div className="services-grid-4">
              {/* Card 1: Web Development -> Swekas Luxe Project */}
              <article
                className="service-flip-card"
                onClick={() => router.push('/projects/swekas-luxe')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    router.push('/projects/swekas-luxe')
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label="Web Development service card - View Swekas Luxe project"
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
                      <span className="service-foot-link">Explore Project</span>
                      <Link
                        href="/projects/swekas-luxe"
                        className="service-circle-btn"
                        aria-label="Explore Swekas Luxe project"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 2: AI & Machine Learning -> Pink Fish Project */}
              <article
                className="service-flip-card"
                onClick={() => router.push('/projects/pink-fish')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    router.push('/projects/pink-fish')
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label="AI & Machine Learning service card - View Pink Fish project"
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
                      <span className="service-foot-link">Explore Project</span>
                      <Link
                        href="/projects/pink-fish"
                        className="service-circle-btn"
                        aria-label="Explore Pink Fish project"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 3: Custom Software -> Chennai Tales Project */}
              <article
                className="service-flip-card"
                onClick={() => router.push('/projects/chennai-tales')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    router.push('/projects/chennai-tales')
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label="Custom Software service card - View Chennai Tales project"
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
                      <span className="service-foot-link">Explore Project</span>
                      <Link
                        href="/projects/chennai-tales"
                        className="service-circle-btn"
                        aria-label="Explore Chennai Tales project"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 4: Business Automation -> Business Automation Project */}
              <article
                className="service-flip-card"
                onClick={() => router.push('/projects/business-automation')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    router.push('/projects/business-automation')
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label="Business Automation service card - View Business Automation project"
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
                      <span className="service-foot-link">Explore Project</span>
                      <Link
                        href="/projects/business-automation"
                        className="service-circle-btn"
                        aria-label="Explore Business Automation project"
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

            {/* Right Projects: 4 Horizontal Clean Cards (Exact match to Image 2) */}
            <div className="featured-work-cards-row">
              {/* Project 1: AgriSmart */}
              <Link
                href="/products#agrismart"
                className="featured-normal-card"
                aria-label="AgriSmart — AI-Powered AgriTech Platform"
              >
                <div className="featured-card-thumb-wrap">
                  <img
                    src="/projects/thumb-agrismart-retina.png"
                    alt="AgriSmart platform preview"
                    className="featured-card-img"
                  />
                </div>
                <div className="featured-card-body">
                  <h3 className="featured-card-title">AgriSmart</h3>
                  <p className="featured-card-subtitle">AI-Powered AgriTech Platform</p>
                  <div className="featured-card-tags">
                    <span className="featured-pill-tag">Web App</span>
                    <span className="featured-pill-tag">AI/ML</span>
                    <span className="featured-pill-tag">IoT</span>
                  </div>
                </div>
              </Link>

              {/* Project 2: ZaraBot */}
              <Link
                href="/products#zarabot"
                className="featured-normal-card"
                aria-label="ZaraBot — Tamil-first AI Assistant"
              >
                <div className="featured-card-thumb-wrap">
                  <img
                    src="/projects/thumb-zarabot-retina.png"
                    alt="ZaraBot AI Voice preview"
                    className="featured-card-img"
                  />
                </div>
                <div className="featured-card-body">
                  <h3 className="featured-card-title">ZaraBot</h3>
                  <p className="featured-card-subtitle">Tamil-first AI Assistant</p>
                  <div className="featured-card-tags">
                    <span className="featured-pill-tag">AI</span>
                    <span className="featured-pill-tag">Chatbot</span>
                    <span className="featured-pill-tag">Voice</span>
                  </div>
                </div>
              </Link>

              {/* Project 3: E-Commerce Platform */}
              <Link
                href="/products#ecommerce"
                className="featured-normal-card"
                aria-label="E-Commerce Platform — Business Website"
              >
                <div className="featured-card-thumb-wrap">
                  <img
                    src="/projects/thumb-ecommerce-retina.png"
                    alt="E-Commerce Platform preview"
                    className="featured-card-img"
                  />
                </div>
                <div className="featured-card-body">
                  <h3 className="featured-card-title">E-Commerce Platform</h3>
                  <p className="featured-card-subtitle">Business Website</p>
                  <div className="featured-card-tags">
                    <span className="featured-pill-tag">Web Development</span>
                    <span className="featured-pill-tag">E-commerce</span>
                  </div>
                </div>
              </Link>

              {/* Project 4: Business Management System */}
              <Link
                href="/products#business-management"
                className="featured-normal-card"
                aria-label="Business Management System — Custom Software"
              >
                <div className="featured-card-thumb-wrap">
                  <img
                    src="/projects/thumb-bizmgmt-retina.png"
                    alt="Business Management System preview"
                    className="featured-card-img"
                  />
                </div>
                <div className="featured-card-body">
                  <h3 className="featured-card-title">Business Management System</h3>
                  <p className="featured-card-subtitle">Custom Software</p>
                  <div className="featured-card-tags">
                    <span className="featured-pill-tag">Web App</span>
                    <span className="featured-pill-tag">Dashboard</span>
                  </div>
                </div>
              </Link>
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
