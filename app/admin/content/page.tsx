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
  { value: 'projects', label: 'Projects (/projects)', path: '/projects/swekas-luxe' },
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
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
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
  const [formButtonText, setFormButtonText] = useState('')
  const [formButtonUrl, setFormButtonUrl] = useState('')
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0)
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('published')

  // Image Picker State
  const [imageCurrentUrl, setImageCurrentUrl] = useState<string | null>(null)
  const [imageAltText, setImageAltText] = useState('')
  const [imageSelectedFile, setImageSelectedFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [modalTab, setModalTab] = useState<'form' | 'preview'>('form')

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
        if (res.status === 401) {
          throw new Error('Authentication required. Please log in again.')
        }
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

  // Context-aware section options when formPage changes
  const currentSectionOptions = useMemo(() => {
    return SECTION_OPTIONS[formPage] || SECTION_OPTIONS.home
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
    setModalTab('form')
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
    setModalTab('form')
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

  // Filtered Content List
  const filteredContent = useMemo(() => {
    return contentList.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(q)
        const matchSub = (item.subtitle || '').toLowerCase().includes(q)
        const matchDesc = item.short_description.toLowerCase().includes(q)
        const matchBtn = (item.button_text || '').toLowerCase().includes(q)
        if (!matchTitle && !matchSub && !matchDesc && !matchBtn) return false
      }
      // Page filter
      if (filterPage !== 'all' && item.page !== filterPage) return false
      // Section filter
      if (filterSection !== 'all' && item.section !== filterSection) return false
      // Status filter
      if (filterStatus !== 'all' && item.status !== filterStatus) return false
      return true
    })
  }, [contentList, searchQuery, filterPage, filterSection, filterStatus])

  // Metrics
  const stats = useMemo(() => {
    const total = contentList.length
    const published = contentList.filter((c) => c.status === 'published').length
    const drafts = total - published
    return { total, published, drafts }
  }, [contentList])

  // Live Card Preview Construct
  const activePreviewData = useMemo(() => {
    if (previewItem) return previewItem
    return {
      id: 'preview_temp',
      title: formTitle || 'Example Content Title',
      subtitle: formSubtitle || 'Subheading / Tagline',
      short_description:
        formShortDesc ||
        'This is a preview of the content description as it will appear in the card component on the website.',
      full_description: formFullDesc || null,
      image_url: imagePreviewUrl || imageCurrentUrl || '/projects/featured-zarabot-hq.png',
      image_alt: imageAltText || formTitle || 'Content image preview',
      page: formPage,
      section: formSection,
      button_text: formButtonText || 'Learn More',
      button_url: formButtonUrl || '#',
      display_order: formDisplayOrder,
      status: formStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ContentItem
  }, [
    previewItem,
    formTitle,
    formSubtitle,
    formShortDesc,
    formFullDesc,
    imagePreviewUrl,
    imageCurrentUrl,
    imageAltText,
    formPage,
    formSection,
    formButtonText,
    formButtonUrl,
    formDisplayOrder,
    formStatus,
  ])

  return (
    <div className="adm-page" style={{ padding: '24px 32px', color: '#f1f5f9' }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            background: toast.type === 'success' ? '#064e3b' : '#7f1d1d',
            color: '#ffffff',
            border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(0, 201, 242, 0.15)',
                display: 'grid',
                placeItems: 'center',
                color: '#00c9f2',
                border: '1px solid rgba(0, 201, 242, 0.3)',
              }}
            >
              <FileText size={20} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Content Management
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Add, update, preview, and publish dynamic content, headlines, images, and descriptions across the website.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={fetchContent}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#0a1a30',
              border: '1px solid #1e3a5f',
              color: '#94a3b8',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleAddNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00c9f2, #00dfa5)',
              border: 'none',
              color: '#031422',
              fontSize: '13px',
              fontWeight: 750,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 201, 242, 0.25)',
            }}
          >
            <Plus size={16} />
            <span>Add New Content</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            background: '#091528',
            border: '1px solid #152744',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Total Content Items</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              {stats.total}
            </div>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0, 201, 242, 0.1)', color: '#00c9f2' }}>
            <FileText size={20} />
          </div>
        </div>

        <div
          style={{
            background: '#091528',
            border: '1px solid #152744',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Published Live</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e', marginTop: '2px' }}>
              {stats.published}
            </div>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <Globe size={20} />
          </div>
        </div>

        <div
          style={{
            background: '#091528',
            border: '1px solid #152744',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Saved as Draft</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
              {stats.drafts}
            </div>
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <EyeOff size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#091528',
          border: '1px solid #152744',
          borderRadius: '12px',
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
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
            />
            <input
              type="text"
              placeholder="Search by title, description, or button..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#050c18',
                border: '1px solid #192a45',
                borderRadius: '8px',
                padding: '8px 12px 8px 34px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Page Dropdown Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Page:</span>
            <select
              value={filterPage}
              onChange={(e) => {
                setFilterPage(e.target.value)
                setFilterSection('all')
              }}
              style={{
                background: '#050c18',
                border: '1px solid #192a45',
                borderRadius: '8px',
                padding: '8px 10px',
                color: '#ffffff',
                fontSize: '12.5px',
                outline: 'none',
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

          {/* Section Dropdown Filter (Context aware) */}
          {filterPage !== 'all' && SECTION_OPTIONS[filterPage] && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Section:</span>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                style={{
                  background: '#050c18',
                  border: '1px solid #192a45',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  outline: 'none',
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
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: '#050c18',
                border: '1px solid #192a45',
                borderRadius: '8px',
                padding: '8px 10px',
                color: '#ffffff',
                fontSize: '12.5px',
                outline: 'none',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#050c18', padding: '3px', borderRadius: '8px', border: '1px solid #192a45' }}>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: viewMode === 'grid' ? '#0f2442' : 'transparent',
              color: viewMode === 'grid' ? '#00c9f2' : '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <LayoutGrid size={14} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: viewMode === 'table' ? '#0f2442' : 'transparent',
              color: viewMode === 'table' ? '#00c9f2' : '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <List size={14} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#00c9f2' }} />
          <p style={{ fontSize: '14px' }}>Loading website content items...</p>
        </div>
      ) : error ? (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            color: '#f87171',
          }}
        >
          <AlertCircle size={32} style={{ margin: '0 auto 10px' }} />
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button
            type="button"
            onClick={fetchContent}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      ) : filteredContent.length === 0 ? (
        <div
          style={{
            background: '#091528',
            border: '1px solid #152744',
            borderRadius: '16px',
            padding: '60px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(0, 201, 242, 0.1)',
              color: '#00c9f2',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
            }}
          >
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
            No Content Found
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '440px', margin: '0 auto 20px' }}>
            {searchQuery || filterPage !== 'all' || filterStatus !== 'all'
              ? 'No content items match your active filters. Try clearing your filters or search term.'
              : 'You have not created any custom content items yet. Click below to add your first dynamic website card.'}
          </p>
          <button
            type="button"
            onClick={handleAddNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00c9f2, #00dfa5)',
              border: 'none',
              color: '#031422',
              fontSize: '13px',
              fontWeight: 750,
              cursor: 'pointer',
            }}
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredContent.map((item) => {
            const pageObj = PAGE_OPTIONS.find((p) => p.value === item.page)
            return (
              <div
                key={item.id}
                style={{
                  background: '#091528',
                  border: '1px solid #152744',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, border-color 0.2s',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Card Thumbnail */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '180px',
                    background: '#030a14',
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
                        color: '#334155',
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
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 750,
                        textTransform: 'uppercase',
                        background:
                          item.status === 'published' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(245, 158, 11, 0.9)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#ffffff',
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
                        background: 'rgba(5, 12, 24, 0.85)',
                        color: '#38bdf8',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
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
                      <h3 style={{ fontSize: '16px', fontWeight: 750, color: '#ffffff', margin: 0 }}>
                        {item.title}
                      </h3>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        #{item.display_order}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#00c9f2', fontWeight: 600 }}>
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: '12.5px',
                      color: '#94a3b8',
                      lineHeight: 1.5,
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
                        color: '#38bdf8',
                        marginBottom: '14px',
                        padding: '6px 10px',
                        background: 'rgba(56, 189, 248, 0.08)',
                        borderRadius: '6px',
                        border: '1px solid rgba(56, 189, 248, 0.15)',
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
                      borderTop: '1px solid #152744',
                    }}
                  >
                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid #1e3a5f',
                        color: '#cbd5e1',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      title="Preview Card"
                    >
                      <Eye size={13} />
                      <span>Preview</span>
                    </button>

                    {/* Quick Publish / Unpublish Toggle */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item)}
                      disabled={togglingId === item.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background:
                          item.status === 'published' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        border: `1px solid ${item.status === 'published' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                        color: item.status === 'published' ? '#f59e0b' : '#22c55e',
                        fontSize: '12px',
                        fontWeight: 600,
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
                      <span>{item.status === 'published' ? 'Unpublish' : 'Publish'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(0, 201, 242, 0.1)',
                        border: '1px solid rgba(0, 201, 242, 0.3)',
                        color: '#00c9f2',
                        fontSize: '12px',
                        fontWeight: 600,
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
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#f87171',
                        cursor: 'pointer',
                      }}
                      title="Delete Content"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table View */
        <div
          style={{
            background: '#091528',
            border: '1px solid #152744',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#060e1c', borderBottom: '1px solid #152744', color: '#94a3b8' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Content</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Page &amp; Section</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Order</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Updated</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContent.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #0f1d33',
                      transition: 'background 0.15s',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
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
                              background: '#040b15',
                              border: '1px solid #152744',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              background: '#0a1a30',
                              border: '1px solid #152744',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#64748b',
                            }}
                          >
                            <FileText size={18} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff' }}>{item.title}</div>
                          {item.subtitle && (
                            <div style={{ fontSize: '11.5px', color: '#00c9f2' }}>{item.subtitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                        }}
                      >
                        /{item.page}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                        {item.section.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#cbd5e1' }}>
                      #{item.display_order}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background:
                            item.status === 'published' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: item.status === 'published' ? '#22c55e' : '#f59e0b',
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '12px', color: '#64748b' }}>
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          style={{
                            padding: '6px 8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                          }}
                          title="Preview"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          style={{
                            padding: '6px 8px',
                            background: 'transparent',
                            border: 'none',
                            color: item.status === 'published' ? '#f59e0b' : '#22c55e',
                            cursor: 'pointer',
                          }}
                          title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {item.status === 'published' ? <EyeOff size={15} /> : <Globe size={15} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          style={{
                            padding: '6px 8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#00c9f2',
                            cursor: 'pointer',
                          }}
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem(item)}
                          style={{
                            padding: '6px 8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#f87171',
                            cursor: 'pointer',
                          }}
                          title="Delete"
                        >
                          <Trash2 size={15} />
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
          MODAL: ADD / EDIT CONTENT FORM WITH LIVE PREVIEW
          ======================================================== */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            background: 'rgba(3, 10, 20, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '840px',
              maxHeight: '90vh',
              background: '#091528',
              border: '1px solid #1e3a5f',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #152744',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {editingItem ? 'Edit Content Item' : 'Add New Website Content'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Define titles, descriptions, imagery, and target placements on the live website.
                </p>
              </div>

              {/* Tabs: Form vs Live Card Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#050c18',
                  padding: '4px',
                  borderRadius: '8px',
                  border: '1px solid #192a45',
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalTab('form')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: modalTab === 'form' ? '#0f2442' : 'transparent',
                    color: modalTab === 'form' ? '#00c9f2' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Editor Form
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('preview')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: modalTab === 'preview' ? '#0f2442' : 'transparent',
                    color: modalTab === 'preview' ? '#00c9f2' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Eye size={13} />
                  <span>Live Preview</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {modalTab === 'form' ? (
                <form id="content-form" onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Row 1: Title & Subtitle */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
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
                          background: '#050c18',
                          border: '1px solid #192a45',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#ffffff',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                        Subtitle / Tagline <span style={{ color: '#64748b' }}>(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Multilingual RAG Engine"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#050c18',
                          border: '1px solid #192a45',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#ffffff',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 2: Target Page & Section Placement */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                        Target Website Page <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={formPage}
                        onChange={(e) => setFormPage(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#050c18',
                          border: '1px solid #192a45',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#ffffff',
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
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Select which page on thenamsoftwaresolutions.com will display this item.
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                        Placement Section <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={formSection}
                        onChange={(e) => setFormSection(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#050c18',
                          border: '1px solid #192a45',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#ffffff',
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
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        {currentSectionOptions.find((s) => s.value === formSection)?.desc || 'Target layout slot.'}
                      </span>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
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
                        background: '#050c18',
                        border: '1px solid #192a45',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                      Full Description / Body <span style={{ color: '#64748b' }}>(optional expanded details)</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Extended description for detailed views or expanded modal dialogs..."
                      value={formFullDesc}
                      onChange={(e) => setFormFullDesc(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#050c18',
                        border: '1px solid #192a45',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Image Picker Integration */}
                  <div style={{ background: '#050c18', padding: '16px', borderRadius: '12px', border: '1px solid #152744' }}>
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
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                        Button Label <span style={{ color: '#64748b' }}>(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Explore Case Study"
                        value={formButtonText}
                        onChange={(e) => setFormButtonText(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#050c18',
                          border: '1px solid #192a45',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#ffffff',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                        Button Destination URL <span style={{ color: '#64748b' }}>(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /services, /contact, or external URL"
                        value={formButtonUrl}
                        onChange={(e) => setFormButtonUrl(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#050c18',
                          border: '1px solid #192a45',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#ffffff',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
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
                          background: '#050c18',
                          border: '1px solid #192a45',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#ffffff',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Lower numbers appear first.
                      </span>
                    </div>
                  </div>

                  {/* Status Setting */}
                  <div style={{ background: '#050c18', padding: '14px 18px', borderRadius: '10px', border: '1px solid #152744' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
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
                        <span style={{ color: '#22c55e', fontWeight: 700 }}>Published (Live on Website)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        <input
                          type="radio"
                          name="status"
                          value="draft"
                          checked={formStatus === 'draft'}
                          onChange={() => setFormStatus('draft')}
                        />
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>Draft (Private, not visible publicly)</span>
                      </label>
                    </div>
                  </div>
                </form>
              ) : (
                /* Live Card Preview Inside Modal */
                <div>
                  <div
                    style={{
                      background: 'rgba(0, 201, 242, 0.08)',
                      border: '1px solid rgba(0, 201, 242, 0.2)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      fontSize: '12.5px',
                      color: '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Sparkles size={16} color="#00c9f2" />
                    <span>
                      Live visual simulation of this content card as it renders on{' '}
                      <strong>/{formPage}</strong> in the <strong>{formSection}</strong> section.
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '420px' }}>
                      <ContentCardPreview item={activePreviewData} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #152744',
                background: '#060e1c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid #1e3a5f',
                  color: '#94a3b8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={(e) => handleSubmitForm(e, 'draft')}
                  disabled={submitting}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    background: '#152744',
                    border: '1px solid #23416d',
                    color: '#f59e0b',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Save as Draft
                </button>

                <button
                  type="submit"
                  form="content-form"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 22px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #00c9f2, #00dfa5)',
                    border: 'none',
                    color: '#031422',
                    fontSize: '13px',
                    fontWeight: 750,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 201, 242, 0.25)',
                  }}
                >
                  {submitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Check size={15} />
                  )}
                  <span>{editingItem ? 'Save Changes' : 'Publish Content'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: STANDALONE FULL PREVIEW MODAL
          ======================================================== */}
      {previewItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9100,
            background: 'rgba(3, 10, 20, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              background: '#091528',
              border: '1px solid #1e3a5f',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #152744',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Live Component Preview
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Target: <strong>/{previewItem.page}</strong> (section: {previewItem.section})
                </span>
              </div>

              {/* Viewport toggles */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: previewDevice === 'desktop' ? '#0f2442' : 'transparent',
                    color: previewDevice === 'desktop' ? '#00c9f2' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Monitor size={14} />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: previewDevice === 'mobile' ? '#0f2442' : 'transparent',
                    color: previewDevice === 'mobile' ? '#00c9f2' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Smartphone size={14} />
                  <span>Mobile</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview Box */}
            <div
              style={{
                padding: '30px',
                background: '#040d1a',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '380px',
              }}
            >
              <div style={{ width: previewDevice === 'mobile' ? '320px' : '460px', transition: 'width 0.3s' }}>
                <ContentCardPreview item={previewItem} />
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #152744',
                background: '#060e1c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background:
                      previewItem.status === 'published' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: previewItem.status === 'published' ? '#22c55e' : '#f59e0b',
                  }}
                >
                  STATUS: {previewItem.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Order: #{previewItem.display_order}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleTogglePublish(previewItem)
                    setPreviewItem((prev) =>
                      prev ? { ...prev, status: prev.status === 'published' ? 'draft' : 'published' } : null
                    )
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: previewItem.status === 'published' ? '#152744' : 'linear-gradient(135deg, #00c9f2, #00dfa5)',
                    color: previewItem.status === 'published' ? '#f59e0b' : '#031422',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {previewItem.status === 'published' ? 'Switch to Draft' : 'Publish Live Now'}
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#1e3a5f',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRM DELETION
          ======================================================== */}
      {deleteConfirmItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9200,
            background: 'rgba(3, 10, 20, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#091528',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
              Confirm Deletion
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete{' '}
              <strong style={{ color: '#ffffff' }}>"{deleteConfirmItem.title}"</strong>?
              It will be immediately removed from the live website.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={submitting}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid #1e3a5f',
                  color: '#94a3b8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
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

// Reusable Visual Preview Component matching THENAM Card Styling
function ContentCardPreview({ item }: { item: ContentItem }) {
  return (
    <article
      style={{
        background: '#081426',
        border: '1px solid #162642',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Media Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          background: '#030a14',
          overflow: 'hidden',
        }}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.image_alt || item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#334155' }}>
            <FileText size={36} />
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            background: 'rgba(0, 201, 242, 0.2)',
            color: '#00c9f2',
            border: '1px solid rgba(0, 201, 242, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {item.page}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#00dfa5',
            marginBottom: '4px',
            display: 'block',
          }}
        >
          {item.subtitle || item.section.replace(/_/g, ' ')}
        </span>

        <h3
          style={{
            fontSize: '16.5px',
            fontWeight: 800,
            color: '#ffffff',
            margin: '0 0 8px',
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </h3>

        <p
          style={{
            fontSize: '12.5px',
            color: '#94a3b8',
            lineHeight: 1.5,
            margin: '0 0 16px',
            flex: 1,
          }}
        >
          {item.short_description}
        </p>

        {item.button_text && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(0, 201, 242, 0.15), rgba(0, 223, 165, 0.15))',
              border: '1px solid rgba(0, 201, 242, 0.35)',
              color: '#00c9f2',
              fontSize: '12px',
              fontWeight: 700,
              marginTop: 'auto',
            }}
          >
            <span>{item.button_text}</span>
            <ArrowRight size={13} />
          </div>
        )}
      </div>
    </article>
  )
}

