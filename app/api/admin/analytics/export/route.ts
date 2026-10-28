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
} {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  if (range === 'custom' && customStart && customEnd) {
    const isValidStart = /^\d{4}-\d{2}-\d{2}$/.test(customStart)
    const isValidEnd = /^\d{4}-\d{2}-\d{2}$/.test(customEnd)
    if (isValidStart && isValidEnd && customStart <= customEnd) {
      return { startDate: customStart, endDate: customEnd }
    }
  }

  let days = 30
  if (range === '7d') days = 7
  else if (range === '90d') days = 90
  else days = 30

  const past = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
  return { startDate: past.toISOString().slice(0, 10), endDate: todayStr }
}

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '""'
  const str = String(val).replace(/"/g, '""')
  return `"${str}"`
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

    const { startDate, endDate } = resolveDateRange(range, customStart, customEnd)

    const overview = getAnalyticsOverview(startDate, endDate)
    const trafficSeries = getDailyTrafficSeries(startDate, endDate)
    const topPages = getTopPages(startDate, endDate, 50)
    const { services, products } = getPopularServicesAndProducts(startDate, endDate)
    const enquiryPerformance = getEnquiryPerformanceData(startDate, endDate)

    const rows: string[] = []

    // Report Header
    rows.push('THENAM SOFTWARE SOLUTIONS - WEBSITE ANALYTICS & PERFORMANCE REPORT')
    rows.push(`Exported At,${escapeCsv(new Date().toISOString())}`)
    rows.push(`Admin User,${escapeCsv(admin.name)} (${escapeCsv(admin.email)})`)
    rows.push(`Report Date Range,${escapeCsv(startDate)} to ${escapeCsv(endDate)}`)
    rows.push('')

    // 1. Overview Summary Metrics
    rows.push('SECTION 1: OVERVIEW METRICS')
    rows.push('Metric,Value,Description')
    rows.push(`Total Website Visitors,${overview.totalVisitors},Total website visits/sessions recorded`)
    rows.push(`Unique Visitors,${overview.uniqueVisitors},Distinct unique visitor IDs`)
    rows.push(`Total Page Views,${overview.totalPageViews},Total individual pageview records`)
    rows.push(`Total Enquiries Received,${overview.totalEnquiries},Total proposal and project quote inquiries`)
    rows.push(`Enquiring Unique Visitors,${overview.enquiringVisitors},Unique website visitors who submitted an enquiry`)
    rows.push(`Enquiry Conversion Rate,${overview.conversionRate}%,(Enquiring Visitors / Unique Visitors) x 100`)
    rows.push('')

    // 2. Daily Traffic Breakdown
    rows.push('SECTION 2: DAILY WEBSITE TRAFFIC & ENQUIRIES')
    rows.push('Date,Page Views,Unique Visitors,Enquiries,Daily Conversion Rate')
    for (const day of trafficSeries) {
      const dayRate = day.uniqueVisitors > 0 
        ? ((day.enquiries / day.uniqueVisitors) * 100).toFixed(2) + '%' 
        : '0.00%'
      rows.push(`${escapeCsv(day.date)},${day.pageViews},${day.uniqueVisitors},${day.enquiries},${dayRate}`)
    }
    rows.push('')

    // 3. Most Visited Website Pages
    rows.push('SECTION 3: MOST VISITED WEBSITE PAGES')
    rows.push('Rank,Page Path,Page Title,Page Views,Unique Visitors,Share of Traffic')
    topPages.forEach((p, idx) => {
      rows.push(`${idx + 1},${escapeCsv(p.path)},${escapeCsv(p.title)},${p.views},${p.uniqueVisitors},${p.percentage}%`)
    })
    rows.push('')

    // 4. Software Services Performance
    rows.push('SECTION 4: SOFTWARE SERVICES PERFORMANCE')
    rows.push('Service ID,Service Name,Badge,Page Views,Unique Visitors,Enquiries Received')
    for (const s of services) {
      rows.push(`${escapeCsv(s.id)},${escapeCsv(s.title)},${escapeCsv(s.badge || 'None')},${s.views},${s.uniqueVisitors},${s.enquiries}`)
    }
    rows.push('')

    // 5. Software Products Performance
    rows.push('SECTION 5: SOFTWARE PRODUCTS PERFORMANCE')
    rows.push('Product ID,Product Name,Category,Badge,Page Views,Unique Visitors')
    for (const prod of products) {
      rows.push(`${escapeCsv(prod.id)},${escapeCsv(prod.name)},${escapeCsv(prod.category)},${escapeCsv(prod.badge || 'None')},${prod.views},${prod.uniqueVisitors}`)
    }
    rows.push('')

    // 6. Enquiry Category Breakdown
    rows.push('SECTION 6: ENQUIRIES BY SERVICE CATEGORY')
    rows.push('Service Requested,Enquiry Count')
    for (const enq of enquiryPerformance.serviceBreakdown) {
      rows.push(`${escapeCsv(enq.service_name)},${enq.count}`)
    }
    rows.push('')

    // 7. Budget Tier Breakdown
    rows.push('SECTION 7: ENQUIRIES BY BUDGET TIER')
    rows.push('Budget Tier,Enquiry Count')
    for (const b of enquiryPerformance.budgetBreakdown) {
      rows.push(`${escapeCsv(b.tier)},${b.count}`)
    }

    const csvContent = rows.join('\r\n')
    const filename = `thenam-analytics-report-${startDate}-to-${endDate}.csv`

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json({ error: 'Failed to generate CSV export' }, { status: 500 })
  }
}

