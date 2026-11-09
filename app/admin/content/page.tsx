'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Globe,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Layers,
  LayoutGrid,
  List,
  Check,
  X,
  Smartphone,
  Monitor,
} from 'lucide-react'
import AdminImagePicker from '@/components/admin/AdminImagePicker'

interface ContentItem {
  id: string
  title: string
  subtitle: string | null
  short_description: string
  full_description: string | null
  image_url: string | null
  image_alt: string | null
  page: string
  section: string
  button_text: string | null
  button_url: string | null
  display_order: number
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

// Actual website routes mapped to friendly display names
const PAGE_OPTIONS = [
  { value: 'home', label: 'Homepage (/)', path: '/' },
  { value: 'services', label: 'Services (/services)', path: '/services' },
  { value: 'products', label: 'Products (/products)', path: '/products' },
  { value: 'projects', label: 'Projects (/projects)', path: '/projects' },
  { value: 'about', label: 'About Us (/about)', path: '/about' },
  { value: 'careers', label: 'Careers (/careers)', path: '/careers' },
  { value: 'collaboration', label: 'Collaboration (/collaboration)', path: '/collaboration' },
]

// Context-aware section placements for each page
const SECTION_OPTIONS: Record<string, Array<{ value: string; label: string; desc: string }>> = {
  home: [
    { value: 'featured_work', label: 'Featured Work & Products', desc: 'Appears in the horizontal Featured Work cards section' },
    { value: 'services_highlight', label: 'Service Highlights', desc: 'Appears alongside core capability cards' },
    { value: 'announcements', label: 'Announcements & Updates', desc: 'High-visibility notification banner / strip' },
    { value: 'highlights', label: 'Technology Highlights', desc: 'Dynamic engineering highlights on the homepage' },
  ],
  services: [
    { value: 'offerings', label: 'Specialty Offerings & Packages', desc: 'Dynamic custom service cards on /services' },
    { value: 'features', label: 'Enterprise Features & Highlights', desc: 'Spotlight modules on enterprise solutions' },
    { value: 'case_studies', label: 'Service Case Studies', desc: 'Client result cards linked to services' },
  ],
  products: [
    { value: 'showcase', label: 'Proprietary Software Solutions', desc: 'Dynamic product cards on /products' },
    { value: 'upcoming', label: 'In-Development & Beta Tools', desc: 'Preview upcoming products' },
    { value: 'integrations', label: 'Telemetry & Integrations', desc: 'Platform connectivity highlights' },
  ],
  projects: [
    { value: 'portfolio', label: 'Client Work & Portfolio', desc: 'Portfolio cards on project detail pages' },
    { value: 'client_stories', label: 'Client Success Stories', desc: 'Results and testimonial highlights' },
  ],
  about: [
    { value: 'initiatives', label: 'Company Initiatives & Impact', desc: 'Appears on /about under initiatives' },
    { value: 'values', label: 'Core Principles & Values', desc: 'Engineering culture spotlights' },
  ],
  careers: [
    { value: 'perks', label: 'Perks & Team Culture', desc: 'Life at Thenam spotlights' },
    { value: 'spotlights', label: 'Engineering Spotlights', desc: 'Team member & project stories' },
  ],
  collaboration: [
    { value: 'partnerships', label: 'Partnership Programs', desc: 'Academic and enterprise alliance models' },
    { value: 'initiatives', label: 'Joint R&D & Co-Creation', desc: 'Collaborative engineering pods' },
  ],
}

export default function AdminContentPage() {
  const [contentList, setContentList] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPage, setFilterPage] = useState<string>('all')
  const [filterSection, setFilterSection] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ContentItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Form State
  const [formTitle, setFormTitle] = useState('')
  const [formSubtitle, setFormSubtitle] = useState('')
  const [formShortDesc, setFormShortDesc] = useState('')
  const [formFullDesc, setFormFullDesc] = useState('')
  const [formPage, setFormPage] = useState('home')
  const [formSection, setFormSection] = useState('featured_work')
  const [formButtonText, setFormButtonText] = useState('Explore Solution')
  const [formButtonUrl, setFormButtonUrl] = useState('/services')
  const [formDisplayOrder, setFormDisplayOrder] = useState(0)
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('published')

  // Image State
  const [imageCurrentUrl, setImageCurrentUrl] = useState<string | null>(null)
  const [imageAltText, setImageAltText] = useState('')
  const [imageSelectedFile, setImageSelectedFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // Fetch all content items
  const fetchContent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/content')
      if (!res.ok) {
        throw new Error('Failed to load content items.')
      }
      const data = await res.json()
      setContentList(data.content || [])
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error fetching content.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // Context-aware section options based on selected formPage
  const currentSectionOptions = useMemo(() => {
    return SECTION_OPTIONS[formPage] || []
  }, [formPage])

  // Reset section when page changes in modal form if not valid
  useEffect(() => {
    const valid = currentSectionOptions.some((s) => s.value === formSection)
    if (!valid && currentSectionOptions.length > 0) {
      setFormSection(currentSectionOptions[0].value)
    }
  }, [formPage, formSection, currentSectionOptions])

  // Open modal for Adding New Content
  const handleAddNew = () => {
    setEditingItem(null)
    setFormTitle('')
    setFormSubtitle('')
    setFormShortDesc('')
    setFormFullDesc('')
    setFormPage('home')
    setFormSection('featured_work')
    setFormButtonText('Explore Solution')
    setFormButtonUrl('/services')
    setFormDisplayOrder(0)
    setFormStatus('published')
    setImageCurrentUrl(null)
    setImageAltText('')
    setImageSelectedFile(null)
    setImagePreviewUrl(null)
    setIsModalOpen(true)
  }

  // Open modal for Editing Existing Content
  const handleEdit = (item: ContentItem) => {
    setEditingItem(item)
    setFormTitle(item.title)
    setFormSubtitle(item.subtitle || '')
    setFormShortDesc(item.short_description)
    setFormFullDesc(item.full_description || '')
    setFormPage(item.page)
    setFormSection(item.section)
    setFormButtonText(item.button_text || '')
    setFormButtonUrl(item.button_url || '')
    setFormDisplayOrder(item.display_order)
    setFormStatus(item.status)
    setImageCurrentUrl(item.image_url)
    setImageAltText(item.image_alt || '')
    setImageSelectedFile(null)
    setImagePreviewUrl(null)
    setIsModalOpen(true)
  }

  // Quick Toggle Publish / Unpublish
  const handleTogglePublish = async (item: ContentItem) => {
    setTogglingId(item.id)
    const newStatus = item.status === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/admin/content/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status.')
      const data = await res.json()
      setContentList((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, status: data.item.status, updated_at: data.item.updated_at } : c))
      )
      showToast(
        'success',
        `Content "${item.title}" is now ${newStatus === 'published' ? 'Published live' : 'saved as Draft'}.`
      )
    } catch (err: unknown) {
      console.error(err)
      showToast('error', err instanceof Error ? err.message : 'Error updating publish status.')
    } finally {
      setTogglingId(null)
    }
  }

  // Submit Add or Edit Form
  const handleSubmitForm = async (e: React.FormEvent, overrideStatus?: 'draft' | 'published') => {
    e.preventDefault()
    if (!formTitle.trim()) {
      showToast('error', 'Content title is required.')
      return
    }
    if (!formShortDesc.trim()) {
      showToast('error', 'Short description is required.')
      return
    }

    setSubmitting(true)
    try {
      let finalImageUrl = imageCurrentUrl

      // Upload file first if a new file was chosen
      if (imageSelectedFile) {
        const formData = new FormData()
        formData.append('file', imageSelectedFile)
        formData.append('alt_text', imageAltText.trim() || formTitle.trim())
        formData.append('section_tag', formPage)

        const uploadRes = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        })
        if (!uploadRes.ok) {
          const errData = await uploadRes.json()
          throw new Error(errData.error || 'Image upload failed. Content was not saved.')
        }
        const uploadData = await uploadRes.json()
        finalImageUrl = uploadData.media?.url || uploadData.url
      }

      const payload = {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || null,
        short_description: formShortDesc.trim(),
        full_description: formFullDesc.trim() || null,
        image_url: finalImageUrl,
        image_alt: imageAltText.trim() || formTitle.trim(),
        page: formPage,
        section: formSection,
        button_text: formButtonText.trim() || null,
        button_url: formButtonUrl.trim() || null,
        display_order: Number(formDisplayOrder) || 0,
        status: overrideStatus || formStatus,
      }

      const url = editingItem ? `/api/admin/content/${editingItem.id}` : '/api/admin/content'
      const method = editingItem ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save content item.')
      }

      const data = await res.json()
      showToast(
        'success',
        editingItem
          ? `Updated "${data.item.title}" successfully.`
          : `Created new content "${data.item.title}" (${data.item.status}).`
      )

      setIsModalOpen(false)
      fetchContent()
    } catch (err: unknown) {
      console.error(err)
      showToast('error', err instanceof Error ? err.message : 'Error saving content.')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Content Item
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmItem) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/content/${deleteConfirmItem.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to delete content item.')
      }
      showToast('success', `Deleted "${deleteConfirmItem.title}" successfully.`)
      setContentList((prev) => prev.filter((c) => c.id !== deleteConfirmItem.id))
      setDeleteConfirmItem(null)
    } catch (err: unknown) {
      console.error(err)
      showToast('error', err instanceof Error ? err.message : 'Error deleting content.')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter content items
  const filteredContent = useMemo(() => {
    return contentList.filter((item) => {
      if (filterPage !== 'all' && item.page !== filterPage) return false
      if (filterSection !== 'all' && item.section !== filterSection) return false
      if (filterStatus !== 'all' && item.status !== filterStatus) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(q)
        const matchSubtitle = (item.subtitle || '').toLowerCase().includes(q)
        const matchDesc = item.short_description.toLowerCase().includes(q)
        const matchBtn = (item.button_text || '').toLowerCase().includes(q)
        if (!matchTitle && !matchSubtitle && !matchDesc && !matchBtn) return false
      }
      return true
    })
  }, [contentList, searchQuery, filterPage, filterSection, filterStatus])

  // Counts
  const stats = useMemo(() => {
    const total = contentList.length
    const published = contentList.filter((c) => c.status === 'published').length
    const drafts = contentList.filter((c) => c.status === 'draft').length
    return { total, published, drafts }
  }, [contentList])

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '10px',
            background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: toast.type === 'success' ? '#065f46' : '#991b1b',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            fontSize: '13.5px',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} color="#10b981" />
          ) : (
            <AlertCircle size={18} color="#ef4444" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#e0f2fe',
                display: 'grid',
                placeItems: 'center',
                color: '#0284c7',
                border: '1px solid #bae6fd',
              }}
            >
              <FileText size={20} />
            </div>
            <h1 className="adm-page-title" style={{ margin: 0, color: '#0f172a' }}>
              Content Management
            </h1>
          </div>
          <p className="adm-page-desc" style={{ margin: '6px 0 0', color: '#64748b' }}>
            Add, update, preview, and publish dynamic content, headlines, images, and descriptions across the website.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchContent}
            disabled={loading}
            className="adm-btn adm-btn-outline"
            title="Refresh Content"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleAddNew}
            className="adm-btn adm-btn-primary"
          >
            <Plus size={16} />
            <span>Add New Content</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="adm-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="adm-stat-card">
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Content Items</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {stats.total}
            </div>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7' }}>
            <FileText size={22} />
          </div>
        </div>

        <div className="adm-stat-card">
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Published Live</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
              {stats.published}
            </div>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a' }}>
            <Globe size={22} />
          </div>
        </div>

        <div className="adm-stat-card">
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Saved as Draft</span>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
              {stats.drafts}
            </div>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: '#fef3c7', color: '#d97706' }}>
            <EyeOff size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="adm-card"
        style={{
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', flex: 1, minWidth: '300px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by title, description, or button..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px 8px 34px',
                color: '#0f172a',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Page Dropdown Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Page:</span>
            <select
              value={filterPage}
              onChange={(e) => {
                setFilterPage(e.target.value)
                setFilterSection('all')
              }}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 10px',
                color: '#0f172a',
                fontSize: '12.5px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Pages</option>
              {PAGE_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Section Dropdown Filter */}
          {filterPage !== 'all' && SECTION_OPTIONS[filterPage] && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Section:</span>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#0f172a',
                  fontSize: '12.5px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Sections</option>
                {SECTION_OPTIONS[filterPage].map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 10px',
                color: '#0f172a',
                fontSize: '12.5px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: viewMode === 'grid' ? '#ffffff' : 'transparent',
              color: viewMode === 'grid' ? '#0284c7' : '#64748b',
              border: viewMode === 'grid' ? '1px solid #cbd5e1' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <LayoutGrid size={14} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: viewMode === 'table' ? '#ffffff' : 'transparent',
              color: viewMode === 'table' ? '#0284c7' : '#64748b',
              border: viewMode === 'table' ? '1px solid #cbd5e1' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <List size={14} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#0284c7' }} />
          <p style={{ fontSize: '14px', fontWeight: 500 }}>Loading website content items...</p>
        </div>
      ) : error ? (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            color: '#b91c1c',
          }}
        >
          <AlertCircle size={32} style={{ margin: '0 auto 10px' }} />
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button
            type="button"
            onClick={fetchContent}
            className="adm-btn adm-btn-primary"
            style={{ marginTop: '12px' }}
          >
            Retry
          </button>
        </div>
      ) : filteredContent.length === 0 ? (
        /* Empty State */
        <div
          className="adm-card"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            border: '2px dashed #cbd5e1',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
            }}
          >
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            No Content Found
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            {searchQuery || filterPage !== 'all' || filterStatus !== 'all'
              ? 'No content items match your active filters. Try clearing your filters or search term.'
              : 'You have not created any custom content items yet. Click below to add your first dynamic website card.'}
          </p>
          <button
            type="button"
            onClick={handleAddNew}
            className="adm-btn adm-btn-primary"
          >
            <Plus size={16} />
            <span>Add New Content</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredContent.map((item) => {
            const pageObj = PAGE_OPTIONS.find((p) => p.value === item.page)
            return (
              <div
                key={item.id}
                className="adm-card"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* Card Thumbnail */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '180px',
                    background: '#f1f5f9',
                    overflow: 'hidden',
                  }}
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.image_alt || item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#94a3b8',
                      }}
                    >
                      <FileText size={40} />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 750,
                        textTransform: 'uppercase',
                        background:
                          item.status === 'published' ? '#dcfce7' : '#fef3c7',
                        color: item.status === 'published' ? '#15803d' : '#b45309',
                        border: `1px solid ${item.status === 'published' ? '#86efac' : '#fde68a'}`,
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: item.status === 'published' ? '#15803d' : '#b45309',
                        }}
                      />
                      {item.status}
                    </span>
                  </div>

                  {/* Page & Section Badge */}
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 2 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.95)',
                        color: '#0284c7',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid #bae6fd',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      }}
                    >
                      <span>{pageObj?.label.split(' ')[0] || item.page}</span>
                      <span style={{ opacity: 0.5 }}>•</span>
                      <span>{item.section.replace(/_/g, ' ')}</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {item.title}
                      </h3>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        #{item.display_order}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: '13px',
                      color: '#475569',
                      lineHeight: 1.55,
                      margin: '0 0 14px',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.short_description}
                  </p>

                  {/* Button Destination info */}
                  {item.button_text && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11.5px',
                        color: '#0284c7',
                        marginBottom: '14px',
                        padding: '6px 10px',
                        background: '#f0f9ff',
                        borderRadius: '6px',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      <ArrowRight size={13} />
                      <span style={{ fontWeight: 600 }}>{item.button_text}</span>
                      {item.button_url && (
                        <span style={{ color: '#64748b', marginLeft: 'auto', fontSize: '10.5px' }}>
                          {item.button_url}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    {/* Quick Publish / Unpublish Toggle */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item)}
                      disabled={togglingId === item.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: item.status === 'published' ? '#fef3c7' : '#dcfce7',
                        border: `1px solid ${item.status === 'published' ? '#fde68a' : '#86efac'}`,
                        color: item.status === 'published' ? '#b45309' : '#15803d',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title={item.status === 'published' ? 'Unpublish (Make Draft)' : 'Publish Live'}
                    >
                      {togglingId === item.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : item.status === 'published' ? (
                        <EyeOff size={13} />
                      ) : (
                        <Globe size={13} />
                      )}
                      <span>{item.status === 'published' ? 'Draft' : 'Publish'}</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          color: '#0284c7',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        title="Edit Content"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmItem(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          cursor: 'pointer',
                        }}
                        title="Delete Content"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table View */
        <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Page &amp; Section</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContent.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid #e2e8f0',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              background: '#f1f5f9',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#94a3b8',
                            }}
                          >
                            <FileText size={18} />
                          </div>
                        )}
                        <div>
                          <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>{item.title}</strong>
                          {item.subtitle && (
                            <span style={{ display: 'block', fontSize: '11px', color: '#0284c7' }}>
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{item.page}</span>
                      <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>
                        {item.section.replace(/_/g, ' ')}
                      </small>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>#{item.display_order}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: item.status === 'published' ? '#dcfce7' : '#fef3c7',
                          color: item.status === 'published' ? '#15803d' : '#b45309',
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(item.updated_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          className="adm-btn adm-btn-outline adm-btn-sm"
                        >
                          {item.status === 'published' ? 'Draft' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="adm-btn adm-btn-outline adm-btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem(item)}
                          className="adm-btn adm-btn-danger adm-btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT CONTENT
          ======================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {editingItem ? 'Edit Content Item' : 'Add New Website Content'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  Define titles, descriptions, imagery, and target placements on the live website.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <form id="content-form" onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Row 1: Title & Subtitle */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Content Title <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Enterprise AI Knowledge Assistant"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#0f172a',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Subtitle / Tagline <span style={{ color: '#64748b' }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Multilingual RAG Engine"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#0f172a',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Row 2: Target Page & Section Placement */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Target Website Page <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formPage}
                      onChange={(e) => setFormPage(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#0f172a',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    >
                      {PAGE_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Placement Section <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formSection}
                      onChange={(e) => setFormSection(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#0f172a',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    >
                      {currentSectionOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Descriptions */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                    Short Description <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Concise overview displayed on the public card (1-3 sentences)..."
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                    Full Description / Body <span style={{ color: '#64748b' }}>(optional expanded details)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Extended description for detailed views or expanded modal dialogs..."
                    value={formFullDesc}
                    onChange={(e) => setFormFullDesc(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Image Picker Integration */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <AdminImagePicker
                    label="Content Feature Image"
                    currentUrl={imageCurrentUrl}
                    altText={imageAltText}
                    selectedFile={imageSelectedFile}
                    previewUrl={imagePreviewUrl}
                    onFileSelect={(file, preview) => {
                      setImageSelectedFile(file)
                      setImagePreviewUrl(preview)
                    }}
                    onUrlChange={(url) => {
                      setImageCurrentUrl(url)
                      setImageSelectedFile(null)
                      setImagePreviewUrl(null)
                    }}
                    onAltChange={(alt) => setImageAltText(alt)}
                    sectionTag={formPage === 'home' ? 'hero' : formPage === 'services' ? 'services' : formPage === 'products' ? 'products' : 'general'}
                    helpText="Upload a high-resolution PNG, JPG, WebP, or pick an existing graphic from your media library."
                  />
                </div>

                {/* Row 3: Button Label & Destination URL */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Button Label <span style={{ color: '#64748b' }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Explore Case Study"
                      value={formButtonText}
                      onChange={(e) => setFormButtonText(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#0f172a',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Button Destination URL <span style={{ color: '#64748b' }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /services, /contact, or external URL"
                      value={formButtonUrl}
                      onChange={(e) => setFormButtonUrl(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#0f172a',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(parseInt(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#0f172a',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Status Setting */}
                <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                    Publishing Status
                  </span>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={formStatus === 'published'}
                        onChange={() => setFormStatus('published')}
                      />
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>Published (Live on Website)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={formStatus === 'draft'}
                        onChange={() => setFormStatus('draft')}
                      />
                      <span style={{ color: '#d97706', fontWeight: 700 }}>Draft (Private, not visible publicly)</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                background: '#f8fafc',
              }}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="adm-btn adm-btn-outline"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="content-form"
                disabled={submitting}
                className="adm-btn adm-btn-primary"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>{editingItem ? 'Save Changes' : 'Create Content'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRM DELETION
          ======================================================== */}
      {deleteConfirmItem && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9200,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setDeleteConfirmItem(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#ffffff',
              border: '1px solid #fecaca',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>
              Confirm Deletion
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete{' '}
              <strong style={{ color: '#0f172a' }}>&ldquo;{deleteConfirmItem.title}&rdquo;</strong>?
              It will be immediately removed from the database.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={submitting}
                className="adm-btn adm-btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="adm-btn adm-btn-danger"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
