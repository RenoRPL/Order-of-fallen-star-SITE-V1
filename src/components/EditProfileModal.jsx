import React, { useState, useEffect } from 'react'
import OFSDataService from '../services/ofsDataService'
import RichTextEditor from './RichTextEditor'
import './EditProfileModal.css'

export default function EditProfileModal({ isOpen, onClose, onSave, currentBio = '', currentShip = '', currentCustomShipImage = '' }) {
  const [bio, setBio] = useState(currentBio)
  const [selectedShip, setSelectedShip] = useState(currentShip)
  const [customShipImage, setCustomShipImage] = useState(currentCustomShipImage)
  const [customShipImageFile, setCustomShipImageFile] = useState(null)
  const [customShipImagePreview, setCustomShipImagePreview] = useState(currentCustomShipImage)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [ships, setShips] = useState([])
  const [shipsLoading, setShipsLoading] = useState(false)

  // Fetch ships from Google Sheets when modal opens
  useEffect(() => {
    const fetchShips = async () => {
      if (isOpen && ships.length === 0) {
        setShipsLoading(true)
        try {
          const shipRegistry = await OFSDataService.getShipRegistry()
          setShips(shipRegistry)
        } catch (error) {
          console.error('Error fetching ship registry:', error)
        } finally {
          setShipsLoading(false)
        }
      }
    }

    fetchShips()
  }, [isOpen, ships.length])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened with currentBio:', currentBio)
      setBio(currentBio)
      setSelectedShip(currentShip)
      setCustomShipImage(currentCustomShipImage)
      setCustomShipImagePreview(currentCustomShipImage)
      setCustomShipImageFile(null)
    }
  }, [isOpen, currentBio, currentShip, currentCustomShipImage])

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, or GIF)')
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        alert('Image file is too large. Please select an image smaller than 5MB.')
        return
      }

      setCustomShipImageFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setCustomShipImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveCustomImage = () => {
    setCustomShipImageFile(null)
    setCustomShipImagePreview('')
    setCustomShipImage('')
    // Reset file input
    const fileInput = document.getElementById('custom-ship-image')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const uploadImageToImgur = async (file) => {
    try {
      setIsUploadingImage(true)
      
      // Convert file to base64
      const reader = new FileReader()
      
      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const base64Data = e.target.result
            
            console.log('Uploading image to Imgur...', {
              fileType: file.type,
              fileSize: file.size,
              fileName: file.name
            })
            
            const response = await fetch('/api/upload-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                imageData: base64Data,
                contentType: file.type
              })
            })
            
            const result = await response.json()
            console.log('Upload response:', result)
            
            if (result.success) {
              console.log('Image uploaded successfully:', result.url)
              resolve(result.url)
            } else {
              console.error('Upload failed:', result.error)
              alert(result.error || 'Upload failed')
              reject(new Error(result.error || 'Upload failed'))
            }
          } catch (error) {
            console.error('Error during upload:', error)
            alert('Failed to upload image. Please try again.')
            reject(error)
          }
        }
        
        reader.onerror = () => {
          const error = new Error('Failed to read file')
          console.error('File reader error:', error)
          alert('Failed to read file. Please try again.')
          reject(error)
        }
        
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Convert HTML to plain text for character limit validation
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = bio
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      
      if (textContent.length > 5000) {
        alert('Backstory exceeds 5000 character limit. Please shorten your text.')
        setIsSaving(false)
        return
      }

      let finalCustomShipImage = customShipImage

      // Upload custom ship image if a new file was selected
      if (customShipImageFile) {
        console.log('Starting image upload for file:', customShipImageFile.name)
        try {
          const uploadedUrl = await uploadImageToImgur(customShipImageFile)
          if (uploadedUrl) {
            finalCustomShipImage = uploadedUrl
            console.log('Image upload successful, URL:', uploadedUrl)
          } else {
            console.error('Image upload returned null/undefined')
            const continueWithoutImage = confirm('Failed to upload image. Do you want to save your profile without the custom ship image?')
            if (!continueWithoutImage) {
              setIsSaving(false)
              return // Exit if user doesn't want to continue
            }
            // Continue with empty custom image
            finalCustomShipImage = ''
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError)
          const continueWithoutImage = confirm(`Failed to upload image: ${uploadError.message || 'Unknown error'}. Do you want to save your profile without the custom ship image?`)
          if (!continueWithoutImage) {
            setIsSaving(false)
            return // Exit if user doesn't want to continue
          }
          // Continue with empty custom image
          finalCustomShipImage = ''
        }
      }

      console.log('Saving profile with data:', {
        bio: bio.trim().length + ' characters',
        ship: selectedShip,
        customShipImage: finalCustomShipImage ? 'Custom image provided' : 'No custom image'
      })
      
      await onSave({
        bio: bio.trim(),
        ship: selectedShip,
        customShipImage: finalCustomShipImage
      })
      
      console.log('Profile saved successfully')
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
      alert(`Failed to save profile: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setBio(currentBio)
    setSelectedShip(currentShip)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="edit-profile-modal-overlay" onClick={handleCancel}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close-button" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="form-section">
            <label htmlFor="bio-input" className="form-label">
              Back Story
              <span className="form-note">Use the formatting tools to style your backstory</span>
            </label>
            <RichTextEditor
              key={`editor-${isOpen}-${currentBio ? 'with-bio' : 'no-bio'}`} // Force re-initialization when modal opens
              value={bio}
              onChange={setBio}
              placeholder="Tell others about your character's background, your role in the organization, your journey in the 'verse...

Use the toolbar above to format your text with different sizes, bold, underline, and colors."
              maxLength={5000}
            />
          </div>

          <div className="form-section">
            <label htmlFor="ship-select" className="form-label">
              Primary Ship
              <span className="form-note">Your main or favorite ship</span>
            </label>
            <select
              id="ship-select"
              value={selectedShip}
              onChange={(e) => setSelectedShip(e.target.value)}
              className="ship-select"
              disabled={shipsLoading}
            >
              <option value="">
                {shipsLoading ? 'Loading ships...' : 'Select a ship...'}
              </option>
              {ships.map((ship) => (
                <option key={ship.value} value={ship.value}>
                  {ship.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Ship Image Upload */}
          <div className="form-section">
            <label htmlFor="custom-ship-image" className="form-label">
              Custom Ship Image (Optional)
              <span className="form-note">Upload your own ship image to use as background</span>
            </label>
            
            <div className="custom-image-upload">
              <input
                type="file"
                id="custom-ship-image"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleImageUpload}
                className="image-upload-input"
                disabled={isUploadingImage || isSaving}
              />
              
              {customShipImagePreview && (
                <div className="image-preview">
                  <img 
                    src={customShipImagePreview} 
                    alt="Custom ship preview" 
                    className="preview-image"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCustomImage}
                    className="remove-image-btn"
                    disabled={isUploadingImage || isSaving}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
              
              {!customShipImagePreview && (
                <label htmlFor="custom-ship-image" className="upload-area">
                  <div className="upload-content">
                    <span className="upload-icon">📁</span>
                    <span className="upload-text">
                      Click to select an image or drag and drop
                    </span>
                    <span className="upload-note">
                      Supports JPG, PNG, GIF up to 5MB
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}