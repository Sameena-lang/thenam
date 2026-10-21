'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CtaBanner from '@/components/CtaBanner'
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  Zap,
  Laptop,
  GraduationCap,
  Heart,
} from 'lucide-react'

export default function CareersPage() {
  const [submitted, setSubmitted] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')

  const jobs = [
    {
      id: 'fullstack-engineer',
      title: 'Full Stack Next.js / TypeScript Engineer',
      department: 'Engineering',
      location: 'Chennai / Remote',
      type: 'Full-time',
      experience: '2 - 5 years',
      desc: 'Architect and ship customer-facing web apps, SaaS dashboards, and performant APIs using Next.js 16, React 19, TypeScript, and PostgreSQL.',
      skills: ['Next.js (App Router)', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    },
    {
      id: 'ai-ml-engineer',
      title: 'AI & Machine Learning Specialist',
      department: 'AI Labs',
      location: 'Chennai / Hybrid',
      type: 'Full-time',
      experience: '2 - 4 years',
      desc: 'Build custom LLM agents, multi-modal vision models, and RAG pipelines for our enterprise tools and AgriSmart agritech platform.',
      skills: ['Python', 'FastAPI', 'PyTorch / HuggingFace', 'Vector DBs (Pinecone/pgvector)', 'LangChain/LlamaIndex'],
    },
    {
      id: 'ui-ux-designer',
      title: 'Senior Product & UI/UX Designer',
      department: 'Product Design',
      location: 'Remote',
      type: 'Full-time',
      experience: '3 - 6 years',
      desc: 'Craft world-class visual design systems, micro-interactions, responsive mockups, and client design deliverables in Figma.',
      skills: ['Figma', 'Design Systems', 'Micro-animations', 'User Research', 'Prototyping'],
    },
    {
      id: 'frontend-intern',
      title: 'Frontend Developer Intern',
      department: 'Engineering',
      location: 'Chennai / Remote',
      type: 'Internship (3-6 Months)',
      experience: 'Fresher / College Students',
      desc: 'Get hands-on mentorship building modern web portals starting with our ₹1,999* web services and advancing to complex client dashboards.',
      skills: ['HTML5/CSS3', 'JavaScript/TypeScript', 'React Basics', 'Git / GitHub', 'Curiosity to learn'],
    },
  ]

  const perks = [
    {
      icon: Laptop,
      title: 'Remote-First Flexibility',
      desc: 'Work from our Chennai office or anywhere in India. We value output and deep work over seat time.',
    },
    {
      icon: Zap,
      title: 'Cutting-Edge Tooling',
      desc: 'Develop on modern tech stacks: Next.js 16, React 19, Turbopack, AI tooling, and high-spec hardware.',
    },
    {
      icon: GraduationCap,
      title: 'Continuous Learning Budget',
      desc: 'Annual allowances for tech courses, certifications, conferences, and reference materials.',
    },
    {
      icon: Heart,
      title: 'Health & Wellness',
      desc: 'Comprehensive health coverage, mental wellness days, and balanced sprint cadences.',
    },
  ]

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 8000)
  }

  return (
    <>
      <Header />

      <main>
        {/* ========================================================
            CAREERS HERO SECTION
            ======================================================== */}
        <section className="inner-page-hero" aria-label="Careers Header">
          <div className="hero-glow-cyan" aria-hidden="true" />
          <div className="container">
            <div className="inner-hero-content">
              <span className="inner-hero-eyebrow">
                <Sparkles size={13} style={{ display: 'inline', marginRight: '6px' }} />
                JOIN THENAM SOFTWARE SOLUTIONS
              </span>
              <h1 className="inner-hero-title">
                Build the future with a team that <span className="accent-cyan">values</span>{' '}
                <span className="accent-lime">craftsmanship.</span>
              </h1>
              <p className="inner-hero-desc">
                We are a group of passionate software engineers, product designers, and AI researchers based in Chennai. We build technology that solves practical problems and scales globally.
              </p>
              <div className="hero-btn-row">
                <a href="#open-roles" className="quote-btn">
                  <span>View Open Positions</span>
                  <ArrowRight size={15} />
                </a>
                <a href="#perks" className="explore-btn">
                  <span>Why Work at Thenam</span>
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            PERKS & CULTURE
            ======================================================== */}
        <section className="inner-white-section" id="perks">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px' }}>
              <span className="section-eyebrow">LIFE AT THENAM</span>
              <h2 className="section-title-large">
                A culture built for <span className="accent-cyan-dark">growth</span> and{' '}
                <span className="accent-lime-dark">excellence.</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {perks.map((p, i) => {
                const Icon = p.icon
                return (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '26px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
                      <Icon size={20} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>{p.title}</h3>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#64748b', margin: 0 }}>{p.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            OPEN ROLES
            ======================================================== */}
        <section className="inner-pale-section" id="open-roles">
          <div className="container">
            <div className="section-head-split" style={{ marginBottom: '45px' }}>
              <div>
                <span className="section-eyebrow">CURRENT VACANCIES</span>
                <h2 className="section-title-large">
                  Explore open <span className="accent-cyan-dark">opportunities.</span>
                </h2>
              </div>
              <p className="section-desc-light" style={{ maxWidth: '420px' }}>
                Don’t see your exact role? Reach out anyway at <strong style={{ color: '#0284c7' }}>careers@thenamsoft.com</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px' }}>
                          {job.department}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '800', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px' }}>
                          {job.type}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>{job.title}</h3>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {job.location}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {job.experience}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="quote-btn"
                      onClick={() => {
                        setSelectedRole(job.title)
                        document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      <span>Apply Now</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: '1.65' }}>{job.desc}</p>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #f8fafc', paddingTop: '14px' }}>
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="tag-pill" style={{ background: '#f8fafc' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            QUICK APPLICATION FORM
            ======================================================== */}
        <section className="inner-white-section" id="application-form">
          <div className="container" style={{ maxWidth: '750px' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <span className="section-eyebrow">DIRECT APPLICATION</span>
              <h2 className="section-title-large">Send your profile to Thenam.</h2>
              <p className="section-desc-light" style={{ margin: '8px auto 0' }}>
                We review every application personally and respond within 48 business hours.
              </p>
            </div>

            {submitted ? (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '36px', textAlign: 'center' }}>
                <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#065f46', margin: '0 0 6px' }}>Application Received!</h3>
                <p style={{ fontSize: '13.5px', color: '#047857', margin: 0 }}>
                  Thank you for applying. Our talent team will review your portfolio and reach out via email shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleApply}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '34px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                    Full Name *
                    <input required placeholder="Your full name" style={{ padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px' }} />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                    Email Address *
                    <input required type="email" placeholder="you@example.com" style={{ padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                    Phone / WhatsApp *
                    <input required placeholder="+91 98765 43210" style={{ padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px' }} />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                    Role Applying For *
                    <input required value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} placeholder="e.g. Full Stack Engineer" style={{ padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px' }} />
                  </label>
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                  LinkedIn / GitHub / Portfolio Link *
                  <input required placeholder="https://github.com/yourhandle or portfolio" style={{ padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px' }} />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                  Brief Note About Yourself &amp; Projects
                  <textarea rows={3} placeholder="Tell us about the most interesting thing you have built..." style={{ padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px', resize: 'vertical' }} />
                </label>

                <button type="submit" className="quote-btn" style={{ justifyContent: 'center', padding: '14px', fontSize: '13.5px' }}>
                  <span>Submit Application</span>
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </section>

        <CtaBanner />
      </main>

      <Footer />
    </>
  )
}
