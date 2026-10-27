'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CheckCheck,
  ExternalLink,
  MessageSquareText,
  FileText,
  UserCheck,
  Briefcase,
  Shield,
  Clock,
  X,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

export interface AdminNotificationItem {
  id: string
  type: 'inquiry' | 'quote' | 'user' | 'application' | 'audit' | 'system'
  title: string
  message: string
  link: string
  reference_id: string | null
  reference_type: string | null
  is_read: number
  created_at: string
}

interface PendingSummary {
  overdueInquiriesCount: number
  pendingInquiriesCount: number
  pendingUsersCount: number
  pendingApplicationsCount: number
  totalPendingActions: number
}

export default function NotificationBell() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingSummary, setPendingSummary] = useState<PendingSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [showViewAllModal, setShowViewAllModal] = useState(false)
  const [modalSearch, setModalSearch] = useState('')
  const [modalTypeFilter, setModalTypeFilter] = useState<string>('all')

  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications?limit=25')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
      setPendingSummary(data.pendingSummary || null)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 25000)
    const handleFocus = () => fetchNotifications()
    window.addEventListener('focus', handleFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchNotifications])

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))

      await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: 1 }),
      })
    } catch (err) {
      console.error('Error marking notification as read:', err)
      fetchNotifications()
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
      setUnreadCount(0)

      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      })
    } catch (err) {
      console.error('Error marking all as read:', err)
      fetchNotifications()
    }
  }

  const handleNotificationClick = async (notif: AdminNotificationItem) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id)
    }
    setIsOpen(false)
    setShowViewAllModal(false)
    router.push(notif.link)
  }

  const formatRelativeTime = (isoString: string) => {
    try {
      const now = Date.now()
      const diffMs = now - new Date(isoString).getTime()
      const mins = Math.floor(diffMs / 60000)
      if (mins < 1) return 'Just now'
      if (mins < 60) return `${mins}m ago`
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      if (days < 7) return `${days}d ago`
      return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return isoString
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'inquiry':
        return <MessageSquareText size={16} />
      case 'quote':
        return <FileText size={16} />
      case 'user':
        return <UserCheck size={16} />
      case 'application':
        return <Briefcase size={16} />
      case 'audit':
      case 'system':
      default:
        return <Shield size={16} />
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return n.is_read === 0
    return true
  })

  const modalFilteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      modalSearch === '' ||
      n.title.toLowerCase().includes(modalSearch.toLowerCase()) ||
      n.message.toLowerCase().includes(modalSearch.toLowerCase())
    const matchesType = modalTypeFilter === 'all' || n.type === modalTypeFilter
    return matchesSearch && matchesType
  })

  return (
    <>
      <div className="adm-notif-wrap" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`adm-notif-bell-btn ${isOpen ? 'active' : ''}`}
          aria-label={`Admin notifications (${unreadCount} unread)`}
          title="Notifications & System Alerts"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="adm-notif-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Popover */}
        {isOpen && (
          <div className="adm-notif-dropdown" role="dialog" aria-label="Notifications Dropdown">
            <div className="adm-notif-dropdown-header">
              <div className="adm-notif-dropdown-title">
                <span>Notifications</span>
                {unreadCount > 0 ? (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      background: 'rgba(0, 201, 242, 0.15)',
                      color: '#0284c7',
                    }}
                  >
                    {unreadCount} unread
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      background: '#ecfdf5',
                      color: '#059669',
                    }}
                  >
                    All caught up
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px',
                  }}
                  title="Mark all notifications as read"
                >
                  <CheckCheck size={14} />
                  <span>Mark read</span>
                </button>
              )}
            </div>

            {/* Quick Filter Bar */}
            <div className="adm-notif-filter-bar">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`adm-notif-filter-chip ${filter === 'all' ? 'active' : ''}`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`adm-notif-filter-chip ${filter === 'unread' ? 'active' : ''}`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notifications List */}
            <div className="adm-notif-list">
              {filteredNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94a3b8' }}>
                  <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#334155', margin: '0 0 4px' }}>
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </p>
                  <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: 0 }}>
                    You are all up to date with proposals, registrations, and system events.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => handleNotificationClick(notif)}
                    className={`adm-notif-item ${notif.is_read === 0 ? 'unread' : ''}`}
                  >
                    <div className={`adm-notif-icon-pill ${notif.type}`}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="adm-notif-content">
                      <div className="adm-notif-item-title">{notif.title}</div>
                      <div className="adm-notif-item-desc">{notif.message}</div>
                      <div className="adm-notif-item-meta">
                        <Clock size={11} />
                        <span>{formatRelativeTime(notif.created_at)}</span>
                        <span style={{ textTransform: 'capitalize' }}>· {notif.type}</span>
                      </div>
                    </div>

                    {notif.is_read === 0 && <span className="adm-notif-unread-dot" title="Unread" />}
                  </button>
                ))
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="adm-notif-dropdown-footer">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setShowViewAllModal(true)
                }}
                className="adm-btn adm-btn-outline adm-btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>View All Notifications &amp; History</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View All Notifications Modal */}
      {showViewAllModal && (
        <div className="adm-modal-overlay" onClick={() => setShowViewAllModal(false)}>
          <div
            className="adm-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="adm-modal-header">
              <div className="adm-modal-title" id="modal-title">
                <Bell size={18} color="#00c9f2" />
                <span>All Administrative Notifications &amp; Alerts</span>
              </div>
              <button
                type="button"
                onClick={() => setShowViewAllModal(false)}
                className="adm-btn adm-btn-outline adm-btn-sm"
                style={{ padding: '6px' }}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Controls / Filters */}
            <div
              style={{
                padding: '14px 24px',
                borderBottom: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                <Search
                  size={14}
                  style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="adm-input adm-input-light"
                  style={{ padding: '7px 12px 7px 32px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={modalTypeFilter}
                  onChange={(e) => setModalTypeFilter(e.target.value)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: '#334155',
                    background: '#ffffff',
                    outline: 'none',
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="inquiry">Inquiries</option>
                  <option value="quote">Quotes</option>
                  <option value="user">Clients &amp; Users</option>
                  <option value="application">Career Applications</option>
                  <option value="audit">Admin Security</option>
                </select>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="adm-btn adm-btn-outline adm-btn-sm"
                  >
                    <CheckCheck size={13} color="#059669" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>

            <div className="adm-modal-body">
              {modalFilteredNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>
                    No matching notifications found
                  </p>
                  <p style={{ fontSize: '12px', margin: 0 }}>
                    Try adjusting your search query or type filter.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {modalFilteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        background: notif.is_read === 0 ? 'rgba(0, 201, 242, 0.05)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00c9f2')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor =
                          notif.is_read === 0 ? 'rgba(0, 201, 242, 0.3)' : '#e2e8f0')
                      }
                    >
                      <div className={`adm-notif-icon-pill ${notif.type}`} style={{ marginTop: '2px' }}>
                        {getNotificationIcon(notif.type)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            marginBottom: '4px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '13.5px',
                              fontWeight: '700',
                              color: '#0f172a',
                            }}
                          >
                            {notif.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {formatRelativeTime(notif.created_at)}
                          </div>
                        </div>

                        <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.4, marginBottom: '6px' }}>
                          {notif.message}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
                          <span
                            style={{
                              textTransform: 'capitalize',
                              fontWeight: '700',
                              color: '#0284c7',
                              background: 'rgba(0, 201, 242, 0.1)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {notif.type}
                          </span>
                          <span style={{ color: '#0284c7', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            Navigate to page <ExternalLink size={10} />
                          </span>
                        </div>
                      </div>

                      {notif.is_read === 0 && (
                        <span className="adm-notif-unread-dot" title="Unread" style={{ marginTop: '8px' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                onClick={() => setShowViewAllModal(false)}
                className="adm-btn adm-btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
