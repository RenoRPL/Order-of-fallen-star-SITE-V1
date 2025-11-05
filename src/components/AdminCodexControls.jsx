import React, { useState } from 'react'
import './AdminCodexControls.css'

export default function AdminCodexControls({ onRefresh, selectedEntry }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Form state for adding/editing entries
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    author: '',
    tags: '',
    imageUrl: ''
  })

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      author: '',
      tags: '',
      imageUrl: ''
    })
    setError(null)
    setSuccess(null)
  }

  const handleAddEntry = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleEditEntry = () => {
    if (!selectedEntry) return
    
    setFormData({
      title: selectedEntry.title || '',
      content: selectedEntry.content || '',
      category: selectedEntry.category || '',
      author: selectedEntry.author || '',
      tags: selectedEntry.tags ? selectedEntry.tags.join(', ') : '',
      imageUrl: selectedEntry.imageUrl || ''
    })
    setError(null)
    setSuccess(null)
    setShowEditModal(true)
  }

  const handleDeleteEntry = () => {
    if (!selectedEntry) return
    setShowDeleteModal(true)
  }

  const handleFormSubmit = async (e, isEdit = false) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare the data
      const entryData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category.trim(),
        author: formData.author.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        imageUrl: formData.imageUrl.trim()
      }

      // Validate required fields
      if (!entryData.title || !entryData.content) {
        throw new Error('Title and content are required')
      }

      const url = isEdit 
        ? '/.netlify/functions/update-codex-entry'
        : '/.netlify/functions/add-codex-entry'
      
      const payload = isEdit 
        ? { id: selectedEntry.id, ...entryData }
        : entryData

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(isEdit ? 'Entry updated successfully!' : 'Entry added successfully!')
        
        // Close modal and refresh after short delay
        setTimeout(() => {
          if (isEdit) {
            setShowEditModal(false)
          } else {
            setShowAddModal(false)
          }
          onRefresh()
        }, 1500)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save entry')
      }
    } catch (error) {
      console.error('Error saving entry:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/.netlify/functions/delete-codex-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedEntry.id })
      })

      if (response.ok) {
        setSuccess('Entry deleted successfully!')
        
        // Close modal and refresh after short delay
        setTimeout(() => {
          setShowDeleteModal(false)
          onRefresh()
        }, 1500)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete entry')
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const closeModals = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setShowDeleteModal(false)
    resetForm()
  }

  return (
    <div className="admin-codex-controls floating-admin-bar">
      <div className="admin-toggle-btn" onClick={() => setShowControls(!showControls)}>
        <span className="admin-icon">🛡️</span>
        <span className="admin-text">Admin</span>
        <span className={`toggle-arrow ${showControls ? 'expanded' : ''}`}>▲</span>
      </div>
      
      {showControls && (
        <div className="admin-actions-panel">
          <button
            onClick={handleAddEntry}
            className="admin-btn add-btn"
            title="Add new codex entry"
          >
            <span className="btn-icon">➕</span>
            <span className="btn-text">Add</span>
          </button>
          
          <button
            onClick={handleEditEntry}
            className="admin-btn edit-btn"
            disabled={!selectedEntry}
            title="Edit selected entry"
          >
            <span className="btn-icon">✏️</span>
            <span className="btn-text">Edit</span>
          </button>
          
          <button
            onClick={handleDeleteEntry}
            className="admin-btn delete-btn"
            disabled={!selectedEntry}
            title="Delete selected entry"
          >
            <span className="btn-icon">🗑️</span>
            <span className="btn-text">Delete</span>
          </button>
          
          <button
            onClick={onRefresh}
            className="admin-btn refresh-btn"
            title="Refresh codex entries"
          >
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Refresh</span>
          </button>
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Codex Entry</h2>
              <button onClick={closeModals} className="close-btn">✕</button>
            </div>
            
            <form onSubmit={(e) => handleFormSubmit(e, false)} className="codex-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter document title..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Laws, History, Procedures..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="author">Author</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Document author..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Comma-separated tags..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">Image URL</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="form-input"
                />
                <small style={{ color: '#8bb8e8', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  Optional: Add an image URL to display alongside this document
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter the document content..."
                  className="form-textarea"
                  rows={12}
                />
              </div>

              {error && <div className="form-error">{error}</div>}
              {success && <div className="form-success">{success}</div>}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={closeModals}
                  className="form-btn cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="form-btn submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Codex Entry</h2>
              <button onClick={closeModals} className="close-btn">✕</button>
            </div>
            
            <form onSubmit={(e) => handleFormSubmit(e, true)} className="codex-form">
              <div className="form-group">
                <label htmlFor="edit-title">Title *</label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter document title..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <input
                  type="text"
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Laws, History, Procedures..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-author">Author</label>
                <input
                  type="text"
                  id="edit-author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Document author..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-tags">Tags</label>
                <input
                  type="text"
                  id="edit-tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Comma-separated tags..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-imageUrl">Image URL</label>
                <input
                  type="url"
                  id="edit-imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="form-input"
                />
                <small style={{ color: '#8bb8e8', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  Optional: Add an image URL to display alongside this document
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="edit-content">Content *</label>
                <textarea
                  id="edit-content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter the document content..."
                  className="form-textarea"
                  rows={12}
                />
              </div>

              {error && <div className="form-error">{error}</div>}
              {success && <div className="form-success">{success}</div>}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={closeModals}
                  className="form-btn cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="form-btn submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button onClick={closeModals} className="close-btn">✕</button>
            </div>
            
            <div className="delete-content">
              <div className="warning-icon">⚠️</div>
              <p>Are you sure you want to delete this codex entry?</p>
              <div className="entry-preview">
                <strong>Title:</strong> {selectedEntry?.title}
              </div>
              <p className="warning-text">This action cannot be undone.</p>

              {error && <div className="form-error">{error}</div>}
              {success && <div className="form-success">{success}</div>}

              <div className="form-actions">
                <button
                  onClick={closeModals}
                  className="form-btn cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="form-btn delete-confirm-btn"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}