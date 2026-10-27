'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CtaBanner from '@/components/CtaBanner'
import {
  Sparkles,
  ArrowRight,
  Bot,
  Layers,
  CheckCircle2,
  ExternalLink,
  Cpu,
  BarChart2,
  Wheat,
  ShoppingBag,
  Zap,
} from 'lucide-react'

const DEFAULT_PRODUCTS = [
  {
    id: 'agrismart',
    name: 'AgriSmart',
    category: 'AI-Powered AgriTech Platform',
    badge: 'Active Deployment',
    badgeColor: 'lime',
    icon: Wheat,
    iconColor: '#15803d',
    iconBg: '#dcfce7',
    tagline: 'Precision agricultural intelligence for farmers, cooperatives, and agribusinesses.',
    description:
      'AgriSmart blends satellite remote sensing, localized weather forecasting, and drone vision AI to identify crop diseases before they spread. Built with offline-first capabilities and multilingual advisory.',
    tags: ['Web App', 'AI/ML', 'Computer Vision', 'IoT'],
    metrics: [
      { label: 'Yield Increase', val: '+24%' },
      { label: 'Pesticide Reduction', val: '-35%' },
      { label: 'Active Acres', val: '12,000+' },
    ],
    features: [
      'Early crop blight and pest detection via smartphone camera',
      'Soil moisture and micro-climate sensor telemetry',
      'Voice alerts in Tamil and regional Indian languages',
      'Direct market price tracking & harvest logistics sync',
    ],
  },
  {
    id: 'zarabot',
    name: 'ZaraBot',
    category: 'Tamil-First Conversational AI Assistant',
    badge: 'Trending Product',
    badgeColor: 'cyan',
    icon: Bot,
    iconColor: '#0284c7',
    iconBg: '#e0f2fe',
    tagline: 'Natural conversational customer support in Tamil and Indian English.',
    description:
      'ZaraBot handles complex customer queries, appointment scheduling, and order status tracking over WhatsApp, web chat, and voice telephony. Trained specifically on colloquial Tamil nuances.',
    tags: ['AI Agent', 'Chatbot', 'Voice AI', 'WhatsApp API'],
    metrics: [
      { label: 'Resolution Rate', val: '88%' },
      { label: 'Response Time', val: '< 1.2s' },
      { label: 'Hours Saved/Mo', val: '140 hrs' },
    ],
    features: [
      'Natural language understanding in Tamil script and Tanglish',
      'Official WhatsApp Business API native integration',
      'Automated lead qualification and CRM database sync',
      'Instant human handoff when complex escalation is needed',
    ],
  },
  {
    id: 'commerceflow',
    name: 'E-Commerce Platform',
    category: 'High-Conversion D2C Storefront Engine',
    badge: 'Turnkey Solution',
    badgeColor: 'yellow',
    icon: ShoppingBag,
    iconColor: '#b45309',
    iconBg: '#fef3c7',
    tagline: 'Lightning-fast online stores engineered for maximum checkout conversion.',
    description:
      'Built for fresh organic brands, regional manufacturers, and direct-to-consumer businesses. Out-of-the-box UPI 1-click checkout, local pincode delivery checks, and automated WhatsApp order notifications.',
    tags: ['Next.js 16', 'UPI / Razorpay', 'E-commerce', 'SEO Fast'],
    metrics: [
      { label: 'Lighthouse Score', val: '99/100' },
      { label: 'Cart Abandonment', val: '-28%' },
      { label: 'Avg Setup Time', val: '48 hrs' },
    ],
    features: [
      'Blazing-fast mobile storefront with zero page reloads',
      'Instant UPI, PhonePe, Google Pay, and COD checkout',
      'Automated shipping label printing and WhatsApp tracking',
      'Inventory alerts and multi-warehouse support',
    ],
  },
  {
    id: 'pulse-core',
    name: 'Business Management System',
    category: 'Operations, CRM & Resource Cockpit',
    badge: 'Enterprise SaaS',
    badgeColor: 'blue',
    icon: BarChart2,
    iconColor: '#0284c7',
    iconBg: '#e0f2fe',
    tagline: 'The all-in-one operations operating system for ambitious businesses.',
    description:
      'Replace 5 disconnected tools with a single unified workspace. Track client milestones, monitor team velocity, automate recurring invoicing, and view real-time profit and loss metrics at a glance.',
    tags: ['Dashboard', 'CRM / ERP', 'Analytics', 'Role-Based RBAC'],
    metrics: [
      { label: 'Sync Speed', val: 'Realtime' },
      { label: 'Data Accuracy', val: '100%' },
      { label: 'Tools Replaced', val: '4 to 6' },
    ],
    features: [
      'Executive business overview KPI cards and dynamic growth charts',
      'Client project milestones with automated deadline reminders',
      'GST-ready automated invoice generator and payment logging',
      'Encrypted role-based access for managers, staff, and accountants',
    ],
  },
]

const PRODUCT_ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; style?: React.CSSProperties; className?: string }>> = {
  Wheat,
  Bot,
  ShoppingBag,
  BarChart2,
  Cpu,
  Layers,
  Zap,
}

interface ProductCardItem {
  id: string
  name: string
  category: string
  badge: string
  badgeColor: string
  icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties; className?: string }>
  iconColor: string
  iconBg: string
  tagline: string
  description: string
  tags: string[]
  metrics: Array<{ label: string; val: string }>
  features: string[]
  image_url?: string | null
  image_alt?: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductCardItem[]>(DEFAULT_PRODUCTS)

  // Fetch live products from database with fallback to default products
  useEffect(() => {
    let isMounted = true
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load products')
        return res.json()
      })
      .then((data) => {
        if (isMounted && data.products && Array.isArray(data.products) && data.products.length > 0) {
          const mapped = data.products.map((p: {
            id: string
            name: string
            category: string
            badge: string
            badgeColor?: string
            badge_color?: string
            icon_name?: string
            iconColor?: string
            icon_color?: string
            iconBg?: string
            icon_bg?: string
            tagline: string
            description: string
            tags: string[]
            metrics: Array<{ label: string; val: string }>
            features: string[]
            image_url?: string | null
            image_alt?: string | null
          }) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            badge: p.badge,
            badgeColor: p.badgeColor || p.badge_color || 'cyan',
            icon: (p.icon_name && PRODUCT_ICON_MAP[p.icon_name]) ? PRODUCT_ICON_MAP[p.icon_name] : Bot,
            iconColor: p.iconColor || p.icon_color || '#0284c7',
            iconBg: p.iconBg || p.icon_bg || '#e0f2fe',
            tagline: p.tagline,
            description: p.description,
            tags: Array.isArray(p.tags) ? p.tags : [],
            metrics: Array.isArray(p.metrics) ? p.metrics : [],
            features: Array.isArray(p.features) ? p.features : [],
            image_url: p.image_url || null,
            image_alt: p.image_alt || null,
          }))
          setProducts(mapped)
        }
      })
      .catch((err) => {
        console.warn('Products live fetch error; using fallback:', err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <Header />

      <main>
        {/* ========================================================
            PRODUCTS HERO SECTION
            ======================================================== */}
        <section className="inner-page-hero" aria-label="Products Introduction">
          <div className="hero-glow-cyan" aria-hidden="true" />
          <div className="container">
            <div className="inner-hero-content">
              <span className="inner-hero-eyebrow">
                <Sparkles size={13} style={{ display: 'inline', marginRight: '6px' }} />
                THENAM INNOVATION LABS
              </span>
              <h1 className="inner-hero-title">
                Products built to solve <span className="accent-cyan">real-world</span>{' '}
                <span className="accent-lime">problems.</span>
              </h1>
              <p className="inner-hero-desc">
                Beyond custom client engineering, we build and maintain proprietary software platforms that tackle agriculture, language accessibility, e-commerce, and business automation.
              </p>
              <div className="hero-btn-row">
                <a href="#product-showcases" className="quote-btn">
                  <span>Explore Featured Products</span>
                  <ArrowRight size={15} />
                </a>
                <Link href="/contact" className="explore-btn">
                  <span>Request a Product Demo</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            DETAILED PRODUCT SHOWCASES
            ======================================================== */}
        <section className="inner-white-section" id="product-showcases">
          <div className="container">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
              {products.map((product, idx) => {
                const Icon = product.icon
                const isEven = idx % 2 === 1
                return (
                  <article
                    key={product.id}
                    id={product.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '18px',
                      padding: '36px',
                      background: '#ffffff',
                      boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
                      display: 'grid',
                      gridTemplateColumns: isEven ? '1.15fr 0.85fr' : '0.85fr 1.15fr',
                      gap: '40px',
                      alignItems: 'center',
                    }}
                  >
                    {/* Visual Mock Column */}
                    <div
                      style={{
                        order: isEven ? 2 : 1,
                        background: '#070f1e',
                        borderRadius: '14px',
                        padding: '24px',
                        border: '1px solid #1a2a47',
                        color: '#ffffff',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                          <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '6px' }}>thenam / {product.id}</span>
                        </div>
                        <span style={{ fontSize: '9px', background: 'rgba(0, 201, 255, 0.15)', color: '#00c9ff', padding: '3px 8px', borderRadius: '12px' }}>
                          v2.4 Live
                        </span>
                      </div>

                      {/* Mock UI Preview Box */}
                      <div style={{ background: '#0b162b', borderRadius: '10px', padding: '16px', border: '1px solid #1c2e4d' }}>
                        {product.image_url && (
                          <div style={{
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #1c2e4d',
                            marginBottom: '14px',
                            maxHeight: '170px',
                            background: '#070f1e',
                          }}>
                            <img
                              src={product.image_url}
                              alt={product.image_alt || product.name}
                              style={{ width: '100%', height: 'auto', maxHeight: '170px', objectFit: 'cover', display: 'block' }}
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: product.iconBg, color: product.iconColor, display: 'grid', placeItems: 'center' }}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <strong style={{ display: 'block', fontSize: '14px' }}>{product.name}</strong>
                            <small style={{ color: '#94a3b8', fontSize: '10px' }}>{product.category}</small>
                          </div>
                        </div>

                        {/* Metric Highlights in Mockup */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
                          {product.metrics.map((m, i) => (
                            <div key={i} style={{ background: '#070f1e', border: '1px solid #1a2a47', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                              <span style={{ display: 'block', fontSize: '8px', color: '#64748b', textTransform: 'uppercase' }}>{m.label}</span>
                              <strong style={{ fontSize: '14px', color: '#9ee535' }}>{m.val}</strong>
                            </div>
                          ))}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '10px', fontSize: '11px', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>Enterprise Encryption Enabled</span>
                          <span style={{ color: '#10b981' }}>● Optimal SLA</span>
                        </div>
                      </div>
                    </div>

                    {/* Copy Column */}
                    <div style={{ order: isEven ? 1 : 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          color: '#0284c7',
                          background: '#e0f2fe',
                          padding: '4px 10px',
                          borderRadius: '20px',
                        }}>
                          {product.badge}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {product.tags.map((t, idx) => (
                            <span key={idx} className="tag-pill">{t}</span>
                          ))}
                        </div>
                      </div>

                      <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
                        {product.name}
                      </h2>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#0284c7', margin: '0 0 14px' }}>
                        {product.tagline}
                      </p>
                      <p style={{ fontSize: '13.5px', lineHeight: '1.68', color: '#475569', margin: '0 0 20px' }}>
                        {product.description}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '26px' }}>
                        {product.features.map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                            <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Link href="/contact" className="quote-btn">
                          <span>Request Live Demo</span>
                          <ArrowRight size={14} />
                        </Link>
                        <Link href="/contact" className="explore-btn" style={{ background: '#0f172a' }}>
                          <span>Deploy for Your Team</span>
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            INCUBATION & INNOVATION LAB
            ======================================================== */}
        <section className="inner-pale-section">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
              <span className="section-eyebrow">WHAT&apos;S NEXT</span>
              <h2 className="section-title-large">
                From our <span className="accent-cyan-dark">R&amp;D</span>{' '}
                <span className="accent-lime-dark">workbench.</span>
              </h2>
              <p className="section-desc-light" style={{ margin: '12px auto 0' }}>
                We continuously experiment with emerging models, edge computing, and real-time automation to keep our clients ahead of technological shifts.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                <Zap size={22} style={{ color: '#0284c7', marginBottom: '12px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 8px' }}>Autonomous Agent Workflows</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  Multi-agent systems that research, synthesize, and execute end-to-end data tasks autonomously without manual guidance.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                <Cpu size={22} style={{ color: '#65a30d', marginBottom: '12px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 8px' }}>On-Device Edge Vision</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  Lightweight machine learning models running locally on mobile devices without relying on constant cloud connectivity.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
                <Layers size={22} style={{ color: '#0284c7', marginBottom: '12px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 8px' }}>Unified Webhooks Broker</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  High-throughput event streaming engine bridging Indian payment providers with global SaaS platforms.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CtaBanner />
      </main>

      <Footer />
    </>
  )
}
