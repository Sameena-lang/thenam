import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin } from '@/lib/auth'
import {
  getAnalyticsOverview,
  getDailyTrafficSeries,
  getTopPages,
  getPopularServicesAndProducts,
  getEnquiryPerformanceData,
} from '@/lib/db'

function resolveDateRange(range: string | null, customStart: string | null, customEnd: string | null): {
  startDate: string
  endDate: string
  activeRange: string
} {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  if (range === 'custom' && customStart && customEnd) {
    const isValidStart = /^\d{4}-\d{2}-\d{2}$/.test(customStart)
    const isValidEnd = /^\d{4}-\d{2}-\d{2}$/.test(customEnd)
    if (isValidStart && isValidEnd && customStart <= customEnd) {
      return { startDate: customStart, endDate: customEnd, activeRange: 'custom' }
    }
  }

  let days = 30
  let activeRange = '30d'

  if (range === '7d') {
    days = 7
    activeRange = '7d'
  } else if (range === '90d') {
    days = 90
    activeRange = '90d'
  } else {
    days = 30
    activeRange = '30d'
  }

  const past = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
  const startStr = past.toISOString().slice(0, 10)

  return { startDate: startStr, endDate: todayStr, activeRange }
}

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range')
    const customStart = searchParams.get('startDate')
    const customEnd = searchParams.get('endDate')

    const { startDate, endDate, activeRange } = resolveDateRange(range, customStart, customEnd)

    // Execute queries
    const overview = getAnalyticsOverview(startDate, endDate)
    const trafficSeries = getDailyTrafficSeries(startDate, endDate)
    const topPages = getTopPages(startDate, endDate, 15)
    const { services, products } = getPopularServicesAndProducts(startDate, endDate)
    const enquiryPerformance = getEnquiryPerformanceData(startDate, endDate)

    return NextResponse.json({
      success: true,
      activeRange,
      startDate,
      endDate,
      overview,
      trafficSeries,
      topPages,
      services,
      products,
      enquiryPerformance,
    })
  } catch (error) {
    console.error('Failed to retrieve analytics data:', error)
    return NextResponse.json({ error: 'Failed to process analytics data' }, { status: 500 })
  }
}

