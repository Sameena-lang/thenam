import { NextResponse } from 'next/server'
import { getAllSiteSettings } from '@/lib/db'

export async function GET() {
  try {
    const settings = getAllSiteSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch site settings',
        settings: {
          homepage_hero_bg: '/hero-bg.png',
          homepage_hero_alt: 'THENAM Software Solutions Hero Background',
          service_img_web_development: '/services/web-development.jpg',
          service_img_ai_machine_learning: '/services/ai-machine-learning.jpg',
          service_img_custom_software: '/services/custom-software.jpg',
          service_img_business_automation: '/services/business-automation.jpg',
          product_img_agrismart: '/projects/featured-agrismart-hq.png',
          product_img_zarabot: '/projects/featured-zarabot-hq.png',
          product_img_commerceflow: '/projects/featured-ecommerce-hq.png',
          product_img_pulse_core: '/projects/featured-bizmgmt-hq.png',
        },
      },
      { status: 500 }
    )
  }
}
