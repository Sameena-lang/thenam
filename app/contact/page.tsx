'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CtaBanner from '@/components/CtaBanner'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Send,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  ShieldCheck,
  Zap,
  Globe,
  Bot,
  Code2,
  Workflow,
  Smartphone,
  Cloud,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export default function ContactPage() {
  const [selectedService, setSelectedService] = useState('web')
  const [selectedBudget, setSelectedBudget] = useState('starter')
  const [selectedTimeline, setSelectedTimeline] = useState('standard')
  const [needNda, setNeedNda] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Form inputs
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')

  const services = [
    {
      id: 'web',
      name: 'Web Development',
      badge: 'From ₹1,999*',
      icon: Globe,
      desc: 'High-speed landing pages, corporate portals & e-commerce.',
      timeline: '2 - 7 Days',
    },
    {
      id: 'ai',
      name: 'AI & Machine Learning',
      badge: 'High Impact',
      icon: Bot,
      desc: 'Custom chatbots, Tamil AI agents, RAG & automation.',
      timeline: '2 - 4 Weeks',
    },
    {
      id: 'software',
      name: 'Custom Software / ERP',
      badge: 'Tailored',
      icon: Code2,
      desc: 'Internal dashboards, client portals & operational platforms.',
      timeline: '3 - 6 Weeks',
    },
    {
      id: 'automation',
      name: 'Business Automation',
      badge: 'Productivity',
      icon: Workflow,
      desc: 'Eliminate manual repetitive steps, sync apps & APIs.',
      timeline: '1 - 3 Weeks',
    },
    {
      id: 'mobile',
      name: 'Mobile Apps (iOS/Android)',
      badge: 'Cross-platform',
      icon: Smartphone,
      desc: 'Sleek React Native & Flutter applications for mobile users.',
      timeline: '4 - 8 Weeks',
    },
    {
      id: 'cloud',
      name: 'Cloud & DevOps',
      badge: 'Scalability',
      icon: Cloud,
      desc: 'AWS / Vercel cloud setup, CI/CD pipelines & database tuning.',
      timeline: '1 - 2 Weeks',
    },
  ]

  const budgetTiers = [
    { id: 'starter', label: 'Starter (₹1,999 - ₹15k)' },
    { id: 'growth', label: 'Growth (₹15k - ₹50k)' },
    { id: 'scale', label: 'Scale (₹50k - ₹2L)' },
    { id: 'enterprise', label: 'Enterprise (₹2L+)' },
  ]

  const timelineOptions = [
    { id: 'urgent', label: '⚡ Urgent (< 2 Weeks)' },
    { id: 'standard', label: '⏱️ Standard (2 - 4 Weeks)' },
    { id: 'flexible', label: '🎯 Flexible / Phased' },
  ]

  const currentServiceObj = services.find((s) => s.id === selectedService) || services[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          company,
          serviceId: currentServiceObj.id,
          serviceName: currentServiceObj.name,
          budgetTier: budgetTiers.find((b) => b.id === selectedBudget)?.label || selectedBudget,
          timeline: timelineOptions.find((t) => t.id === selectedTimeline)?.label || selectedTimeline,
          message,
          needNda,
        }),
      })
    } catch (err) {
      console.error('Inquiry submission error:', err)
    }
  }

  const faqs = [
    {
      question: 'How does the ₹1,999* Website Development package work?',
      answer:
        'Our ₹1,999* package is engineered for local businesses, professionals, and early-stage startups that need a high-converting, professional web presence fast. It includes a responsive modern landing page, mobile optimization, contact form, Google Maps integration, and basic SEO. Delivered in 48 to 72 hours with guidance on domain and hosting setup.',
    },
    {
      question: 'What is your typical software development process?',
      answer:
        'We follow an agile, sprint-based approach: (1) Free Discovery & Architecture scope session, (2) Interactive UI/UX Figma prototypes for your approval, (3) Rapid milestone development with demo previews, (4) Automated testing, security checks & SEO audit, and (5) Seamless cloud deployment with complete handover and documentation.',
    },
    {
      question: 'Can you sign a Non-Disclosure Agreement (NDA) before we discuss details?',
      answer:
        'Yes, absolutely. We prioritize your privacy and intellectual property. Check the "NDA required" option on the form or request our mutual NDA draft, and we will sign it before our technical discovery call.',
    },
    {
      question: 'Can you build custom AI models in Indian languages like Tamil?',
      answer:
        'Yes! Our AI Labs team specifically specializes in Indian regional language models. Our proprietary ZaraBot architecture supports Tamil, Hindi, Telugu, and English conversational interfaces with custom voice synthesis and context grounding.',
    },
    {
      question: 'Do you provide post-launch support and ongoing maintenance?',
      answer:
        'All projects include 30 days of complimentary hypercare support post-deployment. Afterward, we offer flexible Monthly Retainers (AMC) covering cloud monitoring, security patches, speed optimization, and regular feature enhancements.',
    },
  ]

  return (
    <>
      <Header />

      <main>
        {/* ========================================================
            CONTACT PAGE HERO
            ======================================================== */}
        <section className="inner-page-hero" aria-label="Contact Header">
          <div className="hero-glow-cyan" aria-hidden="true" />
          <div className="container">
            <div className="inner-hero-content">
              <span className="inner-hero-eyebrow">
                <Sparkles size={13} style={{ display: 'inline', marginRight: '6px' }} />
                GET A FREE QUOTE · DIRECT CONTACT
              </span>
              <h1 className="inner-hero-title">
                Let&apos;s build your <span className="accent-cyan">next breakthrough</span>{' '}
                <span className="accent-lime">together.</span>
              </h1>
              <p className="inner-hero-desc">
                From high-speed websites starting at <strong>₹1,999*</strong> to enterprise AI solutions and full-scale custom platforms, our team in Chennai is ready to deliver.
              </p>

              {/* Trust highlights */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginTop: '12px',
                  fontSize: '12.5px',
                  color: '#cbd5e1',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} className="text-cyan" />
                  <span>Avg Response: &lt; 2 Hours</span>
                </div>
                <span style={{ color: '#334155' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} className="text-lime" />
                  <span>Free Consultation &amp; NDA</span>
                </div>
                <span style={{ color: '#334155' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} className="text-cyan" />
                  <span>Delivery from 48-72h</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            INTERACTIVE QUOTE ESTIMATOR & FORM SECTION
            ======================================================== */}
        <section className="inner-white-section" id="quote-form-section">
          <div className="container">
            <div className="section-head-split" style={{ marginBottom: '40px' }}>
              <div>
                <span className="section-eyebrow">PROJECT ESTIMATOR</span>
                <h2 className="section-title-large">Configure your project requirements.</h2>
              </div>
              <p className="section-desc-light">
                Select your service, timeline, and budget. We&apos;ll prepare a customized roadmap and transparent proposal.
              </p>
            </div>

            <div className="contact-layout-grid">
              {/* Left Column: Interactive Form */}
              <div className="contact-form-panel">
                {submitted ? (
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '16px',
                      padding: '42px 32px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: '#10b981',
                        color: '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        margin: '0 auto 18px',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#065f46', margin: '0 0 10px' }}>
                      Inquiry Received!
                    </h3>
                    <p style={{ fontSize: '15px', color: '#047857', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                      Thank you, <strong>{fullName || 'friend'}</strong>. Our tech lead will review your <strong>{currentServiceObj.name}</strong> request and send a tailored proposal to <strong>{email}</strong> within 2 hours.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <a
                        href={`https://wa.me/919876543210?text=Hi%20Thenam%20team,%20I%20just%20submitted%20a%20quote%20request%20for%20${encodeURIComponent(currentServiceObj.name)}.%20Looking%20forward%20to%20discussing!`}
                        target="_blank"
                        rel="noreferrer"
                        className="quote-btn"
                        style={{ display: 'inline-flex', padding: '12px 22px' }}
                      >
                        <MessageSquare size={16} />
                        <span>Chat Instantly on WhatsApp</span>
                      </a>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="explore-btn"
                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155' }}
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                    {/* Step 1: Service Category */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          1. Select Required Service *
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: '700' }}>
                          Selected: {currentServiceObj.name}
                        </span>
                      </div>

                      <div className="quote-selector-grid">
                        {services.map((srv) => {
                          const IconComp = srv.icon
                          const isSelected = selectedService === srv.id
                          return (
                            <button
                              type="button"
                              key={srv.id}
                              onClick={() => setSelectedService(srv.id)}
                              className={`service-selector-card ${isSelected ? 'active' : ''}`}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <IconComp size={16} color={isSelected ? '#00c9ff' : '#0284c7'} />
                                  <strong style={{ fontSize: '13px', color: isSelected ? '#0f172a' : '#1e293b' }}>
                                    {srv.name}
                                  </strong>
                                </div>
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    padding: '2px 7px',
                                    borderRadius: '12px',
                                    background: isSelected ? '#050b14' : '#e2e8f0',
                                    color: isSelected ? '#9ee535' : '#475569',
                                  }}
                                >
                                  {srv.badge}
                                </span>
                              </div>
                              <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                                {srv.desc}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Step 2: Budget Scope */}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        2. Approximate Budget
                      </span>
                      <div className="pills-group">
                        {budgetTiers.map((b) => (
                          <button
                            type="button"
                            key={b.id}
                            onClick={() => setSelectedBudget(b.id)}
                            className={`pill-option ${selectedBudget === b.id ? 'active' : ''}`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 3: Timeline */}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        3. Desired Timeline
                      </span>
                      <div className="pills-group">
                        {timelineOptions.map((t) => (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => setSelectedTimeline(t.id)}
                            className={`pill-option ${selectedTimeline === t.id ? 'active' : ''}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 4: Contact Details */}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                        4. Contact &amp; Project Info
                      </span>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                          Your Name *
                          <input
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Karthik Rajan"
                            style={{ padding: '11px 13px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', background: '#f8fafc' }}
                          />
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                          Email Address *
                          <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="karthik@example.com"
                            style={{ padding: '11px 13px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', background: '#f8fafc' }}
                          />
                        </label>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                          Phone / WhatsApp *
                          <input
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            style={{ padding: '11px 13px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', background: '#f8fafc' }}
                          />
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                          Company / Brand (Optional)
                          <input
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g. Sunrise Retail Pvt Ltd"
                            style={{ padding: '11px 13px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', background: '#f8fafc' }}
                          />
                        </label>
                      </div>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '16px' }}>
                        Tell us about what you want to build *
                        <textarea
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Describe your project goals, key features, reference websites, or specific business problems you need solved..."
                          style={{ padding: '11px 13px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', background: '#f8fafc', resize: 'vertical' }}
                        />
                      </label>

                      {/* NDA Checkbox */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#475569', cursor: 'pointer', marginBottom: '18px' }}>
                        <input
                          type="checkbox"
                          checked={needNda}
                          onChange={(e) => setNeedNda(e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: '#00c9ff' }}
                        />
                        <span>Please send a mutual Non-Disclosure Agreement (NDA) before our discovery call.</span>
                      </label>

                      <button
                        type="submit"
                        className="quote-btn"
                        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '14px' }}
                      >
                        <span>Request Custom Proposal &amp; Free Quote</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Column: Live Summary & Direct Reassurance */}
              <div className="quote-summary-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(0, 201, 255, 0.15)',
                      color: 'var(--cyan)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                      Proposal Summary
                    </h3>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Real-time estimation overview</span>
                  </div>
                </div>

                <div className="summary-spec-row">
                  <span className="summary-spec-label">Service</span>
                  <span className="summary-spec-val accent">{currentServiceObj.name}</span>
                </div>

                <div className="summary-spec-row">
                  <span className="summary-spec-label">Package Category</span>
                  <span className="summary-spec-val">{currentServiceObj.badge}</span>
                </div>

                <div className="summary-spec-row">
                  <span className="summary-spec-label">Baseline Timeline</span>
                  <span className="summary-spec-val">{currentServiceObj.timeline}</span>
                </div>

                <div className="summary-spec-row">
                  <span className="summary-spec-label">Selected Budget</span>
                  <span className="summary-spec-val">
                    {budgetTiers.find((b) => b.id === selectedBudget)?.label}
                  </span>
                </div>

                <div className="summary-spec-row">
                  <span className="summary-spec-label">NDA Security</span>
                  <span className="summary-spec-val" style={{ color: needNda ? '#9ee535' : '#94a3b8' }}>
                    {needNda ? '✓ NDA Requested' : 'Standard Confidentiality'}
                  </span>
                </div>

                {/* What's included free */}
                <div style={{ marginTop: '24px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '16px', border: '1px solid #142136' }}>
                  <strong style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Every Proposal Includes:
                  </strong>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={13} className="text-lime" />
                      <span>Free 30-min technical architecture call</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={13} className="text-lime" />
                      <span>Fixed-price quote &amp; zero hidden fees</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={13} className="text-lime" />
                      <span>Milestone-based payment schedule</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={13} className="text-lime" />
                      <span>30 days post-launch hypercare included</span>
                    </li>
                  </ul>
                </div>

                {/* Direct quick call card */}
                <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid #142136' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                    Need an immediate conversation?
                  </span>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'rgba(158, 229, 53, 0.1)',
                      border: '1px solid rgba(158, 229, 53, 0.3)',
                      color: '#9ee535',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                    }}
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp: +91 98765 43210</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            DIRECT CHANNELS & CHENNAI HQ
            ======================================================== */}
        <section className="inner-pale-section" aria-label="Direct contact methods">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '46px' }}>
              <span className="section-eyebrow">COMMUNICATION CHANNELS</span>
              <h2 className="section-title-large">Direct lines to our engineering team.</h2>
              <p className="section-desc-light" style={{ margin: '8px auto 0' }}>
                Reach us anytime via email, phone, or meet us at our Chennai software development office.
              </p>
            </div>

            <div className="contact-channels-grid">
              {/* Office */}
              <div className="contact-channel-card">
                <div className="contact-icon-box">
                  <MapPin size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                  Chennai Headquarters
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Thenam Software Solutions<br />
                  Chennai, Tamil Nadu, India<br />
                  OMR IT Highway Corridor
                </p>
                <div style={{ marginTop: 'auto', fontSize: '12px', fontWeight: '700', color: '#0284c7' }}>
                  Mon – Sat: 9:00 AM – 7:00 PM IST
                </div>
              </div>

              {/* Email */}
              <div className="contact-channel-card">
                <div className="contact-icon-box lime">
                  <Mail size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                  Email Support
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Inquiries &amp; New Projects:<br />
                  <a href="mailto:hello@thenamsoft.com" style={{ color: '#0f172a', fontWeight: '700', textDecoration: 'underline' }}>
                    hello@thenamsoft.com
                  </a>
                  <br />
                  Technical Escalations: <span style={{ color: '#334155' }}>projects@thenamsoft.com</span>
                </p>
                <div style={{ marginTop: 'auto', fontSize: '12px', fontWeight: '700', color: '#65a30d' }}>
                  Typical response time: under 2 hours
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="contact-channel-card">
                <div className="contact-icon-box purple">
                  <Phone size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                  Phone &amp; WhatsApp
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Direct voice consultation:<br />
                  <a href="tel:+919876543210" style={{ color: '#0f172a', fontWeight: '700' }}>
                    +91 98765 43210
                  </a>
                  <br />
                  WhatsApp business account available 24/7 for urgent client requests.
                </p>
                <div style={{ marginTop: 'auto', fontSize: '12px', fontWeight: '700', color: '#9333ea' }}>
                  Tamil &amp; English bilingual support
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            FREQUENTLY ASKED QUESTIONS (FAQ)
            ======================================================== */}
        <section className="inner-white-section" aria-label="Frequently Asked Questions">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '46px' }}>
              <span className="section-eyebrow">COMMON INQUIRIES</span>
              <h2 className="section-title-large">Frequently Asked Questions</h2>
              <p className="section-desc-light" style={{ margin: '8px auto 0' }}>
                Everything you need to know about starting your project with Thenam.
              </p>
            </div>

            <div className="faq-accordion-list">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div key={index} className={`faq-card ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-trigger"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-cyan" />
                      ) : (
                        <ChevronDown size={18} color="#94a3b8" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="faq-answer">
                        <p style={{ margin: 0 }}>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <CtaBanner />
      </main>

      <Footer />
    </>
  )
}
