'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Package,
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

interface ProductRecord {
  id: string
  name: string
  category: string
  badge: string
  badge_color: string
  icon_name: string
  icon_color: string
  icon_bg: string
  tagline: string
  description: string
  tags: string[]
  metrics: Array<{ label: string; val: string }>
  features: string[]
  sort_order: number
  is_active: number
  image_url?: string | null
  image_alt?: string | null
  created_at: string
  updated_at: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  // Edit / Create Modal State
  const [isEditing, setIsEditing] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit')
  const [editingId, setEditingId] = useState<string>('')
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formBadge, setFormBadge] = useState('')
  const [formBadgeColor, setFormBadgeColor] = useState('cyan')
  const [formTagline, setFormTagline] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formTagsText, setFormTagsText] = useState('')
  const [formMetricsText, setFormMetricsText] = useState('')
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

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error('Failed to load products from database')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error retrieving products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const showNotification = (msg: string) => {
    setSuccessNotice(msg)
    setTimeout(() => {
      setSuccessNotice((prev) => (prev === msg ? null : prev))
    }, 4000)
  }

  const openCreateModal = () => {
    setModalMode('create')
    setEditingId('')
    setFormName('')
    setFormCategory('Proprietary Software Platform')
    setFormBadge('Active')
    setFormBadgeColor('cyan')
    setFormTagline('')
    setFormDescription('')
    setFormTagsText('Web App, AI/ML, Cloud')
    setFormMetricsText('Resolution Rate: 90%\nAvg Setup: 24h')
    setFormFeaturesText('')
    setFormSortOrder((products.length + 1) * 1)
    setFormIsActive(true)
    setFormImageUrl('')
    setFormImageAlt('')
    setFormImageFile(null)
    setFormImagePreview(null)
    setFormError(null)
    setIsEditing(true)
  }

  const openEditModal = (p: ProductRecord) => {
    setModalMode('edit')
    setEditingId(p.id)
    setFormName(p.name)
    setFormCategory(p.category)
    setFormBadge(p.badge)
    setFormBadgeColor(p.badge_color || 'cyan')
    setFormTagline(p.tagline)
    setFormDescription(p.description)
    setFormTagsText((p.tags || []).join(', '))
    setFormMetricsText(
      (p.metrics || []).map((m) => `${m.label}: ${m.val}`).join('\n')
    )
    setFormFeaturesText((p.features || []).join('\n'))
    setFormSortOrder(p.sort_order)
    setFormIsActive(p.is_active === 1)
    setFormImageUrl(p.image_url || '')
    setFormImageAlt(p.image_alt || '')
    setFormImageFile(null)
    setFormImagePreview(null)
    setFormError(null)
    setIsEditing(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formDescription.trim()) {
      setFormError('Product name and description are required.')
      return
    }

    setSaving(true)
    setFormError(null)

    const tagsList = formTagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const featuresList = formFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)

    const metricsList = formMetricsText
      .split('\n')
      .map((line) => {
        const parts = line.split(':')
        if (parts.length >= 2) {
          return { label: parts[0].trim(), val: parts.slice(1).join(':').trim() }
        }
        return null
      })
      .filter((m): m is { label: string; val: string } => m !== null)

    try {
      let finalImageUrl = formImageUrl.trim()
      let finalImageAlt = formImageAlt.trim()

      // If administrator selected a file to upload, send to media endpoint first
      if (formImageFile) {
        const uploadData = new FormData()
        uploadData.append('file', formImageFile)
        uploadData.append('alt_text', formImageAlt || formName)
        uploadData.append('section_tag', 'products')
        uploadData.append('usage_ref', editingId || formName)

        const upRes = await fetch('/api/admin/media', {
          method: 'POST',
          body: uploadData,
        })

        if (!upRes.ok) {
          const upJson = await upRes.json()
          throw new Error(upJson.error || 'Failed to upload product image file')
        }

        const upData = await upRes.json()
        finalImageUrl = upData.media.url
        if (!finalImageAlt) {
          finalImageAlt = upData.media.alt_text || formName
        }
      }

      if (modalMode === 'create') {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            category: formCategory,
            badge: formBadge,
            badge_color: formBadgeColor,
            tagline: formTagline,
            description: formDescription,
            tags: tagsList,
            metrics: metricsList,
            features: featuresList,
            sort_order: formSortOrder,
            is_active: formIsActive ? 1 : 0,
            image_url: finalImageUrl || null,
            image_alt: finalImageAlt,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create product')
        showNotification(`Product "${formName}" created successfully!`)
      } else {
        const res = await fetch(`/api/admin/products/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            category: formCategory,
            badge: formBadge,
            badge_color: formBadgeColor,
            tagline: formTagline,
            description: formDescription,
            tags: tagsList,
            metrics: metricsList,
            features: featuresList,
            sort_order: formSortOrder,
            is_active: formIsActive ? 1 : 0,
            image_url: finalImageUrl || null,
            image_alt: finalImageAlt,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update product')
        showNotification(`Product "${formName}" updated successfully!`)
      }

      setIsEditing(false)
      fetchProducts()
    } catch (err: unknown) {
      console.error(err)
      setFormError(err instanceof Error ? err.message : 'Save operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (p: ProductRecord) => {
    const nextState = p.is_active === 1 ? 0 : 1
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextState }),
      })
      if (!res.ok) throw new Error('Status update failed')
      showNotification(`"${p.name}" is now ${nextState === 1 ? 'visible on public site' : 'hidden from public site'}.`)
      fetchProducts()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete product')
      showNotification('Product deleted from database.')
      setDeleteId(null)
      fetchProducts()
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
          <h1 className="adm-page-title">Products Management</h1>
          <p className="adm-page-desc">
            Manage THENAM proprietary platforms (AgriSmart, ZaraBot, E-Commerce, BMS) displayed on /products.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchProducts} className="adm-btn adm-btn-outline" title="Refresh Products" type="button">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={openCreateModal} className="adm-btn adm-btn-primary" type="button">
            <Plus size={16} />
            <span>Add Product</span>
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

      {/* Products Table Card */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <h2 className="adm-card-title">Live Proprietary Platforms ({products.length})</h2>
            <p className="adm-card-desc">Real database records synced directly to the public showcase.</p>
          </div>
          <Link href="/products" target="_blank" className="adm-btn adm-btn-outline adm-btn-sm">
            <span>Preview Public /products</span>
            <ExternalLink size={13} />
          </Link>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Order</th>
                <th>Product &amp; Category</th>
                <th>Badge</th>
                <th>Tags</th>
                <th>Metrics</th>
                <th>Visibility</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Loading products from database...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No products found. Click &quot;Add Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
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
                        #{p.sort_order}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.image_alt || p.name}
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
                          <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>{p.name}</strong>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>{p.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        border: '1px solid currentColor',
                      }}>
                        {p.badge}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '180px' }}>
                        {(p.tags || []).slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '10.5px',
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                        {(p.metrics || []).length} key metrics
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`adm-badge ${p.is_active === 1 ? 'adm-badge-active' : 'adm-badge-deactivated'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle visibility"
                      >
                        {p.is_active === 1 ? <Eye size={12} style={{ marginRight: '4px' }} /> : <EyeOff size={12} style={{ marginRight: '4px' }} />}
                        {p.is_active === 1 ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          title="Edit Product"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="adm-btn adm-btn-sm"
                          style={{ color: '#ef4444', borderColor: '#fca5a5', background: '#fef2f2' }}
                          title="Delete Product"
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
          <div className="adm-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h3 className="adm-modal-title">
                  {modalMode === 'create' ? 'Add Proprietary Product' : `Edit: ${formName}`}
                </h3>
                <p className="adm-modal-desc">
                  Changes will be saved persistently to the database and displayed on /products.
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
                    <label className="adm-label">Product Name *</label>
                    <input
                      type="text"
                      className="adm-input-field"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. AgriSmart or ZaraBot"
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Category / Domain *</label>
                    <input
                      type="text"
                      className="adm-input-field"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. AI-Powered AgriTech Platform"
                      required
                    />
                  </div>
                </div>

                <div className="adm-form-grid-2">
                  <div className="adm-form-group">
                    <label className="adm-label">Badge Label</label>
                    <input
                      type="text"
                      className="adm-input-field"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="e.g. Active Deployment"
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Badge Color</label>
                    <select
                      className="adm-input-field"
                      value={formBadgeColor}
                      onChange={(e) => setFormBadgeColor(e.target.value)}
                    >
                      <option value="lime">Lime</option>
                      <option value="cyan">Cyan</option>
                      <option value="yellow">Yellow</option>
                      <option value="blue">Blue</option>
                    </select>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Tagline</label>
                  <input
                    type="text"
                    className="adm-input-field"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="Short summary punchline"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Detailed Description *</label>
                  <textarea
                    rows={3}
                    className="adm-input-field"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Full product overview, features, and capabilities..."
                    required
                  />
                </div>

                <div className="adm-form-grid-2">
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
                    <label className="adm-label">Visibility</label>
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

                {/* Product Mockup / Screenshot Image Management */}
                <AdminImagePicker
                  label="Product Mockup / Interface Screenshot"
                  helpText="Rendered in the public /products showcase and homepage product spotlight."
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
                  sectionTag="products"
                />

                <div className="adm-form-group">
                  <label className="adm-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="adm-input-field"
                    value={formTagsText}
                    onChange={(e) => setFormTagsText(e.target.value)}
                    placeholder="Web App, AI/ML, Computer Vision, IoT"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Key Metrics (Label: Value per line)</label>
                  <textarea
                    rows={3}
                    className="adm-input-field"
                    value={formMetricsText}
                    onChange={(e) => setFormMetricsText(e.target.value)}
                    placeholder="Yield Increase: +24%&#10;Pesticide Reduction: -35%&#10;Active Acres: 12,000+"
                  />
                  <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
                    Rendered in the 3-column metric cards inside the product preview box.
                  </small>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Bullet Features (One per line)</label>
                  <textarea
                    rows={4}
                    className="adm-input-field"
                    value={formFeaturesText}
                    onChange={(e) => setFormFeaturesText(e.target.value)}
                    placeholder="Early crop blight and pest detection&#10;Soil moisture telemetry&#10;Voice alerts in Tamil"
                  />
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
              <h3 className="adm-modal-title" style={{ color: '#ef4444' }}>Delete Product</h3>
              <button type="button" className="adm-modal-close" onClick={() => setDeleteId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                Are you sure you want to permanently delete this product? This will remove it from the database and public website.
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
