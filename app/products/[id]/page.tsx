import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CtaBanner from '@/components/CtaBanner'
import { getProductById, getAllProductsFromDb } from '@/lib/db'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Bot,
  Wheat,
  BarChart2,
  ShieldCheck,
  Layers,
  Zap,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

function getBadgeStyle(color?: string) {
  const c = (color || 'cyan').toLowerCase().trim()
  const map: Record<string, { bg: string; text: string; border: string }> = {
    cyan: { bg: '#e0f2fe', text: '#0284c7', border: '#7dd3fc' },
    teal: { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4' },
    lime: { bg: '#ecfccb', text: '#4d7c0f', border: '#bef264' },
    green: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    emerald: { bg: '#d1fae5', text: '#047857', border: '#6ee7b7' },
    blue: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
    sky: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
    indigo: { bg: '#e0e7ff', text: '#4338ca', border: '#a5b4fc' },
    purple: { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' },
    violet: { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
    pink: { bg: '#fce7f3', text: '#be185d', border: '#f9a8d4' },
    rose: { bg: '#ffe4e6', text: '#be123c', border: '#fecdd3' },
    red: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
    orange: { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' },
    yellow: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    slate: { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' },
    navy: { bg: '#061426', text: '#00c9f2', border: 'rgba(0, 201, 242, 0.4)' },
    gradient: {
      bg: 'linear-gradient(135deg, rgba(0,201,242,0.18), rgba(130,230,46,0.18))',
      text: '#0284c7',
      border: '#00c9f2',
    },
  }
  if (map[c]) return map[c]
  if (c.startsWith('#')) return { bg: c + '18', text: c, border: c + '60' }
  return { bg: '#e0f2fe', text: '#0284c7', border: '#7dd3fc' }
}

function getProductIcon(name: string, id: string) {
  const norm = (name + ' ' + id).toLowerCase()
  if (norm.includes('paper') || norm.includes('craft') || norm.includes('shop') || norm.includes('e-com')) {
    return ShoppingBag
  }
  if (norm.includes('agri') || norm.includes('crop') || norm.includes('farm')) {
    return Wheat
  }
  if (norm.includes('zara') || norm.includes('bot') || norm.includes('ai') || norm.includes('chat')) {
    return Bot
  }
  if (norm.includes('pulse') || norm.includes('mgmt') || norm.includes('manage') || norm.includes('bms')) {
    return BarChart2
  }
  return Sparkles
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const product = getProductById(id)

  if (!product) {
    notFound()
  }

  const badgeStyle = getBadgeStyle(product.badge_color)
  const IconComponent = getProductIcon(product.name, product.id)
  const allProducts = getAllProductsFromDb(true)
  const otherProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4)

  const productImage =
    product.image_url ||
    (product.id.includes('agri')
      ? '/projects/featured-agrismart-hq.png'
      : product.id.includes('zara')
      ? '/projects/featured-zarabot-hq.png'
      : product.id.includes('pulse')
      ? '/projects/featured-bizmgmt-hq.png'
      : '/projects/featured-ecommerce-hq.png')

  return (
    <>
      <Header />

      <main
        style={{
          background: '#031422',
          minHeight: '100vh',
          position: 'relative',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Glows */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '5%',
            left: '10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(0, 201, 242, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '30%',
            right: '5%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(130, 230, 46, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '0 24px 80px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Back Navigation Bar */}
          <div
            style={{
              padding: '28px 0 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <Link
              href="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#38bdf8',
                fontSize: '13.5px',
                fontWeight: 600,
                textDecoration: 'none',
                background: 'rgba(56, 189, 248, 0.08)',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                transition: 'background 0.2s ease',
              }}
            >
              <ArrowLeft size={15} />
              <span>Back to Products</span>
            </Link>

            <Link
              href="/"
              style={{
                color: '#94a3b8',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Home / Products / <span style={{ color: '#ffffff' }}>{product.name}</span>
            </Link>
          </div>

          {/* ========================================================
              PRODUCT HERO SECTION
              ======================================================== */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '48px',
              alignItems: 'center',
              padding: '20px 0 60px',
            }}
            aria-label={`${product.name} product showcase`}
          >
            {/* Left Column: Metadata & Copy */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: badgeStyle.text,
                    background: badgeStyle.bg,
                    border: `1px solid ${badgeStyle.border}`,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    letterSpacing: '0.05em',
                  }}
                >
                  {product.badge}
                </span>

                <span
                  style={{
                    fontSize: '11.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 800,
                    color: '#38bdf8',
                  }}
                >
                  {product.category}
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(34px, 4.4vw, 52px)',
                  fontWeight: 850,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  margin: '0 0 14px',
                }}
              >
                {product.name}
              </h1>

              <p
                style={{
                  fontSize: '17px',
                  lineHeight: 1.6,
                  color: '#38bdf8',
                  fontWeight: 600,
                  margin: '0 0 20px',
                }}
              >
                {product.tagline}
              </p>

              {/* Tags Row */}
              {product.tagsList.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
                  {product.tagsList.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#cbd5e1',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Metrics Grid */}
              {product.metricsList.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '12px',
                    marginBottom: '32px',
                  }}
                >
                  {product.metricsList.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      style={{
                        background: 'rgba(11, 22, 43, 0.85)',
                        border: '1px solid #1c2e4d',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          fontSize: '9.5px',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          marginBottom: '4px',
                        }}
                      >
                        {m.label}
                      </span>
                      <strong style={{ fontSize: '16px', color: '#82e62e', fontWeight: 800 }}>{m.val}</strong>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link
                  href="/contact"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#00c9f2',
                    color: '#031422',
                    fontWeight: 700,
                    fontSize: '14px',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(0, 201, 242, 0.35)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <span>Request Live Demo</span>
                  <ArrowRight size={15} />
                </Link>

                <Link
                  href="/contact"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '12px 22px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textDecoration: 'none',
                  }}
                >
                  <span>Deploy for Your Team</span>
                  <ExternalLink size={15} />
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Mockup Showcase */}
            <div>
              <div
                style={{
                  background: '#070f1e',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #1a2a47',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55)',
                }}
              >
                {/* Browser Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                        marginLeft: '8px',
                        fontFamily: 'monospace',
                      }}
                    >
                      thenam.com / products / {product.id}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      background: 'rgba(0, 201, 255, 0.15)',
                      color: '#00c9ff',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontWeight: 700,
                    }}
                  >
                    Live Platform
                  </span>
                </div>

                {/* Platform Preview Image */}
                <div
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #1c2e4d',
                    background: '#040b15',
                    position: 'relative',
                  }}
                >
                  <img
                    src={productImage}
                    alt={product.image_alt || `${product.name} platform preview`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '420px',
                      objectFit: 'contain',
                      display: 'block',
                      background: '#040b15',
                    }}
                  />
                </div>

                {/* Mockup Status Footer */}
                <div
                  style={{
                    marginTop: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '11.5px',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={14} style={{ color: '#00c9f2' }} />
                    <span>Enterprise Security &amp; Data Isolation</span>
                  </div>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>● Optimal SLA</span>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================
              DESCRIPTION & FEATURES SPLIT
              ======================================================== */}
          <section
            style={{
              background: '#071224',
              borderRadius: '20px',
              border: '1px solid #14284b',
              padding: '44px 36px',
              marginBottom: '70px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '40px',
              }}
            >
              {/* Product Overview */}
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#00c9f2',
                    letterSpacing: '0.12em',
                    display: 'block',
                    marginBottom: '10px',
                  }}
                >
                  PRODUCT OVERVIEW
                </span>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', margin: '0 0 18px' }}>
                  Engineered for real impact.
                </h2>
                <div
                  style={{
                    fontSize: '14.5px',
                    lineHeight: '1.75',
                    color: '#94a3b8',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {product.description}
                </div>
              </div>

              {/* Core Features */}
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#82e62e',
                    letterSpacing: '0.12em',
                    display: 'block',
                    marginBottom: '10px',
                  }}
                >
                  KEY CAPABILITIES &amp; FEATURES
                </span>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', margin: '0 0 18px' }}>
                  What sets {product.name} apart.
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {product.featuresList.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                      }}
                    >
                      <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '13.5px', color: '#e2e8f0', lineHeight: 1.5 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================
              OTHER PROPRIETARY PLATFORMS
              ======================================================== */}
          {otherProducts.length > 0 && (
            <section style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: '#00c9f2',
                      letterSpacing: '0.12em',
                    }}
                  >
                    INNOVATION LAB
                  </span>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: '4px 0 0' }}>
                    More Products by THENAM
                  </h3>
                </div>
                <Link
                  href="/products"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#38bdf8',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span>View All Products</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '18px',
                }}
              >
                {otherProducts.map((p) => {
                  const pImg =
                    p.image_url ||
                    (p.id.includes('agri')
                      ? '/projects/featured-agrismart-hq.png'
                      : p.id.includes('zara')
                      ? '/projects/featured-zarabot-hq.png'
                      : p.id.includes('pulse')
                      ? '/projects/featured-bizmgmt-hq.png'
                      : '/projects/featured-ecommerce-hq.png')
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      style={{
                        background: '#071224',
                        border: '1px solid #14284b',
                        borderRadius: '12px',
                        padding: '12px',
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease, border-color 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          aspectRatio: '16/10',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#040b15',
                          marginBottom: '10px',
                        }}
                      >
                        <img
                          src={pImg}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <strong style={{ fontSize: '14px', color: '#ffffff', display: 'block', marginBottom: '2px' }}>
                        {p.name}
                      </strong>
                      <small style={{ fontSize: '11px', color: '#94a3b8' }}>{p.category}</small>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        <CtaBanner />
      </main>

      <Footer />
    </>
  )
}

