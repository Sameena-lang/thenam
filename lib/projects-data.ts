export interface ProjectDetail {
  slug: string
  titleFirst: string
  titleSecond: string
  subtitle: string
  categoryEyebrow: string
  domain: string
  visitUrl: string
  category: string
  year: string
  practice: string
  phase: string
  mockupImage: string
  shortDesc: string
  tag: string
  tagType: string
  thumbnail: string
}

export const PROJECTS: Record<string, ProjectDetail> = {
  'swekas-luxe': {
    slug: 'swekas-luxe',
    titleFirst: 'Swekas',
    titleSecond: 'Luxe',
    subtitle: 'Organic Rituals — Premium Ayurvedic Skincare & Haircare',
    categoryEyebrow: 'E-COMMERCE / BRANDING',
    domain: 'https://swekasluxe.com',
    visitUrl: 'https://swekasluxe.com',
    category: 'E-commerce',
    year: '2026',
    practice: 'Next.js',
    phase: 'Shipped',
    mockupImage: '/projects/swekas-inner.png',
    shortDesc: 'Premium D2C luxury Ayurvedic skincare & haircare storefront.',
    tag: 'E-Commerce',
    tagType: 'E-commerce',
    thumbnail: '/projects/thumb-swekas.png',
  },
  'pink-fish': {
    slug: 'pink-fish',
    titleFirst: 'Pink',
    titleSecond: 'Fish',
    subtitle: 'Bold branding and modern digital storefront for a fresh seafood brand.',
    categoryEyebrow: 'BRANDING / D2C COMMERCE',
    domain: 'https://pinkfish.in',
    visitUrl: 'https://pinkfish.in',
    category: 'Branding',
    year: '2026',
    practice: 'Design & Web',
    phase: 'Shipped',
    mockupImage: '/projects/thumb-pinkfish.png',
    shortDesc: 'Bold branding for a fresh seafood brand.',
    tag: 'Branding',
    tagType: 'Branding',
    thumbnail: '/projects/thumb-pinkfish.png',
  },
  'magizh-mahal': {
    slug: 'magizh-mahal',
    titleFirst: 'Magizh',
    titleSecond: 'Mahal',
    subtitle: 'Wedding hall brand identity, booking portal & digital presence.',
    categoryEyebrow: 'BRANDING / DIGITAL PORTAL',
    domain: 'https://magizhmahal.com',
    visitUrl: 'https://magizhmahal.com',
    category: 'Branding',
    year: '2026',
    practice: 'Next.js & Cloud',
    phase: 'Shipped',
    mockupImage: '/projects/thumb-magizh.png',
    shortDesc: 'Wedding hall brand identity & digital presence.',
    tag: 'Branding',
    tagType: 'Branding',
    thumbnail: '/projects/thumb-magizh.png',
  },
  'chennai-tales': {
    slug: 'chennai-tales',
    titleFirst: 'Chennai',
    titleSecond: 'Tales',
    subtitle: 'Editorial brand and digital publication platform for stories & culture.',
    categoryEyebrow: 'EDITORIAL / BRANDING',
    domain: 'https://chennaitales.com',
    visitUrl: 'https://chennaitales.com',
    category: 'Editorial',
    year: '2026',
    practice: 'Digital Media',
    phase: 'Shipped',
    mockupImage: '/projects/thumb-chennai.png',
    shortDesc: 'Editorial brand for stories & culture.',
    tag: 'Branding',
    tagType: 'Branding',
    thumbnail: '/projects/thumb-chennai.png',
  },
  'business-automation': {
    slug: 'business-automation',
    titleFirst: 'Business',
    titleSecond: 'Automation',
    subtitle: 'Smart automation, custom CRM & ERP systems for modern businesses.',
    categoryEyebrow: 'SAAS / CUSTOM SOFTWARE',
    domain: 'https://pulse.thenam.com',
    visitUrl: 'https://pulse.thenam.com',
    category: 'SaaS / Web App',
    year: '2026',
    practice: 'Full Stack / AI',
    phase: 'Shipped',
    mockupImage: '/projects/thumb-bizmgmt.png',
    shortDesc: 'Smart solutions for modern businesses.',
    tag: 'SaaS / Web App',
    tagType: 'SaaS / Web App',
    thumbnail: '/projects/thumb-bizmgmt.png',
  },
}

export const ALL_PROJECTS = Object.values(PROJECTS)
