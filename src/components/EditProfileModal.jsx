import React, { useState, useEffect } from 'react'
import OFSDataService from '../services/ofsDataService'
import RichTextEditor from './RichTextEditor'
import './EditProfileModal.css'

export default function EditProfileModal({ isOpen, onClose, onSave, currentBio = '', currentShip = '', currentCustomShipImage = '', currentCustomization = null }) {
  const [bio, setBio] = useState(currentBio)
  const [selectedShip, setSelectedShip] = useState(currentShip)
  const [customShipImage, setCustomShipImage] = useState(currentCustomShipImage)
  const [customShipImageFile, setCustomShipImageFile] = useState(null)
  const [customShipImagePreview, setCustomShipImagePreview] = useState(currentCustomShipImage)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [ships, setShips] = useState([])
  const [shipsLoading, setShipsLoading] = useState(false)
  const [progressBarTheme, setProgressBarTheme] = useState(currentCustomization?.progressBarTheme || 'classic')
  const [customHue, setCustomHue] = useState(currentCustomization?.customHue || 200) // Default to blue-ish hue
  const [profilePageTheme, setProfilePageTheme] = useState(currentCustomization?.profilePageTheme || 'default')
  const [profileCustomHue, setProfileCustomHue] = useState(currentCustomization?.profileCustomHue || 220) // Default to blue-ish hue

  // Collapsible section states
  const [isProgressBarThemeOpen, setIsProgressBarThemeOpen] = useState(false)
  const [isProfilePageThemeOpen, setIsProfilePageThemeOpen] = useState(false)

  // Progress bar theme options
  const progressBarThemes = [
    { value: 'classic', name: 'Classic Blue', primary: '#39b9ff', secondary: '#00ff88' },
    { value: 'frost', name: 'Frost Blue', primary: '#00d4ff', secondary: '#7dd3fc' },
    { value: 'ocean', name: 'Deep Ocean', primary: '#0ea5e9', secondary: '#38bdf8' },
    { value: 'midnight', name: 'Midnight Blue', primary: '#1e40af', secondary: '#3b82f6' },
    { value: 'cyan', name: 'Cyber Cyan', primary: '#06b6d4', secondary: '#67e8f9' },
    { value: 'custom', name: 'Custom Hue', primary: 'custom', secondary: 'custom' }
  ]

  // Generate custom colors based on hue
  const getCustomColors = (hue) => {
    return {
      primary: `hsl(${hue}, 85%, 60%)`,
      secondary: `hsl(${hue + 30}, 80%, 65%)`
    }
  }

  // Profile page theme options
  const profilePageThemes = [
    { value: 'default', name: 'Default Space', primary: '#0ea5e9', secondary: '#1e293b', accent: '#39b9ff' },
    { value: 'crimson', name: 'Crimson Void', primary: '#dc2626', secondary: '#450a0a', accent: '#ef4444' },
    { value: 'emerald', name: 'Emerald Nebula', primary: '#059669', secondary: '#064e3b', accent: '#10b981' },
    { value: 'violet', name: 'Violet Storm', primary: '#7c3aed', secondary: '#2e1065', accent: '#8b5cf6' },
    { value: 'amber', name: 'Solar Flare', primary: '#d97706', secondary: '#451a03', accent: '#f59e0b' },
    { value: 'rose', name: 'Rose Nebula', primary: '#e11d48', secondary: '#4c0519', accent: '#f43f5e' },
    { value: 'custom', name: 'Custom Hue', primary: 'custom', secondary: 'custom', accent: 'custom' }
  ]

  // Generate custom profile colors based on hue
  const getCustomProfileColors = (hue) => {
    return {
      primary: `hsl(${hue}, 85%, 60%)`,
      secondary: `hsl(${hue}, 90%, 8%)`,
      accent: `hsl(${hue}, 80%, 65%)`
    }
  }

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
      setProgressBarTheme(currentCustomization?.progressBarTheme || 'classic')
      setCustomHue(currentCustomization?.customHue || 200)
      setProfilePageTheme(currentCustomization?.profilePageTheme || 'default')
      setProfileCustomHue(currentCustomization?.profileCustomHue || 220)
    }
  }, [isOpen, currentBio, currentShip, currentCustomShipImage, currentCustomization])

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

  // Banner image upload handlers
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
            
            // Try multiple upload services in order of preference
            const uploadServices = [
              '/api/upload-image',           // Imgur (primary)
              '/api/upload-image-cloudinary', // Cloudinary (fallback)
              '/api/upload-image-base64'     // Base64 (last resort)
            ]
            
            let lastError = null
            
            for (const service of uploadServices) {
              try {
                console.log(`Trying upload service: ${service}`)
                
                const response = await fetch(service, {
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
                console.log(`${service} response:`, result)
                
                if (result.success) {
                  console.log(`Image uploaded successfully via ${service}:`, result.imageUrl)
                  resolve(result.imageUrl)
                  return
                } else {
                  lastError = result.error
                  console.warn(`${service} failed:`, result.error)
                  continue // Try next service
                }
              } catch (error) {
                lastError = error.message
                console.warn(`${service} error:`, error)
                continue // Try next service
              }
            }
            
            // All services failed
            console.error('All upload services failed. Last error:', lastError)
            alert(lastError || 'All upload services failed. Please try again.')
            reject(new Error(lastError || 'Upload failed'))
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
        console.log('Starting ship image upload for file:', customShipImageFile.name)
        try {
          const uploadedUrl = await uploadImageToImgur(customShipImageFile)
          if (uploadedUrl) {
            finalCustomShipImage = uploadedUrl
            console.log('Ship image upload successful, URL:', uploadedUrl)
          } else {
            console.error('Ship image upload returned null/undefined')
            const continueWithoutImage = confirm('Failed to upload ship image. Do you want to save your profile without the custom ship image?')
            if (!continueWithoutImage) {
              setIsSaving(false)
              return // Exit if user doesn't want to continue
            }
            // Continue with empty custom image
            finalCustomShipImage = ''
          }
        } catch (uploadError) {
          console.error('Ship image upload error:', uploadError)
          // Check if it's a configuration error
          if (uploadError.message && uploadError.message.includes('not configured')) {
            const continueWithoutImage = confirm('Image upload service is not yet configured by administrator. Do you want to save your profile without the custom ship image for now?')
            if (!continueWithoutImage) {
              setIsSaving(false)
              return // Exit if user doesn't want to continue
            }
            // Continue with empty custom image
            finalCustomShipImage = ''
          } else {
            const continueWithoutImage = confirm(`Failed to upload ship image: ${uploadError.message || 'Unknown error'}. Do you want to save your profile without the custom ship image?`)
            if (!continueWithoutImage) {
              setIsSaving(false)
              return // Exit if user doesn't want to continue
            }
            // Continue with empty custom image
            finalCustomShipImage = ''
          }
        }
      }

      console.log('Saving profile with data:', {
        bio: bio.trim().length + ' characters',
        ship: selectedShip,
        customShipImage: finalCustomShipImage ? 'Custom ship image provided' : 'No custom ship image',
        customization: { progressBarTheme, customHue, profilePageTheme, profileCustomHue }
      })
      
      await onSave({
        bio: bio.trim(),
        ship: selectedShip,
        customShipImage: finalCustomShipImage,
        customization: { progressBarTheme, customHue, profilePageTheme, profileCustomHue }
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

          {/* Progress Bar Theme Customization */}
          <div className="form-section">
            <div 
              className="collapsible-header"
              onClick={() => setIsProgressBarThemeOpen(!isProgressBarThemeOpen)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span className="form-label">
                Progress Bar Theme
                <span className="form-note">Customize your rank progress bar appearance</span>
              </span>
              <span className={`collapse-icon ${isProgressBarThemeOpen ? 'open' : ''}`} 
                    style={{ transition: 'transform 0.2s', transform: isProgressBarThemeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </div>
            
            {isProgressBarThemeOpen && (
              <div className="collapsible-content">
                <div className="theme-selection">
              {progressBarThemes.map((theme) => {
                const isCustom = theme.value === 'custom'
                const customColors = isCustom ? getCustomColors(customHue) : null
                
                return (
                  <div 
                    key={theme.value}
                    className={`theme-option ${progressBarTheme === theme.value ? 'selected' : ''}`}
                    onClick={() => setProgressBarTheme(theme.value)}
                  >
                    <div className="theme-preview">
                      <div 
                        className="theme-preview-bar"
                        style={{
                          background: isCustom 
                            ? `linear-gradient(90deg, ${customColors.primary}, ${customColors.secondary})`
                            : `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`
                        }}
                      />
                    </div>
                    <div className="theme-info">
                      <span className="theme-name">{theme.name}</span>
                      <div className="theme-colors">
                        {isCustom ? (
                          <>
                            <div 
                              className="color-swatch"
                              style={{ backgroundColor: customColors.primary }}
                              title="Primary Color"
                            />
                            <div 
                              className="color-swatch"
                              style={{ backgroundColor: customColors.secondary }}
                              title="Secondary Color"
                            />
                          </>
                        ) : (
                          <>
                            <div 
                              className="color-swatch"
                              style={{ backgroundColor: theme.primary }}
                              title="Primary Color"
                            />
                            <div 
                              className="color-swatch"
                              style={{ backgroundColor: theme.secondary }}
                              title="Secondary Color"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Custom Hue Slider - Only show when custom theme is selected */}
            {progressBarTheme === 'custom' && (
              <div className="hue-slider-section">
                <label className="hue-slider-label">
                  Custom Hue: <span className="hue-value">{customHue}°</span>
                </label>
                <div className="hue-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={customHue}
                    onChange={(e) => setCustomHue(parseInt(e.target.value))}
                    className="hue-slider"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(0, 85%, 60%), 
                        hsl(60, 85%, 60%), 
                        hsl(120, 85%, 60%), 
                        hsl(180, 85%, 60%), 
                        hsl(240, 85%, 60%), 
                        hsl(300, 85%, 60%), 
                        hsl(360, 85%, 60%))`
                    }}
                  />
                  <div className="hue-preview-colors">
                    <div 
                      className="hue-preview-primary"
                      style={{ backgroundColor: getCustomColors(customHue).primary }}
                      title="Primary Color Preview"
                    />
                    <div 
                      className="hue-preview-secondary"
                      style={{ backgroundColor: getCustomColors(customHue).secondary }}
                      title="Secondary Color Preview"
                    />
                  </div>
                </div>
              </div>
            )}
              </div>
            )}
          </div>

          {/* Profile Page Theme Customization */}
          <div className="form-section">
            <div 
              className="collapsible-header"
              onClick={() => setIsProfilePageThemeOpen(!isProfilePageThemeOpen)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span className="form-label">
                Profile Page Theme
                <span className="form-note">Customize your entire profile page appearance</span>
              </span>
              <span className={`collapse-icon ${isProfilePageThemeOpen ? 'open' : ''}`} 
                    style={{ transition: 'transform 0.2s', transform: isProfilePageThemeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </div>
            
            {isProfilePageThemeOpen && (
              <div className="collapsible-content">
                <div className="theme-selection">
              {profilePageThemes.map((theme) => {
                const isCustom = theme.value === 'custom'
                const customColors = isCustom ? getCustomProfileColors(profileCustomHue) : null
                
                return (
                  <div 
                    key={theme.value}
                    className={`theme-option ${profilePageTheme === theme.value ? 'selected' : ''}`}
                    onClick={() => setProfilePageTheme(theme.value)}
                  >
                    <div className="theme-preview">
                      <div 
                        className="theme-preview-bar profile-theme-preview"
                        style={{
                          background: isCustom 
                            ? `linear-gradient(135deg, ${customColors.primary}, ${customColors.secondary})`
                            : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                        }}
                      />
                    </div>
                    <div className="theme-info">
                      <span className="theme-name">{theme.name}</span>
                      <div className="theme-colors">
                        {isCustom ? (
                          <>
                            <div 
                              className="color-swatch"
                              style={{ backgroundColor: customColors.primary }}
                              title="Primary Color"
                            />
                            <div 
                              className="color-swatch"
                              style={{ backgroundColor: customColors.accent }}
                              title="Accent Color"
                            />
                          </>
                        ) : (
                          <>
                            <div 
                              className="color-swatch"
                              style={{ backgroundColor: theme.primary }}
                              title="Primary Color"
                            />
                            <div 
                              className="color-swatch"
                              style={{ backgroundColor: theme.accent }}
                              title="Accent Color"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Custom Profile Hue Slider - Only show when custom theme is selected */}
            {profilePageTheme === 'custom' && (
              <div className="hue-slider-section">
                <label className="hue-slider-label">
                  Custom Profile Hue: <span className="hue-value">{profileCustomHue}°</span>
                </label>
                <div className="hue-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={profileCustomHue}
                    onChange={(e) => setProfileCustomHue(parseInt(e.target.value))}
                    className="hue-slider"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(0, 85%, 60%), 
                        hsl(60, 85%, 60%), 
                        hsl(120, 85%, 60%), 
                        hsl(180, 85%, 60%), 
                        hsl(240, 85%, 60%), 
                        hsl(300, 85%, 60%), 
                        hsl(360, 85%, 60%))`
                    }}
                  />
                  <div className="hue-preview-colors">
                    <div 
                      className="hue-preview-primary"
                      style={{ backgroundColor: getCustomProfileColors(profileCustomHue).primary }}
                      title="Primary Color Preview"
                    />
                    <div 
                      className="hue-preview-secondary"
                      style={{ backgroundColor: getCustomProfileColors(profileCustomHue).accent }}
                      title="Accent Color Preview"
                    />
                  </div>
                </div>
              </div>
            )}
              </div>
            )}
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