'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  Eye,
  MessageSquareText,
  TrendingUp,
  Percent,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Layers,
  Package,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  Globe,
  Filter,
} from 'lucide-react'

interface OverviewData {
  totalVisitors: number
  uniqueVisitors: number
  totalPageViews: number
  totalEnquiries: number
  enquiringVisitors: number
  conversionRate: number
  startDate: string
  endDate: string
}

interface DailyTraffic {
  date: string
  pageViews: number
  uniqueVisitors: number
  enquiries: number
}

interface TopPage {
  path: string
  title: string
  views: number
  uniqueVisitors: number
  percentage: number
}

interface ServiceMetric {
  id: string
  title: string
  badge: string
  views: number
  uniqueVisitors: number
  enquiries: number
}

interface ProductMetric {
  id: string
  name: string
  category: string
  badge: string
  views: number
  uniqueVisitors: number
}

interface EnquiryPerformance {
  monthlyTrend: Array<{ month: string; count: number }>
  dailyTrend: Array<{ date: string; count: number }>
  serviceBreakdown: Array<{ service_name: string; count: number }>
  budgetBreakdown: Array<{ tier: string; count: number }>
  statusBreakdown: Array<{ status: string; count: number }>
  ndaRequests: number
}

interface AnalyticsApiResponse {
  success: boolean
  activeRange: string
  startDate: string
  endDate: string
  overview: OverviewData
  trafficSeries: DailyTraffic[]
  topPages: TopPage[]
  services: ServiceMetric[]
  products: ProductMetric[]
  enquiryPerformance: EnquiryPerformance
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 29)
    return d.toISOString().slice(0, 10)
  })
  const [customEnd, setCustomEnd] = useState<string>(() => new Date().toISOString().slice(0, 10))

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsApiResponse | null>(null)

  // Chart interactivity state
  const [activeMetricTab, setActiveMetricTab] = useState<'all' | 'pageViews' | 'uniqueVisitors' | 'enquiries'>('all')
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number
    day: DailyTraffic
    x: number
    y: number
  } | null>(null)

  // Popular offerings sub-tab
  const [offeringsTab, setOfferingsTab] = useState<'services' | 'products'>('services')

  const fetchData = useCallback(
    async (targetRange = range, start = customStart, end = customEnd) => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('range', targetRange)
        if (targetRange === 'custom') {
          params.set('startDate', start)
          params.set('endDate', end)
        }

        const res = await fetch(`/api/admin/analytics?${params.toString()}`)
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Authentication required. Please sign in to access analytics.')
          }
          throw new Error('Failed to load analytics records.')
        }

        const json: AnalyticsApiResponse = await res.json()
        setData(json)
      } catch (err: unknown) {
        console.error('Analytics fetch error:', err)
        setError(err instanceof Error ? err.message : 'Error fetching analytics records.')
      } finally {
        setLoading(false)
      }
    },
    [range, customStart, customEnd]
  )

  useEffect(() => {
    fetchData(range, customStart, customEnd)
  }, [fetchData, range])

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault()
    if (customStart > customEnd) {
      alert('Start date must be before or equal to End date.')
      return
    }
    setRange('custom')
    fetchData('custom', customStart, customEnd)
  }

  const handleExportCsv = () => {
    const params = new URLSearchParams()
    params.set('range', range)
    if (range === 'custom') {
      params.set('startDate', customStart)
      params.set('endDate', customEnd)
    }
    window.location.href = `/api/admin/analytics/export?${params.toString()}`
  }

  const handlePrintPdf = () => {
    window.print()
  }

  // Calculate SVG chart scales and path strings
  const chartConfig = useMemo(() => {
    const series = data?.trafficSeries || []
    if (series.length === 0) return null

    const width = 800
    const height = 240
    const padding = { top: 20, right: 30, bottom: 35, left: 45 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom

    // Max values across series
    const maxPv = Math.max(...series.map((d) => d.pageViews), 1)
    const maxUv = Math.max(...series.map((d) => d.uniqueVisitors), 1)
    const maxEnq = Math.max(...series.map((d) => d.enquiries), 1)
    const yMax = Math.max(maxPv, maxUv, maxEnq, 5)

    const getX = (idx: number) => {
      if (series.length <= 1) return padding.left + chartW / 2
      return padding.left + (idx / (series.length - 1)) * chartW
    }

    const getY = (val: number) => {
      return padding.top + chartH - (val / yMax) * chartH
    }

    // Build SVG paths
    const pvPoints = series.map((d, i) => `${getX(i)},${getY(d.pageViews)}`).join(' ')
    const uvPoints = series.map((d, i) => `${getX(i)},${getY(d.uniqueVisitors)}`).join(' ')
    const enqPoints = series.map((d, i) => `${getX(i)},${getY(d.enquiries)}`).join(' ')

    const pvArea = `${getX(0)},${padding.top + chartH} ${pvPoints} ${getX(series.length - 1)},${padding.top + chartH}`
    const uvArea = `${getX(0)},${padding.top + chartH} ${uvPoints} ${getX(series.length - 1)},${padding.top + chartH}`

    // Y Axis grid ticks (4 divisions)
    const yTicks = [0, Math.round(yMax * 0.33), Math.round(yMax * 0.66), yMax]

    // X Axis labels (up to 7 distributed ticks)
    const step = Math.max(1, Math.floor(series.length / 6))
    const xTicks = series.filter((_, i) => i % step === 0 || i === series.length - 1)

    return {
      width,
      height,
      padding,
      chartW,
      chartH,
      series,
      yMax,
      getX,
      getY,
      pvPoints,
      uvPoints,
      enqPoints,
      pvArea,
      uvArea,
      yTicks,
      xTicks,
    }
  }, [data?.trafficSeries])

  const formatDateLabel = (isoDate: string) => {
    try {
      const parts = isoDate.split('-')
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
      return isoDate
    } catch {
      return isoDate
    }
  }

  const formatFullDate = (isoDate: string) => {
    try {
      const parts = isoDate.split('-')
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      }
      return isoDate
    } catch {
      return isoDate
    }
  }

  const hasTrackingData = (data?.overview.totalPageViews ?? 0) > 0

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Website Analytics &amp; Reports
            </h1>
            <span className="adm-badge adm-badge-cyan" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} />
              First-Party Live Data
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            Comprehensive traffic telemetry, visitor attribution, enquiry conversion funnel, and performance audits.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }} className="adm-no-print">
          <button
            onClick={() => fetchData(range, customStart, customEnd)}
            className="adm-btn adm-btn-outline"
            type="button"
            disabled={loading}
            title="Refresh latest analytics data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="adm-btn adm-btn-outline"
            type="button"
            title="Print or Save PDF report"
          >
            <Printer size={14} />
            <span>Save PDF</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="adm-btn adm-btn-primary"
            type="button"
            title="Download complete structured CSV report"
          >
            <FileSpreadsheet size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="adm-alert-error" role="alert" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Date Filter Bar */}
      <div className="adm-filter-bar adm-no-print">
        <div className="adm-filter-group">
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} />
            Date Filter:
          </span>
          <button
            type="button"
            className={`adm-filter-btn ${range === '7d' ? 'active' : ''}`}
            onClick={() => setRange('7d')}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            className={`adm-filter-btn ${range === '30d' ? 'active' : ''}`}
            onClick={() => setRange('30d')}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            className={`adm-filter-btn ${range === '90d' ? 'active' : ''}`}
            onClick={() => setRange('90d')}
          >
            Last 90 Days
          </button>
          <button
            type="button"
            className={`adm-filter-btn ${range === 'custom' ? 'active' : ''}`}
            onClick={() => setRange('custom')}
          >
            Custom Range
          </button>
        </div>

        {/* Custom Range Inputs */}
        {range === 'custom' && (
          <form onSubmit={handleApplyCustomRange} className="adm-date-inputs">
            <input
              type="date"
              className="adm-date-input"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              required
            />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>to</span>
            <input
              type="date"
              className="adm-date-input"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              required
            />
            <button type="submit" className="adm-btn adm-btn-primary" style={{ padding: '5px 12px', fontSize: '12px' }}>
              Apply
            </button>
          </form>
        )}

        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Period: <strong style={{ color: '#0f172a' }}>{data?.startDate}</strong> to <strong style={{ color: '#0f172a' }}>{data?.endDate}</strong>
        </div>
      </div>

      {/* SECTION A: OVERVIEW CARDS */}
      <div className="adm-stats-grid" style={{ marginBottom: '24px' }}>
        {/* Total Website Visitors */}
        <div className="adm-stat-card">
          <div>
            <span className="adm-stat-label">Total Website Visitors</span>
            <div className="adm-stat-number">{loading ? '—' : data?.overview.totalVisitors ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              Total browser visits &amp; sessions
            </div>
          </div>
          <div className="adm-stat-icon-wrap cyan">
            <Globe size={22} />
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="adm-stat-card">
          <div>
            <span className="adm-stat-label">Unique Visitors</span>
            <div className="adm-stat-number">{loading ? '—' : data?.overview.uniqueVisitors ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700', marginTop: '4px' }}>
              Distinct visitor identities
            </div>
          </div>
          <div className="adm-stat-icon-wrap green">
            <Users size={22} />
          </div>
        </div>

        {/* Total Page Views */}
        <div className="adm-stat-card">
          <div>
            <span className="adm-stat-label">Total Page Views</span>
            <div className="adm-stat-number">{loading ? '—' : data?.overview.totalPageViews ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              {data?.overview.uniqueVisitors
                ? `${((data.overview.totalPageViews / Math.max(data.overview.uniqueVisitors, 1)) || 0).toFixed(1)} views / visitor`
                : 'Individual page impressions'}
            </div>
          </div>
          <div className="adm-stat-icon-wrap purple">
            <Eye size={22} />
          </div>
        </div>

        {/* Total Enquiries */}
        <div className="adm-stat-card">
          <div>
            <span className="adm-stat-label">Total Enquiries</span>
            <div className="adm-stat-number">{loading ? '—' : data?.overview.totalEnquiries ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', marginTop: '4px' }}>
              {data?.overview.enquiringVisitors ?? 0} distinct submitting visitors
            </div>
          </div>
          <div className="adm-stat-icon-wrap amber">
            <MessageSquareText size={22} />
          </div>
        </div>

        {/* Enquiry Conversion Rate */}
        <div className="adm-stat-card" style={{ borderLeft: '3px solid #00c9f2' }}>
          <div>
            <span className="adm-stat-label">Enquiry Conversion Rate</span>
            <div className="adm-stat-number" style={{ color: '#0284c7' }}>
              {loading ? '—' : `${data?.overview.conversionRate ?? 0}%`}
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700', marginTop: '4px' }}>
              {data?.overview.uniqueVisitors && data.overview.uniqueVisitors > 0
                ? `${data.overview.enquiringVisitors} of ${data.overview.uniqueVisitors} visitors converted`
                : 'Awaiting visitor volume'}
            </div>
          </div>
          <div className="adm-stat-icon-wrap cyan">
            <Percent size={22} />
          </div>
        </div>
      </div>

      {/* SECTION B: WEBSITE TRAFFIC OVER TIME (INTERACTIVE CHART) */}
      <div className="adm-card" style={{ marginBottom: '24px' }}>
        <div className="adm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="adm-card-title">Website Traffic &amp; Visitor Engagement</h2>
            <p className="adm-card-desc">
              Daily trend of page views, unique visitors, and project enquiries over time.
            </p>
          </div>

          {/* Metric Selector Pills */}
          <div className="adm-filter-group adm-no-print">
            <button
              type="button"
              className={`adm-filter-btn ${activeMetricTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveMetricTab('all')}
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              All Metrics
            </button>
            <button
              type="button"
              className={`adm-filter-btn ${activeMetricTab === 'pageViews' ? 'active' : ''}`}
              onClick={() => setActiveMetricTab('pageViews')}
              style={{ fontSize: '11.5px', padding: '4px 10px', color: '#0284c7' }}
            >
              Page Views
            </button>
            <button
              type="button"
              className={`adm-filter-btn ${activeMetricTab === 'uniqueVisitors' ? 'active' : ''}`}
              onClick={() => setActiveMetricTab('uniqueVisitors')}
              style={{ fontSize: '11.5px', padding: '4px 10px', color: '#059669' }}
            >
              Unique Visitors
            </button>
            <button
              type="button"
              className={`adm-filter-btn ${activeMetricTab === 'enquiries' ? 'active' : ''}`}
              onClick={() => setActiveMetricTab('enquiries')}
              style={{ fontSize: '11.5px', padding: '4px 10px', color: '#d97706' }}
            >
              Enquiries
            </button>
          </div>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {/* Chart Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '14px', flexWrap: 'wrap', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#00c9f2' }} />
              <span style={{ color: '#0f172a', fontWeight: '600' }}>Page Views</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} />
              <span style={{ color: '#0f172a', fontWeight: '600' }}>Unique Visitors</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }} />
              <span style={{ color: '#0f172a', fontWeight: '600' }}>Enquiries</span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '11px', marginLeft: 'auto' }}>
              Hover over data points for detailed day metrics
            </span>
          </div>

          {/* SVG Chart */}
          {chartConfig ? (
            <div className="adm-chart-container">
              <svg
                viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`}
                className="adm-chart-svg"
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <defs>
                  {/* Cyan Gradient for Page Views */}
                  <linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00c9f2" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00c9f2" stopOpacity="0.01" />
                  </linearGradient>
                  {/* Green Gradient for Unique Visitors */}
                  <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Y Axis Grid lines */}
                {chartConfig.yTicks.map((val) => {
                  const y = chartConfig.getY(val)
                  return (
                    <g key={val}>
                      <line
                        x1={chartConfig.padding.left}
                        y1={y}
                        x2={chartConfig.width - chartConfig.padding.right}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={chartConfig.padding.left - 8}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10.5"
                        fill="#94a3b8"
                      >
                        {val}
                      </text>
                    </g>
                  )
                })}

                {/* X Axis Labels */}
                {chartConfig.xTicks.map((d) => {
                  const idx = chartConfig.series.findIndex((s) => s.date === d.date)
                  if (idx === -1) return null
                  const x = chartConfig.getX(idx)
                  return (
                    <text
                      key={d.date}
                      x={x}
                      y={chartConfig.height - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748b"
                    >
                      {formatDateLabel(d.date)}
                    </text>
                  )
                })}

                {/* Page Views Area & Line */}
                {(activeMetricTab === 'all' || activeMetricTab === 'pageViews') && (
                  <>
                    <polygon points={chartConfig.pvArea} fill="url(#pvGradient)" />
                    <polyline
                      fill="none"
                      stroke="#00c9f2"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartConfig.pvPoints}
                    />
                  </>
                )}

                {/* Unique Visitors Area & Line */}
                {(activeMetricTab === 'all' || activeMetricTab === 'uniqueVisitors') && (
                  <>
                    <polygon points={chartConfig.uvArea} fill="url(#uvGradient)" />
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartConfig.uvPoints}
                    />
                  </>
                )}

                {/* Enquiries Line (Amber) */}
                {(activeMetricTab === 'all' || activeMetricTab === 'enquiries') && (
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartConfig.enqPoints}
                  />
                )}

                {/* Hover crosshair line */}
                {hoveredPoint && (
                  <line
                    x1={hoveredPoint.x}
                    y1={chartConfig.padding.top}
                    x2={hoveredPoint.x}
                    y2={chartConfig.height - chartConfig.padding.bottom}
                    stroke="#64748b"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                )}

                {/* Data point circles and invisible hover targets */}
                {chartConfig.series.map((day, idx) => {
                  const x = chartConfig.getX(idx)
                  const pvY = chartConfig.getY(day.pageViews)
                  const uvY = chartConfig.getY(day.uniqueVisitors)
                  const isHovered = hoveredPoint?.index === idx

                  return (
                    <g key={day.date}>
                      {/* Interactive dot on page views */}
                      {(activeMetricTab === 'all' || activeMetricTab === 'pageViews') && (
                        <circle
                          cx={x}
                          cy={pvY}
                          r={isHovered ? 5.5 : 3}
                          fill="#00c9f2"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}
                      {/* Interactive dot on unique visitors */}
                      {(activeMetricTab === 'all' || activeMetricTab === 'uniqueVisitors') && (
                        <circle
                          cx={x}
                          cy={uvY}
                          r={isHovered ? 5.5 : 3}
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}

                      {/* Invisible hover slice covering the full height */}
                      <rect
                        x={Math.max(chartConfig.padding.left, x - chartConfig.chartW / (chartConfig.series.length * 2))}
                        y={chartConfig.padding.top}
                        width={Math.max(12, chartConfig.chartW / chartConfig.series.length)}
                        height={chartConfig.chartH}
                        fill="transparent"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() =>
                          setHoveredPoint({
                            index: idx,
                            day,
                            x,
                            y: Math.min(pvY, uvY),
                          })
                        }
                      />
                    </g>
                  )
                })}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="adm-chart-tooltip"
                  style={{
                    left: `${(hoveredPoint.x / chartConfig.width) * 100}%`,
                    top: `${Math.max(20, (hoveredPoint.y / chartConfig.height) * 100)}%`,
                  }}
                >
                  <div style={{ fontWeight: '700', marginBottom: '4px', color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3px' }}>
                    {formatFullDate(hoveredPoint.day.date)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '4px 12px', fontSize: '11px' }}>
                    <span style={{ color: '#00c9f2' }}>● Page Views:</span>
                    <strong style={{ textAlign: 'right' }}>{hoveredPoint.day.pageViews}</strong>

                    <span style={{ color: '#10b981' }}>● Unique Visitors:</span>
                    <strong style={{ textAlign: 'right' }}>{hoveredPoint.day.uniqueVisitors}</strong>

                    <span style={{ color: '#f59e0b' }}>● Enquiries:</span>
                    <strong style={{ textAlign: 'right' }}>{hoveredPoint.day.enquiries}</strong>

                    <span style={{ color: '#cbd5e1' }}>● Daily Conversion:</span>
                    <strong style={{ textAlign: 'right' }}>
                      {hoveredPoint.day.uniqueVisitors > 0
                        ? `${((hoveredPoint.day.enquiries / hoveredPoint.day.uniqueVisitors) * 100).toFixed(1)}%`
                        : '0.0%'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <TrendingUp size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '13.5px' }}>No traffic chart data available for this range.</p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION C & SECTION D GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* SECTION C: POPULAR PAGES & SERVICES */}
        <div className="adm-card">
          <div className="adm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="adm-card-title">Popular Pages &amp; Offerings</h2>
              <p className="adm-card-desc">Most visited site paths and top viewed business solutions.</p>
            </div>

            <div className="adm-filter-group adm-no-print">
              <button
                type="button"
                className={`adm-filter-btn ${offeringsTab === 'services' ? 'active' : ''}`}
                onClick={() => setOfferingsTab('services')}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                Services
              </button>
              <button
                type="button"
                className={`adm-filter-btn ${offeringsTab === 'products' ? 'active' : ''}`}
                onClick={() => setOfferingsTab('products')}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                Products
              </button>
            </div>
          </div>

          <div style={{ padding: '0' }}>
            {/* Top Visited Pages Table */}
            <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={14} color="#00c9f2" />
                <span>Most Visited Website Pages</span>
              </div>

              {data?.topPages && data.topPages.length > 0 ? (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Page Path</th>
                        <th style={{ textAlign: 'right' }}>Page Views</th>
                        <th style={{ textAlign: 'right' }}>Unique Visitors</th>
                        <th style={{ textAlign: 'right' }}>Traffic Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topPages.slice(0, 7).map((page, idx) => (
                        <tr key={page.path || idx}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Link
                                href={page.path}
                                target="_blank"
                                style={{ color: '#0284c7', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                {page.path}
                                <ExternalLink size={11} color="#94a3b8" />
                              </Link>
                            </div>
                            {page.title && page.title !== page.path && (
                              <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>{page.title}</div>
                            )}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>{page.views}</td>
                          <td style={{ textAlign: 'right', color: '#64748b' }}>{page.uniqueVisitors}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>{page.percentage}%</span>
                              <div style={{ width: '48px' }} className="adm-progress-bar">
                                <div className="adm-progress-fill" style={{ width: `${Math.min(page.percentage, 100)}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No page views recorded yet for the selected period.
                </div>
              )}
            </div>

            {/* Most Viewed Services / Products */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {offeringsTab === 'services' ? <Layers size={14} color="#00dfa5" /> : <Package size={14} color="#8b5cf6" />}
                <span>{offeringsTab === 'services' ? 'Software Services Demand & Views' : 'Proprietary Software Products Viewed'}</span>
              </div>

              {offeringsTab === 'services' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data?.services && data.services.length > 0 ? (
                    data.services.slice(0, 6).map((s) => (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {s.title}
                            {s.badge && <span className="adm-badge adm-badge-cyan" style={{ fontSize: '10px', padding: '1px 6px' }}>{s.badge}</span>}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {s.views} total views &bull; {s.uniqueVisitors} visitors
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span className="adm-badge adm-badge-amber" style={{ fontSize: '11px' }}>
                            {s.enquiries} {s.enquiries === 1 ? 'enquiry' : 'enquiries'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '16px' }}>
                      No service interaction data in this range.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data?.products && data.products.length > 0 ? (
                    data.products.slice(0, 6).map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {p.name}
                            {p.badge && <span className="adm-badge adm-badge-green" style={{ fontSize: '10px', padding: '1px 6px' }}>{p.badge}</span>}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {p.category}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{p.views} views</div>
                          <div style={{ fontSize: '10.5px', color: '#64748b' }}>{p.uniqueVisitors} visitors</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '16px' }}>
                      No product interaction data in this range.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION D: ENQUIRY PERFORMANCE & CONVERSION FUNNEL */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h2 className="adm-card-title">Enquiry Performance &amp; Conversion</h2>
            <p className="adm-card-desc">
              Visitors submitting proposal requests, conversion attribution, and monthly trends.
            </p>
          </div>

          <div style={{ padding: '20px' }}>
            {/* Conversion Funnel Grid */}
            <div className="adm-funnel-grid">
              <div className="adm-funnel-step">
                <div className="adm-funnel-step-num">Step 1 &bull; Website Reach</div>
                <div className="adm-funnel-step-val">{data?.overview.uniqueVisitors ?? 0}</div>
                <div className="adm-funnel-step-sub">Unique Website Visitors</div>
              </div>

              <div className="adm-funnel-step highlight">
                <div className="adm-funnel-step-num" style={{ color: '#0284c7' }}>Step 2 &bull; Lead Conversion</div>
                <div className="adm-funnel-step-val" style={{ color: '#0284c7' }}>
                  {data?.overview.enquiringVisitors ?? 0}
                </div>
                <div className="adm-funnel-step-sub">Visitors Submitted Enquiry</div>
              </div>

              <div className="adm-funnel-step">
                <div className="adm-funnel-step-num">Step 3 &bull; Total Volume</div>
                <div className="adm-funnel-step-val" style={{ color: '#059669' }}>
                  {data?.overview.totalEnquiries ?? 0}
                </div>
                <div className="adm-funnel-step-sub">Total Proposals Received</div>
              </div>
            </div>

            {/* Formula Explanation Banner */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#166534' }}>
                  Enquiry Conversion Rate: {data?.overview.conversionRate ?? 0}%
                </div>
                <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>
                  Calculated strictly as ({data?.overview.enquiringVisitors ?? 0} enquiring visitors &divide;{' '}
                  {Math.max(data?.overview.uniqueVisitors ?? 0, 1)} unique visitors) &times; 100.
                  Duplicate submissions from the same visitor identity are deduplicated.
                </div>
              </div>
            </div>

            {/* Monthly Trend Bars */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Monthly Enquiry Volume (Last 6 Months)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data?.enquiryPerformance.monthlyTrend.length || 6}, 1fr)`, gap: '8px', alignItems: 'flex-end', height: '90px', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                {data?.enquiryPerformance.monthlyTrend && data.enquiryPerformance.monthlyTrend.length > 0 ? (
                  data.enquiryPerformance.monthlyTrend.map((m) => {
                    const maxM = Math.max(...(data.enquiryPerformance.monthlyTrend.map((item) => item.count) || [1]), 1)
                    const pct = Math.max(10, (m.count / maxM) * 100)
                    return (
                      <div key={m.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{m.count}</span>
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '36px',
                            height: `${pct}%`,
                            background: 'linear-gradient(180deg, #00c9f2 0%, #0284c7 100%)',
                            borderRadius: '4px 4px 0 0',
                          }}
                        />
                        <span style={{ fontSize: '9.5px', color: '#64748b', marginTop: '6px' }}>{m.month.slice(5)}/{m.month.slice(2, 4)}</span>
                      </div>
                    )
                  })
                ) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                    No monthly records available yet.
                  </div>
                )}
              </div>
            </div>

            {/* Requested Service Breakdown */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                Top Requested Services &amp; Budget Tiers
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Services */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    By Service
                  </div>
                  {data?.enquiryPerformance.serviceBreakdown && data.enquiryPerformance.serviceBreakdown.length > 0 ? (
                    data.enquiryPerformance.serviceBreakdown.slice(0, 4).map((s) => (
                      <div key={s.service_name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', padding: '3px 0' }}>
                        <span style={{ color: '#334155', fontWeight: '500' }}>{s.service_name}</span>
                        <strong style={{ color: '#0f172a' }}>{s.count}</strong>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>No inquiries in range</div>
                  )}
                </div>

                {/* Budget Tiers */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    By Budget Tier
                  </div>
                  {data?.enquiryPerformance.budgetBreakdown && data.enquiryPerformance.budgetBreakdown.length > 0 ? (
                    data.enquiryPerformance.budgetBreakdown.slice(0, 4).map((b) => (
                      <div key={b.tier} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', padding: '3px 0' }}>
                        <span style={{ color: '#334155', fontWeight: '500' }}>{b.tier}</span>
                        <strong style={{ color: '#0f172a' }}>{b.count}</strong>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>No inquiries in range</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION E: REPORTS & PRIVACY COMPLIANCE FOOTNOTE */}
      <div className="adm-card adm-no-print" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileSpreadsheet size={16} color="#00c9f2" />
              <span>Executive Analytics Reports &amp; Data Export</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
              Exports full telemetry breakdown filtered to <strong>{data?.startDate}</strong> &mdash; <strong>{data?.endDate}</strong> in standard RFC 4180 CSV format.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleExportCsv} className="adm-btn adm-btn-primary" type="button">
              <Download size={14} />
              <span>Download CSV Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

