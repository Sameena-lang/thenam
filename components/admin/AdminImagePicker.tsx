'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Image as ImageIcon,
  Upload,
  X,
  FolderOpen,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react'

export interface MediaOption {
  id: string
  url: string
  original_name: string
  alt_text: string
  mime_type: string
  width: number
  height: number
  section_tag: string
}

interface AdminImagePickerProps {
  label: string
  currentUrl: string | null
  altText: string
  selectedFile: File | null
  previewUrl: string | null
  onFileSelect: (file: File | null, previewUrl: string | null) => void
  onUrlChange: (url: string) => void
  onAltChange: (alt: string) => void
  sectionTag?: 'services' | 'products' | 'hero' | 'general'
  helpText?: string
}

export default function AdminImagePicker({
  label,
  currentUrl,
  altText,
  selectedFile,
  previewUrl,
  onFileSelect,
  onUrlChange,
  onAltChange,
  sectionTag = 'general',
  helpText,
}: AdminImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLibrary, setShowLibrary] = useState(false)
  const [mediaList, setMediaList] = useState<MediaOption[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [libraryError, setLibraryError] = useState<string | null>(null)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerSection, setPickerSection] = useState<string>('all')

  // Fetch available images from Media Library when drawer opens
  const fetchMediaList = async () => {
    setLoadingMedia(true)
    setLibraryError(null)
    try {
      const res = await fetch('/api/admin/media')
      if (!res.ok) throw new Error('Failed to load media library')
      const data = await res.json()
      setMediaList(data.media || [])
    } catch (err: unknown) {
      console.error(err)
      setLibraryError(err instanceof Error ? err.message : 'Failed to retrieve media')
    } finally {
      setLoadingMedia(false)
    }
  }

  useEffect(() => {
    if (showLibrary && mediaList.length === 0) {
      fetchMediaList()
    }
  }, [showLibrary, mediaList.length])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Quick client-side size check (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Selected file exceeds maximum allowable size of 10MB.')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    onFileSelect(file, objectUrl)

    // Pre-populate alt text if empty
    if (!altText.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')
      onAltChange(nameWithoutExt)
    }
  }

  const handleClearSelection = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    onFileSelect(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayedMedia = mediaList.filter((m) => {
    const matchesSection = pickerSection === 'all' || m.section_tag === pickerSection
    const matchesSearch =
      !pickerSearch.trim() ||
      m.original_name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      (m.alt_text && m.alt_text.toLowerCase().includes(pickerSearch.toLowerCase())) ||
      m.url.toLowerCase().includes(pickerSearch.toLowerCase())
    return matchesSection && matchesSearch
  })

  const handleSelectFromLibrary = (item: MediaOption) => {
    handleClearSelection()
    onUrlChange(item.url)
    if (item.alt_text && !altText.trim()) {
      onAltChange(item.alt_text)
    }
    setShowLibrary(false)
  }

  const handleClearUrl = () => {
    handleClearSelection()
    onUrlChange('')
  }

  const effectiveDisplayUrl = previewUrl || currentUrl

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
          {label}
        </label>
        {helpText && (
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {helpText}
          </span>
        )}
      </div>

      {/* Visual Previews: Current Image vs Proposed Replacement */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: previewUrl ? '1fr 1fr' : '1fr',
        gap: '14px',
        marginBottom: '14px',
      }}>
        {/* Current Image Box */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>
              Current Image
            </span>
            {currentUrl && (
              <button
                type="button"
                onClick={handleClearUrl}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  padding: '2px 4px',
                }}
              >
                Remove
              </button>
            )}
          </div>

          {currentUrl ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#0b162b',
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                border: '1px solid #cbd5e1',
              }}>
                <img
                  src={currentUrl}
                  alt={altText || 'Current image'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 2px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}>
                  {currentUrl}
                </p>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  Alt: &quot;{altText || 'None'}&quot;
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              background: '#f1f5f9',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '12px',
            }}>
              <ImageIcon size={24} style={{ margin: '0 auto 6px', display: 'block', opacity: 0.5 }} />
              <span>No image currently linked.</span>
            </div>
          )}
        </div>

        {/* Proposed Replacement Preview Box (if file selected) */}
        {previewUrl && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '10px',
            padding: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#15803d' }}>
                Proposed Replacement
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <X size={12} />
                <span>Cancel</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#0b162b',
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                border: '1px solid #86efac',
              }}>
                <img
                  src={previewUrl}
                  alt="Proposed replacement preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#166534',
                  margin: '0 0 2px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}>
                  {selectedFile?.name || 'Uploaded File'}
                </p>
                <p style={{ fontSize: '11px', color: '#15803d', margin: 0 }}>
                  Ready to upload on save ({selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : ''})
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls: File Upload & Media Library Selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: '600',
            color: '#0f172a',
            cursor: 'pointer',
          }}
        >
          <Upload size={14} color="#00c9f2" />
          <span>{currentUrl ? 'Upload & Replace File' : 'Upload New Image'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowLibrary((prev) => !prev)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            background: showLibrary ? '#e0f2fe' : '#ffffff',
            border: showLibrary ? '1px solid #38bdf8' : '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: '600',
            color: showLibrary ? '#0284c7' : '#0f172a',
            cursor: 'pointer',
          }}
        >
          <FolderOpen size={14} color="#0284c7" />
          <span>{showLibrary ? 'Close Media Library' : 'Choose from Library'}</span>
        </button>
      </div>

      {/* Media Library Drawer / Quick Selector */}
      {showLibrary && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '12px',
          maxHeight: '280px',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#475569' }}>
              Select an Asset from Media Library
            </span>
            <button
              type="button"
              onClick={fetchMediaList}
              disabled={loadingMedia}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              title="Refresh Media"
            >
              <RefreshCw size={12} className={loadingMedia ? 'animate-spin' : ''} />
            </button>
          </div>

          {loadingMedia ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
              <Loader2 size={16} className="animate-spin" style={{ margin: '0 auto 6px', display: 'block' }} />
              Loading pictures...
            </div>
          ) : libraryError ? (
            <div style={{ color: '#ef4444', fontSize: '12px', padding: '10px' }}>
              {libraryError}
            </div>
          ) : mediaList.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
              No images in library. Upload one above.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
              {mediaList.map((m) => {
                const isSelected = currentUrl === m.url
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectFromLibrary(m)}
                    style={{
                      background: isSelected ? '#ecfdf5' : '#f8fafc',
                      border: isSelected ? '2px solid #10b981' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '56px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: '#070f1e',
                      display: 'grid',
                      placeItems: 'center',
                    }}>
                      <img
                        src={m.url}
                        alt={m.alt_text || m.original_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <span style={{
                      fontSize: '10.5px',
                      color: isSelected ? '#065f46' : '#334155',
                      fontWeight: isSelected ? '700' : '500',
                      width: '100%',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textAlign: 'center',
                    }}>
                      {m.original_name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Manual URL and Alt Text Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
            Image Reference / URL
          </label>
          <input
            type="text"
            className="adm-input-field"
            value={currentUrl || ''}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="/services/my-image.jpg or /uploads/..."
            style={{ fontSize: '12px', padding: '7px 10px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
            Alternative Text (Alt Text)
          </label>
          <input
            type="text"
            className="adm-input-field"
            value={altText || ''}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="Descriptive text for accessibility & SEO"
            style={{ fontSize: '12px', padding: '7px 10px' }}
          />
        </div>
      </div>
    </div>
  )
}
