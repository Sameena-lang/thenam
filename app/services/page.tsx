'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CtaBanner from '@/components/CtaBanner'
import {
  Monitor,
  Cpu,
  Code2,
  Cog,
  Smartphone,
  Cloud,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const DEFAULT_SERVICE_CATEGORIES = [
  {
    id: 'web-development',
    icon: Monitor,
    colorClass: 'cyan',
    title: 'Web Development',
    subtitle: 'Modern, high-conversion websites and custom web applications.',
    imageUrl: '/services/media_1793177571454_be4ff352.jpg',
    imageAlt: 'Web Development - Thenam Software Solutions',
    description:
      'We engineer responsive, blazing-fast websites and web applications with Next.js, React, and Tailwind CSS. Built with clean code, SEO optimization, and intuitive UX.',
    features: [
      'Single Page & Landing Pages (Starting Rs.1,999*)',
      'Corporate & Business Portals',
      'E-Commerce & Payment Gateway Integration',
      'SEO-optimized, ultra-fast Lighthouse 95+ score',
      'Mobile-first responsive design for all devices',
    ],
  },
  {
    id: 'ai-machine-learning',
    icon: Cpu,
    colorClass: 'green',
    title: 'AI & Machine Learning',
    badge: 'High Impact',
    subtitle: 'Practical AI tools that automate work and deliver smart decisions.',
    imageUrl: '/services/media_1793177581773_ebe5ac2e.jpg',
    imageAlt: 'AI & Machine Learning - Thenam Software Solutions',
    description:
      'Turn state-of-the-art language models and computer vision into business productivity. We build conversational agents, predictive tools, and intelligent data pipelines.',
    features: [
      'Custom AI Assistants & Support Chatbots (Tamil & Multilingual)',
      'Document Processing & OCR Extraction',
      'Predictive Analytics & Customer Churn Modeling',
      'Fine-tuned LLM agents & RAG knowledge bases',
      'Seamless integration into your existing CRM/ERP',
    ],
  },
  {
    id: 'custom-software',
    icon: Code2,
    colorClass: 'blue',
    title: 'Custom Software Development',
    badge: 'Enterprise Grade',
    subtitle: 'Tailored software crafted around your specific operational workflows.',
    imageUrl: '/services/media_1793177606591_2777dffe.jpg',
    imageAlt: 'Custom Software Development - Thenam Software Solutions',
    description:
      'Eliminate repetitive spreadsheet chaos with secure, scalable custom software. We build internal business tools, client portals, and cloud-native SaaS systems.',
    features: [
      'Business Management & Operations Dashboards',
      'Customer Relationship Management (CRM) Systems',
      'Inventory & Supply Chain Tracking Portals',
      'Role-based Access Control (RBAC) & Enterprise Security',
      'RESTful & GraphQL API Architecture',
    ],
  },
  {
    id: 'business-automation',
    icon: Cog,
    colorClass: 'lime',
    title: 'Business Automation',
    badge: 'Save 20+ hrs/wk',
    subtitle: 'Connect your business tools and let workflows run automatically.',
    imageUrl: '/services/media_1793177731362_e9e3a465.jpg',
    imageAlt: 'Business Automation - Thenam Software Solutions',
    description:
      'Stop doing manual data entry. We design automated workflows connecting WhatsApp, email, payment systems, databases, and accounting software.',
    features: [
      'WhatsApp Business Automated Lead Capture & Booking',
      'Automated Invoicing, GST & Payment Reminders',
      'Multi-app Sync (Zapier, Make, Custom Webhooks)',
      'Database Sync & Automated Reporting Pipelines',
      'Zero-error validation & automated alerts',
    ],
  },
  {
    id: 'mobile-apps',
    icon: Smartphone,
    colorClass: 'cyan',
    title: 'Mobile App Development',
    badge: 'iOS & Android',
    subtitle: 'Cross-platform mobile apps with native speed and fluid animations.',
    imageUrl: '/services/media_1793177742676_42188474.jpg',
    imageAlt: 'Mobile App Development - Thenam Software Solutions',
    description:
      "Deliver your services directly to customers' pockets. We develop high-performance iOS and Android applications with React Native and modern native bridges.",
    features: [
      'Cross-Platform iOS & Android from a single codebase',
      'Offline-first architecture with local cache sync',
      'Push notifications & in-app engagement tools',
      'Secure biometric authentication (FaceID / Fingerprint)',
      'App Store & Play Store publication assistance',
    ],
  },
  {
    id: 'cloud-devops',
    icon: Cloud,
    colorClass: 'green',
    title: 'Cloud & DevOps Solutions',
    badge: '99.99% Uptime',
    subtitle: 'Secure, cost-optimized cloud infrastructure on AWS, GCP & Vercel.',
    imageUrl: '/services/cloud-devops.png',
    imageAlt: 'Cloud & DevOps Solutions - Thenam Software Solutions',
    description:
      'Ensure your digital products stay online, fast, and secure under peak traffic. We design automated CI/CD pipelines, containerized microservices, and managed backups.',
    features: [
      'Cloud Architecture on AWS, Google Cloud & Vercel',
      'Automated CI/CD Deployment Pipelines (GitHub Actions)',
      'Containerization with Docker & Kubernetes',
      'Database Optimization, Backups & Disaster Recovery',
      'Cloud Cost Optimization & Security Auditing',
    ],
  },
]

const ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; style?: React.CSSProperties; className?: string }>> = {
  Monitor,
  Cpu,
  Code2,
  Cog,
  Smartphone,
  Cloud,
}

interface ServiceCategoryItem {
  id: string
  icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties; className?: string }>
  colorClass: string
  title: string
  badge?: string
  subtitle: string
  description: string
  features: string[]
  imageUrl?: string | null
  imageAlt?: string | null
}

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState('web')
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryItem[]>(DEFAULT_SERVICE_CATEGORIES)

  // Fetch live services from database with fallback to default categories
  useEffect(() => {
    let isMounted = true
    fetch('/api/services')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load services')
        return res.json()
      })
      .then((data) => {
        if (isMounted && data.services && Array.isArray(data.services) && data.services.length > 0) {
          const mapped = data.services.map((s: {
            id: string
            icon_name?: string
            color_class?: string
            title: string
            badge?: string
            subtitle: string
            description: string
            features: string[]
            image_url?: string | null
            image_alt?: string | null
          }) => {
            const defaultMatch = DEFAULT_SERVICE_CATEGORIES.find((d) => d.id === s.id)
            return {
              id: s.id,
              icon: (s.icon_name && ICON_MAP[s.icon_name]) ? ICON_MAP[s.icon_name] : Monitor,
              colorClass: s.color_class || 'cyan',
              title: s.title,
              badge: s.badge,
              subtitle: s.subtitle,
              description: s.description,
              features: Array.isArray(s.features) ? s.features : [],
              imageUrl: s.image_url || defaultMatch?.imageUrl || null,
              imageAlt: s.image_alt || defaultMatch?.imageAlt || null,
            }
          })
          setServiceCategories(mapped)
        }
      })
      .catch((err) => {
        console.warn('Services live fetch error; using fallback:', err)
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
            SERVICES PAGE HERO
            ======================================================== */}
        <section className="inner-page-hero services-hero-with-bg" aria-label="Services Header">
          {/* Background image layers */}
          <div className="services-hero-bg-layer" aria-hidden="true">
            <div className="services-hero-bg-img" />
            <div className="services-hero-gradient-overlay" />
            <div className="services-hero-glow" />
          </div>

          <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            <div className="inner-hero-content">
              <span className="inner-hero-eyebrow">
                <Sparkles size={13} style={{ display: 'inline', marginRight: '6px' }} />
                OUR CAPABILITIES &amp; EXPERTISE
              </span>
              <h1 className="inner-hero-title">
                Services designed to <span className="accent-cyan">accelerate</span> your{' '}
                <span className="accent-lime">business growth.</span>
              </h1>
              <p className="inner-hero-desc">
                From high-speed websites starting at <strong>&#8377;1,999*</strong> to enterprise AI solutions and fullscale custom platforms, we engineer technology with precision and care.
              </p>
              <div className="hero-btn-row">
                <Link href="/contact" className="quote-btn">
                  <span>Get a Free Project Quote</span>
                  <ArrowRight size={15} />
                </Link>
                <a href="#services-list" className="explore-btn">
                  <span>Browse All Services</span>
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            DETAILED SERVICES LIST
            ======================================================== */}
        <section className="inner-white-section" id="services-list">
          <div className="container">
            <div className="section-head-split" style={{ marginBottom: '60px' }}>
              <div>
                <span className="section-eyebrow">SPECIALIZED DOMAINS</span>
                <h2 className="section-title-large">
                  Explore our <span className="accent-cyan-dark">core</span>{' '}
                  <span className="accent-lime-dark">offerings.</span>
                </h2>
              </div>
              <p className="section-desc-light" style={{ maxWidth: '440px' }}>
                Every solution is designed with scalability, data privacy, and measurable return on investment from day one.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '28px' }}>
              {serviceCategories.map((service) => {
                const Icon = service.icon
                return (
                  <article key={service.id} id={service.id} className="service-box-card" style={{ minHeight: '380px', padding: '32px 28px 28px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div className={`service-icon-wrap ${service.colorClass}`} style={{ margin: 0 }}>
                          <Icon size={24} />
                        </div>
                        {service.badge && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: service.badge?.includes('Rs.') || service.badge?.includes('\u20b9') ? '#ecfdf5' : '#f1f5f9',
                            color: service.badge?.includes('Rs.') || service.badge?.includes('\u20b9') ? '#059669' : '#0284c7',
                            border: '1px solid currentColor',
                          }}>
                            {service.badge}
                          </span>
                        )}
                      </div>

                      {service.imageUrl && (
                        <div className="service-card-media-wrap" style={{ height: '180px', marginBottom: '18px', borderRadius: '10px', overflow: 'hidden' }}>
                          <img
                            src={service.imageUrl}
                            alt={service.imageAlt || `${service.title} - Thenam Software Solutions`}
                            className="service-card-img"
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      <h3 className="service-card-title" style={{ fontSize: '20px', marginBottom: '6px' }}>{service.title}</h3>
                      <p style={{ fontSize: '13px', color: '#0284c7', fontWeight: '600', marginBottom: '12px' }}>{service.subtitle}</p>

                      <p className="service-card-desc" style={{ fontSize: '13px', lineHeight: '1.65', marginBottom: '20px' }}>{service.description}</p>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {service.features.map((feat, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                            <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="service-card-foot" style={{ marginTop: '28px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Customized for your needs</span>
                      <Link href="/contact" className="view-all-link" style={{ fontSize: '12.5px' }}>
                        <span>Request Quote</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <CtaBanner />
      </main>

      <Footer />
    </>
  )
}
