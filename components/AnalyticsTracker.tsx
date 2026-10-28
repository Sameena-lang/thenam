'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const STORAGE_KEY_VID = 'thenam_vid'
const STORAGE_KEY_SID = 'thenam_sid'

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let vid = localStorage.getItem(STORAGE_KEY_VID)
    if (!vid) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        vid = 'v_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      } else {
        vid = 'v_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36)
      }
      localStorage.setItem(STORAGE_KEY_VID, vid)
      // Also persist cookie for 1 year
      document.cookie = `${STORAGE_KEY_VID}=${vid}; path=/; max-age=31536000; SameSite=Lax`
    }
    return vid
  } catch {
    return 'v_anon_' + Date.now().toString(36)
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let sid = sessionStorage.getItem(STORAGE_KEY_SID)
    if (!sid) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        sid = 's_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      } else {
        sid = 's_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36)
      }
      sessionStorage.setItem(STORAGE_KEY_SID, sid)
    }
    return sid
  } catch {
    return 's_anon_' + Date.now().toString(36)
  }
}

export function trackClientEvent(options: {
  eventName: string
  eventCategory?: string
  resourceId?: string
  resourceName?: string
}) {
  if (typeof window === 'undefined') return
  try {
    if (navigator.doNotTrack === '1') return

    const visitorId = getOrCreateVisitorId()
    const sessionId = getOrCreateSessionId()

    const payload = JSON.stringify({
      type: 'event',
      visitorId,
      sessionId,
      eventName: options.eventName,
      eventCategory: options.eventCategory || 'conversion',
      resourceId: options.resourceId || null,
      resourceName: options.resourceName || null,
    })

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/track', blob)
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }
  } catch (err) {
    console.debug('Analytics event tracking error:', err)
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Skip admin and API paths
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return
    }

    // Respect Do Not Track
    if (navigator.doNotTrack === '1') {
      return
    }

    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname

    // Avoid duplicate rapid tracks of identical URL
    if (lastTrackedPath.current === currentUrl) {
      return
    }
    lastTrackedPath.current = currentUrl

    const visitorId = getOrCreateVisitorId()
    const sessionId = getOrCreateSessionId()

    // Contextual service/product identification
    let serviceId: string | null = null
    let productId: string | null = null

    if (pathname.startsWith('/services')) {
      const serviceParam = searchParams.get('service')
      if (serviceParam) {
        serviceId = serviceParam
      }
    } else if (pathname.startsWith('/products')) {
      const productParam = searchParams.get('product')
      if (productParam) {
        productId = productParam
      }
    } else if (pathname.startsWith('/projects/')) {
      productId = pathname.replace('/projects/', '')
    }

    const payload = JSON.stringify({
      type: 'pageview',
      visitorId,
      sessionId,
      path: pathname,
      title: document.title || null,
      referrer: document.referrer || null,
      serviceId,
      productId,
    })

    // Use sendBeacon for optimal performance without blocking page load
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/track', blob)
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }
  }, [pathname, searchParams])

  return null
}

