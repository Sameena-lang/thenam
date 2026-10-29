'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Image as LucideImage,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  Edit2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Copy,
  Check,
  Maximize2,
  ArrowRightLeft,
  Sliders,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react'

interface MediaItemWithUsage {
  id: string
  filename: string
  original_name: string
  url: string
  alt_text: string
  mime_type: string
  file_size: number
  width: number
  height: number
  section_tag: string
  usage_ref: string | null
  is_system: number
  created_at: string
  updated_at: string
  is_in_use: boolean
  used_in: string[]
}

interface SiteSetting {
  key: string
  value: string
  description: string | null
  updated_at: string
}

export default function AdminMediaPage() {
  const [activeTab, setActiveTab] = useState<'library' | 'homepage'>('library')
  const [mediaList, setMediaList] = useState<MediaItemWithUsage[]>([])
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)
  const [sectionCounts, setSectionCounts] = useState<Record<string, number>>({})
  const [totalAssetsCount, setTotalAssetsCount] = useState<number>(0)
  const [syncing, setSyncing] = useState(false)

  // Filtering & Search
  const [search, setSearch] = useState('')
  const [selectedSection, setSelectedSection] = useState('all')

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadAlt, setUploadAlt] = useState('')
  const [uploadSection, setUploadSection] = useState('general')
  const [uploadAssignKey, setUploadAssignKey] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Replace Modal State
  const [replacingItem, setReplacingItem] = useState<MediaItemWithUsage | null>(null)
  const [replaceFile, setReplaceFile] = useState<File | null>(null)
  const [replacePreview, setReplacePreview] = useState<string | null>(null)
  const [replacing, setReplacing] = useState(false)
  const [replaceError, setReplaceError] = useState<string | null>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  // Edit Alt Modal State
  const [editingItem, setEditingItem] = useState<MediaItemWithUsage | null>(null)
  const [editAltText, setEditAltText] = useState('')
  const [editSectionTag, setEditSectionTag] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete Modal State
  const [deletingItem, setDeletingItem] = useState<MediaItemWithUsage | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Lightbox Preview State
  const [previewItem, setPreviewItem] = useState<MediaItemWithUsage | null>(null)

  // Copied URL Feedback
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setSuccessNotice(msg)
    setTimeout(() => {
      setSuccessNotice((prev) => (prev === msg ? null : prev))
    }, 4500)
  }

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (selectedSection !== 'all') params.set('section', selectedSection)

      const [mediaRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/media?${params.toString()}`),
        fetch('/api/admin/site-settings'),
      ])

      if (!mediaRes.ok) throw new Error('Failed to retrieve media library')
      const mediaData = await mediaRes.json()
      setMediaList(mediaData.media || [])

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSiteSettings(settingsData.settings || [])
      }
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error fetching media')
    } finally {
      setLoading(false)
    }
  }, [search, selectedSection])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  // Handle Upload File Selection & Client Preview
  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    // Client-side quick size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 5MB.`)
      return
    }

    setUploadFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setUploadPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const cancelUpload = () => {
    setShowUploadModal(false)
    setUploadFile(null)
    setUploadPreview(null)
    setUploadAlt('')
    setUploadAssignKey('')
    setUploadError(null)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) {
      setUploadError('Please select an image file to upload')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('alt_text', uploadAlt)
      formData.append('section_tag', uploadSection)
      if (uploadAssignKey) {
        formData.append('assign_to_key', uploadAssignKey)
      }

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      showNotification(`Image "${uploadFile.name}" stored securely and added to library.`)
      cancelUpload()
      fetchMedia()
    } catch (err: unknown) {
      console.error(err)
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Handle Replace File Selection
  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setReplaceError(null)

    if (file.size > 5 * 1024 * 1024) {
      setReplaceError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max limit is 5MB.`)
      return
    }

    setReplaceFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setReplacePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const cancelReplace = () => {
    setReplacingItem(null)
    setReplaceFile(null)
    setReplacePreview(null)
    setReplaceError(null)
  }

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replacingItem || !replaceFile) return

    setReplacing(true)
    setReplaceError(null)

    try {
      const formData = new FormData()
      formData.append('file', replaceFile)

      const res = await fetch(`/api/admin/media/${replacingItem.id}/replace`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Replacement failed')
      }

      showNotification(`Successfully replaced image. All public website references have been updated.`)
      cancelReplace()
      fetchMedia()
    } catch (err: unknown) {
      console.error(err)
      setReplaceError(err instanceof Error ? err.message : 'Replacement failed')
    } finally {
      setReplacing(false)
    }
  }

  // Handle Edit Metadata Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    setSavingEdit(true)
    setEditError(null)

    try {
      const res = await fetch(`/api/admin/media/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alt_text: editAltText,
          section_tag: editSectionTag,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update metadata')

      showNotification('Image alt text and metadata updated.')
      setEditingItem(null)
      fetchMedia()
    } catch (err: unknown) {
      console.error(err)
      setEditError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSavingEdit(false)
    }
  }

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return

    setDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(`/api/admin/media/${deletingItem.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Deletion blocked or failed')
      }

      showNotification(`Image "${deletingItem.original_name}" removed from library.`)
      setDeletingItem(null)
      fetchMedia()
    } catch (err: unknown) {
      console.error(err)
      setDeleteError(err instanceof Error ? err.message : 'Deletion failed')
    } finally {
      setDeleting(false)
    }
  }

  // Copy URL to clipboard
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => {
      setCopiedUrl((prev) => (prev === url ? null : prev))
    }, 2000)
  }

  // Quick Assignment for Homepage/Key Section Images
  const handleAssignDirect = (key: string, currentUrl: string) => {
    setUploadAssignKey(key)
    setUploadSection('hero')
    setUploadAlt(`Custom picture for ${key}`)
    setShowUploadModal(true)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 className="adm-page-title">Image &amp; Media Management</h1>
          <p className="adm-page-desc">
            Manage website picture assets, homepage hero banners, service flip card images, and product mockups.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchMedia} className="adm-btn adm-btn-outline" title="Refresh Media" type="button">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setUploadAssignKey('')
              setUploadFile(null)
              setUploadPreview(null)
              setUploadAlt('')
              setUploadSection('general')
              setUploadError(null)
              setShowUploadModal(true)
            }}
            className="adm-btn adm-btn-primary"
            type="button"
          >
            <Upload size={16} />
            <span>Upload New Image</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: '10px',
          fontSize: '13.5px',
          fontWeight: '600',
          marginBottom: '20px',
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="adm-alert-error" role="alert" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('library')}
          type="button"
          style={{
            padding: '10px 18px',
            fontSize: '13.5px',
            fontWeight: '700',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: activeTab === 'library' ? '#0284c7' : '#64748b',
            borderBottom: activeTab === 'library' ? '2.5px solid #00c9f2' : '2.5px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <LucideImage size={16} />
          <span>Media Library ({totalAssetsCount || mediaList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('homepage')}
          type="button"
          style={{
            padding: '10px 18px',
            fontSize: '13.5px',
            fontWeight: '700',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: activeTab === 'homepage' ? '#0284c7' : '#64748b',
            borderBottom: activeTab === 'homepage' ? '2.5px solid #00c9f2' : '2.5px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sliders size={16} />
          <span>Homepage Hero &amp; Key Sections</span>
        </button>
      </div>

      {/* TAB 1: MEDIA LIBRARY */}
      {activeTab === 'library' && (
        <div>
          {/* Filter & Search Bar */}
          <div className="adm-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              {/* Section Tag Filter Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { id: 'all', label: 'All Images' },
                  { id: 'hero', label: 'Hero & Banners' },
                  { id: 'services', label: 'Services Cards' },
                  { id: 'products', label: 'Products & Mockups' },
                  { id: 'team', label: 'Team & About' },
                  { id: 'branding', label: 'Brand Logos' },
                  { id: 'general', label: 'General Uploads' },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSelectedSection(sec.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: '1px solid',
                      cursor: 'pointer',
                      borderColor: selectedSection === sec.id ? '#00c9f2' : '#e2e8f0',
                      background: selectedSection === sec.id ? 'rgba(0, 201, 242, 0.12)' : '#ffffff',
                      color: selectedSection === sec.id ? '#0284c7' : '#64748b',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search filename or alt text..."
                  className="adm-input-field"
                  style={{ paddingLeft: '36px', paddingRight: '12px', height: '38px', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Media Grid */}
          {loading && mediaList.length === 0 ? (
            <div className="adm-card" style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <Loader2 size={20} className="animate-spin" />
                <span>Loading media assets from database...</span>
              </div>
            </div>
          ) : mediaList.length === 0 ? (
            <div className="adm-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <LucideImage size={42} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>No Images Found</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                No pictures match the current section filter or search term.
              </p>
              <button
                onClick={() => { setSelectedSection('all'); setSearch(''); }}
                className="adm-btn adm-btn-outline"
                type="button"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}>
              {mediaList.map((item) => (
                <article
                  key={item.id}
                  className="adm-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Thumbnail Container */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '180px',
                      background: '#070f1e',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => setPreviewItem(item)}
                    title="Click to preview full size"
                  >
                    <img
                      src={item.url}
                      alt={item.alt_text || item.original_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transition: 'transform 0.3s ease',
                      }}
                    />

                    {/* Section Tag Badge */}
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '10.5px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      background: 'rgba(6, 20, 38, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#00c9f2',
                      border: '1px solid rgba(0, 201, 242, 0.4)',
                    }}>
                      {item.section_tag}
                    </span>

                    {/* In-Use Badge */}
                    {item.is_in_use && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '10.5px',
                        fontWeight: '800',
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #10b981',
                      }}>
                        In Use
                      </span>
                    )}

                    {/* Hover Zoom Icon */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(6, 20, 38, 0.35)',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        color: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        <Maximize2 size={13} />
                        <span>Preview</span>
                      </span>
                    </div>
                  </div>

                  {/* Metadata Content */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <strong
                          style={{
                            fontSize: '13.5px',
                            color: '#0f172a',
                            display: 'block',
                            wordBreak: 'break-all',
                            lineHeight: '1.4',
                          }}
                          title={item.original_name}
                        >
                          {item.original_name}
                        </strong>
                      </div>

                      {/* Dimensions & Size Row */}
                      <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', color: '#334155' }}>
                          {item.width > 0 && item.height > 0 ? `${item.width} × ${item.height}` : 'Vector'}
                        </span>
                        <span>•</span>
                        <span>{formatBytes(item.file_size)}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'uppercase' }}>{item.mime_type.replace('image/', '')}</span>
                      </div>

                      {/* Alt text display */}
                      <p style={{
                        fontSize: '11.5px',
                        color: item.alt_text ? '#475569' : '#94a3b8',
                        fontStyle: item.alt_text ? 'normal' : 'italic',
                        marginBottom: '12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.5',
                      }}>
                        {item.alt_text ? `Alt: "${item.alt_text}"` : 'No alt text provided'}
                      </p>

                      {/* Usage Location Info if in use */}
                      {item.is_in_use && item.used_in.length > 0 && (
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          fontSize: '11px',
                          color: '#0369a1',
                          marginBottom: '12px',
                        }}>
                          <strong>Active on:</strong> {item.used_in.slice(0, 2).join(', ')}
                          {item.used_in.length > 2 && ` (+${item.used_in.length - 2} more)`}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '12px',
                      marginTop: '4px',
                    }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {/* Replace image */}
                        <button
                          onClick={() => {
                            setReplacingItem(item)
                            setReplaceFile(null)
                            setReplacePreview(null)
                            setReplaceError(null)
                          }}
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Replace this image with a new file"
                        >
                          <ArrowRightLeft size={13} />
                          <span>Replace</span>
                        </button>

                        {/* Edit metadata */}
                        <button
                          onClick={() => {
                            setEditingItem(item)
                            setEditAltText(item.alt_text)
                            setEditSectionTag(item.section_tag)
                            setEditError(null)
                          }}
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Edit alt text and section"
                        >
                          <Edit2 size={13} />
                          <span>Alt</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {/* Copy URL */}
                        <button
                          onClick={() => copyUrl(item.url)}
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Copy relative image URL"
                        >
                          {copiedUrl === item.url ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => {
                            setDeletingItem(item)
                            setDeleteError(null)
                          }}
                          className="adm-btn adm-btn-sm"
                          style={{
                            padding: '4px 8px',
                            color: '#ef4444',
                            background: '#fef2f2',
                            borderColor: '#fca5a5',
                          }}
                          title="Delete image"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HOMEPAGE & KEY SECTION IMAGES */}
      {activeTab === 'homepage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 1: Homepage Hero Section Background */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div>
                <h2 className="adm-card-title">Homepage Hero Section Image</h2>
                <p className="adm-card-desc">
                  The primary visual background shown in the dark navy hero section on the homepage.
                </p>
              </div>
              <Link href="/" target="_blank" className="adm-btn adm-btn-outline adm-btn-sm">
                <span>View Homepage</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              alignItems: 'center',
            }}>
              <div style={{
                position: 'relative',
                height: '220px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#031525',
                border: '1px solid #1a2a47',
              }}>
                <img
                  src={siteSettings.find((s) => s.key === 'homepage_hero_bg')?.value || '/hero-bg.png'}
                  alt="Homepage Hero Background"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  background: 'rgba(0,0,0,0.75)',
                  color: '#38bdf8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                }}>
                  Active Live: {siteSettings.find((s) => s.key === 'homepage_hero_bg')?.value || '/hero-bg.png'}
                </span>
              </div>

              <div>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                  The hero background is designed with dark navy space on the left for title typography, with the high-tech digital workspace visual placed on the right.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleAssignDirect('homepage_hero_bg', siteSettings.find((s) => s.key === 'homepage_hero_bg')?.value || '/hero-bg.png')}
                    className="adm-btn adm-btn-primary"
                    type="button"
                  >
                    <Upload size={15} />
                    <span>Upload Replacement Hero Picture</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Homepage 3D Flip Card Service Pictures */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div>
                <h2 className="adm-card-title">Homepage Service Flip Card Images (4 Cards)</h2>
                <p className="adm-card-desc">
                  Pictures displayed on the 3D flip cards in the &quot;What We Do&quot; section on the homepage.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              {[
                { key: 'service_img_web_development', label: 'Web Development', defaultUrl: '/services/web-development.jpg' },
                { key: 'service_img_ai_machine_learning', label: 'AI & Machine Learning', defaultUrl: '/services/ai-machine-learning.jpg' },
                { key: 'service_img_custom_software', label: 'Custom Software', defaultUrl: '/services/custom-software.jpg' },
                { key: 'service_img_business_automation', label: 'Business Automation', defaultUrl: '/services/business-automation.jpg' },
              ].map((card) => {
                const currentVal = siteSettings.find((s) => s.key === card.key)?.value || card.defaultUrl
                return (
                  <div key={card.key} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#ffffff' }}>
                    <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#0f172a', marginBottom: '10px' }}>
                      <img src={currentVal} alt={card.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>{card.label}</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '12px', wordBreak: 'break-all' }}>{currentVal}</span>
                    <button
                      onClick={() => handleAssignDirect(card.key, currentVal)}
                      className="adm-btn adm-btn-outline adm-btn-sm"
                      style={{ width: '100%' }}
                      type="button"
                    >
                      <ArrowRightLeft size={13} />
                      <span>Change Picture</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card 3: Featured Product Work Cards */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div>
                <h2 className="adm-card-title">Homepage Featured Products Mockups</h2>
                <p className="adm-card-desc">
                  Mockup previews shown on the 4 horizontal project cards on the homepage.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              {[
                { key: 'product_img_agrismart', label: 'AgriSmart Platform', defaultUrl: '/projects/featured-agrismart-hq.png' },
                { key: 'product_img_zarabot', label: 'ZaraBot AI Assistant', defaultUrl: '/projects/featured-zarabot-hq.png' },
                { key: 'product_img_commerceflow', label: 'E-Commerce Platform', defaultUrl: '/projects/featured-ecommerce-hq.png' },
                { key: 'product_img_pulse_core', label: 'Business Management', defaultUrl: '/projects/featured-bizmgmt-hq.png' },
              ].map((card) => {
                const currentVal = siteSettings.find((s) => s.key === card.key)?.value || card.defaultUrl
                return (
                  <div key={card.key} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#ffffff' }}>
                    <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#0f172a', marginBottom: '10px' }}>
                      <img src={currentVal} alt={card.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>{card.label}</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '12px', wordBreak: 'break-all' }}>{currentVal}</span>
                    <button
                      onClick={() => handleAssignDirect(card.key, currentVal)}
                      className="adm-btn adm-btn-outline adm-btn-sm"
                      style={{ width: '100%' }}
                      type="button"
                    >
                      <ArrowRightLeft size={13} />
                      <span>Change Picture</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: UPLOAD NEW IMAGE */}
      {showUploadModal && (
        <div className="adm-modal-backdrop" onClick={() => !uploading && cancelUpload()}>
          <div className="adm-modal" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 className="adm-modal-title">Upload New Image</h3>
                <p className="adm-modal-desc">
                  {uploadAssignKey
                    ? `Uploading and setting live as ${uploadAssignKey}`
                    : 'Add a new picture to the THENAM persistent media library.'}
                </p>
              </div>
              <button type="button" className="adm-modal-close" onClick={cancelUpload} disabled={uploading}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="adm-modal-body">
                {uploadError && (
                  <div className="adm-alert-error" style={{ marginBottom: '16px' }}>
                    <AlertCircle size={15} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Drop / Select Area */}
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    marginBottom: '18px',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleUploadFileChange}
                    style={{ display: 'none' }}
                  />

                  {uploadPreview ? (
                    <div>
                      <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', background: '#061426', marginBottom: '10px' }}>
                        <img src={uploadPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '700' }}>
                        Click to choose a different file ({uploadFile?.name})
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
                        <Upload size={22} />
                      </div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>
                        Click to browse or drop image here
                      </strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Supports PNG, JPEG, WebP, SVG up to 5MB
                      </span>
                    </div>
                  )}
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Section Tag</label>
                  <select
                    className="adm-input-field"
                    value={uploadSection}
                    onChange={(e) => setUploadSection(e.target.value)}
                  >
                    <option value="general">General Asset</option>
                    <option value="hero">Hero &amp; Banners</option>
                    <option value="services">Services Cards</option>
                    <option value="products">Products &amp; Mockups</option>
                    <option value="team">Team &amp; Leadership</option>
                    <option value="branding">Brand Logos</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Alternative Text (Alt Text)</label>
                  <input
                    type="text"
                    className="adm-input-field"
                    value={uploadAlt}
                    onChange={(e) => setUploadAlt(e.target.value)}
                    placeholder="Descriptive text for accessibility &amp; SEO..."
                  />
                  <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
                    Screen readers and search engine crawlers use this description.
                  </small>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button type="button" className="adm-btn adm-btn-outline" onClick={cancelUpload} disabled={uploading}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={uploading || !uploadFile}>
                  {uploading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Validating &amp; Storing...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; Upload</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REPLACE IMAGE */}
      {replacingItem && (
        <div className="adm-modal-backdrop" onClick={() => !replacing && cancelReplace()}>
          <div className="adm-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 className="adm-modal-title">Replace Image: {replacingItem.original_name}</h3>
                <p className="adm-modal-desc">
                  Replacing this image will automatically update all public sections where it is referenced.
                </p>
              </div>
              <button type="button" className="adm-modal-close" onClick={cancelReplace} disabled={replacing}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit}>
              <div className="adm-modal-body">
                {replaceError && (
                  <div className="adm-alert-error" style={{ marginBottom: '16px' }}>
                    <AlertCircle size={15} />
                    <span>{replaceError}</span>
                  </div>
                )}

                {/* Side-by-side comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  {/* Current */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', background: '#f8fafc' }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Current Image
                    </span>
                    <div style={{ position: 'relative', height: '140px', borderRadius: '6px', overflow: 'hidden', background: '#061426', marginBottom: '8px' }}>
                      <img src={replacingItem.url} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#334155', display: 'block' }}>
                      {replacingItem.width}×{replacingItem.height} • {formatBytes(replacingItem.file_size)}
                    </span>
                  </div>

                  {/* Proposed New */}
                  <div
                    style={{
                      border: '2px dashed #00c9f2',
                      borderRadius: '10px',
                      padding: '12px',
                      background: '#f0f9ff',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                    onClick={() => replaceInputRef.current?.click()}
                  >
                    <input
                      ref={replaceInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleReplaceFileChange}
                      style={{ display: 'none' }}
                    />
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase', marginBottom: '8px' }}>
                      New Replacement
                    </span>
                    {replacePreview ? (
                      <div>
                        <div style={{ position: 'relative', height: '140px', borderRadius: '6px', overflow: 'hidden', background: '#061426', marginBottom: '8px' }}>
                          <img src={replacePreview} alt="New Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>
                          {replaceFile?.name} ({formatBytes(replaceFile?.size || 0)})
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px' }}>
                        <Upload size={22} style={{ color: '#0284c7', marginBottom: '8px' }} />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7' }}>
                          Click to select new picture
                        </span>
                        <span style={{ fontSize: '10.5px', color: '#64748b' }}>PNG, JPEG, WebP</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: '#15803d',
                }}>
                  <Info size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  <span>
                    Existing alt text (&quot;{replacingItem.alt_text || 'default'}&quot;) will be maintained unless edited separately.
                  </span>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button type="button" className="adm-btn adm-btn-outline" onClick={cancelReplace} disabled={replacing}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={replacing || !replaceFile}>
                  {replacing ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Replacing &amp; Syncing...</span>
                    </>
                  ) : (
                    <span>Confirm Replacement</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT ALT TEXT & METADATA */}
      {editingItem && (
        <div className="adm-modal-backdrop" onClick={() => !savingEdit && setEditingItem(null)}>
          <div className="adm-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 className="adm-modal-title">Edit Image Alt Text</h3>
                <p className="adm-modal-desc">{editingItem.original_name}</p>
              </div>
              <button type="button" className="adm-modal-close" onClick={() => setEditingItem(null)} disabled={savingEdit}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="adm-modal-body">
                {editError && (
                  <div className="adm-alert-error" style={{ marginBottom: '16px' }}>
                    <AlertCircle size={15} />
                    <span>{editError}</span>
                  </div>
                )}

                <div className="adm-form-group">
                  <label className="adm-label">Section Tag</label>
                  <select
                    className="adm-input-field"
                    value={editSectionTag}
                    onChange={(e) => setEditSectionTag(e.target.value)}
                  >
                    <option value="general">General Asset</option>
                    <option value="hero">Hero &amp; Banners</option>
                    <option value="services">Services Cards</option>
                    <option value="products">Products &amp; Mockups</option>
                    <option value="team">Team &amp; Leadership</option>
                    <option value="branding">Brand Logos</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Alternative Text (Alt Text)</label>
                  <textarea
                    rows={3}
                    className="adm-input-field"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    placeholder="Descriptive text for accessibility and SEO..."
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button type="button" className="adm-btn adm-btn-outline" onClick={() => setEditingItem(null)} disabled={savingEdit}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deletingItem && (
        <div className="adm-modal-backdrop" onClick={() => !deleting && setDeletingItem(null)}>
          <div className="adm-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title" style={{ color: '#ef4444' }}>Delete Image</h3>
              <button type="button" className="adm-modal-close" onClick={() => setDeletingItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="adm-modal-body">
              {deleteError && (
                <div className="adm-alert-error" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={15} />
                  <span>{deleteError}</span>
                </div>
              )}

              {deletingItem.is_in_use ? (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '14px',
                  color: '#991b1b',
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}>
                  <strong style={{ display: 'block', marginBottom: '6px' }}>Deletion Protected:</strong>
                  This image cannot be deleted because it is currently in active use by:{' '}
                  <strong>{deletingItem.used_in.join(', ')}</strong>.
                  <br />
                  Please replace or remove its reference in the corresponding section before deleting.
                </div>
              ) : (
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                  Are you sure you want to permanently delete{' '}
                  <strong>&quot;{deletingItem.original_name}&quot;</strong>? This will remove the record from the library and delete the file from storage.
                </p>
              )}
            </div>

            <div className="adm-modal-footer">
              <button type="button" className="adm-btn adm-btn-outline" onClick={() => setDeletingItem(null)} disabled={deleting}>
                {deletingItem.is_in_use ? 'Close' : 'Cancel'}
              </button>
              {!deletingItem.is_in_use && (
                <button
                  type="button"
                  className="adm-btn"
                  style={{ background: '#ef4444', color: '#ffffff' }}
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: FULL-SCREEN LIGHTBOX PREVIEW */}
      {previewItem && (
        <div
          className="adm-modal-backdrop"
          onClick={() => setPreviewItem(null)}
          style={{ padding: '40px 20px', background: 'rgba(6, 20, 38, 0.92)' }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '900px',
              width: '100%',
              background: '#070f1e',
              borderRadius: '16px',
              border: '1px solid #1a2a47',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #1a2a47',
              color: '#ffffff',
            }}>
              <div>
                <strong style={{ fontSize: '14px', display: 'block' }}>{previewItem.original_name}</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {previewItem.width} × {previewItem.height} • {formatBytes(previewItem.file_size)} • {previewItem.url}
                </span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'grid', placeItems: 'center', maxHeight: '70vh', overflowY: 'auto' }}>
              <img
                src={previewItem.url}
                alt={previewItem.alt_text}
                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>

            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid #1a2a47',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#040b17',
              fontSize: '12px',
              color: '#94a3b8',
            }}>
              <span>Alt: {previewItem.alt_text || '—'}</span>
              <button
                onClick={() => copyUrl(previewItem.url)}
                className="adm-btn adm-btn-outline adm-btn-sm"
              >
                <Copy size={13} />
                <span>Copy Asset URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
