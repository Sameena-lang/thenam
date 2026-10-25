'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users2,
  Rocket,
  Cpu,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  GitBranch,
  ShieldCheck,
  MessageSquare,
  ExternalLink,
  Code2,
  Workflow,
  Handshake,
  Clock,
  Briefcase,
  Share2,
} from 'lucide-react'

export default function CollaborationSection() {
  const [activeTab, setActiveTab] = useState<'all' | 'startup' | 'augmentation' | 'enterprise' | 'academic'>('all')

  const models = [
    {
      id: 'startup',
      tabKey: 'startup',
      badge: '0-to-1 Product Launch',
      badgeColor: '#00c9f2',
      badgeBg: 'rgba(0, 201, 242, 0.12)',
      icon: Rocket,
      title: 'Startup Co-Creation & MVP Launchpad',
      subtitle: 'For visionary founders & ambitious early-stage ventures',
      desc: 'We partner closely with early-stage founders to architect, design, and ship production-ready web and mobile products. From rapid prototyping to investor-ready demos, we turn napkins into scalable applications with lightning agility.',
      points: [
        'Starting tier at ₹1,999* for accessible web storefronts & brand launchpads',
        'Rapid 2-to-4 week agile sprints from initial wireframe to production deployment',
        '100% intellectual property & clean Git repository ownership transferred to you',
        'Direct founder-to-lead-engineer collaboration with weekly live milestone demos',
      ],
      techStack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Vercel'],
      ctaText: 'Initiate Startup Collaboration',
      ctaHref: '/contact?type=startup-co-creation',
    },
    {
      id: 'augmentation',
      tabKey: 'augmentation',
      badge: 'Scale-Ups & Tech Teams',
      badgeColor: '#9ee535',
      badgeBg: 'rgba(158, 229, 53, 0.12)',
      icon: Users2,
      title: 'Dedicated Engineering Pods & Team Augmentation',
      subtitle: 'For tech leads & scale-ups needing senior engineering capacity',
      desc: 'Seamlessly augment your internal tech squads with high-caliber full-stack, frontend, and backend engineers. We embed directly into your agile rituals, pull request reviews, and sprint cadences with zero onboarding friction.',
      points: [
        'Senior Next.js, React, TypeScript, Python, and cloud infrastructure specialists',
        'Direct integration into your Slack, Linear, Jira, and GitHub repositories',
        'Synchronous timezone alignment across IST, GMT, EST, and PST work hours',
        'Flexible month-to-month commitment with zero recruitment overhead or lock-in',
      ],
      techStack: ['React 19', 'Python / FastAPI', 'Node.js', 'Docker', 'AWS / GCP'],
      ctaText: 'Explore Team Augmentation',
      ctaHref: '/contact?type=team-augmentation',
    },
    {
      id: 'enterprise',
      tabKey: 'enterprise',
      badge: 'Ecosystem & Enterprise',
      badgeColor: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.12)',
      icon: Cpu,
      title: 'Strategic Cloud, AI & Tech Alliances',
      subtitle: 'For enterprises seeking digital modernization & AI adoption',
      desc: 'We collaborate with enterprises and technology providers to deploy high-availability cloud systems, custom LLM agents, and business automation pipelines with enterprise-grade reliability and security compliance.',
      points: [
        'Custom Tamil AI language models, RAG vector pipelines, and intelligent chatbots',
        'Multi-cloud architecture (AWS, Vercel, Supabase) with automated CI/CD pipelines',
        'Secure payment gateway orchestration (Razorpay, Stripe) with PCI-DSS compliance',
        'Enterprise SLA guarantees, 24/7 telemetry monitoring, and 99.9% uptime targets',
      ],
      techStack: ['OpenAI / LangChain', 'Supabase', 'AWS ECS/Lambda', 'PostgreSQL', 'Redis'],
      ctaText: 'Partner on Cloud & AI',
      ctaHref: '/contact?type=enterprise-alliance',
    },
    {
      id: 'academic',
      tabKey: 'academic',
      badge: 'R&D & Community',
      badgeColor: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      icon: GraduationCap,
      title: 'Academic, Open-Source & Innovation Labs',
      subtitle: 'For universities, research scholars & community incubators',
      desc: 'We actively collaborate with engineering institutions, research labs, and open-source communities across Tamil Nadu and globally to pioneer emerging innovations in regional AI, AgriTech telemetry, and student mentorship.',
      points: [
        'AgriSmart IoT telemetry co-development for regional smart agriculture sensors',
        'Student engineering incubation, production internships, and hackathon sponsorships',
        'Open-source Tamil NLP linguistic datasets, benchmarking, and developer toolkits',
        'Joint research whitepapers and collaborative university technology masterclasses',
      ],
      techStack: ['IoT / MicroPython', 'PyTorch', 'Tamil NLP', 'MQTT', 'Next.js'],
      ctaText: 'Connect for Academic R&D',
      ctaHref: '/contact?type=academic-rd',
    },
  ]

  const filteredModels = activeTab === 'all' ? models : models.filter((m) => m.tabKey === activeTab)

  const clientCollaborations = [
    {
      slug: 'swekas-luxe',
      name: 'Swekas Luxe',
      domain: 'Luxury & Fashion Retail',
      logo: '/marquee-logos/swekas-luxe.png',
      collaborationNote:
        'Co-created a bespoke luxury e-commerce web platform with responsive visual merchandising, high-speed product filters, and friction-free checkout.',
      metrics: '3.4x Conversion Increase · Sub-second page loads',
    },
    {
      slug: 'pink-fish',
      name: 'Pink Fish',
      domain: 'Apparel & Lifestyle Brand',
      logo: '/marquee-logos/pink-fish.png',
      collaborationNote:
        'Engineered an ultra-fast mobile-first lifestyle retail experience with real-time stock availability, dynamic cart drawer, and interactive lookbooks.',
      metrics: '70% Mobile Traffic Optimization · 99.9% Uptime',
    },
    {
      slug: 'magizh-mahal',
      name: 'Magizh Mahal',
      domain: 'Hospitality & Event Venues',
      logo: '/marquee-logos/magizh-mahal.png',
      collaborationNote:
        'Collaborated on a real-time event booking and hall availability management portal with interactive visual walkthroughs and client lead routing.',
      metrics: '100% Automated Inquiries · Real-time Calendar Sync',
    },
    {
      slug: 'chennai-tales',
      name: 'Chennai Tales',
      domain: 'Digital Publishing & Media',
      logo: '/marquee-logos/chennai-tales.png',
      collaborationNote:
        'Architected a multi-format digital storytelling editorial portal, cultural archives, and high-speed bilingual content engine.',
      metrics: '50K+ Monthly Readers · 100/100 Core Web Vitals',
    },
  ]

  const workflowSteps = [
    {
      step: '01',
      title: 'Discovery & Strategic Alignment',
      desc: 'We conduct collaborative roadmap sessions to map technical architecture, user personas, milestone sprints, and core business KPIs.',
      icon: MessageSquare,
    },
    {
      step: '02',
      title: 'Real-Time Agile Co-Creation',
      desc: 'Shared Slack channels, weekly sprint demos, direct developer access, and transparent Linear/GitHub boards keep everyone aligned.',
      icon: GitBranch,
    },
    {
      step: '03',
      title: 'Automated Previews & QA Gateways',
      desc: 'Every code commit generates live preview links. Comprehensive automated tests and peer reviews ensure zero regressions.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'Production Handshake & Scaling',
      desc: 'Turnkey cloud deployment, 100% intellectual property transfer, complete documentation, and dedicated post-launch SLA support.',
      icon: Rocket,
    },
  ]

  const ecosystemTools = [
    { name: 'GitHub', category: 'Version Control' },
    { name: 'Next.js 16', category: 'Web Framework' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Python', category: 'AI & Backend' },
    { name: 'AWS & Vercel', category: 'Cloud Infrastructure' },
    { name: 'PostgreSQL', category: 'Relational Database' },
    { name: 'Docker', category: 'Containerization' },
    { name: 'OpenAI / Claude', category: 'LLM Orchestration' },
    { name: 'Figma', category: 'Product Design' },
    { name: 'Slack & Linear', category: 'Agile Collaboration' },
  ]

  return (
    <section
      id="collaboration"
      className="collab-section"
      aria-label="Collaboration and Partnerships"
      style={{
        background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(0, 201, 242, 0.08) 0%, rgba(3, 10, 22, 1) 75%)',
        backgroundColor: '#030a16',
        color: '#ffffff',
        padding: '95px 0 105px',
        borderTop: '1px solid #14243b',
        borderBottom: '1px solid #14243b',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-120px',
          left: '15%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 201, 242, 0.14) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(60px)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-100px',
          right: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(158, 229, 53, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(70px)',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* ========================================================
            HEADER
            ======================================================== */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 50px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(0, 201, 242, 0.1)',
              border: '1px solid rgba(0, 201, 242, 0.28)',
              color: '#00c9f2',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <Handshake size={14} style={{ color: '#00c9f2' }} />
            <span>STRATEGIC COLLABORATION &amp; PARTNERSHIPS</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(30px, 3.8vw, 46px)',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              lineHeight: '1.18',
              margin: '0 0 18px',
            }}
          >
            Built for <span className="accent-cyan">synergy</span>, structured for{' '}
            <span className="accent-lime">scale.</span>
          </h2>

          <p
            style={{
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#94a3b8',
              margin: 0,
            }}
          >
            We don’t believe in one-size-fits-all contracts. At Thenam Software Solutions, we partner across transparent, agile collaboration frameworks tailored to early-stage founders, scaling tech teams, enterprise innovators, and research ecosystems.
          </p>
        </div>

        {/* ========================================================
            FILTER PILLS / TAB NAVIGATION
            ======================================================== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '42px',
          }}
        >
          {[
            { key: 'all', label: 'All Collaboration Models' },
            { key: 'startup', label: 'Startup Co-Creation' },
            { key: 'augmentation', label: 'Team Augmentation' },
            { key: 'enterprise', label: 'Cloud & AI Alliances' },
            { key: 'academic', label: 'Academic & R&D' },
          ].map((tab) => {
            const isSelected = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  border: isSelected ? '1px solid #00c9f2' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(0, 201, 242, 0.22) 0%, rgba(158, 229, 53, 0.14) 100%)'
                    : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 16px rgba(0, 201, 242, 0.25)' : 'none',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ========================================================
            COLLABORATION MODELS GRID
            ======================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '70px',
          }}
        >
          {filteredModels.map((model) => {
            const Icon = model.icon
            return (
              <div
                key={model.id}
                style={{
                  background: 'linear-gradient(180deg, rgba(10, 25, 48, 0.75) 0%, rgba(5, 14, 28, 0.95) 100%)',
                  border: '1px solid rgba(28, 54, 92, 0.8)',
                  borderRadius: '18px',
                  padding: '32px 28px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'rgba(0, 201, 242, 0.5)'
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.55), 0 0 30px rgba(0, 201, 242, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(28, 54, 92, 0.8)'
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.4)'
                }}
              >
                {/* Top Badge & Icon */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: model.badgeBg,
                        border: `1px solid ${model.badgeColor}40`,
                        color: model.badgeColor,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Icon size={24} />
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: model.badgeColor,
                        background: model.badgeBg,
                        border: `1px solid ${model.badgeColor}35`,
                        padding: '4px 10px',
                        borderRadius: '999px',
                      }}
                    >
                      {model.badge}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#ffffff',
                      margin: '0 0 6px',
                      letterSpacing: '-0.02em',
                      lineHeight: '1.3',
                    }}
                  >
                    {model.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '12.5px',
                      fontWeight: '600',
                      color: '#38bdf8',
                      marginBottom: '14px',
                    }}
                  >
                    {model.subtitle}
                  </p>

                  <p
                    style={{
                      fontSize: '13.5px',
                      lineHeight: '1.68',
                      color: '#cbd5e1',
                      marginBottom: '20px',
                    }}
                  >
                    {model.desc}
                  </p>

                  {/* Key Highlights list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {model.points.map((pt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '12.5px', color: '#e2e8f0', lineHeight: '1.5' }}>
                        <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack & CTA */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '20px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '14px',
                    }}
                  >
                    {model.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '10.5px',
                          fontWeight: '700',
                          color: '#94a3b8',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={model.ctaHref}
                    className="explore-btn"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '11px 18px',
                      fontSize: '13px',
                      background: 'rgba(0, 201, 242, 0.08)',
                      borderColor: 'rgba(0, 201, 242, 0.35)',
                      color: '#ffffff',
                    }}
                  >
                    <span>{model.ctaText}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* ========================================================
            FEATURED CLIENT COLLABORATIONS (WITH LOGOS & CASE STUDIES)
            ======================================================== */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(6, 17, 34, 0.9) 0%, rgba(4, 11, 22, 0.95) 100%)',
            border: '1px solid rgba(24, 48, 82, 0.85)',
            borderRadius: '22px',
            padding: '42px 36px',
            marginBottom: '75px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: '800',
                color: '#9ee535',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              PROVEN COLLABORATIVE IMPACT
            </span>
            <h3
              style={{
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: '800',
                color: '#ffffff',
                letterSpacing: '-0.02em',
                margin: '0 0 10px',
              }}
            >
              Real brands built through <span className="accent-cyan">close co-engineering.</span>
            </h3>
            <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: 0, lineHeight: '1.6' }}>
              Explore how our collaborative delivery model produced measurable business milestones for these growing businesses:
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            {clientCollaborations.map((collab) => (
              <div
                key={collab.slug}
                style={{
                  background: 'rgba(8, 20, 38, 0.8)',
                  border: '1px solid rgba(30, 58, 98, 0.7)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 201, 242, 0.55)'
                  e.currentTarget.style.background = 'rgba(12, 28, 52, 0.95)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(30, 58, 98, 0.7)'
                  e.currentTarget.style.background = 'rgba(8, 20, 38, 0.8)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div>
                  {/* Logo Container */}
                  <div
                    style={{
                      height: '62px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(3, 9, 18, 0.65)',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      marginBottom: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <img
                      src={collab.logo}
                      alt={`${collab.name} logo`}
                      style={{
                        maxHeight: '44px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>{collab.name}</h4>
                    <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '700', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 7px', borderRadius: '4px' }}>
                      {collab.domain}
                    </span>
                  </div>

                  <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 14px' }}>
                    {collab.collaborationNote}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#9ee535',
                      marginBottom: '14px',
                      background: 'rgba(158, 229, 53, 0.08)',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(158, 229, 53, 0.18)',
                    }}
                  >
                    {collab.metrics}
                  </div>

                  <Link
                    href={`/projects/${collab.slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#00c9f2',
                      textDecoration: 'none',
                      transition: 'gap 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.gap = '9px')}
                    onMouseLeave={(e) => (e.currentTarget.style.gap = '6px')}
                  >
                    <span>View Project Case Study</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            THE 4-STEP COLLABORATIVE WORKFLOW
            ======================================================== */}
        <div style={{ marginBottom: '70px' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: '800',
                color: '#00c9f2',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              SEAMLESS SYNERGY
            </span>
            <h3
              style={{
                fontSize: 'clamp(24px, 3.2vw, 36px)',
                fontWeight: '800',
                color: '#ffffff',
                letterSpacing: '-0.02em',
                margin: '0 0 10px',
              }}
            >
              How we <span className="accent-lime">work together</span> from Day 1.
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: '1.6' }}>
              Radical transparency, no hidden barriers, and direct communication at every step.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
            }}
          >
            {workflowSteps.map((ws, i) => {
              const StepIcon = ws.icon
              return (
                <div
                  key={i}
                  style={{
                    background: 'rgba(8, 20, 38, 0.7)',
                    border: '1px solid rgba(26, 48, 80, 0.8)',
                    borderRadius: '16px',
                    padding: '28px 22px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '28px',
                        fontWeight: '900',
                        color: i % 2 === 0 ? 'rgba(0, 201, 242, 0.65)' : 'rgba(158, 229, 53, 0.65)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {ws.step}
                    </span>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'grid',
                        placeItems: 'center',
                        color: i % 2 === 0 ? '#00c9f2' : '#9ee535',
                      }}
                    >
                      <StepIcon size={18} />
                    </div>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px' }}>{ws.title}</h4>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.65', margin: 0 }}>{ws.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ========================================================
            COLLABORATION ECOSYSTEM MARQUEE / TOOLING PILLS
            ======================================================== */}
        <div
          style={{
            background: 'rgba(5, 14, 28, 0.8)',
            border: '1px solid rgba(22, 44, 76, 0.7)',
            borderRadius: '16px',
            padding: '24px 30px',
            marginBottom: '65px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Workflow size={20} style={{ color: '#00c9f2' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '13.5px', color: '#ffffff' }}>
                Collaborative Tech Stack &amp; Tooling
              </strong>
              <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                We plug seamlessly into industry-standard tooling &amp; cloud ecosystems
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ecosystemTools.map((t, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11.5px',
                  fontWeight: '600',
                  color: '#cbd5e1',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  padding: '5px 11px',
                  borderRadius: '6px',
                }}
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>

        {/* ========================================================
            ACTION CTA BOX — "START A COLLABORATION"
            ======================================================== */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(8, 28, 56, 0.95) 0%, rgba(14, 38, 22, 0.85) 100%)',
            border: '1px solid rgba(0, 201, 242, 0.4)',
            borderRadius: '20px',
            padding: '38px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 201, 242, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div style={{ maxWidth: '620px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '800',
                color: '#9ee535',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              LET’S CREATE TOGETHER
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Have an ambitious project or partnership in mind?
            </h3>
            <p style={{ fontSize: '13.5px', color: '#cbd5e1', margin: 0, lineHeight: '1.6' }}>
              Whether you need to augment your engineering pods, co-build a greenfield MVP, or collaborate on regional AI R&amp;D, our leadership team is ready to connect.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/contact?topic=collaboration"
              className="quote-btn"
              style={{ padding: '12px 22px', fontSize: '13.5px' }}
            >
              <span>Initiate Collaboration</span>
              <ArrowRight size={15} />
            </Link>

            <a
              href="mailto:hello@thenamsoft.com?subject=Collaboration%20Inquiry%20-%20Thenam"
              className="explore-btn"
              style={{ padding: '12px 20px', fontSize: '13px' }}
            >
              <span>Email Leadership</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
