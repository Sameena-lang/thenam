import { NextResponse } from 'next/server'
import { recordPageView, recordAnalyticsEvent } from '@/lib/db'

function parseUserAgent(uaString: string | null): {
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  isBot: boolean
} {
  if (!uaString) {
    return { deviceType: 'desktop', browser: 'Unknown', os: 'Unknown', isBot: false }
  }

  const ua = uaString.toLowerCase()

  // Bot detection
  const isBot = /bot|crawler|spider|crawling|slurp|facebookexternalhit|whatsapp|preview|headless/i.test(ua)

  // Device detection
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop'
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet'
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = 'mobile'
  }

  // Browser detection
  let browser = 'Other'
  if (ua.includes('edg/')) {
    browser = 'Edge'
  } else if (ua.includes('chrome/') || ua.includes('crios/')) {
    browser = 'Chrome'
  } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
    browser = 'Safari'
  } else if (ua.includes('firefox/') || ua.includes('fxios/')) {
    browser = 'Firefox'
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera'
  }

  // OS detection
  let os = 'Other'
  if (ua.includes('windows')) {
    os = 'Windows'
  } else if (ua.includes('android')) {
    os = 'Android'
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS'
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    os = 'macOS'
  } else if (ua.includes('linux')) {
    os = 'Linux'
  }

  return { deviceType, browser, os, isBot }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const {
      type = 'pageview',
      visitorId,
      sessionId,
      path = '/',
      title,
      referrer,
      serviceId,
      productId,
      eventName,
      eventCategory,
      resourceId,
      resourceName,
    } = body

    if (!visitorId || typeof visitorId !== 'string') {
      return NextResponse.json({ error: 'visitorId is required' }, { status: 400 })
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    // Do not track admin paths or API paths
    const cleanPath = String(path).trim()
    if (cleanPath.startsWith('/admin') || cleanPath.startsWith('/api')) {
      return NextResponse.json({ ignored: true, reason: 'admin_path' })
    }

    // Inspect user agent
    const userAgent = request.headers.get('user-agent')
    const { deviceType, browser, os, isBot } = parseUserAgent(userAgent)

    // Ignore automated bots to protect data integrity
    if (isBot) {
      return NextResponse.json({ ignored: true, reason: 'bot_detected' })
    }

    // Sanitize referrer (strip any query parameters for privacy)
    let safeReferrer: string | null = null
    if (referrer && typeof referrer === 'string') {
      try {
        const refUrl = new URL(referrer)
        safeReferrer = `${refUrl.origin}${refUrl.pathname}`.slice(0, 200)
      } catch {
        safeReferrer = referrer.split('?')[0].slice(0, 200)
      }
    }

    if (type === 'pageview') {
      recordPageView({
        visitorId,
        sessionId,
        path: cleanPath,
        title: title ? String(title).slice(0, 180) : null,
        referrer: safeReferrer,
        serviceId: serviceId ? String(serviceId).slice(0, 64) : null,
        productId: productId ? String(productId).slice(0, 64) : null,
        deviceType,
        browser,
        os,
      })
    } else if (type === 'event') {
      if (!eventName || typeof eventName !== 'string') {
        return NextResponse.json({ error: 'eventName is required for event tracking' }, { status: 400 })
      }
      recordAnalyticsEvent({
        visitorId,
        sessionId,
        eventName: String(eventName).slice(0, 80),
        eventCategory: eventCategory ? String(eventCategory).slice(0, 60) : 'conversion',
        resourceId: resourceId ? String(resourceId).slice(0, 80) : null,
        resourceName: resourceName ? String(resourceName).slice(0, 120) : null,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Analytics tracking error:', err)
    return NextResponse.json({ error: 'Failed to record tracking' }, { status: 500 })
  }
}

