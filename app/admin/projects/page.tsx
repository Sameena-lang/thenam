'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Globe,
  Link2,
  Calendar,
  Layers,
  Search,
  Sparkles,
} from 'lucide-react'
import AdminImagePicker from '@/components/admin/AdminImagePicker'

interface ProjectRecord {
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
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function isValidUrl(val: string): boolean {
  if (!val || typeof val !== 'string') return false
  const trimmed = val.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true
  // Must not contain spaces
  if (/\s/.test(trimmed)) return false
  try {
    const url = !/^https?:\/\//i.test(trimmed) ? 'https://' + trimmed : trimmed
    const parsed = new URL(url)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.')
  } catch {
    return false
  }
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Full Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit')
  const [editingSlug, setEditingSlug] = useState<string>('')

  // Form Fields
  const [formSlug, setFormSlug] = useState('')
  const [formTitleFirst, setFormTitleFirst] = useState('')
  const [formTitleSecond, setFormTitleSecond] = useState('')
  const [formSubtitle, setFormSubtitle] = useState('')
  const [formCategoryEyebrow, setFormCategoryEyebrow] = useState('')
  const [formDomain, setFormDomain] = useState('')
  const [formVisitUrl, setFormVisitUrl] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formYear, setFormYear] = useState('')
  const [formPractice, setFormPractice] = useState('')
  const [formPhase, setFormPhase] = useState('Shipped')
  const [formShortDesc, setFormShortDesc] = useState('')
  const [formTag, setFormTag] = useState('')
  const [formTagType, setFormTagType] = useState('')
  const [formSortOrder, setFormSortOrder] = useState(1)
  const [formIsActive, setFormIsActive] = useState(true)

  // Image Picker State
  const [formMockupImage, setFormMockupImage] = useState('')
  const [formMockupAlt, setFormMockupAlt] = useState('')
  const [formMockupFile, setFormMockupFile] = useState<File | null>(null)
  const [formMockupPreview, setFormMockupPreview] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Quick Edit Visit Link Modal
  const [quickEditProject, setQuickEditProject] = useState<ProjectRecord | null>(null)
  const [quickVisitUrl, setQuickVisitUrl] = useState('')
  const [quickSaving, setQuickSaving] = useState(false)
  const [quickError, setQuickError] = useState<string | null>(null)

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<ProjectRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/projects')
      if (!res.ok) throw new Error('Failed to load projects from database')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error retrieving projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const showNotification = (msg: string) => {
    setSuccessNotice(msg)
    setTimeout(() => {
      setSuccessNotice((prev) => (prev === msg ? null : prev))
    }, 4500)
  }

  // Open Full Edit Modal
  const handleOpenEdit = (p: ProjectRecord) => {
    setModalMode('edit')
    setEditingSlug(p.slug)
    setFormSlug(p.slug)
    setFormTitleFirst(p.titleFirst)
    setFormTitleSecond(p.titleSecond)
    setFormSubtitle(p.subtitle)
    setFormCategoryEyebrow(p.categoryEyebrow)
    setFormDomain(p.domain)
    setFormVisitUrl(p.visitUrl)
    setFormCategory(p.category)
    setFormYear(p.year)
    setFormPractice(p.practice)
    setFormPhase(p.phase)
    setFormShortDesc(p.shortDesc)
    setFormTag(p.tag)
    setFormTagType(p.tagType)
    setFormSortOrder(p.sortOrder)
    setFormIsActive(p.isActive)
    setFormMockupImage(p.mockupImage)
    setFormMockupAlt(`${p.titleFirst} ${p.titleSecond} live showcase mockup`)
    setFormMockupFile(null)
    setFormMockupPreview(null)
    setFormError(null)
    setIsModalOpen(true)
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode('create')
    setEditingSlug('')
    setFormSlug('')
    setFormTitleFirst('')
    setFormTitleSecond('')
    setFormSubtitle('')
    setFormCategoryEyebrow('E-COMMERCE / BRANDING')
    setFormDomain('https://')
    setFormVisitUrl('https://')
    setFormCategory('E-commerce')
    setFormYear(new Date().getFullYear().toString())
    setFormPractice('Next.js')
    setFormPhase('Shipped')
    setFormShortDesc('')
    setFormTag('E-Commerce')
    setFormTagType('E-commerce')
    setFormSortOrder(projects.length + 1)
    setFormIsActive(true)
    setFormMockupImage('/projects/swekas-browser-exact.png')
    setFormMockupAlt('')
    setFormMockupFile(null)
    setFormMockupPreview(null)
    setFormError(null)
    setIsModalOpen(true)
  }

  // Open Quick Edit for Visit Link
  const handleOpenQuickEdit = (p: ProjectRecord) => {
    setQuickEditProject(p)
    setQuickVisitUrl(p.visitUrl)
    setQuickError(null)
  }

  // Save Quick Visit Link
  const handleSaveQuickVisitUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickEditProject) return
    if (!quickVisitUrl.trim()) {
      setQuickError('Visit URL cannot be empty.')
      return
    }

    if (!isValidUrl(quickVisitUrl)) {
      setQuickError('Please enter a valid URL (e.g. https://swekasluxe.com).')
      return
    }

    setQuickSaving(true)
    setQuickError(null)

    try {
      const res = await fetch(`/api/admin/projects/${quickEditProject.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitUrl: quickVisitUrl.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update visit link')

      showNotification(`Live visit link for "${quickEditProject.titleFirst} ${quickEditProject.titleSecond}" updated successfully!`)
      setQuickEditProject(null)
      fetchProjects()
    } catch (err: unknown) {
      setQuickError(err instanceof Error ? err.message : 'Error saving visit URL')
    } finally {
      setQuickSaving(false)
    }
  }

  // Save Full Form
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitleFirst.trim() || !formTitleSecond.trim()) {
      setFormError('First and second project title words are required.')
      return
    }
    if (!formVisitUrl.trim()) {
      setFormError('Visit live site URL is required.')
      return
    }
    if (!isValidUrl(formVisitUrl)) {
      setFormError('Please enter a valid Visit live site URL (e.g. https://swekasluxe.com).')
      return
    }
    if (modalMode === 'create' && !formSlug.trim()) {
      setFormError('Project URL slug is required.')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      let finalMockupUrl = formMockupImage.trim()

      // If user uploaded a new image file, upload to media library first
      if (formMockupFile) {
        const uploadData = new FormData()
        uploadData.append('file', formMockupFile)
        uploadData.append('alt_text', formMockupAlt || `${formTitleFirst} ${formTitleSecond} browser mockup`)
        uploadData.append('section_tag', 'general')
        uploadData.append('usage_ref', formSlug || editingSlug || 'project-mockup')

        const upRes = await fetch('/api/admin/media', {
          method: 'POST',
          body: uploadData,
        })

        if (!upRes.ok) {
          const upJson = await upRes.json()
          throw new Error(upJson.error || 'Failed to upload project mockup image')
        }

        const upData = await upRes.json()
        finalMockupUrl = upData.media.url
      }

      const payload = {
        slug: formSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        titleFirst: formTitleFirst.trim(),
        titleSecond: formTitleSecond.trim(),
        subtitle: formSubtitle.trim(),
        categoryEyebrow: formCategoryEyebrow.trim(),
        domain: formDomain.trim() || formVisitUrl.trim(),
        visitUrl: formVisitUrl.trim(),
        category: formCategory.trim(),
        year: formYear.trim(),
        practice: formPractice.trim(),
        phase: formPhase.trim(),
        mockupImage: finalMockupUrl,
        shortDesc: formShortDesc.trim(),
        tag: formTag.trim(),
        tagType: formTagType.trim(),
        thumbnail: finalMockupUrl,
        sortOrder: Number(formSortOrder) || 1,
        isActive: formIsActive,
      }

      if (modalMode === 'create') {
        const res = await fetch('/api/admin/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create project')
        showNotification(`Project "${payload.titleFirst} ${payload.titleSecond}" created successfully!`)
      } else {
        const res = await fetch(`/api/admin/projects/${editingSlug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update project')
        showNotification(`Project "${payload.titleFirst} ${payload.titleSecond}" updated successfully!`)
      }

      setIsModalOpen(false)
      fetchProjects()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error saving project')
    } finally {
      setSaving(false)
    }
  }

  // Toggle Visibility
  const handleToggleActive = async (p: ProjectRecord) => {
    try {
      const res = await fetch(`/api/admin/projects/${p.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !p.isActive }),
      })
      if (!res.ok) throw new Error('Failed to update project status')
      showNotification(`Project "${p.titleFirst} ${p.titleSecond}" is now ${!p.isActive ? 'Active (Live)' : 'Hidden (Draft)'}.`)
      fetchProjects()
    } catch (err: unknown) {
      console.error(err)
      showNotification(err instanceof Error ? err.message : 'Error updating status')
    }
  }

  // Delete Project
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/projects/${deleteTarget.slug}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete project')
      showNotification(`Project "${deleteTarget.titleFirst} ${deleteTarget.titleSecond}" deleted successfully.`)
      setDeleteTarget(null)
      fetchProjects()
    } catch (err: unknown) {
      console.error(err)
      showNotification(err instanceof Error ? err.message : 'Error deleting project')
    } finally {
      setDeleting(false)
    }
  }

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      p.titleFirst.toLowerCase().includes(q) ||
      p.titleSecond.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.visitUrl.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q)
    )
  })

  return (
    <div className="adm-page-container">
      {/* Notifications */}
      {successNotice && (
        <div className="adm-alert adm-alert-success" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} color="#00dfa5" />
          <span>{successNotice}</span>
        </div>
      )}

      {error && (
        <div className="adm-alert adm-alert-danger" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="adm-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#00c9f2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Portfolio &amp; Showcase
            </span>
          </div>
          <h1 className="adm-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 6px 0' }}>
            <FolderKanban size={26} color="#00c9f2" />
            <span>Projects &amp; Portfolio Management</span>
          </h1>
          <p className="adm-page-desc" style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Manage client case studies, live destination URLs (e.g. <strong>&quot;Visit live site ↗&quot;</strong> button), specifications, and preview browser mockups.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => fetchProjects()}
            className="adm-btn adm-btn-outline"
            disabled={loading}
            title="Refresh from database"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button onClick={handleOpenCreate} className="adm-btn adm-btn-primary">
            <Plus size={16} />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="adm-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(0, 201, 242, 0.12)', display: 'grid', placeItems: 'center', color: '#00c9f2' }}>
            <FolderKanban size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Projects</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{projects.length}</div>
          </div>
        </div>

        <div className="adm-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(0, 223, 165, 0.12)', display: 'grid', placeItems: 'center', color: '#00dfa5' }}>
            <Globe size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active / Live</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              {projects.filter((p) => p.isActive).length}
            </div>
          </div>
        </div>

        <div className="adm-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(163, 230, 53, 0.15)', display: 'grid', placeItems: 'center', color: '#65a30d' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Live Visit Links</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              Instant Sync with Next.js
            </div>
          </div>
        </div>
      </div>

      {/* Projects List Card */}
      <div className="adm-card">
        <div className="adm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 className="adm-card-title" style={{ fontSize: '17px', fontWeight: 750, margin: '0 0 4px 0' }}>
              All Showcase Projects ({projects.length})
            </h2>
            <p className="adm-card-desc" style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Click <strong>&quot;Edit Visit Link&quot;</strong> to directly change destination URLs like Swekas Luxe.
            </p>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search projects or visit links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="adm-input"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Loading / Empty / Content */}
        {loading && projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', margin: 0 }}>Loading projects from database...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#64748b' }}>No projects match your search.</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="adm-btn adm-btn-outline adm-btn-sm" style={{ marginTop: '8px' }}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Order</th>
                  <th style={{ minWidth: '220px' }}>Project</th>
                  <th style={{ minWidth: '280px' }}>Visit Live Site URL (Destination)</th>
                  <th>Specs</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', minWidth: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => (
                  <tr key={p.slug}>
                    {/* Order */}
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#475569',
                        }}
                      >
                        #{p.sortOrder}
                      </span>
                    </td>

                    {/* Project & Preview Mockup */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.mockupImage ? (
                          <div
                            style={{
                              width: '54px',
                              height: '40px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              background: '#07192d',
                              border: '1px solid #00c9f2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={p.mockupImage}
                              alt={p.titleFirst}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: '54px',
                              height: '40px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#94a3b8',
                              flexShrink: 0,
                            }}
                          >
                            <ImageIcon size={18} />
                          </div>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>
                              {p.titleFirst} {p.titleSecond}
                            </strong>
                          </div>
                          <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {p.categoryEyebrow}
                          </span>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Slug: <code style={{ color: '#0f172a' }}>/projects/{p.slug}</code>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Live Visit Link Highlight */}
                    <td>
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Visit live site Button Link:
                          </span>
                          <button
                            onClick={() => handleOpenQuickEdit(p)}
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: '#0284c7',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: 0,
                            }}
                            title="Edit this URL directly"
                          >
                            <Edit2 size={12} />
                            <span>Change</span>
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <code
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#0f172a',
                              background: '#ffffff',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              maxWidth: '220px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={p.visitUrl}
                          >
                            {p.visitUrl || '(No URL set)'}
                          </code>

                          {p.visitUrl && (
                            <a
                              href={p.visitUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="adm-btn adm-btn-outline adm-btn-sm"
                              style={{ padding: '3px 8px', fontSize: '11px', gap: '4px', height: '26px' }}
                              title="Test this destination link in a new tab"
                            >
                              <span>Test Link</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Specs */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', color: '#475569' }}>
                        <span>
                          <strong>Category:</strong> {p.category}
                        </span>
                        <span>
                          <strong>Practice:</strong> {p.practice}
                        </span>
                        <span>
                          <strong>Year:</strong> {p.year}
                        </span>
                      </div>
                    </td>

                    {/* Visibility */}
                    <td>
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`adm-badge ${p.isActive ? 'adm-badge-success' : 'adm-badge-neutral'}`}
                        style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        title="Click to toggle live / draft status"
                      >
                        {p.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{p.isActive ? 'Active (Live)' : 'Draft'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          style={{ padding: '6px 10px', height: '32px' }}
                          title="View live public project page"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </Link>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          style={{ padding: '6px 10px', height: '32px' }}
                          title="Edit full project details"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          style={{ padding: '6px 8px', height: '32px' }}
                          title="Delete project"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          QUICK EDIT VISIT LINK MODAL
          ======================================================== */}
      {quickEditProject && (
        <div className="adm-modal-backdrop" onClick={() => setQuickEditProject(null)}>
          <div className="adm-modal-dialog" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link2 size={20} color="#00c9f2" />
                <h3 className="adm-modal-title" style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                  Change &quot;Visit live site&quot; Link
                </h3>
              </div>
              <button
                onClick={() => setQuickEditProject(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickVisitUrl}>
              <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Project: {quickEditProject.titleFirst} {quickEditProject.titleSecond}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Public showcase page: <code style={{ color: '#0284c7' }}>/projects/{quickEditProject.slug}</code>
                </div>
              </div>

              {quickError && (
                <div className="adm-alert adm-alert-danger" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px' }}>
                  <AlertCircle size={16} />
                  <span style={{ fontSize: '13px' }}>{quickError}</span>
                </div>
              )}

              <div className="adm-form-group">
                <label className="adm-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                  Destination URL for &quot;Visit live site ↗&quot; Button:
                </label>
                <input
                  type="text"
                  value={quickVisitUrl}
                  onChange={(e) => setQuickVisitUrl(e.target.value)}
                  placeholder="https://swekasluxe.com"
                  className="adm-input"
                  required
                  style={{ fontFamily: 'monospace', fontSize: '13.5px' }}
                />
                <span className="adm-help-text" style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  When visitors click the <strong>&quot;Visit live site ↗&quot;</strong> button on the project showcase, this is where they will be redirected.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setQuickEditProject(null)}
                  className="adm-btn adm-btn-outline"
                  disabled={quickSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={quickSaving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {quickSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>Save New Visit Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          FULL EDIT / CREATE MODAL
          ======================================================== */}
      {isModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="adm-modal-dialog" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FolderKanban size={22} color="#00c9f2" />
                <h3 className="adm-modal-title" style={{ margin: 0, fontSize: '19px', fontWeight: 800 }}>
                  {modalMode === 'create' ? 'Add New Showcase Project' : `Edit Project: ${formTitleFirst} ${formTitleSecond}`}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="adm-alert adm-alert-danger" style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '13px' }}>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProject}>
              {/* Row 1: Slug & Active Status */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-label">URL Slug (e.g. swekas-luxe):</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="swekas-luxe"
                    className="adm-input"
                    disabled={modalMode === 'edit'}
                    required
                  />
                  <span className="adm-help-text">Public page URL: /projects/{formSlug || 'slug'}</span>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Category Eyebrow (Uppercase):</label>
                  <input
                    type="text"
                    value={formCategoryEyebrow}
                    onChange={(e) => setFormCategoryEyebrow(e.target.value)}
                    placeholder="E-COMMERCE / BRANDING"
                    className="adm-input"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Title First & Title Second (Gradient Accent) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-label">Title First Word (White):</label>
                  <input
                    type="text"
                    value={formTitleFirst}
                    onChange={(e) => setFormTitleFirst(e.target.value)}
                    placeholder="Swekas"
                    className="adm-input"
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Title Second Word (Cyan-Lime Gradient):</label>
                  <input
                    type="text"
                    value={formTitleSecond}
                    onChange={(e) => setFormTitleSecond(e.target.value)}
                    placeholder="Luxe"
                    className="adm-input"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Subtitle */}
              <div className="adm-form-group" style={{ marginBottom: '16px' }}>
                <label className="adm-label">Subtitle / Tagline:</label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="Organic Rituals — Premium Ayurvedic Skincare & Haircare"
                  className="adm-input"
                  required
                />
              </div>

              {/* Row 4: DESTINATION VISIT URL & DOMAIN */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '18px', background: 'rgba(0, 201, 242, 0.05)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(0, 201, 242, 0.25)' }}>
                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-label" style={{ fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Link2 size={16} />
                    <span>&quot;Visit live site&quot; Destination URL (Required):</span>
                  </label>
                  <input
                    type="text"
                    value={formVisitUrl}
                    onChange={(e) => setFormVisitUrl(e.target.value)}
                    placeholder="https://swekasluxe.com"
                    className="adm-input"
                    style={{ fontFamily: 'monospace', fontWeight: 600, border: '1px solid #00c9f2' }}
                    required
                  />
                  <span className="adm-help-text" style={{ color: '#0369a1' }}>
                    Target link for the <strong>Visit live site ↗</strong> button on /projects/{formSlug || 'slug'}.
                  </span>
                </div>

                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-label">Domain Display (e.g. in browser address bar):</label>
                  <input
                    type="text"
                    value={formDomain}
                    onChange={(e) => setFormDomain(e.target.value)}
                    placeholder="https://swekasluxe.com"
                    className="adm-input"
                    style={{ fontFamily: 'monospace' }}
                  />
                  <span className="adm-help-text">Shows inside the browser preview window top bar.</span>
                </div>
              </div>

              {/* Row 5: Specs: Category, Year, Practice, Phase */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-label">Category:</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="E-commerce"
                    className="adm-input"
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Year:</label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="2026"
                    className="adm-input"
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Practice / Stack:</label>
                  <input
                    type="text"
                    value={formPractice}
                    onChange={(e) => setFormPractice(e.target.value)}
                    placeholder="Next.js"
                    className="adm-input"
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Phase:</label>
                  <input
                    type="text"
                    value={formPhase}
                    onChange={(e) => setFormPhase(e.target.value)}
                    placeholder="Shipped"
                    className="adm-input"
                    required
                  />
                </div>
              </div>

              {/* Row 6: Image Picker for Mockup Window */}
              <div style={{ marginBottom: '18px' }}>
                <AdminImagePicker
                  label="Showcase Browser Mockup Image"
                  currentUrl={formMockupImage || null}
                  altText={formMockupAlt}
                  selectedFile={formMockupFile}
                  previewUrl={formMockupPreview}
                  onFileSelect={(file, preview) => {
                    setFormMockupFile(file)
                    setFormMockupPreview(preview)
                  }}
                  onUrlChange={(url) => setFormMockupImage(url)}
                  onAltChange={(alt) => setFormMockupAlt(alt)}
                  sectionTag="general"
                  helpText="Select from the media library or upload a high-resolution screenshot/mockup of the live website."
                />
              </div>

              {/* Row 7: Short Description & Card Tag */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-label">Related Card Short Description:</label>
                  <textarea
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    placeholder="Premium D2C luxury Ayurvedic skincare & haircare storefront."
                    className="adm-input"
                    rows={2}
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Card Compass Tag:</label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    placeholder="E-Commerce"
                    className="adm-input"
                    required
                  />
                  <div style={{ marginTop: '12px', display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                      />
                      <span>Active / Published Live</span>
                    </label>

                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <span>Sort:</span>
                      <input
                        type="number"
                        value={formSortOrder}
                        onChange={(e) => setFormSortOrder(Number(e.target.value))}
                        className="adm-input"
                        style={{ width: '60px', padding: '4px 6px', height: '28px' }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="adm-btn adm-btn-outline"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={saving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>{modalMode === 'create' ? 'Create Project' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
          ======================================================== */}
      {deleteTarget && (
        <div className="adm-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="adm-modal-dialog" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ marginBottom: '14px' }}>
              <h3 className="adm-modal-title" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} />
                <span>Delete Project?</span>
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Are you sure you want to delete project <strong>&quot;{deleteTarget.titleFirst} {deleteTarget.titleSecond}&quot;</strong>? This will remove it from the showcase and related projects.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setDeleteTarget(null)} className="adm-btn adm-btn-outline" disabled={deleting}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="adm-btn adm-btn-danger" disabled={deleting}>
                {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Yes, Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

