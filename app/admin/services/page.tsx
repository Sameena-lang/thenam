'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Layers,
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
} from 'lucide-react'
import AdminImagePicker from '@/components/admin/AdminImagePicker'

interface ServiceRecord {
  id: string
  title: string
  subtitle: string
  badge: string
  description: string
  color_class: string
  icon_name: string
  features: string[]
  sort_order: number
  is_active: number
  image_url?: string | null
  image_alt?: string | null
  created_at: string
  updated_at: string
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  // Edit / Create Modal State
  const [isEditing, setIsEditing] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit')
  const [editingId, setEditingId] = useState<string>('')
  const [formTitle, setFormTitle] = useState('')
  const [formSubtitle, setFormSubtitle] = useState('')
  const [formBadge, setFormBadge] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formColor, setFormColor] = useState('cyan')
  const [formIcon, setFormIcon] = useState('Monitor')
  const [formFeaturesText, setFormFeaturesText] = useState('')
  const [formSortOrder, setFormSortOrder] = useState(1)
  const [formIsActive, setFormIsActive] = useState(true)
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formImageAlt, setFormImageAlt] = useState('')
  const [formImageFile, setFormImageFile] = useState<File | null>(null)
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/services')
      if (!res.ok) throw new Error('Failed to load services from server')
      const data = await res.json()
      setServices(data.services || [])
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error retrieving services')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const showNotification = (msg: string) => {
    setSuccessNotice(msg)
    setTimeout(() => {
      setSuccessNotice((prev) => (prev === msg ? null : prev))
    }, 4000)
  }

  const openCreateModal = () => {
    setModalMode('create')
    setEditingId('')
    setFormTitle('')
    setFormSubtitle('')
    setFormBadge('New Service')
    setFormDescription('')
    setFormColor('cyan')
    setFormIcon('Monitor')
    setFormFeaturesText('')
    setFormSortOrder((services.length + 1) * 1)
    setFormIsActive(true)
    setFormImageUrl('')
    setFormImageAlt('')
    setFormImageFile(null)
    setFormImagePreview(null)
    setFormError(null)
    setIsEditing(true)
  }

  const openEditModal = (s: ServiceRecord) => {
    setModalMode('edit')
    setEditingId(s.id)
    setFormTitle(s.title)
    setFormSubtitle(s.subtitle)
    setFormBadge(s.badge)
    setFormDescription(s.description)
    setFormColor(s.color_class)
    setFormIcon(s.icon_name)
    setFormFeaturesText((s.features || []).join('\n'))
    setFormSortOrder(s.sort_order)
    setFormIsActive(s.is_active === 1)
    setFormImageUrl(s.image_url || '')
    setFormImageAlt(s.image_alt || '')
    setFormImageFile(null)
    setFormImagePreview(null)
    setFormError(null)
    setIsEditing(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formDescription.trim()) {
      setFormError('Title and description are required.')
      return
    }

    setSaving(true)
    setFormError(null)

    const featuresList = formFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)

    try {
      let finalImageUrl = formImageUrl.trim()
      let finalImageAlt = formImageAlt.trim()

      // If administrator chose a new local file to upload, upload it securely first
      if (formImageFile) {
        const uploadData = new FormData()
        uploadData.append('file', formImageFile)
        uploadData.append('alt_text', formImageAlt || formTitle)
        uploadData.append('section_tag', 'services')
        uploadData.append('usage_ref', editingId || formTitle)

        const upRes = await fetch('/api/admin/media', {
          method: 'POST',
          body: uploadData,
        })

        if (!upRes.ok) {
          const upJson = await upRes.json()
          throw new Error(upJson.error || 'Failed to upload service image file')
        }

        const upData = await upRes.json()
        finalImageUrl = upData.media.url
        if (!finalImageAlt) {
          finalImageAlt = upData.media.alt_text || formTitle
        }
      }

      if (modalMode === 'create') {
        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            subtitle: formSubtitle,
            badge: formBadge,
            description: formDescription,
            color_class: formColor,
            icon_name: formIcon,
            features: featuresList,
            sort_order: formSortOrder,
            is_active: formIsActive ? 1 : 0,
            image_url: finalImageUrl || null,
            image_alt: finalImageAlt,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create service')
        showNotification(`Service "${formTitle}" created successfully!`)
      } else {
        const res = await fetch(`/api/admin/services/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            subtitle: formSubtitle,
            badge: formBadge,
            description: formDescription,
            color_class: formColor,
            icon_name: formIcon,
            features: featuresList,
            sort_order: formSortOrder,
            is_active: formIsActive ? 1 : 0,
            image_url: finalImageUrl || null,
            image_alt: finalImageAlt,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update service')
        showNotification(`Service "${formTitle}" updated successfully!`)
      }

      setIsEditing(false)
      fetchServices()
    } catch (err: unknown) {
      console.error(err)
      setFormError(err instanceof Error ? err.message : 'Save operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (s: ServiceRecord) => {
    const nextState = s.is_active === 1 ? 0 : 1
    try {
      const res = await fetch(`/api/admin/services/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextState }),
      })
      if (!res.ok) throw new Error('Status update failed')
      showNotification(`"${s.title}" is now ${nextState === 1 ? 'visible on public site' : 'hidden from public site'}.`)
      fetchServices()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/services/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete service')
      showNotification('Service deleted from database.')
      setDeleteId(null)
      fetchServices()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 className="adm-page-title">Services Management</h1>
          <p className="adm-page-desc">
            Manage public website service offerings, pricing badges, and core domain features.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchServices} className="adm-btn adm-btn-outline" title="Refresh Services" type="button">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={openCreateModal} className="adm-btn adm-btn-primary" type="button">
            <Plus size={16} />
            <span>Add Service</span>
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

      {/* Services Table Card */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <h2 className="adm-card-title">Live Service Catalog ({services.length})</h2>
            <p className="adm-card-desc">Changes here update the live /services page in real time.</p>
          </div>
          <Link href="/services" target="_blank" className="adm-btn adm-btn-outline adm-btn-sm">
            <span>Preview Public /services</span>
            <ExternalLink size={13} />
          </Link>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Order</th>
                <th>Service Name &amp; Subtitle</th>
                <th>Badge</th>
                <th>Theme</th>
                <th>Features</th>
                <th>Visibility</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && services.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Loading services from database...</span>
                    </div>
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No services found. Click &quot;Add Service&quot; to create one.
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        background: '#f1f5f9',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#475569',
                      }}>
                        #{s.sort_order}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {s.image_url ? (
                          <img
                            src={s.image_url}
                            alt={s.image_alt || s.title}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              border: '1px solid #e2e8f0',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            display: 'grid',
                            placeItems: 'center',
                            color: '#94a3b8',
                            flexShrink: 0,
                          }}>
                            <ImageIcon size={16} />
                          </div>
                        )}
                        <div>
                          <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>{s.title}</strong>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>{s.subtitle || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        background: s.badge.includes('₹') ? '#ecfdf5' : '#e0f2fe',
                        color: s.badge.includes('₹') ? '#059669' : '#0284c7',
                        border: '1px solid currentColor',
                      }}>
                        {s.badge}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: s.color_class === 'cyan' ? '#0284c7' : s.color_class === 'green' ? '#16a34a' : s.color_class === 'lime' ? '#65a30d' : '#2563eb',
                      }}>
                        {s.color_class}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#475569' }}>
                        {(s.features || []).length} items
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`adm-badge ${s.is_active === 1 ? 'adm-badge-active' : 'adm-badge-deactivated'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle visibility"
                      >
                        {s.is_active === 1 ? <Eye size={12} style={{ marginRight: '4px' }} /> : <EyeOff size={12} style={{ marginRight: '4px' }} />}
                        {s.is_active === 1 ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(s)}
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          title="Edit Service"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="adm-btn adm-btn-sm"
                          style={{ color: '#ef4444', borderColor: '#fca5a5', background: '#fef2f2' }}
                          title="Delete Service"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isEditing && (
        <div className="adm-modal-backdrop" onClick={() => !saving && setIsEditing(false)}>
          <div className="adm-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 className="adm-modal-title">
                  {modalMode === 'create' ? 'Add New Service Offering' : `Edit: ${formTitle}`}
                </h3>
                <p className="adm-modal-desc">
                  Changes will be saved persistently to the database and displayed on /services.
                </p>
              </div>
              <button
                type="button"
                className="adm-modal-close"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="adm-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {formError && (
                  <div className="adm-alert-error" style={{ marginBottom: '16px' }}>
                    <AlertCircle size={15} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="adm-form-grid-2">
                  <div className="adm-form-group">
                    <label className="adm-label">Service Title *</label>
                    <input
                      type="text"
                      className="adm-input-field"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Web Development"
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Pricing / Feature Badge *</label>
                    <input
                      type="text"
                      className="adm-input-field"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="e.g. From ₹1,999* or High Impact"
                      required
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Subtitle / Hook</label>
                  <input
                    type="text"
                    className="adm-input-field"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="Short catchy value proposition"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Detailed Description *</label>
                  <textarea
                    rows={3}
                    className="adm-input-field"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Comprehensive description of the service..."
                    required
                  />
                </div>

                <div className="adm-form-grid-3">
                  <div className="adm-form-group">
                    <label className="adm-label">Color Class</label>
                    <select
                      className="adm-input-field"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                    >
                      <option value="cyan">Cyan</option>
                      <option value="green">Green</option>
                      <option value="blue">Blue</option>
                      <option value="lime">Lime</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Display Order</label>
                    <input
                      type="number"
                      className="adm-input-field"
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(parseInt(e.target.value, 10) || 0)}
                      min={0}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Status</label>
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={formIsActive}
                          onChange={(e) => setFormIsActive(e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: '#00c9f2' }}
                        />
                        <span>Visible on Public Site</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Service Image / Illustration Management */}
                <AdminImagePicker
                  label="Service Card Picture / Illustration"
                  helpText="Rendered in the homepage service flip-cards and /services catalog."
                  currentUrl={formImageUrl}
                  altText={formImageAlt}
                  selectedFile={formImageFile}
                  previewUrl={formImagePreview}
                  onFileSelect={(file, preview) => {
                    setFormImageFile(file)
                    setFormImagePreview(preview)
                  }}
                  onUrlChange={(url) => setFormImageUrl(url)}
                  onAltChange={(alt) => setFormImageAlt(alt)}
                  sectionTag="services"
                />

                <div className="adm-form-group">
                  <label className="adm-label">
                    Bullet Features (One per line)
                  </label>
                  <textarea
                    rows={5}
                    className="adm-input-field"
                    value={formFeaturesText}
                    onChange={(e) => setFormFeaturesText(e.target.value)}
                    placeholder="Single Page & Landing Pages&#10;E-Commerce Integration&#10;Lighthouse 95+ Score"
                  />
                  <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
                    Each line becomes a checked bullet point in the service card.
                  </small>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn adm-btn-outline"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="adm-modal-backdrop" onClick={() => !deleting && setDeleteId(null)}>
          <div className="adm-modal" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title" style={{ color: '#ef4444' }}>Delete Service</h3>
              <button type="button" className="adm-modal-close" onClick={() => setDeleteId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                Are you sure you want to permanently delete this service offering? This will remove it from the database and public website.
              </p>
            </div>
            <div className="adm-modal-footer">
              <button type="button" className="adm-btn adm-btn-outline" onClick={() => setDeleteId(null)} disabled={deleting}>
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn"
                style={{ background: '#ef4444', color: '#ffffff' }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
