'use client'

import { useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronDown,
  Cloud,
  Code2,
  Cpu,
  Database,
  Globe2,
  GraduationCap,
  HeartPulse,
  Landmark,
  Leaf,
  LineChart,
  Menu,
  MessageSquare,
  MoveUpRight,
  Network,
  PackageCheck,
  Palette,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TabletSmartphone,
  X,
  Zap,
} from 'lucide-react'

const services = [
  ['AI & Machine Learning', 'Turn complex data into intelligent decisions and personalized experiences.', BrainCircuit],
  ['Custom Software Development', 'Reliable digital products designed around the way your business works.', Code2],
  ['Web Application Development', 'Fast, accessible and conversion-focused web experiences that scale.', Globe2],
  ['Mobile App Development', 'Native-quality mobile experiences built for the moments that matter.', TabletSmartphone],
  ['Product Engineering', 'From first prototype to a resilient product your customers love.', Rocket],
  ['Business Automation', 'Remove repetitive work and give your teams more time to create value.', Zap],
  ['Cloud & DevOps', 'Secure, observable infrastructure that keeps your products moving.', Cloud],
  ['UI/UX Design', 'Clear, thoughtful interfaces that make sophisticated technology feel simple.', Palette],
  ['Data Analytics', 'See what is happening, understand why, and act with confidence.', LineChart],
  ['IoT Solutions', 'Connect devices, operations and real-time intelligence in one view.', Network],
  ['Enterprise Software', 'Bring critical workflows together with software built for your scale.', Landmark],
  ['Research & Development', 'Explore what is next through focused experimentation and rapid learning.', Search],
] as const

const solutions = [
  ['Healthcare', 'Make care more connected with secure workflows, patient platforms and actionable insights.', HeartPulse],
  ['Finance', 'Build trusted financial experiences with automation, analytics and intelligent risk tools.', BarChart3],
  ['Retail & E-commerce', 'Create seamless journeys from discovery to delivery with connected commerce.', ShoppingBag],
  ['Education', 'Help learners and institutions do more with engaging, accessible digital platforms.', GraduationCap],
  ['Agriculture', 'Bring data closer to the field with connected, practical tools for better decisions.', Leaf],
  ['Enterprise Operations', 'Give every team a clearer view of work, performance and opportunities to improve.', PackageCheck],
] as const

const projects = [
  { title: 'Pulse / Operations intelligence', category: 'Web apps', description: 'A demonstration command center for teams that need a faster view of their work.', tags: ['Next.js', 'Analytics'], tone: 'blue' },
  { title: 'Nexa / Connected commerce', category: 'Product design', description: 'A demonstration retail experience built around discovery, trust and effortless checkout.', tags: ['UX/UI', 'Commerce'], tone: 'green' },
  { title: 'Aster / Field insights', category: 'Data & AI', description: 'A demonstration data layer helping distributed teams turn signals into action.', tags: ['AI', 'IoT'], tone: 'navy' },
]

function Logo() {
  return <a href="#top" className="logo" aria-label="Thenam Software Solutions home"><img src="/thenam-logo.png" alt="Thenam Software Solutions leaf logo" /><span>THENAM<small>SOFTWARE SOLUTIONS</small></span></a>
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [filter, setFilter] = useState('All work')
  const [sent, setSent] = useState(false)
  const filteredProjects = filter === 'All work' ? projects : projects.filter((project) => project.category === filter)

  return (
    <main id="top">
      <div className="announcement"><Sparkles size={14} /> Building thoughtful technology for ambitious teams <a href="#contact">Talk to us <ArrowRight size={13} /></a></div>
      <header className="site-header"><div className="container nav-wrap"><Logo /><button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button><nav className={menuOpen ? 'nav open' : 'nav'}>{['Services', 'Solutions', 'Projects', 'Innovation Lab', 'About Us', 'Careers'].map((item) => <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMenuOpen(false)}>{item}</a>)}<a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Start a project <ArrowRight size={15} /></a></nav></div></header>

      <section className="hero"><div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow"><span /> Software, thoughtfully engineered</p><h1>Engineering <em>intelligent</em> digital solutions.</h1><p className="hero-lede">We help businesses innovate, automate, and grow through custom software development, AI-powered solutions, and modern digital experiences.</p><div className="hero-actions"><a className="button button-primary" href="#services">Explore our services <ArrowRight size={17} /></a><a className="button button-ghost" href="#contact">Start a project <MoveUpRight size={16} /></a></div><div className="trust-row"><div className="avatar-stack"><span>TS</span><span>AI</span><span>UX</span></div><p>One team for your<br /><strong>next big idea.</strong></p></div></div><div className="hero-visual"><div className="visual-ring ring-a" /><div className="visual-ring ring-b" /><div className="dashboard"><div className="dash-top"><span className="dots"><i /><i /><i /></span><span>thenam / pulse</span><span className="dash-status"><span /> Live</span></div><div className="dash-body"><div className="dash-title"><div><p>Good morning, team</p><h3>Work at a glance</h3></div><button><ChevronDown size={13} /> This month</button></div><div className="metric-row"><div><span>Active projects</span><strong>24</strong><small className="positive">+12.4% <ArrowRight size={11} /></small></div><div><span>Team velocity</span><strong>86%</strong><small className="positive">+8.2% <ArrowRight size={11} /></small></div></div><div className="chart-card"><div className="chart-heading"><span>Project momentum</span><small>Last 6 months</small></div><div className="fake-chart"><span className="chart-fill" /><svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-label="Rising project momentum chart"><path d="M0 80 C40 75 45 55 82 66 S130 38 168 52 S218 70 250 42 S286 48 310 28 S360 40 400 8" /></svg></div><div className="chart-labels"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div></div></div><div className="float-card ai-card"><span className="float-icon green"><BrainCircuit size={17} /></span><div><small>AI assistant</small><strong>Insight ready</strong></div><Check size={15} /></div><div className="float-card connected-card"><span className="pulse-dot" /><span>Systems connected</span><strong>12</strong></div></div></div></section>

      <section className="logo-strip"><div className="container logo-strip-inner"><span>We make complexity feel simple</span><div><b>ORBITAL</b><b>northstar</b><b>mosaic<span>+</span></b><b>arc<span>°</span></b><b>FIELDNOTE</b></div></div></section>

      <section className="section services" id="services"><div className="container"><div className="section-heading"><div><p className="eyebrow"><span /> What we do</p><h2>Technology that moves<br /><em>business forward.</em></h2></div><p>We bring strategy, design, engineering and intelligence together to build products that create a measurable difference.</p></div><div className="service-grid">{services.map(([title, description, Icon], index) => <article className="service-card" key={title}><div className="icon-box"><Icon /></div><span className="service-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p><a href="#contact">Learn more <ArrowRight size={14} /></a></article>)}</div></div></section>

      <section className="section solutions" id="solutions"><div className="container"><div className="section-heading centered"><p className="eyebrow"><span /> Built for your world</p><h2>Smart solutions for<br /><em>every industry.</em></h2><p>Deep curiosity about your business. Practical technology for the problems that matter most.</p></div><div className="solution-grid">{solutions.map(([title, description, Icon]) => <article className="solution-card" key={title}><Icon /><h3>{title}</h3><p>{description}</p><a href="#contact">Explore solution <ArrowRight size={14} /></a></article>)}</div></div></section>

      <section className="section projects" id="projects"><div className="container"><div className="section-heading"><div><p className="eyebrow"><span /> Selected work</p><h2>Ideas transformed into<br /><em>digital products.</em></h2></div><a className="text-link" href="#contact">Discuss your idea <ArrowRight size={15} /></a></div><div className="filter-row">{['All work', 'Web apps', 'Product design', 'Data & AI'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="project-grid">{filteredProjects.map((project) => <article className={`project-card ${project.tone}`} key={project.title}><div className="project-art"><div className="art-window"><div className="art-toolbar"><i /><i /><i /></div><div className="art-lines"><span /><span /><span /><span /></div><div className="art-orbit"><div /></div><div className="art-bars"><i /><i /><i /><i /><i /></div></div></div><div className="project-info"><span className="project-category">{project.category}</span><h3>{project.title}</h3><p>{project.description}</p><div className="tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></article>)}</div></div></section>

      <section className="about-band" id="about-us"><div className="container about-grid"><div><p className="eyebrow light"><span /> A little about us</p><h2>Good technology<br /><em>starts with listening.</em></h2></div><div><p>Thenam Software Solutions is a technology partner for organizations ready to do meaningful work differently. We combine human-centered design with disciplined engineering to turn bold ideas into useful, lasting products.</p><div className="about-points"><span><Check size={15} /> Curious by default</span><span><Check size={15} /> Clear in every step</span><span><Check size={15} /> Built to last</span></div><a className="button button-light" href="#contact">Meet Thenam <ArrowRight size={16} /></a></div></div></section>

      <section className="section contact" id="contact"><div className="container contact-grid"><div className="contact-copy"><p className="eyebrow"><span /> Let&apos;s work together</p><h2>Let&apos;s build something <em>great</em> together.</h2><p>Have a challenge in mind, a product to shape, or simply a question? We&apos;d love to hear from you.</p><div className="contact-details"><div><MessageSquare size={18} /><span><small>Email us</small><strong>hello@thenamsoftware.com</strong></span></div><div><Globe2 size={18} /><span><small>Working globally</small><strong>Remote-first, worldwide</strong></span></div></div></div><form className="contact-form" onSubmit={(event) => { event.preventDefault(); setSent(true) }}>{sent ? <div className="form-success"><span><Check /></span><h3>Thanks for reaching out.</h3><p>We&apos;ll be in touch soon to learn more about your project.</p><button type="button" onClick={() => setSent(false)}>Send another message</button></div> : <><div className="form-row"><label>Name<input required name="name" placeholder="Your name" /></label><label>Email<input required type="email" name="email" placeholder="you@company.com" /></label></div><div className="form-row"><label>Company<input name="company" placeholder="Your company" /></label><label>Service<select name="service" defaultValue=""><option value="" disabled>Select a service</option><option>Custom software</option><option>AI & Machine Learning</option><option>Product design</option><option>Something else</option></select></label></div><label>Tell us about your project<textarea required name="message" placeholder="A little about what you&apos;re building..." rows={4} /></label><button className="button button-primary" type="submit">Send inquiry <ArrowRight size={16} /></button><small className="form-note">We&apos;ll only use your details to respond to your inquiry.</small></>}</form></div></section>

      <footer className="footer"><div className="container footer-top"><div><Logo /><p>Thoughtful technology for<br />ambitious teams.</p></div><div className="footer-links"><div><strong>Explore</strong><a href="#services">Services</a><a href="#solutions">Solutions</a><a href="#projects">Projects</a></div><div><strong>Company</strong><a href="#about-us">About us</a><a href="#contact">Careers</a><a href="#contact">Contact</a></div><div><strong>Connect</strong><a href="#contact">LinkedIn</a><a href="#contact">Instagram</a><a href="#contact">Email us</a></div></div></div><div className="container footer-bottom"><span>© 2026 Thenam Software Solutions. All rights reserved.</span><span>Privacy policy&nbsp;&nbsp; · &nbsp;&nbsp;Terms</span></div></footer>
    </main>
  )
}
