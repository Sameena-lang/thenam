'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PortfolioCard {
  id: number
  title: string
  image: string
  alt: string
}

const CARDS: PortfolioCard[] = [
  {
    id: 1,
    title: 'Visual Identity & Tech',
    image: '/about-portfolio/card-1.png',
    alt: 'Creative Portrait in Dark Hoodie',
  },
  {
    id: 2,
    title: '3D Character & Motion',
    image: '/about-portfolio/card-2.png',
    alt: '3D Stylized Character Avatar',
  },
  {
    id: 3,
    title: 'Digital Experience Lead',
    image: '/about-portfolio/card-3.png',
    alt: 'Anime Neon Spotlight Avatar',
  },
  {
    id: 4,
    title: 'Lifestyle & Production',
    image: '/about-portfolio/card-4.png',
    alt: 'Beach Lifestyle Portrait in Sunglasses',
  },
  {
    id: 5,
    title: 'Mythic Red Dragon',
    image: '/about-portfolio/card-5.png',
    alt: 'Glowing Red Dragon Creative Artwork',
  },
]

export default function CreativePortfolioCarousel({
  variant = 'section',
  autoPlay = true,
}: {
  variant?: 'section' | 'hero-bg'
  autoPlay?: boolean
}) {
  const [activeIndex, setActiveIndex] = useState(2) // start with center card (index 2)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-play moving effect: moves to the next card every 2.8 seconds
  useEffect(() => {
    if (!autoPlay || isHovered) return

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARDS.length)
    }, 2800)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [autoPlay, isHovered])

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % CARDS.length)
  }

  // Calculate 3D coverflow styling for each card
  const getCardStyle = (index: number) => {
    // Relative position distance from activeIndex (-2 to +2)
    let offset = index - activeIndex
    if (offset > 2) offset -= 5
    if (offset < -2) offset += 5

    // Base card dimensions
    const isHero = variant === 'hero-bg'
    const baseW = isHero ? 220 : 280
    const baseH = isHero ? 240 : 310

    if (offset === 0) {
      // Active Spotlight Center Card
      return {
        transform: 'translate3d(0, 0, 90px) scale(1.08)',
        zIndex: 10,
        opacity: 1,
        filter: 'brightness(1.05)',
        borderColor: '#38bdf8',
        boxShadow:
          '0 0 35px rgba(0, 201, 242, 0.7), 0 0 70px rgba(168, 85, 247, 0.45), 0 20px 50px rgba(0,0,0,0.85)',
        width: `${baseW}px`,
        height: `${baseH}px`,
      }
    } else if (offset === 1) {
      // Mid-Right
      return {
        transform: `translate3d(${isHero ? 160 : 210}px, 0, -25px) rotateY(-22deg) scale(0.88)`,
        zIndex: 5,
        opacity: 0.88,
        filter: 'brightness(0.82)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.65)',
        width: `${baseW}px`,
        height: `${baseH}px`,
      }
    } else if (offset === 2) {
      // Far-Right
      return {
        transform: `translate3d(${isHero ? 290 : 380}px, 0, -85px) rotateY(-34deg) scale(0.76)`,
        zIndex: 2,
        opacity: 0.65,
        filter: 'brightness(0.65)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        width: `${baseW}px`,
        height: `${baseH}px`,
      }
    } else if (offset === -1) {
      // Mid-Left
      return {
        transform: `translate3d(${isHero ? -160 : -210}px, 0, -25px) rotateY(22deg) scale(0.88)`,
        zIndex: 5,
        opacity: 0.88,
        filter: 'brightness(0.82)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.65)',
        width: `${baseW}px`,
        height: `${baseH}px`,
      }
    } else {
      // Far-Left (offset === -2)
      return {
        transform: `translate3d(${isHero ? -290 : -380}px, 0, -85px) rotateY(34deg) scale(0.76)`,
        zIndex: 2,
        opacity: 0.65,
        filter: 'brightness(0.65)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        width: `${baseW}px`,
        height: `${baseH}px`,
      }
    }
  }

  // If used purely as an ambient background layer in hero
  if (variant === 'hero-bg') {
    return (
      <div
        className="about-hero-bg-carousel-layer"
        style={{
          position: 'absolute',
          top: '50%',
          right: '-5%',
          transform: 'translateY(-50%)',
          width: '780px',
          height: '420px',
          perspective: '1200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 1,
          opacity: 0.85,
        }}
        aria-hidden="true"
      >
        {/* Glow backdrop behind cards */}
        <div
          style={{
            position: 'absolute',
            width: '420px',
            height: '320px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(0, 201, 242, 0.28) 0%, rgba(168, 85, 247, 0.22) 50%, transparent 75%)',
            filter: 'blur(55px)',
            pointerEvents: 'none',
          }}
        />

        {/* 3D Cards container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformStyle: 'preserve-3d',
          }}
        >
          {CARDS.map((card, idx) => {
            const style = getCardStyle(idx)
            return (
              <div
                key={card.id}
                style={{
                  position: 'absolute',
                  borderRadius: '20px',
                  background: '#040914',
                  border: `2px solid ${style.borderColor}`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
                  boxShadow: style.boxShadow,
                  ...style,
                }}
              >
                <img
                  src={card.image}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Full Spotlight Section as seen in reference image
  return (
    <section
      className="creative-portfolio-showcase-section"
      aria-label="Creative Portfolio Spotlight"
      style={{
        background: '#000000',
        backgroundColor: '#02050c',
        color: '#ffffff',
        padding: '95px 0 100px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid #111a2c',
        borderBottom: '1px solid #111a2c',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient Cyber Lighting in corners */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-60px',
          left: '8%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-60px',
          right: '8%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 201, 242, 0.25) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* ========================================================
            3D COVERFLOW CAROUSEL WITH ARROWS
            ======================================================== */}
        <div
          style={{
            position: 'relative',
            maxWidth: '1080px',
            margin: '0 auto 40px',
            height: '350px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1300px',
          }}
        >
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous portfolio card"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(8, 18, 34, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 30,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.22s ease',
              boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00c9f2'
              e.currentTarget.style.background = 'rgba(0, 201, 242, 0.2)'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)'
              e.currentTarget.style.background = 'rgba(8, 18, 34, 0.75)'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            }}
          >
            <ChevronLeft size={22} />
          </button>

          {/* Cards 3D Stage */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transformStyle: 'preserve-3d',
            }}
          >
            {CARDS.map((card, idx) => {
              const style = getCardStyle(idx)
              const isActive = idx === activeIndex

              return (
                <div
                  key={card.id}
                  onClick={() => setActiveIndex(idx)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${card.title}`}
                  style={{
                    position: 'absolute',
                    borderRadius: '20px',
                    background: '#040914',
                    border: `2px solid ${style.borderColor}`,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
                    boxShadow: style.boxShadow,
                    ...style,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveIndex(idx)
                    }
                  }}
                >
                  <img
                    src={card.image}
                    alt={card.alt}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '18px',
                        pointerEvents: 'none',
                        boxShadow: 'inset 0 0 20px rgba(0, 201, 242, 0.35)',
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next portfolio card"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(8, 18, 34, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 30,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.22s ease',
              boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00c9f2'
              e.currentTarget.style.background = 'rgba(0, 201, 242, 0.2)'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)'
              e.currentTarget.style.background = 'rgba(8, 18, 34, 0.75)'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            }}
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* ========================================================
            INDICATOR DOTS
            ======================================================== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '32px',
          }}
        >
          {CARDS.map((_, i) => {
            const isDotActive = i === activeIndex
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: isDotActive ? '20px' : '7px',
                  height: '7px',
                  borderRadius: '999px',
                  background: isDotActive ? '#ffffff' : 'rgba(255, 255, 255, 0.22)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: isDotActive ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none',
                }}
              />
            )
          })}
        </div>

        {/* ========================================================
            BADGE, TITLE & SUBTITLE (MATCHING EXACT REFERENCE IMAGE)
            ======================================================== */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
          {/* Outlined PORTFOLIO Badge */}
          <div
            style={{
              display: 'inline-block',
              padding: '6px 20px',
              borderRadius: '999px',
              border: '1px solid rgba(56, 189, 248, 0.65)',
              background: 'rgba(56, 189, 248, 0.06)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: '18px',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)',
            }}
          >
            PORTFOLIO
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize: 'clamp(32px, 4.2vw, 48px)',
              fontWeight: '800',
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: '1.15',
              margin: '0 0 14px',
            }}
          >
            Our Creative Portfolio
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '15px',
              lineHeight: '1.65',
              color: '#94a3b8',
              margin: 0,
            }}
          >
            A showcase of the ideas, designs and digital experiences we&apos;ve created.
          </p>
        </div>
      </div>
    </section>
  )
}
